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
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Users,
  Video,
  BarChart,
  Settings,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  UserCheck,
  UserX,
  LogOut,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  createdAt: string;
}

interface PendingCreator extends User {
  profile: {
    bio?: string;
    portfolio?: string;
    status: "pending" | "approved" | "rejected";
  };
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingCreators, setPendingCreators] = useState<PendingCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPendingCreators(
          data.users.filter(
            (u: any) => u.role === "creator" && u.profile?.status === "pending",
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorApproval = async (creatorId: string, approve: boolean) => {
    // This would be implemented with a proper API endpoint
    console.log(`${approve ? "Approving" : "Rejecting"} creator:`, creatorId);
    // Update local state for demo
    setPendingCreators((prev) => prev.filter((c) => c.id !== creatorId));
  };

  const stats = {
    totalUsers: users.length,
    subscribers: users.filter((u) => u.role === "subscriber").length,
    creators: users.filter((u) => u.role === "creator").length,
    pendingApprovals: pendingCreators.length,
    monthlyRevenue: 5840.5,
    contentViews: 12450,
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-xnema-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Carregando painel administrativo...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Painel <span className="text-xnema-orange">Administrativo</span>
              </h1>
              <p className="text-muted-foreground">Bem-vindo, {user?.name}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.subscribers} assinantes, {stats.creators} criadores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aprovações Pendentes
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {stats.pendingApprovals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Criadores aguardando aprovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Mensal
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  R$ {stats.monthlyRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Visualizações
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {stats.contentViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total de views</p>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="creators">
                <Video className="w-4 h-4 mr-2" />
                Criadores
              </TabsTrigger>
              <TabsTrigger value="content">
                <Settings className="w-4 h-4 mr-2" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Users Management */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Usuários</CardTitle>
                  <CardDescription>
                    Visualizar e gerenciar todos os usuários da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-xnema-border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                            {user.role === "admin" ? (
                              <Settings className="w-5 h-5 text-black" />
                            ) : user.role === "creator" ? (
                              <Video className="w-5 h-5 text-black" />
                            ) : (
                              <Crown className="w-5 h-5 text-black" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {user.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "destructive"
                                : user.role === "creator"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {user.role === "admin"
                              ? "Admin"
                              : user.role === "creator"
                                ? "Criador"
                                : "Assinante"}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Creators Approval */}
            <TabsContent value="creators" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aprovação de Criadores</CardTitle>
                  <CardDescription>
                    Revisar e aprovar novos criadores de conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingCreators.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhuma aprovação pendente
                      </h3>
                      <p className="text-muted-foreground">
                        Todos os criadores foram aprovados ou rejeitados.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingCreators.map((creator) => (
                        <div
                          key={creator.id}
                          className="p-6 border border-xnema-border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-foreground">
                                {creator.name}
                              </h4>
                              <p className="text-muted-foreground">
                                {creator.email}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-orange-500 text-orange-500"
                            >
                              Pendente
                            </Badge>
                          </div>

                          {creator.profile.bio && (
                            <div className="mb-4">
                              <h5 className="font-medium text-foreground mb-2">
                                Bio:
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {creator.profile.bio}
                              </p>
                            </div>
                          )}

                          {creator.profile.portfolio && (
                            <div className="mb-4">
                              <h5 className="font-medium text-foreground mb-2">
                                Portfólio:
                              </h5>
                              <a
                                href={creator.profile.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-xnema-orange hover:underline"
                              >
                                {creator.profile.portfolio}
                              </a>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                handleCreatorApproval(creator.id, true)
                              }
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() =>
                                handleCreatorApproval(creator.id, false)
                              }
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Management */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Conteúdo</CardTitle>
                  <CardDescription>
                    Aprovar e gerenciar vídeos enviados pelos criadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Sistema de Aprovação de Conteúdo
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Esta funcionalidade permitirá revisar e aprovar vídeos
                      enviados pelos criadores.
                    </p>
                    <Button variant="outline">Em Desenvolvimento</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics da Plataforma</CardTitle>
                  <CardDescription>
                    Métricas e relatórios detalhados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Dashboard de Analytics
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Relatórios detalhados sobre usuários, receita e
                      engajamento.
                    </p>
                    <Button variant="outline">Em Desenvolvimento</Button>
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
