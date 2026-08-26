"use client";
import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
      <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const done         = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    // Save token so the api interceptor sends it as Bearer on the next request.
    useAuthStore.getState().setUser(null, token);

    api.get("/auth/me")
      .then(({ data }) => {
        useAuthStore.getState().setUser(data, token);
        router.replace(data.isSeller ? "/seller" : "/dashboard");
      })
      .catch(() => {
        useAuthStore.getState().clearAuth();
        router.replace("/login?error=oauth_failed");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
