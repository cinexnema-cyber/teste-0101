import { Request, Response } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/auth";

// Content model schema
const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    category: {
      type: String,
      enum: ["series", "movie", "documentary", "short"],
      required: true,
    },
    tags: [String],
    thumbnailUrl: String,
    videoUrl: String,
    duration: Number, // in seconds
    views: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Content = mongoose.model("Content", contentSchema);

// Validation schemas
const uploadContentSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string()
    .valid("series", "movie", "documentary", "short")
    .required(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  thumbnailUrl: Joi.string().uri().optional(),
  videoUrl: Joi.string().uri().optional(),
  duration: Joi.number().positive().optional(),
});

export const uploadContent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { error, value } = uploadContentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      title,
      description,
      category,
      tags,
      thumbnailUrl,
      videoUrl,
      duration,
    } = value;
    const creatorId = req.userId;

    if (!creatorId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Create new content
    const content = new Content({
      title,
      description,
      category,
      tags: tags || [],
      thumbnailUrl,
      videoUrl,
      duration,
      creatorId,
      status: "pending",
    });

    await content.save();

    // Update creator's content count
    const User = require("../models/User").default;
    await User.findByIdAndUpdate(creatorId, {
      $inc: { "content.totalVideos": 1 },
    });

    res.status(201).json({
      success: true,
      message: "Conteúdo enviado para aprovação",
      content: content,
    });
  } catch (error) {
    console.error("Upload content error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getCreatorContent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const creatorId = req.userId;

    if (!creatorId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const content = await Content.find({ creatorId })
      .sort({ createdAt: -1 })
      .populate("approvedBy", "name email");

    res.json({ content });
  } catch (error) {
    console.error("Get creator content error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const updateContentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Only admins can update content status
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const { contentId } = req.params;
    const { status, feedback } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    content.status = status;
    if (status === "approved") {
      content.approvedDate = new Date();
      content.approvedBy = req.userId;
    }

    await content.save();

    // Update creator analytics if approved
    if (status === "approved") {
      const User = require("../models/User").default;
      await User.findByIdAndUpdate(content.creatorId, {
        $inc: {
          "content.totalVideos": 1,
          "content.totalViews": 0,
        },
      });
    }

    res.json({
      success: true,
      message: `Conteúdo ${status === "approved" ? "aprovado" : "rejeitado"} com sucesso`,
      content,
    });
  } catch (error) {
    console.error("Update content status error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const getPendingContent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Only admins can view pending content
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const pendingContent = await Content.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("creatorId", "name email");

    res.json({ content: pendingContent });
  } catch (error) {
    console.error("Get pending content error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const recordView = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    // Increment view count
    content.views += 1;

    // Calculate earnings (example: R$0.01 per view)
    const earningsPerView = 0.01;
    content.earnings += earningsPerView;

    await content.save();

    // Update creator's total views and earnings
    const User = require("../models/User").default;
    await User.findByIdAndUpdate(content.creatorId, {
      $inc: {
        "content.totalViews": 1,
        "content.totalEarnings": earningsPerView,
        "content.monthlyEarnings": earningsPerView,
      },
    });

    res.json({
      success: true,
      views: content.views,
      earnings: content.earnings,
    });
  } catch (error) {
    console.error("Record view error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export default Content;
