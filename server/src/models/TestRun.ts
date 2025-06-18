import mongoose, { Document, Schema } from 'mongoose';

// Test Result Interface
export interface ITestResult extends Document {
  testRunId: mongoose.Types.ObjectId;
  testCaseId: mongoose.Types.ObjectId;
  status: 'Pass' | 'Fail' | 'Blocked' | 'Skipped' | 'In Progress';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  environment: string;
  browser?: string;
  device?: string;
  executedBy: mongoose.Types.ObjectId;
  automationType: 'Manual' | 'Automated';
  
  // Execution details
  steps: {
    stepOrder: number;
    status: 'Pass' | 'Fail' | 'Blocked' | 'Skipped';
    actualResult?: string;
    startTime: Date;
    endTime?: Date;
    screenshots?: string[];
    errorMessage?: string;
  }[];
  
  // Artifacts
  screenshots: string[];
  videos?: string[];
  logs?: string;
  errorMessage?: string;
  stackTrace?: string;
  
  // Metadata
  retryCount: number;
  isFlaky: boolean;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Test Run Interface
export interface ITestRun extends Document {
  runId: string; // Auto-generated unique ID (e.g., RUN-001)
  name: string;
  description?: string;
  projectId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  featureId?: mongoose.Types.ObjectId;
  
  // Run configuration
  environment: string;
  browser?: string;
  device?: string;
  platform?: string;
  
  // Execution details
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Failed' | 'Cancelled' | 'Paused';
  type: 'Manual' | 'Automated' | 'Scheduled' | 'CI/CD';
  priority: 'High' | 'Medium' | 'Low';
  
  // Timing
  scheduledFor?: Date;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  
  // Test cases and results
  testCases: mongoose.Types.ObjectId[];
  results: mongoose.Types.ObjectId[];
  
  // Statistics (calculated virtuals)
  totalTests: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  skippedTests: number;
  
  // Execution context
  triggeredBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  
  // CI/CD Integration
  cicdInfo?: {
    pipeline: string;
    buildNumber: string;
    commitHash: string;
    branch: string;
    repository: string;
  };
  
  // Notifications
  notifyOnCompletion: boolean;
  notifyOnFailure: boolean;
  notificationChannels: string[]; // email, slack, teams, etc.
  
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

// Test Result Schema
const TestResultSchema = new Schema<ITestResult>({
  testRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRun',
    required: true,
    index: true
  },
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail', 'Blocked', 'Skipped', 'In Progress'],
    default: 'In Progress'
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: Date,
  duration: Number,
  environment: {
    type: String,
    required: true
  },
  browser: String,
  device: String,
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  automationType: {
    type: String,
    enum: ['Manual', 'Automated'],
    required: true
  },
  steps: [{
    stepOrder: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Blocked', 'Skipped'],
      required: true
    },
    actualResult: String,
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    screenshots: [String],
    errorMessage: String
  }],
  screenshots: [String],
  videos: [String],
  logs: String,
  errorMessage: String,
  stackTrace: String,
  retryCount: {
    type: Number,
    default: 0
  },
  isFlaky: {
    type: Boolean,
    default: false
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Test Run Schema
const TestRunSchema = new Schema<ITestRun>({
  runId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  featureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature'
  },
  environment: {
    type: String,
    required: true
  },
  browser: String,
  device: String,
  platform: String,
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Failed', 'Cancelled', 'Paused'],
    default: 'Scheduled'
  },
  type: {
    type: String,
    enum: ['Manual', 'Automated', 'Scheduled', 'CI/CD'],
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  scheduledFor: Date,
  startTime: Date,
  endTime: Date,
  estimatedDuration: Number,
  actualDuration: Number,
  testCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase'
  }],
  results: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestResult'
  }],
  totalTests: {
    type: Number,
    default: 0
  },
  passedTests: {
    type: Number,
    default: 0
  },
  failedTests: {
    type: Number,
    default: 0
  },
  blockedTests: {
    type: Number,
    default: 0
  },
  skippedTests: {
    type: Number,
    default: 0
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cicdInfo: {
    pipeline: String,
    buildNumber: String,
    commitHash: String,
    branch: String,
    repository: String
  },
  notifyOnCompletion: {
    type: Boolean,
    default: true
  },
  notifyOnFailure: {
    type: Boolean,
    default: true
  },
  notificationChannels: [String],
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
TestResultSchema.index({ testRunId: 1, status: 1 });
TestResultSchema.index({ testCaseId: 1 });
TestResultSchema.index({ executedBy: 1 });
TestResultSchema.index({ startTime: -1 });

TestRunSchema.index({ projectId: 1, status: 1 });
TestRunSchema.index({ triggeredBy: 1 });
TestRunSchema.index({ startTime: -1 });
TestRunSchema.index({ type: 1 });

// Virtuals for TestRun
TestRunSchema.virtual('passRate').get(function() {
  if (this.totalTests === 0) return 0;
  return Math.round((this.passedTests / this.totalTests) * 100);
});

TestRunSchema.virtual('progressPercentage').get(function() {
  if (this.totalTests === 0) return 0;
  const completedTests = this.passedTests + this.failedTests + this.blockedTests + this.skippedTests;
  return Math.round((completedTests / this.totalTests) * 100);
});

// Pre-save middleware to generate runId
TestRunSchema.pre('save', async function(next) {
  if (!this.runId) {
    // Generate unique run ID
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the last run ID for today
    const lastRun = await mongoose.model('TestRun')
      .findOne({ runId: new RegExp(`^RUN-${datePrefix}`) })
      .sort({ runId: -1 })
      .select('runId');
    
    let nextNumber = 1;
    if (lastRun && lastRun.runId) {
      const match = lastRun.runId.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    this.runId = `RUN-${datePrefix}-${nextNumber.toString().padStart(3, '0')}`;
  }
  
  // Update total tests count
  if (this.testCases) {
    this.totalTests = this.testCases.length;
  }
  
  next();
});

// Calculate duration on result save
TestResultSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = this.endTime.getTime() - this.startTime.getTime();
  }
  next();
});

export const TestResult = mongoose.model<ITestResult>('TestResult', TestResultSchema);
export const TestRun = mongoose.model<ITestRun>('TestRun', TestRunSchema); 