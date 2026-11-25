import { env } from "@/lib/env";
import { authService } from "./auth.service";

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
  }

  private async getHeaders(requiresAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (requiresAuth) {
      const token = authService.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const headers = await this.getHeaders(requiresAuth);
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && requiresAuth) {
        const newToken = await authService.refreshToken();
        
        if (newToken) {
          // Retry request with new token
          const retryHeaders = await this.getHeaders(true);
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: {
              ...retryHeaders,
              ...fetchOptions.headers,
            },
          });

          if (!retryResponse.ok) {
            throw new Error(`API Error: ${retryResponse.statusText}`);
          }

          return await retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          authService.clearAuth();
          window.location.href = "/login";
          throw new Error("Session expired");
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: response.statusText,
        }));
        const fieldErrors =
          error.errors && typeof error.errors === "object"
            ? Object.values(error.errors)
                .flat()
                .map((v) => (Array.isArray(v) ? v[0] : v))
                .filter((v) => typeof v === "string")
            : [];
        const message =
          (typeof error.message === "string" &&
          error.message &&
          error.message !== "An error occurred"
            ? error.message
            : null) ||
          fieldErrors[0] ||
          error.message ||
          error.task_data ||
          (typeof error === "object"
            ? Object.values(error)
                .flat()
                .filter((v) => typeof v === "string")
                .join(" ")
            : null) ||
          `API Error: ${response.statusText}`;
        throw new Error(Array.isArray(message) ? message.join(" ") : String(message));
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
