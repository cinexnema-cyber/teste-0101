import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Users,
  Database,
} from "lucide-react";

export default function AdminLoginSimple() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const adminLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("👑 Fazendo login como admin...");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Store auth data
        localStorage.setItem("xnema_token", data.token);
        localStorage.setItem("xnema_user", JSON.stringify(data.user));

        setSuccess(`Login realizado como ${data.user.name}!`);

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1500);
      } else {
        setError(data.message || "Erro no login de admin");
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const createAdmins = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/create-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Admins configurados! Total: ${data.totalAdmins}`);
      } else {
        setError("Erro ao criar admins");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/status");
      const data = await response.json();

      if (data.success) {
        setSuccess(`Status: ${data.totalAdmins} admins encontrados`);
      } else {
        setError("Erro ao verificar status");
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              XNEMA
            </h1>
          </div>

          <div className="space-y-2">
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Painel Administrativo
            </Badge>
            <p className="text-sm text-slate-400">Acesso completo ao sistema</p>
          </div>
        </div>

        {/* Admin Panel */}
        <Card className="border-red-200 dark:border-red-800 shadow-xl bg-slate-800/50">
          <CardHeader className="space-y-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center text-red-900 dark:text-red-100">
              Login Administrativo
            </CardTitle>
            <CardDescription className="text-center text-red-700 dark:text-red-200">
              Iarima Temiski - Acesso Total
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Quick Admin Login */}
            <Button
              onClick={adminLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Entrar como Admin
                </>
              )}
            </Button>

            {/* Status and Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={checkStatus}
                disabled={isLoading}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Database className="w-4 h-4 mr-2" />
                Status
              </Button>

              <Button
                onClick={createAdmins}
                disabled={isLoading}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>

            {/* Messages */}
            {error && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950/50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Credentials Info */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-2 font-medium">
                Credenciais do Admin:
              </p>
              <div className="text-xs space-y-1 text-slate-300">
                <p>
                  <strong>Email:</strong> iarima@xnema.com
                </p>
                <p>
                  <strong>Senha:</strong> iarima123
                </p>
                <p className="text-slate-400 mt-2">
                  * Login automático criará o usuário se necessário
                </p>
              </div>
            </div>

            {/* Alternative Logins */}
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-3 text-slate-400 font-medium">
                    Outras opções
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login/subscriber")}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Área Assinante
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login/creator")}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Área Criador
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Selection */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/login-select")}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← Voltar para Seleção
          </Button>
        </div>
      </div>
    </div>
  );
}
