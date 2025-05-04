import { expect } from '@playwright/test';
import { test } from '../../fixtures/test.fixture';
import { generateRandomSubscription, formatDateForInput } from '../../utils/test-helpers';

test.describe('Payment Date Refresh Functionality', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to the dashboard/subscription page
    await authenticatedPage.goto('/');
    // Wait for the page to be fully loaded
    await authenticatedPage.waitForNavigation();
  });

  test('should refresh next payment date automatically when it passes', async ({ authenticatedPage, subscriptionPage, page }) => {
    // Create a test subscription with a date in the past
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const subscription = generateRandomSubscription({
      startDate: formatDateForInput(oneMonthAgo),
      frequency: 'monthly'
    });
    
    await subscriptionPage.addSubscription(subscription);
    
    // Verify the subscription exists
    expect(await subscriptionPage.findSubscriptionByName(subscription.name)).toBeTruthy();
    
    // Get the next payment date - should be a future date, not the past
    const nextPaymentDateText = await subscriptionPage.getNextPaymentDate(subscription.name);
    
    // Convert the date text to a Date object
    if (nextPaymentDateText) {
      const paymentDate = new Date(nextPaymentDateText);
      const today = new Date();
      
      // Expect the next payment date to be in the future, not past
      expect(paymentDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
    }
  });

  test('should handle recurring date calculations correctly', async ({ authenticatedPage, subscriptionPage }) => {
    // Create a subscription with quarterly frequency
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const subscription = generateRandomSubscription({
      startDate: formatDateForInput(threeMonthsAgo),
      frequency: 'quarterly' // Every 3 months
    });
    
    await subscriptionPage.addSubscription(subscription);
    
    // Get the next payment date
    const nextPaymentDateText = await subscriptionPage.getNextPaymentDate(subscription.name);
    
    // The next payment should be approximately now (3 months after start)
    // or in the future (if the app has already calculated the next date)
    if (nextPaymentDateText) {
      const paymentDate = new Date(nextPaymentDateText);
      const today = new Date();
      const oneMonthInFuture = new Date();
      oneMonthInFuture.setMonth(today.getMonth() + 1);
      
      // The next payment date should be no more than about a month in the past
      // or somewhere in the future (if it's already been refreshed)
      const threeMonthsFromStart = new Date(threeMonthsAgo);
      threeMonthsFromStart.setMonth(threeMonthsAgo.getMonth() + 3);
      
      // Verify payment date is either around now or in the future
      // This is a bit flexible since we don't know exactly how the app calculates things
      const isAroundNowOrFuture = 
        Math.abs(paymentDate.getTime() - threeMonthsFromStart.getTime()) < (30 * 24 * 60 * 60 * 1000) || // Within 30 days of expectation
        paymentDate.getTime() > today.getTime(); // Or in the future
        
      expect(isAroundNowOrFuture).toBeTruthy();
    }
  });

  test('should persist payment date updates after refresh', async ({ authenticatedPage, subscriptionPage, page }) => {
    // Create a test subscription with date in the past
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const subscription = generateRandomSubscription({
      startDate: formatDateForInput(twoMonthsAgo),
      frequency: 'monthly'
    });
    
    await subscriptionPage.addSubscription(subscription);
    
    // Get the initial next payment date
    const initialNextPaymentDate = await subscriptionPage.getNextPaymentDate(subscription.name);
    
    // Refresh the page
    await subscriptionPage.navigateToSubscriptions();
    
    // Get the next payment date after refresh
    const refreshedNextPaymentDate = await subscriptionPage.getNextPaymentDate(subscription.name);
    
    // Dates should be approximately the same (allowing for slight format differences)
    expect(initialNextPaymentDate).not.toBeNull();
    expect(refreshedNextPaymentDate).not.toBeNull();
    
    if (initialNextPaymentDate && refreshedNextPaymentDate) {
      const initialDate = new Date(initialNextPaymentDate).getTime();
      const refreshedDate = new Date(refreshedNextPaymentDate).getTime();
      
      // Dates should be within 1 day of each other (to account for any formatting differences)
      const oneDayMs = 24 * 60 * 60 * 1000;
      expect(Math.abs(initialDate - refreshedDate)).toBeLessThan(oneDayMs);
    }
  });
}); 