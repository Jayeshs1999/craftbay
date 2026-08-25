import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import api from "@/services/api";

interface AuthState {
  user:      User | null;
  isLoading: boolean;
  setUser:   (u: User | null) => void;
  logout:    () => Promise<void>;
  fetchMe:   () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:      null,
      isLoading: true,   // true until fetchMe resolves — prevents stale-user flash

      setUser: (u) => set({ user: u, isLoading: false }),

      logout: async () => {
        await api.post("/auth/logout").catch(() => {});
        set({ user: null });
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data });
        } catch {
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name:        "craftbay-auth",
      partialize:  (s) => ({ user: s.user }),
      version:     1,   // bump to wipe old persisted state in browsers
      migrate:     () => ({ user: null, isLoading: true }),
    }
  )
);