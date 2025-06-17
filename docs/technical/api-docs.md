# TCManager API Documentation

## Overview

The TCManager API provides endpoints for managing test cases, projects, modules, and user authentication. This document outlines all available endpoints, request/response formats, and authentication requirements.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "name": "Test User",
      "role": "admin"
    }
  },
  "status": 200,
  "message": "Login successful"
}
```

#### Register

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c86",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "viewer"
  },
  "status": 201,
  "message": "User registered successfully"
}
```

## Projects

### Get All Projects

```
GET /projects
```

**Response:**
```json
{
  "data": [
    {
      "id": "60d21b4667d0d8992e610c87",
      "name": "Project 1",
      "description": "Description of Project 1",
      "createdBy": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Test User"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "status": 200,
  "message": "Projects retrieved successfully"
}
```

### Get Project by ID

```
GET /projects/:id
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c87",
    "name": "Project 1",
    "description": "Description of Project 1",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 200,
  "message": "Project retrieved successfully"
}
```

### Create Project

```
POST /projects
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Description of the new project"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c88",
    "name": "New Project",
    "description": "Description of the new project",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 201,
  "message": "Project created successfully"
}
```

### Update Project

```
PUT /projects/:id
```

**Request Body:**
```json
{
  "name": "Updated Project",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c87",
    "name": "Updated Project",
    "description": "Updated description",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "status": 200,
  "message": "Project updated successfully"
}
```

### Delete Project

```
DELETE /projects/:id
```

**Response:**
```json
{
  "data": null,
  "status": 200,
  "message": "Project deleted successfully"
}
```

## Modules

### Get All Modules

```
GET /modules
```

**Query Parameters:**
- `projectId`: Filter modules by project ID

**Response:**
```json
{
  "data": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "name": "Module 1",
      "description": "Description of Module 1",
      "projectId": "60d21b4667d0d8992e610c87",
      "createdBy": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Test User"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "status": 200,
  "message": "Modules retrieved successfully"
}
```

### Get Module by ID

```
GET /modules/:id
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c89",
    "name": "Module 1",
    "description": "Description of Module 1",
    "projectId": "60d21b4667d0d8992e610c87",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 200,
  "message": "Module retrieved successfully"
}
```

### Create Module

```
POST /modules
```

**Request Body:**
```json
{
  "name": "New Module",
  "description": "Description of the new module",
  "projectId": "60d21b4667d0d8992e610c87"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c90",
    "name": "New Module",
    "description": "Description of the new module",
    "projectId": "60d21b4667d0d8992e610c87",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 201,
  "message": "Module created successfully"
}
```

### Update Module

```
PUT /modules/:id
```

**Request Body:**
```json
{
  "name": "Updated Module",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c89",
    "name": "Updated Module",
    "description": "Updated description",
    "projectId": "60d21b4667d0d8992e610c87",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "status": 200,
  "message": "Module updated successfully"
}
```

### Delete Module

```
DELETE /modules/:id
```

**Response:**
```json
{
  "data": null,
  "status": 200,
  "message": "Module deleted successfully"
}
```

## Features

### Get All Features

```
GET /features
```

**Query Parameters:**
- `moduleId`: Filter features by module ID

**Response:**
```json
{
  "data": [
    {
      "id": "60d21b4667d0d8992e610c91",
      "name": "Feature 1",
      "description": "Description of Feature 1",
      "moduleId": "60d21b4667d0d8992e610c89",
      "status": "active",
      "priority": "high",
      "createdBy": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Test User"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "status": 200,
  "message": "Features retrieved successfully"
}
```

### Get Feature by ID

```
GET /features/:id
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c91",
    "name": "Feature 1",
    "description": "Description of Feature 1",
    "moduleId": "60d21b4667d0d8992e610c89",
    "status": "active",
    "priority": "high",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 200,
  "message": "Feature retrieved successfully"
}
```

### Create Feature

```
POST /features
```

**Request Body:**
```json
{
  "name": "New Feature",
  "description": "Description of the new feature",
  "moduleId": "60d21b4667d0d8992e610c89",
  "status": "active",
  "priority": "medium"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c92",
    "name": "New Feature",
    "description": "Description of the new feature",
    "moduleId": "60d21b4667d0d8992e610c89",
    "status": "active",
    "priority": "medium",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 201,
  "message": "Feature created successfully"
}
```

### Update Feature

```
PUT /features/:id
```

**Request Body:**
```json
{
  "name": "Updated Feature",
  "description": "Updated description",
  "status": "inactive",
  "priority": "low"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c91",
    "name": "Updated Feature",
    "description": "Updated description",
    "moduleId": "60d21b4667d0d8992e610c89",
    "status": "inactive",
    "priority": "low",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "status": 200,
  "message": "Feature updated successfully"
}
```

### Delete Feature

```
DELETE /features/:id
```

**Response:**
```json
{
  "data": null,
  "status": 200,
  "message": "Feature deleted successfully"
}
```

## Test Cases

### Get All Test Cases

```
GET /test-cases
```

**Query Parameters:**
- `featureId`: Filter test cases by feature ID
- `status`: Filter by status (passed, failed, blocked)

**Response:**
```json
{
  "data": [
    {
      "id": "60d21b4667d0d8992e610c93",
      "title": "Test Case 1",
      "description": "Description of Test Case 1",
      "featureId": "60d21b4667d0d8992e610c91",
      "status": "passed",
      "priority": "high",
      "createdBy": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Test User"
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "status": 200,
  "message": "Test cases retrieved successfully"
}
```

### Get Test Case by ID

```
GET /test-cases/:id
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c93",
    "title": "Test Case 1",
    "description": "Description of Test Case 1",
    "featureId": "60d21b4667d0d8992e610c91",
    "status": "passed",
    "priority": "high",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 200,
  "message": "Test case retrieved successfully"
}
```

### Create Test Case

```
POST /test-cases
```

**Request Body:**
```json
{
  "title": "New Test Case",
  "description": "Description of the new test case",
  "featureId": "60d21b4667d0d8992e610c91",
  "status": "pending",
  "priority": "medium"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c94",
    "title": "New Test Case",
    "description": "Description of the new test case",
    "featureId": "60d21b4667d0d8992e610c91",
    "status": "pending",
    "priority": "medium",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 201,
  "message": "Test case created successfully"
}
```

### Update Test Case

```
PUT /test-cases/:id
```

**Request Body:**
```json
{
  "title": "Updated Test Case",
  "description": "Updated description",
  "status": "failed",
  "priority": "low"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c93",
    "title": "Updated Test Case",
    "description": "Updated description",
    "featureId": "60d21b4667d0d8992e610c91",
    "status": "failed",
    "priority": "low",
    "createdBy": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Test User"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "status": 200,
  "message": "Test case updated successfully"
}
```

### Delete Test Case

```
DELETE /test-cases/:id
```

**Response:**
```json
{
  "data": null,
  "status": 200,
  "message": "Test case deleted successfully"
}
```

## Users

### Get All Users

```
GET /users
```

**Response:**
```json
{
  "data": [
    {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "name": "Test User",
      "role": "admin",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "status": 200,
  "message": "Users retrieved successfully"
}
```

### Get User by ID

```
GET /users/:id
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "name": "Test User",
    "role": "admin",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "status": 200,
  "message": "User retrieved successfully"
}
```

### Update User

```
PUT /users/:id
```

**Request Body:**
```json
{
  "name": "Updated User",
  "role": "qa"
}
```

**Response:**
```json
{
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "name": "Updated User",
    "role": "qa",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "status": 200,
  "message": "User updated successfully"
}
```

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "data": null,
  "status": 400,
  "message": "Error message describing the issue"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 