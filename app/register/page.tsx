"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

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

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span className={"flex items-center gap-1 text-xs " + (ok ? "text-green-600" : "text-[#a8a29e]")}>
      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}{text}
    </span>
  );
}

export default function RegisterPage() {
  const router     = useRouter();
  const setUser    = useAuthStore((s) => s.setUser);
  const user       = useAuthStore((s) => s.user);
  const isLoading  = useAuthStore((s) => s.isLoading);

  // Redirect away if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.isSeller ? "/seller" : "/dashboard");
    }
  }, [user, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [showCnf,   setShowCnf]   = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const rules = {
    len:   password.length >= 8,
    upper: /[A-Z]/.test(password),
    num:   /[0-9]/.test(password),
    match: password.length > 0 && password === confirm,
  };
  const strong = rules.len && rules.upper && rules.num;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rules.match) { setError("Passwords do not match"); return; }
    if (!strong)      { setError("Password does not meet requirements"); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name, email, password,
        phone: phone || undefined,
      });
      setUser(data, data.token ?? null);
      router.push("/dashboard");
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Registration failed");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf8] via-[#ecfdf5]/40 to-[#fffbeb]/50 px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/"><span className="text-3xl font-black text-[#059669]">Craft<span className="text-[#d97706]">Bay</span></span></Link>
          <p className="text-[#64748b] text-sm mt-1">Join thousands of creators</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#0f172a] mb-6">Create Account</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* Google Sign-Up */}
          <a
            href={GOOGLE_AUTH_URL}
            className="w-full flex items-center justify-center gap-2.5 border border-[#e2e8f0] rounded-xl py-2.5 text-sm font-medium text-[#0f172a] hover:bg-[#f8faf8] transition-colors mb-5"
          >
            <GoogleIcon />
            Sign up with Google
          </a>

          <div className="flex items-center gap-3 mb-5">
            <hr className="flex-1 border-[#e2e8f0]" />
            <span className="text-xs text-[#94a3b8]">or</span>
            <hr className="flex-1 border-[#e2e8f0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0f172a]">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma" required autoComplete="name"
                className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5] transition-colors" />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0f172a]">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5] transition-colors" />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0f172a]">
                Phone <span className="text-[#94a3b8] font-normal">(optional)</span>
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210" autoComplete="tel"
                className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5] transition-colors" />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0f172a]">Password *</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars" required autoComplete="new-password"
                  className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 pr-10 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5] transition-colors" />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-x-3 flex-wrap mt-1">
                  <Rule ok={rules.len}   text="8+ chars" />
                  <Rule ok={rules.upper} text="Uppercase" />
                  <Rule ok={rules.num}   text="Number" />
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0f172a]">Confirm Password *</label>
              <div className="relative">
                <input type={showCnf ? "text" : "password"} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password" required autoComplete="new-password"
                  className={"w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm outline-none placeholder:text-[#94a3b8] transition-colors focus:ring-2 " +
                    (confirm.length > 0
                      ? rules.match ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-100"
                                    : "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-[#e2e8f0] focus:border-[#059669] focus:ring-[#ecfdf5]")} />
                <button type="button" onClick={() => setShowCnf((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                  {showCnf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && !rules.match && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading || !strong || !rules.match}
              className="w-full flex items-center justify-center gap-2 bg-[#059669] text-white font-semibold py-3 rounded-xl hover:bg-[#047857] active:scale-[0.98] shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-[#64748b] mt-5">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-[#059669] hover:underline">Terms</Link>
          </p>
          <p className="text-center text-sm text-[#64748b] mt-3">
            Have an account?{" "}
            <Link href="/login" className="text-[#059669] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
