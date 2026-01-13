// api/client.ts
import { API_BASE_URL } from "@/config/env";
import { getToken } from "@/utils/authStorage";

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean; // Automate token injection
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return text as T;
  }
}

export async function apiCall<T>(
  endpoint: string, 
  { method = 'GET', body = null, headers = {}, requiresAuth = true }: ApiCallOptions = {}
): Promise<T> {

  // Initialize headers without a default Content-Type
  const finalHeaders: Record<string, string> = { ...headers };

  if (requiresAuth) {
    const token = await getToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let finalBody: any = body;

  if (body) {
    if (body instanceof FormData) {
      // DO NOT set any Content-Type here; fetch handles it
      finalBody = body;
    } else if (body instanceof URLSearchParams) {
      finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      finalBody = body.toString();
    } else {
      // Only set application/json for standard objects
      finalHeaders['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(body);
    }
  }

  const options: RequestInit = {
    method,
    headers: finalHeaders,
    body: finalBody,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return handleResponse<T>(res);
}
