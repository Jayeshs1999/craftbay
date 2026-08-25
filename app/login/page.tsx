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
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5]">
        <div className="w-8 h-8 border-4 border-[#c05621] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] to-[#fff1e6] px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/"><span className="text-3xl font-extrabold text-[#c05621]">CraftBay</span></Link>
          <p className="text-[#78716c] text-sm mt-1">Welcome back!</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#1c1917] mb-6">Sign In</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1c1917]">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-[#a8a29e] focus:border-[#c05621] focus:ring-2 focus:ring-[#fef3e8]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1c1917]">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password" required autoComplete="current-password"
                  className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors placeholder:text-[#a8a29e] focus:border-[#c05621] focus:ring-2 focus:ring-[#fef3e8]"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#78716c]">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#c05621] text-white font-semibold py-3 rounded-xl hover:bg-[#9a3e12] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#78716c] mt-5">
            No account yet?{" "}
            <Link href="/register" className="text-[#c05621] font-semibold hover:underline">Create one free</Link>
          </p>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          <p className="font-semibold mb-1">Demo credentials</p>
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
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5]">
        <div className="w-8 h-8 border-4 border-[#c05621] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}