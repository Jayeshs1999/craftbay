"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { ArrowLeft, Mail, Eye, EyeOff, Loader2, CheckCircle2, XCircle, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span className={"flex items-center gap-1 text-xs " + (ok ? "text-green-600" : "text-[#a8a29e]")}>
      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}{text}
    </span>
  );
}

// ─── OTP input ─────────────────────────────────────────────────────────────────
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
    if (digit && i < 5) inputs.current[i + 1]?.focus();
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
          className="w-11 h-12 text-center text-lg font-bold border border-[#e2e8f0] rounded-xl outline-none transition-colors focus:border-[#ea580c] focus:ring-2 focus:ring-orange-100 bg-white text-[#0f172a]"
        />
      ))}
    </div>
  );
}

// ─── Step 1: Enter email ───────────────────────────────────────────────────────
function EmailStep({
  onSent,
}: {
  onSent: (email: string) => void;
}) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/send-reset-otp", { email });
      onSent(email.toLowerCase());
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <p className="text-sm text-[#64748b] mb-6">
        Enter the email address for your account and we'll send you a 6-digit reset code.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#0f172a]">Email address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required autoComplete="email"
            className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#ea580c] focus:ring-2 focus:ring-orange-100 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#ea580c] text-white font-semibold py-3 rounded-xl hover:bg-[#c2410c] active:scale-[0.98] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Sending code..." : "Send Reset Code"}
        </button>
      </form>

      <p className="text-center text-sm text-[#64748b] mt-5">
        Remember your password?{" "}
        <Link href="/login" className="text-[#059669] font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}

// ─── Step 2: Enter OTP + new password ─────────────────────────────────────────
function ResetStep({
  email,
  onBack,
  onSuccess,
}: {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [otp,          setOtp]          = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [showCnf,      setShowCnf]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [countdown,    setCountdown]    = useState(60);
  const [resending,    setResending]    = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const otpFilled = otp.replace(/\s/g, "").length === 6;
  const rules = {
    len:   newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    num:   /[0-9]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirm,
  };
  const strong   = rules.len && rules.upper && rules.num;
  const canSubmit = otpFilled && strong && rules.match;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp:         otp.trim(),
        newPassword,
      });
      onSuccess();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Reset failed. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await api.post("/auth/send-reset-otp", { email });
      setCountdown(60);
      setOtp("");
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      {/* Email banner */}
      <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-5">
        <Mail size={16} className="text-[#ea580c] shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-orange-700 font-medium">Reset code sent to</p>
          <p className="text-sm font-semibold text-[#ea580c] truncate">{email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* OTP boxes */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#0f172a] text-center">
            Enter the 6-digit code
          </label>
          <OtpInput value={otp} onChange={setOtp} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#94a3b8]">Code expires in 15 minutes</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="text-xs text-[#ea580c] font-medium hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 transition-colors">
              {resending
                ? <><RefreshCw size={11} className="animate-spin" /> Sending…</>
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : <><RefreshCw size={11} /> Resend</>}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#0f172a]">New password</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"} value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars" required autoComplete="new-password"
              className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 pr-10 text-sm outline-none placeholder:text-[#94a3b8] focus:border-[#ea580c] focus:ring-2 focus:ring-orange-100 transition-colors"
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {newPassword.length > 0 && (
            <div className="flex gap-x-3 flex-wrap mt-1">
              <Rule ok={rules.len}   text="8+ chars" />
              <Rule ok={rules.upper} text="Uppercase" />
              <Rule ok={rules.num}   text="Number" />
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#0f172a]">Confirm new password</label>
          <div className="relative">
            <input
              type={showCnf ? "text" : "password"} value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password" required autoComplete="new-password"
              className={"w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm outline-none placeholder:text-[#94a3b8] transition-colors focus:ring-2 " +
                (confirm.length > 0
                  ? rules.match
                    ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-100"
                    : "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-[#e2e8f0] focus:border-[#ea580c] focus:ring-orange-100")}
            />
            <button type="button" onClick={() => setShowCnf((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
              {showCnf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirm.length > 0 && !rules.match && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full flex items-center justify-center gap-2 bg-[#ea580c] text-white font-semibold py-3 rounded-xl hover:bg-[#c2410c] active:scale-[0.98] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Resetting password..." : "Reset Password"}
        </button>
      </form>

      <button
        onClick={onBack}
        className="w-full text-xs text-[#64748b] hover:text-[#0f172a] flex items-center justify-center gap-1 mt-4 transition-colors">
        <ArrowLeft size={12} /> Use a different email
      </button>
    </>
  );
}

// ─── Step 3: Success ───────────────────────────────────────────────────────────
function SuccessStep() {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-[#059669]" />
      </div>
      <h2 className="text-lg font-bold text-[#0f172a] mb-2">Password reset!</h2>
      <p className="text-sm text-[#64748b] mb-6">
        Your password has been updated successfully. You can now sign in with your new password.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 bg-[#059669] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#047857] transition-colors text-sm">
        Sign In
      </Link>
    </div>
  );
}

// ─── Page shell ────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step,  setStep]  = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");

  const titles: Record<typeof step, string> = {
    email: "Forgot Password",
    reset: "Reset Password",
    done:  "All Done",
  };

  // Step progress dots (shown on email + reset steps)
  const stepIndex = step === "email" ? 0 : step === "reset" ? 1 : 2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf8] via-[#fff7ed]/40 to-[#fffbeb]/50 px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/"><span className="text-3xl font-black text-[#059669]">Banavoo<span className="text-[#d97706]">.In</span></span></Link>
          <p className="text-[#64748b] text-sm mt-1">Account recovery</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
          {/* Header */}
          {step !== "done" && (
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => step === "reset" ? setStep("email") : router.push("/login")}
                className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
                aria-label="Back">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#0f172a]">{titles[step]}</h1>
                {/* Progress dots */}
                <div className="flex gap-1 mt-1">
                  <span className={`w-5 h-1 rounded-full transition-colors ${stepIndex >= 0 ? "bg-[#ea580c]" : "bg-[#e2e8f0]"}`} />
                  <span className={`w-5 h-1 rounded-full transition-colors ${stepIndex >= 1 ? "bg-[#ea580c]" : "bg-[#e2e8f0]"}`} />
                </div>
              </div>
            </div>
          )}

          {step === "email" && (
            <EmailStep
              onSent={(e) => { setEmail(e); setStep("reset"); }}
            />
          )}
          {step === "reset" && (
            <ResetStep
              email={email}
              onBack={() => setStep("email")}
              onSuccess={() => setStep("done")}
            />
          )}
          {step === "done" && <SuccessStep />}
        </div>
      </div>
    </div>
  );
}
