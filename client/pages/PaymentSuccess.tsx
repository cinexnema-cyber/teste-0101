import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Crown,
  Play,
  Star,
  Calendar,
  Gift,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/lib/auth";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [subscriptionActivated, setSubscriptionActivated] = useState(false);

  const sessionId = searchParams.get("session_id");
  const planType = searchParams.get("plan");

  useEffect(() => {
    // Simulate subscription activation
    const activateSubscription = async () => {
      if (!user || !planType) {
        setIsProcessing(false);
        return;
      }

      try {
        // In a real implementation, you would verify the payment with Stripe
        // and then update the user's subscription status in your database

        // For now, we'll simulate this by updating the local user state
        const updatedUser = {
          ...user,
          subscriptionStatus: "ativo" as const,
          subscriptionPlan: planType as "monthly" | "yearly",
          subscriptionStart: new Date(),
          assinante: true,
          role: "subscriber" as const,
        };

        // Update local state
        setUser(updatedUser);
        localStorage.setItem("xnema_user", JSON.stringify(updatedUser));

        // In production, you would also call your backend to update the database
        // await AuthService.updateSubscription(user.id, planType);

        setSubscriptionActivated(true);
        setIsProcessing(false);

        // Redirect to subscriber dashboard after 5 seconds
        setTimeout(() => {
          navigate("/subscriber-dashboard");
        }, 5000);
      } catch (error) {
        console.error("Error activating subscription:", error);
        setIsProcessing(false);
      }
    };

    activateSubscription();
  }, [user, planType, setUser, navigate]);

  const getPlanDetails = () => {
    if (planType === "yearly") {
      return {
        name: "Plano Anual",
        price: "R$ 199,00",
        period: "por ano",
        features: [
          "Catálogo completo sem limites",
          "Qualidade 4K e HDR",
          "4 telas simultâneas",
          "Download para assistir offline",
          "Suporte prioritário",
          "Acesso antecipado a lançamentos",
        ],
        savings: "Economize R$ 39,80 (16%)",
      };
    } else {
      return {
        name: "Plano Mensal",
        price: "R$ 19,90",
        period: "por mês",
        features: [
          "Catálogo completo sem limites",
          "Qualidade 4K e HDR",
          "2 telas simultâneas",
          "Sem anúncios",
          "Suporte via chat",
        ],
        savings: null,
      };
    }
  };

  const planDetails = getPlanDetails();

  if (isProcessing) {
    return (
      <Layout>
        <div className="min-h-screen bg-xnema-dark flex items-center justify-center">
          <Card className="bg-xnema-surface border-gray-700 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Processando Pagamento
              </h2>
              <p className="text-gray-400">
                Ativando sua assinatura premium...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Success Header */}
        <section className="py-20 bg-gradient-to-r from-green-900/30 to-xnema-dark">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Pagamento Aprovado!
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                Sua assinatura {planDetails.name} foi ativada com sucesso
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  asChild
                >
                  <Link to="/subscriber-dashboard">
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      Acessar Dashboard Premium
                    </div>
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                  asChild
                >
                  <Link to="/between-heaven-hell">
                    <div className="flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      Começar a Assistir
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-xnema-surface to-xnema-dark border-green-500/30">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-xnema-orange" />
                    <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
                      ATIVO
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">
                    {planDetails.name} XNEMA
                  </CardTitle>
                  <CardDescription className="text-lg">
                    <span className="text-2xl font-bold text-xnema-orange">
                      {planDetails.price}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {planDetails.period}
                    </span>
                  </CardDescription>
                  {planDetails.savings && (
                    <div className="mt-2">
                      <Badge className="bg-green-500 text-white">
                        {planDetails.savings}
                      </Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Features */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-xnema-orange" />
                        Benefícios Inclusos
                      </h3>
                      <ul className="space-y-3">
                        {planDetails.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-xnema-orange" />
                        Próximos Passos
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-xnema-dark rounded-lg">
                          <h4 className="font-semibold text-xnema-orange mb-2">
                            1. Explore o Catálogo
                          </h4>
                          <p className="text-sm text-gray-400 mb-3">
                            Descubra mais de 50 títulos exclusivos em 4K
                          </p>
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/catalog">Explorar Agora</Link>
                          </Button>
                        </div>

                        <div className="p-4 bg-xnema-dark rounded-lg">
                          <h4 className="font-semibold text-xnema-orange mb-2">
                            2. Configure Perfis
                          </h4>
                          <p className="text-sm text-gray-400 mb-3">
                            Crie perfis para família e personalize experiências
                          </p>
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/edit-profile">Configurar Perfil</Link>
                          </Button>
                        </div>

                        <div className="p-4 bg-xnema-dark rounded-lg">
                          <h4 className="font-semibold text-xnema-orange mb-2">
                            3. Comece a Assistir
                          </h4>
                          <p className="text-sm text-gray-400 mb-3">
                            Assista nossa série exclusiva de estreia
                          </p>
                          <Button
                            size="sm"
                            className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                            asChild
                          >
                            <Link to="/between-heaven-hell">
                              <Star className="w-4 h-4 mr-2" />
                              Between Heaven and Hell
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Payment Details */}
        <section className="py-12 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-xnema-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Detalhes do Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID da Sessão:</span>
                      <span className="font-mono text-xs">
                        {sessionId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plano:</span>
                      <span>{planDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor:</span>
                      <span className="font-semibold text-green-400">
                        {planDetails.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className="bg-green-500 text-white">
                        Aprovado
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data:</span>
                      <span>{new Date().toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                    <p className="text-xs text-gray-400 mb-2">
                      Um recibo foi enviado para o seu email
                    </p>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/payment-history">
                        <Calendar className="w-4 h-4 mr-2" />
                        Ver Histórico de Pagamentos
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
