import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Lock, 
  Mail, 
  Crown, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriberLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login-subscriber', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Store token
        localStorage.setItem('xnema_token', data.token);
        
        // Update auth context
        if (login) {
          await login(data.user, data.token);
        }

        setSuccess('Login realizado com sucesso!');
        
        // Redirect based on user status
        setTimeout(() => {
          if (data.user.isPremium) {
            navigate('/dashboard'); // Premium dashboard
          } else {
            navigate('/pricing'); // Encourage subscription
          }
        }, 1000);

      } else {
        setError(data.message || 'Erro no login');
      }

    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">XNEMA</h1>
          </div>
          
          <Badge className="bg-blue-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Área do Assinante
          </Badge>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login Assinante
            </CardTitle>
            <CardDescription className="text-center">
              Acesse sua conta e desfrute do melhor conteúdo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Entrar como Assinante
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Outros acessos
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login/creator')}
                  className="text-sm"
                >
                  Sou Criador
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/register')}
                  className="text-sm"
                >
                  Cadastrar-se
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Preview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <Crown className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Benefícios Premium
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Acesso a todo catálogo de filmes e séries</li>
                <li>• Streaming em qualidade 4K</li>
                <li>• Sem anúncios ou interrupções</li>
                <li>• Download para assistir offline</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/pricing')}
                className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
              >
                Ver Planos
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Ao fazer login, você aceita nossos{' '}
            <Link to="/terms" className="underline hover:text-foreground">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/privacy" className="underline hover:text-foreground">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
