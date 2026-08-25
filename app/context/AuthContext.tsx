"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

interface AuthContextValue {
  user:      User | null;
  isLoading: boolean;
  setUser:   (u: User | null) => void;
  logout:    () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user      = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser   = useAuthStore((s) => s.setUser);
  const logout    = useAuthStore((s) => s.logout);
  const fetchMe   = useAuthStore((s) => s.fetchMe);
  const called    = useRef(false);
  const pathname  = usePathname();

  useEffect(() => {
    // Skip the session check on the OAuth callback page — that page manages
    // its own auth handshake. Running fetchMe() concurrently would race against
    // verify-token and overwrite the user with null (401) before the cookie lands.
    if (pathname === "/auth/callback") return;
    if (called.current) return;
    called.current = true;
    fetchMe();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}