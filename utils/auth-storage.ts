import * as SecureStore from "expo-secure-store";
import { decode } from "base-64";
import { TokenPayload } from "@/types/token";

const TOKEN_KEY = "access_token";

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the middle part (payload)
    const payload = parts[1];
    const decoded: TokenPayload = JSON.parse(decode(payload));
    
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to save token:", error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to fetch token:", error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to delete token:", error);
  }
}
