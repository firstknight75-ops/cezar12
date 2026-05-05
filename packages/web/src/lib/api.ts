import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorResponse, ApiSuccessResponse } from '@cezar12/shared';

// ═══════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR — Add Auth Token
// ═══════════════════════════════════════════════════════════

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add Request ID
      config.headers['X-Request-ID'] = crypto.randomUUID();
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR — Handle Auth Errors
// ═══════════════════════════════════════════════════════════

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── Handle 401 — Try Refresh ──────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post<
          ApiSuccessResponse<{ access_token: string; refresh_token: string }>
        >(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/auth/refresh`, { refresh_token: refreshToken });

        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        // Clear auth and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Handle 422 INSUFFICIENT_TOKENS ────────────────
    const errorCode = error.response?.data?.error?.code;
    if (error.response?.status === 422 && errorCode === 'INSUFFICIENT_TOKENS') {
      window.location.href = '/plans';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// TYPED API HELPERS
// ═══════════════════════════════════════════════════════════

export async function apiGet<T>(url: string): Promise<T> {
  const response = await api.get<ApiSuccessResponse<T>>(url);
  return response.data.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.post<ApiSuccessResponse<T>>(url, data);
  return response.data.data;
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.patch<ApiSuccessResponse<T>>(url, data);
  return response.data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await api.delete<ApiSuccessResponse<T>>(url);
  return response.data.data;
}
