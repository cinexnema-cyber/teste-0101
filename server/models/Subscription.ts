import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  id: string;
  id_usuario: mongoose.Types.ObjectId;
  id_video?: mongoose.Types.ObjectId; // opcional, para assinaturas de conteúdo específico
  tipo_assinatura: "plataforma" | "criador" | "conteudo_individual";
  valor_pago: number; // em centavos
  moeda: string;
  metodo_pagamento: "cartao" | "pix" | "boleto" | "mercadopago" | "stripe";
  status_pagamento:
    | "pendente"
    | "aprovado"
    | "rejeitado"
    | "reembolsado"
    | "cancelado";
  data_pagamento: Date;
  data_vencimento?: Date;
  plano: "monthly" | "yearly" | "lifetime" | "individual";
  renovacao_automatica: boolean;
  transaction_id: string; // ID da transação do gateway de pagamento
  detalhes_pagamento: {
    gateway: string;
    referencia_externa?: string;
    comprovante_url?: string;
    dados_adicionais?: any;
  };
  data_inicio_periodo: Date;
  data_fim_periodo: Date;
  ativo: boolean;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    id_video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: false,
    },
    tipo_assinatura: {
      type: String,
      enum: ["plataforma", "criador", "conteudo_individual"],
      default: "plataforma",
    },
    valor_pago: {
      type: Number,
      required: true,
      min: 0,
    },
    moeda: {
      type: String,
      default: "BRL",
      enum: ["BRL", "USD", "EUR"],
    },
    metodo_pagamento: {
      type: String,
      enum: ["cartao", "pix", "boleto", "mercadopago", "stripe"],
      required: true,
    },
    status_pagamento: {
      type: String,
      enum: ["pendente", "aprovado", "rejeitado", "reembolsado", "cancelado"],
      default: "pendente",
    },
    data_pagamento: {
      type: Date,
      default: Date.now,
    },
    data_vencimento: {
      type: Date,
    },
    plano: {
      type: String,
      enum: ["monthly", "yearly", "lifetime", "individual"],
      required: true,
    },
    renovacao_automatica: {
      type: Boolean,
      default: true,
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
    },
    detalhes_pagamento: {
      gateway: {
        type: String,
        required: true,
      },
      referencia_externa: String,
      comprovante_url: String,
      dados_adicionais: Schema.Types.Mixed,
    },
    data_inicio_periodo: {
      type: Date,
      required: true,
    },
    data_fim_periodo: {
      type: Date,
      required: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Índices para otimização
SubscriptionSchema.index({ id_usuario: 1 });
SubscriptionSchema.index({ id_video: 1 });
SubscriptionSchema.index({ status_pagamento: 1 });
SubscriptionSchema.index({ transaction_id: 1 });
SubscriptionSchema.index({ data_vencimento: 1 });
SubscriptionSchema.index({ ativo: 1 });

// Índice composto para consultas de assinatura ativa
SubscriptionSchema.index({
  id_usuario: 1,
  ativo: 1,
  status_pagamento: 1,
  data_fim_periodo: 1,
});

// Virtual para ID string
SubscriptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Virtual para usuário populado
SubscriptionSchema.virtual("usuario", {
  ref: "User",
  localField: "id_usuario",
  foreignField: "_id",
  justOne: true,
});

// Virtual para vídeo populado (quando aplicável)
SubscriptionSchema.virtual("video", {
  ref: "Video",
  localField: "id_video",
  foreignField: "_id",
  justOne: true,
});

// Método para verificar se a assinatura está válida
SubscriptionSchema.methods.isValida = function (): boolean {
  const agora = new Date();
  return (
    this.ativo &&
    this.status_pagamento === "aprovado" &&
    this.data_fim_periodo > agora
  );
};

// Método para calcular dias restantes
SubscriptionSchema.methods.diasRestantes = function (): number {
  const agora = new Date();
  const fim = new Date(this.data_fim_periodo);
  const diff = fim.getTime() - agora.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Método estático para encontrar assinatura ativa do usuário
SubscriptionSchema.statics.findAssinaturaAtiva = function (userId: string) {
  return this.findOne({
    id_usuario: userId,
    ativo: true,
    status_pagamento: "aprovado",
    data_fim_periodo: { $gt: new Date() },
  }).sort({ data_fim_periodo: -1 });
};

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema,
);
export default Subscription;
