import { RequestHandler } from "express";
import User from "../models/User";

export const checkUserExists: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email é obrigatório",
      });
    }

    // Check if user exists in MongoDB
    const userExists = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    console.log(`🔍 Verificação de usuário para ${email}:`, !!userExists);

    return res.json({
      success: true,
      exists: !!userExists,
      message: userExists 
        ? "Usuário encontrado" 
        : "Usuário não cadastrado"
    });

  } catch (error) {
    console.error("❌ Erro ao verificar usuário:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
