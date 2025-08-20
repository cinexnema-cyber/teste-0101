import mongoose, { Document, Schema } from "mongoose";

export interface ICreatorBilling extends Document {
  creator_id: string;
  creator_email: string;
  start_date: Date;
  grace_period_end: Date; // 3 meses de carência
  monthly_fee: number; // R$ 1000,00
  status: 'grace_period' | 'billing_active' | 'suspended' | 'cancelled';
  last_payment_date?: Date;
  next_payment_date?: Date;
  total_earned: number;
  commission_percentage: number; // 50% a 70%
  referral_link: string;
  subscribers_referred: number;
  created_at: Date;
  updated_at: Date;
}

const CreatorBillingSchema: Schema = new Schema({
  creator_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  creator_email: {
    type: String,
    required: true,
    index: true
  },
  start_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  grace_period_end: {
    type: Date,
    required: true,
    default: function() {
      // 3 meses de carência
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date;
    }
  },
  monthly_fee: {
    type: Number,
    required: true,
    default: 1000.00 // R$ 1000,00
  },
  status: {
    type: String,
    enum: ['grace_period', 'billing_active', 'suspended', 'cancelled'],
    default: 'grace_period',
    required: true
  },
  last_payment_date: {
    type: Date
  },
  next_payment_date: {
    type: Date
  },
  total_earned: {
    type: Number,
    default: 0
  },
  commission_percentage: {
    type: Number,
    min: 50,
    max: 70,
    default: 60 // Padrão 60%
  },
  referral_link: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  subscribers_referred: {
    type: Number,
    default: 0
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
CreatorBillingSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Método para verificar se está no período de carência
CreatorBillingSchema.methods.isInGracePeriod = function() {
  return new Date() <= this.grace_period_end;
};

// Método para calcular próxima data de pagamento
CreatorBillingSchema.methods.calculateNextPayment = function() {
  if (this.isInGracePeriod()) {
    return this.grace_period_end;
  }
  
  const nextDate = new Date(this.last_payment_date || this.grace_period_end);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
};

// Método para gerar link de referência
CreatorBillingSchema.statics.generateReferralLink = function(creator_id: string) {
  const baseUrl = 'https://cinexnema.com';
  const referralCode = `creator_${creator_id}_${Date.now()}`;
  return `${baseUrl}/register?ref=${referralCode}`;
};

export default mongoose.model<ICreatorBilling>("CreatorBilling", CreatorBillingSchema);
