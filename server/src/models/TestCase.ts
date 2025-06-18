import mongoose, { Document, Schema } from 'mongoose';

// Test Step Interface
interface ITestStep {
  order: number;
  description: string;
  expectedResult: string;
  automationCommand?: string;
  attachments?: string[];
}

// Test Case Interface
export interface ITestCase extends Document {
  testCaseId: string; // Auto-generated unique ID (e.g., TC-001)
  title: string;
  description: string;
  featureId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'Functional' | 'Integration' | 'Performance' | 'Security' | 'UI' | 'API' | 'E2E';
  status: 'Draft' | 'Active' | 'Deprecated' | 'Under Review' | 'Approved';
  automationType: 'Manual' | 'Automated' | 'Semi-Automated';
  
  // TestRail-style test structure
  preconditions: string;
  steps: ITestStep[];
  expectedResults: string[];
  
  // Jira-style linking
  linkedItems: {
    type: 'Requirement' | 'Defect' | 'Story' | 'Epic';
    id: string;
    title: string;
    url?: string;
    source: 'Jira' | 'ServiceNow' | 'Manual';
  }[];
  
  // ServiceNow-style workflow
  approvalHistory: {
    action: 'Submitted' | 'Approved' | 'Rejected' | 'Updated';
    userId: mongoose.Types.ObjectId;
    comment?: string;
    timestamp: Date;
  }[];
  
  // Automation details
  automationScript?: {
    framework: 'Playwright' | 'Selenium' | 'Cypress' | 'Jest' | 'Custom';
    scriptPath: string;
    repository: string;
    branch: string;
    lastUpdated: Date;
  };
  
  // Execution tracking
  lastExecutionResult?: {
    status: 'Pass' | 'Fail' | 'Blocked' | 'Skipped';
    executedBy: mongoose.Types.ObjectId;
    executedAt: Date;
    environment: string;
    duration?: number; // in milliseconds
    screenshots?: string[];
    logs?: string;
  };
  
  // Metadata
  tags: string[];
  estimatedDuration: number; // in minutes
  complexity: 'Simple' | 'Medium' | 'Complex';
  assignedTo?: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

// Test Step Schema
const TestStepSchema = new Schema<ITestStep>({
  order: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  expectedResult: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  automationCommand: {
    type: String,
    trim: true
  },
  attachments: [String]
}, { _id: false });

// Test Case Schema
const TestCaseSchema = new Schema<ITestCase>({
  testCaseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  featureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature',
    required: true,
    index: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  type: {
    type: String,
    enum: ['Functional', 'Integration', 'Performance', 'Security', 'UI', 'API', 'E2E'],
    default: 'Functional'
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Deprecated', 'Under Review', 'Approved'],
    default: 'Draft'
  },
  automationType: {
    type: String,
    enum: ['Manual', 'Automated', 'Semi-Automated'],
    default: 'Manual'
  },
  preconditions: {
    type: String,
    trim: true
  },
  steps: [TestStepSchema],
  expectedResults: [String],
  linkedItems: [{
    type: {
      type: String,
      enum: ['Requirement', 'Defect', 'Story', 'Epic'],
      required: true
    },
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    url: String,
    source: {
      type: String,
      enum: ['Jira', 'ServiceNow', 'Manual'],
      required: true
    }
  }],
  approvalHistory: [{
    action: {
      type: String,
      enum: ['Submitted', 'Approved', 'Rejected', 'Updated'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  automationScript: {
    framework: {
      type: String,
      enum: ['Playwright', 'Selenium', 'Cypress', 'Jest', 'Custom']
    },
    scriptPath: String,
    repository: String,
    branch: String,
    lastUpdated: Date
  },
  lastExecutionResult: {
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Blocked', 'Skipped']
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    executedAt: Date,
    environment: String,
    duration: Number,
    screenshots: [String],
    logs: String
  },
  tags: [String],
  estimatedDuration: {
    type: Number,
    min: 0,
    default: 5 // 5 minutes default
  },
  complexity: {
    type: String,
    enum: ['Simple', 'Medium', 'Complex'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
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
TestCaseSchema.index({ testCaseId: 1 });
TestCaseSchema.index({ projectId: 1, status: 1 });
TestCaseSchema.index({ featureId: 1 });
TestCaseSchema.index({ assignedTo: 1 });
TestCaseSchema.index({ priority: 1 });
TestCaseSchema.index({ automationType: 1 });
TestCaseSchema.index({ createdAt: -1 });

// Text index for search
TestCaseSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for step count
TestCaseSchema.virtual('stepCount').get(function() {
  return this.steps.length;
});

// Virtual for automation percentage
TestCaseSchema.virtual('automationPercentage').get(function() {
  if (this.steps.length === 0) return 0;
  const automatedSteps = this.steps.filter(step => step.automationCommand).length;
  return Math.round((automatedSteps / this.steps.length) * 100);
});

// Pre-save middleware to generate testCaseId
TestCaseSchema.pre('save', async function(next) {
  if (!this.testCaseId) {
    // Get project to use its prefix
    const project = await mongoose.model('Project').findById(this.projectId);
    const prefix = project?.settings?.testCasePrefix || 'TC';
    
    // Find the last test case ID for this project
    const lastTestCase = await mongoose.model('TestCase')
      .findOne({ projectId: this.projectId })
      .sort({ testCaseId: -1 })
      .select('testCaseId');
    
    let nextNumber = 1;
    if (lastTestCase && lastTestCase.testCaseId) {
      const match = lastTestCase.testCaseId.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    this.testCaseId = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }
  next();
});

export const TestCase = mongoose.model<ITestCase>('TestCase', TestCaseSchema); 