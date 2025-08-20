import User from "../models/User";

export const createTestUser = async () => {
  try {
    // Verificar se já existe um usuário de teste com esse email como subscriber
    const existingTestUser = await User.findOne({
      email: "cinexnema@gmail.com",
      role: "subscriber"
    });

    if (existingTestUser) {
      console.log("✅ Usuário de teste já existe (subscriber cinexnema@gmail.com)");
      return existingTestUser;
    }

    // Criar usuário de teste com acesso completo
    const testUser = new User({
      email: "cinexnema@gmail.com",
      password: "I30C77T$Ii", // Será criptografada automaticamente
      name: "CineXnema Test User",
      role: "subscriber",
      assinante: true, // Acesso completo sem pagamento
      subscription: {
        plan: "premium",
        status: "active", // Ativo sem pagamento
        startDate: new Date(),
        nextBilling: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano no futuro
        paymentMethod: "test_account", // Conta de teste
      },
      watchHistory: [], // Histórico vazio para começar
    });

    const savedUser = await testUser.save();
    
    console.log("✅ Usuário de teste criado com sucesso:");
    console.log("📧 Email: cinexnema@gmail.com");
    console.log("🔑 Senha: I30C77T$Ii");
    console.log("👤 Tipo: Assinante Premium");
    console.log("💎 Status: Ativo (sem cobrança)");
    console.log("🎯 Pode acessar todo conteúdo restrito");
    
    return savedUser;
  } catch (error) {
    console.error("❌ Erro ao criar usuário de teste:", error);
    
    // Se o erro for de email duplicado, pode ser que já existe como admin
    if (error.code === 11000) {
      console.log("ℹ️ Email já existe - verificando se é admin...");
      const adminUser = await User.findOne({
        email: "cinexnema@gmail.com",
        role: "admin"
      });
      
      if (adminUser) {
        console.log("ℹ️ Usuário admin já existe com esse email");
        console.log("💡 Para teste como assinante, use um email diferente ou modifique o admin");
      }
    }
    
    throw error;
  }
};
