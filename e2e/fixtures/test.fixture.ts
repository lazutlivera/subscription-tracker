import { test as base } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { SubscriptionPage } from '../page-objects/SubscriptionPage';

// Test credentials (use environment variables in CI)
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
};

// Test subscription data
export const TEST_SUBSCRIPTIONS = {
  netflix: {
    name: 'Netflix',
    price: '14.99',
    frequency: 'monthly',
    startDate: '2023-01-01',
    category: 'entertainment',
  },
  spotify: {
    name: 'Spotify',
    price: '9.99',
    frequency: 'monthly',
    startDate: '2023-02-15',
    category: 'music',
  },
};

// Define our extended fixtures with proper TypeScript typing
type CustomFixtures = {
  authPage: AuthPage;
  subscriptionPage: SubscriptionPage;
  authenticatedPage: AuthPage;
};

// Create our extended test with custom fixtures
export const test = base.extend<CustomFixtures>({
  // Auth page fixture
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },
  
  // Subscription page fixture
  subscriptionPage: async ({ page }, use) => {
    const subscriptionPage = new SubscriptionPage(page);
    await use(subscriptionPage);
  },
  
  // Authenticated page - logs in before test and logs out after
  authenticatedPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    
    // Login before test
    await authPage.navigateToLogin();
    await authPage.login(TEST_USER.email, TEST_USER.password);
    
    // Pass control to test
    await use(authPage);
    
    // Logout after test
    await authPage.logout();
  },
});

export { expect } from '@playwright/test'; 