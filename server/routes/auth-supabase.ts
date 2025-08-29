import { Request, Response } from "express";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Importar cliente Supabase do lado servidor
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl =
  process.env.SUPABASE_URL || "https://gardjxolnrykvxxtatdq.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcmRqeG9sbnJ5a3Z4eHRhdGRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM3NjcyNywiZXhwIjoyMDcwOTUyNzI3fQ.L5P2vYFnqSU1n6aTKRsWg2M7kxO1tF6y0l4K3S_HpQA";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET || "xnema-secret-key-2024";

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  plan: Joi.string().valid("monthly", "yearly", "lifetime").default("monthly"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

// Função para gerar token JWT
const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Cadastro de novo assinante no Supabase
 * POST /api/auth/register-subscriber
 */
export const registerSubscriberSupabase = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("📝 Tentativa de cadastro no Supabase:", {
      email: req.body.email,
      name: req.body.name,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, email, password, phone, plan } = value;

    // Verificar se email já existe
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existingUser) {
      console.log("❌ Email já existe:", email);
      return res.status(409).json({
        success: false,
        message: "Este email já está cadastrado",
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar novo usuário no Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          phone: phone || "",
          role: "subscriber",
          subscription_status: "pending",
          subscription_plan: plan,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Erro ao inserir usuário:", insertError);
      return res.status(500).json({
        success: false,
        message: "Erro ao criar conta. Tente novamente.",
      });
    }

    console.log("✅ Usuário cadastrado no Supabase:", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    // Gerar token para login automático
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: "Cadastro realizado com sucesso!",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isPremium: newUser.is_premium,
        subscriptionStatus: newUser.subscription_status,
        subscriptionPlan: newUser.subscription_plan,
        assinante: newUser.is_premium,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("❌ Erro no cadastro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Login de assinante no Supabase
 * POST /api/auth/login-subscriber
 */
export const loginSubscriberSupabase = async (req: Request, res: Response) => {
  try {
    console.log("🔐 Tentativa de login no Supabase:", {
      email: req.body.email,
      timestamp: new Date().toISOString(),
    });

    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Buscar usuário no Supabase
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (fetchError || !user) {
      console.log("❌ Usuário não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.log("❌ Senha incorreta para:", email);
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    // Verificar se assinatura expirou
    let isPremium = user.is_premium;
    if (user.subscription_end && new Date() > new Date(user.subscription_end)) {
      isPremium = false;
      // Atualizar status no banco
      await supabase
        .from("users")
        .update({
          is_premium: false,
          subscription_status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    // Gerar token
    const token = generateToken(user.id, user.email, user.role);

    console.log("✅ Login bem-sucedido no Supabase:", {
      id: user.id,
      email: user.email,
      role: user.role,
      isPremium,
    });

    res.json({
      success: true,
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPremium,
        subscriptionStatus: isPremium ? user.subscription_status : "expired",
        subscriptionPlan: user.subscription_plan,
        assinante: isPremium,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Ativar assinatura após pagamento
 * POST /api/auth/activate-subscription
 */
export const activateSubscriptionSupabase = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId, plan = "monthly", paymentId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID do usuário é obrigatório",
      });
    }

    // Calcular data de término da assinatura
    const subscriptionEnd = new Date();
    switch (plan) {
      case "monthly":
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        break;
      case "yearly":
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        break;
      case "lifetime":
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100);
        break;
      default:
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    // Atualizar usuário no Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        is_premium: true,
        subscription_status: "active",
        subscription_plan: plan,
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Erro ao ativar assinatura:", updateError);
      return res.status(500).json({
        success: false,
        message: "Erro ao ativar assinatura",
      });
    }

    // Registrar pagamento se fornecido
    if (paymentId) {
      await supabase.from("payments").insert([
        {
          user_id: userId,
          amount: plan === "monthly" ? 19.9 : plan === "yearly" ? 199.9 : 499.9,
          currency: "BRL",
          plan: plan,
          status: "completed",
          payment_method: "credit_card",
          transaction_id: paymentId,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    console.log("✅ Assinatura ativada no Supabase:", {
      userId,
      plan,
      subscriptionEnd,
    });

    res.json({
      success: true,
      message: "Assinatura ativada com sucesso!",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isPremium: updatedUser.is_premium,
        subscriptionStatus: updatedUser.subscription_status,
        subscriptionPlan: updatedUser.subscription_plan,
        assinante: updatedUser.is_premium,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao ativar assinatura:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Verificar usuário atual
 * GET /api/auth/me
 */
export const getCurrentUserSupabase = async (req: any, res: Response) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verificar se assinatura expirou
    let isPremium = user.is_premium;
    if (user.subscription_end && new Date() > new Date(user.subscription_end)) {
      isPremium = false;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isPremium,
        subscriptionStatus: isPremium ? user.subscription_status : "expired",
        subscriptionPlan: user.subscription_plan,
        assinante: isPremium,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
