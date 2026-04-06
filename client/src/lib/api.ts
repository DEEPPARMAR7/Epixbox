const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data as T;
}

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  plan?: string;
  brand_color?: string;
  brand_name?: string;
  avatar_url?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  loginWithGoogle: (payload: { idToken: string }) =>
    request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
  }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: (accessToken: string) =>
    request<{ user: AuthUser }>("/auth/me", {
      method: "GET",
      token: accessToken,
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};
