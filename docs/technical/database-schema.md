# TCManager Database Schema

## Overview

TCManager uses MongoDB as its database. This document outlines the schema for all collections, including field descriptions, data types, and relationships.

## Collections

### Users

Stores user information and authentication details.

```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  password: string; // Hashed
  name: string;
  role: 'admin' | 'qa' | 'developer' | 'viewer';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `email`: Unique index
- `role`: Index for role-based queries

### Projects

Stores project information.

```typescript
interface IProject {
  _id: ObjectId;
  name: string;
  description: string;
  createdBy: {
    _id: ObjectId;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `name`: Index for name-based queries
- `createdBy._id`: Index for user-based queries

### Modules

Stores module information, linked to projects.

```typescript
interface IModule {
  _id: ObjectId;
  name: string;
  description: string;
  projectId: ObjectId;
  createdBy: {
    _id: ObjectId;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `projectId`: Index for project-based queries
- `name`: Index for name-based queries
- `createdBy._id`: Index for user-based queries

### Features

Stores feature information, linked to modules.

```typescript
interface IFeature {
  _id: ObjectId;
  name: string;
  description: string;
  moduleId: ObjectId;
  status: 'active' | 'inactive' | 'deprecated';
  priority: 'low' | 'medium' | 'high';
  createdBy: {
    _id: ObjectId;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `moduleId`: Index for module-based queries
- `status`: Index for status-based queries
- `priority`: Index for priority-based queries
- `createdBy._id`: Index for user-based queries

### Test Cases

Stores test case information, linked to features.

```typescript
interface ITestCase {
  _id: ObjectId;
  title: string;
  description: string;
  featureId: ObjectId;
  status: 'pending' | 'passed' | 'failed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  steps: {
    order: number;
    description: string;
    expectedResult: string;
  }[];
  createdBy: {
    _id: ObjectId;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `featureId`: Index for feature-based queries
- `status`: Index for status-based queries
- `priority`: Index for priority-based queries
- `createdBy._id`: Index for user-based queries

### Test Results

Stores test execution results.

```typescript
interface ITestResult {
  _id: ObjectId;
  testCaseId: ObjectId;
  status: 'passed' | 'failed' | 'blocked';
  executedBy: {
    _id: ObjectId;
    name: string;
  };
  executedAt: Date;
  duration?: number; // in seconds
  notes?: string;
  screenshots?: {
    name: string;
    url: string;
  }[];
}
```

**Indexes:**
- `testCaseId`: Index for test case-based queries
- `status`: Index for status-based queries
- `executedBy._id`: Index for user-based queries
- `executedAt`: Index for date-based queries

## Relationships

- **Projects** contain multiple **Modules**
- **Modules** contain multiple **Features**
- **Features** contain multiple **Test Cases**
- **Test Cases** have multiple **Test Results**
- **Users** can create Projects, Modules, Features, and Test Cases
- **Users** can execute tests and create Test Results

## Data Validation

### User Validation

- Email must be a valid email format
- Password must be at least 8 characters
- Role must be one of: 'admin', 'qa', 'developer', 'viewer'
- Name must be at least 2 characters

### Project Validation

- Name must be at least 3 characters
- Description is optional

### Module Validation

- Name must be at least 3 characters
- Description is optional
- ProjectId must reference a valid Project

### Feature Validation

- Name must be at least 3 characters
- Description is optional
- ModuleId must reference a valid Module
- Status must be one of: 'active', 'inactive', 'deprecated'
- Priority must be one of: 'low', 'medium', 'high'

### Test Case Validation

- Title must be at least 3 characters
- Description is optional
- FeatureId must reference a valid Feature
- Status must be one of: 'pending', 'passed', 'failed', 'blocked'
- Priority must be one of: 'low', 'medium', 'high'
- Steps must be an array with at least one step
- Each step must have an order, description, and expectedResult

### Test Result Validation

- TestCaseId must reference a valid Test Case
- Status must be one of: 'passed', 'failed', 'blocked'
- ExecutedBy must reference a valid User
- Duration is optional and must be a positive number
- Notes is optional
- Screenshots is optional and must be an array of objects with name and url

## Data Migration

When migrating data, follow these guidelines:

1. Ensure all required fields are present
2. Validate data against the schema
3. Create necessary indexes
4. Update references to maintain relationships
5. Back up data before migration
6. Test migration in a staging environment

## Backup and Recovery

### Backup Strategy

1. **Regular Backups**
   - Full database backup daily
   - Incremental backups hourly

2. **Backup Storage**
   - Store backups in a secure location
   - Retain backups for at least 30 days

### Recovery Process

1. **Identify the Issue**
   - Determine the cause of data loss
   - Assess the extent of the damage

2. **Select the Backup**
   - Choose the most recent backup before the issue
   - Verify the backup integrity

3. **Restore the Data**
   - Stop the application
   - Restore the backup
   - Verify the restored data
   - Restart the application

## Performance Considerations

### Indexing Strategy

1. **Compound Indexes**
   - Create compound indexes for frequently queried field combinations
   - Example: `{ projectId: 1, status: 1 }` for querying test cases by project and status

2. **Covered Queries**
   - Design indexes to support covered queries where possible
   - Include all fields needed in the query result in the index

3. **Index Size**
   - Monitor index size and impact on write performance
   - Remove unused indexes

### Query Optimization

1. **Projection**
   - Use projection to limit returned fields
   - Example: `db.testCases.find({}, { title: 1, status: 1 })`

2. **Limit and Skip**
   - Use limit and skip for pagination
   - Example: `db.testCases.find().skip(20).limit(10)`

3. **Sort**
   - Use indexes for sorting
   - Example: Create an index on `{ createdAt: -1 }` for sorting by creation date

## Security Considerations

### Data Encryption

1. **At Rest**
   - Enable MongoDB encryption at rest
   - Use a secure key management system

2. **In Transit**
   - Use TLS/SSL for all database connections
   - Configure MongoDB to require TLS/SSL

### Access Control

1. **Role-Based Access**
   - Create database users with minimal required permissions
   - Use role-based access control (RBAC)

2. **Network Security**
   - Restrict database access to specific IP addresses
   - Use a firewall to protect the database server

## Monitoring

### Performance Monitoring

1. **Query Performance**
   - Monitor slow queries
   - Optimize queries based on performance data

2. **Resource Usage**
   - Monitor CPU, memory, and disk usage
   - Scale resources based on usage patterns

### Health Checks

1. **Database Health**
   - Monitor database connectivity
   - Check for replication lag

2. **Application Health**
   - Monitor application connectivity to the database
   - Check for connection pool issues 