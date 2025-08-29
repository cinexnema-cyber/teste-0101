import "dotenv/config";
import express from "express";
import cors from "cors";
// Database configuration removed - using only Supabase
import { handleDemo } from "./routes/demo";
import { login, register, validateToken } from "./routes/auth";
import { checkUserExists } from "./routes/check-user";
import {
  registerCreator,
  getPendingCreators,
  approveCreator,
  rejectCreator,
  getCreatorAnalytics,
  generateAffiliateLink,
} from "./routes/creator-registration";
import { authenticateToken, requireSubscriber } from "./middleware/auth";
import paymentsRouter from "./routes/payments";
import creatorRouter from "./routes/creator";
import {
  getSubscriptionPlans,
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  handleMercadoPagoWebhook,
} from "./routes/subscription";
import {
  createPayment,
  handleWebhook,
  getPaymentStatus,
  getUserPayments,
} from "./routes/mercado-pago";
import {
  getCreatorBlocks,
  calculateBlocks,
  checkUploadCapacity,
  purchaseBlocks,
  handleBlocksWebhook,
  getPurchaseHistory,
  addVideoToBlocks,
  removeVideoFromBlocks,
  getAllCreatorsBlocks,
} from "./routes/creator-blocks";
import {
  uploadContent,
  getCreatorContent,
  updateContentStatus,
  getPendingContent,
  recordView,
} from "./routes/content";
import {
  handleCreatorAnalytics,
  handleVideoAnalytics,
} from "./routes/analytics-creator";
import {
  createDirectUpload,
  uploadVideo,
  getCreatorVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  videoUpload,
} from "./routes/video-upload";
import {
  getPendingVideos,
  getAllVideos,
  approveVideo,
  rejectVideo,
  deleteVideoAdmin,
  getVideoForReview,
  getAdminStats,
} from "./routes/video-admin";
import {
  getCreatorLimits,
  updateCreatorLimits,
  restrictCreatorUpload,
  allowCreatorUpload,
  getAllCreatorsLimits,
  checkUploadCapacity,
  updateAllGracePeriods,
} from "./routes/creator-limits";
import handleMuxWebhook, { verifyMuxWebhook } from "./routes/mux-webhook";
// MongoDB initialization removed - using Supabase only

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database operations now handled by Supabase
  console.log("✅ Using Supabase for all database operations");

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Verificar status do banco de dados
  app.get("/api/admin/db-status", async (_req, res) => {
    try {
      const User = require("./models/User").default;
      const usersCount = await User.countDocuments();

      res.json({
        success: true,
        message: "Banco de dados conectado",
        usersCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Erro ao verificar banco:", error);
      res.status(500).json({
        success: false,
        message: "Erro de conexão com banco de dados",
        error: error.message,
      });
    }
  });

  // Criar usuários de teste route
  app.post("/api/admin/create-test-users", async (_req, res) => {
    try {
      const User = require("./models/User").default;

      // Verificar se usuários já existem
      const usersCount = await User.countDocuments();
      console.log(`📊 Usuários existentes: ${usersCount}`);

      const testUsers = [];

      // 1. Criar Assinante de teste
      const subscriberExists = await User.findOne({
        email: "assinante@teste.com",
      });
      if (!subscriberExists) {
        const subscriberUser = new User({
          email: "assinante@teste.com",
          password: "123456",
          nome: "Assinante Teste",
          role: "subscriber",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
          subscriptionPlan: "monthly",
          subscriptionStart: new Date(),
          watchHistory: [],
        });
        await subscriberUser.save();
        testUsers.push({ email: "assinante@teste.com", role: "subscriber" });
        console.log("✅ Usuário Assinante criado");
      } else {
        console.log("ℹ️ Usuário Assinante já existe");
      }

      // 2. Criar Criador de teste
      const creatorExists = await User.findOne({ email: "criador@teste.com" });
      if (!creatorExists) {
        const creatorUser = new User({
          email: "criador@teste.com",
          password: "123456",
          nome: "Criador Teste",
          role: "creator",
          isPremium: false,
          subscriptionStatus: "pending",
          assinante: false,
          creatorProfile: {
            bio: "Criador de conteúdo de teste",
            portfolio: "https://portfolio-teste.com",
            status: "approved",
            totalVideos: 0,
            approvedVideos: 0,
            rejectedVideos: 0,
            totalViews: 0,
            monthlyEarnings: 0,
            affiliateEarnings: 0,
            referralCount: 0,
          },
        });
        await creatorUser.save();
        testUsers.push({ email: "criador@teste.com", role: "creator" });
        console.log("✅ Usuário Criador criado");
      } else {
        console.log("ℹ️ Usuário Criador já existe");
      }

      // 3. Criar Admin de teste
      const adminExists = await User.findOne({ email: "admin@teste.com" });
      if (!adminExists) {
        const adminUser = new User({
          email: "admin@teste.com",
          password: "123456",
          nome: "Admin Teste",
          role: "admin",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        });
        await adminUser.save();
        testUsers.push({ email: "admin@teste.com", role: "admin" });
        console.log("✅ Usuário Admin criado");
      } else {
        console.log("ℹ️ Usuário Admin já existe");
      }

      const finalUsersCount = await User.countDocuments();

      res.json({
        success: true,
        message: "Usuários de teste criados com sucesso",
        usersCreated: testUsers,
        totalUsers: finalUsersCount,
        credentials: [
          {
            email: "assinante@teste.com",
            password: "123456",
            role: "subscriber",
          },
          { email: "criador@teste.com", password: "123456", role: "creator" },
          { email: "admin@teste.com", password: "123456", role: "admin" },
        ],
      });
    } catch (error) {
      console.error("❌ Erro ao criar usuários de teste:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Create test user route
  app.post("/api/admin/create-test-user", async (_req, res) => {
    try {
      const User = require("./models/User").default;

      // Delete existing test user if exists (both admin and subscriber)
      await User.deleteMany({ email: "cinexnema@gmail.com" });

      // Create new test subscriber user
      const testUser = new User({
        email: "cinexnema@gmail.com",
        password: "I30C77T$Ii", // Will be hashed automatically
        name: "CineXnema Test User",
        role: "subscriber",
        assinante: true, // Full access without payment
        subscription: {
          plan: "premium",
          status: "active",
          startDate: new Date(),
          nextBilling: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          paymentMethod: "test_account",
        },
        watchHistory: [],
      });

      const savedUser = await testUser.save();

      console.log("✅ Usuário de teste criado via API:");
      console.log("📧 Email: cinexnema@gmail.com");
      console.log("🔑 Senha: I30C77T$Ii");

      res.json({
        success: true,
        message: "Usuário de teste criado com sucesso",
        user: {
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          assinante: savedUser.assinante,
          subscription: savedUser.subscription,
        },
        loginInfo: {
          email: "cinexnema@gmail.com",
          password: "I30C77T$Ii",
          access: "Acesso completo sem pagamento",
        },
      });
    } catch (error) {
      console.error("❌ Erro ao criar usuário de teste:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.post("/api/auth/check-user", checkUserExists);
  app.get("/api/auth/validate", authenticateToken, validateToken);

  // New robust login system
  const {
    universalLogin,
    subscriberLogin,
    creatorLogin,
    createEmergencyUser,
    listAllUsers,
    initializeSystemUsers,
  } = require("./routes/login-system");

  // Universal login (works for any role)
  app.post("/api/auth/login", universalLogin);

  // Supabase authentication system
  const {
    registerSubscriberSupabase,
    loginSubscriberSupabase,
    activateSubscriptionSupabase,
    getCurrentUserSupabase,
  } = require("./routes/auth-supabase");

  // Subscriber authentication routes
  app.post("/api/auth/register-subscriber", registerSubscriberSupabase);
  app.post("/api/auth/login-subscriber", loginSubscriberSupabase);
  app.post("/api/auth/activate-subscription", activateSubscriptionSupabase);
  app.get("/api/auth/me", authenticateToken, getCurrentUserSupabase);

  // Payment system with Stripe
  const {
    createCheckoutSession,
    getSessionStatus,
    handleStripeWebhook,
    getPlans,
    cancelSubscription,
  } = require("./routes/payment-stripe");

  app.post("/api/payment/create-checkout-session", createCheckoutSession);
  app.get("/api/payment/session-status/:sessionId", getSessionStatus);
  app.post(
    "/api/payment/stripe-webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook,
  );
  app.get("/api/payment/plans", getPlans);
  app.post("/api/payment/cancel-subscription", cancelSubscription);

  // Content catalog system
  const {
    getCatalog,
    getContentById,
    recordWatch,
    getWatchHistory,
    getGenres,
    getFeaturedContent,
  } = require("./routes/content-catalog");

  app.get("/api/content/catalog", authenticateToken, getCatalog);
  app.get("/api/content/featured", authenticateToken, getFeaturedContent);
  app.get("/api/content/genres", getGenres);
  app.get("/api/content/watch-history", authenticateToken, getWatchHistory);
  app.get("/api/content/:id", authenticateToken, getContentById);
  app.post("/api/content/:id/watch", authenticateToken, recordWatch);

  // Recommendations system
  const {
    getPersonalizedRecommendations,
    getSimilarContent,
    getTrendingContent,
    rateContent,
  } = require("./routes/recommendations");

  app.get(
    "/api/recommendations/for-you",
    authenticateToken,
    getPersonalizedRecommendations,
  );
  app.get("/api/recommendations/similar/:contentId", getSimilarContent);
  app.get(
    "/api/recommendations/trending",
    authenticateToken,
    getTrendingContent,
  );
  app.post(
    "/api/recommendations/rate/:contentId",
    authenticateToken,
    rateContent,
  );

  // Creator login (keep existing)
  app.post("/api/auth/login-creator", creatorLogin);

  // Emergency and admin routes
  app.post("/api/admin/create-emergency-user", createEmergencyUser);
  app.get("/api/admin/list-users", listAllUsers);

  // Admin login routes for Iarima
  const {
    adminLogin,
    createAdminUsers,
    checkAdminStatus,
  } = require("./routes/admin-login");
  app.post("/api/admin/login", adminLogin);
  app.post("/api/admin/create-admins", createAdminUsers);
  app.get("/api/admin/status", checkAdminStatus);

  // Initialize system users on startup
  setTimeout(async () => {
    await initializeSystemUsers();
  }, 2000); // Wait 2 seconds for DB connection

  // Creator registration routes
  app.post("/api/creators/register", registerCreator);
  app.get("/api/creators/pending", authenticateToken, getPendingCreators);
  app.post(
    "/api/creators/:creatorId/approve",
    authenticateToken,
    approveCreator,
  );
  app.post("/api/creators/:creatorId/reject", authenticateToken, rejectCreator);
  app.get("/api/creators/analytics", authenticateToken, getCreatorAnalytics);
  app.post(
    "/api/creators/affiliate-link",
    authenticateToken,
    generateAffiliateLink,
  );

  // Endpoints específicos para Builder.io
  app.post("/api/auth/cadastrar", async (req, res) => {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          success: false,
          message: "Nome, email e senha são obrigatórios",
        });
      }

      const User = require("./models/User").default;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email já está em uso",
        });
      }

      // Criar novo usuário (antes do pagamento)
      const userData = {
        email: email.toLowerCase(),
        password: senha,
        name: nome,
        role: "subscriber",
        assinante: false, // Sem acesso até pagamento
        subscription: {
          plan: "premium",
          status: "pending",
          startDate: new Date(),
          paymentMethod: "pending",
        },
        watchHistory: [],
      };

      const user = new User(userData);
      const savedUser = await user.save();

      console.log("✅ Usuário cadastrado (aguardando pagamento):", email);

      res.json({
        success: true,
        message:
          "Usuário cadastrado com sucesso! Complete o pagamento para ter acesso.",
        userId: savedUser._id.toString(),
      });
    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: "Email e senha são obrigatórios",
        });
      }

      const User = require("./models/User").default;

      // Buscar usuário
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email ou senha incorretos",
        });
      }

      // Verificar senha
      const isPasswordValid = await user.comparePassword(senha);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Email ou senha incorretos",
        });
      }

      // Gerar token
      const { generateToken } = require("./middleware/auth");
      const token = generateToken(user._id.toString(), user.email, user.role);

      console.log("✅ Login realizado:", email);

      res.json({
        success: true,
        message: "Login realizado com sucesso",
        token: token,
        isAssinante: user.assinante || false,
        userId: user._id.toString(),
        userName: user.name,
      });
    } catch (error) {
      console.error("❌ Erro no login:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  app.post("/api/auth/pagamento", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId é obrigatório",
        });
      }

      const User = require("./models/User").default;

      // Buscar e atualizar usuário
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            assinante: true,
            "subscription.status": "active",
            "subscription.startDate": new Date(),
            "subscription.nextBilling": new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ), // 30 dias
            "subscription.paymentMethod": "mercado_pago",
            "subscription.mercadoPagoId": `mp_${Date.now()}`,
          },
        },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      console.log("✅ Pagamento confirmado para:", user.email);

      res.json({
        success: true,
        message: "Pagamento confirmado! Acesso liberado.",
        isAssinante: true,
        subscription: user.subscription,
      });
    } catch (error) {
      console.error("❌ Erro na confirmação de pagamento:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email é obrigatório",
        });
      }

      const User = require("./models/User").default;

      // Verificar se usuário existe
      const user = await User.findOne({ email: email.toLowerCase() });

      // Por segurança, sempre retornamos sucesso mesmo se o email não existir
      // Em produção, enviaria email real aqui
      console.log(`📧 Solicitação de recuperação de senha para: ${email}`);
      console.log(
        `✅ ${user ? "Usuário encontrado" : "Usuário não encontrado"} - Email de recuperação "enviado"`,
      );

      res.json({
        success: true,
        message:
          "Se o email existir, você receberá instruções para redefinir sua senha.",
      });
    } catch (error) {
      console.error("❌ Erro na recuperação de senha:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  // Subscription routes
  app.get("/api/subscription/plans", getSubscriptionPlans);
  app.post(
    "/api/subscription/subscribe",
    authenticateToken,
    requireSubscriber,
    createSubscription,
  );
  app.post(
    "/api/subscription/cancel",
    authenticateToken,
    requireSubscriber,
    cancelSubscription,
  );
  app.get("/api/subscription/status", authenticateToken, getSubscriptionStatus);
  app.post("/api/webhook/mercadopago", handleMercadoPagoWebhook);

  // New Mercado Pago payment routes
  app.post("/api/payments/create", authenticateToken, createPayment);
  app.post("/api/payments/webhook", handleWebhook);
  app.get("/api/payments/status/:transactionId", getPaymentStatus);
  app.get("/api/payments/user/:userId", authenticateToken, getUserPayments);

  // Webhook retry routes
  const {
    processRetries,
    getWebhookLogs,
    retrySpecificWebhook,
  } = require("./routes/webhook-retry");
  app.post("/api/webhooks/process-retries", processRetries);
  app.get("/api/webhooks/logs", getWebhookLogs);
  app.post("/api/webhooks/retry/:webhookId", retrySpecificWebhook);

  // Video routes with movie/series support
  const {
    createVideo,
    getCreatorAccess,
    getCreatorVideos,
    getPendingVideos,
    approveVideo,
    rejectVideo,
    getVideoDetails,
  } = require("./routes/videos");
  app.post("/api/videos/create", authenticateToken, createVideo);
  app.get("/api/creator/access", authenticateToken, getCreatorAccess);
  app.get("/api/videos/creator/:creatorId", getCreatorVideos);
  app.get("/api/videos/pending-approval", authenticateToken, getPendingVideos);
  app.post("/api/videos/:videoId/approve", authenticateToken, approveVideo);
  app.post("/api/videos/:videoId/reject", authenticateToken, rejectVideo);
  app.get("/api/videos/:videoId", getVideoDetails);

  // Protected routes examples using authRole middleware
  const {
    authRole,
    authSubscriber,
    authCreator,
    authAdmin,
    requirePremium,
    requireApprovedCreator,
  } = require("./middleware/authRole");

  // Creator dashboard - only for creators
  app.get("/api/creator/dashboard", authCreator, async (req, res) => {
    res.json({
      success: true,
      message: "Bem-vindo, criador!",
      user: req.user,
    });
  });

  // Subscriber dashboard - only for subscribers/premium
  app.get("/api/subscriber/dashboard", authSubscriber, async (req, res) => {
    res.json({
      success: true,
      message: "Bem-vindo, assinante!",
      user: req.user,
      isPremium: req.user.isPremium,
    });
  });

  // Premium content - only for premium subscribers
  app.get("/api/content/premium", requirePremium, async (req, res) => {
    res.json({
      success: true,
      message: "Conteúdo premium desbloqueado!",
      content: "Este é um conteúdo exclusivo para assinantes premium",
    });
  });

  // Admin panel - only for admins
  app.get("/api/admin/panel", authAdmin, async (req, res) => {
    res.json({
      success: true,
      message: "Painel administrativo",
      user: req.user,
    });
  });

  // Approved creator features - only for approved creators
  app.get(
    "/api/creator/advanced-features",
    requireApprovedCreator,
    async (req, res) => {
      res.json({
        success: true,
        message: "Funcionalidades avançadas desbloqueadas!",
        features: [
          "analytics_advanced",
          "monetization_tools",
          "priority_support",
        ],
      });
    },
  );

  // Creator blocks routes
  app.get(
    "/api/creator-blocks/:creatorId",
    authenticateToken,
    getCreatorBlocks,
  );
  app.post("/api/creator-blocks/calculate", calculateBlocks);
  app.post(
    "/api/creator-blocks/:creatorId/check-upload",
    authenticateToken,
    checkUploadCapacity,
  );
  app.post(
    "/api/creator-blocks/:creatorId/purchase",
    authenticateToken,
    purchaseBlocks,
  );
  app.post("/api/creator-blocks/webhook", handleBlocksWebhook);
  app.get(
    "/api/creator-blocks/:creatorId/purchases",
    authenticateToken,
    getPurchaseHistory,
  );
  app.post(
    "/api/creator-blocks/:creatorId/add-video",
    authenticateToken,
    addVideoToBlocks,
  );
  app.post(
    "/api/creator-blocks/:creatorId/remove-video",
    authenticateToken,
    removeVideoFromBlocks,
  );
  app.get("/api/admin/creator-blocks", authenticateToken, getAllCreatorsBlocks);

  // Pre-payment user registration (with limited access)
  app.post("/api/subscription/pre-register", async (req, res) => {
    try {
      const { email, name, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email e senha são obrigatórios",
        });
      }

      const User = require("./models/User").default;

      // Check if user already exists
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        return res.status(409).json({
          success: false,
          message: "Email já está em uso",
        });
      }

      // Create new user with limited access (before payment)
      const userData = {
        email: email.toLowerCase(),
        password: password,
        name: name || email.split("@")[0] || "Usuário XNEMA",
        role: "subscriber",
        assinante: false, // No access until payment
        subscription: {
          plan: "premium",
          status: "pending",
          startDate: new Date(),
          paymentMethod: "pending",
        },
        watchHistory: [],
      };

      user = new User(userData);
      await user.save();

      console.log("✅ Usuário pré-registrado (antes do pagamento):", email);

      res.json({
        success: true,
        message:
          "Usuário registrado! Complete o pagamento para ter acesso total.",
        user: user.toJSON(),
        requiresPayment: true,
      });
    } catch (error) {
      console.error("❌ Erro no pré-registro:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  // Auto-register subscriber on payment confirmation
  app.post("/api/subscription/auto-register", async (req, res) => {
    try {
      const { email, paymentId, plan = "premium" } = req.body;

      if (!email || !paymentId) {
        return res.status(400).json({
          success: false,
          message: "Email e ID de pagamento são obrigatórios",
        });
      }

      const User = require("./models/User").default;

      // Check if user already exists
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Update existing user with subscription
        user.role = "subscriber";
        user.assinante = true;
        user.subscription = {
          plan: plan,
          status: "active",
          startDate: new Date(),
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          paymentMethod: "mercado_pago",
          mercadoPagoId: paymentId,
        };
        user.watchHistory = user.watchHistory || [];

        await user.save();

        console.log("✅ Usuário existente atualizado com assinatura:", email);
      } else {
        // Create new subscriber user
        const userData = {
          email: email.toLowerCase(),
          password: `temp_${Date.now()}_${Math.random().toString(36)}`, // Temporary password
          name: email.split("@")[0] || "Usuário XNEMA",
          role: "subscriber",
          assinante: true,
          subscription: {
            plan: plan,
            status: "active",
            startDate: new Date(),
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "mercado_pago",
            mercadoPagoId: paymentId,
          },
          watchHistory: [],
        };

        user = new User(userData);
        await user.save();

        console.log("✅ Novo usuário assinante criado automaticamente:", email);
      }

      res.json({
        success: true,
        message: "Usuário registrado/atualizado com sucesso",
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("��� Erro no registro automático:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  // Content management routes
  app.post("/api/content/upload", authenticateToken, uploadContent);
  app.get("/api/content/creator", authenticateToken, getCreatorContent);
  app.put(
    "/api/content/:contentId/status",
    authenticateToken,
    updateContentStatus,
  );
  app.get("/api/content/pending", authenticateToken, getPendingContent);
  app.post("/api/content/:contentId/view", recordView);

  // Analytics routes for creators (Google Analytics integration)
  app.post("/api/analytics/creator-data", handleCreatorAnalytics);
  app.post("/api/analytics/video-data", handleVideoAnalytics);

  // Video upload routes for creators
  app.post("/api/videos/direct-upload", authenticateToken, createDirectUpload);
  app.post(
    "/api/videos/upload",
    authenticateToken,
    videoUpload.single("video"),
    uploadVideo,
  );
  app.get("/api/videos/creator", authenticateToken, getCreatorVideos);
  app.get("/api/videos/:videoId", authenticateToken, getVideoById);
  app.put("/api/videos/:videoId", authenticateToken, updateVideo);
  app.delete("/api/videos/:videoId", authenticateToken, deleteVideo);

  // Video admin routes
  app.get("/api/admin/videos/pending", authenticateToken, getPendingVideos);
  app.get("/api/admin/videos", authenticateToken, getAllVideos);
  app.get(
    "/api/admin/videos/:videoId/review",
    authenticateToken,
    getVideoForReview,
  );
  app.post(
    "/api/admin/videos/:videoId/approve",
    authenticateToken,
    approveVideo,
  );
  app.post("/api/admin/videos/:videoId/reject", authenticateToken, rejectVideo);
  app.delete("/api/admin/videos/:videoId", authenticateToken, deleteVideoAdmin);
  app.get("/api/admin/stats", authenticateToken, getAdminStats);

  // Creator limits routes
  app.get(
    "/api/creators/:creatorId/limits",
    authenticateToken,
    getCreatorLimits,
  );
  app.post(
    "/api/creators/:creatorId/check-upload",
    authenticateToken,
    checkUploadCapacity,
  );
  app.get(
    "/api/admin/creators/limits",
    authenticateToken,
    getAllCreatorsLimits,
  );
  app.put(
    "/api/admin/creators/:creatorId/limits",
    authenticateToken,
    updateCreatorLimits,
  );
  app.post(
    "/api/admin/creators/:creatorId/restrict",
    authenticateToken,
    restrictCreatorUpload,
  );
  app.post(
    "/api/admin/creators/:creatorId/allow",
    authenticateToken,
    allowCreatorUpload,
  );
  app.post(
    "/api/admin/creators/update-grace-periods",
    authenticateToken,
    updateAllGracePeriods,
  );

  // Mux webhook endpoint (no authentication required for webhooks)
  app.post("/api/webhooks/mux", verifyMuxWebhook, handleMuxWebhook);

  // Protected routes (examples)
  app.get("/api/admin/users", authenticateToken, async (req, res) => {
    try {
      // Only admins can access this
      if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { createClient } = require("@supabase/supabase-js");
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, name, role, is_premium, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Statistics
      const stats = {
        total: users?.length || 0,
        subscribers: users?.filter((u) => u.role === "subscriber").length || 0,
        creators: users?.filter((u) => u.role === "creator").length || 0,
        admins: users?.filter((u) => u.role === "admin").length || 0,
        activeSubscribers:
          users?.filter((u) => u.role === "subscriber" && u.is_premium)
            .length || 0,
      };

      console.log("📊 Usuários cadastrados:", stats);

      res.json({
        success: true,
        users: users || [],
        stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Debug route to show database status - using Supabase
  app.get("/api/debug/db-status", async (req, res) => {
    try {
      const { createClient } = require("@supabase/supabase-js");
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { count: userCount, error: countError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { data: recentUsers, error: usersError } = await supabase
        .from("users")
        .select("email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (countError || usersError) {
        throw countError || usersError;
      }

      res.json({
        success: true,
        database: {
          connected: true,
          host: "supabase",
          name: "postgres",
          totalUsers: userCount || 0,
          recentUsers: recentUsers || [],
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Erro no debug:", error);
      res.json({
        success: false,
        database: {
          connected: false,
          error: error.message,
          connectionInfo: "Using Supabase for all database operations",
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get("/api/creator/analytics", authenticateToken, async (req, res) => {
    try {
      if (req.userRole !== "creator") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Mock analytics data
      const analytics = {
        totalViews: req.user.content?.totalViews || 0,
        totalEarnings: req.user.content?.totalEarnings || 0,
        monthlyViews: 450,
        monthlyEarnings: req.user.content?.monthlyEarnings || 0,
        topVideos: [
          { id: "1", title: "Vídeo Popular 1", views: 500, earnings: 25.5 },
          { id: "2", title: "Vídeo Popular 2", views: 300, earnings: 15.75 },
        ],
        viewsHistory: [
          { date: "2024-01-01", views: 100 },
          { date: "2024-01-02", views: 150 },
          { date: "2024-01-03", views: 200 },
        ],
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar analytics" });
    }
  });

  // Analytics routes (simplified version)
  try {
    const analyticsRouter = require("./routes/analytics-simple").default;
    app.use("/api/analytics", analyticsRouter);
    console.log("✅ Analytics routes (simplified) loaded");
  } catch (error) {
    console.warn("⚠️ Analytics routes not available:", error.message);
  }

  // Contact routes
  try {
    const contactRouter = require("./routes/contact").default;
    app.use("/api/contact", contactRouter);
    console.log("✅ Contact routes loaded");
  } catch (error) {
    console.warn("⚠️ Contact routes not available:", error.message);
  }

  return app;
}
