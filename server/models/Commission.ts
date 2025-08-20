import mongoose, { Document, Schema } from "mongoose";

export interface ICommission extends Document {
  id: string;
  id_criador: mongoose.Types.ObjectId;
  id_assinatura: mongoose.Types.ObjectId;
  id_video?: mongoose.Types.ObjectId; // vídeo que gerou a comissão
  valor_comissao: number; // em centavos
  percentual_aplicado: number; // percentual usado no cálculo (ex: 70)
  valor_original: number; // valor original da assinatura
  moeda: string;
  status: "pendente" | "disponivel" | "pago" | "cancelado";
  data_geracao: Date;
  data_disponibilizacao?: Date; // quando ficou disponível para saque
  data_pagamento?: Date; // quando foi pago ao criador
  metodo_pagamento_criador?: string; // como foi pago (PIX, transferência, etc)
  referencia_pagamento?: string; // referência do pagamento ao criador
  observacoes?: string;
}

const CommissionSchema = new Schema<ICommission>(
  {
    id_criador: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    id_assinatura: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    id_video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: false,
    },
    valor_comissao: {
      type: Number,
      required: true,
      min: 0,
    },
    percentual_aplicado: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    valor_original: {
      type: Number,
      required: true,
      min: 0,
    },
    moeda: {
      type: String,
      default: "BRL",
      enum: ["BRL", "USD", "EUR"],
    },
    status: {
      type: String,
      enum: ["pendente", "disponivel", "pago", "cancelado"],
      default: "pendente",
    },
    data_geracao: {
      type: Date,
      default: Date.now,
    },
    data_disponibilizacao: {
      type: Date,
    },
    data_pagamento: {
      type: Date,
    },
    metodo_pagamento_criador: {
      type: String,
      enum: ["pix", "transferencia_bancaria", "ted", "paypal", "mercadopago"],
    },
    referencia_pagamento: {
      type: String,
    },
    observacoes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Índices para otimização
CommissionSchema.index({ id_criador: 1 });
CommissionSchema.index({ id_assinatura: 1 });
CommissionSchema.index({ status: 1 });
CommissionSchema.index({ data_geracao: -1 });

// Índice composto para consultas de comissões do criador
CommissionSchema.index({
  id_criador: 1,
  status: 1,
  data_geracao: -1,
});

// Virtual para ID string
CommissionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Virtual para criador populado
CommissionSchema.virtual("criador", {
  ref: "User",
  localField: "id_criador",
  foreignField: "_id",
  justOne: true,
});

// Virtual para assinatura populada
CommissionSchema.virtual("assinatura", {
  ref: "Subscription",
  localField: "id_assinatura",
  foreignField: "_id",
  justOne: true,
});

// Virtual para vídeo populado
CommissionSchema.virtual("video", {
  ref: "Video",
  localField: "id_video",
  foreignField: "_id",
  justOne: true,
});

// Método para marcar como disponível
CommissionSchema.methods.marcarComoDisponivel = function () {
  this.status = "disponivel";
  this.data_disponibilizacao = new Date();
  return this.save();
};

// Método para marcar como pago
CommissionSchema.methods.marcarComoPago = function (
  metodoPagamento: string,
  referencia?: string,
) {
  this.status = "pago";
  this.data_pagamento = new Date();
  this.metodo_pagamento_criador = metodoPagamento;
  this.referencia_pagamento = referencia;
  return this.save();
};

// Método estático para calcular saldo disponível do criador
CommissionSchema.statics.calcularSaldoDisponivel = function (
  criadorId: string,
) {
  return this.aggregate([
    {
      $match: {
        id_criador: new mongoose.Types.ObjectId(criadorId),
        status: "disponivel",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$valor_comissao" },
        quantidade: { $sum: 1 },
      },
    },
  ]);
};

// Método estático para calcular total já ganho pelo criador
CommissionSchema.statics.calcularTotalGanho = function (criadorId: string) {
  return this.aggregate([
    {
      $match: {
        id_criador: new mongoose.Types.ObjectId(criadorId),
        status: { $in: ["disponivel", "pago"] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$valor_comissao" },
        quantidade: { $sum: 1 },
      },
    },
  ]);
};

// Middleware para atualizar saldo do criador
CommissionSchema.post("save", async function (doc) {
  if (doc.status === "disponivel" || doc.status === "pago") {
    try {
      const User = mongoose.model("User");

      // Calcula novo saldo disponível
      const saldoResult = await Commission.calcularSaldoDisponivel(
        doc.id_criador.toString(),
      );
      const saldoDisponivel = saldoResult[0]?.total || 0;

      // Calcula total ganho
      const totalResult = await Commission.calcularTotalGanho(
        doc.id_criador.toString(),
      );
      const totalGanho = totalResult[0]?.total || 0;

      // Atualiza o usuário criador
      await User.findByIdAndUpdate(doc.id_criador, {
        saldoDisponivel,
        totalGanho,
      });
    } catch (error) {
      console.error("Erro ao atualizar saldo do criador:", error);
    }
  }
});

export const Commission = mongoose.model<ICommission>(
  "Commission",
  CommissionSchema,
);
export default Commission;
