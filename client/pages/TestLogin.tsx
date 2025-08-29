import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

export default function TestLogin() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/db-status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ Banco conectado! ${data.usersCount} usuários encontrados`);
      } else {
        setStatus(`❌ Erro no banco: ${data.message}`);
      }
    } catch (error) {
      setStatus(`❌ Erro de conexão: ${error.message}`);
    }
    setLoading(false);
  };

  const createTestUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/create-test-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ Usuários criados! Total: ${data.totalUsers}`);
      } else {
        setStatus(`❌ Erro ao criar usuários: ${data.error}`);
      }
    } catch (error) {
      setStatus(`❌ Erro de conexão: ${error.message}`);
    }
    setLoading(false);
  };

  const testSubscriberLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login-subscriber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'assinante@teste.com',
          password: '123456'
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ Login de assinante funcionou! Token: ${data.token.substring(0, 20)}...`);
      } else {
        setStatus(`❌ Erro no login de assinante: ${data.message}`);
      }
    } catch (error) {
      setStatus(`❌ Erro de conexão: ${error.message}`);
    }
    setLoading(false);
  };

  const testCreatorLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'criador@teste.com',
          password: '123456'
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ Login de criador funcionou! Token: ${data.token.substring(0, 20)}...`);
      } else {
        setStatus(`❌ Erro no login de criador: ${data.message}`);
      }
    } catch (error) {
      setStatus(`❌ Erro de conexão: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🧪 Teste de Login</CardTitle>
          <CardDescription>
            Ferramentas para testar o sistema de login
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={checkDatabase} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Verificar Banco de Dados
            </Button>
            
            <Button 
              onClick={createTestUsers} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Criar Usuários de Teste
            </Button>
            
            <Button 
              onClick={testSubscriberLogin} 
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Testar Login Assinante
            </Button>
            
            <Button 
              onClick={testCreatorLogin} 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Testar Login Criador
            </Button>
          </div>

          {status && (
            <Alert>
              <AlertDescription>
                {status}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Credenciais de teste:</strong></p>
            <p>👤 Assinante: assinante@teste.com / 123456</p>
            <p>🎨 Criador: criador@teste.com / 123456</p>
            <p>👑 Admin: admin@teste.com / 123456</p>
          </div>

          <Button 
            onClick={() => navigate('/login-select')} 
            variant="ghost"
            className="w-full"
          >
            ← Voltar para Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
