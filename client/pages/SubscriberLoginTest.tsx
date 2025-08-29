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
  Shield,
  Play,
  CheckCircle,
  Database,
  Settings
} from 'lucide-react';

export default function SubscriberLoginTest() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const testConnection = async () => {
    setIsLoading(true);
    setError('');
    setDebugInfo('');
    
    try {
      console.log('🔍 Testando conexão...');
      
      const response = await fetch('/api/subscribers/check');
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ Conectado! ${data.totalUsers} usuários encontrados`);
        setDebugInfo(JSON.stringify(data.users, null, 2));
      } else {
        setError('❌ Erro na conexão com o banco');
      }
      
    } catch (error) {
      console.error('❌ Erro:', error);
      setError('❌ Erro de rede/conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const initUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔧 Inicializando usuários...');
      
      const response = await fetch('/api/admin/init-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ Usuários inicializados! Total: ${data.totalUsers}`);
      } else {
        setError('❌ Erro ao inicializar usuários');
      }
      
    } catch (error) {
      console.error('❌ Erro:', error);
      setError('❌ Erro de rede/conexão');
    } finally {
      setIsLoading(false);
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
    setDebugInfo('');

    try {
      console.log('🔐 Tentando login:', formData.email);
      
      const response = await fetch('/api/auth/login-subscriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📥 Resposta do servidor:', data);
      setDebugInfo(JSON.stringify(data, null, 2));

      if (data.success && data.token) {
        // Store auth data
        localStorage.setItem('xnema_token', data.token);
        localStorage.setItem('xnema_user', JSON.stringify(data.user));
        
        setSuccess(`✅ Login realizado! Bem-vindo ${data.user.name}`);
        
        // Redirect based on user role/status
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (data.user.isPremium || data.user.assinante) {
            navigate('/dashboard');
          } else {
            navigate('/pricing');
          }
        }, 2000);

      } else {
        setError(data.message || 'Erro no login. Verifique suas credenciais.');
      }

    } catch (error) {
      console.error('❌ Erro no login:', error);
      setError('❌ Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (email: string, password: string) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">XNEMA</h1>
          </div>
          
          <div className="space-y-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 text-sm">
              <Crown className="w-4 h-4 mr-2" />
              Teste de Login - Área do Assinante
            </Badge>
            <p className="text-sm text-muted-foreground">Página de teste com debug completo</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Form */}
          <Card className="border-blue-200 dark:border-blue-800 shadow-xl">
            <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center text-blue-900 dark:text-blue-100">
                Login de Assinante
              </CardTitle>
              <CardDescription className="text-center text-blue-700 dark:text-blue-200">
                Teste completo da funcionalidade
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              {/* System Actions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button 
                  onClick={testConnection}
                  disabled={isLoading}
                  variant="outline"
                  className="text-sm"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
                
                <Button 
                  onClick={initUsers}
                  disabled={isLoading}
                  variant="outline"
                  className="text-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Inicializar Usuários
                </Button>
              </div>

              {/* Login Form */}
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

              {/* Quick Access */}
              <div className="space-y-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Credenciais de teste:</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <button 
                    onClick={() => quickFill('iarima@xnema.com', 'iarima123')}
                    className="p-3 bg-red-100 dark:bg-red-900 rounded text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 text-left"
                  >
                    <strong>👑 Iarima (Admin)</strong><br/>
                    Email: iarima@xnema.com<br/>
                    Senha: iarima123
                  </button>
                  
                  <button 
                    onClick={() => quickFill('admin@xnema.com', 'admin123')}
                    className="p-3 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 text-left"
                  >
                    <strong>👤 Admin Geral</strong><br/>
                    Email: admin@xnema.com<br/>
                    Senha: admin123
                  </button>
                  
                  <button 
                    onClick={() => quickFill('assinante@xnema.com', '123456')}
                    className="p-3 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 text-left"
                  >
                    <strong>💎 Assinante Premium</strong><br/>
                    Email: assinante@xnema.com<br/>
                    Senha: 123456
                  </button>
                </div>
              </div>

              {/* Messages */}
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Debug & Informações</CardTitle>
              <CardDescription>
                Resposta do servidor e logs de debug
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {debugInfo ? (
                <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto max-h-96">
                  {debugInfo}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Faça uma ação para ver as informações de debug aqui
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate('/login-select')}
              variant="ghost"
              className="text-sm"
            >
              ← Seleção de Login
            </Button>
            
            <Button 
              onClick={() => navigate('/login-diagnostic')}
              variant="ghost" 
              className="text-sm"
            >
              🔧 Diagnóstico Completo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
