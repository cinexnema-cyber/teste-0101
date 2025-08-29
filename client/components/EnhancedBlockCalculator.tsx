import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  HardDrive,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle,
  Zap,
  Clock,
  FileVideo,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface VideoSpecs {
  duration: number; // minutes
  resolution: "720p" | "1080p" | "4k";
  quantity: number;
}

interface CalculationResult {
  totalSizeGB: number;
  blocksNeeded: number;
  totalPrice: number;
  pricePerBlock: number;
  breakdown: {
    sizePerVideo: number;
    blocksPerVideo: number;
    freeMonthsApplied: number;
    actualCost: number;
  };
  canAfford: boolean;
  availableBlocks: number;
}

interface CreatorBlocksInfo {
  totalBlocks: number;
  usedBlocks: number;
  availableBlocks: number;
  freeMonthsLeft: number;
  isGracePeriod: boolean;
}

// Video size calculation based on resolution and bitrate
const VIDEO_SPECS = {
  "720p": {
    sizePerMinute: 0.0183, // GB per minute (approx 146MB for 8min = 18.25MB/min)
    bitrate: "2.5 Mbps",
    quality: "HD",
  },
  "1080p": {
    sizePerMinute: 0.0365, // GB per minute (approx 292MB for 8min = 36.5MB/min)
    bitrate: "5 Mbps",
    quality: "Full HD",
  },
  "4k": {
    sizePerMinute: 0.1095, // GB per minute (approx 876MB for 8min = 109.5MB/min)
    bitrate: "15 Mbps",
    quality: "Ultra HD",
  },
};

const BLOCK_SIZE_GB = 7.3;
const BLOCK_PRICE = 1000; // R$ 1000 per block

interface EnhancedBlockCalculatorProps {
  onCalculationChange?: (result: CalculationResult | null) => void;
  onPaymentRequired?: (blocksNeeded: number, totalPrice: number) => void;
  className?: string;
}

export const EnhancedBlockCalculator: React.FC<
  EnhancedBlockCalculatorProps
> = ({ onCalculationChange, onPaymentRequired, className = "" }) => {
  const { user } = useAuth();
  const [videoSpecs, setVideoSpecs] = useState<VideoSpecs>({
    duration: 40,
    resolution: "1080p",
    quantity: 1,
  });

  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null,
  );
  const [creatorBlocks, setCreatorBlocks] = useState<CreatorBlocksInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchCreatorBlocks();
    }
  }, [user]);

  useEffect(() => {
    calculateBlocks();
  }, [videoSpecs, creatorBlocks]);

  const fetchCreatorBlocks = async () => {
    try {
      setLoading(true);
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
          freeMonthsLeft: user?.freeMonthsRemaining || 0,
          isGracePeriod: (user?.freeMonthsRemaining || 0) > 0,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar blocos:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBlocks = () => {
    if (
      !videoSpecs.duration ||
      !videoSpecs.resolution ||
      !videoSpecs.quantity
    ) {
      setCalculation(null);
      if (onCalculationChange) onCalculationChange(null);
      return;
    }

    const specs = VIDEO_SPECS[videoSpecs.resolution];
    const sizePerVideo = videoSpecs.duration * specs.sizePerMinute;
    const totalSizeGB = sizePerVideo * videoSpecs.quantity;
    const blocksPerVideo = Math.ceil(sizePerVideo / BLOCK_SIZE_GB);
    const blocksNeeded = Math.ceil(totalSizeGB / BLOCK_SIZE_GB);

    // Factor in grace period (first month free for new creators)
    const isGracePeriod = creatorBlocks?.isGracePeriod || false;
    const freeMonthsApplied = isGracePeriod ? 1 : 0;

    // Calculate actual cost (considering grace period)
    let actualCost = blocksNeeded * BLOCK_PRICE;
    if (freeMonthsApplied > 0) {
      actualCost = 0; // First month is free
    }

    const result: CalculationResult = {
      totalSizeGB: Math.round(totalSizeGB * 100) / 100,
      blocksNeeded,
      totalPrice: actualCost,
      pricePerBlock: BLOCK_PRICE,
      breakdown: {
        sizePerVideo: Math.round(sizePerVideo * 100) / 100,
        blocksPerVideo,
        freeMonthsApplied,
        actualCost,
      },
      canAfford: creatorBlocks
        ? blocksNeeded <= creatorBlocks.availableBlocks
        : false,
      availableBlocks: creatorBlocks?.availableBlocks || 0,
    };

    setCalculation(result);
    if (onCalculationChange) onCalculationChange(result);
  };

  const handleInputChange = (
    field: keyof VideoSpecs,
    value: string | number,
  ) => {
    setVideoSpecs((prev) => ({
      ...prev,
      [field]:
        typeof value === "string"
          ? field === "resolution"
            ? value
            : Number(value)
          : value,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleBuyBlocks = () => {
    if (calculation && onPaymentRequired) {
      const blocksNeeded = Math.max(
        1,
        calculation.blocksNeeded - calculation.availableBlocks,
      );
      onPaymentRequired(blocksNeeded, blocksNeeded * BLOCK_PRICE);
    }
  };

  const getResolutionRecommendation = () => {
    const { duration } = videoSpecs;

    if (duration <= 30) {
      return {
        recommended: "4k",
        reason: "Para vídeos curtos, 4K oferece máxima qualidade",
      };
    } else if (duration <= 90) {
      return {
        recommended: "1080p",
        reason: "Melhor equilíbrio entre qualidade e tamanho",
      };
    } else {
      return {
        recommended: "720p",
        reason: "Para vídeos longos, HD economiza espaço",
      };
    }
  };

  const recommendation = getResolutionRecommendation();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calculadora Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-xnema-orange" />
            Calculadora Inteligente de Blocos
          </CardTitle>
          <CardDescription>
            Calcule automaticamente o custo de armazenamento para seus vídeos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="300"
                value={videoSpecs.duration || ""}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="40"
              />
              <p className="text-xs text-muted-foreground">
                Duração típica: 40-90 minutos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolução</Label>
              <Select
                value={videoSpecs.resolution}
                onValueChange={(value) =>
                  handleInputChange("resolution", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a resolução" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">
                    HD (720p) - {VIDEO_SPECS["720p"].bitrate}
                  </SelectItem>
                  <SelectItem value="1080p">
                    Full HD (1080p) - {VIDEO_SPECS["1080p"].bitrate}
                  </SelectItem>
                  <SelectItem value="4k">
                    4K Ultra HD - {VIDEO_SPECS["4k"].bitrate}
                  </SelectItem>
                </SelectContent>
              </Select>
              {recommendation.recommended === videoSpecs.resolution && (
                <p className="text-xs text-green-600">
                  ✓ Recomendado para esta duração
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade de Vídeos</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="20"
                value={videoSpecs.quantity || ""}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                Máximo 20 vídeos por cálculo
              </p>
            </div>
          </div>

          {/* Status dos Blocos Atuais */}
          {creatorBlocks && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-500" />
                Status Atual dos Blocos
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {creatorBlocks.availableBlocks}
                  </p>
                  <p className="text-muted-foreground">Disponíveis</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {creatorBlocks.usedBlocks}
                  </p>
                  <p className="text-muted-foreground">Em Uso</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {creatorBlocks.totalBlocks}
                  </p>
                  <p className="text-muted-foreground">Total</p>
                </div>
              </div>

              {creatorBlocks.isGracePeriod && (
                <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Período de Carência Ativo!</strong> Você tem{" "}
                    {creatorBlocks.freeMonthsLeft} mês
                    {creatorBlocks.freeMonthsLeft > 1 ? "es" : ""} gratuitos
                    restantes.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Resultado do Cálculo */}
          {calculation && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-blue-500/10 rounded-lg p-4 text-center">
                  <HardDrive className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Espaço Total</p>
                  <p className="font-bold text-lg">
                    {calculation.totalSizeGB} GB
                  </p>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4 text-center">
                  <Zap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Blocos</p>
                  <p className="font-bold text-lg">
                    {calculation.blocksNeeded}
                  </p>
                </div>

                <div className="bg-green-500/10 rounded-lg p-4 text-center">
                  <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Custo</p>
                  <p className="font-bold text-lg">
                    {calculation.breakdown.freeMonthsApplied > 0 ? (
                      <span className="text-green-600">GRÁTIS</span>
                    ) : (
                      <span className="text-green-600">
                        {formatPrice(calculation.totalPrice)}
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-xnema-orange/10 rounded-lg p-4 text-center">
                  {calculation.canAfford ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      calculation.canAfford ? "bg-green-500" : "bg-red-500"
                    }
                  >
                    {calculation.canAfford
                      ? "Aprovado"
                      : "Blocos Insuficientes"}
                  </Badge>
                </div>
              </div>

              {/* Detalhes da Operação */}
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Detalhes da Operação:</strong>
                    </p>
                    <p>
                      • {videoSpecs.quantity} vídeo(s) em{" "}
                      {VIDEO_SPECS[videoSpecs.resolution].quality}
                    </p>
                    <p>
                      • {videoSpecs.duration} min cada ={" "}
                      {calculation.breakdown.sizePerVideo} GB por vídeo
                    </p>
                    <p>
                      • {calculation.breakdown.blocksPerVideo} bloco(s) por
                      vídeo
                    </p>
                    <p>
                      • Total: {calculation.totalSizeGB} GB ={" "}
                      {calculation.blocksNeeded} bloco(s)
                    </p>
                    {calculation.breakdown.freeMonthsApplied > 0 && (
                      <p className="text-green-600">
                        • <strong>Período gratuito aplicado!</strong>
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Ação Necessária */}
              {!calculation.canAfford && (
                <Alert className="border-red-500 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <div className="space-y-3">
                      <p>
                        <strong>Blocos Insuficientes:</strong> Você precisa de{" "}
                        {calculation.blocksNeeded} blocos, mas tem apenas{" "}
                        {calculation.availableBlocks} disponíveis.
                      </p>

                      <Button
                        onClick={handleBuyBlocks}
                        className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Comprar{" "}
                        {Math.max(
                          1,
                          calculation.blocksNeeded -
                            calculation.availableBlocks,
                        )}{" "}
                        Bloco(s)
                        <span className="ml-2">
                          {formatPrice(
                            (calculation.blocksNeeded -
                              calculation.availableBlocks) *
                              BLOCK_PRICE,
                          )}
                        </span>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Recomendação de Resolução */}
          {recommendation.recommended !== videoSpecs.resolution && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <p>
                  <strong>Sugestão:</strong> Para vídeos de{" "}
                  {videoSpecs.duration} minutos, recomendamos{" "}
                  <strong>
                    {
                      VIDEO_SPECS[
                        recommendation.recommended as keyof typeof VIDEO_SPECS
                      ].quality
                    }
                  </strong>
                  .
                </p>
                <p className="text-sm mt-1">{recommendation.reason}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    handleInputChange("resolution", recommendation.recommended)
                  }
                >
                  Aplicar Recomendação
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Referência Atualizada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-blue-500" />
            Tabela de Referência por Duração
          </CardTitle>
          <CardDescription>
            Tamanhos estimados baseados em bitrates profissionais
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Duração</th>
                  <th className="text-left p-2">720p (HD)</th>
                  <th className="text-left p-2">1080p (Full HD)</th>
                  <th className="text-left p-2">4K (Ultra HD)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { duration: 20, label: "20 min" },
                  { duration: 40, label: "40 min" },
                  { duration: 60, label: "1 hora" },
                  { duration: 90, label: "1h 30min" },
                  { duration: 120, label: "2 horas" },
                ].map(({ duration, label }) => {
                  const sizes = {
                    "720p":
                      Math.round(
                        duration * VIDEO_SPECS["720p"].sizePerMinute * 100,
                      ) / 100,
                    "1080p":
                      Math.round(
                        duration * VIDEO_SPECS["1080p"].sizePerMinute * 100,
                      ) / 100,
                    "4k":
                      Math.round(
                        duration * VIDEO_SPECS["4k"].sizePerMinute * 100,
                      ) / 100,
                  };

                  const blocks = {
                    "720p": Math.ceil(sizes["720p"] / BLOCK_SIZE_GB),
                    "1080p": Math.ceil(sizes["1080p"] / BLOCK_SIZE_GB),
                    "4k": Math.ceil(sizes["4k"] / BLOCK_SIZE_GB),
                  };

                  return (
                    <tr key={duration} className="border-b">
                      <td className="p-2 font-medium">{label}</td>
                      <td className="p-2">
                        {sizes["720p"]} GB • {blocks["720p"]} bloco
                        {blocks["720p"] > 1 ? "s" : ""}
                      </td>
                      <td className="p-2">
                        {sizes["1080p"]} GB • {blocks["1080p"]} bloco
                        {blocks["1080p"] > 1 ? "s" : ""}
                      </td>
                      <td className="p-2 text-yellow-600">
                        {sizes["4k"]} GB • {blocks["4k"]} bloco
                        {blocks["4k"] > 1 ? "s" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Fórmula:</strong> 1 bloco = 7,3 GB = R$ 1.000 • Cálculos
              baseados em bitrates profissionais • Primeiro mês gratuito para
              novos criadores
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedBlockCalculator;
