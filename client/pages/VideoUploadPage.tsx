import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import VideoUploadForm from "@/components/VideoUploadForm";
import CreatorPortal from "@/components/CreatorPortal";
import { CreatorBlocksDashboard } from "@/components/CreatorBlocksDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Crown,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  FileVideo,
  Shield,
  Zap,
  Calculator,
  HardDrive,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VideoUploadPage() {
  const { user, isLoading } = useAuth();
  const [creatorData, setCreatorData] = useState(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleUploadComplete = (video: any) => {
    console.log("Upload completed:", video);
    // Refresh creator data after upload
    setCreatorData(null);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
  };

  const handleDataUpdate = () => {
    setCreatorData(null); // This will trigger a refresh
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Upload de{" "}
                  <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                    Vídeo
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  Compartilhe seu conteúdo com a comunidade XNEMA
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Criador Ativo
                </Badge>
                <Button variant="outline" asChild>
                  <Link to="/creator-portal">Voltar ao Portal</Link>
                </Button>
              </div>
            </div>

            {/* Creator Benefits */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold">Sistema de Blocos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    1 bloco = 7,3 GB por R$ 1.000. Pague apenas pelo que usar!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="font-semibold">3 Meses Gratuitos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Período de carência sem comissões. 100% da receita é sua!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-xnema-orange/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-xnema-orange" />
                    </div>
                    <h3 className="font-semibold">70% de Receita</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Após carência: 70% para você, 30% para plataforma
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="font-semibold">Streaming 4K</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Qualidade profissional com processamento automático
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upload Process Info */}
          <Alert className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="space-y-3">
                <p className="font-semibold">
                  Novo Fluxo com Sistema de Blocos:
                </p>
                <div className="grid md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                      1
                    </div>
                    <span>Calcular blocos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                      2
                    </div>
                    <span>Pagar blocos (se necessário)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                      3
                    </div>
                    <span>Upload do vídeo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                      4
                    </div>
                    <span>Revisão da equipe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                      5
                    </div>
                    <span>Liberação para assinantes</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 mt-3">
                  <p className="text-xs">
                    <strong>Sistema Inteligente:</strong> Calculamos
                    automaticamente quantos blocos seu vídeo precisa baseado na
                    duração e resolução. Você só paga pelos blocos necessários!
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Upload System with Blocks */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload de Vídeo
              </TabsTrigger>
              <TabsTrigger value="blocks" className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Gerenciar Blocos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <VideoUploadForm
                creatorData={creatorData}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </TabsContent>

            <TabsContent value="blocks" className="mt-6">
              <CreatorPortal
                creatorData={creatorData}
                onDataUpdate={handleDataUpdate}
              />
            </TabsContent>
          </Tabs>

          {/* Guidelines */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-xnema-orange" />
                  Diretrizes de Conteúdo
                </CardTitle>
                <CardDescription>
                  Certifique-se de que seu conteúdo atende aos padrões da
                  plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Conteúdo original ou com direitos de uso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Qualidade de áudio e vídeo adequada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Título e descrição informativos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Conteúdo apropriado para todos os públicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Sem violação de direitos autorais</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-xnema-purple" />
                  Dicas para Sucesso
                </CardTitle>
                <CardDescription>
                  Maximize o alcance e engajamento do seu conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Use títulos chamativos e descritivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Adicione tags relevantes para descoberta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Invista em uma boa miniatura personalizada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Mantenha consistência no upload</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Interaja com a comunidade nos comentários</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Support */}
          <Alert className="mt-8">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Precisa de Ajuda?</p>
                  <p className="text-sm">
                    Nossa equipe está disponível para ajudar com questões
                    técnicas ou diretrizes de conteúdo.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contact">Falar Conosco</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Layout>
  );
}
