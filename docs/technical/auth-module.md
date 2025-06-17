# Authentication Module

## Overview

The Authentication Module in TCManager handles user authentication, authorization, and session management. It provides a secure way for users to access the system based on their roles and permissions.

## Components

### Frontend Components

1. **AuthContext (frontend/src/context/AuthContext.tsx)**
   - Manages authentication state
   - Provides login/logout functionality
   - Handles token storage and retrieval
   - Exposes authentication hooks for components

2. **Login Page (frontend/src/pages/Login.tsx)**
   - Renders the login form
   - Handles form validation
   - Integrates with AuthContext for authentication

3. **API Service (frontend/src/services/api.ts)**
   - Provides methods for authentication API calls
   - Handles token management
   - Manages API request headers

### Backend Components

1. **User Model (src/models/user.model.ts)**
   - Defines the user schema
   - Implements password hashing
   - Provides methods for user operations

2. **Auth Middleware (src/middleware/auth.middleware.ts)**
   - Validates JWT tokens
   - Checks user permissions
   - Protects routes based on authentication status

3. **User Controller (src/controllers/user.controller.ts)**
   - Handles user registration
   - Manages user authentication
   - Provides user management endpoints

## Authentication Flow

1. **Login Process**
   - User enters credentials on the login page
   - Frontend sends credentials to the backend
   - Backend validates credentials and returns a JWT token
   - Frontend stores the token in localStorage
   - User is redirected to the dashboard

2. **Token Management**
   - JWT tokens are used for authentication
   - Tokens include user ID and role information
   - Tokens expire after a configurable time period
   - Refresh tokens can be used to obtain new access tokens

3. **Authorization**
   - Role-based access control (RBAC) is implemented
   - Four roles are supported: Admin, QA, Developer, and Viewer
   - Each role has specific permissions
   - Permissions are checked on both frontend and backend

## Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt
   - Password complexity requirements are enforced
   - Password reset functionality is available

2. **Token Security**
   - JWT tokens are signed with a secret key
   - Tokens include expiration time
   - Tokens are stored securely in localStorage

3. **API Security**
   - Rate limiting is implemented to prevent brute force attacks
   - CORS is configured to restrict access to trusted domains
   - Input validation is performed on all requests

## Testing

Comprehensive tests are available for the authentication module:

1. **Frontend Tests (frontend/src/__tests__/auth.test.tsx)**
   - Login form rendering
   - Form validation
   - API integration
   - Error handling

2. **Backend Tests (src/models/__tests__/user.model.test.ts)**
   - User model validation
   - Password hashing
   - Token generation
   - Authentication middleware

## Usage Examples

### Login

```typescript
// Using the AuthContext in a component
import { useAuth } from '../context/AuthContext';

const LoginComponent = () => {
  const { login, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (err) {
      // Handle error
    }
  };
  
  // Component JSX
};
```

### Protected Route

```typescript
// Using the AuthContext to protect routes
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### API Authentication

```typescript
// Using the API service with authentication
import { authAPI } from '../services/api';

const loginUser = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    // Handle successful login
  } catch (error) {
    // Handle error
  }
};
```

## Configuration

The authentication module can be configured through environment variables:

```
# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Password Configuration
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Troubleshooting

Common issues and solutions:

1. **Login Failures**
   - Check that the user exists in the database
   - Verify that the password is correct
   - Ensure the user account is active

2. **Token Issues**
   - Check that the JWT_SECRET is correctly set
   - Verify that the token hasn't expired
   - Ensure the token is being sent in the Authorization header

3. **Permission Issues**
   - Verify that the user has the correct role
   - Check that the role has the necessary permissions
   - Ensure the route is properly protected 