import mongoose, { Document, Schema } from 'mongoose';

// Feature Interface
export interface IFeature extends Document {
  name: string;
  description: string;
  moduleId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId; // For easier querying
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Deprecated' | 'Archived';
  testCases: string[]; // Array of TestCase IDs
  requirements: {
    id: string;
    title: string;
    source: 'Jira' | 'ServiceNow' | 'Manual';
    url?: string;
  }[];
  tags: string[];
  estimatedEffort: number; // In hours
  actualEffort?: number; // In hours
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

// Feature Schema
const FeatureSchema = new Schema<IFeature>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
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
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Active', 'Deprecated', 'Archived'],
    default: 'Active'
  },
  testCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase'
  }],
  requirements: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    source: {
      type: String,
      enum: ['Jira', 'ServiceNow', 'Manual'],
      required: true
    },
    url: String
  }],
  tags: [String],
  estimatedEffort: {
    type: Number,
    min: 0,
    default: 0
  },
  actualEffort: {
    type: Number,
    min: 0
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

// Indexes for performance
FeatureSchema.index({ moduleId: 1 });
FeatureSchema.index({ projectId: 1 });
FeatureSchema.index({ priority: 1 });
FeatureSchema.index({ status: 1 });
FeatureSchema.index({ createdAt: -1 });

// Virtual for test case count
FeatureSchema.virtual('testCaseCount').get(function() {
  return this.testCases.length;
});

// Virtual for completion percentage
FeatureSchema.virtual('completionPercentage').get(function() {
  if (this.estimatedEffort === 0) return 0;
  return Math.round(((this.actualEffort || 0) / this.estimatedEffort) * 100);
});

// Compound unique index for name within module
FeatureSchema.index({ moduleId: 1, name: 1 }, { unique: true });

export const Feature = mongoose.model<IFeature>('Feature', FeatureSchema); 