import mongoose from "mongoose";
import User from "../models/User";
import { createTestUser } from "./createTestUser";

export const initializeAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      role: "admin",
      email: "cinexnema@gmail.com",
    });

    if (!existingAdmin) {
      const adminUser = new User({
        email: "cinexnema@gmail.com",
        password: "I30C77T$Ii", // Will be hashed automatically
        name: "XNEMA Admin",
        role: "admin",
        permissions: [
          "manage_users",
          "manage_content",
          "approve_creators",
          "view_analytics",
          "manage_payments",
        ],
        // Add subscriber features for testing
        assinante: true,
        subscription: {
          plan: "premium",
          status: "active",
          startDate: new Date(),
          nextBilling: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          paymentMethod: "admin_account",
        },
        watchHistory: [],
      });

      await adminUser.save();
      console.log("✅ Admin user created with subscriber features for testing");
    } else {
      // Update existing admin to have subscriber features
      const updatedAdmin = await User.findOneAndUpdate(
        { email: "cinexnema@gmail.com", role: "admin" },
        {
          $set: {
            assinante: true,
            subscription: {
              plan: "premium",
              status: "active",
              startDate: new Date(),
              nextBilling: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              paymentMethod: "admin_account",
            },
            watchHistory: [],
          }
        },
        { new: true }
      );

      if (updatedAdmin) {
        console.log("✅ Admin user updated with subscriber features for testing");
        console.log("📧 Login: cinexnema@gmail.com");
        console.log("🔑 Senha: I30C77T$Ii");
        console.log("👑 Acesso: Admin + Assinante Premium");
      } else {
        console.log("Admin user already exists");
      }
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
};

// Initialize some sample data for development
export const initializeSampleData = async () => {
  try {
    // Create test user if needed
    try {
      await createTestUser();
    } catch (error) {
      // Log but don't fail the whole initialization
      console.log("ℹ️ Usuário de teste não foi criado (pode já existir como admin)");
    }

    // Sample subscriber
    const existingSubscriber = await User.findOne({
      email: "subscriber@xnema.com",
    });
    if (!existingSubscriber) {
      const subscriber = new User({
        email: "subscriber@xnema.com",
        password: "password123",
        name: "João Silva",
        role: "subscriber",
        assinante: true, // Set assinante to true for testing
        subscription: {
          plan: "intermediate",
          status: "active",
          startDate: new Date(),
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentMethod: "mercado_pago",
        },
        watchHistory: [],
      });
      await subscriber.save();
      console.log("Sample subscriber created");
    }

    // Sample creator
    const existingCreator = await User.findOne({ email: "creator@xnema.com" });
    if (!existingCreator) {
      const creator = new User({
        email: "creator@xnema.com",
        password: "password123",
        name: "Maria Santos",
        role: "creator",
        profile: {
          bio: "Criadora de conteúdo audiovisual",
          portfolio: "https://youtube.com/creator",
          status: "approved",
          approvedAt: new Date(),
        },
        content: {
          totalVideos: 5,
          totalViews: 1250,
          totalEarnings: 150.75,
          monthlyEarnings: 50.25,
        },
      });
      await creator.save();
      console.log("Sample creator created");
    }
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
};
