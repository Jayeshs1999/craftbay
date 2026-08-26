import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useRequireAuth(redirectTo = "/login") {
  const user      = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router    = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.push(redirectTo);
  }, [user, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, isLoading };
}
