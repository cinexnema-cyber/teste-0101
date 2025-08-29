import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthService } from "@/lib/auth";
import { User } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  user_id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  subscriptionStatus: "ativo" | "inativo";
  subscriptionStart?: Date;
  subscriptionPlan?: "monthly" | "yearly" | "lifetime";
  role: "user" | "admin" | "creator" | "subscriber";
  assinante: boolean;
  name: string;
  confirmationLink?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<any>;
  hasActiveSubscription: () => Promise<boolean>;
  updateUserRole: (
    role: "user" | "admin" | "creator" | "subscriber",
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with Supabase...");
      const { user: authUser, error } = await AuthService.login({
        email,
        password,
      });

      if (error || !authUser) {
        console.log("Supabase login failed, trying fallback...");
        // Fallback to MongoDB system
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.user) {
            const transformedUser: AuthUser = {
              id: userData.user.id,
              user_id: userData.user.id,
              email: userData.user.email,
              username:
                userData.user.username || userData.user.email.split("@")[0],
              displayName:
                userData.user.name || userData.user.email.split("@")[0],
              bio: userData.user.bio || "",
              subscriptionStatus: userData.user.assinante ? "ativo" : "inativo",
              subscriptionStart: userData.user.subscription?.startDate
                ? new Date(userData.user.subscription.startDate)
                : undefined,
              subscriptionPlan: userData.user.subscription?.plan || "monthly",
              name: userData.user.name || userData.user.email.split("@")[0],
              assinante: userData.user.assinante || false,
              role:
                userData.user.role ||
                (userData.user.assinante ? "subscriber" : "user"),
            };

            setUser(transformedUser);
            localStorage.setItem("xnema_user", JSON.stringify(transformedUser));
            localStorage.setItem("xnema_token", userData.token);
            return true;
          }
        }
        return false;
      }

      // Special admin user configuration
      const isSpecialAdmin =
        authUser.email === "eliteeaglesupplements@gmail.com";

      // Transform Supabase user to AuthUser
      const transformedUser: AuthUser = {
        id: authUser.id || authUser.user_id,
        user_id: authUser.user_id,
        email: authUser.email,
        username: authUser.username,
        displayName: authUser.displayName,
        bio: authUser.bio || "",
        subscriptionStatus: isSpecialAdmin
          ? "ativo"
          : authUser.subscriptionStatus,
        subscriptionStart: authUser.subscriptionStart,
        subscriptionPlan: isSpecialAdmin
          ? ("lifetime" as any)
          : authUser.subscriptionPlan,
        name: authUser.displayName,
        assinante: isSpecialAdmin
          ? true
          : authUser.subscriptionStatus === "ativo",
        role: isSpecialAdmin
          ? "admin"
          : authUser.subscriptionStatus === "ativo"
            ? "subscriber"
            : "user",
        confirmationLink: authUser.confirmationLink,
      };

      setUser(transformedUser);
      localStorage.setItem("xnema_user", JSON.stringify(transformedUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      console.log("Attempting registration with Supabase...", userData);

      // Extract plan and create registration data
      const { selectedPlan, ...registrationData } = userData;
      const { user: authUser, error } =
        await AuthService.register(registrationData);

      if (!error && authUser && selectedPlan) {
        // Create subscription after successful registration
        const subscriptionResult = await AuthService.createSubscription(
          authUser.id || authUser.user_id,
          selectedPlan,
        );

        if (subscriptionResult.error) {
          console.error(
            "Subscription creation failed:",
            subscriptionResult.error,
          );
          // Continue anyway - user is registered
        }
      }

      if (error || !authUser) {
        console.log("Supabase registration failed, trying fallback...");
        // Fallback to MongoDB system
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();
        if (result.success && result.user) {
          const transformedUser: AuthUser = {
            id: result.user.id,
            user_id: result.user.id,
            email: result.user.email,
            username: result.user.username || result.user.email.split("@")[0],
            displayName: result.user.name || result.user.email.split("@")[0],
            bio: result.user.bio || "",
            subscriptionStatus: result.user.assinante ? "ativo" : "inativo",
            subscriptionStart: result.user.subscription?.startDate
              ? new Date(result.user.subscription.startDate)
              : undefined,
            subscriptionPlan: result.user.subscription?.plan || "monthly",
            name: result.user.name || result.user.email.split("@")[0],
            assinante: result.user.assinante || false,
            role:
              result.user.role ||
              (result.user.assinante ? "subscriber" : "user"),
          };

          setUser(transformedUser);
          localStorage.setItem("xnema_user", JSON.stringify(transformedUser));
          if (result.token) {
            localStorage.setItem("xnema_token", result.token);
          }

          return {
            success: true,
            user: transformedUser,
          };
        }

        return {
          success: false,
          message: result.message || error || "Registration failed",
        };
      }

      // Special admin user configuration
      const isSpecialAdmin =
        authUser.email === "eliteeaglesupplements@gmail.com";

      // Transform and set user
      const transformedUser: AuthUser = {
        id: authUser.id || authUser.user_id,
        user_id: authUser.user_id,
        email: authUser.email,
        username: authUser.username,
        displayName: authUser.displayName,
        bio: authUser.bio || "",
        subscriptionStatus: isSpecialAdmin
          ? "ativo"
          : authUser.subscriptionStatus,
        subscriptionStart: authUser.subscriptionStart,
        subscriptionPlan: isSpecialAdmin
          ? ("lifetime" as any)
          : authUser.subscriptionPlan,
        name: authUser.displayName,
        assinante: isSpecialAdmin
          ? true
          : authUser.subscriptionStatus === "ativo",
        role: isSpecialAdmin
          ? "admin"
          : authUser.subscriptionStatus === "ativo"
            ? "subscriber"
            : "user",
        confirmationLink: authUser.confirmationLink,
      };

      setUser(transformedUser);
      localStorage.setItem("xnema_user", JSON.stringify(transformedUser));

      return {
        success: true,
        user: transformedUser,
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: "Registration failed",
      };
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    localStorage.removeItem("xnema_user");
    localStorage.removeItem("xnema_token"); // Also remove old token
  };

  const hasActiveSubscription = async (): Promise<boolean> => {
    if (!user) return false;
    return await AuthService.hasActiveSubscription(user.id);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for saved user in localStorage first
        const savedUser = localStorage.getItem("xnema_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Try to get current user from Supabase
        const { user: currentUser } = await AuthService.getCurrentUser();
        if (currentUser) {
          // Special admin user configuration
          const isSpecialAdmin =
            currentUser.email === "eliteeaglesupplements@gmail.com";

          const transformedUser: AuthUser = {
            id: currentUser.id || currentUser.user_id,
            user_id: currentUser.user_id,
            email: currentUser.email,
            username: currentUser.username,
            displayName: currentUser.displayName,
            bio: currentUser.bio || "",
            subscriptionStatus: isSpecialAdmin
              ? "ativo"
              : currentUser.subscriptionStatus,
            subscriptionStart: currentUser.subscriptionStart,
            subscriptionPlan: isSpecialAdmin
              ? ("lifetime" as any)
              : currentUser.subscriptionPlan,
            name: currentUser.displayName,
            assinante: isSpecialAdmin
              ? true
              : currentUser.subscriptionStatus === "ativo",
            role: isSpecialAdmin
              ? "admin"
              : currentUser.subscriptionStatus === "ativo"
                ? "subscriber"
                : "user",
          };
          setUser(transformedUser);
          localStorage.setItem("xnema_user", JSON.stringify(transformedUser));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const updateUserRole = async (
    role: "user" | "admin" | "creator" | "subscriber",
  ): Promise<void> => {
    if (!user) {
      throw new Error("Usuário não está logado");
    }

    try {
      // Atualiza o usuário local
      const updatedUser = {
        ...user,
        role: role,
      };

      setUser(updatedUser);
      localStorage.setItem("xnema_user", JSON.stringify(updatedUser));

      // Em produção, aqui você faria uma chamada para a API para persistir a mudança
      console.log(`Role do usuário atualizado para: ${role}`);
    } catch (error) {
      console.error("Erro ao atualizar role do usuário:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    hasActiveSubscription,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
