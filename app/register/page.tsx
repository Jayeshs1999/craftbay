"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

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
      setUser(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] to-[#fff1e6] px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/"><span className="text-3xl font-extrabold text-[#c05621]">CraftBay</span></Link>
          <p className="text-[#78716c] text-sm mt-1">Join thousands of creators</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#1c1917] mb-6">Create Account</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1c1917]">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma" required autoComplete="name"
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#a8a29e] focus:border-[#c05621] focus:ring-2 focus:ring-[#fef3e8] transition-colors" />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1c1917]">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#a8a29e] focus:border-[#c05621] focus:ring-2 focus:ring-[#fef3e8] transition-colors" />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1c1917]">
                Phone <span className="text-[#a8a29e] font-normal">(optional)</span>
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210" autoComplete="tel"
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#a8a29e] focus:border-[#c05621] focus:ring-2 focus:ring-[#fef3e8] transition-colors" />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1c1917]">Password *</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars" required autoComplete="new-password"
                  className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 pr-10 text-sm outline-none placeholder:text-[#a8a29e] focus:border-[#c05621] focus:ring-2 focus:ring-[#fef3e8] transition-colors" />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#78716c]">
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
              <label className="text-sm font-medium text-[#1c1917]">Confirm Password *</label>
              <div className="relative">
                <input type={showCnf ? "text" : "password"} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password" required autoComplete="new-password"
                  className={"w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm outline-none placeholder:text-[#a8a29e] transition-colors focus:ring-2 " +
                    (confirm.length > 0
                      ? rules.match ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                                    : "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-[#e7e5e4] focus:border-[#c05621] focus:ring-[#fef3e8]")} />
                <button type="button" onClick={() => setShowCnf((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#78716c]">
                  {showCnf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && !rules.match && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading || !strong || !rules.match}
              className="w-full flex items-center justify-center gap-2 bg-[#c05621] text-white font-semibold py-3 rounded-xl hover:bg-[#9a3e12] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-[#78716c] mt-5">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-[#c05621] hover:underline">Terms</Link>
          </p>
          <p className="text-center text-sm text-[#78716c] mt-3">
            Have an account?{" "}
            <Link href="/login" className="text-[#c05621] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}