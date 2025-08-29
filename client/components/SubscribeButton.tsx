import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, Loader2, CreditCard, Zap } from "lucide-react";

// Carregar Stripe com a chave p��blica
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_live_51RxFGeJm8jhPLplQbsh5Ga8jtpjQcCvYchEWuCRSZsA2ZcRA4N0gzex4JU61PhQNTmGa7t40NflVKfhCSjE7Y6Di00LzdvlbZV",
);

interface SubscribeButtonProps {
  customerId?: string;
  priceId: string;
  creatorId?: string;
  videoId?: string;
  planType?: "monthly" | "yearly" | "individual";
  amount?: number; // em centavos
  description?: string;
  variant?: "default" | "premium" | "creator";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  customerId,
  priceId,
  creatorId,
  videoId,
  planType = "monthly",
  amount,
  description,
  variant = "default",
  size = "md",
  className = "",
  onSuccess,
  onError,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Configurações visuais baseadas na variante
  const getVariantConfig = () => {
    switch (variant) {
      case "premium":
        return {
          className:
            "bg-gradient-to-r from-xnema-orange to-xnema-purple hover:from-xnema-orange/90 hover:to-xnema-purple/90 text-white",
          icon: <Crown className="w-4 h-4 mr-2" />,
          text: planType === "yearly" ? "Assinar Anual" : "Assinar Premium",
        };
      case "creator":
        return {
          className:
            "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
          icon: <Zap className="w-4 h-4 mr-2" />,
          text: "Apoiar Criador",
        };
      default:
        return {
          className: "bg-xnema-orange hover:bg-xnema-orange/90 text-black",
          icon: <CreditCard className="w-4 h-4 mr-2" />,
          text: "Assinar Conteúdo",
        };
    }
  };

  const config = getVariantConfig();

  const formatPrice = (cents: number) => {
    const reais = cents / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(reais);
  };

  const handleSubscribe = async () => {
    if (!user) {
      onError?.("Você precisa estar logado para assinar");
      return;
    }

    setIsLoading(true);

    try {
      // Criar cliente no Stripe se necessário
      let currentCustomerId = customerId;

      if (!currentCustomerId) {
        console.log("Criando cliente Stripe...");
        const customerResponse = await fetch("/api/stripe/create-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            nome: user.name || user.displayName || user.username,
          }),
        });

        const customerData = await customerResponse.json();

        if (!customerData.sucesso) {
          throw new Error(customerData.erro || "Erro ao criar cliente");
        }

        currentCustomerId = customerData.customerId;
        console.log("Cliente criado:", currentCustomerId);
      }

      // Criar sessão de checkout
      console.log("Criando sessão de checkout...");
      const checkoutResponse = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId,
            customerId: currentCustomerId,
            creatorId,
            videoId,
            userId: user.id,
            successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/payment-cancelled`,
          }),
        },
      );

      const checkoutData = await checkoutResponse.json();

      if (!checkoutData.sucesso) {
        throw new Error(
          checkoutData.erro || "Erro ao criar sessão de checkout",
        );
      }

      // Redirecionar para o Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Erro ao carregar Stripe");
      }

      console.log("Redirecionando para checkout:", checkoutData.sessionId);
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutData.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Erro na assinatura:", error);
      onError?.(error.message || "Erro ao processar assinatura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleSubscribe}
        disabled={isLoading || !user}
        size={size as "default" | "sm" | "lg" | "icon"}
        className={`${config.className} ${className} transition-all duration-200 shadow-lg hover:shadow-xl`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            {config.icon}
            {config.text}
          </>
        )}
      </Button>

      {/* Informações adicionais */}
      <div className="flex flex-col gap-1 text-center">
        {amount && (
          <div className="text-sm font-medium text-foreground">
            {formatPrice(amount)}
            {planType === "monthly" && (
              <span className="text-gray-500">/mês</span>
            )}
            {planType === "yearly" && (
              <span className="text-gray-500">/ano</span>
            )}
          </div>
        )}

        {description && <p className="text-xs text-gray-500">{description}</p>}

        {planType === "yearly" && (
          <Badge className="bg-green-600 text-white text-xs">
            💰 Economize 16%
          </Badge>
        )}

        {creatorId && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <span>❤️ 70% vai para o criador</span>
          </div>
        )}

        {!user && (
          <p className="text-xs text-red-500">Faça login para assinar</p>
        )}
      </div>
    </div>
  );
};

export default SubscribeButton;
