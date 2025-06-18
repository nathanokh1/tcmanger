import mongoose, { Document, Schema } from 'mongoose';

// Feature Interface
export interface IFeature extends Document {
  name: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  status: 'Active' | 'Deprecated' | 'Archived';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  requirements: {
    id: string;
    description: string;
    type: 'Functional' | 'Non-Functional' | 'Business';
  }[];
  effortEstimate: number; // Story points or hours
  tags: string[];
  testCases: string[]; // Array of TestCase IDs
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
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
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
  status: {
    type: String,
    enum: ['Active', 'Deprecated', 'Archived'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  requirements: [{
    id: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Functional', 'Non-Functional', 'Business'],
      default: 'Functional'
    }
  }],
  effortEstimate: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [String],
  testCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase'
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
FeatureSchema.index({ projectId: 1 });
FeatureSchema.index({ moduleId: 1 });
FeatureSchema.index({ status: 1 });
FeatureSchema.index({ priority: 1 });
FeatureSchema.index({ createdAt: -1 });

// Virtual for test case count
FeatureSchema.virtual('testCaseCount').get(function() {
  return this.testCases.length;
});

// Compound unique index for name within module
FeatureSchema.index({ moduleId: 1, name: 1 }, { unique: true });

export const Feature = mongoose.model<IFeature>('Feature', FeatureSchema); 