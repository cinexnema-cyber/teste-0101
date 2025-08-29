import { RequestHandler } from "express";
import Video from "../models/Video";
import CreatorLimit from "../models/CreatorLimit";

/**
 * Handle Mux webhooks for video processing updates
 */
export const handleMuxWebhook: RequestHandler = async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log("Mux webhook received:", { type, assetId: data?.id });

    switch (type) {
      case "video.asset.ready":
        await handleAssetReady(data);
        break;

      case "video.asset.errored":
        await handleAssetErrored(data);
        break;

      case "video.upload.asset_created":
        await handleUploadAssetCreated(data);
        break;

      case "video.upload.cancelled":
      case "video.upload.errored":
        await handleUploadErrored(data);
        break;

      default:
        console.log("Unhandled Mux webhook type:", type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Mux webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

/**
 * Handle asset ready event
 */
const handleAssetReady = async (assetData: any) => {
  try {
    const { id: assetId, playback_ids, duration, aspect_ratio } = assetData;

    const video = await Video.findOne({ muxAssetId: assetId });

    if (!video) {
      console.warn("Video not found for asset:", assetId);
      return;
    }

    // Update video with processed information
    video.status = "pending_approval";
    video.processedAt = new Date();
    video.duration = duration ? Math.round(duration) : undefined;

    // Get the first playback ID (should be private)
    if (playback_ids && playback_ids.length > 0) {
      video.muxPlaybackId = playback_ids[0].id;
    }

    await video.save();

    console.log("Video processed successfully:", {
      videoId: video._id,
      title: video.title,
      duration: video.duration,
    });
  } catch (error) {
    console.error("Error handling asset ready:", error);
  }
};

/**
 * Handle asset errored event
 */
const handleAssetErrored = async (assetData: any) => {
  try {
    const { id: assetId, errors } = assetData;

    const video = await Video.findOne({ muxAssetId: assetId });

    if (!video) {
      console.warn("Video not found for asset:", assetId);
      return;
    }

    // Update video status to failed
    video.status = "failed";
    await video.save();

    // Revert creator storage
    const creatorLimit = await CreatorLimit.findOne({
      creatorId: video.creatorId,
    });
    if (creatorLimit) {
      await creatorLimit.removeVideo(video.fileSize);
    }

    console.log("Video processing failed:", {
      videoId: video._id,
      title: video.title,
      errors,
    });
  } catch (error) {
    console.error("Error handling asset errored:", error);
  }
};

/**
 * Handle upload asset created event (for direct uploads)
 */
const handleUploadAssetCreated = async (uploadData: any) => {
  try {
    const { id: uploadId, asset_id: assetId } = uploadData;

    // Find video by upload ID or title (for direct uploads, we might need to match differently)
    // This is a simplified approach - in production, you'd want to store the upload ID
    const videos = await Video.find({
      muxAssetId: "pending",
      status: "uploading",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    if (videos.length === 0) {
      console.warn("No pending videos found for upload:", uploadId);
      return;
    }

    // For now, take the most recent upload (in production, you'd match by upload ID)
    const video = videos[0];

    video.muxAssetId = assetId;
    video.status = "processing";
    await video.save();

    console.log("Upload asset created:", {
      videoId: video._id,
      title: video.title,
      assetId,
    });
  } catch (error) {
    console.error("Error handling upload asset created:", error);
  }
};

/**
 * Handle upload errored event
 */
const handleUploadErrored = async (uploadData: any) => {
  try {
    const { id: uploadId, error } = uploadData;

    // Find and update the failed video
    const videos = await Video.find({
      muxAssetId: "pending",
      status: "uploading",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (videos.length > 0) {
      const video = videos[0]; // Take the most recent
      video.status = "failed";
      await video.save();

      console.log("Upload failed:", {
        videoId: video._id,
        title: video.title,
        error,
      });
    }
  } catch (error) {
    console.error("Error handling upload errored:", error);
  }
};

/**
 * Verify Mux webhook signature (for production security)
 */
export const verifyMuxWebhook = (req: any, res: any, next: any) => {
  // In production, you should verify the webhook signature
  // const signature = req.headers['mux-signature'];
  // const body = req.body;
  //
  // if (!verifySignature(signature, body)) {
  //   return res.status(401).json({ error: 'Invalid signature' });
  // }

  next();
};

export default handleMuxWebhook;
