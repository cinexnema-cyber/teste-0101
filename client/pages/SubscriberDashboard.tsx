import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContextReal";
import {
  User,
  Crown,
  Play,
  Star,
  Settings,
  LogOut,
  CreditCard,
  Download,
  Eye,
  Clock,
  Film,
} from "lucide-react";

export default function SubscriberDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate("/login/subscriber");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login-select");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">XNEMA</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Olá, {user.name}</p>
                {user.isPremium ? (
                  <Badge className="bg-blue-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline">Gratuito</Badge>
                )}
              </div>

              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">
              Bem-vindo ao seu Dashboard Premium!
            </h2>
            <p className="text-muted-foreground text-lg">
              Aproveite a experiência completa de streaming
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Minha Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {user.isPremium ? "Assinante Premium" : "Conta Gratuita"}
                  </p>
                </div>
                {user.subscriptionPlan && (
                  <div>
                    <p className="text-sm text-muted-foreground">Plano</p>
                    <p className="font-medium capitalize">
                      {user.subscriptionPlan}
                    </p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.isPremium ? (
                  <>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Crown className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        Premium Ativo
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Acesso total ao conte��do
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Gerenciar Plano
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <Star className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="font-semibold text-orange-900 dark:text-orange-100">
                        Upgrade Disponível
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Desbloqueie todo o catálogo
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate("/pricing")}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Assinar Premium
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Atividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Filmes assistidos
                  </span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Séries acompanhadas
                  </span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tempo total
                  </span>
                  <span className="font-bold">0h</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Ver Histórico
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content Access */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Browse Content */}
            <Card>
              <CardHeader>
                <CardTitle>Explorar Conteúdo</CardTitle>
                <CardDescription>
                  Descubra filmes e séries incríveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => navigate("/catalog")}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Catálogo
                  </Button>
                  <Button
                    onClick={() => navigate("/catalog?type=movie")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Film className="w-4 h-4" />
                    Filmes
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => navigate("/catalog?type=series")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Film className="w-4 h-4" />
                    Séries
                  </Button>
                  <Button
                    onClick={() => navigate("/catalog?type=documentary")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Film className="w-4 h-4" />
                    Documentários
                  </Button>
                </div>

                {user.isPremium && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Premium Features
                      </span>
                    </div>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Download para assistir offline</li>
                      <li>• Qualidade 4K Ultra HD</li>
                      <li>• Sem anúncios</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Continue Watching */}
            <Card>
              <CardHeader>
                <CardTitle>Continue Assistindo</CardTitle>
                <CardDescription>Retome de onde parou</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum conteúdo em andamento</p>
                  <p className="text-sm">Comece a assistir algo novo!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
