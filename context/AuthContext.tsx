import { request } from "@/api/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { TokenPayload } from "@/types/token";
import { authActions } from "@/utils/auth-events";
import * as authStorage from "@/utils/auth-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Device from "expo-device";
import { API_BASE_URL } from "@/config/env";

interface AuthContextType {
  token: string | null;
  tokenPayload: TokenPayload | null;
  isTokenLoading: boolean;
  signin: (newToken: string) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | null>(null);
  const [isTokenLoading, setIsLoading] = useState(true);
  const { pushToken } = usePushNotifications();
  console.log("pushToken:", pushToken);

  const setAuthData = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      const decoded = authStorage.decodeToken(newToken);
      setTokenPayload(decoded);
    } else {
      setTokenPayload(null);
    }
  };

  const signin = async (newToken: string) => {
    const decoded = authStorage.decodeToken(newToken);
    setToken(newToken);
    setTokenPayload(decoded);
    await authStorage.saveToken(newToken);
  };

  const signout = async () => {
    setToken(null);
    setTokenPayload(null);
    await authStorage.removeToken();
  };

  // Load the token once when the app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await authStorage.getToken();
      if (storedToken) {
        const decoded = authStorage.decodeToken(storedToken);

        // Check expiry immediately
        if (decoded && Date.now() >= decoded.exp * 1000) {
          await authStorage.removeToken();
        } else {
          setAuthData(storedToken);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // The expiration monitor
  useEffect(() => {
    if (!tokenPayload) return;

    const interval = setInterval(() => {
      // 10 seconds in advance
      if (Date.now() + 10000 >= tokenPayload.exp * 1000) {
        console.warn("Session expired");
        signout();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tokenPayload]);

  useEffect(() => {
    authActions.signout = signout;
  }, [signout]);

  useEffect(() => {
    if (!pushToken || !token) return;
    console.log("Sending push token:", pushToken);

    // have to use fetch instead of request here
    // because the token is not available on the storage at this time
    fetch(`${API_BASE_URL}/push-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: pushToken,
        device_name: Device.deviceName,
      }),
    });
  }, [pushToken, token]);

  return (
    <AuthContext.Provider
      value={{ token, tokenPayload, isTokenLoading, signin, signout }}
    >
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
