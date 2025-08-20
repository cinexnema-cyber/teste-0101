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
  Crown,
  Check,
  Star,
  Shield,
  Smartphone,
  Tv,
  CreditCard,
  ExternalLink,
  Zap,
  Users,
  Download,
  Play,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { StripeService } from "@/lib/stripe";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "monthly",
      name: "Mensal",
      price: 19.9,
      period: "mês",
      description: "Acesso completo por 30 dias",
      popular: false,
      features: [
        "Catálogo completo sem limites",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "2 telas simultâneas",
        "Suporte via chat",
        "Acesso a lançamentos exclusivos",
      ],
    },
    {
      id: "yearly",
      name: "Anual",
      price: 199.0,
      originalPrice: 238.8,
      period: "ano",
      description: "Melhor custo-benefício",
      popular: true,
      savings: "Economize R$ 39,80 (16%)",
      features: [
        "Catálogo completo sem limites",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "4 telas simultâneas",
        "Download para assistir offline",
        "Suporte prioritário",
        "Acesso antecipado a novos lançamentos",
        "Primeiro mês incluído",
      ],
    },
  ];

  const features = [
    {
      icon: Play,
      title: "Conteúdo Exclusivo",
      description: "Séries e filmes produzidos especialmente para XNEMA",
    },
    {
      icon: Star,
      title: "Qualidade Premium",
      description: "Streaming em 4K com áudio surround e HDR",
    },
    {
      icon: Smartphone,
      title: "Multiplataforma",
      description: "Assista em TV, celular, tablet ou computador",
    },
    {
      icon: Shield,
      title: "Sem Compromisso",
      description: "Cancele quando quiser, sem taxa de cancelamento",
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.subscriptionStatus === "ativo") {
      // User already has subscription
      navigate("/subscriber-dashboard");
      return;
    }

    // Redireciona para a nova página de opções de pagamento
    navigate(`/payment-options?plan=${planId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Layout>
      <div className="min-h-screen py-20 bg-xnema-dark">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="bg-xnema-orange text-black mb-4 px-4 py-2">
              🎬 Streaming Premium
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Planos de{" "}
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                Assinatura
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Escolha o plano ideal para você e tenha acesso ilimitado ao melhor
              do entretenimento brasileiro com qualidade 4K.
            </p>

            {user?.subscriptionStatus === "ativo" && (
              <div className="mb-8">
                <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
                  ✓ Você já é um assinante Premium
                </Badge>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${
                  plan.popular
                    ? "bg-gradient-to-br from-xnema-purple/20 to-xnema-orange/20 border-xnema-orange scale-105"
                    : "bg-xnema-surface border-gray-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-xnema-orange to-xnema-purple text-center py-2">
                      <span className="text-black font-semibold text-sm">
                        🔥 MAIS POPULAR
                      </span>
                    </div>
                  </div>
                )}

                <CardHeader
                  className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}
                >
                  <CardTitle className="text-2xl text-white">
                    Plano {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {plan.description}
                  </CardDescription>

                  <div className="py-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-xnema-orange">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </div>

                    {plan.originalPrice && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-gray-500 line-through text-lg">
                          {formatPrice(plan.originalPrice)}
                        </span>
                        <Badge className="bg-green-500 text-white">
                          Economize 16%
                        </Badge>
                      </div>
                    )}

                    {plan.savings && (
                      <p className="text-green-400 text-sm mt-2 font-semibold">
                        {plan.savings}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={
                      loadingPlan === plan.id ||
                      user?.subscriptionStatus === "ativo"
                    }
                    className={`w-full text-lg py-6 ${
                      plan.popular
                        ? "bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                        : "bg-xnema-purple hover:bg-xnema-purple/90 text-white"
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : user?.subscriptionStatus === "ativo" ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Plano Ativo
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Assinar {plan.name}
                        {plan.id === "yearly" && (
                          <Badge className="ml-2 bg-green-500 text-white">
                            7 dias grátis
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>

                  {plan.id === "yearly" && (
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Teste gratuito por 7 dias, cancele a qualquer momento
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Por que escolher a{" "}
              <span className="text-xnema-orange">XNEMA?</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-xnema-surface border-gray-700 text-center"
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Compare os <span className="text-xnema-orange">Planos</span>
            </h2>

            <Card className="bg-xnema-surface border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-6 text-white">Recursos</th>
                      <th className="text-center p-6 text-white">Gratuito</th>
                      <th className="text-center p-6 text-white">Mensal</th>
                      <th className="text-center p-6 text-white bg-xnema-orange/10">
                        Anual
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Navegar catálogo", true, true, true],
                      ["Ver trailers", true, true, true],
                      ["Assistir conteúdo completo", false, true, true],
                      ["Qualidade 4K/HDR", false, true, true],
                      ["Sem anúncios", false, true, true],
                      ["Telas simultâneas", 0, 2, 4],
                      ["Download offline", false, false, true],
                      ["Suporte prioritário", false, false, true],
                    ].map(([feature, free, monthly, yearly], index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="p-6 text-gray-300">
                          {feature as string}
                        </td>
                        <td className="p-6 text-center">
                          {typeof free === "boolean" ? (
                            free ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              "—"
                            )
                          ) : (
                            free
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {typeof monthly === "boolean" ? (
                            monthly ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              "—"
                            )
                          ) : (
                            monthly
                          )}
                        </td>
                        <td className="p-6 text-center bg-xnema-orange/5">
                          {typeof yearly === "boolean" ? (
                            yearly ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              "—"
                            )
                          ) : (
                            yearly
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Perguntas <span className="text-xnema-orange">Frequentes</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: "Posso cancelar a qualquer momento?",
                  a: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento.",
                },
                {
                  q: "O que acontece após o período gratuito?",
                  a: "Após 7 dias, sua assinatura será cobrada automaticamente. Você pode cancelar antes disso.",
                },
                {
                  q: "Quantas pessoas podem usar a conta?",
                  a: "Você pode criar até 4 perfis e assistir simultaneamente em 2 (mensal) ou 4 (anual) telas.",
                },
                {
                  q: "Há taxa de cancelamento?",
                  a: "Não cobramos nenhuma taxa de cancelamento. O processo é totalmente gratuito.",
                },
              ].map((faq, index) => (
                <Card key={index} className="bg-xnema-surface border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400 text-sm">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-xnema-orange/10 to-xnema-purple/10 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Junte-se a milhares de brasileiros que já escolheram a XNEMA
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  asChild
                >
                  <a href="/register">
                    <Crown className="w-5 h-5 mr-2" />
                    Criar Conta Grátis
                  </a>
                </Button>
              ) : user.subscriptionStatus !== "ativo" ? (
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                  onClick={() => handleSubscribe("yearly")}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Começar Teste Gratuito
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  asChild
                >
                  <a href="/subscriber-dashboard">
                    <Play className="w-5 h-5 mr-2" />
                    Acessar Dashboard
                  </a>
                </Button>
              )}
            </div>

            <p className="text-sm text-gray-400 mt-4">
              Pagamento seguro via Stripe • Cancele quando quiser • Suporte 24/7
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
