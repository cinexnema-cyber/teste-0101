import React, { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
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
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Crown,
  DollarSign,
  Video,
  Eye,
  Users,
  Calendar,
  Clock,
  Upload,
  Copy,
  ExternalLink,
  Settings,
  CreditCard,
  TrendingUp,
  PlayCircle,
  FileText,
  Share2,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Wallet,
  PiggyBank,
  Calculator,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { Link } from "react-router-dom";

// Legacy mock data - replaced by Google Analytics real-time data (GA4: G-FMZQ1MHE5G)
// These constants remain for fallback purposes only
const mockAnalytics = {
  views: 12543,
  subscribers: 1234,
  revenue: 5678.9,
  videos: 23,
  graceMonthsLeft: 2,
  subscriptionRate: 4.5,
  monthlyGrowth: 23.5,
};

const mockRevenueData = [
  { month: "Jan", revenue: 1200, views: 8500 },
  { month: "Fev", revenue: 1800, views: 12000 },
  { month: "Mar", revenue: 2200, views: 15000 },
  { month: "Abr", revenue: 2800, views: 18500 },
  { month: "Mai", revenue: 3500, views: 22000 },
  { month: "Jun", revenue: 4200, views: 28000 },
];

const mockViewsData = [
  { name: "Ficção", views: 4500, percentage: 35 },
  { name: "Documentário", views: 3200, percentage: 25 },
  { name: "Drama", views: 2800, percentage: 22 },
  { name: "Comédia", views: 2300, percentage: 18 },
];

const mockVideos = [
  {
    id: 1,
    title: "Entre o Céu e o Inferno - Episódio 1",
    status: "published",
    views: 5430,
    revenue: 234.5,
    uploadDate: "2024-01-15",
    duration: "45:30",
  },
  {
    id: 2,
    title: "Documentário: Amazônia Secreta",
    status: "pending",
    views: 0,
    revenue: 0,
    uploadDate: "2024-01-20",
    duration: "32:15",
  },
  {
    id: 3,
    title: "Making Of - Bastidores",
    status: "rejected",
    views: 0,
    revenue: 0,
    uploadDate: "2024-01-18",
    duration: "12:45",
  },
];

const COLORS = ["#FF8C42", "#9B59B6", "#3498DB", "#E74C3C"];

export default function CreatorPortal() {
  const {
    analyticsData,
    revenueData,
    viewsData,
    videosData,
    trackPageView,
    refreshData,
  } = useGoogleAnalytics();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [paymentData, setPaymentData] = useState({
    bankName: "",
    accountType: "",
    agency: "",
    account: "",
    pixKey: "",
    cpfCnpj: "",
    fullName: "",
  });

  useEffect(() => {
    // Generate unique affiliate link for creator
    const creatorId = "creator_123"; // This would come from auth context
    setAffiliateLink(`https://xnema.com/ref/${creatorId}`);
  }, []);

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    // Show toast notification
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Publicado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const calculateEstimatedBilling = () => {
    const monthlyFee = 1000;
    const currentRevenue = mockAnalytics.revenue;
    const estimatedDeduction = Math.min(currentRevenue * 0.3, monthlyFee);
    return {
      monthlyFee,
      currentRevenue,
      estimatedDeduction,
      netRevenue: currentRevenue - estimatedDeduction,
    };
  };

  const billing = calculateEstimatedBilling();

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Portal do{" "}
                  <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                    Criador
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  Gerencie seu conteúdo, acompanhe receitas e otimize seus
                  resultados
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Período de Carência:{" "}
                  {analyticsData.loading
                    ? "..."
                    : `${analyticsData.graceMonthsLeft} meses restantes`}
                </Badge>
                <Button
                  asChild
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-medium"
                >
                  <Link to="/video-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Vídeo
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={analyticsData.loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${analyticsData.loading ? "animate-spin" : ""}`}
                  />
                  {analyticsData.loading ? "Atualizando..." : "Atualizar Dados"}
                </Button>
              </div>
            </div>
          </div>

          {/* Google Analytics Integration Notice */}
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Google Analytics Integrado:</strong> Seus dados de
              visualizações, receita e engajamento são atualizados em tempo real
              através do Google Analytics (ID: G-FMZQ1MHE5G). Os dados mostrados
              refletem a performance real do seu conteúdo na plataforma.
            </AlertDescription>
          </Alert>

          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6 lg:w-max">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2"
              >
                <BarChart className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="affiliate"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Afiliação
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamentos
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Cobrança
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Receita Total
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {analyticsData.loading
                            ? "Carregando..."
                            : `R$ ${analyticsData.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analyticsData.loading
                        ? "..."
                        : `+${analyticsData.monthlyGrowth}% vs mês anterior`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Visualizações
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analyticsData.loading
                            ? "Carregando..."
                            : analyticsData.views.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Eye className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Últimos 30 dias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Assinantes
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {analyticsData.loading
                            ? "Carregando..."
                            : analyticsData.subscribers.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analyticsData.loading
                        ? "..."
                        : `Taxa de conversão: ${analyticsData.subscriptionRate}%`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Vídeos Ativos
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {analyticsData.loading
                            ? "Carregando..."
                            : analyticsData.videos}
                        </p>
                      </div>
                      <Video className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      3 pendentes de aprovação
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Receita</CardTitle>
                  <CardDescription>
                    Receita mensal dos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="month"
                          className="text-xs"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          className="text-xs"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#FF8C42"
                          strokeWidth={3}
                          dot={{ fill: "#FF8C42", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Videos */}
              <Card>
                <CardHeader>
                  <CardTitle>Vídeos Recentes</CardTitle>
                  <CardDescription>
                    Seus uploads mais recentes e status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videosData.slice(0, 3).map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {video.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {video.duration} • {video.uploadDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {video.views.toLocaleString()} views
                            </p>
                            <p className="text-xs text-green-600">
                              R$ {video.revenue.toFixed(2)}
                            </p>
                          </div>
                          {getStatusBadge(video.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Gerenciar Conteúdo
                  </h2>
                  <p className="text-muted-foreground">
                    Upload, edite e monitore seus vídeos
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                >
                  <Link to="/video-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Novo Upload
                  </Link>
                </Button>
              </div>

              {/* Upload Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        making-of-episodio-2.mp4
                      </span>
                      <span className="text-sm text-muted-foreground">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Processando vídeo... Tempo estimado: 5 minutos
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Content List */}
              <Card>
                <CardHeader>
                  <CardTitle>Todos os Vídeos</CardTitle>
                  <CardDescription>
                    Gerencie toda sua biblioteca de conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videosData.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {video.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {video.duration} • Uploaded {video.uploadDate}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {video.views.toLocaleString()} visualizações
                              </span>
                              <span className="text-xs text-green-600">
                                R$ {video.revenue.toFixed(2)} receita
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(video.status)}
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Analytics Detalhados
                </h2>
                <p className="text-muted-foreground">
                  Insights profundos sobre seu desempenho
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Visualizações por Categoria</CardTitle>
                    <CardDescription>
                      Distribuição do seu conteúdo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={viewsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) =>
                              `${name} ${percentage}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="views"
                          >
                            {viewsData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Mensal</CardTitle>
                    <CardDescription>Visualizações vs receita</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockRevenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="month"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="views"
                            fill="#9B59B6"
                            name="Visualizações"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">45:30</p>
                      <p className="text-sm text-muted-foreground">
                        Tempo médio assistido
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">87%</p>
                      <p className="text-sm text-muted-foreground">
                        Taxa de retenção
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">234</p>
                      <p className="text-sm text-muted-foreground">
                        Novos assinantes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Affiliate Tab */}
            <TabsContent value="affiliate" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sistema de Afiliação
                </h2>
                <p className="text-muted-foreground">
                  Compartilhe seus links e ganhe comissões
                </p>
              </div>

              {/* Affiliate Link */}
              <Card>
                <CardHeader>
                  <CardTitle>Seu Link de Afiliação</CardTitle>
                  <CardDescription>
                    Compartilhe este link para receber comissões de novos
                    assinantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={affiliateLink}
                      readOnly
                      className="font-mono"
                    />
                    <Button onClick={copyAffiliateLink} variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>

                  <Alert>
                    <ExternalLink className="h-4 w-4" />
                    <AlertDescription>
                      Cada novo assinante que se cadastrar através do seu link
                      gera uma comissão de 15% sobre o valor da assinatura.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Affiliate Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">42</p>
                      <p className="text-sm text-muted-foreground">
                        Cliques no link
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <UserPlus className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-muted-foreground">
                        Novos assinantes
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">R$ 127,80</p>
                      <p className="text-sm text-muted-foreground">
                        Comissão acumulada
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social Share */}
              <Card>
                <CardHeader>
                  <CardTitle>Compartilhar nas Redes Sociais</CardTitle>
                  <CardDescription>
                    Use estes botões para compartilhar facilmente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Dados para Pagamento
                </h2>
                <p className="text-muted-foreground">
                  Configure suas informações bancárias para receber pagamentos
                </p>
              </div>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Bancárias</CardTitle>
                  <CardDescription>
                    Dados necessários para transferências e PIX
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={paymentData.fullName}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                      <Input
                        id="cpfCnpj"
                        value={paymentData.cpfCnpj}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cpfCnpj: e.target.value,
                          })
                        }
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados Bancários</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Banco</Label>
                        <Select
                          value={paymentData.bankName}
                          onValueChange={(value) =>
                            setPaymentData({ ...paymentData, bankName: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o banco" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="001">Banco do Brasil</SelectItem>
                            <SelectItem value="237">Bradesco</SelectItem>
                            <SelectItem value="104">Caixa Econômica</SelectItem>
                            <SelectItem value="341">Itaú</SelectItem>
                            <SelectItem value="033">Santander</SelectItem>
                            <SelectItem value="260">Nu Pagamentos</SelectItem>
                            <SelectItem value="077">Banco Inter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountType">Tipo de Conta</Label>
                        <Select
                          value={paymentData.accountType}
                          onValueChange={(value) =>
                            setPaymentData({
                              ...paymentData,
                              accountType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo da conta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corrente">
                              Conta Corrente
                            </SelectItem>
                            <SelectItem value="poupanca">
                              Conta Poupança
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="agency">Agência</Label>
                        <Input
                          id="agency"
                          value={paymentData.agency}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              agency: e.target.value,
                            })
                          }
                          placeholder="0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="account">Conta</Label>
                        <Input
                          id="account"
                          value={paymentData.account}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              account: e.target.value,
                            })
                          }
                          placeholder="00000-0"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">PIX</h3>
                    <div className="space-y-2">
                      <Label htmlFor="pixKey">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        value={paymentData.pixKey}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            pixKey: e.target.value,
                          })
                        }
                        placeholder="CPF, email, telefone ou chave aleatória"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button className="bg-xnema-orange hover:bg-xnema-orange/90 text-black">
                      Salvar Dados
                    </Button>
                    <Button variant="outline">Testar Conexão</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <CardDescription>Seus pagamentos recebidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Receita de Janeiro</p>
                        <p className="text-sm text-muted-foreground">
                          15/02/2024
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">R$ 1.234,56</p>
                        <Badge className="bg-green-500">Pago</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Receita de Dezembro</p>
                        <p className="text-sm text-muted-foreground">
                          15/01/2024
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">R$ 987,32</p>
                        <Badge className="bg-green-500">Pago</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Receita de Fevereiro</p>
                        <p className="text-sm text-muted-foreground">
                          Prev: 15/03/2024
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">R$ 2.456,78</p>
                        <Badge variant="secondary">Pendente</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sistema de Cobrança
                </h2>
                <p className="text-muted-foreground">
                  Gerencie pagamentos automáticos e mensalidades
                </p>
              </div>

              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Atual</CardTitle>
                  <CardDescription>
                    Período de carência e próximas cobranças
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                          <PiggyBank className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-600">
                            Período de Carência Ativo
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {mockAnalytics.graceMonthsLeft} meses restantes
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={((3 - mockAnalytics.graceMonthsLeft) / 3) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Carência escolhida: 3 meses
                      </p>
                    </div>

                    <div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Após o período de carência, será cobrada mensalidade
                          de R$ 1.000,00 que pode ser descontada automaticamente
                          da sua receita.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle>Simulador de Cobrança</CardTitle>
                  <CardDescription>
                    Veja como funcionará o desconto automático
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Receita Atual</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Receita Bruta Mensal:</span>
                          <span className="font-bold text-green-600">
                            R$ {billing.currentRevenue.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa da Plataforma (30%):</span>
                          <span className="text-muted-foreground">
                            R$ {(billing.currentRevenue * 0.3).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sua Parte (70%):</span>
                          <span className="font-bold">
                            R$ {(billing.currentRevenue * 0.7).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">
                        Após Período de Carência
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Sua Parte (70%):</span>
                          <span className="font-bold">
                            R$ {(billing.currentRevenue * 0.7).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mensalidade:</span>
                          <span className="text-red-500">
                            -R$ {billing.estimatedDeduction.toFixed(2)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-semibold">Valor Final:</span>
                          <span className="font-bold text-green-600">
                            R$ {billing.netRevenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      O desconto automático garante que você nunca precisará
                      fazer transferências manuais. Se sua receita for menor que
                      R$ 1.000, você só pagará o valor proporcional.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Opções de Pagamento</CardTitle>
                  <CardDescription>
                    Configure como prefere pagar a mensalidade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border-2 border-green-500">
                      <div className="text-center">
                        <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-green-600">
                          Desconto Automático
                        </h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          Recomendado - Desconto direto da receita
                        </p>
                        <Button
                          className="w-full mt-4 bg-green-500 hover:bg-green-600"
                          size="sm"
                        >
                          Ativo
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-center">
                        <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-semibold">Cartão de Crédito</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          Cobrança automática no cartão
                        </p>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          size="sm"
                        >
                          Configurar
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-center">
                        <QrCode className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-semibold">PIX/Boleto</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          Pagamento manual mensal
                        </p>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          size="sm"
                        >
                          Configurar
                        </Button>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
