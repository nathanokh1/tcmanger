# Testing Guide

## Test Structure

### Unit Tests (Jest)
- Models
  - User model
  - Project model
  - Module model
  - Feature model

- Components
  - Login form
  - Profile form
  - Navigation
  - Layout components

### Integration Tests (Jest)
- API Integration
  - Authentication flow
  - Profile updates
  - User management
  - Project operations

- Component Integration
  - Protected routes
  - Form submissions
  - Data fetching
  - Error handling

### E2E Tests (Playwright)
1. Authentication Flows
   ```typescript
   test('successful login flow', async ({ page }) => {
     await page.goto('/login');
     await page.fill('[name=email]', 'admin@tcmanager.com');
     await page.fill('[name=password]', 'admin123!');
     await page.click('button[type=submit]');
     await expect(page).toHaveURL('/dashboard');
   });
   ```

2. Profile Management
   ```typescript
   test('profile update flow', async ({ page }) => {
     // Login first
     await loginUser(page);
     
     // Navigate to profile
     await page.click('[aria-label="account of current user"]');
     await page.click('text=Profile');
     
     // Update profile
     await page.fill('[name=name]', 'Updated Name');
     await page.click('button[type=submit]');
     
     // Verify update
     await expect(page.locator('[name=name]')).toHaveValue('Updated Name');
   });
   ```

## Test Coverage Requirements

### Authentication & User Management (Priority 1)
- [x] User registration
- [x] User login
- [ ] Password change
- [ ] Profile updates
- [ ] Role-based access

### Project Management (Priority 2)
- [ ] Project creation
- [ ] Project updates
- [ ] Member management
- [ ] Project deletion

### Test Case Management (Priority 3)
- [ ] Test case creation
- [ ] Test suite management
- [ ] Test execution
- [ ] Results tracking

## Running Tests

### Development Environment
```bash
# Run unit and integration tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### CI/CD Pipeline
- Pre-commit: Unit tests
- Pre-merge: Integration tests
- Post-merge: E2E tests
- Deployment: Smoke tests

## Test Data Management

### Test Database
- Separate MongoDB instance for testing
- Seeded with test data before each test suite
- Cleaned up after each test

### Test Users
```typescript
export const TEST_USERS = {
  admin: {
    email: 'admin@tcmanager.com',
    password: 'admin123!',
    role: 'admin'
  },
  qa: {
    email: 'qa@tcmanager.com',
    password: 'qa123456!',
    role: 'qa'
  },
  developer: {
    email: 'dev@tcmanager.com',
    password: 'dev123456!',
    role: 'developer'
  },
  viewer: {
    email: 'viewer@tcmanager.com',
    password: 'viewer123!',
    role: 'viewer'
  }
};
``` 