"use client";
import { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { User } from "@/types";

interface AuthContextValue {
  user:      User | null;
  isLoading: boolean;
  logout:    () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Runs once on app boot. Validates any saved token against /auth/me.
// Skipped on /auth/callback — that page handles its own auth flow.
let bootCalled = false;

async function bootAuth() {
  if (bootCalled) return;
  bootCalled = true;

  const { token, user, setUser, clearAuth } = useAuthStore.getState();

  // Callback page already set a full user — nothing to do.
  if (user) {
    if (useAuthStore.getState().isLoading) useAuthStore.setState({ isLoading: false });
    return;
  }

  if (!token) {
    clearAuth();
    return;
  }

  try {
    const { data } = await api.get("/auth/me");
    setUser(data, token);
  } catch {
    clearAuth();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user      = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router    = useRouter();

  useEffect(() => {
    if (window.location.pathname === "/auth/callback") return;

    if (useAuthStore.persist.hasHydrated()) {
      bootAuth();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        unsub();
        bootAuth();
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    bootCalled = false;
    await api.post("/auth/logout").catch(() => {});
    useAuthStore.getState().clearAuth();
    router.push("/products");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
