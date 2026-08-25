"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      router.push(redirect || (data.isSeller ? "/seller" : "/dashboard"));
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
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

        <div className="mt-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-900">
          <p className="font-semibold mb-1 text-[#047857]">Demo credentials</p>
          <p>Buyer: buyer@demo.com / demo1234</p>
          <p>Seller: seller@demo.com / demo1234</p>
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