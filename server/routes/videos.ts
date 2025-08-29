import { Request, Response } from "express";
import Joi from "joi";
import Video from "../models/Video";
import CreatorBlocks from "../models/CreatorBlocks";
import User from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

// Validation schemas
const createVideoSchema = Joi.object({
  title: Joi.string().required().max(200),
  type: Joi.string().valid("filme", "serie").required(),
  season: Joi.number().min(1).optional().allow(null),
  episode: Joi.number().min(1).optional().allow(null),
  duration: Joi.number().min(1).required(), // em minutos
  releaseDate: Joi.date().optional(),
  director: Joi.string().optional(),
  cast: Joi.string().optional(), // será convertido para array
  genre: Joi.string().optional(), // será convertido para array
  synopsis: Joi.string().max(1000).optional(),
  language: Joi.string().default("Português"),
  thumbnailUrl: Joi.string().uri().optional(),
  videoUrl: Joi.string().uri().optional(),
  description: Joi.string().max(2000).optional(),
  category: Joi.string().optional(),
  tags: Joi.string().optional(),
  sizeGB: Joi.number().min(0).required(),
});

/**
 * Endpoint para criar/editar vídeo
 * POST /api/videos/create
 */
export const createVideo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("🎬 Tentativa de criação de vídeo:", {
      userId: req.userId,
      title: req.body.title,
      type: req.body.type,
      sizeGB: req.body.sizeGB,
    });

    const { error, value } = createVideoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      title,
      type,
      season,
      episode,
      duration,
      releaseDate,
      director,
      cast,
      genre,
      synopsis,
      language,
      thumbnailUrl,
      videoUrl,
      description,
      category,
      tags,
      sizeGB,
    } = value;

    // Verificar se usuário existe e é criador
    const user = await User.findById(req.userId);
    if (!user || user.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Apenas criadores podem fazer upload de vídeos",
      });
    }

    // Buscar ou criar registro de blocos do criador
    let creatorBlocks = await CreatorBlocks.findOne({ creatorId: req.userId });
    if (!creatorBlocks) {
      creatorBlocks = await CreatorBlocks.createForCreator(
        req.userId,
        user.nome,
      );
    }

    // Verificar disponibilidade de blocos
    const uploadCheck = creatorBlocks.canUploadVideo(sizeGB);
    if (!uploadCheck.canUpload) {
      return res.status(403).json({
        success: false,
        message: uploadCheck.reason,
        blocksNeeded: uploadCheck.blocksNeeded,
        blocksAvailable: creatorBlocks.getTotalAvailableBlocks(),
      });
    }

    // Validar campos específicos para séries
    if (type === "serie") {
      if (!season || !episode) {
        return res.status(400).json({
          success: false,
          message: "Temporada e episódio são obrigatórios para séries",
        });
      }
    }

    // Processar arrays (cast e genre)
    const castArray = cast
      ? cast
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];
    const genreArray = genre
      ? genre
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];
    const tagsArray = tags
      ? tags
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];

    // Criar vídeo
    const newVideo = new Video({
      creatorId: req.userId,
      creatorName: user.nome,
      title: title.trim(),
      description: description || synopsis || "",
      type,
      season: type === "serie" ? season : null,
      episode: type === "serie" ? episode : null,
      duration,
      releaseDate,
      director: director?.trim(),
      cast: castArray,
      genre: genreArray,
      synopsis: synopsis?.trim(),
      language,
      thumbnailUrl,
      videoUrl,

      // Technical fields (serão preenchidos pelo Mux)
      muxAssetId: `temp_${Date.now()}`, // Temporário
      muxPlaybackId: `temp_${Date.now()}`, // Temporário
      fileSize: Math.round(sizeGB * 1024 * 1024 * 1024), // Converter GB para bytes
      originalFilename: `${title}.mp4`,

      // Status
      status: "pending_approval",
      approved: false,

      // Metadata
      tags: tagsArray,
      category: category || "geral",
      isPrivate: true, // Sempre privado até aprovação

      // Analytics
      viewCount: 0,
      revenue: 0,

      uploadedAt: new Date(),
    });

    const savedVideo = await newVideo.save();

    // Reservar blocos para este vídeo
    await creatorBlocks.addVideo(savedVideo._id.toString(), title, sizeGB);

    console.log("✅ Vídeo criado com sucesso:", {
      videoId: savedVideo._id,
      title: savedVideo.title,
      type: savedVideo.type,
      blocksUsed: Math.ceil(sizeGB / 7.3),
    });

    res.json({
      success: true,
      message: "Vídeo enviado com sucesso! Aguardando aprovação.",
      video: {
        id: savedVideo._id,
        title: savedVideo.title,
        type: savedVideo.type,
        season: savedVideo.season,
        episode: savedVideo.episode,
        status: savedVideo.status,
        blocksUsed: Math.ceil(sizeGB / 7.3),
      },
      blocksInfo: {
        used: creatorBlocks.usedBlocks + Math.ceil(sizeGB / 7.3),
        available:
          creatorBlocks.getTotalAvailableBlocks() - Math.ceil(sizeGB / 7.3),
        total: creatorBlocks.totalBlocks,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao criar vídeo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * Endpoint para checar acesso e blocos disponíveis
 * GET /api/creator/access
 */
export const getCreatorAccess = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const creatorBlocks = await CreatorBlocks.findOne({
      creatorId: req.userId,
    });

    if (!creatorBlocks) {
      return res.json({
        access: false,
        message: "Aguardando dados reais",
        blocksAvailable: 0,
        blocksFree: 0,
        blocksPurchased: 0,
        freeBlockActive: false,
      });
    }

    const freeActive = creatorBlocks.getActiveFreeBlocks();
    const totalBlocks = freeActive + creatorBlocks.blocksPurchased;
    const availableBlocks = creatorBlocks.getTotalAvailableBlocks();

    res.json({
      access: totalBlocks > 0,
      blocksAvailable: availableBlocks,
      blocksFree: freeActive,
      blocksPurchased: creatorBlocks.blocksPurchased,
      blocksUsed: creatorBlocks.usedBlocks,
      freeBlockActive: creatorBlocks.isFreeBlockActive(),
      freeBlockExpiry: creatorBlocks.freeBlockExpiry,
      storageInfo: {
        totalGB: Math.round(totalBlocks * 7.3 * 100) / 100,
        usedGB: Math.round(creatorBlocks.usedStorageGB * 100) / 100,
        availableGB: Math.round(availableBlocks * 7.3 * 100) / 100,
      },
      videosUploaded: creatorBlocks.videos.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar acesso do criador:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Endpoint para listar vídeos do criador
 * GET /api/videos/creator/:creatorId
 */
export const getCreatorVideos = async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;

    const filter: any = { creatorId };
    if (status) {
      filter.status = status;
    }

    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Video.countDocuments(filter);

    res.json({
      success: true,
      videos: videos.map((video) => {
        const fallbackThumb =
          video.thumbnailUrl ||
          (video.muxPlaybackId
            ? `https://image.mux.com/${video.muxPlaybackId}/thumbnail.png`
            : null);
        return {
          id: video._id,
          title: video.title,
          type: video.type,
          season: video.season,
          episode: video.episode,
          duration: video.duration,
          status: video.status,
          approved: video.approved,
          viewCount: video.viewCount,
          revenue: video.revenue,
          uploadedAt: video.uploadedAt,
          approvedAt: video.approvedAt,
          thumbnailUrl: fallbackThumb,
        };
      }),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar vídeos do criador:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Endpoint para listar vídeos pendentes de aprovação (Admin)
 * GET /api/videos/pending-approval
 */
export const getPendingVideos = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Verificar se é admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas admins podem ver vídeos pendentes.",
      });
    }

    const videos = await Video.find({ status: "pending_approval" }).sort({
      uploadedAt: 1,
    }); // Mais antigos primeiro

    res.json({
      success: true,
      videos: videos.map((video) => ({
        id: video._id,
        title: video.title,
        type: video.type,
        season: video.season,
        episode: video.episode,
        duration: video.duration,
        director: video.director,
        cast: video.cast,
        genre: video.genre,
        synopsis: video.synopsis,
        creatorId: video.creatorId,
        creatorName: video.creatorName,
        uploadedAt: video.uploadedAt,
        thumbnailUrl:
          video.thumbnailUrl ||
          (video.muxPlaybackId
            ? `https://image.mux.com/${video.muxPlaybackId}/thumbnail.png`
            : null),
        videoUrl: video.videoUrl,
        fileSize: video.fileSize,
      })),
      total: videos.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar vídeos pendentes:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Endpoint para aprovar vídeo (Admin)
 * POST /api/videos/:videoId/approve
 */
export const approveVideo = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { videoId } = req.params;

    // Verificar se é admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas admins podem aprovar vídeos.",
      });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    // Aprovar vídeo
    video.status = "approved";
    video.approved = true;
    video.approvalStatus.approvedBy = req.userId;
    video.approvalStatus.approvedAt = new Date();
    video.approvedAt = new Date();
    video.isPrivate = false; // Tornar público após aprovação

    await video.save();

    // Atualizar status no CreatorBlocks
    const creatorBlocks = await CreatorBlocks.findOne({
      creatorId: video.creatorId,
    });
    if (creatorBlocks) {
      await creatorBlocks.updateVideoStatus(videoId, "approved");
    }

    console.log(`✅ Vídeo aprovado: ${video.title} por ${user.nome}`);

    res.json({
      success: true,
      message: "Vídeo aprovado com sucesso",
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        approvedAt: video.approvedAt,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao aprovar vídeo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Endpoint para rejeitar vídeo (Admin)
 * POST /api/videos/:videoId/reject
 */
export const rejectVideo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Motivo da rejeição é obrigatório",
      });
    }

    // Verificar se é admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas admins podem rejeitar vídeos.",
      });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    // Rejeitar vídeo
    video.status = "rejected";
    video.approved = false;
    video.approvalStatus.rejectedBy = req.userId;
    video.approvalStatus.rejectedAt = new Date();
    video.approvalStatus.rejectionReason = reason.trim();

    await video.save();

    // Devolver blocos ao criador
    const creatorBlocks = await CreatorBlocks.findOne({
      creatorId: video.creatorId,
    });
    if (creatorBlocks) {
      await creatorBlocks.removeVideo(videoId);
    }

    console.log(
      `❌ Vídeo rejeitado: ${video.title} por ${user.nome} - Motivo: ${reason}`,
    );

    res.json({
      success: true,
      message: "Vídeo rejeitado. Blocos devolvidos ao criador.",
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        rejectionReason: reason,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao rejeitar vídeo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Endpoint para obter detalhes de um vídeo
 * GET /api/videos/:videoId
 */
export const getVideoDetails = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        type: video.type,
        season: video.season,
        episode: video.episode,
        duration: video.duration,
        releaseDate: video.releaseDate,
        director: video.director,
        cast: video.cast,
        genre: video.genre,
        synopsis: video.synopsis,
        language: video.language,
        creatorId: video.creatorId,
        creatorName: video.creatorName,
        status: video.status,
        approved: video.approved,
        viewCount: video.viewCount,
        revenue: video.revenue,
        tags: video.tags,
        category: video.category,
        thumbnailUrl:
          video.thumbnailUrl ||
          (video.muxPlaybackId
            ? `https://image.mux.com/${video.muxPlaybackId}/thumbnail.png`
            : null),
        videoUrl:
          video.videoUrl ||
          (video.muxPlaybackId
            ? `https://stream.mux.com/${video.muxPlaybackId}.m3u8`
            : null),
        uploadedAt: video.uploadedAt,
        approvedAt: video.approvedAt,
        approvalStatus: video.approvalStatus,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar detalhes do vídeo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
