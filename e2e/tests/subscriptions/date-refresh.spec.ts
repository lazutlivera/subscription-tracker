import { expect } from '@playwright/test';
import { test } from '../../fixtures/test.fixture';
import { formatDateForInput, getDateMonthsAgo } from '../../utils/test-helpers';

test.describe('Payment Date Refresh Functionality', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to the dashboard/subscription page
    await authenticatedPage.goto('/');
    // Wait for the page to be fully loaded
    await authenticatedPage.waitForNavigation();
  });

  test('confirm payment reoccurs monthly in a correct way', async ({ subscriptionPage, page }) => {
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
    
    // Select Netflix from dropdown
    await page.selectOption('select[name="name"]', 'Netflix');
    
    // Set start date to exactly 1 month ago
    const startDate = getDateMonthsAgo(1);
    console.log('Setting start date to:', formatDateForInput(startDate));
    await page.fill('input[name="startDate"]', formatDateForInput(startDate));
    
    // Click add subscription button
    await page.click('button[id="add-subscription-button"]');
    
    // Wait for the subscription to be added and appear in the list
    await page.waitForSelector(`${subscriptionPage.subscriptionItem}:has-text("Netflix")`, { state: 'visible' });
    
    // Verify Netflix was added
    expect(await subscriptionPage.findSubscriptionByName('Netflix')).toBeTruthy();
    
    // Get the next payment date text
    const nextPaymentDateText = await subscriptionPage.getNextPaymentDate('Netflix');
    expect(nextPaymentDateText).not.toBeNull();
    console.log('Next payment date from UI:', nextPaymentDateText);
    
    if (nextPaymentDateText) {
      // Calculate expected next payment date (current date + 1 month)
      // Create nextMonth by adding 1 month to the start date (which was 1 month ago)
      const nextMonth = new Date(startDate);
      nextMonth.setMonth(nextMonth.getMonth() + 2); // +2 because startDate is already -1 month
      console.log('Next month date object:', nextMonth);
      
      // Format expected date in "MMM dd, yyyy" format - exactly matching the application's format
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const expectedMonth = months[nextMonth.getMonth()];
      const expectedDay = nextMonth.getDate().toString().padStart(2, '0');
      const expectedYear = nextMonth.getFullYear().toString();
      const expectedDateFormat = `${expectedMonth} ${expectedDay}, ${expectedYear}`;
      
      console.log('---- Date Format Debugging ----');
      console.log('Start date:', startDate);
      console.log('Next month date:', nextMonth);
      console.log('Month index:', nextMonth.getMonth());
      console.log('Expected month:', expectedMonth);
      console.log('Day of month:', nextMonth.getDate());
      console.log('Expected day (with zero):', expectedDay);
      console.log('Expected year:', expectedYear);
      console.log('Expected full format:', expectedDateFormat);
      
      // Allow for the UI to display the date with or without leading zero for single-digit days
      const expectedDayWithoutZero = nextMonth.getDate().toString();
      const alternateExpectedFormat = `${expectedMonth} ${expectedDayWithoutZero}, ${expectedYear}`;
      console.log('Alternate format (no zero):', alternateExpectedFormat);
      
      // Check for either format match
      const matchesFormat = 
        nextPaymentDateText.includes(expectedDateFormat) || 
        nextPaymentDateText.includes(alternateExpectedFormat);
      
      console.log('Format match result:', matchesFormat);
      
      // Try to find any date-like pattern in the text for debugging
      const datePattern = /([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/;
      const dateMatch = nextPaymentDateText.match(datePattern);
      if (dateMatch) {
        console.log('Detected date pattern:', dateMatch[0]);
        console.log('Month:', dateMatch[1]);
        console.log('Day:', dateMatch[2]);
        console.log('Year:', dateMatch[3]);
      } else {
        console.log('No standard date pattern found in:', nextPaymentDateText);
      }
      
      expect(matchesFormat).toBeTruthy();
    }
  });

  test('dates should persist after page refresh', async ({ subscriptionPage, page }) => {
    // We assume Netflix subscription exists from previous test
    
    // Verify Netflix subscription exists
    expect(await subscriptionPage.findSubscriptionByName('Netflix')).toBeTruthy();
    
    // Get the initial next payment date
    const initialNextPaymentDate = await subscriptionPage.getNextPaymentDate('Netflix');
    expect(initialNextPaymentDate).not.toBeNull();
    console.log('Initial next payment date:', initialNextPaymentDate);
    
    // Refresh the page
    await subscriptionPage.navigateToSubscriptions();
    
    // Wait for Netflix subscription to appear after refresh
    await page.waitForSelector(`${subscriptionPage.subscriptionItem}:has-text("Netflix")`, { state: 'visible' });
    
    // Get the next payment date after refresh
    const refreshedNextPaymentDate = await subscriptionPage.getNextPaymentDate('Netflix');
    expect(refreshedNextPaymentDate).not.toBeNull();
    console.log('Refreshed next payment date:', refreshedNextPaymentDate);
    
    // Dates should be the same after refresh
    expect(initialNextPaymentDate).toEqual(refreshedNextPaymentDate);
  });

  test('should show cancelled in the next payment row rather than date if the sub cancelled', async ({ subscriptionPage, page }) => {
    // We assume Netflix subscription exists from previous tests
    
    // Verify Netflix subscription exists
    expect(await subscriptionPage.findSubscriptionByName('Netflix')).toBeTruthy();
    
    // Cancel Netflix subscription
    await subscriptionPage.cancelSubscription('Netflix');
    
    // Wait for the UI to update after cancellation
    await page.waitForTimeout(500);
    
    // Refresh the page
    await subscriptionPage.navigateToSubscriptions();
    
    // Wait for Netflix subscription to appear after refresh
    await page.waitForSelector(`${subscriptionPage.subscriptionItem}:has-text("Netflix")`, { state: 'visible' });
    
    // Get the next payment date text after cancellation
    const nextPaymentText = await subscriptionPage.getNextPaymentDate('Netflix');
    expect(nextPaymentText).not.toBeNull();
    console.log('Payment text after cancellation:', nextPaymentText);
    
    if (nextPaymentText) {
      // The next payment text should contain "Cancelled" or "Canceled" (depending on app spelling)
      const containsCancelled = 
        nextPaymentText.toLowerCase().includes('cancelled') || 
        nextPaymentText.toLowerCase().includes('canceled') ||
        nextPaymentText.toLowerCase().includes('cancel');
      
      console.log('Contains cancelled:', containsCancelled);
      expect(containsCancelled).toBeTruthy();
    }
  });
}); 