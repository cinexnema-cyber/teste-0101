import { Request, Response } from "express";
import Joi from "joi";
import User from "../models/User";
import { generateToken } from "../middleware/auth";
import bcrypt from "bcryptjs";

// Validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(), // Minimum 1 char to allow any password for testing
});

/**
 * Inicializar usuários básicos do sistema
 */
export const initializeSystemUsers = async () => {
  try {
    console.log("🔧 Verificando usuários do sistema...");

    const usersToCreate = [
      {
        email: "admin@xnema.com",
        password: "admin123",
        nome: "Administrador",
        role: "admin",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
      },
      {
        email: "assinante@xnema.com",
        password: "123456",
        nome: "Assinante Premium",
        role: "subscriber",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
      },
      {
        email: "criador@xnema.com",
        password: "123456",
        nome: "Criador de Conteúdo",
        role: "creator",
        isPremium: false,
        subscriptionStatus: "pending",
        assinante: false,
        creatorProfile: {
          bio: "Criador de conteúdo profissional",
          status: "approved",
          totalVideos: 0,
          approvedVideos: 0,
          rejectedVideos: 0,
          totalViews: 0,
          monthlyEarnings: 0,
          affiliateEarnings: 0,
          referralCount: 0,
        },
      },
    ];

    for (const userData of usersToCreate) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Usuário criado: ${userData.email} (${userData.role})`);
      } else {
        console.log(`ℹ️ Usuário já existe: ${userData.email}`);
      }
    }

    const totalUsers = await User.countDocuments();
    console.log(`📊 Total de usuários no sistema: ${totalUsers}`);

    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar usuários:", error);
    return false;
  }
};

/**
 * Login universal que funciona para qualquer role
 */
export const universalLogin = async (req: Request, res: Response) => {
  try {
    console.log("🔐 Tentativa de login universal:", {
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

    // Find user by email (any role)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      console.log("❌ Usuário não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta para:", email);
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
      });
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });

    // Response based on role
    const responseData = {
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        assinante: user.assinante,
      },
    };

    // Add role-specific data
    if (user.role === "creator" && user.creatorProfile) {
      responseData.user.creatorProfile = {
        status: user.creatorProfile.status,
        bio: user.creatorProfile.bio,
        portfolio: user.creatorProfile.portfolio,
        totalVideos: user.creatorProfile.totalVideos || 0,
        totalViews: user.creatorProfile.totalViews || 0,
        monthlyEarnings: user.creatorProfile.monthlyEarnings || 0,
        affiliateEarnings: user.creatorProfile.affiliateEarnings || 0,
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error("❌ Erro no login universal:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Login específico para assinantes
 */
export const subscriberLogin = async (req: Request, res: Response) => {
  try {
    console.log("👤 Login de assinante:", {
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

    // Find user by email (prefer subscribers, but allow any user)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      console.log("❌ Usuário não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta:", email);
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
      });
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login de assinante bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        assinante: user.assinante || user.isPremium,
      },
    });
  } catch (error) {
    console.error("❌ Erro no login de assinante:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Login específico para criadores
 */
export const creatorLogin = async (req: Request, res: Response) => {
  try {
    console.log("🎨 Login de criador:", {
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

    // Find user by email (any role, we'll convert to creator if needed)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      console.log("❌ Usuário não encontrado:", email);
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log("❌ Senha incorreta:", email);
      return res.status(401).json({
        success: false,
        message: "Senha incorreta",
      });
    }

    // If user is not a creator, we can allow them to access creator area
    // This is for flexibility - admin or subscriber can access creator portal
    let creatorProfile = user.creatorProfile;
    if (!creatorProfile) {
      creatorProfile = {
        bio: "",
        portfolio: "",
        status: "pending",
        totalVideos: 0,
        approvedVideos: 0,
        rejectedVideos: 0,
        totalViews: 0,
        monthlyEarnings: 0,
        affiliateEarnings: 0,
        referralCount: 0,
      };
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("✅ Login de criador bem-sucedido:", {
      id: user._id,
      email: user.email,
      role: user.role,
      creatorStatus: creatorProfile.status,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.nome,
        role: user.role,
        creatorProfile: {
          status: creatorProfile.status,
          bio: creatorProfile.bio,
          portfolio: creatorProfile.portfolio,
          totalVideos: creatorProfile.totalVideos || 0,
          totalViews: creatorProfile.totalViews || 0,
          monthlyEarnings: creatorProfile.monthlyEarnings || 0,
          affiliateEarnings: creatorProfile.affiliateEarnings || 0,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erro no login de criador:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Criar usuário de emergência
 */
export const createEmergencyUser = async (req: Request, res: Response) => {
  try {
    const {
      email = "emergency@xnema.com",
      password = "123456",
      role = "admin",
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.json({
        success: true,
        message: "Usuário já existe",
        user: {
          email: user.email,
          role: user.role,
          created: false,
        },
      });
    }

    // Create emergency user
    user = new User({
      email: email.toLowerCase().trim(),
      password,
      nome: "Usuário de Emergência",
      role,
      isPremium: true,
      subscriptionStatus: "active",
      assinante: true,
      creatorProfile:
        role === "creator"
          ? {
              bio: "Usuário de emergência",
              status: "approved",
              totalVideos: 0,
              approvedVideos: 0,
              rejectedVideos: 0,
              totalViews: 0,
              monthlyEarnings: 0,
              affiliateEarnings: 0,
              referralCount: 0,
            }
          : undefined,
    });

    await user.save();

    console.log("🚨 Usuário de emergência criado:", {
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Usuário de emergência criado",
      user: {
        email: user.email,
        role: user.role,
        created: true,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao criar usuário de emergência:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Listar todos os usuários (para debug)
 */
export const listAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(
      {},
      "email nome role isPremium subscriptionStatus",
    ).limit(20);

    res.json({
      success: true,
      users: users.map((user) => ({
        email: user.email,
        name: user.nome,
        role: user.role,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
      })),
      total: users.length,
    });
  } catch (error) {
    console.error("❌ Erro ao listar usuários:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
