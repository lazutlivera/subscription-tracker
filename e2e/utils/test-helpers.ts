import { Page } from '@playwright/test';

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(): string {
  const timestamp = new Date().getTime();
  return `test-${timestamp}@example.com`;
}

/**
 * Generate a random password that meets requirements
 */
export function generateTestPassword(): string {
  const timestamp = new Date().getTime();
  return `Test${timestamp}!`;
}

/**
 * Format a date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get a date that's N months from now
 */
export function getDateMonthsFromNow(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * Get a date that's N months ago
 */
export function getDateMonthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

/**
 * Clear browser storage (localStorage, sessionStorage, cookies)
 */
export async function clearBrowserStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

/**
 * Take a screenshot with a timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().getTime();
  await page.screenshot({ path: `./e2e/screenshots/${name}-${timestamp}.png` });
}

/**
 * Wait for network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Generate random subscription data
 */
export function generateRandomSubscription(overrides: Partial<{
  name: string;
  price: string;
  frequency: string;
  startDate: string;
  category: string;
}> = {}): {
  name: string;
  price: string;
  frequency: string;
  startDate: string;
  category: string;
} {
  const timestamp = new Date().getTime();
  const categories = ['entertainment', 'music', 'hosting', 'health', 'software', 'other'];
  const frequencies = ['monthly', 'yearly', 'quarterly'];
  
  return {
    name: `Test Sub ${timestamp}`,
    price: `${(Math.random() * 50).toFixed(2)}`,
    frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
    startDate: formatDateForInput(new Date()),
    category: categories[Math.floor(Math.random() * categories.length)],
    ...overrides
  };
} 