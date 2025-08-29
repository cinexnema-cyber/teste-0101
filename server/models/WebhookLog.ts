import mongoose, { Document, Schema } from "mongoose";

export interface IWebhookLog extends Document {
  webhook_id: string;
  webhook_type: "mercado_pago" | "stripe" | "other";
  payload: any;
  status: "received" | "processed" | "failed" | "retry";
  transaction_id?: string;
  user_id?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: Date;
  processed_at?: Date;
  created_at: Date;
}

const WebhookLogSchema = new Schema<IWebhookLog>(
  {
    webhook_id: {
      type: String,
      required: true,
      unique: true,
    },
    webhook_type: {
      type: String,
      enum: ["mercado_pago", "stripe", "other"],
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["received", "processed", "failed", "retry"],
      default: "received",
    },
    transaction_id: {
      type: String,
      required: false,
    },
    user_id: {
      type: String,
      required: false,
    },
    error_message: {
      type: String,
      required: false,
    },
    retry_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    max_retries: {
      type: Number,
      default: 3,
      min: 0,
    },
    next_retry_at: {
      type: Date,
      required: false,
    },
    processed_at: {
      type: Date,
      required: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para otimização
WebhookLogSchema.index({ webhook_type: 1, status: 1 });
WebhookLogSchema.index({ transaction_id: 1 });
WebhookLogSchema.index({ created_at: -1 });
WebhookLogSchema.index({ next_retry_at: 1, status: 1 });

export const WebhookLog = mongoose.model<IWebhookLog>("WebhookLog", WebhookLogSchema);
export default WebhookLog;
