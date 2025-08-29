import mongoose, { Document, Schema } from 'mongoose';

// Interface for CreatorBlocks document
interface ICreatorBlocks extends Document {
  creatorId: string;
  creatorName: string;
  
  // Block management
  totalBlocks: number; // Total blocks purchased
  usedBlocks: number; // Blocks currently used by uploaded videos
  availableBlocks: number; // Remaining blocks available
  
  // Storage tracking (in GB)
  totalStorageGB: number; // Total storage purchased (totalBlocks * 7.3)
  usedStorageGB: number; // Storage currently used
  availableStorageGB: number; // Storage remaining
  
  // Purchase history
  purchases: Array<{
    date: Date;
    blocks: number;
    amountPaid: number; // in cents (R$ 1000 = 100000 cents)
    mercadoPagoId?: string;
    transactionId: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  
  // Video tracking
  videos: Array<{
    videoId: string;
    title: string;
    sizeGB: number;
    blocksUsed: number;
    uploadedAt: Date;
    status: 'uploaded' | 'approved' | 'rejected' | 'deleted';
  }>;
  
  // Usage statistics
  stats: {
    totalVideoCount: number;
    totalRevenue: number;
    totalViews: number;
    averageSizePerVideo: number;
  };
  
  // Account status
  isActive: boolean;
  canUpload: boolean;
  restrictions: {
    reason?: string;
    restrictedAt?: Date;
    restrictedBy?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// CreatorBlocks schema
const CreatorBlocksSchema = new Schema<ICreatorBlocks>({
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
  
  totalBlocks: {
    type: Number,
    default: 0,
    min: 0
  },
  usedBlocks: {
    type: Number,
    default: 0,
    min: 0
  },
  availableBlocks: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalStorageGB: {
    type: Number,
    default: 0,
    min: 0
  },
  usedStorageGB: {
    type: Number,
    default: 0,
    min: 0
  },
  availableStorageGB: {
    type: Number,
    default: 0,
    min: 0
  },
  
  purchases: [{
    date: {
      type: Date,
      default: Date.now
    },
    blocks: {
      type: Number,
      required: true,
      min: 1
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },
    mercadoPagoId: String,
    transactionId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  videos: [{
    videoId: {
      type: String,
      required: true,
      ref: 'Video'
    },
    title: {
      type: String,
      required: true
    },
    sizeGB: {
      type: Number,
      required: true,
      min: 0
    },
    blocksUsed: {
      type: Number,
      required: true,
      min: 0
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['uploaded', 'approved', 'rejected', 'deleted'],
      default: 'uploaded'
    }
  }],
  
  stats: {
    totalVideoCount: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    averageSizePerVideo: {
      type: Number,
      default: 0
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  canUpload: {
    type: Boolean,
    default: true
  },
  restrictions: {
    reason: String,
    restrictedAt: Date,
    restrictedBy: String
  }
}, {
  timestamps: true
});

// Indexes
CreatorBlocksSchema.index({ creatorId: 1 });
CreatorBlocksSchema.index({ 'purchases.status': 1 });
CreatorBlocksSchema.index({ 'purchases.transactionId': 1 });
CreatorBlocksSchema.index({ isActive: 1 });

// Instance methods
CreatorBlocksSchema.methods.canUploadVideo = function(sizeGB: number): { canUpload: boolean; reason?: string; blocksNeeded?: number } {
  if (!this.isActive || !this.canUpload) {
    return {
      canUpload: false,
      reason: this.restrictions?.reason || 'Upload restrito para este criador'
    };
  }
  
  // Calculate blocks needed for this video
  const blocksNeeded = Math.ceil(sizeGB / 7.3);
  
  if (blocksNeeded > this.availableBlocks) {
    return {
      canUpload: false,
      reason: `Blocos insuficientes. Necessário: ${blocksNeeded}, Disponível: ${this.availableBlocks}`,
      blocksNeeded
    };
  }
  
  return {
    canUpload: true,
    blocksNeeded
  };
};

CreatorBlocksSchema.methods.purchaseBlocks = function(blocks: number, transactionId: string, amountPaid: number) {
  // Add purchase record
  this.purchases.push({
    date: new Date(),
    blocks,
    amountPaid,
    transactionId,
    status: 'pending'
  });
  
  return this.save();
};

CreatorBlocksSchema.methods.confirmPurchase = function(transactionId: string, mercadoPagoId?: string) {
  const purchase = this.purchases.find((p: any) => p.transactionId === transactionId);
  
  if (!purchase) {
    throw new Error('Purchase not found');
  }
  
  purchase.status = 'approved';
  purchase.mercadoPagoId = mercadoPagoId;
  
  // Add blocks to account
  this.totalBlocks += purchase.blocks;
  this.availableBlocks += purchase.blocks;
  this.totalStorageGB += purchase.blocks * 7.3;
  this.availableStorageGB += purchase.blocks * 7.3;
  
  return this.save();
};

CreatorBlocksSchema.methods.rejectPurchase = function(transactionId: string) {
  const purchase = this.purchases.find((p: any) => p.transactionId === transactionId);
  
  if (!purchase) {
    throw new Error('Purchase not found');
  }
  
  purchase.status = 'rejected';
  
  return this.save();
};

CreatorBlocksSchema.methods.addVideo = function(videoId: string, title: string, sizeGB: number) {
  // Calculate blocks used
  const blocksUsed = Math.ceil(sizeGB / 7.3);
  
  // Check if enough blocks available
  if (blocksUsed > this.availableBlocks) {
    throw new Error('Blocos insuficientes para este vídeo');
  }
  
  // Add video record
  this.videos.push({
    videoId,
    title,
    sizeGB,
    blocksUsed,
    uploadedAt: new Date(),
    status: 'uploaded'
  });
  
  // Update usage
  this.usedBlocks += blocksUsed;
  this.availableBlocks -= blocksUsed;
  this.usedStorageGB += sizeGB;
  this.availableStorageGB -= sizeGB;
  
  // Update stats
  this.stats.totalVideoCount += 1;
  this.stats.averageSizePerVideo = this.usedStorageGB / this.stats.totalVideoCount;
  
  return this.save();
};

CreatorBlocksSchema.methods.removeVideo = function(videoId: string) {
  const videoIndex = this.videos.findIndex((v: any) => v.videoId === videoId);
  
  if (videoIndex === -1) {
    throw new Error('Video not found');
  }
  
  const video = this.videos[videoIndex];
  
  // Return blocks and storage
  this.usedBlocks -= video.blocksUsed;
  this.availableBlocks += video.blocksUsed;
  this.usedStorageGB -= video.sizeGB;
  this.availableStorageGB += video.sizeGB;
  
  // Update stats
  this.stats.totalVideoCount -= 1;
  if (this.stats.totalVideoCount > 0) {
    this.stats.averageSizePerVideo = this.usedStorageGB / this.stats.totalVideoCount;
  } else {
    this.stats.averageSizePerVideo = 0;
  }
  
  // Remove video from array
  this.videos.splice(videoIndex, 1);
  
  return this.save();
};

CreatorBlocksSchema.methods.updateVideoStatus = function(videoId: string, status: 'uploaded' | 'approved' | 'rejected' | 'deleted') {
  const video = this.videos.find((v: any) => v.videoId === videoId);
  
  if (!video) {
    throw new Error('Video not found');
  }
  
  video.status = status;
  
  return this.save();
};

CreatorBlocksSchema.methods.addRevenue = function(amount: number) {
  this.stats.totalRevenue += amount;
  return this.save();
};

CreatorBlocksSchema.methods.addViews = function(count: number) {
  this.stats.totalViews += count;
  return this.save();
};

CreatorBlocksSchema.methods.restrictUpload = function(reason: string, restrictedBy: string) {
  this.canUpload = false;
  this.restrictions = {
    reason,
    restrictedAt: new Date(),
    restrictedBy
  };
  return this.save();
};

CreatorBlocksSchema.methods.allowUpload = function() {
  this.canUpload = true;
  this.restrictions = {};
  return this.save();
};

CreatorBlocksSchema.methods.getUsagePercentage = function() {
  if (this.totalBlocks === 0) return 0;
  return Math.round((this.usedBlocks / this.totalBlocks) * 100);
};

CreatorBlocksSchema.methods.getStorageUsagePercentage = function() {
  if (this.totalStorageGB === 0) return 0;
  return Math.round((this.usedStorageGB / this.totalStorageGB) * 100);
};

// Static methods
CreatorBlocksSchema.statics.createForCreator = function(creatorId: string, creatorName: string) {
  return this.create({
    creatorId,
    creatorName,
    totalBlocks: 0,
    usedBlocks: 0,
    availableBlocks: 0,
    totalStorageGB: 0,
    usedStorageGB: 0,
    availableStorageGB: 0,
    purchases: [],
    videos: [],
    stats: {
      totalVideoCount: 0,
      totalRevenue: 0,
      totalViews: 0,
      averageSizePerVideo: 0
    },
    isActive: true,
    canUpload: true
  });
};

CreatorBlocksSchema.statics.getOrCreateForCreator = async function(creatorId: string, creatorName: string) {
  let creatorBlocks = await this.findOne({ creatorId });
  
  if (!creatorBlocks) {
    creatorBlocks = await this.createForCreator(creatorId, creatorName);
  }
  
  return creatorBlocks;
};

CreatorBlocksSchema.statics.calculateBlocksNeeded = function(sizeGB: number): number {
  return Math.ceil(sizeGB / 7.3);
};

CreatorBlocksSchema.statics.calculatePrice = function(blocks: number): number {
  return blocks * 100000; // R$ 1000 = 100000 cents
};

CreatorBlocksSchema.statics.getPendingPurchases = function() {
  return this.find({ 'purchases.status': 'pending' });
};

CreatorBlocksSchema.statics.getByTransactionId = function(transactionId: string) {
  return this.findOne({ 'purchases.transactionId': transactionId });
};

// Virtual for formatted total revenue
CreatorBlocksSchema.virtual('formattedRevenue').get(function() {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(this.stats.totalRevenue / 100);
});

// Virtual for blocks status summary
CreatorBlocksSchema.virtual('blocksSummary').get(function() {
  return {
    total: this.totalBlocks,
    used: this.usedBlocks,
    available: this.availableBlocks,
    usagePercentage: this.getUsagePercentage()
  };
});

// Virtual for storage status summary
CreatorBlocksSchema.virtual('storageSummary').get(function() {
  return {
    totalGB: Math.round(this.totalStorageGB * 100) / 100,
    usedGB: Math.round(this.usedStorageGB * 100) / 100,
    availableGB: Math.round(this.availableStorageGB * 100) / 100,
    usagePercentage: this.getStorageUsagePercentage()
  };
});

// Ensure virtual fields are serialised
CreatorBlocksSchema.set('toJSON', { virtuals: true });
CreatorBlocksSchema.set('toObject', { virtuals: true });

// Export the model
const CreatorBlocks = mongoose.model<ICreatorBlocks>('CreatorBlocks', CreatorBlocksSchema);
export default CreatorBlocks;
export type { ICreatorBlocks };
