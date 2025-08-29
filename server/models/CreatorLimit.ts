import mongoose, { Document, Schema } from 'mongoose';

// Interface for CreatorLimit document
interface ICreatorLimit extends Document {
  creatorId: string;
  creatorName: string;
  storageLimit: number; // Storage limit in bytes (default 100GB)
  storageUsed: number; // Current storage used in bytes
  videoCountLimit: number; // Maximum number of videos
  videoCount: number; // Current number of videos
  graceMonthsLeft: number; // Grace period remaining (default 3 months)
  graceStartDate: Date; // When grace period started
  isGracePeriod: boolean; // Whether creator is still in grace period
  commissionRate: number; // Commission rate after grace period (default 30%)
  totalRevenue: number; // Total revenue generated
  totalViews: number; // Total views across all videos
  lastUploadAt?: Date; // Last video upload timestamp
  restrictions: {
    canUpload: boolean;
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// CreatorLimit schema
const CreatorLimitSchema = new Schema<ICreatorLimit>({
  creatorId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  creatorName: {
    type: String,
    required: true
  },
  storageLimit: {
    type: Number,
    default: 100 * 1024 * 1024 * 1024, // 100GB in bytes
    min: 0
  },
  storageUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  videoCountLimit: {
    type: Number,
    default: 1000, // Maximum 1000 videos per creator
    min: 0
  },
  videoCount: {
    type: Number,
    default: 0,
    min: 0
  },
  graceMonthsLeft: {
    type: Number,
    default: 3,
    min: 0
  },
  graceStartDate: {
    type: Date,
    default: Date.now
  },
  isGracePeriod: {
    type: Boolean,
    default: true
  },
  commissionRate: {
    type: Number,
    default: 30, // 30% commission after grace period
    min: 0,
    max: 100
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUploadAt: {
    type: Date
  },
  restrictions: {
    canUpload: {
      type: Boolean,
      default: true
    },
    reason: {
      type: String,
      maxlength: 200
    }
  }
}, {
  timestamps: true
});

// Indexes
CreatorLimitSchema.index({ creatorId: 1 });
CreatorLimitSchema.index({ isGracePeriod: 1 });
CreatorLimitSchema.index({ lastUploadAt: -1 });

// Instance methods
CreatorLimitSchema.methods.canUploadVideo = function(fileSize: number) {
  // Check if creator can upload
  if (!this.restrictions.canUpload) {
    return {
      canUpload: false,
      reason: this.restrictions.reason || 'Upload restrito'
    };
  }

  // Check storage limit
  if (this.storageUsed + fileSize > this.storageLimit) {
    return {
      canUpload: false,
      reason: `Limite de armazenamento excedido. Usado: ${this.getStorageUsedGB()}GB / ${this.getStorageLimitGB()}GB`
    };
  }

  // Check video count limit
  if (this.videoCount >= this.videoCountLimit) {
    return {
      canUpload: false,
      reason: `Limite de vídeos excedido. Máximo: ${this.videoCountLimit} vídeos`
    };
  }

  return {
    canUpload: true,
    reason: null
  };
};

CreatorLimitSchema.methods.addVideo = function(fileSize: number) {
  this.videoCount += 1;
  this.storageUsed += fileSize;
  this.lastUploadAt = new Date();
  return this.save();
};

CreatorLimitSchema.methods.removeVideo = function(fileSize: number) {
  this.videoCount = Math.max(0, this.videoCount - 1);
  this.storageUsed = Math.max(0, this.storageUsed - fileSize);
  return this.save();
};

CreatorLimitSchema.methods.updateGracePeriod = function() {
  const now = new Date();
  const graceEndDate = new Date(this.graceStartDate);
  graceEndDate.setMonth(graceEndDate.getMonth() + 3); // 3 months grace period

  if (now > graceEndDate) {
    this.isGracePeriod = false;
    this.graceMonthsLeft = 0;
  } else {
    const monthsLeft = Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    this.graceMonthsLeft = Math.max(0, monthsLeft);
  }

  return this.save();
};

CreatorLimitSchema.methods.addRevenue = function(amount: number) {
  this.totalRevenue += amount;
  return this.save();
};

CreatorLimitSchema.methods.addViews = function(count: number) {
  this.totalViews += count;
  return this.save();
};

CreatorLimitSchema.methods.getStorageUsedGB = function() {
  return Math.round((this.storageUsed / (1024 * 1024 * 1024)) * 100) / 100;
};

CreatorLimitSchema.methods.getStorageLimitGB = function() {
  return Math.round((this.storageLimit / (1024 * 1024 * 1024)) * 100) / 100;
};

CreatorLimitSchema.methods.getStorageUsedPercentage = function() {
  return Math.round((this.storageUsed / this.storageLimit) * 100);
};

CreatorLimitSchema.methods.restrictUpload = function(reason: string) {
  this.restrictions.canUpload = false;
  this.restrictions.reason = reason;
  return this.save();
};

CreatorLimitSchema.methods.allowUpload = function() {
  this.restrictions.canUpload = true;
  this.restrictions.reason = undefined;
  return this.save();
};

// Static methods
CreatorLimitSchema.statics.createForCreator = function(creatorId: string, creatorName: string) {
  return this.create({
    creatorId,
    creatorName,
    graceStartDate: new Date(),
    isGracePeriod: true,
    graceMonthsLeft: 3
  });
};

CreatorLimitSchema.statics.getOrCreateForCreator = async function(creatorId: string, creatorName: string) {
  let creatorLimit = await this.findOne({ creatorId });
  
  if (!creatorLimit) {
    creatorLimit = await this.createForCreator(creatorId, creatorName);
  }
  
  // Update grace period
  await creatorLimit.updateGracePeriod();
  
  return creatorLimit;
};

CreatorLimitSchema.statics.updateAllGracePeriods = function() {
  return this.find({ isGracePeriod: true }).then(creators => {
    return Promise.all(creators.map(creator => creator.updateGracePeriod()));
  });
};

// Virtual for commission amount based on grace period
CreatorLimitSchema.virtual('currentCommissionRate').get(function() {
  return this.isGracePeriod ? 0 : this.commissionRate;
});

// Virtual for remaining storage
CreatorLimitSchema.virtual('remainingStorageGB').get(function() {
  const remaining = this.storageLimit - this.storageUsed;
  return Math.max(0, Math.round((remaining / (1024 * 1024 * 1024)) * 100) / 100);
});

// Ensure virtual fields are serialised
CreatorLimitSchema.set('toJSON', { virtuals: true });
CreatorLimitSchema.set('toObject', { virtuals: true });

// Export the model
const CreatorLimit = mongoose.model<ICreatorLimit>('CreatorLimit', CreatorLimitSchema);
export default CreatorLimit;
export { ICreatorLimit };
