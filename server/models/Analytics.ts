import mongoose, { Document, Schema } from "mongoose";

export interface IPlatformAnalytics extends Document {
  date: Date;
  total_users: number;
  total_subscribers: number;
  total_creators: number;
  daily_signups: number;
  daily_subscriptions: number;
  daily_cancellations: number;
  daily_revenue: number;
  monthly_revenue: number;
  creator_fees_collected: number;
  commission_paid_to_creators: number;
  top_content: Array<{
    content_id: string;
    title: string;
    views: number;
    revenue_generated: number;
  }>;
  traffic_sources: {
    direct: number;
    organic: number;
    referrals: number;
    creator_links: number;
  };
  device_stats: {
    mobile: number;
    desktop: number;
    tablet: number;
    tv: number;
  };
  geographic_data: Array<{
    state: string;
    city: string;
    users: number;
    subscribers: number;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface ICreatorAnalytics extends Document {
  creator_id: string;
  creator_email: string;
  date: Date;
  total_referrals: number;
  successful_conversions: number;
  conversion_rate: number;
  daily_referrals: number;
  daily_conversions: number;
  earnings_today: number;
  earnings_month: number;
  earnings_total: number;
  commission_rate: number;
  content_performance: Array<{
    content_id: string;
    title: string;
    views: number;
    engagement_rate: number;
    revenue_generated: number;
  }>;
  referral_sources: {
    social_media: number;
    direct_link: number;
    word_of_mouth: number;
    other: number;
  };
  billing_status: 'grace_period' | 'billing_active' | 'suspended' | 'cancelled';
  next_billing_date?: Date;
  monthly_fee_due: number;
  grace_period_remaining_days?: number;
  created_at: Date;
  updated_at: Date;
}

// Schema para Analytics da Plataforma
const PlatformAnalyticsSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  total_users: {
    type: Number,
    default: 0
  },
  total_subscribers: {
    type: Number,
    default: 0
  },
  total_creators: {
    type: Number,
    default: 0
  },
  daily_signups: {
    type: Number,
    default: 0
  },
  daily_subscriptions: {
    type: Number,
    default: 0
  },
  daily_cancellations: {
    type: Number,
    default: 0
  },
  daily_revenue: {
    type: Number,
    default: 0
  },
  monthly_revenue: {
    type: Number,
    default: 0
  },
  creator_fees_collected: {
    type: Number,
    default: 0
  },
  commission_paid_to_creators: {
    type: Number,
    default: 0
  },
  top_content: [{
    content_id: String,
    title: String,
    views: Number,
    revenue_generated: Number
  }],
  traffic_sources: {
    direct: { type: Number, default: 0 },
    organic: { type: Number, default: 0 },
    referrals: { type: Number, default: 0 },
    creator_links: { type: Number, default: 0 }
  },
  device_stats: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    tv: { type: Number, default: 0 }
  },
  geographic_data: [{
    state: String,
    city: String,
    users: Number,
    subscribers: Number
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Schema para Analytics do Criador
const CreatorAnalyticsSchema: Schema = new Schema({
  creator_id: {
    type: String,
    required: true,
    index: true
  },
  creator_email: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  total_referrals: {
    type: Number,
    default: 0
  },
  successful_conversions: {
    type: Number,
    default: 0
  },
  conversion_rate: {
    type: Number,
    default: 0
  },
  daily_referrals: {
    type: Number,
    default: 0
  },
  daily_conversions: {
    type: Number,
    default: 0
  },
  earnings_today: {
    type: Number,
    default: 0
  },
  earnings_month: {
    type: Number,
    default: 0
  },
  earnings_total: {
    type: Number,
    default: 0
  },
  commission_rate: {
    type: Number,
    min: 50,
    max: 70,
    default: 60
  },
  content_performance: [{
    content_id: String,
    title: String,
    views: Number,
    engagement_rate: Number,
    revenue_generated: Number
  }],
  referral_sources: {
    social_media: { type: Number, default: 0 },
    direct_link: { type: Number, default: 0 },
    word_of_mouth: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  billing_status: {
    type: String,
    enum: ['grace_period', 'billing_active', 'suspended', 'cancelled'],
    default: 'grace_period'
  },
  next_billing_date: {
    type: Date
  },
  monthly_fee_due: {
    type: Number,
    default: 1000.00
  },
  grace_period_remaining_days: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updated_at
PlatformAnalyticsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

CreatorAnalyticsSchema.pre('save', function(next) {
  this.updated_at = new Date();
  // Calcular dias restantes do período de carência
  if (this.billing_status === 'grace_period' && this.next_billing_date) {
    const today = new Date();
    const timeDiff = this.next_billing_date.getTime() - today.getTime();
    this.grace_period_remaining_days = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }
  next();
});

export const PlatformAnalytics = mongoose.model<IPlatformAnalytics>("PlatformAnalytics", PlatformAnalyticsSchema);
export const CreatorAnalytics = mongoose.model<ICreatorAnalytics>("CreatorAnalytics", CreatorAnalyticsSchema);
