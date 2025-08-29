import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MuxHelpers } from "../config/mux";
import Video from "../models/Video";
import CreatorLimit from "../models/CreatorLimit";
import jwt from "jsonwebtoken";

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "videos");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for videos only
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const validation = MuxHelpers.validateVideoFile(file);

  if (validation.valid) {
    cb(null, true);
  } else {
    cb(new Error(validation.error), false);
  }
};

// Multer configuration
export const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
  },
});

/**
 * Create direct upload URL for frontend (recommended approach)
 */
export const createDirectUpload: RequestHandler = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Título e descrição são obrigatórios",
      });
    }

    // Check creator limits
    const creatorLimit = await CreatorLimit.getOrCreateForCreator(
      userId,
      req.body.creatorName || "Creator",
    );

    // For direct upload, we can't check exact file size yet, so we check basic limits
    const canUpload = creatorLimit.canUploadVideo(0); // We'll validate size on completion webhook

    if (!canUpload.canUpload) {
      return res.status(403).json({
        success: false,
        message: canUpload.reason,
      });
    }

    // Create Mux direct upload
    const uploadResult = await MuxHelpers.createDirectUpload({
      title,
      description,
      creatorId: userId,
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: "Falha ao criar upload direto",
        error: uploadResult.error,
      });
    }

    // Create video record in database (status: uploading)
    const video = new Video({
      title,
      description,
      muxAssetId: "pending", // Will be updated via webhook
      muxPlaybackId: "pending",
      creatorId: userId,
      creatorName: req.body.creatorName || "Creator",
      fileSize: 0, // Will be updated via webhook
      originalFilename: title,
      status: "uploading",
    });

    await video.save();

    res.json({
      success: true,
      uploadUrl: uploadResult.uploadUrl,
      uploadId: uploadResult.uploadId,
      videoId: video._id,
      message: "URL de upload criada com sucesso",
    });
  } catch (error) {
    console.error("Create direct upload error:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Traditional file upload endpoint (alternative approach)
 */
export const uploadVideo: RequestHandler = async (req, res) => {
  try {
    const { title, description, category = "geral", tags = [] } = req.body;
    const userId = (req as any).user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Título e descrição são obrigatórios",
      });
    }

    // Check creator limits
    const creatorLimit = await CreatorLimit.getOrCreateForCreator(
      userId,
      req.body.creatorName || "Creator",
    );
    const canUpload = creatorLimit.canUploadVideo(file.size);

    if (!canUpload.canUpload) {
      // Remove uploaded file
      fs.unlinkSync(file.path);

      return res.status(403).json({
        success: false,
        message: canUpload.reason,
      });
    }

    // Create video record in database
    const video = new Video({
      title,
      description,
      muxAssetId: "processing",
      muxPlaybackId: "processing",
      creatorId: userId,
      creatorName: req.body.creatorName || "Creator",
      fileSize: file.size,
      originalFilename: file.originalname,
      category,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      status: "processing",
    });

    await video.save();

    // Update creator storage
    await creatorLimit.addVideo(file.size);

    // Upload to Mux (this could be done asynchronously)
    const fileUrl = `file://${file.path}`; // Local file path
    const muxResult = await MuxHelpers.createAsset(fileUrl, {
      title,
      description,
      creatorId: userId,
    });

    if (muxResult.success && muxResult.asset) {
      // Update video with Mux information
      video.muxAssetId = muxResult.assetId!;
      video.muxPlaybackId = muxResult.playbackId!;
      video.status = "pending_approval";
      video.processedAt = new Date();

      await video.save();

      // Clean up local file
      fs.unlinkSync(file.path);
    } else {
      // Update video status to failed
      video.status = "failed";
      await video.save();

      // Revert creator storage
      await creatorLimit.removeVideo(file.size);

      // Clean up local file
      fs.unlinkSync(file.path);

      return res.status(500).json({
        success: false,
        message: "Falha no processamento do vídeo",
        error: muxResult.error,
      });
    }

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        thumbnailUrl: video.thumbnailUrl,
      },
      message: "Vídeo enviado com sucesso e está aguardando aprovação",
    });
  } catch (error) {
    console.error("Video upload error:", error);

    // Clean up file if exists
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("File cleanup error:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Erro no upload do vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get creator's videos
 */
export const getCreatorVideos: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    const query: any = { creatorId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalVideos = await Video.countDocuments(query);
    const totalPages = Math.ceil(totalVideos / Number(limit));

    // Get creator limits
    const creatorLimit = await CreatorLimit.getOrCreateForCreator(
      userId,
      "Creator",
    );

    res.json({
      success: true,
      videos: videos.map((video) => ({
        id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        viewCount: video.viewCount,
        revenue: video.revenue,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        uploadedAt: video.uploadedAt,
        approvedAt: video.approvedAt,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalVideos,
        pages: totalPages,
      },
      creatorStats: {
        storageUsedGB: creatorLimit.getStorageUsedGB(),
        storageLimitGB: creatorLimit.getStorageLimitGB(),
        storageUsedPercentage: creatorLimit.getStorageUsedPercentage(),
        videoCount: creatorLimit.videoCount,
        videoCountLimit: creatorLimit.videoCountLimit,
        graceMonthsLeft: creatorLimit.graceMonthsLeft,
        totalRevenue: creatorLimit.totalRevenue,
        totalViews: creatorLimit.totalViews,
      },
    });
  } catch (error) {
    console.error("Get creator videos error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar vídeos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get video by ID (for creator)
 */
export const getVideoById: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    const video = await Video.findOne({
      _id: videoId,
      creatorId: userId,
    });

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
        status: video.status,
        viewCount: video.viewCount,
        revenue: video.revenue,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        category: video.category,
        tags: video.tags,
        uploadedAt: video.uploadedAt,
        processedAt: video.processedAt,
        approvedAt: video.approvedAt,
        approvalStatus: video.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Get video by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update video metadata
 */
export const updateVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, category, tags } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    const video = await Video.findOne({
      _id: videoId,
      creatorId: userId,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    // Only allow updates for certain statuses
    if (!["pending_approval", "rejected"].includes(video.status)) {
      return res.status(400).json({
        success: false,
        message: "Vídeo não pode ser editado no status atual",
      });
    }

    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (category) video.category = category;
    if (tags) video.tags = Array.isArray(tags) ? tags : [tags].filter(Boolean);

    await video.save();

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        category: video.category,
        tags: video.tags,
      },
      message: "Vídeo atualizado com sucesso",
    });
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete video (creator can only delete rejected videos)
 */
export const deleteVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    const video = await Video.findOne({
      _id: videoId,
      creatorId: userId,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    // Only allow deletion of rejected or failed videos
    if (!["rejected", "failed"].includes(video.status)) {
      return res.status(400).json({
        success: false,
        message: "Apenas vídeos rejeitados ou com falha podem ser deletados",
      });
    }

    // Delete from Mux if asset exists
    if (
      video.muxAssetId &&
      video.muxAssetId !== "pending" &&
      video.muxAssetId !== "processing"
    ) {
      await MuxHelpers.deleteAsset(video.muxAssetId);
    }

    // Update creator storage
    const creatorLimit = await CreatorLimit.findOne({ creatorId: userId });
    if (creatorLimit) {
      await creatorLimit.removeVideo(video.fileSize);
    }

    // Delete video record
    await Video.findByIdAndDelete(videoId);

    res.json({
      success: true,
      message: "Vídeo deletado com sucesso",
    });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao deletar vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
