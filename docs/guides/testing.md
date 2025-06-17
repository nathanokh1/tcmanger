# TCManager Testing Guide

## Overview
This document outlines the testing strategy, tools, and best practices for testing TCManager.

## Testing Levels

### 1. Unit Testing
```typescript
// Example: User Service Test
describe('UserService', () => {
  let service: UserService;
  let repository: MockUserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
    service = new UserService(repository);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: '1', name: 'Test User' };
      repository.findById = jest.fn().mockResolvedValue(user);

      const result = await service.findById('1');

      expect(result).toEqual(user);
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when user not found', async () => {
      repository.findById = jest.fn().mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow('User not found');
    });
  });
});
```

### 2. Integration Testing
```typescript
// Example: API Integration Test
describe('User API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /users', () => {
    it('should create user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test User');
    });

    it('should validate input', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(3);
    });
  });
});
```

### 3. E2E Testing
```typescript
// Example: Playwright E2E Test
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('should create new user', async ({ page }) => {
    await page.goto('/users/new');
    await page.fill('[data-testid="name"]', 'New User');
    await page.fill('[data-testid="email"]', 'new@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="create-button"]');

    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.user-list')).toContainText('New User');
  });
});
```

## Test Organization

### 1. Directory Structure
```
tests/
├── unit/
│   ├── services/
│   │   ├── user.service.test.ts
│   │   └── auth.service.test.ts
│   ├── controllers/
│   │   ├── user.controller.test.ts
│   │   └── auth.controller.test.ts
│   └── models/
│       └── user.model.test.ts
├── integration/
│   ├── api/
│   │   ├── user.api.test.ts
│   │   └── auth.api.test.ts
│   └── database/
│       └── user.repository.test.ts
└── e2e/
    ├── auth/
    │   ├── login.test.ts
    │   └── register.test.ts
    └── users/
        ├── create.test.ts
        └── update.test.ts
```

### 2. Test Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Testing Tools

### 1. Jest
```typescript
// Mock example
jest.mock('@/services/user.service', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Spy example
const spy = jest.spyOn(console, 'error');
expect(spy).toHaveBeenCalledWith('Error message');
```

### 2. Playwright
```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'Safari',
      use: { browserName: 'webkit' },
    },
  ],
};

export default config;
```

## Test Data Management

### 1. Fixtures
```typescript
// fixtures/users.ts
export const testUsers = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
  },
  user: {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'USER',
  },
};
```

### 2. Factories
```typescript
// factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: 'USER',
  ...overrides,
});
```

## Test Coverage

### 1. Coverage Report
```bash
# Generate coverage report
npm run test:coverage

# Coverage thresholds
coverageThreshold: {
  global: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
}
```

### 2. Coverage Badges
```markdown
![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen)
```

## Performance Testing

### 1. Load Testing
```typescript
// load-test.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

### 2. Stress Testing
```typescript
// stress-test.ts
import { sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  http.get('http://localhost:3000/api/users');
  sleep(1);
}
```

## Security Testing

### 1. Authentication Tests
```typescript
describe('Authentication', () => {
  it('should prevent access without token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .expect(401);
  });

  it('should prevent access with invalid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
```

### 2. Authorization Tests
```typescript
describe('Authorization', () => {
  it('should allow admin to delete user', async () => {
    const adminToken = await getAdminToken();
    const response = await request(app.getHttpServer())
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should prevent user from deleting other users', async () => {
    const userToken = await getUserToken();
    const response = await request(app.getHttpServer())
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

## Best Practices

### 1. Test Naming
```typescript
// Good
describe('UserService', () => {
  it('should return user when found by id', async () => {});
  it('should throw error when user not found', async () => {});
  it('should update user successfully', async () => {});
});

// Bad
describe('UserService', () => {
  it('test find user', async () => {});
  it('test error', async () => {});
  it('test update', async () => {});
});
```

### 2. Test Organization
- Group related tests
- Use descriptive names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent
- Clean up after tests

### 3. Test Data
- Use factories for test data
- Clean up test data
- Use meaningful test data
- Avoid hardcoded values
- Use environment variables 