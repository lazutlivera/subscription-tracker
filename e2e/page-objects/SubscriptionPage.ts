import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SubscriptionPage extends BasePage {
  // Selectors - updated based on the app's actual DOM structure
  readonly addSubscriptionButton = 'button:has-text("Add Subscription")';
  readonly subscriptionList = '.subscription-list, [data-testid="subscription-list"], .grid, .subscription-grid';
  readonly subscriptionItem = '.subscription-item, [data-testid="subscription-item"], .bg-\\[\\#23232D\\], .bg-\\[\\#2D1F23\\]';
  readonly subscriptionForm = '.subscription-form, [data-testid="subscription-form"], form';
  readonly nameInput = 'input[name="name"], #name';
  readonly priceInput = 'input[name="price"], #price';
  readonly frequencySelect = 'select[name="frequency"], #frequency';
  readonly startDateInput = 'input[name="startDate"], #startDate, input[type="date"]';
  readonly categorySelect = 'select[name="category"], #category';
  readonly saveButton = 'button:has-text("Save")';
  readonly cancelButton = 'button:has-text("Cancel")';
  readonly deleteButton = 'button:has-text("Delete")';
  readonly cancelSubscriptionButton = 'button:has-text("Cancel")';
  readonly nextPaymentDate = '[data-testid="next-payment-date"], .next-payment-date, .payment-date';
  
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the main subscription page
   */
  async navigateToSubscriptions(): Promise<void> {
    await this.goto('/');
    await this.waitForNavigation();
  }

  /**
   * Open subscription form to add a new subscription
   */
  async openAddSubscriptionForm(): Promise<void> {
    await this.page.click(this.addSubscriptionButton);
    // Wait for form to be visible - make it more flexible
    try {
      await this.waitForElement(this.subscriptionForm);
    } catch (e) {
      // If the specific form selector fails, wait for any form element
      await this.waitForElement('form, [role="dialog"]');
    }
  }

  /**
   * Fill out and submit the subscription form
   */
  async fillSubscriptionForm({
    name,
    price,
    frequency,
    startDate,
    category
  }: {
    name: string;
    price: string;
    frequency: string;
    startDate: string;
    category: string;
  }): Promise<void> {
    // More flexible fill approach with fallbacks
    await this.fillInputWithFallbacks(this.nameInput, name);
    await this.fillInputWithFallbacks(this.priceInput, price);
    await this.selectOptionWithFallbacks(this.frequencySelect, frequency);
    await this.fillInputWithFallbacks(this.startDateInput, startDate);
    await this.selectOptionWithFallbacks(this.categorySelect, category);
    await this.page.click(this.saveButton);
    
    // Wait for the form to be processed and list to update
    await this.waitForNavigation();
  }

  /**
   * Helper to try multiple selectors when filling inputs
   */
  private async fillInputWithFallbacks(selectors: string, value: string): Promise<void> {
    const selectorList = selectors.split(', ');
    for (const selector of selectorList) {
      try {
        if (await this.page.locator(selector).count() > 0) {
          await this.page.fill(selector, value);
          return;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    throw new Error(`Could not find input matching any of these selectors: ${selectors}`);
  }

  /**
   * Helper to try multiple selectors when selecting options
   */
  private async selectOptionWithFallbacks(selectors: string, value: string): Promise<void> {
    const selectorList = selectors.split(', ');
    for (const selector of selectorList) {
      try {
        if (await this.page.locator(selector).count() > 0) {
          await this.page.selectOption(selector, value);
          return;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    throw new Error(`Could not find select matching any of these selectors: ${selectors}`);
  }

  /**
   * Add a new subscription with all details
   */
  async addSubscription(subscriptionDetails: {
    name: string;
    price: string;
    frequency: string;
    startDate: string;
    category: string;
  }): Promise<void> {
    await this.openAddSubscriptionForm();
    await this.fillSubscriptionForm(subscriptionDetails);
    
    // Verify the subscription appears in the list
    const subscriptionExists = await this.findSubscriptionByName(subscriptionDetails.name);
    expect(subscriptionExists).toBeTruthy();
  }

  /**
   * Find a subscription in the list by name
   */
  async findSubscriptionByName(name: string): Promise<boolean> {
    const subscriptions = this.page.locator(this.subscriptionItem);
    const count = await subscriptions.count();
    
    for (let i = 0; i < count; i++) {
      const subscription = subscriptions.nth(i);
      const text = await subscription.textContent();
      if (text && text.includes(name)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get the number of subscriptions displayed
   */
  async getSubscriptionCount(): Promise<number> {
    return await this.page.locator(this.subscriptionItem).count();
  }

  /**
   * Click on a specific subscription by name
   */
  async clickSubscription(name: string): Promise<void> {
    const subscriptions = this.page.locator(this.subscriptionItem);
    const count = await subscriptions.count();
    
    for (let i = 0; i < count; i++) {
      const subscription = subscriptions.nth(i);
      const text = await subscription.textContent();
      if (text && text.includes(name)) {
        await subscription.click();
        return;
      }
    }
    
    throw new Error(`Subscription with name "${name}" not found`);
  }

  /**
   * Cancel a subscription by name
   */
  async cancelSubscription(name: string): Promise<void> {
    await this.clickSubscription(name);
    
    // Try to find and click the cancel button with a more flexible approach
    try {
      await this.page.click(this.cancelSubscriptionButton);
    } catch (e) {
      // If specific button not found, try the subscription-specific cancel button
      await this.page.click(this.getCancelButtonSelector(name));
    }
    
    // Confirm the modal if it appears
    try {
      const confirmButton = this.page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Yes, Cancel")');
      if (await confirmButton.isVisible({ timeout: 1000 })) {
        await confirmButton.click();
      }
    } catch (e) {
      // No confirmation modal, continue
    }
    
    await this.waitForNavigation();
  }

  /**
   * Delete a subscription by name
   */
  async deleteSubscription(name: string): Promise<void> {
    await this.clickSubscription(name);
    
    // Try to find and click the delete button with a more flexible approach
    try {
      await this.page.click(this.deleteButton);
    } catch (e) {
      // If specific button not found, try any button with "delete" in the text
      await this.page.click('button:has-text("Delete")');
    }
    
    // Confirm the modal if it appears
    try {
      const confirmButton = this.page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Yes, Delete")');
      if (await confirmButton.isVisible({ timeout: 1000 })) {
        await confirmButton.click();
      }
    } catch (e) {
      // No confirmation modal, continue
    }
    
    await this.waitForNavigation();
    
    // Verify the subscription was deleted
    const subscriptionExists = await this.findSubscriptionByName(name);
    expect(subscriptionExists).toBeFalsy();
  }

  /**
   * Get next payment date for a subscription
   */
  async getNextPaymentDate(name: string): Promise<string | null> {
    await this.clickSubscription(name);
    try {
      const dateElement = this.page.locator(this.nextPaymentDate);
      if (await dateElement.isVisible({ timeout: 1000 })) {
        return await dateElement.textContent();
      }
      // If specific element not found, try to find any date-like text
      const subscriptionDetails = await this.page.locator(`${this.subscriptionItem}:has-text("${name}")`).textContent();
      const dateMatch = subscriptionDetails?.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        return dateMatch[0];
      }
    } catch (e) {
      // No date element found
    }
    return null;
  }

  /**
   * Check if cancel button is visible for a subscription
   */
  async isCancelButtonVisible(name: string): Promise<boolean> {
    await this.clickSubscription(name);
    try {
      const cancelButton = this.page.locator(this.cancelSubscriptionButton);
      return await cancelButton.isVisible({ timeout: 1000 });
    } catch (e) {
      // Try alternative selectors for cancel button
      try {
        const altCancelButton = this.page.locator(`button:has-text("Cancel")`);
        return await altCancelButton.isVisible({ timeout: 1000 });
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * Get cancel button selector for a specific subscription
   */
  getCancelButtonSelector(name: string): string {
    return `button[id="cancel-subscription-${name}"]`;
  }
} 