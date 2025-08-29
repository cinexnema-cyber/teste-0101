import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Video,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileVideo,
  X,
  CreditCard,
  Calculator,
  HardDrive,
  Zap,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  VideoBlockCalculator,
  CalculationResult,
} from "./VideoBlockCalculator";

interface VideoUploadWithBlocksProps {
  onUploadComplete?: (video: any) => void;
  onUploadError?: (error: string) => void;
}

interface UploadProgress {
  percentage: number;
  status:
    | "idle"
    | "checking"
    | "calculating"
    | "payment_required"
    | "uploading"
    | "processing"
    | "completed"
    | "error";
  message: string;
}

interface VideoMetadata {
  duration?: number; // in minutes
  resolution?: string;
  sizeGB?: number;
}

interface CreatorBlocksInfo {
  totalBlocks: number;
  usedBlocks: number;
  availableBlocks: number;
  canUpload: boolean;
}

const CATEGORIES = [
  { value: "ficcao", label: "Ficção" },
  { value: "documentario", label: "Documentário" },
  { value: "drama", label: "Drama" },
  { value: "comedia", label: "Comédia" },
  { value: "acao", label: "Ação" },
  { value: "terror", label: "Terror" },
  { value: "romance", label: "Romance" },
  { value: "animacao", label: "Animação" },
  { value: "geral", label: "Geral" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

export const VideoUploadWithBlocks: React.FC<VideoUploadWithBlocksProps> = ({
  onUploadComplete,
  onUploadError,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "geral",
    tags: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({});
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null,
  );
  const [creatorBlocks, setCreatorBlocks] = useState<CreatorBlocksInfo | null>(
    null,
  );

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percentage: 0,
    status: "idle",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [needsPayment, setNeedsPayment] = useState(false);

  // Load creator blocks info on component mount
  useEffect(() => {
    if (user) {
      fetchCreatorBlocks();
    }
  }, [user]);

  // Update calculation when file metadata changes
  useEffect(() => {
    if (videoMetadata.sizeGB) {
      // Calculation will be handled by VideoBlockCalculator component
    }
  }, [videoMetadata]);

  const fetchCreatorBlocks = async () => {
    try {
      const response = await fetch(`/api/creator-blocks/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCreatorBlocks({
          totalBlocks: result.creatorBlocks.totalBlocks,
          usedBlocks: result.creatorBlocks.usedBlocks,
          availableBlocks: result.creatorBlocks.availableBlocks,
          canUpload: result.creatorBlocks.canUpload,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar informações de blocos:", error);
    }
  };

  // Extract video metadata (duration, resolution, size)
  const extractVideoMetadata = async (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration / 60); // Convert to minutes
        const sizeGB = file.size / (1024 * 1024 * 1024); // Convert to GB

        // Estimate resolution based on file size and duration (simplified)
        let resolution = "1080p";
        const sizePerMinute = sizeGB / duration;

        if (sizePerMinute < 0.03) {
          resolution = "720p";
        } else if (sizePerMinute > 0.08) {
          resolution = "4k";
        }

        resolve({
          duration,
          resolution,
          sizeGB: Math.round(sizeGB * 100) / 100,
        });

        // Cleanup
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        // Fallback metadata
        const sizeGB = file.size / (1024 * 1024 * 1024);
        resolve({
          duration: 60, // Default 1 hour
          resolution: "1080p",
          sizeGB: Math.round(sizeGB * 100) / 100,
        });
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Tipo de arquivo não suportado. Use MP4, MOV, AVI ou WebM.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Arquivo muito grande. Máximo permitido: 10GB.";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setErrors({ file: validationError });
      return;
    }

    setSelectedFile(file);
    setErrors({});
    setUploadProgress({
      percentage: 10,
      status: "checking",
      message: "Analisando vídeo...",
    });

    // Extract metadata
    try {
      const metadata = await extractVideoMetadata(file);
      setVideoMetadata(metadata);

      setUploadProgress({
        percentage: 30,
        status: "calculating",
        message: "Calculando blocos necessários...",
      });

      // Auto-fill title if empty
      if (!formData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
      }

      // Check upload capacity
      await checkUploadCapacity(metadata.sizeGB || 0);
    } catch (error) {
      setUploadProgress({
        percentage: 0,
        status: "error",
        message: "Erro ao analisar vídeo",
      });
    }
  };

  // Check if creator can upload this video
  const checkUploadCapacity = async (sizeGB: number) => {
    try {
      const response = await fetch(
        `/api/creator-blocks/${user?.id}/check-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
          },
          body: JSON.stringify({ sizeGB }),
        },
      );

      const result = await response.json();

      if (result.canUpload) {
        setUploadProgress({
          percentage: 0,
          status: "idle",
          message: "",
        });
        setNeedsPayment(false);
      } else {
        setUploadProgress({
          percentage: 0,
          status: "payment_required",
          message: result.reason || "Blocos insuficientes",
        });
        setNeedsPayment(true);
      }
    } catch (error) {
      setUploadProgress({
        percentage: 0,
        status: "error",
        message: "Erro ao verificar capacidade de upload",
      });
    }
  };

  // Handle calculation change from VideoBlockCalculator
  const handleCalculationChange = (result: CalculationResult) => {
    setCalculation(result);

    // Update payment requirement based on calculation
    if (creatorBlocks && !result.canAfford) {
      setNeedsPayment(true);
      setUploadProgress({
        percentage: 0,
        status: "payment_required",
        message: `Necessário ${result.blocksNeeded} blocos. Disponível: ${creatorBlocks.availableBlocks}`,
      });
    } else if (result.canAfford) {
      setNeedsPayment(false);
      setUploadProgress({
        percentage: 0,
        status: "idle",
        message: "",
      });
    }
  };

  // Handle purchase blocks
  const handlePurchaseBlocks = async (blocks: number) => {
    try {
      const response = await fetch(`/api/creator-blocks/${user?.id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({ blocks }),
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar compra");
      }

      const result = await response.json();

      // Redirect to Mercado Pago
      window.location.href = result.purchase.checkoutUrl;
    } catch (error) {
      console.error("Erro na compra:", error);
      setErrors({ payment: "Erro ao processar pagamento" });
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    } else if (formData.title.length > 200) {
      newErrors.title = "Título deve ter no máximo 200 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Descrição deve ter no máximo 2000 caracteres";
    }

    if (!selectedFile) {
      newErrors.file = "Selecione um arquivo de vídeo";
    }

    if (needsPayment) {
      newErrors.payment = "Compre blocos adicionais antes de fazer upload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selectedFile || !user || needsPayment) return;

    setUploadProgress({
      percentage: 0,
      status: "uploading",
      message: "Reservando blocos...",
    });

    try {
      // First, reserve blocks for this video
      const reserveResponse = await fetch(
        `/api/creator-blocks/${user.id}/add-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
          },
          body: JSON.stringify({
            videoId: "temp_" + Date.now(), // Temporary ID
            title: formData.title.trim(),
            sizeGB: videoMetadata.sizeGB || 1,
          }),
        },
      );

      if (!reserveResponse.ok) {
        const errorData = await reserveResponse.json();
        throw new Error(errorData.message || "Erro ao reservar blocos");
      }

      setUploadProgress({
        percentage: 20,
        status: "uploading",
        message: "Criando upload...",
      });

      // Create direct upload URL
      const createUploadResponse = await fetch("/api/videos/direct-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          creatorName: user.name,
          metadata: videoMetadata,
        }),
      });

      if (!createUploadResponse.ok) {
        const errorData = await createUploadResponse.json();
        throw new Error(errorData.message || "Falha ao criar upload");
      }

      const { uploadUrl, videoId } = await createUploadResponse.json();

      setUploadProgress({
        percentage: 30,
        status: "uploading",
        message: "Enviando vídeo...",
      });

      // Upload file directly to Mux
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha no upload do arquivo");
      }

      setUploadProgress({
        percentage: 80,
        status: "processing",
        message: "Processando vídeo...",
      });

      // Update blocks with real video ID
      await fetch(`/api/creator-blocks/${user.id}/add-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("xnema_token")}`,
        },
        body: JSON.stringify({
          videoId,
          title: formData.title.trim(),
          sizeGB: videoMetadata.sizeGB || 1,
        }),
      });

      setUploadProgress({
        percentage: 100,
        status: "completed",
        message: "Upload concluído! Vídeo aguardando aprovação.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "geral",
        tags: "",
      });
      setSelectedFile(null);
      setVideoMetadata({});
      setCalculation(null);
      setNeedsPayment(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh creator blocks
      await fetchCreatorBlocks();

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete({ id: videoId, title: formData.title });
      }

      // Reset progress after delay
      setTimeout(() => {
        setUploadProgress({
          percentage: 0,
          status: "idle",
          message: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro no upload";

      setUploadProgress({
        percentage: 0,
        status: "error",
        message: errorMessage,
      });

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  // Clear file selection
  const clearFile = () => {
    setSelectedFile(null);
    setVideoMetadata({});
    setCalculation(null);
    setNeedsPayment(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadProgress({
      percentage: 0,
      status: "idle",
      message: "",
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isUploading =
    uploadProgress.status === "uploading" ||
    uploadProgress.status === "processing";
  const isAnalyzing =
    uploadProgress.status === "checking" ||
    uploadProgress.status === "calculating";

  return (
    <div className="space-y-8">
      {/* Creator Blocks Status */}
      {creatorBlocks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-500" />
              Status dos Blocos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {creatorBlocks.availableBlocks}
                </p>
                <p className="text-sm text-muted-foreground">
                  Blocos Disponíveis
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {creatorBlocks.usedBlocks}
                </p>
                <p className="text-sm text-muted-foreground">Blocos Usados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {creatorBlocks.totalBlocks}
                </p>
                <p className="text-sm text-muted-foreground">Total de Blocos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Upload Form */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6 text-xnema-orange" />
            Upload de Vídeo com Sistema de Blocos
          </CardTitle>
          <CardDescription>
            Envie seu conteúdo. O sistema calculará automaticamente os blocos
            necessários.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <Label htmlFor="video-file">Arquivo de Vídeo</Label>

              {!selectedFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-xnema-orange bg-xnema-orange/10"
                      : "border-border hover:border-xnema-orange/50"
                  } ${errors.file ? "border-red-500" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="video-file"
                    accept=".mp4,.mov,.avi,.webm"
                    onChange={handleFileInputChange}
                    disabled={isUploading || isAnalyzing}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium">
                        Arraste seu vídeo aqui ou clique para selecionar
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Formatos suportados: MP4, MOV, AVI, WebM
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tamanho máximo: 10GB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileVideo className="w-10 h-10 text-xnema-orange" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                          {videoMetadata.duration &&
                            ` • ${videoMetadata.duration} min`}
                          {videoMetadata.resolution &&
                            ` • ${videoMetadata.resolution}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      disabled={isUploading || isAnalyzing}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {errors.file && (
                <p className="text-sm text-red-500">{errors.file}</p>
              )}
            </div>

            {/* Video Metadata & Calculator */}
            {selectedFile && videoMetadata.sizeGB && (
              <VideoBlockCalculator
                onCalculationChange={handleCalculationChange}
                maxBlocksAvailable={creatorBlocks?.availableBlocks || 0}
              />
            )}

            {/* Payment Required Warning */}
            {needsPayment && calculation && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <ShoppingCart className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <div className="space-y-3">
                    <p>
                      <strong>Blocos Insuficientes:</strong> Este vídeo precisa
                      de {calculation.blocksNeeded} blocos, mas você tem apenas{" "}
                      {creatorBlocks?.availableBlocks || 0} disponíveis.
                    </p>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() =>
                          handlePurchaseBlocks(
                            Math.max(
                              1,
                              calculation.blocksNeeded -
                                (creatorBlocks?.availableBlocks || 0),
                            ),
                          )
                        }
                        className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Comprar{" "}
                        {Math.max(
                          1,
                          calculation.blocksNeeded -
                            (creatorBlocks?.availableBlocks || 0),
                        )}{" "}
                        Bloco(s)
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Video Metadata Form */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Vídeo</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Digite o título do vídeo"
                    maxLength={200}
                    disabled={isUploading || isAnalyzing}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.title.length}/200 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                    disabled={isUploading || isAnalyzing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (opcional)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    disabled={isUploading || isAnalyzing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as tags com vírgulas
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descreva seu vídeo..."
                  rows={8}
                  maxLength={2000}
                  disabled={isUploading || isAnalyzing}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/2000 caracteres
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress.status !== "idle" && (
              <Alert
                className={`${
                  uploadProgress.status === "error"
                    ? "border-red-500 bg-red-50 dark:bg-red-950"
                    : uploadProgress.status === "completed"
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : uploadProgress.status === "payment_required"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                        : "border-blue-500 bg-blue-50 dark:bg-blue-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  {uploadProgress.status === "error" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {uploadProgress.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadProgress.status === "payment_required" && (
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                  )}
                  {(uploadProgress.status === "uploading" ||
                    uploadProgress.status === "processing") && (
                    <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
                  )}
                  {(uploadProgress.status === "checking" ||
                    uploadProgress.status === "calculating") && (
                    <Calculator className="h-4 w-4 text-blue-500 animate-pulse" />
                  )}

                  <AlertDescription className="flex-1">
                    <div className="space-y-2">
                      <p>{uploadProgress.message}</p>
                      {uploadProgress.percentage > 0 &&
                        uploadProgress.status !== "completed" && (
                          <Progress
                            value={uploadProgress.percentage}
                            className="w-full"
                          />
                        )}
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  isUploading || isAnalyzing || !selectedFile || needsPayment
                }
                className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-medium"
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    {uploadProgress.status === "uploading"
                      ? "Enviando..."
                      : "Processando..."}
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Calculator className="w-4 h-4 mr-2 animate-pulse" />
                    Analisando...
                  </>
                ) : needsPayment ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Comprar Blocos Primeiro
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Vídeo
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Upload Guidelines */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sistema de Blocos:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• 1 bloco = 7,3 GB de armazenamento = R$ 1.000</li>
                <li>
                  • Blocos são calculados automaticamente baseado no tamanho do
                  vídeo
                </li>
                <li>• Pagamento via Mercado Pago com liberação automática</li>
                <li>
                  • Vídeos passam por aprovação antes de ficarem disponíveis
                </li>
                <li>
                  • Após aprovação: 70% para o criador, 30% para a plataforma
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoUploadWithBlocks;
