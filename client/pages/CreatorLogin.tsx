import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Video, Crown, DollarSign, Users, ArrowRight, Lock, Mail } from "lucide-react";
import { useState } from "react";

export default function CreatorLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Simulate login
    setIsLoggedIn(true);
    // In real app, this would redirect to creator portal
  };

  const features = [
    {
      icon: DollarSign,
      title: "100% Receita por 3 Meses",
      description: "Período promocional sem taxas"
    },
    {
      icon: Video,
      title: "Upload Direto",
      description: "Sistema próprio de upload"
    },
    {
      icon: Crown,
      title: "Conteúdo Premium",
      description: "Seus vídeos marcados como exclusivos"
    },
    {
      icon: Users,
      title: "Audiência Engajada",
      description: "Base de assinantes qualificados"
    }
  ];

  if (isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-2xl text-foreground">Bem-vindo, Criador!</CardTitle>
              <CardDescription>Acesso ao portal do criador liberado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black" asChild>
                <Link to="/creator-portal">
                  <div className="flex items-center">
                    Acessar Portal do Criador
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsLoggedIn(false)}>
                Sair
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left side - Features */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Portal do <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">Criador</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Acesso exclusivo para criadores de conteúdo. Gerencie seus vídeos, acompanhe receitas e publique na plataforma XNEMA.
              </p>
              
              <div className="space-y-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">🎉 Promoção de Lançamento</h3>
                <p className="text-muted-foreground">
                  Primeiros criadores aprovados ficam com <span className="text-xnema-orange font-semibold">100% da receita</span> pelos primeiros 3 meses!
                </p>
              </div>
            </div>

            {/* Right side - Login Form */}
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-2xl text-foreground">
                  {isLogin ? "Entrar como Criador" : "Cadastro de Criador"}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? "Acesse o portal exclusivo para criadores" 
                    : "Solicite seu acesso como criador de conteúdo"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {!isLogin && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Nome Completo</label>
                      <input 
                        type="text" 
                        placeholder="Seu nome completo"
                        className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">WhatsApp</label>
                      <input 
                        type="tel" 
                        placeholder="(00) 00000-0000"
                        className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input 
                      type="email" 
                      placeholder="seu@email.com"
                      defaultValue={isLogin ? "cinexnema@gmail.com" : ""}
                      className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Senha</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Portfólio/Canal</label>
                      <input 
                        type="url" 
                        placeholder="Link do seu trabalho (YouTube, Vimeo, etc)"
                        className="flex h-10 w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground">Sobre seu conteúdo</label>
                      <textarea 
                        placeholder="Descreva o tipo de conteúdo que você cria..."
                        rows={3}
                        className="flex w-full rounded-md border border-xnema-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                  onClick={isLogin ? handleLogin : undefined}
                >
                  {isLogin ? "Entrar no Portal" : "Solicitar Acesso"}
                </Button>

                {!isLogin && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Ou entre em contato diretamente:
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm" onClick={() => window.open('https://wa.me/5515997636161', '_blank')}>
                        WhatsApp: (15) 99763-6161
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open('mailto:cinexnema@gmail.com', '_blank')}>
                        <Mail className="w-4 h-4 mr-2" />
                        cinexnema@gmail.com
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-xnema-orange hover:underline"
                  >
                    {isLogin 
                      ? "Ainda não é criador? Solicite acesso" 
                      : "Já tem acesso? Faça login"
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
