# SubsWise - Subscription Management App

SubsWise is a modern web application that helps users track and manage their subscriptions in one place. Built with Next.js, TypeScript, and Supabase, it provides a user-friendly interface to monitor subscription spending and get insights into your recurring payments.

## Features

### Dashboard
- 📊 Visual overview of all your subscriptions
- 💰 Monthly spending breakdown
- 🎯 Subscription cost distribution by category
- 📅 Interactive calendar with payment due dates
- 🔔 Payment due notifications

### Analytics
- 📈 Monthly spending trends
- 📊 Category-wise spending analysis
- 💡 Smart recommendations for optimizing subscriptions
- 🔍 Detailed breakdown of spending patterns

### Reports
- 📑 Comprehensive subscription reports
- 💳 Monthly spending summaries
- 📋 Category breakdown analysis
- 📆 Payment history tracking

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts, ApexCharts
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/subswise.git
cd subswise
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Supported Subscription Categories

- 🎬 Streaming & Entertainment
- 🎵 Music & Audio
- ☁️ Cloud Storage
- 💻 Productivity
- 🎮 Gaming
- 📰 News & Reading
- 💪 Fitness & Health
- 📚 Learning & Education
- 🔒 Security & VPN
- 💼 Business & Professional
- 🤝 Social & Communication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## Latest Release (v1.4)
- Added payment approaching indicators with animated effects
- Improved subscription management UI
- Various bug fixes and performance improvements

[See full changelog](CHANGELOG.md)

## Testing

### Unit Testing

The subscription tracker includes a comprehensive suite of unit tests to ensure code quality and reliability. Tests are written using Jest and React Testing Library.

#### Testing Structure

- `__tests__/`: Contains all test files, mirroring the structure of the source code
  - `components/`: Tests for React components
  - `contexts/`: Tests for context providers
  - `utils/`: Tests for utility functions

#### Running Tests

To run the tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm test -- --coverage
```

To run a specific test file:

```bash
npm test -- path/to/test-file.test.tsx
```

#### Test Coverage

The test suite covers:

- **Utility Functions**: Request limiter, circuit breaker, validation, categories
- **React Components**: Authentication forms, subscription management
- **Context Providers**: Authentication context

#### Mock Strategy

The tests use a combination of:
- Direct mocks for external dependencies like Supabase
- Component mocks to isolate testing logic
- Context mocks to provide test data

#### Adding New Tests

When adding new features, create corresponding test files in the `__tests__` directory. Follow the existing pattern of:
1. Mocking dependencies
2. Setting up test data
3. Rendering components or executing functions
4. Asserting expected behavior

### End-to-End Testing

The subscription tracker also includes a comprehensive E2E testing suite built with Playwright to verify critical user flows in a real browser environment.

#### E2E Test Structure

- `e2e/`: Contains all E2E test files and utilities
  - `tests/`: Test specs organized by feature
    - `auth/`: Authentication tests
    - `subscriptions/`: Subscription management tests
  - `page-objects/`: Page object models for different parts of the application
  - `fixtures/`: Test fixtures and data
  - `utils/`: Helper functions for E2E testing

#### Running E2E Tests

Run all E2E tests:

```bash
npm run e2e
```

Run with UI mode for debugging:

```bash
npm run e2e:ui
```

View detailed reports:

```bash
npm run e2e:report
```

#### E2E Test Coverage

The E2E test suite covers critical user flows:

1. **Authentication**
   - Login and logout processes
   - Session management

2. **Subscription Management**
   - Adding new subscriptions
   - Canceling subscriptions
   - Date calculations and refresh
   - Persistence of changes after page refreshes

3. **Issue-Specific Tests**
   - Payment date refresh for overdue payments
   - Cancel button persistence

For more details, see the [E2E Testing README](e2e/README.md).
