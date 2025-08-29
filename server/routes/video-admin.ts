import { RequestHandler } from "express";
import Video from "../models/Video";
import CreatorLimit from "../models/CreatorLimit";
import { MuxHelpers } from "../config/mux";

/**
 * Get all videos pending approval (admin only)
 */
export const getPendingVideos: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado. Apenas administradores podem acessar esta função.",
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const videos = await Video.find({ status: "pending_approval" })
      .sort({ uploadedAt: 1 }) // Oldest first
      .skip(skip)
      .limit(Number(limit));

    const totalVideos = await Video.countDocuments({
      status: "pending_approval",
    });
    const totalPages = Math.ceil(totalVideos / Number(limit));

    // Get creator information for each video
    const videosWithCreatorInfo = await Promise.all(
      videos.map(async (video) => {
        const creatorLimit = await CreatorLimit.findOne({
          creatorId: video.creatorId,
        });

        return {
          id: video._id,
          title: video.title,
          description: video.description,
          creatorId: video.creatorId,
          creatorName: video.creatorName,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          fileSize: video.fileSize,
          originalFilename: video.originalFilename,
          category: video.category,
          tags: video.tags,
          uploadedAt: video.uploadedAt,
          processedAt: video.processedAt,
          creatorStats: creatorLimit
            ? {
                storageUsedGB: creatorLimit.getStorageUsedGB(),
                videoCount: creatorLimit.videoCount,
                graceMonthsLeft: creatorLimit.graceMonthsLeft,
                totalRevenue: creatorLimit.totalRevenue,
              }
            : null,
        };
      }),
    );

    res.json({
      success: true,
      videos: videosWithCreatorInfo,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalVideos,
        pages: totalPages,
      },
      stats: {
        totalPending: totalVideos,
      },
    });
  } catch (error) {
    console.error("Get pending videos error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar vídeos pendentes",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all videos (admin only) with filters
 */
export const getAllVideos: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado. Apenas administradores podem acessar esta função.",
      });
    }

    const {
      status,
      creatorId,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (creatorId) query.creatorId = creatorId;

    const skip = (Number(page) - 1) * Number(limit);

    // Build sort object
    const sort: any = {};
    sort[String(sortBy)] = sortOrder === "desc" ? -1 : 1;

    const videos = await Video.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const totalVideos = await Video.countDocuments(query);
    const totalPages = Math.ceil(totalVideos / Number(limit));

    // Get statistics
    const stats = await Video.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalViews: { $sum: "$viewCount" },
          totalRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    res.json({
      success: true,
      videos: videos.map((video) => ({
        id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        creatorId: video.creatorId,
        creatorName: video.creatorName,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        fileSize: video.fileSize,
        viewCount: video.viewCount,
        revenue: video.revenue,
        category: video.category,
        tags: video.tags,
        uploadedAt: video.uploadedAt,
        processedAt: video.processedAt,
        approvedAt: video.approvedAt,
        approvalStatus: video.approvalStatus,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalVideos,
        pages: totalPages,
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalViews: stat.totalViews,
          totalRevenue: stat.totalRevenue,
        };
        return acc;
      }, {} as any),
    });
  } catch (error) {
    console.error("Get all videos error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar vídeos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Approve video (admin only)
 */
export const approveVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const adminId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem aprovar vídeos.",
      });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    if (video.status !== "pending_approval") {
      return res.status(400).json({
        success: false,
        message: "Vídeo não está aguardando aprovação",
      });
    }

    // Approve the video
    await video.approve(adminId);

    // Update creator statistics
    const creatorLimit = await CreatorLimit.findOne({
      creatorId: video.creatorId,
    });
    if (creatorLimit) {
      // This is where we could implement revenue calculation logic
      // For now, we'll just log the approval
      console.log(
        `Video approved: ${video.title} by creator ${video.creatorName}`,
      );
    }

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        approvedAt: video.approvedAt,
        approvedBy: video.approvalStatus.approvedBy,
      },
      message: "Vídeo aprovado com sucesso",
    });
  } catch (error) {
    console.error("Approve video error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao aprovar vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Reject video (admin only)
 */
export const rejectVideo: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem rejeitar vídeos.",
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Motivo da rejeição é obrigatório",
      });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    if (video.status !== "pending_approval") {
      return res.status(400).json({
        success: false,
        message: "Vídeo não está aguardando aprovação",
      });
    }

    // Reject the video
    await video.reject(adminId, reason.trim());

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        rejectedAt: video.approvalStatus.rejectedAt,
        rejectedBy: video.approvalStatus.rejectedBy,
        rejectionReason: video.approvalStatus.rejectionReason,
      },
      message: "Vídeo rejeitado com sucesso",
    });
  } catch (error) {
    console.error("Reject video error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao rejeitar vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete video (admin only)
 */
export const deleteVideoAdmin: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem deletar vídeos.",
      });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    // Delete from Mux if asset exists
    if (
      video.muxAssetId &&
      video.muxAssetId !== "pending" &&
      video.muxAssetId !== "processing"
    ) {
      const deleteResult = await MuxHelpers.deleteAsset(video.muxAssetId);
      if (!deleteResult.success) {
        console.warn(
          `Failed to delete Mux asset ${video.muxAssetId}:`,
          deleteResult.error,
        );
      }
    }

    // Update creator storage
    const creatorLimit = await CreatorLimit.findOne({
      creatorId: video.creatorId,
    });
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
    console.error("Delete video (admin) error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao deletar vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get video details for admin review
 */
export const getVideoForReview: RequestHandler = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem revisar vídeos.",
      });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Vídeo não encontrado",
      });
    }

    // Get creator information
    const creatorLimit = await CreatorLimit.findOne({
      creatorId: video.creatorId,
    });

    // Get Mux asset information if available
    let muxAssetInfo = null;
    if (
      video.muxAssetId &&
      video.muxAssetId !== "pending" &&
      video.muxAssetId !== "processing"
    ) {
      const assetResult = await MuxHelpers.getAsset(video.muxAssetId);
      if (assetResult.success) {
        muxAssetInfo = {
          status: assetResult.asset.status,
          duration: assetResult.asset.duration,
          aspectRatio: assetResult.asset.aspect_ratio,
          createdAt: assetResult.asset.created_at,
        };
      }
    }

    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        status: video.status,
        creatorId: video.creatorId,
        creatorName: video.creatorName,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        fileSize: video.fileSize,
        originalFilename: video.originalFilename,
        category: video.category,
        tags: video.tags,
        viewCount: video.viewCount,
        revenue: video.revenue,
        uploadedAt: video.uploadedAt,
        processedAt: video.processedAt,
        approvedAt: video.approvedAt,
        approvalStatus: video.approvalStatus,
        muxAssetId: video.muxAssetId,
        muxPlaybackId: video.muxPlaybackId,
      },
      creatorInfo: creatorLimit
        ? {
            storageUsedGB: creatorLimit.getStorageUsedGB(),
            storageLimitGB: creatorLimit.getStorageLimitGB(),
            videoCount: creatorLimit.videoCount,
            videoCountLimit: creatorLimit.videoCountLimit,
            graceMonthsLeft: creatorLimit.graceMonthsLeft,
            isGracePeriod: creatorLimit.isGracePeriod,
            totalRevenue: creatorLimit.totalRevenue,
            totalViews: creatorLimit.totalViews,
          }
        : null,
      muxInfo: muxAssetInfo,
    });
  } catch (error) {
    console.error("Get video for review error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar detalhes do vídeo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats: RequestHandler = async (req, res) => {
  try {
    const userRole = (req as any).user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado. Apenas administradores podem acessar estatísticas.",
      });
    }

    // Get video statistics
    const videoStats = await Video.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalViews: { $sum: "$viewCount" },
          totalRevenue: { $sum: "$revenue" },
          totalSize: { $sum: "$fileSize" },
        },
      },
    ]);

    // Get creator statistics
    const creatorStats = await CreatorLimit.aggregate([
      {
        $group: {
          _id: null,
          totalCreators: { $sum: 1 },
          totalStorageUsed: { $sum: "$storageUsed" },
          totalVideoCount: { $sum: "$videoCount" },
          gracePeriodCreators: {
            $sum: { $cond: ["$isGracePeriod", 1, 0] },
          },
        },
      },
    ]);

    // Get recent activity
    const recentVideos = await Video.find()
      .sort({ uploadedAt: -1 })
      .limit(10)
      .select("title creatorName status uploadedAt");

    const pendingCount = await Video.countDocuments({
      status: "pending_approval",
    });

    res.json({
      success: true,
      stats: {
        videos: videoStats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalViews: stat.totalViews,
            totalRevenue: stat.totalRevenue,
            totalSizeGB:
              Math.round((stat.totalSize / (1024 * 1024 * 1024)) * 100) / 100,
          };
          return acc;
        }, {} as any),
        creators: creatorStats[0] || {
          totalCreators: 0,
          totalStorageUsed: 0,
          totalVideoCount: 0,
          gracePeriodCreators: 0,
        },
        pending: {
          videos: pendingCount,
        },
      },
      recentActivity: recentVideos,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar estatísticas",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
