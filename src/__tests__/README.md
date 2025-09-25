# Authentication Testing Guide

This guide covers comprehensive testing for the authentication system in the E-Commerce application.

## Test Structure

### 1. Unit Tests

#### `tokenHelper.test.ts`

Tests the JWT token validation logic:

- ✅ Null/empty token handling
- ✅ Valid non-expired tokens
- ✅ Expired tokens
- ✅ Invalid token format handling
- ✅ Edge cases (token expiring exactly now)

#### `useAuthStore.test.ts`

Tests the authentication state management:

- ✅ Initial state setup
- ✅ User management (set/get)
- ✅ Token management (set/clear)
- ✅ Authentication status checking
- ✅ State reset functionality
- ✅ LocalStorage integration

#### `useLogin.test.ts`

Tests the login hook functionality:

- ✅ Form state management
- ✅ Authentication check on mount
- ✅ Login form validation
- ✅ API integration
- ✅ Success/error handling
- ✅ Loading states
- ✅ Throttling mechanism

#### `auth.api.test.ts`

Tests the authentication API service:

- ✅ Login endpoint integration
- ✅ User profile fetching
- ✅ Token refresh functionality
- ✅ Error handling
- ✅ Loading state management

#### `ProtectedRoute.test.tsx`

Tests the route protection component:

- ✅ Authenticated user access
- ✅ Unauthenticated user redirection
- ✅ Token expiration handling
- ✅ User data fetching
- ✅ Error scenarios (403, network errors)
- ✅ Multiple fetch prevention

#### `LoginPage.test.tsx`

Tests the login page component:

- ✅ Form rendering
- ✅ User interactions
- ✅ Loading states
- ✅ Form validation
- ✅ Accessibility
- ✅ Styling

## Running Tests

### Run all tests:

```bash
npm test
```

### Run tests in watch mode:

```bash
npm run test:watch
```

### Run tests with coverage:

```bash
npm run test:coverage
```

### Run specific test files:

```bash
npm test tokenHelper.test.ts
npm test useAuthStore.test.ts
npm test useLogin.test.ts
```

## Test Coverage Areas

### Authentication Flow

1. **Token Validation**: JWT token parsing and expiration checking
2. **State Management**: User and token state persistence
3. **API Integration**: Login, user profile, and token refresh
4. **Route Protection**: Access control and redirections
5. **UI Components**: Login form and user interactions

### Edge Cases Covered

- Invalid/expired tokens
- Network errors
- Empty form submissions
- Token expiration during session
- Multiple rapid form submissions
- LocalStorage failures

### Security Considerations

- Token validation before API calls
- Secure token storage
- Automatic logout on token expiration
- Protected route access control

## Mock Strategy

### External Dependencies

- `jwt-decode`: Mocked for token parsing
- `axios`: Mocked for API calls
- `react-router-dom`: Mocked for navigation
- `react-hot-toast`: Mocked for notifications
- `localStorage`: Mocked for persistence

### State Management

- Zustand store methods are tested in isolation
- Mock implementations for complex interactions
- Controlled state for predictable testing

## Best Practices Implemented

1. **Isolation**: Each test is independent
2. **Mocking**: External dependencies are properly mocked
3. **Coverage**: All code paths are tested
4. **Edge Cases**: Boundary conditions are covered
5. **User Experience**: UI interactions are tested
6. **Security**: Authentication flows are validated

## Adding New Tests

When adding new authentication features:

1. **Unit Tests**: Test individual functions and hooks
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user flows
4. **Security Tests**: Test authentication boundaries
5. **Performance Tests**: Test with large datasets

## Debugging Tests

### Common Issues:

- Mock not working: Check mock implementation
- Async operations: Use `waitFor` for async updates
- State updates: Use `act` for state changes
- Navigation: Mock `useNavigate` properly

### Debug Commands:

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test with debug
npm test -- --testNamePattern="login" --verbose

# Run with coverage and debug
npm run test:coverage -- --verbose
```
