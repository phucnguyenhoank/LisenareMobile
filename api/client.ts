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
  { 
    method = 'GET', 
    body = null, 
    headers = {}, 
    requiresAuth = true 
  }: ApiCallOptions = {}
): Promise<T> {

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const options: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (body) {
    if (body instanceof URLSearchParams) {
      options.body = body.toString();
      finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    // Fetch automatically sets Content-Type for FormData (has not check yet)
    else if (body instanceof FormData) {
      options.body = body;
      delete finalHeaders['Content-Type'];
    }
    else {
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return handleResponse<T>(res);
}
