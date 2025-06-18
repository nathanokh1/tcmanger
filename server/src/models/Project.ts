import mongoose, { Document, Schema } from 'mongoose';

// Project Settings Interface
interface ProjectSettings {
  defaultEnvironment: string;
  allowedEnvironments: string[];
  testCasePrefix: string;
  requiresApproval: boolean;
  automationEnabled: boolean;
  integrations: {
    jira?: {
      enabled: boolean;
      projectKey: string;
      serverUrl: string;
      credentials?: string;
    };
    testRail?: {
      enabled: boolean;
      projectId: string;
      serverUrl: string;
      credentials?: string;
    };
    serviceNow?: {
      enabled: boolean;
      instance: string;
      credentials?: string;
    };
  };
}

// Project Interface
export interface IProject extends Document {
  name: string;
  description: string;
  key: string; // Unique project key (e.g., 'ECOM' for E-Commerce)
  status: 'Active' | 'Inactive' | 'Archived';
  visibility: 'Public' | 'Private';
  settings: ProjectSettings;
  modules: string[]; // Array of Module IDs
  environments: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  teamMembers: {
    userId: mongoose.Types.ObjectId;
    role: 'Owner' | 'Admin' | 'Developer' | 'Tester' | 'Viewer';
    joinedAt: Date;
  }[];
}

// Project Schema
const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: /^[A-Z]{2,10}$/
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
  },
  settings: {
    defaultEnvironment: {
      type: String,
      default: 'Development'
    },
    allowedEnvironments: {
      type: [String],
      default: ['Development', 'Testing', 'Staging', 'Production']
    },
    testCasePrefix: {
      type: String,
      default: 'TC'
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    automationEnabled: {
      type: Boolean,
      default: true
    },
    integrations: {
      jira: {
        enabled: { type: Boolean, default: false },
        projectKey: String,
        serverUrl: String,
        credentials: String
      },
      testRail: {
        enabled: { type: Boolean, default: false },
        projectId: String,
        serverUrl: String,
        credentials: String
      },
      serviceNow: {
        enabled: { type: Boolean, default: false },
        instance: String,
        credentials: String
      }
    }
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  environments: {
    type: [String],
    default: ['Development', 'Testing', 'Staging', 'Production']
  },
  tags: [String],
  teamMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Developer', 'Tester', 'Viewer'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
ProjectSchema.index({ key: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ 'teamMembers.userId': 1 });
ProjectSchema.index({ createdAt: -1 });

// Virtual for module count
ProjectSchema.virtual('moduleCount').get(function() {
  return this.modules.length;
});

// Pre-save middleware to update the updatedBy field
ProjectSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema); 