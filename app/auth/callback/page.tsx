"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const setUser      = useAuthStore((s) => s.setUser);
  const called       = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    // Exchange the URL token for an httpOnly cookie.
    // This POST is same-origin (frontend → backend), so the browser
    // stores the Set-Cookie response correctly — unlike a cross-domain redirect.
    api
      .post("/auth/verify-token", { token })
      .then(({ data }) => {
        setUser(data);
        router.replace(data.isSeller ? "/seller" : "/dashboard");
      })
      .catch(() => {
        router.replace("/login?error=oauth_failed");
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
