"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ||
  "http://localhost:5000/api/auth/google";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") || "";
  const setUser      = useAuthStore((s) => s.setUser);
  const user         = useAuthStore((s) => s.user);
  const isLoading    = useAuthStore((s) => s.isLoading);

  // Redirect away if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirect || (user.isSeller ? "/seller" : "/dashboard"));
    }
  }, [user, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState(
    searchParams.get("error") === "oauth_failed"
      ? "Google sign-in failed. Please try again."
      : ""
  );
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      router.push(redirect || (data.isSeller ? "/seller" : "/dashboard"));
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  }

  // Show spinner while verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
        <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf8] via-[#ecfdf5]/40 to-[#fffbeb]/50 px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/"><span className="text-3xl font-black text-[#059669]">Craft<span className="text-[#d97706]">Bay</span></span></Link>
          <p className="text-[#64748b] text-sm mt-1">Welcome back!</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#0f172a] mb-6">Sign In</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <a
            href={GOOGLE_AUTH_URL}
            className="w-full flex items-center justify-center gap-2.5 border border-[#e2e8f0] rounded-xl py-2.5 text-sm font-medium text-[#0f172a] hover:bg-[#f8faf8] transition-colors mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mb-5">
            <hr className="flex-1 border-[#e2e8f0]" />
            <span className="text-xs text-[#94a3b8]">or</span>
            <hr className="flex-1 border-[#e2e8f0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0f172a]">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0f172a]">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password" required autoComplete="current-password"
                  className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5]"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#059669] text-white font-semibold py-3 rounded-xl hover:bg-[#047857] active:scale-[0.98] shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748b] mt-5">
            No account yet?{" "}
            <Link href="/register" className="text-[#059669] font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
        <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
