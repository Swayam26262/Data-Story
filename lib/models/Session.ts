import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  userAgent: string;
  ipAddress: string;
  rememberMe: boolean;
  
  // Instance methods
  isExpired(): boolean;
  updateActivity(): void;
}

export interface ISessionModel extends Model<ISession> {
  cleanupExpired(): Promise<number>;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
SessionSchema.index({ token: 1 });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expiresAt: 1 }); // For TTL cleanup

// Method to check if session is expired
SessionSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

// Method to update last activity
SessionSchema.methods.updateActivity = function (): void {
  this.lastActivityAt = new Date();
};

// Static method to cleanup expired sessions
SessionSchema.statics.cleanupExpired = async function (): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount || 0;
};

const Session: ISessionModel =
  (mongoose.models.Session as ISessionModel) || mongoose.model<ISession, ISessionModel>('Session', SessionSchema);

export default Session;
