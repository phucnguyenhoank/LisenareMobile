import { usePushNotificationToken } from "@/hooks/usePushNotificationToken";
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
  persistAuth: (token: string) => Promise<void>;
  clearPersistedAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenPayload, setTokenPayload] = useState<TokenPayload | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  const { pushToken } = usePushNotificationToken();
  console.log("pushToken:", pushToken);

  const setAuthState = (token: string, payload: TokenPayload) => {
    setToken(token);
    setTokenPayload(payload);
  };

  /**
   * Use the token to update auth state and save it to secure storage.
   */
  const persistAuth = async (token: string) => {
    const decodedPayload = authStorage.decodeToken(token);
    setToken(token);
    setTokenPayload(decodedPayload);
    await authStorage.saveToken(token);
  };

  /**
   * Clear auth state and remove the token from secure storage.
   */
  const clearPersistedAuth = async () => {
    setToken(null);
    setTokenPayload(null);
    await authStorage.removeToken();
  };

  // Once when the app start
  // Load the stored token to check the expiration
  // Remove the token if it's expired, otherwise set the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = await authStorage.getToken();

      if (storedToken) {
        const decodedPayload = authStorage.decodeToken(storedToken);

        if (decodedPayload) {
          if (Date.now() >= decodedPayload.exp * 1000) {
            await authStorage.removeToken();
          } else {
            setAuthState(storedToken, decodedPayload);
          }
        }
      }

      setIsTokenLoading(false);
    };

    initializeAuth();
  }, []);

  // The expiration monitor
  useEffect(() => {
    if (!tokenPayload) return;

    const interval = setInterval(() => {
      // 10 seconds in advance
      // Comparing in ms
      if (Date.now() + 10000 >= tokenPayload.exp * 1000) {
        console.log("Session expired");
        clearPersistedAuth();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tokenPayload]);

  // This will be used by others
  useEffect(() => {
    authActions.clearPersistedAuth = clearPersistedAuth;
  }, [clearPersistedAuth]);

  useEffect(() => {
    if (!pushToken || !token) return;
    console.log("Sending push token:", pushToken);

    // have to use fetch to upload the push token instead of request here
    // because the token is not available on the storage at this time
    // to make a request with token
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
      value={{
        token,
        tokenPayload,
        isTokenLoading,
        persistAuth,
        clearPersistedAuth,
      }}
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
