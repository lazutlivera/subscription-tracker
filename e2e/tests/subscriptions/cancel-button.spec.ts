import { expect } from '@playwright/test';
import { test } from '../../fixtures/test.fixture';

test.describe('Subscription Cancel Button Behavior', () => {
  // Navigate to the dashboard before each test
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await authenticatedPage.waitForNavigation();
  });

  test('canceled subscription shows visual indication in UI', async ({ subscriptionPage, page }) => {
    // Clear existing subscriptions by clicking Delete All
    try {
      const deleteAllButton = page.locator('button:has-text("Delete All")');
      if (await deleteAllButton.isVisible()) {
        await deleteAllButton.click();
        
        // If a confirmation dialog appears, click confirm
        const confirmButton = page.locator('button:has-text("Yes"), button:has-text("Confirm")');
        if (await confirmButton.isVisible({ timeout: 1000 })) {
          await confirmButton.click();
        }
        
        // Wait for the list to clear
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // No Delete All button or no subscriptions yet
    }
    
    // Setup: Add Netflix from the predefined list
    await subscriptionPage.openAddSubscriptionForm();
    
    // Select Netflix from dropdown and submit
    await page.selectOption('select[name="name"]', 'Netflix');
    await page.click('button[id="add-subscription-button"]');
    
    // Wait for the subscription to be added and appear in the list
    await page.waitForSelector(`${subscriptionPage.subscriptionItem}:has-text("Netflix")`, { state: 'visible' });
    
    // Verify Netflix was added
    expect(await subscriptionPage.findSubscriptionByName('Netflix')).toBeTruthy();
    
    // Capture subscription item appearance before cancellation
    const subscriptionItems = page.locator(subscriptionPage.subscriptionItem);
    let beforeCancelText = '';
    let beforeCancelClasses = '';
    
    for (let i = 0; i < await subscriptionItems.count(); i++) {
      const item = subscriptionItems.nth(i);
      const text = await item.textContent() || '';
      if (text.includes('Netflix')) {
        beforeCancelText = text;
        beforeCancelClasses = await item.getAttribute('class') || '';
        break;
      }
    }
    
    // Cancel Netflix subscription
    await subscriptionPage.cancelSubscription('Netflix');
    
    // Verify immediate UI changes
    expect(await subscriptionPage.isCancelButtonVisible('Netflix')).toBeFalsy();
    
    // Refresh the page and verify changes persist
    await subscriptionPage.navigateToSubscriptions();
    
    // Wait for Netflix subscription to appear after refresh
    await page.waitForSelector(`${subscriptionPage.subscriptionItem}:has-text("Netflix")`, { state: 'visible' });
    
    // Capture subscription item appearance after cancellation
    const refreshedItems = page.locator(subscriptionPage.subscriptionItem);
    let afterCancelText = '';
    let afterCancelClasses = '';
    
    for (let i = 0; i < await refreshedItems.count(); i++) {
      const item = refreshedItems.nth(i);
      const text = await item.textContent() || '';
      if (text.includes('Netflix')) {
        afterCancelText = text;
        afterCancelClasses = await item.getAttribute('class') || '';
        break;
      }
    }
    
    // Verify subscription still exists
    expect(await subscriptionPage.findSubscriptionByName('Netflix')).toBeTruthy();
    
    // Verify some visual difference exists between canceled and active subscriptions
    expect(beforeCancelText).not.toBe('');
    expect(afterCancelText).not.toBe('');
    
    const hasDifference = 
      afterCancelText.toLowerCase().includes('cancel') || 
      beforeCancelText !== afterCancelText ||
      beforeCancelClasses !== afterCancelClasses;
      
    expect(hasDifference).toBeTruthy();
    
    // Verify cancel button remains hidden
    expect(await subscriptionPage.isCancelButtonVisible('Netflix')).toBeFalsy();
    
    // Optional cleanup: Delete the test subscription
    try {
      await subscriptionPage.deleteSubscription('Netflix');
    } catch (e) {
      // If delete is not available for canceled subscriptions, ignore error
    }
  });
}); 