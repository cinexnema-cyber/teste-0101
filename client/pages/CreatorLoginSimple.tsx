import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Lock,
  Mail,
  Palette,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  DollarSign,
  TrendingUp,
  Upload,
  BarChart3,
  Award,
  Users,
  Zap,
  Target,
} from "lucide-react";

export default function CreatorLoginSimple() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🎨 Tentando login de criador...");

      const response = await fetch("/api/auth/login-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("📥 Resposta do servidor:", data);

      if (data.success && data.token) {
        // Store auth data
        localStorage.setItem("xnema_token", data.token);
        localStorage.setItem("xnema_user", JSON.stringify(data.user));

        setSuccess("Login realizado com sucesso!");

        // Redirect to creator portal
        setTimeout(() => {
          if (data.user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/creator-portal");
          }
        }, 1000);
      } else {
        setError(data.message || "Erro no login. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text text-transparent">
              XNEMA
            </h1>
          </div>

          <div className="space-y-2">
            <Badge className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-white px-4 py-1.5 text-sm">
              <Palette className="w-4 h-4 mr-2" />
              Portal do Criador
            </Badge>
            <p className="text-sm text-muted-foreground">
              Monetize sua criatividade
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-xnema-orange/30 dark:border-xnema-orange/30 shadow-xl">
          <CardHeader className="space-y-3 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950 dark:to-purple-950 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-orange-900 dark:text-orange-100">
              Login Criador
            </CardTitle>
            <CardDescription className="text-center text-orange-700 dark:text-orange-200">
              Acesse seu estúdio de criação
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="criador@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-xnema-orange to-xnema-purple hover:from-xnema-orange/90 hover:to-xnema-purple/90 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Entrar como Criador
                  </>
                )}
              </Button>
            </form>

            {/* Quick Access */}
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-2 font-medium">
                Acesso rápido para teste:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() =>
                    setFormData({
                      email: "admin@xnema.com",
                      password: "admin123",
                    })
                  }
                  className="p-2 bg-orange-100 dark:bg-orange-900 rounded text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  👑 Admin
                </button>
                <button
                  onClick={() =>
                    setFormData({
                      email: "criador@xnema.com",
                      password: "123456",
                    })
                  }
                  className="p-2 bg-orange-100 dark:bg-orange-900 rounded text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  🎨 Criador
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-xnema-orange hover:text-xnema-orange/80 underline font-medium"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">
                    Outras opções
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login/subscriber")}
                  className="text-sm border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                >
                  Área Premium
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/register?role=creator")}
                  className="text-sm border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black"
                >
                  Virar Criador
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Info */}
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/50 dark:to-emerald-950/50">
          <CardContent className="p-5">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800 dark:text-green-200">
                  Comece a Faturar Hoje
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Upload gratuito • 70% da receita • Pagamento automático
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Setup R$ 0
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                  Início Imediato
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Selection */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/login-select")}
            className="text-sm"
          >
            ← Voltar para Seleção
          </Button>
        </div>
      </div>
    </div>
  );
}
