import { useAuth } from "@/context/AuthContext";
import { request } from "@/services/client";
import { Token } from "@/types/token";
import { useState } from "react";

export function useSignIn() {
  const { persistAuth } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signin = async (username: string, password: string) => {
    if (!username || !password) {
      throw new Error("missing_fields");
    }

    try {
      setIsSigningIn(true);

      const formBody = new URLSearchParams({
        grant_type: "password",
        username,
        password,
      });

      const tokenResponse = await request<Token>("/auth/login", {
        method: "POST",
        body: formBody,
      });

      await persistAuth(tokenResponse.access_token);
    } finally {
      setIsSigningIn(false);
    }
  };

  return {
    signin,
    isSigningIn,
  };
}
