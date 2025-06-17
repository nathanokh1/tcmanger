# Authentication Testing Guide

## Overview

This document outlines the authentication testing strategy for TCManager, including test users, test cases, and testing procedures.

## Test Users

TCManager includes several test users for different testing scenarios:

### Admin User
- **Email**: admin@tcmanager.com
- **Password**: admin123!
- **Role**: Admin
- **Permissions**: Full access to all features

### QA User
- **Email**: qa@tcmanager.com
- **Password**: qa123456!
- **Role**: QA
- **Permissions**: Can create and manage test cases, execute tests, and view reports

### Developer User
- **Email**: dev@tcmanager.com
- **Password**: dev123456!
- **Role**: Developer
- **Permissions**: Can view test cases and reports, but cannot modify them

### Viewer User
- **Email**: viewer@tcmanager.com
- **Password**: viewer123!
- **Role**: Viewer
- **Permissions**: Read-only access to test cases and reports

## Test Cases

### Authentication Flow Tests

1. **Login Tests**
   - Successful login with valid credentials
   - Failed login with invalid credentials
   - Failed login with empty fields
   - Remember me functionality
   - Password reset flow

2. **Logout Tests**
   - Successful logout
   - Session termination
   - Token invalidation

3. **Token Management**
   - Token expiration
   - Token refresh
   - Invalid token handling

4. **Access Control Tests**
   - Role-based access control
   - Permission validation
   - Unauthorized access attempts

## Testing Procedures

### Frontend Testing

The frontend authentication tests are located in `frontend/src/__tests__/auth.test.tsx` and cover:

- Login form rendering
- Form validation
- API integration
- Error handling
- Navigation after successful login

### Backend Testing

The backend authentication tests are located in `src/models/__tests__/user.model.test.ts` and cover:

- User model validation
- Password hashing
- Token generation
- Authentication middleware

## Running Authentication Tests

### Frontend Tests

```bash
# Run all frontend tests
cd frontend
npm test

# Run only authentication tests
npm test -- auth
```

### Backend Tests

```bash
# Run all backend tests
npm test

# Run only user model tests
npm test -- user.model
```

## Test Environment Setup

The test environment uses MongoDB Memory Server to create an isolated database for testing. This ensures that tests don't affect the actual database.

```typescript
// src/test/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await mongoose.connection.syncIndexes();
});

afterEach(async () => {
  // Clean up the database between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

## Mocking Authentication

For frontend tests, we mock the authentication API to avoid making actual network requests:

```typescript
// Mock the API module
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));
```

## Security Considerations

When testing authentication, consider the following security aspects:

1. **Password Storage**: Ensure passwords are properly hashed using bcrypt
2. **Token Security**: Verify that JWT tokens are properly signed and validated
3. **Session Management**: Test session timeout and renewal mechanisms
4. **CSRF Protection**: Verify that CSRF tokens are properly implemented
5. **Rate Limiting**: Test that login attempts are rate-limited to prevent brute force attacks

## Troubleshooting

Common issues and solutions:

1. **Test User Not Found**: Ensure the test database is properly seeded before running tests
2. **Token Expiration**: Check that token expiration times are properly configured
3. **CORS Issues**: Verify that CORS is properly configured for API requests
4. **Authentication State**: Ensure the authentication state is properly managed in the frontend 