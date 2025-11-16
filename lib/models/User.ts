import mongoose, { Schema, Document, Model } from 'mongoose';
import { getTierLimits, shouldResetUsage, getNextResetDate, type UserTier } from '../tier-config';

export type { UserTier };
export type AudienceLevel = 'executive' | 'technical' | 'general';

export interface IUserPreferences {
  defaultAudienceLevel: AudienceLevel;
  emailNotifications: boolean;
}

export interface IUserLimits {
  storiesPerMonth: number;
  maxDatasetRows: number;
  teamMembers: number;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  tier: UserTier;
  createdAt: Date;
  lastLoginAt: Date;
  storiesThisMonth: number;
  monthlyResetDate: Date;
  totalStoriesCreated: number;
  preferences: IUserPreferences;
  limits: IUserLimits;
  chartConfiguration?: Record<string, unknown>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  
  // Instance methods
  canCreateStory(): boolean;
  resetMonthlyUsage(): void;
  checkAndResetUsage(): void;
  incrementStoryCount(): void;
}

export interface IUserModel extends Model<IUser> {
  getTierLimits(tier: UserTier): IUserLimits;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ['free', 'professional', 'business', 'enterprise'],
      default: 'free',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    storiesThisMonth: {
      type: Number,
      default: 0,
    },
    monthlyResetDate: {
      type: Date,
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      },
    },
    totalStoriesCreated: {
      type: Number,
      default: 0,
    },
    preferences: {
      defaultAudienceLevel: {
        type: String,
        enum: ['executive', 'technical', 'general'],
        default: 'general',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
    limits: {
      storiesPerMonth: {
        type: Number,
        default: 3, // Free tier default
      },
      maxDatasetRows: {
        type: Number,
        default: 1000, // Free tier default
      },
      teamMembers: {
        type: Number,
        default: 1,
      },
    },
    chartConfiguration: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ tier: 1 });

// Pre-save hook to update limits when tier changes
UserSchema.pre('save', function (next) {
  if (this.isModified('tier')) {
    const tierLimits = getTierLimits(this.tier);
    this.limits = tierLimits;
  }
  next();
});

// Method to check if user can create more stories
UserSchema.methods.canCreateStory = function (): boolean {
  if (this.limits.storiesPerMonth === -1) {
    return true;
  }
  return this.storiesThisMonth < this.limits.storiesPerMonth;
};

// Method to reset monthly usage
UserSchema.methods.resetMonthlyUsage = function (): void {
  this.storiesThisMonth = 0;
  this.monthlyResetDate = getNextResetDate();
};

// Method to check and reset usage if needed
UserSchema.methods.checkAndResetUsage = function (): void {
  if (shouldResetUsage(this.monthlyResetDate)) {
    this.resetMonthlyUsage();
  }
};

// Method to increment story count
UserSchema.methods.incrementStoryCount = function (): void {
  this.storiesThisMonth += 1;
  this.totalStoriesCreated += 1;
};

// Static method to get tier limits (uses tier-config)
UserSchema.statics.getTierLimits = function (tier: UserTier): IUserLimits {
  return getTierLimits(tier);
};

const User: IUserModel =
  (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
