import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type JobStage =
  | 'uploading'
  | 'analyzing'
  | 'generating_narrative'
  | 'creating_visualizations';

export interface IJobOptions {
  audienceLevel?: string;
}

export interface IJobError {
  code: string;
  message: string;
  timestamp: Date;
}

export interface IJobMetadata {
  originalFilename?: string;
  storageKey?: string;
  fileSize?: number;
  rowCount?: number;
  columnCount?: number;
}

export interface IJob extends Document {
  jobId: string;
  userId: Types.ObjectId;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  currentStage: JobStage;
  progress: number;
  fileUrl: string;
  options: IJobOptions;
  storyId?: Types.ObjectId;
  error?: IJobError;
  attempts: number;
  maxAttempts: number;
  metadata?: IJobMetadata;
  
  // Instance methods
  updateProgress(stage: JobStage, progress: number): void;
  markAsFailed(errorCode: string, errorMessage: string): void;
  canRetry(): boolean;
}

const JobSchema = new Schema<IJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    currentStage: {
      type: String,
      enum: [
        'uploading',
        'analyzing',
        'generating_narrative',
        'creating_visualizations',
      ],
      default: 'uploading',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    options: {
      audienceLevel: {
        type: String,
        enum: ['executive', 'technical', 'general'],
      },
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
    },
    error: {
      code: String,
      message: String,
      timestamp: Date,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    metadata: {
      originalFilename: String,
      storageKey: String,
      fileSize: Number,
      rowCount: Number,
      columnCount: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
JobSchema.index({ jobId: 1 });
JobSchema.index({ userId: 1, createdAt: -1 });
JobSchema.index({ status: 1, createdAt: -1 });

// Method to update job progress
JobSchema.methods.updateProgress = function (
  stage: JobStage,
  progress: number
): void {
  this.currentStage = stage;
  this.progress = Math.min(100, Math.max(0, progress));
  this.status = progress >= 100 ? 'completed' : 'processing';
};

// Method to mark job as failed
JobSchema.methods.markAsFailed = function (
  errorCode: string,
  errorMessage: string
): void {
  this.status = 'failed';
  this.error = {
    code: errorCode,
    message: errorMessage,
    timestamp: new Date(),
  };
};

// Method to check if job can be retried
JobSchema.methods.canRetry = function (): boolean {
  return this.attempts < this.maxAttempts;
};

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
