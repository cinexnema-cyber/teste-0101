import mongoose, { Document, Schema } from 'mongoose';

// Interface for Video document
interface IVideo extends Document {
  title: string;
  description: string;

  // Movie/Series metadata
  type: 'filme' | 'serie';
  season?: number; // se for série
  episode?: number; // se for série
  director?: string;
  cast: string[];
  genre: string[];
  synopsis?: string;
  language?: string;
  releaseDate?: Date;

  // Technical fields
  muxAssetId: string;
  muxPlaybackId: string;
  creatorId: string;
  creatorName: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  videoUrl?: string; // Mux playback URL
  duration: number; // duração em minutos
  fileSize: number;
  originalFilename: string;

  // Status and approval
  status: 'uploading' | 'processing' | 'pending_approval' | 'approved' | 'rejected' | 'failed';
  approved: boolean; // aprovação admin
  approvalStatus: {
    approvedBy?: string;
    approvedAt?: Date;
    rejectedBy?: string;
    rejectedAt?: Date;
    rejectionReason?: string;
  };

  // Analytics
  viewCount: number;
  revenue: number;
  tags: string[];
  category: string;
  isPrivate: boolean;

  // Timestamps
  uploadedAt: Date;
  processedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Video schema
const VideoSchema = new Schema<IVideo>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },

  // Movie/Series metadata
  type: {
    type: String,
    enum: ['filme', 'serie'],
    required: true
  },
  season: {
    type: Number,
    default: null,
    min: 1
  },
  episode: {
    type: Number,
    default: null,
    min: 1
  },
  director: {
    type: String,
    trim: true
  },
  cast: [{
    type: String,
    trim: true
  }],
  genre: [{
    type: String,
    trim: true
  }],
  synopsis: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  language: {
    type: String,
    default: 'Português'
  },
  releaseDate: {
    type: Date
  },
  thumbnailUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  muxAssetId: {
    type: String,
    required: true,
    unique: true
  },
  muxPlaybackId: {
    type: String,
    required: true
  },
  creatorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  creatorName: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 1
  },
  fileSize: {
    type: Number, // File size in bytes
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'pending_approval', 'approved', 'rejected', 'failed'],
    default: 'uploading'
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    approvedBy: {
      type: String,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    rejectedBy: {
      type: String,
      ref: 'User'
    },
    rejectedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      maxlength: 500
    }
  },
  viewCount: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'geral'
  },
  isPrivate: {
    type: Boolean,
    default: true // All videos start as private
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
VideoSchema.index({ creatorId: 1 });
VideoSchema.index({ status: 1 });
VideoSchema.index({ approvedAt: -1 });
VideoSchema.index({ viewCount: -1 });
VideoSchema.index({ createdAt: -1 });

// Instance methods
VideoSchema.methods.approve = function(adminId: string) {
  this.status = 'approved';
  this.approvalStatus.approvedBy = adminId;
  this.approvalStatus.approvedAt = new Date();
  this.approvedAt = new Date();
  return this.save();
};

VideoSchema.methods.reject = function(adminId: string, reason: string) {
  this.status = 'rejected';
  this.approvalStatus.rejectedBy = adminId;
  this.approvalStatus.rejectedAt = new Date();
  this.approvalStatus.rejectionReason = reason;
  return this.save();
};

VideoSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

VideoSchema.methods.addRevenue = function(amount: number) {
  this.revenue += amount;
  return this.save();
};

// Static methods
VideoSchema.statics.getByCreator = function(creatorId: string) {
  return this.find({ creatorId }).sort({ createdAt: -1 });
};

VideoSchema.statics.getPendingApproval = function() {
  return this.find({ status: 'pending_approval' }).sort({ uploadedAt: 1 });
};

VideoSchema.statics.getApproved = function() {
  return this.find({ status: 'approved' }).sort({ approvedAt: -1 });
};

VideoSchema.statics.getCreatorStorageUsed = function(creatorId: string) {
  return this.aggregate([
    { $match: { creatorId: creatorId } },
    { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
  ]);
};

// Virtual for getting secure playback URL
VideoSchema.virtual('securePlaybackUrl').get(function() {
  // This will be implemented with Mux signed URLs for subscribers only
  if (this.status === 'approved' && this.muxPlaybackId) {
    return `https://stream.mux.com/${this.muxPlaybackId}.m3u8`;
  }
  return null;
});

// Note: Thumbnail URL fallback is handled in route serializers to avoid conflicts with real schema fields.

// Ensure virtual fields are serialised
VideoSchema.set('toJSON', { virtuals: true });
VideoSchema.set('toObject', { virtuals: true });

// Export the model
const Video = mongoose.model<IVideo>('Video', VideoSchema);
export default Video;
export type { IVideo };
