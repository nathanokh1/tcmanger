# TCManager - Test Case Management System
## Technical Specification Document

### 1. System Overview

TCManager is a comprehensive test case management system designed to streamline the testing process for TheWallet application. It provides a centralized platform for managing test cases, executing tests, and analyzing results.

#### 1.1 Purpose
- Centralize test case management
- Track test execution and results
- Provide analytics and reporting
- Integrate with existing Playwright tests
- Support both automated and manual testing

#### 1.2 Target Users
- QA Engineers
- Developers
- Project Managers
- Test Automation Engineers
- Stakeholders

### 2. Technical Architecture

#### 2.1 Frontend Architecture
```typescript
// Core Frontend Structure
src/
├── components/          // Reusable UI components
│   ├── common/         // Shared components
│   ├── testcases/      // Test case related components
│   ├── reports/        // Reporting components
│   └── dashboard/      // Dashboard components
├── features/           // Feature-based modules
│   ├── auth/          // Authentication
│   ├── projects/      // Project management
│   ├── testcases/     // Test case management
│   └── reports/       // Reporting
├── services/          // API services
├── store/             // State management
├── utils/             // Utility functions
└── types/             // TypeScript definitions
```

#### 2.2 Backend Architecture
```typescript
// Core Backend Structure
src/
├── controllers/       // Request handlers
├── models/           // Data models
├── services/         // Business logic
├── routes/           // API routes
├── middleware/       // Custom middleware
├── utils/            // Utility functions
└── types/            // TypeScript definitions
```

### 3. Data Models

#### 3.1 Core Entities

```typescript
// Project Management
interface Project {
  id: string;
  name: string;
  description: string;
  modules: Module[];
  environments: Environment[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface Module {
  id: string;
  projectId: string;
  name: string;
  description: string;
  features: Feature[];
  order: number;
  status: 'Active' | 'Archived';
}

interface Feature {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  testCases: TestCase[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Deprecated';
}

// Test Case Management
interface TestCase {
  id: string;
  featureId: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedResults: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Deprecated';
  tags: string[];
  type: 'Automated' | 'Manual' | 'Hybrid';
  automationScript?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface TestStep {
  id: string;
  testCaseId: string;
  order: number;
  description: string;
  expectedResult: string;
  automationCommand?: string;
}

// Test Execution
interface TestRun {
  id: string;
  projectId: string;
  name: string;
  environment: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  startTime: Date;
  endTime?: Date;
  results: TestResult[];
  triggeredBy: string;
  type: 'Automated' | 'Manual' | 'Scheduled';
}

interface TestResult {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: 'Pass' | 'Fail' | 'Skipped' | 'Blocked';
  duration: number;
  errorMessage?: string;
  screenshots?: string[];
  video?: string;
  executedBy: string;
  executedAt: Date;
  environment: string;
  browser?: string;
  device?: string;
}

// User Management
interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'QA' | 'Developer' | 'Viewer';
  projects: string[];
  settings: UserSettings;
  createdAt: Date;
  lastLogin: Date;
}

interface UserSettings {
  theme: 'Light' | 'Dark';
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}
```

### 4. API Endpoints

#### 4.1 Project Management
```typescript
// Projects
GET    /api/projects              // List all projects
POST   /api/projects              // Create new project
GET    /api/projects/:id          // Get project details
PUT    /api/projects/:id          // Update project
DELETE /api/projects/:id          // Delete project

// Modules
GET    /api/projects/:id/modules           // List modules
POST   /api/projects/:id/modules           // Create module
PUT    /api/projects/:id/modules/:moduleId // Update module
DELETE /api/projects/:id/modules/:moduleId // Delete module

// Features
GET    /api/modules/:id/features           // List features
POST   /api/modules/:id/features           // Create feature
PUT    /api/modules/:id/features/:featureId // Update feature
DELETE /api/modules/:id/features/:featureId // Delete feature
```

#### 4.2 Test Case Management
```typescript
// Test Cases
GET    /api/features/:id/testcases         // List test cases
POST   /api/features/:id/testcases         // Create test case
GET    /api/testcases/:id                  // Get test case details
PUT    /api/testcases/:id                  // Update test case
DELETE /api/testcases/:id                  // Delete test case

// Test Steps
GET    /api/testcases/:id/steps            // List test steps
POST   /api/testcases/:id/steps            // Add test step
PUT    /api/testcases/:id/steps/:stepId    // Update test step
DELETE /api/testcases/:id/steps/:stepId    // Delete test step
```

#### 4.3 Test Execution
```typescript
// Test Runs
GET    /api/projects/:id/runs              // List test runs
POST   /api/projects/:id/runs              // Start test run
GET    /api/runs/:id                       // Get run details
PUT    /api/runs/:id                       // Update run status

// Test Results
GET    /api/runs/:id/results               // List test results
POST   /api/runs/:id/results               // Add test result
PUT    /api/runs/:id/results/:resultId     // Update test result
```

### 5. Integration Points

#### 5.1 Playwright Integration
```typescript
// Test Result Parser
interface PlaywrightTestResult {
  testId: string;
  title: string;
  status: string;
  duration: number;
  error?: string;
  screenshots: string[];
  video?: string;
}

// Integration Service
class PlaywrightIntegrationService {
  parseTestResults(results: PlaywrightTestResult[]): TestResult[];
  generateTestReport(runId: string): TestRunReport;
  syncTestCases(projectId: string): void;
}
```

#### 5.2 CI/CD Integration
```typescript
// CI/CD Webhook Handler
interface CIWebhookPayload {
  projectId: string;
  buildId: string;
  status: string;
  results: PlaywrightTestResult[];
}

// Webhook Service
class CIWebhookService {
  handleTestResults(payload: CIWebhookPayload): Promise<void>;
  updateTestRun(runId: string, results: TestResult[]): Promise<void>;
}
```

### 6. Security Considerations

#### 6.1 Authentication & Authorization
- JWT-based authentication
- Role-based access control
- API key management for CI/CD integration
- Session management
- Rate limiting

#### 6.2 Data Security
- Data encryption at rest
- Secure file storage for screenshots/videos
- Audit logging
- Data backup and recovery

### 7. Performance Requirements

#### 7.1 Response Times
- API endpoints: < 200ms
- Page load: < 2s
- Report generation: < 5s
- Test result processing: < 1s

#### 7.2 Scalability
- Support for 1000+ test cases
- Concurrent test runs: 10+
- File storage: 100GB+
- User sessions: 100+

### 8. Monitoring & Logging

#### 8.1 System Monitoring
- API endpoint performance
- Database query performance
- File storage usage
- User activity metrics

#### 8.2 Error Tracking
- Error logging
- Alert system
- Error reporting
- Debug information

### 9. Deployment Strategy

#### 9.1 Infrastructure
- Docker containers
- Kubernetes orchestration
- MongoDB Atlas for database
- AWS S3 for file storage
- Redis for caching

#### 9.2 CI/CD Pipeline
- Automated testing
- Code quality checks
- Security scanning
- Automated deployment
- Rollback procedures 