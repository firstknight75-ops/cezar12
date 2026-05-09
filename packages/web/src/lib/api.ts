import axios, { type AxiosInstance } from 'axios';

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url: string = err?.config?.url ?? '';
    if (status === 401 && !url.includes('/api/auth/login')) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export type RegisterBody = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  phone: string;
};

export type LoginBody = { email: string; password: string; remember: boolean };

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  countryCode: string;
  currency: string;
  preferredLang: string;
  isVerified: boolean;
  hasCompanyProfile: boolean;
};

export type Project = {
  id: string;
  name: string;
  domain: 'ECOMMERCE' | 'SERVICES' | 'RESTAURANT' | 'REAL_ESTATE';
  status: string;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score?: number;
  updatedAt?: string;
};

export type TokenBalance = {
  planUsed: number;
  planTotal: number;
  addonBalance: number;
  totalRemaining: number;
};

export type AddonPackage = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

type SetupData = Record<string, unknown>;

export type ProfileResponse = {
  fullName: string;
  email: string;
  country: string;
  phone: string;
};

type AuthSession = {
  user: AuthUser;
  subscription: {
    id: string;
    plan: 'silver' | 'gold' | 'platinum';
    billingCycle: string;
    status: string;
    tokensPerCycle: number;
    tokensRemaining: number;
    currentPeriodEnd: string;
  };
  tokenBalance: {
    subscription_tokens: number;
    addon_tokens: number;
    total_available: number;
    plan: 'silver' | 'gold' | 'platinum';
    period_end: string;
  };
  accessToken: string;
  refreshToken: string;
};

function unwrap<T>(payload: T | { data: T }): T {
  return (payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload) as T;
}

export const authApi = {
  me: async (): Promise<ProfileResponse> => {
    const { data } = await api.get('/api/auth/me');
    return unwrap<ProfileResponse>(data);
  },
  register: async (body: RegisterBody): Promise<{ userId: string; message: string }> => {
    const { data } = await api.post('/api/auth/register', body);
    return unwrap<{ userId: string; message: string }>(data);
  },
  login: async (body: LoginBody): Promise<AuthSession> => {
    const { data } = await api.post('/api/auth/login', body);
    return unwrap<AuthSession>(data);
  },
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/api/auth/forgot-password', { email });
  },
  resetPassword: async (body: { token: string; newPassword: string }): Promise<void> => {
    await api.post('/api/auth/reset-password', body);
  },
};

export const companyApi = {
  create: async (payload: SetupData): Promise<{ companyId: string }> => {
    const { data } = await api.post('/api/companies', payload);
    return unwrap<{ companyId: string }>(data);
  },
  get: async (): Promise<Record<string, unknown>> => {
    const { data } = await api.get('/api/companies/me');
    return data;
  },
};

export const projectApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await api.get('/api/projects');
    return unwrap<Project[]>(data);
  },
  create: async (body: {
    name: string;
    domain: Project['domain'];
    domainData: Record<string, unknown>;
  }): Promise<{ projectId: string; financialResult: unknown }> => {
    const { data } = await api.post('/api/projects', body);
    return unwrap<{ projectId: string; financialResult: unknown }>(data);
  },
};

export const tokenApi = {
  getBalance: async (): Promise<TokenBalance> => {
    const { data } = await api.get('/api/tokens/balance');
    return unwrap<TokenBalance>(data);
  },
  purchaseAddon: async (packageType: AddonPackage): Promise<{ balance: TokenBalance }> => {
    const { data } = await api.post('/api/tokens/purchase', { packageType });
    return data;
  },
};

// Back-compat helpers used by existing hooks
export async function apiGet<T>(url: string): Promise<T> {
  const { data } = await api.get(url);
  return (data?.data ?? data) as T;
}
export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post(url, body);
  return (data?.data ?? data) as T;
}
export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch(url, body);
  return (data?.data ?? data) as T;
}
export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await api.delete(url);
  return (data?.data ?? data) as T;
}
