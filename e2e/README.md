# E2E Testing Suite for Subscription Tracker

This directory contains end-to-end tests built with Playwright that verify the functionality of the Subscription Tracker application.

## Structure

- **tests/** - Test files organized by feature
  - **auth/** - Authentication tests
  - **subscriptions/** - Subscription management tests
  - **analytics/** - Analytics/reporting tests

- **page-objects/** - Page object models for different parts of the application
- **fixtures/** - Test fixtures and data
- **utils/** - Utility functions for testing

## Running Tests

### All Tests

```bash
npm run e2e
```

### With UI

```bash
npm run e2e:ui
```

### View Reports

```bash
npm run e2e:report
```

### Specific Tests

```bash
npx playwright test auth/login.spec.ts
```

## Test Coverage

The tests cover the following critical functionality:

1. **Authentication**
   - User login
   - Login validation
   - Session persistence

2. **Subscription Management**
   - Adding subscriptions
   - Editing subscriptions
   - Canceling subscriptions
   - Date calculations and persistence

3. **Specific Issue Tests**
   - Payment date refresh when dates pass
   - Cancel button visibility persistence

## Environment Setup

These tests expect a running development server. The `webServer` configuration in `playwright.config.ts` will automatically start the development server.

## Debugging

For debugging, use the UI mode:

```bash
npm run e2e:ui
```

This will open the Playwright UI which allows you to:
- See each test step
- See screenshots at each step
- Debug failing tests
- Manually run specific tests

## CI Integration

These tests can be integrated into CI pipelines. The configuration already handles retries and parallel runs for CI environments. 