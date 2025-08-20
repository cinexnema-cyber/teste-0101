import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, CreditCard, Settings, Download, Bell, User, LogOut, Play, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriberDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const subscriptionStatus = user.subscriptionStatus === 'ativo' ? 'Ativo' : 'Inativo';

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Dashboard Premium - {user.displayName}
                </h1>
                <p className="text-muted-foreground">
                  Bem-vindo de volta, assinante Premium! Aproveite todo o conteúdo XNEMA
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-xnema-orange text-white rounded-lg px-4 py-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Assinante Premium</span>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="billing">Cobrança</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Aba de Conteúdo - Principal para assinantes */}
            <TabsContent value="content" className="space-y-6">
              {/* Acesso aos Vídeos Premium */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-6 w-6 text-xnema-orange" />
                    Conteúdo Premium Disponível
                  </CardTitle>
                  <CardDescription>
                    Acesse todo o catálogo XNEMA com sua assinatura ativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Série Exclusiva */}
                    <Card className="border-xnema-orange bg-gradient-to-br from-xnema-orange/10 to-xnema-purple/10">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Crown className="h-8 w-8 text-xnema-orange" />
                          <div>
                            <h3 className="font-bold text-lg">Entre o Céu e o Inferno</h3>
                            <p className="text-sm text-muted-foreground">Série Exclusiva XNEMA</p>
                          </div>
                        </div>
                        <p className="text-sm mb-4">
                          Nossa série exclusiva está disponível apenas para assinantes Premium.
                        </p>
                        <Button asChild className="w-full">
                          <Link to="/between-heaven-hell">
                            <div className="flex items-center">
                              <Play className="w-4 h-4 mr-2" />
                              Assistir Agora
                            </div>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Catálogo Completo */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Download className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-bold text-lg">Catálogo Completo</h3>
                            <p className="text-sm text-muted-foreground">Todos os filmes e séries</p>
                          </div>
                        </div>
                        <p className="text-sm mb-4">
                          Acesso ilimitado a toda nossa biblioteca de conteúdo premium.
                        </p>
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/catalog">
                            <div className="flex items-center">
                              <Play className="w-4 h-4 mr-2" />
                              Explorar Catálogo
                            </div>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Séries Premium */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Star className="h-8 w-8 text-yellow-500" />
                          <div>
                            <h3 className="font-bold text-lg">Todas as Séries</h3>
                            <p className="text-sm text-muted-foreground">Acesso completo</p>
                          </div>
                        </div>
                        <p className="text-sm mb-4">
                          Assista todas as séries disponíveis na plataforma.
                        </p>
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/series">
                            <div className="flex items-center">
                              <Play className="w-4 h-4 mr-2" />
                              Ver Séries
                            </div>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Navegação por Categorias */}
              <Card>
                <CardHeader>
                  <CardTitle>Navegar por Categorias</CardTitle>
                  <CardDescription>
                    Encontre conteúdo por gênero e categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Link to="/categories">
                        <div className="text-center">
                          <Settings className="h-6 w-6 mx-auto mb-2" />
                          <span className="text-sm font-semibold">Todas as Categorias</span>
                        </div>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Link to="/category/acao">
                        <div className="text-center">
                          <span className="text-2xl mb-2">⚡</span>
                          <span className="text-sm font-semibold">Ação</span>
                        </div>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Link to="/category/drama">
                        <div className="text-center">
                          <span className="text-2xl mb-2">🎭</span>
                          <span className="text-sm font-semibold">Drama</span>
                        </div>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Link to="/category/suspense">
                        <div className="text-center">
                          <span className="text-2xl mb-2">🔍</span>
                          <span className="text-sm font-semibold">Suspense</span>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status da Assinatura</CardTitle>
                    <Crown className="h-4 w-4 text-xnema-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-xnema-orange">{subscriptionStatus}</div>
                    <p className="text-xs text-muted-foreground">
                      Plano: {user.subscriptionPlan || 'Premium'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tempo de Assinatura</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Premium</div>
                    <p className="text-xs text-muted-foreground">
                      Membro desde {user.subscriptionStart ? new Date(user.subscriptionStart).toLocaleDateString() : 'Hoje'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Acesso Total</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">100%</div>
                    <p className="text-xs text-muted-foreground">
                      Todo conteúdo disponível
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta Premium</CardTitle>
                  <CardDescription>Detalhes da sua assinatura ativa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-semibold">{user.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Conta</p>
                      <p className="font-semibold text-xnema-orange">Assinante Premium</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold text-green-600">{subscriptionStatus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cobrança */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Cobrança</CardTitle>
                  <CardDescription>Gerencie sua assinatura e métodos de pagamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✅ Sua assinatura está ativa e em dia
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plano Atual</p>
                        <p className="font-semibold">{user.subscriptionPlan || 'Premium'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-semibold text-green-600">{subscriptionStatus}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Conta</CardTitle>
                  <CardDescription>Gerencie suas preferências e configurações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Notificações</h4>
                        <p className="text-sm text-muted-foreground">Receber emails sobre novos conteúdos</p>
                      </div>
                      <Button variant="outline" size="sm">Configurar</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Qualidade de Vídeo</h4>
                        <p className="text-sm text-muted-foreground">Ajustar qualidade padrão de reprodução</p>
                      </div>
                      <Button variant="outline" size="sm">4K Ativo</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Downloads</h4>
                        <p className="text-sm text-muted-foreground">Gerenciar conteúdo baixado</p>
                      </div>
                      <Button variant="outline" size="sm">Gerenciar</Button>
                    </div>
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
