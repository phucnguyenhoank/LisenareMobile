import * as authStorage from "@/utils/authStorage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  token: string | null;
  isTokenLoading: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoading, setIsLoading] = useState(true);

  // Load the token once when the app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await authStorage.getToken();
      setToken(storedToken);
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    await authStorage.saveToken(newToken);
  };

  const logout = async () => {
    setToken(null);
    await authStorage.removeToken();
  };

  return (
    <AuthContext.Provider value={{ token, isTokenLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be use with in an AuthProvider");
  }
  return context;
};
