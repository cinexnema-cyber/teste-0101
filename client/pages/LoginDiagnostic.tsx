import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  Crown, 
  User, 
  Video, 
  Database,
  Settings,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function LoginDiagnostic() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState({});
  const navigate = useNavigate();

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTests(prev => ({ ...prev, [testName]: { success: true, result } }));
      setStatus(`✅ ${testName} passou`);
    } catch (error) {
      setTests(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
      setStatus(`❌ ${testName} falhou: ${error.message}`);
    }
    setLoading(false);
  };

  const testDatabaseConnection = async () => {
    const response = await fetch('/api/admin/status');
    const data = await response.json();
    if (!data.success) throw new Error('Falha na conexão com banco');
    return `${data.totalAdmins} admins encontrados`;
  };

  const testAdminCreation = async () => {
    const response = await fetch('/api/admin/create-admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error('Falha ao criar admins');
    return `${data.totalAdmins} admins configurados`;
  };

  const testAdminLogin = async () => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.success) throw new Error('Falha no login admin');
    return `Login como ${data.user.name}`;
  };

  const testSubscriberLogin = async () => {
    const response = await fetch('/api/auth/login-subscriber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'assinante@xnema.com', password: '123456' })
    });
    const data = await response.json();
    if (!data.success) throw new Error('Falha no login de assinante');
    return `Login como ${data.user.name}`;
  };

  const testCreatorLogin = async () => {
    const response = await fetch('/api/auth/login-creator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'criador@xnema.com', password: '123456' })
    });
    const data = await response.json();
    if (!data.success) throw new Error('Falha no login de criador');
    return `Login como ${data.user.name}`;
  };

  const runAllTests = async () => {
    setStatus('🔄 Executando todos os testes...');
    setTests({});
    
    await runTest('Conexão com Banco', testDatabaseConnection);
    await runTest('Criação de Admins', testAdminCreation);
    await runTest('Login Admin', testAdminLogin);
    await runTest('Login Assinante', testSubscriberLogin);
    await runTest('Login Criador', testCreatorLogin);
    
    setStatus('✅ Todos os testes concluídos');
  };

  const quickAdminLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('xnema_token', data.token);
        localStorage.setItem('xnema_user', JSON.stringify(data.user));
        setStatus('✅ Login admin realizado! Redirecionando...');
        setTimeout(() => navigate('/admin-dashboard'), 1000);
      } else {
        setStatus('❌ Erro no login admin');
      }
    } catch (error) {
      setStatus('❌ Erro de conexão');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Diagnóstico do Sistema de Login</h1>
          <p className="text-slate-400">Verificação completa das funcionalidades</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Button 
            onClick={quickAdminLogin}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white p-6"
          >
            <Crown className="w-6 h-6 mb-2" />
            Login Admin Rápido
          </Button>
          
          <Button 
            onClick={() => navigate('/login/subscriber')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6"
          >
            <User className="w-6 h-6 mb-2" />
            Área Assinante
          </Button>
          
          <Button 
            onClick={() => navigate('/login/creator')}
            className="bg-orange-600 hover:bg-orange-700 text-white p-6"
          >
            <Video className="w-6 h-6 mb-2" />
            Área Criador
          </Button>
          
          <Button 
            onClick={runAllTests}
            disabled={loading}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 p-6"
          >
            <RefreshCw className="w-6 h-6 mb-2" />
            Executar Testes
          </Button>
        </div>

        {/* Test Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Individual Tests */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Testes Individuais
              </CardTitle>
              <CardDescription className="text-slate-400">
                Execute testes específicos
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Button 
                onClick={() => runTest('Banco de Dados', testDatabaseConnection)}
                disabled={loading}
                variant="outline"
                className="w-full justify-start border-slate-600 text-slate-300"
              >
                <Database className="w-4 h-4 mr-2" />
                Testar Banco de Dados
              </Button>
              
              <Button 
                onClick={() => runTest('Admin Login', testAdminLogin)}
                disabled={loading}
                variant="outline"
                className="w-full justify-start border-slate-600 text-slate-300"
              >
                <Crown className="w-4 h-4 mr-2" />
                Testar Login Admin
              </Button>
              
              <Button 
                onClick={() => runTest('Subscriber Login', testSubscriberLogin)}
                disabled={loading}
                variant="outline"
                className="w-full justify-start border-slate-600 text-slate-300"
              >
                <User className="w-4 h-4 mr-2" />
                Testar Login Assinante
              </Button>
              
              <Button 
                onClick={() => runTest('Creator Login', testCreatorLogin)}
                disabled={loading}
                variant="outline"
                className="w-full justify-start border-slate-600 text-slate-300"
              >
                <Video className="w-4 h-4 mr-2" />
                Testar Login Criador
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Resultados dos Testes</CardTitle>
              <CardDescription className="text-slate-400">
                Status atual do sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {Object.entries(tests).map(([testName, result]: [string, any]) => (
                <div key={testName} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{testName}</p>
                    <p className="text-xs text-slate-400">
                      {result.success ? result.result : result.error}
                    </p>
                  </div>
                  <Badge 
                    variant={result.success ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {result.success ? "OK" : "ERRO"}
                  </Badge>
                </div>
              ))}
              
              {Object.keys(tests).length === 0 && (
                <p className="text-slate-400 text-center py-4">
                  Nenhum teste executado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        {status && (
          <Alert className="bg-slate-800/50 border-slate-700">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            <AlertDescription className="text-slate-300">
              {status}
            </AlertDescription>
          </Alert>
        )}

        {/* Credentials Reference */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Credenciais Disponíveis</CardTitle>
            <CardDescription className="text-slate-400">
              Use estas credenciais para teste
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-red-950/50 rounded border border-red-800">
                <h4 className="font-medium text-red-300 mb-2">👑 Admin</h4>
                <p className="text-slate-300">Email: iarima@xnema.com</p>
                <p className="text-slate-300">Senha: iarima123</p>
              </div>
              
              <div className="p-3 bg-blue-950/50 rounded border border-blue-800">
                <h4 className="font-medium text-blue-300 mb-2">👤 Assinante</h4>
                <p className="text-slate-300">Email: assinante@xnema.com</p>
                <p className="text-slate-300">Senha: 123456</p>
              </div>
              
              <div className="p-3 bg-orange-950/50 rounded border border-orange-800">
                <h4 className="font-medium text-orange-300 mb-2">🎨 Criador</h4>
                <p className="text-slate-300">Email: criador@xnema.com</p>
                <p className="text-slate-300">Senha: 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center space-y-4">
          <Button 
            onClick={() => navigate('/login-select')}
            variant="ghost"
            className="text-slate-400 hover:text-slate-200"
          >
            ← Voltar para Seleção de Login
          </Button>
        </div>
      </div>
    </div>
  );
}
