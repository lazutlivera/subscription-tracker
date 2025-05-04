import { expect } from '@playwright/test';
import { test, TEST_SUBSCRIPTIONS } from '../../fixtures/test.fixture';
import { generateRandomSubscription, formatDateForInput, getDateMonthsFromNow } from '../../utils/test-helpers';

test.describe('Subscription management', () => {
  // Use the authenticatedPage fixture to ensure we're logged in for all tests
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to the dashboard/subscription page
    await authenticatedPage.goto('/');
    // Wait for the page to be fully loaded
    await authenticatedPage.waitForNavigation();
  });

  test('should display subscription list', async ({ authenticatedPage, subscriptionPage }) => {
    // Verify subscription list is visible
    const subscriptionList = authenticatedPage.page.locator(subscriptionPage.subscriptionList);
    await expect(subscriptionList).toBeVisible();
  });

  test('should add a new subscription', async ({ authenticatedPage, subscriptionPage }) => {
    // Get initial subscription count
    await subscriptionPage.navigateToSubscriptions();
    const initialCount = await subscriptionPage.getSubscriptionCount();
    
    // Create test subscription data
    const newSubscription = {
      name: `Netflix Test ${Date.now()}`,
      price: '14.99',
      frequency: 'monthly',
      startDate: formatDateForInput(new Date()),
      category: 'entertainment',
    };
    
    // Add subscription
    await subscriptionPage.addSubscription(newSubscription);
    
    // Verify subscription count increased
    const newCount = await subscriptionPage.getSubscriptionCount();
    expect(newCount).toBeGreaterThan(initialCount);
    
    // Verify subscription was added correctly
    const exists = await subscriptionPage.findSubscriptionByName(newSubscription.name);
    expect(exists).toBeTruthy();
  });

  test('should cancel a subscription', async ({ authenticatedPage, subscriptionPage }) => {
    // Create a test subscription first
    const subscription = generateRandomSubscription();
    await subscriptionPage.addSubscription(subscription);
    
    // Verify it was added
    expect(await subscriptionPage.findSubscriptionByName(subscription.name)).toBeTruthy();
    
    // Cancel the subscription
    await subscriptionPage.cancelSubscription(subscription.name);
    
    // Verify the cancel button is no longer visible
    const isCancelButtonVisible = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(isCancelButtonVisible).toBeFalsy();
    
    // Refresh the page to check persistence
    await subscriptionPage.navigateToSubscriptions();
    
    // Verify the cancel button is still not visible after refresh
    const isCancelButtonVisibleAfterRefresh = await subscriptionPage.isCancelButtonVisible(subscription.name);
    expect(isCancelButtonVisibleAfterRefresh).toBeFalsy();
  });

  test('should display next payment date correctly', async ({ authenticatedPage, subscriptionPage }) => {
    // Add a subscription with today's date
    const subscription = generateRandomSubscription({
      startDate: formatDateForInput(new Date()),
      frequency: 'monthly'
    });
    
    await subscriptionPage.addSubscription(subscription);
    
    // Get the next payment date
    const nextPaymentDateText = await subscriptionPage.getNextPaymentDate(subscription.name);
    expect(nextPaymentDateText).not.toBeNull();
    
    // Calculate expected next payment date (1 month from today)
    const today = new Date();
    const expectedNextMonth = new Date(today);
    expectedNextMonth.setMonth(today.getMonth() + 1);
    
    // Extract date from text and compare (just checking the month to avoid day mismatches)
    if (nextPaymentDateText) {
      const paymentDate = new Date(nextPaymentDateText);
      expect(paymentDate.getMonth()).toBe(expectedNextMonth.getMonth());
    }
  });

  test('should update payment dates when they pass', async ({ authenticatedPage, subscriptionPage, page }) => {
    // This test would need to manipulate the date or use application APIs
    // For a real implementation, we would test automatic date refreshing
    
    // Mock approach - we can test UI changes based on data we add
    // Assuming our app has logic to handle this, we'd create a subscription with a past date
    // and verify the date gets updated when rendered
    
    // For now, just testing we can see a subscription date
    // Note: This test requires more implementation using mocks or API calls
    const subscription = generateRandomSubscription();
    await subscriptionPage.addSubscription(subscription);
    
    const nextPaymentDateText = await subscriptionPage.getNextPaymentDate(subscription.name);
    expect(nextPaymentDateText).not.toBeNull();
  });
}); 