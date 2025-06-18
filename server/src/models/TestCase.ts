import mongoose, { Document, Schema } from 'mongoose';

// Test Step Interface
interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  attachments?: string[];
}

// Automation Script Interface
interface AutomationScript {
  framework: 'Playwright' | 'Selenium' | 'Cypress' | 'Jest' | 'Other';
  language: 'JavaScript' | 'TypeScript' | 'Python' | 'Java' | 'C#';
  script: string;
  version: string;
  lastModified: Date;
  modifiedBy: mongoose.Types.ObjectId;
}

// Test Case Interface
export interface ITestCase extends Document {
  title: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  featureId?: mongoose.Types.ObjectId;
  type: 'Functional' | 'Integration' | 'Unit' | 'E2E' | 'Performance' | 'Security' | 'Accessibility';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Active' | 'Deprecated' | 'Archived';
  complexity: 'Low' | 'Medium' | 'High';
  estimatedDuration: number; // In minutes
  preconditions: string[];
  steps: TestStep[];
  postconditions: string[];
  tags: string[];
  linkedRequirements: {
    id: string;
    title: string;
    source: 'Jira' | 'ServiceNow' | 'Manual';
    url?: string;
  }[];
  linkedDefects: {
    id: string;
    title: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    source: 'Jira' | 'ServiceNow' | 'Manual';
    url?: string;
  }[];
  automationScript?: AutomationScript;
  approvalHistory: {
    action: 'Submitted' | 'Approved' | 'Rejected' | 'Updated';
    by: mongoose.Types.ObjectId;
    timestamp: Date;
    comments?: string;
  }[];
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

// Test Case Schema
const TestCaseSchema = new Schema<ITestCase>({
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
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  featureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature'
  },
  type: {
    type: String,
    enum: ['Functional', 'Integration', 'Unit', 'E2E', 'Performance', 'Security', 'Accessibility'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Deprecated', 'Archived'],
    default: 'Draft'
  },
  complexity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  estimatedDuration: {
    type: Number,
    default: 15,
    min: 1
  },
  preconditions: [String],
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      required: true,
      maxlength: 500
    },
    expectedResult: {
      type: String,
      required: true,
      maxlength: 500
    },
    attachments: [String]
  }],
  postconditions: [String],
  tags: [String],
  linkedRequirements: [{
    id: String,
    title: String,
    source: {
      type: String,
      enum: ['Jira', 'ServiceNow', 'Manual']
    },
    url: String
  }],
  linkedDefects: [{
    id: String,
    title: String,
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed']
    },
    source: {
      type: String,
      enum: ['Jira', 'ServiceNow', 'Manual']
    },
    url: String
  }],
  automationScript: {
    framework: {
      type: String,
      enum: ['Playwright', 'Selenium', 'Cypress', 'Jest', 'Other']
    },
    language: {
      type: String,
      enum: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#']
    },
    script: String,
    version: String,
    lastModified: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  approvalHistory: [{
    action: {
      type: String,
      enum: ['Submitted', 'Approved', 'Rejected', 'Updated'],
      required: true
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    comments: String
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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

// Indexes for performance (removed duplicates to fix mongoose warnings)
TestCaseSchema.index({ projectId: 1 });
TestCaseSchema.index({ moduleId: 1 });
TestCaseSchema.index({ featureId: 1 });
TestCaseSchema.index({ type: 1 });
TestCaseSchema.index({ priority: 1 });
TestCaseSchema.index({ status: 1 });
TestCaseSchema.index({ assignedTo: 1 });
TestCaseSchema.index({ createdAt: -1 });

// Virtual for automation status
TestCaseSchema.virtual('isAutomated').get(function() {
  return !!this.automationScript;
});

// Virtual for approval status
TestCaseSchema.virtual('approvalStatus').get(function() {
  if (this.approvalHistory.length === 0) return 'Not Submitted';
  
  const lastApproval = this.approvalHistory[this.approvalHistory.length - 1];
  return lastApproval?.action || 'Not Submitted';
});

export const TestCase = mongoose.model<ITestCase>('TestCase', TestCaseSchema); 