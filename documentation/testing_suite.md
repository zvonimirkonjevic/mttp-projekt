# Testing Suite

## Frontend Web App Tests

### Overview

This frontend test suite includes:
- **Unit Tests**: Jest + React Testing Library for React components, hooks, contexts, and server actions
- **Load Tests**: k6 for frontend performance and stress testing

### Quick Start

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Unit Tests

#### Structure
```
src/__tests__/
├── app/
│   ├── actions/
│   │   └── auth.test.ts           # Server actions (login, signup, logout)
│   ├── auth/
│   │   └── callback/
│   │       └── route.test.ts      # OAuth callback route handler
│   └── settings/
│       ├── billing/
│       │   └── page.test.tsx      # Billing page, payment status display
│       └── topup/
│           └── page.test.tsx      # Credit purchase, Stripe checkout
├── components/
│   ├── auth/
│   │   ├── LoginForm.test.tsx     # Login form with OAuth
│   │   └── SignupForm.test.tsx    # Signup form with OAuth
│   ├── dashboard/
│   │   ├── PaymentSuccessHandler.test.tsx  # Payment success toast
│   │   └── Sidebar.test.tsx       # Credit balance display, user profile
│   └── landing_page/
│       ├── Hero.test.tsx
│       └── CountUp.test.tsx
├── contexts/
│   └── UserContext.test.tsx       # Auth state, self-healing, realtime
├── hooks/
│   ├── useAvatarUpload.test.tsx
│   └── useUserProfile.test.tsx
├── lib/
│   └── auth/
│       └── supabase-adapter.test.ts  # Auth adapter methods
├── schemas/
│   └── auth-schemas.test.ts
├── utils/
│   └── test-utils.tsx             # Shared test utilities & mocks
└── middleware.test.ts             # Route protection & auth redirects
```

#### Test Categories

**Authentication Tests**
- `auth.test.ts` - Server actions for login/signup/logout with Zod validation, FastAPI sync, error handling
- `route.test.ts` - OAuth callback handling, session exchange, backend sync
- `supabase-adapter.test.ts` - Auth adapter login/logout methods
- `LoginForm.test.tsx` - Form rendering, OAuth flow, error states, loading states
- `SignupForm.test.tsx` - Form rendering, success states, OAuth flow, pending states

**Billing & Credits Tests**
- `topup/page.test.tsx` - Credit package selection, price formatting, Stripe checkout initiation, error handling, loading states
- `billing/page.test.tsx` - Payment success/cancelled status display, auto-dismiss, profile refresh, credit balance display
- `PaymentSuccessHandler.test.tsx` - Dashboard payment success detection, toast notification, URL cleanup
- `Sidebar.test.tsx` - Credit balance display, user profile, navigation, logout functionality

**Context Tests**
- `UserContext.test.tsx` - Initial loading, profile fetching, auth state changes, self-healing for PGRST116 errors, realtime subscriptions

**Middleware Tests**
- `middleware.test.ts` - Route protection, auth redirects, session refresh, matcher configuration

### Mocks
- `src/__mocks__/supabase.ts` - Supabase client mock
- `src/__mocks__/tanstack-query.tsx` - TanStack Query wrapper
- `src/__tests__/utils/test-utils.tsx` - UserProvider wrapper, mock user data, render utilities

### Load Tests

**Status**: Not yet implemented. Load tests will be added in future iterations.

Planned load tests using [k6](https://k6.io/docs/getting-started/installation/):
- Authentication flow testing
- Dashboard performance testing
- Stress testing

### CI/CD Integration

#### GitHub Actions Example

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm test -- --coverage
    - uses: codecov/codecov-action@v3
```