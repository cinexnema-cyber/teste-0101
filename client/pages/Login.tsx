import React, { useState, useEffect } from "react";
import {
  useNavigate,
  Link,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for success message and email from navigation state or localStorage
  useEffect(() => {
    // Check for message in navigation state (from reset password)
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }

    // Check for pre-filled email from navigation state
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }

    // Check for email saved in localStorage (from reset password)
    const savedEmail = localStorage.getItem("reset_email");
    if (savedEmail && !formData.email) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      localStorage.removeItem("reset_email"); // Remove after using
    }

    // Check for success message in URL params (fallback)
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
      // Clear the URL parameter after showing the message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);

      if (!success) {
        setError("Email ou senha incorretos");
        setLoading(false);
        return;
      }

      // Wait a moment for user state to update
      setTimeout(() => {
        // Get current user from context (after login)
        const savedUser = localStorage.getItem("xnema_user");
        if (savedUser) {
          const currentUser = JSON.parse(savedUser);

          // Check if user has a defined role preference
          if (currentUser.role === "admin") {
            console.log("✅ Redirecting admin to admin dashboard");
            navigate("/admin-dashboard");
          } else if (
            currentUser.role === "subscriber" &&
            currentUser.assinante
          ) {
            console.log("✅ Redirecting subscriber to subscriber dashboard");
            navigate("/subscriber-dashboard");
          } else if (currentUser.role === "creator") {
            console.log("✅ Redirecting creator to creator portal");
            navigate("/creator-portal");
          } else {
            // For users without a clear role preference, show area selection
            console.log("��� Redirecting to area selection");
            navigate("/area-selection");
          }
        } else {
          // Fallback to area selection
          navigate("/area-selection");
        }
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      setError("Erro inesperado no login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/password-recovery");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-xnema-dark via-xnema-surface to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo X com link para home */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-2xl hover:scale-105 transition-transform shadow-lg"
            >
              <span className="text-2xl font-black text-white">X</span>
            </Link>
          </div>

          <CardTitle className="text-2xl font-bold text-xnema-orange">
            {t("nav.login")}
          </CardTitle>
          <CardDescription>Acesse sua conta XNEMA</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-600 bg-green-900/20">
                <AlertDescription className="text-green-300">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {resetEmailSent && (
              <Alert>
                <AlertDescription className="text-green-600">
                  Password reset email sent! Check your inbox.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="link"
                onClick={handleForgotPassword}
                disabled={loading}
                className="p-0 h-auto text-sm"
              >
                {t("auth.forgotPassword")}
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("nav.login")}
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-xnema-orange hover:underline"
              >
                {t("auth.subscribeNow")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
