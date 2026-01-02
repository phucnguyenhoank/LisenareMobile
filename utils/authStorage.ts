// src/utils/authStorage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';

/**
 * Persists a token string to secure hardware storage.
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

/**
 * Retrieves the token from secure storage. Returns null if not found.
 */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to fetch token:', error);
    return null;
  }
}

/**
 * Removes the token from secure storage.
 */
export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete token:', error);
  }
}
