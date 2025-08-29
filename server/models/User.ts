import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  id: string;
  nome: string;
  email: string;
  password: string;
  tipo: "assinante" | "criador" | "visitante" | "admin";
  data_criacao: Date;
  assinante: boolean;
  subscriptionStatus: "ativo" | "inativo";
  subscriptionPlan?: "basic" | "premium" | "vip"; // R$19,90 / R$59,90 / R$199,00
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  freeMonthsRemaining: number; // Meses grátis restantes
  subscriptionType: "recurrent" | "prepaid"; // Recorrente ou pré-pago
  prepaidMonths?: number; // Meses pagos antecipadamente

  // Criador fields
  comissaoPercentual: number; // Percentual de comissão para criadores (padrão 70%)
  saldoDisponivel: number; // Saldo acumulado do criador
  totalGanho: number; // Total já ganho pelo criador

  // Profile fields
  bio?: string;
  avatar?: string;
  verificado: boolean;

  // Creator-specific profile
  creatorProfile?: {
    status: "pending" | "approved" | "rejected";
    whatsapp?: string;
    portfolio?: string;
    description?: string;
    gracePeriod?: number; // Meses de carência (1 mês grátis)
    gracePeriodApproved?: number;
    appliedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    approvedBy?: string;
    rejectionReason?: string;
    graceStartDate?: Date;
    graceEndDate?: Date;
    affiliateCode?: string;
    affiliateLink?: string;

    // Analytics e earnings
    totalVideos: number;
    approvedVideos: number;
    rejectedVideos: number;
    totalViews: number;
    monthlyEarnings: number;
    affiliateEarnings: number;
    referralCount: number;
  };

  // Affiliate system
  referredBy?: string; // ID do criador que referiu
  referralCode?: string; // Código único para referenciar outros

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    tipo: {
      type: String,
      enum: ["assinante", "criador", "visitante", "admin"],
      default: "visitante",
    },
    data_criacao: {
      type: Date,
      default: Date.now,
    },
    assinante: {
      type: Boolean,
      default: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ["ativo", "inativo"],
      default: "inativo",
    },
    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: false,
    },
    subscriptionStart: {
      type: Date,
      required: false,
    },
    subscriptionEnd: {
      type: Date,
      required: false,
    },
    comissaoPercentual: {
      type: Number,
      default: 70, // 70% para o criador
      min: 0,
      max: 100,
    },
    saldoDisponivel: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGanho: {
      type: Number,
      default: 0,
      min: 0,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatar: {
      type: String,
    },
    verificado: {
      type: Boolean,
      default: false,
    },
    creatorProfile: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        required: false,
      },
      whatsapp: {
        type: String,
        required: false,
      },
      portfolio: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      gracePeriod: {
        type: Number,
        min: 1,
        max: 3,
        required: false,
      },
      gracePeriodApproved: {
        type: Number,
        min: 1,
        max: 3,
        required: false,
      },
      appliedAt: {
        type: Date,
        required: false,
      },
      approvedAt: {
        type: Date,
        required: false,
      },
      rejectedAt: {
        type: Date,
        required: false,
      },
      approvedBy: {
        type: String,
        required: false,
      },
      rejectionReason: {
        type: String,
        required: false,
      },
      graceStartDate: {
        type: Date,
        required: false,
      },
      graceEndDate: {
        type: Date,
        required: false,
      },
      affiliateCode: {
        type: String,
        required: false,
      },
      affiliateLink: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Índices para otimização (email já tem unique: true)
UserSchema.index({ tipo: 1 });
UserSchema.index({ subscriptionStatus: 1 });

// Hash da senha antes de salvar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Erro ao comparar senhas");
  }
};

// Virtual para ID string
UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Remover senha do JSON de resposta
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = mongoose.model<IUser>("User", UserSchema);
export default User;
