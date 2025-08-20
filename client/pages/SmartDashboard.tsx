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
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Play,
  Star,
  CreditCard,
  Download,
  Settings,
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Tv,
  Monitor,
  Tablet,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SmartDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<
    "active" | "expired" | "processing"
  >("active");
  const [watchTime, setWatchTime] = useState(0);
  const [recommendedContent, setRecommendedContent] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== "subscriber") {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const userProfile = {
    name: "João Silva",
    email: "joao.silva@email.com",
    subscriptionDate: "2024-12-15",
    nextBilling: "2025-01-15",
    plan: "Premium",
    devices: 4,
    activeDevices: 2,
  };

  const watchHistory = [
    {
      id: 1,
      title: "Between Heaven and Hell",
      episode: "T1E01 - O Início",
      progress: 85,
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=300",
      lastWatched: "2 horas atrás",
      duration: "45 min",
    },
    {
      id: 2,
      title: "Between Heaven and Hell",
      episode: "T1E02 - Revelações",
      progress: 23,
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=300",
      lastWatched: "1 dia atrás",
      duration: "48 min",
    },
    {
      id: 3,
      title: "Horizonte Infinito",
      episode: "Filme Completo",
      progress: 100,
      thumbnail:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop",
      lastWatched: "3 dias atrás",
      duration: "2h 15min",
    },
  ];

  const devices = [
    { name: "iPhone de João", type: "mobile", active: true, lastUsed: "Agora" },
    {
      name: "Smart TV Samsung",
      type: "tv",
      active: true,
      lastUsed: "1 hora atrás",
    },
    {
      name: "MacBook Pro",
      type: "desktop",
      active: false,
      lastUsed: "2 dias atrás",
    },
    { name: "iPad", type: "tablet", active: false, lastUsed: "1 semana atrás" },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tv":
        return <Tv className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    // Simulate intelligent recommendations
    const recommendations = [
      {
        title: "Between Heaven and Hell - T1E03",
        reason: "Continue assistindo",
        thumbnail:
          "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=300",
      },
      {
        title: "Mistérios da Cidade",
        reason: "Baseado no seu histórico",
        thumbnail:
          "https://images.unsplash.com/photo-1489599809568-c88341c7bfeb?w=300&h=400&fit=crop",
      },
      {
        title: "Aventura Selvagem",
        reason: "Popular entre assinantes",
        thumbnail:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=400&fit=crop",
      },
    ];
    setRecommendedContent(recommendations);
  }, []);

  const handlePaymentRenewal = () => {
    window.open("https://mpago.la/1p9Jkyy", "_blank");
  };

  const handleOfflineDownload = (contentId: number) => {
    // Simulate download
    alert(`Iniciando download para visualização offline...`);
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Olá, {userProfile.name}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Bem-vindo de volta à sua experiência XNEMA Premium
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-lg px-4 py-2">
                <Crown className="w-5 h-5 text-black" />
                <span className="text-black font-semibold">
                  {userProfile.plan}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status da Assinatura
                </CardTitle>
                <Crown className="h-4 w-4 text-xnema-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Ativa</div>
                <p className="text-xs text-muted-foreground">
                  Renova em {userProfile.nextBilling}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tempo Assistido
                </CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24h 32min</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dispositivos Ativos
                </CardTitle>
                <Tv className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfile.activeDevices}/{userProfile.devices}
                </div>
                <p className="text-xs text-muted-foreground">
                  Máximo permitido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conteúdo Favorito
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Itens salvos</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="continue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="continue">Continuar</TabsTrigger>
              <TabsTrigger value="recommended">Para Você</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
              <TabsTrigger value="billing">Cobrança</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Continue Watching */}
            <TabsContent value="continue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Continue Assistindo</CardTitle>
                  <CardDescription>Retome de onde parou</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchHistory.map((item) => (
                      <div key={item.id} className="group cursor-pointer">
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted mb-3">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Progress Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                            <div
                              className="h-full bg-xnema-orange"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>

                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {item.duration}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {item.episode}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.progress}% completo</span>
                            <span>{item.lastWatched}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations */}
            <TabsContent value="recommended" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recomendado Para Você</CardTitle>
                  <CardDescription>
                    Baseado no seu histórico de visualização e preferências
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedContent.map((item, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted mb-3">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                          </div>

                          {/* Recommendation Badge */}
                          <div className="absolute top-2 left-2 bg-xnema-orange text-black text-xs px-2 py-1 rounded font-semibold">
                            {item.reason}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices */}
            <TabsContent value="devices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dispositivos Conectados</CardTitle>
                  <CardDescription>
                    Gerencie onde você assiste XNEMA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {devices.map((device, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-xnema-surface rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${device.active ? "bg-green-500" : "bg-gray-500"}`}
                          >
                            {getDeviceIcon(device.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {device.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {device.active ? (
                                <span className="flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span>Ativo • {device.lastUsed}</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3 text-gray-500" />
                                  <span>Inativo • {device.lastUsed}</span>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOfflineDownload(index)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          {!device.active && (
                            <Button variant="outline" size="sm">
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">
                      📱 Compatibilidade Total
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      XNEMA funciona perfeitamente em Smart TVs, celulares,
                      tablets, computadores e navegadores web. Qualidade
                      adaptativa automática para cada dispositivo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Cobrança</CardTitle>
                  <CardDescription>
                    Gerencie sua assinatura e método de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Assinatura Premium Ativa
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Próxima cobrança: {userProfile.nextBilling}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">
                        R$ 19,90
                      </div>
                      <div className="text-sm text-muted-foreground">
                        mensal
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">
                        Método de Pagamento
                      </h4>
                      <div className="p-4 bg-xnema-surface rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-8 h-8 text-xnema-orange" />
                          <div>
                            <p className="font-semibold text-foreground">
                              Mercado Pago
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Renovação automática
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Ações</h4>
                      <div className="space-y-2">
                        <Button
                          onClick={handlePaymentRenewal}
                          className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                        >
                          Renovar Agora
                        </Button>
                        <Button variant="outline" className="w-full">
                          Alterar Método
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Cancelar Assinatura
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      💳 Pagamento Automático Ativo
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sua assinatura será renovada automaticamente. Você
                      receberá um email de confirmação antes de cada cobrança.
                      Link de pagamento: https://mpago.la/1p9Jkyy
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Conta</CardTitle>
                  <CardDescription>
                    Personalize sua experiência XNEMA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">
                      Preferências de Reprodução
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Qualidade padrão
                        </span>
                        <select className="bg-background border border-xnema-border rounded px-3 py-1">
                          <option>Auto (Recomendado)</option>
                          <option>4K Ultra HD</option>
                          <option>1080p Full HD</option>
                          <option>720p HD</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Reprodução automática
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Legendas automáticas
                        </span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">
                      Notificações
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Novos episódios</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Recomendações personalizadas
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-foreground">
                          Ofertas especiais
                        </span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
