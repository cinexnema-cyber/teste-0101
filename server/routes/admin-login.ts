import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../middleware/auth";

/**
 * Criar ou logar como admin principal
 * Este endpoint cria automaticamente o usuário admin se não existir
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    console.log("👑 Tentativa de login admin especial:", {
      timestamp: new Date().toISOString(),
    });

    // Credenciais padrão para admin
    const adminEmail = "iarima@xnema.com";
    const adminPassword = "iarima123";

    // Verificar se o usuário admin já existe
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log("🔧 Criando usuário admin para Iarima...");

      // Criar usuário admin automaticamente
      adminUser = new User({
        email: adminEmail,
        password: adminPassword,
        nome: "Iarima Temiski",
        role: "admin",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await adminUser.save();
      console.log("✅ Usuário admin criado para Iarima");
    }

    // Gerar token
    const token = generateToken(
      adminUser._id.toString(),
      adminUser.email,
      adminUser.role,
    );

    console.log("✅ Login admin bem-sucedido:", {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
    });

    res.json({
      success: true,
      message: "Login admin realizado com sucesso",
      token,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.nome,
        role: adminUser.role,
        isPremium: adminUser.isPremium,
        subscriptionStatus: adminUser.subscriptionStatus,
        assinante: adminUser.assinante,
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
        note: "Estas são as credenciais do admin principal",
      },
    });
  } catch (error) {
    console.error("❌ Erro no login admin:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
};

/**
 * Criar múltiplos usuários admin para teste
 */
export const createAdminUsers = async (req: Request, res: Response) => {
  try {
    console.log("🔧 Criando usuários admin para teste...");

    const adminsToCreate = [
      {
        email: "iarima@xnema.com",
        password: "iarima123",
        nome: "Iarima Temiski",
        role: "admin",
      },
      {
        email: "admin@xnema.com",
        password: "admin123",
        nome: "Administrador",
        role: "admin",
      },
      {
        email: "cinexnema@gmail.com",
        password: "I30C77T$Ii",
        nome: "CineXnema Admin",
        role: "admin",
      },
    ];

    const createdUsers = [];

    for (const adminData of adminsToCreate) {
      let user = await User.findOne({ email: adminData.email });

      if (!user) {
        user = new User({
          ...adminData,
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        });
        await user.save();
        createdUsers.push(adminData);
        console.log(`✅ Admin criado: ${adminData.email}`);
      } else {
        console.log(`ℹ️ Admin já existe: ${adminData.email}`);
      }
    }

    res.json({
      success: true,
      message: "Usuários admin configurados",
      created: createdUsers,
      totalAdmins: await User.countDocuments({ role: "admin" }),
      credentials: adminsToCreate.map((admin) => ({
        email: admin.email,
        password: admin.password,
        name: admin.nome,
      })),
    });
  } catch (error) {
    console.error("❌ Erro ao criar admins:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
};

/**
 * Verificar status dos usuários admin
 */
export const checkAdminStatus = async (req: Request, res: Response) => {
  try {
    const admins = await User.find(
      { role: "admin" },
      "email nome role isPremium subscriptionStatus",
    );

    res.json({
      success: true,
      totalAdmins: admins.length,
      admins: admins.map((admin) => ({
        email: admin.email,
        name: admin.nome,
        role: admin.role,
        isPremium: admin.isPremium,
        subscriptionStatus: admin.subscriptionStatus,
      })),
    });
  } catch (error) {
    console.error("��� Erro ao verificar admins:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
};
