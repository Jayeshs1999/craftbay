import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user:      User | null;
  token:     string | null;
  isLoading: boolean;
  setUser:   (user: User | null, token?: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      isLoading: true,

      setUser: (user, token) =>
        set({
          user,
          token:     token !== undefined ? token : get().token,
          isLoading: false,
        }),

      clearAuth: () => set({ user: null, token: null, isLoading: false }),
    }),
    {
      name:       "craftbay-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
