import mongoose, { Document, Schema } from 'mongoose';

// Module Interface
export interface IModule extends Document {
  name: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  status: 'Active' | 'Deprecated' | 'Archived';
  order: number; // For display ordering
  features: string[]; // Array of Feature IDs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

// Module Schema
const ModuleSchema = new Schema<IModule>({
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
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Active', 'Deprecated', 'Archived'],
    default: 'Active'
  },
  order: {
    type: Number,
    default: 0
  },
  features: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature'
  }],
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
ModuleSchema.index({ projectId: 1, order: 1 });
ModuleSchema.index({ status: 1 });
ModuleSchema.index({ createdAt: -1 });

// Virtual for feature count
ModuleSchema.virtual('featureCount').get(function() {
  return this.features.length;
});

// Compound unique index for name within project
ModuleSchema.index({ projectId: 1, name: 1 }, { unique: true });

export const Module = mongoose.model<IModule>('Module', ModuleSchema); 