"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

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

// ─── OTP input — 6 separate boxes ─────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handleChange(i: number, ch: string) {
    const digit = ch.replace(/\D/, "").slice(-1);
    const arr   = value.padEnd(6, " ").split("");
    arr[i]      = digit || " ";
    const next  = arr.join("").trimEnd();
    onChange(next);
    if (digit && i < 5) {
      inputs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] && value[i] !== " " ? value[i] : ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-11 h-12 text-center text-lg font-bold border border-[#e2e8f0] rounded-xl outline-none transition-colors focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5] bg-white text-[#0f172a]"
        />
      ))}
    </div>
  );
}

// ─── Step 1: Registration form ─────────────────────────────────────────────────
function RegistrationForm({
  onOtpSent,
}: {
  onOtpSent: (email: string) => void;
}) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCnf,  setShowCnf]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const rules = {
    len:   password.length >= 8,
    upper: /[A-Z]/.test(password),
    num:   /[0-9]/.test(password),
    match: password.length > 0 && password === confirm,
  };
  const strong = rules.len && rules.upper && rules.num;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rules.match) { toast.error("Passwords do not match"); return; }
    if (!strong)      { toast.error("Password does not meet requirements"); return; }
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { name, email, password, phone: phone || undefined });
      onOtpSent(email.toLowerCase());
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to send OTP. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
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
          {loading ? "Sending OTP..." : "Continue →"}
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
    </>
  );
}

// ─── Step 2: OTP verification ──────────────────────────────────────────────────
function OtpVerifyForm({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: (data: any) => void;
}) {
  const [otp,      setOtp]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const otpFilled = otp.replace(/\s/g, "").length === 6;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otpFilled) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp: otp.trim() });
      onVerified(data);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Verification failed. Try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    // We can't resend without the original form data here, so take the user back
    onBack();
  }

  return (
    <>
      {/* Email banner */}
      <div className="flex items-center gap-2.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-5">
        <Mail size={16} className="text-[#059669] shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-[#065f46] font-medium">OTP sent to</p>
          <p className="text-sm font-semibold text-[#059669] truncate">{email}</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#0f172a] text-center">
            Enter the 6-digit code
          </label>
          <OtpInput value={otp} onChange={setOtp} />
          <p className="text-xs text-[#94a3b8] text-center">
            Code expires in 10 minutes
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !otpFilled}
          className="w-full flex items-center justify-center gap-2 bg-[#059669] text-white font-semibold py-3 rounded-xl hover:bg-[#047857] active:scale-[0.98] shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Verifying..." : "Verify & Create Account"}
        </button>
      </form>

      {/* Resend / back */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onBack}
          className="text-xs text-[#64748b] hover:text-[#0f172a] flex items-center gap-1 transition-colors">
          <ArrowLeft size={12} /> Change email
        </button>
        <button
          onClick={handleResend}
          disabled={resendCountdown > 0 || resending}
          className="text-xs text-[#059669] font-medium hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 transition-colors">
          {resending
            ? <><RefreshCw size={12} className="animate-spin" /> Sending…</>
            : resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : <><RefreshCw size={12} /> Resend OTP</>}
        </button>
      </div>
    </>
  );
}

// ─── Page shell ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router  = useRouter();
  const { user, isLoading } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  // Already logged in — bounce away
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.isSeller ? "/seller" : "/dashboard");
    }
  }, [user, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // "step" drives which screen is shown
  const [step,  setStep]  = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");

  function handleOtpSent(sentEmail: string) {
    setEmail(sentEmail);
    setStep("otp");
  }

  function handleVerified(data: any) {
    setUser(data, data.token ?? null);
    router.push("/dashboard");
  }

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
          <Link href="/"><span className="text-3xl font-black text-[#059669]">Banavoo<span className="text-[#d97706]">.In</span></span></Link>
          <p className="text-[#64748b] text-sm mt-1">
            {step === "form" ? "Join thousands of creators" : "Almost there!"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => step === "otp" ? setStep("form") : router.push("/products")}
              className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
              aria-label="Back">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0f172a]">
                {step === "form" ? "Create Account" : "Verify Email"}
              </h1>
              {step === "otp" && (
                <div className="flex gap-1 mt-1">
                  <span className="w-5 h-1 rounded-full bg-[#059669]" />
                  <span className="w-5 h-1 rounded-full bg-[#059669]" />
                </div>
              )}
              {step === "form" && (
                <div className="flex gap-1 mt-1">
                  <span className="w-5 h-1 rounded-full bg-[#059669]" />
                  <span className="w-5 h-1 rounded-full bg-[#e2e8f0]" />
                </div>
              )}
            </div>
          </div>

          {step === "form" ? (
            <RegistrationForm onOtpSent={handleOtpSent} />
          ) : (
            <OtpVerifyForm
              email={email}
              onBack={() => setStep("form")}
              onVerified={handleVerified}
            />
          )}
        </div>
      </div>
    </div>
  );
}
