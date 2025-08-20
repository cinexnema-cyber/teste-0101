// Stripe Payment Integration Service
// Using the restricted key provided by the user

interface StripeCheckoutSession {
  url: string;
  id: string;
}

interface PaymentPlan {
  name: string;
  price: number; // in cents
  currency: string;
  description: string;
  features: string[];
}

export class StripeService {
  // Using production keys for live payments
  private static readonly STRIPE_PUBLISHABLE_KEY =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_live_51RxFGeJm8jhPLplQbsh5Ga8jtpjQcCvYchEWuCRSZsA2ZcRA4N0gzex4JU61PhQNTmGa7t40NflVKfhCSjE7Y6Di00LzdvlbZV";

  // Payment plans configuration
  static readonly PLANS: { [key: string]: PaymentPlan } = {
    monthly: {
      name: "Plano Mensal XNEMA",
      price: 1990, // R$ 19.90 in cents
      currency: "brl",
      description: "Acesso completo ao catálogo XNEMA por 30 dias",
      features: [
        "Catálogo completo de séries e filmes",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "2 telas simultâneas",
        "Suporte via chat",
      ],
    },
    yearly: {
      name: "Plano Anual XNEMA",
      price: 19900, // R$ 199.00 in cents (save 2 months)
      currency: "brl",
      description: "Acesso completo ao catálogo XNEMA por 12 meses",
      features: [
        "Catálogo completo de séries e filmes",
        "Qualidade 4K e HDR",
        "Sem anúncios",
        "4 telas simultâneas",
        "Download para assistir offline",
        "Suporte prioritário",
        "Acesso antecipado a novos lançamentos",
        "Economize 2 meses (16% de desconto)",
      ],
    },
  };

  /**
   * Create a Stripe Checkout Session for subscription
   * @param planType - 'monthly' or 'yearly'
   * @param userId - User ID for metadata
   * @param userEmail - User email
   * @returns Promise with checkout session URL
   */
  static async createCheckoutSession(
    planType: "monthly" | "yearly",
    userId: string,
    userEmail: string,
  ): Promise<StripeCheckoutSession> {
    try {
      const plan = this.PLANS[planType];
      if (!plan) {
        throw new Error("Invalid plan type");
      }

      // Prepare form data for Stripe API
      const formData = new URLSearchParams();

      // Payment method and mode
      formData.append("payment_method_types[]", "card");
      formData.append("mode", "payment"); // One-time payment (you can change to 'subscription' for recurring)

      // Line items (the product being purchased)
      formData.append("line_items[][price_data][currency]", plan.currency);
      formData.append(
        "line_items[][price_data][product_data][name]",
        plan.name,
      );
      formData.append(
        "line_items[][price_data][product_data][description]",
        plan.description,
      );
      formData.append(
        "line_items[][price_data][unit_amount]",
        plan.price.toString(),
      );
      formData.append("line_items[][quantity]", "1");

      // Success and cancel URLs
      const baseUrl = window.location.origin;
      formData.append(
        "success_url",
        `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
      );
      formData.append(
        "cancel_url",
        `${baseUrl}/payment-cancelled?plan=${planType}`,
      );

      // Metadata for tracking
      formData.append("metadata[user_id]", userId);
      formData.append("metadata[plan_type]", planType);
      formData.append("metadata[user_email]", userEmail);

      // Customer info
      formData.append("customer_email", userEmail);

      // Make request to Stripe API
      const response = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.STRIPE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Stripe API Error:", errorData);
        throw new Error(
          errorData.error?.message || "Failed to create checkout session",
        );
      }

      const session = await response.json();

      return {
        url: session.url,
        id: session.id,
      };
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      throw error;
    }
  }

  /**
   * Redirect user to Stripe Checkout
   * @param planType - 'monthly' or 'yearly'
   * @param userId - User ID
   * @param userEmail - User email
   */
  static async redirectToCheckout(
    planType: "monthly" | "yearly",
    userId: string,
    userEmail: string,
  ): Promise<void> {
    try {
      const session = await this.createCheckoutSession(
        planType,
        userId,
        userEmail,
      );

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Error redirecting to checkout:", error);
      throw error;
    }
  }

  /**
   * Get plan details by type
   * @param planType - 'monthly' or 'yearly'
   * @returns PaymentPlan object
   */
  static getPlan(planType: "monthly" | "yearly"): PaymentPlan | null {
    return this.PLANS[planType] || null;
  }

  /**
   * Format price for display
   * @param priceInCents - Price in cents
   * @param currency - Currency code
   * @returns Formatted price string
   */
  static formatPrice(priceInCents: number, currency: string = "brl"): string {
    const price = priceInCents / 100;

    if (currency.toLowerCase() === "brl") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  }

  /**
   * Calculate savings for yearly plan
   * @returns Object with savings amount and percentage
   */
  static calculateYearlySavings(): { amount: string; percentage: number } {
    const monthlyTotal = this.PLANS.monthly.price * 12;
    const yearlyPrice = this.PLANS.yearly.price;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);

    return {
      amount: this.formatPrice(savings),
      percentage,
    };
  }
}

// Helper function to get environment-specific URLs
export const getCallbackUrls = () => {
  const baseUrl = window.location.origin;

  return {
    success: `${baseUrl}/payment-success`,
    cancel: `${baseUrl}/payment-cancelled`,
    webhook: `${baseUrl}/api/stripe/webhook`, // For future webhook implementation
  };
};

// Export types for use in components
export type { PaymentPlan, StripeCheckoutSession };
