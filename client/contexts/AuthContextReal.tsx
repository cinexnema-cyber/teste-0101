import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isPremium: boolean;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  assinante: boolean;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar autenticação ao carregar
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const storedUser = localStorage.getItem("xnema_user");

      if (token && storedUser) {
        // Verificar se o token ainda é válido
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem("xnema_user", JSON.stringify(data.user));
          } else {
            // Token inválido, limpar dados
            logout();
          }
        } else {
          // Token inválido, limpar dados
          logout();
        }
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      // Em caso de erro, usar dados do localStorage se existirem
      const storedUser = localStorage.getItem("xnema_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          logout();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login-subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        localStorage.setItem("xnema_token", data.token);
        localStorage.setItem("xnema_user", JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("xnema_token");
    localStorage.removeItem("xnema_user");
    setUser(null);
  };

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthProvider;
