import User from "../models/User";
import { connectDB } from "../config/database";

export const createTestUsers = async () => {
  try {
    // Conectar ao banco se não estiver conectado
    await connectDB();

    console.log("🔧 Criando usuários de teste...");

    // 1. Criar usuário Assinante de teste
    const existingSubscriber = await User.findOne({ email: "assinante@teste.com" });
    if (!existingSubscriber) {
      const subscriberUser = new User({
        email: "assinante@teste.com",
        password: "123456", // Será hasheado automaticamente
        nome: "Assinante Teste",
        role: "subscriber",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true,
        subscriptionPlan: "monthly",
        subscriptionStart: new Date(),
        watchHistory: []
      });

      await subscriberUser.save();
      console.log("✅ Usuário Assinante criado:", {
        email: "assinante@teste.com",
        password: "123456",
        role: "subscriber"
      });
    } else {
      console.log("ℹ️ Usuário Assinante já existe");
    }

    // 2. Criar usuário Criador de teste
    const existingCreator = await User.findOne({ email: "criador@teste.com" });
    if (!existingCreator) {
      const creatorUser = new User({
        email: "criador@teste.com",
        password: "123456", // Será hasheado automaticamente
        nome: "Criador Teste",
        role: "creator",
        isPremium: false,
        subscriptionStatus: "pending",
        assinante: false,
        creatorProfile: {
          bio: "Criador de conteúdo de teste",
          portfolio: "https://portfolio-teste.com",
          status: "approved", // Aprovado para testes
          totalVideos: 0,
          approvedVideos: 0,
          rejectedVideos: 0,
          totalViews: 0,
          monthlyEarnings: 0,
          affiliateEarnings: 0,
          referralCount: 0
        }
      });

      await creatorUser.save();
      console.log("✅ Usuário Criador criado:", {
        email: "criador@teste.com",
        password: "123456",
        role: "creator"
      });
    } else {
      console.log("ℹ️ Usuário Criador já existe");
    }

    // 3. Criar usuário Admin de teste
    const existingAdmin = await User.findOne({ email: "admin@teste.com" });
    if (!existingAdmin) {
      const adminUser = new User({
        email: "admin@teste.com",
        password: "123456", // Será hasheado automaticamente
        nome: "Admin Teste",
        role: "admin",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true
      });

      await adminUser.save();
      console.log("✅ Usuário Admin criado:", {
        email: "admin@teste.com",
        password: "123456",
        role: "admin"
      });
    } else {
      console.log("ℹ️ Usuário Admin já existe");
    }

    // 4. Verificar se existe o usuário principal admin
    const mainAdmin = await User.findOne({ email: "cinexnema@gmail.com" });
    if (!mainAdmin) {
      const mainAdminUser = new User({
        email: "cinexnema@gmail.com",
        password: "I30C77T$Ii", // Senha específica para admin principal
        nome: "CineXnema Admin",
        role: "admin",
        isPremium: true,
        subscriptionStatus: "active",
        assinante: true
      });

      await mainAdminUser.save();
      console.log("✅ Admin principal criado:", {
        email: "cinexnema@gmail.com",
        role: "admin"
      });
    } else {
      console.log("ℹ️ Admin principal já existe");
    }

    console.log("\n🎯 USUÁRIOS DE TESTE DISPONÍVEIS:");
    console.log("👤 ASSINANTE: assinante@teste.com / 123456");
    console.log("🎨 CRIADOR: criador@teste.com / 123456");
    console.log("👑 ADMIN: admin@teste.com / 123456");
    console.log("🔧 ADMIN PRINCIPAL: cinexnema@gmail.com / I30C77T$Ii");

    return {
      success: true,
      users: [
        { email: "assinante@teste.com", password: "123456", role: "subscriber" },
        { email: "criador@teste.com", password: "123456", role: "creator" },
        { email: "admin@teste.com", password: "123456", role: "admin" },
        { email: "cinexnema@gmail.com", password: "I30C77T$Ii", role: "admin" }
      ]
    };

  } catch (error) {
    console.error("❌ Erro ao criar usuários de teste:", error);
    return { success: false, error: error.message };
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  createTestUsers()
    .then((result) => {
      if (result.success) {
        console.log("✅ Script executado com sucesso!");
      } else {
        console.error("❌ Erro no script:", result.error);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro fatal:", error);
      process.exit(1);
    });
}
