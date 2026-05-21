// api/client.ts
import { API_BASE_URL } from "@/config/env";
import { ERROR_MESSAGES } from "@/config/errorMessages";
import { getToken } from "@/utils/auth-storage";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export class RequestError extends Error {
  status: number;
  error_code: string;

  constructor(status: number, error_code: string, message: string) {
    super(message);
    this.status = status;
    this.error_code = error_code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const body = await (isJson ? res.json() : res.text());

  if (!res.ok) {
    // {"debug_message": "Bad Credential", "error_code": "INVALID_CREDENTIALS"}
    const error_code = body?.error_code || "UNKNOWN_ERROR";

    const message =
      ERROR_MESSAGES[error_code] ||
      body?.detail?.debug_message ||
      `HTTP Error ${res.status}`;

    throw new RequestError(res.status, error_code, message);
  }

  return body as T;
}

/**
 * A universal fetch wrapper for API calls with automate token injection.
 *
 * @param endpoint - The API path (appended to API_BASE_URL).
 * @param options - Configuration including method, body, custom headers.
 * @returns Parsed JSON or raw text response of type T.
 * @throws {RequestError} If the response status is not 2xx.
 *
 * @example
 * // 1. Simple GET (Auth is included by default)
 * const data = await request<User>("/me");
 *
 * @example
 * // 2. POST with JSON body
 * const newBrick = await request<Brick>("/bricks", {
 *   method: "POST",
 *   body: { text: "Hello", lang: "en" }
 * });
 *
 * @example
 * // 3. Multipart File Upload (FormData)
 * const formData = new FormData();
 * formData.append("audio", { uri: "...", name: "rec.m4a", type: "audio/m4a" } as any);
 * await request("/upload", {
 *   method: "POST",
 *   body: formData
 * });
 */
export async function request<T>(
  endpoint: string,
  { method = "GET", body = null, headers = {} }: RequestOptions = {},
): Promise<T> {
  // Initialize headers without a default Content-Type
  const finalHeaders: Record<string, string> = { ...headers };

  const token = await getToken();
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  let finalBody: any = body;

  if (body) {
    if (body instanceof FormData) {
      // DO NOT set any Content-Type here; fetch handles it
      finalBody = body;
    } else if (body instanceof URLSearchParams) {
      finalHeaders["Content-Type"] = "application/x-www-form-urlencoded";
      finalBody = body.toString();
    } else {
      // Only set application/json for standard objects
      finalHeaders["Content-Type"] = "application/json";
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
