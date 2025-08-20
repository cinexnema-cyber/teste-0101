import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ContentUpload } from "@/components/ContentUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Video,
  FileText,
  BarChart3,
  DollarSign,
  Settings,
  Users,
  PlayCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CreatorPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Permitir acesso para criadores ou admin especial
    if (user.role !== "creator" && !(user.role === "admin" && user.email === "cinexnema@gmail.com")) {
      navigate("/login");
      return;
    }

    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const response = await fetch("/api/creator/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const creatorStats = {
    totalVideos: 24,
    totalViews: 125430,
    totalRevenue: 3240.5,
    monthlyRevenue: 890.3,
    pendingRevenue: 245.8,
  };

  const uploadedVideos = [
    {
      id: 1,
      title: "Between Heaven and Hell - Episódio 1",
      series: "Between Heaven and Hell",
      season: 1,
      episode: 1,
      status: "Publicado",
      views: 15420,
      revenue: 245.3,
      uploadDate: "2024-12-15",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=200",
    },
    {
      id: 2,
      title: "Between Heaven and Hell - Episódio 2",
      series: "Between Heaven and Hell",
      season: 1,
      episode: 2,
      status: "Processando",
      views: 0,
      revenue: 0,
      uploadDate: "2024-12-20",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=200",
    },
    {
      id: 3,
      title: "Behind the Scenes - Bastidores",
      series: "Between Heaven and Hell",
      season: 0,
      episode: 0,
      status: "Rascunho",
      views: 0,
      revenue: 0,
      uploadDate: "2024-12-22",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=200",
    },
  ];

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Publicado":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Processando":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Rascunho":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Bem-vindo,{" "}
                <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                  {user?.name || "Criador"}
                </span>
                !
              </h1>
              <p className="text-muted-foreground">
                {user?.role === "admin"
                  ? "Visualizando portal como administrador - Acesso total ao sistema"
                  : "Gerencie seu conteúdo e acompanhe suas receitas"
                }
              </p>
              {user?.role === "admin" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-xnema-orange/10 to-xnema-purple/10 border border-xnema-orange/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="w-5 h-5 text-xnema-orange" />
                    <span className="font-semibold text-foreground">Modo Administrador</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Você está acessando o portal como administrador. Aqui você pode ver como os criadores visualizam e gerenciam seu conteúdo.
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/admin-dashboard">
                        <Settings className="w-4 h-4 mr-2" />
                        Painel Admin
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-black">
                Status: Aprovado
              </Badge>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Vídeos Publicados
                    </CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-xnema-orange">
                      {creatorStats.totalVideos}
                    </div>
                    <p className="text-xs text-muted-foreground">+3 este mês</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Visualizações
                    </CardTitle>
                    <PlayCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-xnema-orange">
                      {creatorStats.totalViews.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +12.4% vs mês passado
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-xnema-orange">
                      R$ {creatorStats.totalRevenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      R$ {creatorStats.monthlyRevenue.toFixed(2)} este mês
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:bg-xnema-surface transition-colors"
                  asChild
                >
                  <Link to="/creator-payments">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pendente
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-500">
                        R$ {creatorStats.pendingRevenue.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Clique para ver pagamentos
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </div>

              <Tabs defaultValue="upload" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="create">Criar Conteúdo</TabsTrigger>
                  <TabsTrigger value="videos">Meus Vídeos</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>

                {/* Create Content Tab */}
                <TabsContent value="create" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sistema Inteligente de Criação</CardTitle>
                      <CardDescription>
                        Crie conteúdo que aparece automaticamente para os
                        assinantes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-foreground">
                            Link do Vídeo
                          </h4>
                          <input
                            type="url"
                            placeholder="Cole o link do YouTube, Vimeo, etc."
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />

                          <h4 className="font-semibold text-foreground">
                            Título
                          </h4>
                          <input
                            type="text"
                            placeholder="Título do conteúdo"
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />

                          <h4 className="font-semibold text-foreground">
                            Categoria
                          </h4>
                          <select className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground">
                            <option>Between Heaven and Hell</option>
                            <option>Drama</option>
                            <option>Ação</option>
                            <option>Documentário</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-foreground">
                            Descrição
                          </h4>
                          <textarea
                            rows={4}
                            placeholder="Descreva o conteúdo..."
                            className="flex w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">
                                Temporada
                              </h4>
                              <input
                                type="number"
                                min="1"
                                max="7"
                                defaultValue="1"
                                className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">
                                Episódio
                              </h4>
                              <input
                                type="number"
                                min="1"
                                max="12"
                                defaultValue="1"
                                className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-2">
                          🤖 Automação Inteligente
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            • O conteúdo aparece automaticamente no catálogo
                          </li>
                          <li>
                            • Thumbnail é extraída automaticamente do vídeo
                          </li>
                          <li>
                            • Assinantes são notificados sobre novo conteúdo
                          </li>
                          <li>• Analytics são gerados em tempo real</li>
                          <li>
                            • Receita é calculada e creditada automaticamente
                          </li>
                        </ul>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                          asChild
                        >
                          <Link to="/content-creator">
                            Abrir Editor Completo
                          </Link>
                        </Button>
                        <Button variant="outline">Publicar Agora</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload de Novo Conteúdo</CardTitle>
                      <CardDescription>
                        Faça upload dos seus vídeos para a série Between Heaven
                        and Hell
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Video Upload */}
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-foreground">
                          Vídeo Principal
                        </label>
                        <div className="border-2 border-dashed border-xnema-border rounded-lg p-8 text-center hover:border-xnema-orange transition-colors">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-foreground font-medium mb-2">
                            Clique para fazer upload ou arraste o arquivo
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            MP4, MOV, AVI até 5GB
                          </p>
                          <Button
                            onClick={handleFileUpload}
                            disabled={isUploading}
                          >
                            {isUploading ? "Enviando..." : "Selecionar Arquivo"}
                          </Button>

                          {isUploading && (
                            <div className="mt-4">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-xnema-orange h-2 rounded-full transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                {uploadProgress}% concluído
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Video Details Form */}
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">
                            Título do Episódio
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Between Heaven and Hell - Episódio 3"
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">
                              Temporada
                            </label>
                            <select className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground">
                              <option value="1">Temporada 1</option>
                              <option value="2">Temporada 2</option>
                              <option value="3">Temporada 3</option>
                              <option value="4">Temporada 4</option>
                              <option value="5">Temporada 5</option>
                              <option value="6">Temporada 6</option>
                              <option value="7">Temporada 7</option>
                            </select>
                          </div>

                          <div className="grid gap-2">
                            <label className="text-sm font-medium text-foreground">
                              Episódio
                            </label>
                            <input
                              type="number"
                              placeholder="1"
                              min="1"
                              max="12"
                              className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">
                            Descrição
                          </label>
                          <textarea
                            placeholder="Descreva o episódio..."
                            rows={3}
                            className="flex w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">
                            Link do Vídeo (YouTube/Vimeo)
                          </label>
                          <input
                            type="url"
                            placeholder="https://youtu.be/exemplo ou link de streaming"
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />
                          <p className="text-xs text-muted-foreground">
                            Cole o link direto do vídeo hospedado no YouTube,
                            Vimeo ou outro serviço
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                          Publicar Episódio
                        </Button>
                        <Button variant="outline">Salvar como Rascunho</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Videos Tab */}
                <TabsContent value="videos" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meus Vídeos</CardTitle>
                      <CardDescription>
                        Gerencie todo o seu conteúdo publicado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {uploadedVideos.map((video) => (
                          <div
                            key={video.id}
                            className="flex items-center space-x-4 p-4 bg-xnema-surface rounded-lg"
                          >
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-20 h-12 object-cover rounded"
                            />

                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                {getStatusIcon(video.status)}
                                <h4 className="font-semibold text-foreground">
                                  {video.title}
                                </h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {video.series} • T{video.season}E{video.episode}{" "}
                                • {video.uploadDate}
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-semibold text-foreground">
                                {video.views.toLocaleString()} views
                              </div>
                              <div className="text-sm text-xnema-orange">
                                R$ {video.revenue.toFixed(2)}
                              </div>
                            </div>

                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics e Receita</CardTitle>
                      <CardDescription>
                        Acompanhe o desempenho do seu conteúdo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">
                              Período Promocional
                            </h3>
                            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-semibold text-foreground">
                                  100% da receita para você
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Você está no período promocional de 3 meses.
                                Toda receita é sua!
                              </p>
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progresso (30 dias restantes)</span>
                                  <span>66%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: "66%" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">
                              Próximos Pagamentos
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-xnema-surface rounded">
                                <span className="text-foreground">
                                  Dezembro 2024
                                </span>
                                <span className="font-semibold text-xnema-orange">
                                  R$ 890.30
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-xnema-surface rounded">
                                <span className="text-foreground">
                                  Janeiro 2025
                                </span>
                                <span className="font-semibold text-muted-foreground">
                                  R$ 245.80 (pendente)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações do Criador</CardTitle>
                      <CardDescription>
                        Gerencie suas preferências e informações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">
                            Nome do Canal
                          </label>
                          <input
                            type="text"
                            defaultValue="Between Heaven and Hell Studio"
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">
                            Email de Contato
                          </label>
                          <input
                            type="email"
                            defaultValue="cinexnema@gmail.com"
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />
                        </div>

                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-foreground">
                            WhatsApp
                          </label>
                          <input
                            type="tel"
                            defaultValue="(15) 99763-6161"
                            className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                          />
                        </div>
                      </div>

                      <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                        Salvar Configurações
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
