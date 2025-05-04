import { expect } from '@playwright/test';
import { test } from '../../fixtures/test.fixture';
import { generateRandomSubscription } from '../../utils/test-helpers';

test.describe('Subscription Cancellation Button Persistence', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to the dashboard/subscription page
    await authenticatedPage.goto('/');
    // Wait for the page to be fully loaded
    await authenticatedPage.waitForNavigation();
  });

  test('should hide cancel button permanently after cancellation', async ({ authenticatedPage, subscriptionPage, page }) => {
    // Create a random subscription for testing
    const subscription = generateRandomSubscription();
    await subscriptionPage.addSubscription(subscription);
    
    // Verify it exists
    expect(await subscriptionPage.findSubscriptionByName(subscription.name)).toBeTruthy();
    
    // Verify cancel button is initially visible
    const initialButtonVisible = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(initialButtonVisible).toBeTruthy();
    
    // Cancel the subscription
    await subscriptionPage.cancelSubscription(subscription.name);
    
    // Verify cancel button is no longer visible
    const buttonVisibleAfterCancel = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(buttonVisibleAfterCancel).toBeFalsy();
    
    // Refresh the page
    await subscriptionPage.navigateToSubscriptions();
    
    // Verify the subscription is still in the list (but cancelled)
    expect(await subscriptionPage.findSubscriptionByName(subscription.name)).toBeTruthy();
    
    // Verify cancel button is still not visible after refresh
    const buttonVisibleAfterRefresh = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(buttonVisibleAfterRefresh).toBeFalsy();
  });

  test('should maintain cancellation state across multiple refreshes', async ({ authenticatedPage, subscriptionPage, page }) => {
    // Add a subscription
    const subscription = generateRandomSubscription();
    await subscriptionPage.addSubscription(subscription);
    
    // Cancel it
    await subscriptionPage.cancelSubscription(subscription.name);
    
    // First refresh
    await subscriptionPage.navigateToSubscriptions();
    let buttonVisible = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(buttonVisible).toBeFalsy();
    
    // Second refresh
    await subscriptionPage.navigateToSubscriptions();
    buttonVisible = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(buttonVisible).toBeFalsy();
    
    // Third refresh
    await subscriptionPage.navigateToSubscriptions();
    buttonVisible = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(buttonVisible).toBeFalsy();
  });

  test('should display canceled state correctly in UI', async ({ authenticatedPage, subscriptionPage, page }) => {
    // Add a subscription
    const subscription = generateRandomSubscription();
    await subscriptionPage.addSubscription(subscription);
    
    // Get the subscription item before cancellation
    const subscriptionItems = page.locator(subscriptionPage.subscriptionItem);
    const count = await subscriptionItems.count();
    let uncanceledItemText = '';
    
    for (let i = 0; i < count; i++) {
      const item = subscriptionItems.nth(i);
      const text = await item.textContent() || '';
      if (text.includes(subscription.name)) {
        uncanceledItemText = text;
        break;
      }
    }
    
    // Cancel the subscription
    await subscriptionPage.cancelSubscription(subscription.name);
    
    // Refresh the page
    await subscriptionPage.navigateToSubscriptions();
    
    // Find the subscription item after cancellation
    const refreshedItems = page.locator(subscriptionPage.subscriptionItem);
    const refreshedCount = await refreshedItems.count();
    let canceledItemText = '';
    
    for (let i = 0; i < refreshedCount; i++) {
      const item = refreshedItems.nth(i);
      const text = await item.textContent() || '';
      if (text.includes(subscription.name)) {
        canceledItemText = text;
        break;
      }
    }
    
    // Check if there's any visual indication of cancellation
    // This could be based on text like "Canceled" or different styling
    // We can only check the text content here
    expect(canceledItemText).not.toBe('');
    
    // Ideally, the canceled item would have some indication in the text
    // This test is a bit naive and depends on the app's UI implementation
    const isCanceledIndicated = 
      canceledItemText.toLowerCase().includes('cancel') || 
      canceledItemText !== uncanceledItemText;
      
    expect(isCanceledIndicated).toBeTruthy();
  });
}); 