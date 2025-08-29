import Mux from "@mux/mux-node";

// Mux credentials from environment or defaults
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID || "q3phve8l5rrei2ttt66viq3j0";
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || "";

if (!MUX_TOKEN_SECRET) {
  console.warn("⚠️  MUX_TOKEN_SECRET not set. Video uploads may fail.");
}

// Initialize Mux client
const mux = new Mux({
  tokenId: MUX_TOKEN_ID,
  tokenSecret: MUX_TOKEN_SECRET,
});

// Mux configuration
export const MUX_CONFIG = {
  // Video encoding settings
  encoding: {
    mp4_support: "standard" as const,
    normalize_audio: true,
    video_quality: "plus" as const,
  },

  // Playback policy (private for security)
  playback_policy: ["private"],

  // Default test mode (set to false in production)
  test: process.env.NODE_ENV !== "production",
};

// Helper functions for Mux operations
export const MuxHelpers = {
  /**
   * Create a new Mux asset from uploaded video
   */
  createAsset: async (
    videoUrl: string,
    metadata: {
      title: string;
      description: string;
      creatorId: string;
    },
  ) => {
    try {
      const asset = await mux.video.assets.create({
        input: [{ url: videoUrl }],
        playback_policy: MUX_CONFIG.playback_policy as any,
        mp4_support: MUX_CONFIG.encoding.mp4_support,
        normalize_audio: MUX_CONFIG.encoding.normalize_audio,
        video_quality: MUX_CONFIG.encoding.video_quality,
        test: MUX_CONFIG.test,
        master_access: "none",
      });

      return {
        success: true,
        asset,
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id,
      };
    } catch (error) {
      console.error("Mux asset creation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Create a direct upload URL for frontend
   */
  createDirectUpload: async (metadata: {
    title: string;
    description: string;
    creatorId: string;
  }) => {
    try {
      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          playback_policy: MUX_CONFIG.playback_policy as any,
          mp4_support: MUX_CONFIG.encoding.mp4_support,
          normalize_audio: MUX_CONFIG.encoding.normalize_audio,
          video_quality: MUX_CONFIG.encoding.video_quality,
          test: MUX_CONFIG.test,
          master_access: "none",
        },
        cors_origin: process.env.FRONTEND_URL || "http://localhost:8080",
      });

      return {
        success: true,
        upload,
        uploadId: upload.id,
        uploadUrl: upload.url,
      };
    } catch (error) {
      console.error("Mux direct upload creation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Get asset information
   */
  getAsset: async (assetId: string) => {
    try {
      const asset = await mux.video.assets.retrieve(assetId);
      return {
        success: true,
        asset,
      };
    } catch (error) {
      console.error("Mux asset retrieval failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Generate signed playback URL for private videos
   * Note: This requires Mux signing keys to be configured
   */
  generateSignedUrl: async (playbackId: string, expirationTime?: number) => {
    try {
      // For now, return the basic playback URL
      // In production, you would implement proper signed URLs
      return {
        success: true,
        signedUrl: `https://stream.mux.com/${playbackId}.m3u8`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error("Mux signed URL generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Delete a Mux asset
   */
  deleteAsset: async (assetId: string) => {
    try {
      await mux.video.assets.delete(assetId);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Mux asset deletion failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Get video thumbnail URL
   */
  getThumbnailUrl: (
    playbackId: string,
    options?: {
      width?: number;
      height?: number;
      format?: "jpg" | "png" | "gif";
      time?: number;
    },
  ) => {
    const {
      width = 640,
      height = 360,
      format = "jpg",
      time = 0,
    } = options || {};
    return `https://image.mux.com/${playbackId}/thumbnail.${format}?width=${width}&height=${height}&time=${time}`;
  },

  /**
   * Validate video file before upload
   */
  validateVideoFile: (file: any) => {
    const validTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB

    if (!validTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error:
          "Tipo de arquivo inválido. Apenas MP4, MOV, AVI e WebM são permitidos.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Arquivo muito grande. Máximo permitido: 2GB.",
      };
    }

    return {
      valid: true,
    };
  },
};

export default mux;
export { mux };
