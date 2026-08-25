import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import api from "@/services/api";

interface AuthState {
  user:      User | null;
  token:     string | null;   // JWT stored for Bearer auth (cross-origin safe)
  isLoading: boolean;
  setUser:   (u: User | null, token?: string | null) => void;
  logout:    () => Promise<void>;
  fetchMe:   () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      isLoading: true,

      setUser: (u, token) => set({
        user:      u,
        token:     token !== undefined ? token : get().token,
        isLoading: false,
      }),

      logout: async () => {
        await api.post("/auth/logout").catch(() => {});
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isLoading: false });
        } catch {
          set({ user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name:       "craftbay-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
      version:    2,
      migrate:    () => ({ user: null, token: null, isLoading: true }),
    }
  )
);
