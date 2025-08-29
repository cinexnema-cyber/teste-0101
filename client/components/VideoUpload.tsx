import React, { useState, useRef } from "react";
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
  Trash2,
  Play,
  Pause,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface VideoUploadProps {
  onUploadComplete?: (video: any) => void;
  onUploadError?: (error: string) => void;
}

interface UploadProgress {
  percentage: number;
  status: "idle" | "uploading" | "processing" | "completed" | "error";
  message: string;
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

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

export const VideoUpload: React.FC<VideoUploadProps> = ({
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
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percentage: 0,
    status: "idle",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

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
      return "Arquivo muito grande. Máximo permitido: 2GB.";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setErrors({ file: validationError });
      return;
    }

    setSelectedFile(file);
    setErrors({});

    // Generate preview (just the filename and size for videos)
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Auto-fill title if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit upload using direct upload (Mux)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selectedFile || !user) return;

    setUploadProgress({
      percentage: 0,
      status: "uploading",
      message: "Criando upload...",
    });

    try {
      // Step 1: Create direct upload URL
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
        }),
      });

      if (!createUploadResponse.ok) {
        const errorData = await createUploadResponse.json();
        throw new Error(errorData.message || "Falha ao criar upload");
      }

      const { uploadUrl, videoId } = await createUploadResponse.json();

      setUploadProgress({
        percentage: 10,
        status: "uploading",
        message: "Enviando vídeo...",
      });

      // Step 2: Upload file directly to Mux
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

      // Step 3: Poll for completion (simplified - in real app you'd use webhooks)
      setTimeout(() => {
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
        setPreview(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

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
      }, 2000);
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
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-6 h-6 text-xnema-orange" />
          Upload de Vídeo
        </CardTitle>
        <CardDescription>
          Envie seu conteúdo para a plataforma XNEMA. Após o upload, seu vídeo
          passará por aprovação.
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
                  disabled={isUploading}
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
                      Tamanho máximo: 2GB
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
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    disabled={isUploading}
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

          {/* Video Metadata */}
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
                  disabled={isUploading}
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
                  disabled={isUploading}
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
                  disabled={isUploading}
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
                disabled={isUploading}
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
                {(uploadProgress.status === "uploading" ||
                  uploadProgress.status === "processing") && (
                  <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
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
              disabled={isUploading || !selectedFile}
              className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-medium"
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                  {uploadProgress.status === "uploading"
                    ? "Enviando..."
                    : "Processando..."}
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
            <strong>Diretrizes de Upload:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                • Vídeos passam por aprovação antes de ficarem disponíveis
              </li>
              <li>• Conteúdo deve respeitar as diretrizes da comunidade</li>
              <li>
                • Criadores em período de carência (3 meses) não pagam comissão
              </li>
              <li>
                • Após período de carência: 70% para o criador, 30% para a
                plataforma
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
