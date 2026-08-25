"use client";
import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const setUser      = useAuthStore((s) => s.setUser);
  const fetchMe      = useAuthStore((s) => s.fetchMe);
  const called       = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    // Store the token immediately — api.ts will attach it as Bearer on the
    // next request, so fetchMe() will succeed without needing a cookie.
    setUser(null, token);

    fetchMe().then(() => {
      const user = useAuthStore.getState().user;
      if (user) {
        router.replace(user.isSeller ? "/seller" : "/dashboard");
      } else {
        router.replace("/login?error=oauth_failed");
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
      <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
        <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
