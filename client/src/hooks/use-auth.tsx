import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, type AuthUser } from "../lib/api";
import useAuthStore from "../store/authStore";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = "epixbox-auth";

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(normalized + padding);
}

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(base64UrlDecode(token.split('.')[1] || ""));
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "User", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function makeUsername(name: string, email: string) {
  const base = (name || email.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);

  const suffix = Math.floor(Math.random() * 900 + 100).toString();
  return `${base || "user"}${suffix}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStore = useAuthStore.getState();

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      authStore.logout();
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      };

      if (!parsed.accessToken || isTokenExpired(parsed.accessToken)) {
        localStorage.removeItem(STORAGE_KEY);
        authStore.logout();
        setIsLoading(false);
        return;
      }

      setUser(parsed.user);
      setAccessToken(parsed.accessToken);
      setRefreshToken(parsed.refreshToken);
      authStore.login(parsed.user, parsed.accessToken, parsed.refreshToken);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      authStore.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken || !user) return;

    let cancelled = false;
    authApi
      .me(accessToken)
      .then((res) => {
        if (!cancelled) setUser(res.user);
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem(STORAGE_KEY);
          useAuthStore.getState().logout();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const persist = (nextUser: AuthUser, nextAccessToken: string, nextRefreshToken: string) => {
    setUser(nextUser);
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
    useAuthStore.getState().login(nextUser, nextAccessToken, nextRefreshToken);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: nextUser,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      })
    );
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    persist(res.user, res.accessToken, res.refreshToken);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await authApi.loginWithGoogle({ idToken });
    persist(res.user, res.accessToken, res.refreshToken);
  };

  const signup = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const { first, last } = splitName(name);
    const username = makeUsername(name, email);

    const res = await authApi.register({
      email,
      password,
      username,
      first_name: first,
      last_name: last,
    });

    persist(res.user, res.accessToken, res.refreshToken);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await authApi.resetPassword(token, password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem(STORAGE_KEY);
      useAuthStore.getState().logout();
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      loginWithGoogle,
      signup,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [user, accessToken, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
