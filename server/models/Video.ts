import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document {
  id: string;
  titulo: string;
  descricao?: string;
  url: string;
  thumbnail?: string;
  id_criador: mongoose.Types.ObjectId;
  data_upload: Date;
  status: "ativo" | "inativo" | "processando" | "rejeitado";
  categoria: string;
  tags: string[];
  duracao?: number; // em segundos
  visualizacoes: number;
  curtidas: number;
  tipo: "video" | "serie" | "filme";
  temporada?: number;
  episodio?: number;
  preco_individual?: number; // preço para compra individual (em centavos)
  premium: boolean; // se requer assinatura
  data_publicacao?: Date;
  metadados: {
    resolucao?: string;
    formato?: string;
    tamanho_arquivo?: number;
    fps?: number;
  };
}

const VideoSchema = new Schema<IVideo>(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    descricao: {
      type: String,
      maxlength: 2000,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    id_criador: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data_upload: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["ativo", "inativo", "processando", "rejeitado"],
      default: "processando",
    },
    categoria: {
      type: String,
      required: true,
      enum: [
        "acao",
        "aventura",
        "comedia",
        "drama",
        "ficcao_cientifica",
        "horror",
        "romance",
        "thriller",
        "documentario",
        "animacao",
        "musical",
        "guerra",
        "crime",
        "biografia",
        "historia",
        "familia",
        "misterio",
        "fantasia",
        "western",
        "esporte",
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    duracao: {
      type: Number,
      min: 0,
    },
    visualizacoes: {
      type: Number,
      default: 0,
      min: 0,
    },
    curtidas: {
      type: Number,
      default: 0,
      min: 0,
    },
    tipo: {
      type: String,
      enum: ["video", "serie", "filme"],
      default: "video",
    },
    temporada: {
      type: Number,
      min: 1,
    },
    episodio: {
      type: Number,
      min: 1,
    },
    preco_individual: {
      type: Number,
      min: 0, // preço em centavos
    },
    premium: {
      type: Boolean,
      default: true, // por padrão, conteúdo requer assinatura
    },
    data_publicacao: {
      type: Date,
    },
    metadados: {
      resolucao: String,
      formato: String,
      tamanho_arquivo: Number,
      fps: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Índices para otimização
VideoSchema.index({ id_criador: 1 });
VideoSchema.index({ status: 1 });
VideoSchema.index({ categoria: 1 });
VideoSchema.index({ premium: 1 });
VideoSchema.index({ data_publicacao: -1 });
VideoSchema.index({ visualizacoes: -1 });
VideoSchema.index({ curtidas: -1 });

// Índice composto para séries
VideoSchema.index({ tipo: 1, temporada: 1, episodio: 1 });

// Virtual para ID string
VideoSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Virtual para criador populado
VideoSchema.virtual("criador", {
  ref: "User",
  localField: "id_criador",
  foreignField: "_id",
  justOne: true,
});

// Método para incrementar visualizações
VideoSchema.methods.incrementarVisualizacoes = function () {
  this.visualizacoes += 1;
  return this.save();
};

// Método para incrementar curtidas
VideoSchema.methods.incrementarCurtidas = function () {
  this.curtidas += 1;
  return this.save();
};

export const Video = mongoose.model<IVideo>("Video", VideoSchema);
export default Video;
