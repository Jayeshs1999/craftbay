"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/utils/useRequireAuth";

export default function DeleteAccountPage() {
  const { user, isLoading } = useRequireAuth("/login?redirect=/delete-account");
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const CONFIRM_WORD = "DELETE";
  const ready = confirm === CONFIRM_WORD;

  async function handleDelete() {
    if (!ready) return;
    setLoading(true);
    setError("");
    try {
      await api.delete("/auth/account");
      clearAuth();
      router.replace("/?account=deleted");
    } catch (e: any) {
      setError(e.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#78716c] mb-8">
        <Link href="/" className="hover:text-[#059669] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/dashboard" className="hover:text-[#059669] transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-[#1c1917] font-medium">Delete Account</span>
      </div>

      {/* Warning card */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-red-700 mb-1">This action is permanent and cannot be undone</h2>
            <p className="text-xs text-red-600 leading-relaxed">
              Deleting your account will permanently remove:
            </p>
            <ul className="text-xs text-red-600 list-disc list-inside mt-2 space-y-0.5">
              <li>Your profile and personal information</li>
              <li>Your saved addresses and wishlist</li>
              {user.isSeller && <li>Your shop, all product listings, and seller data</li>}
              <li>Your order history</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#0f172a]">Delete Account</h1>
            <p className="text-xs text-[#78716c]">Signed in as {user.email}</p>
          </div>
        </div>

        <p className="text-sm text-[#57534e] mb-5 leading-relaxed">
          To confirm, type <strong className="text-[#0f172a] font-bold">{CONFIRM_WORD}</strong> in the box below.
        </p>

        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.toUpperCase())}
          placeholder={CONFIRM_WORD}
          className="w-full rounded-xl border border-[#e2e8f0] px-3.5 py-2.5 text-sm outline-none placeholder:text-[#94a3b8] focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-colors mb-4 font-mono tracking-widest"
        />

        {error && (
          <p className="text-xs text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handleDelete}
          disabled={!ready || loading}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Deleting account…" : "Permanently delete my account"}
        </button>

        <Link
          href="/dashboard"
          className="block text-center text-sm text-[#78716c] hover:text-[#0f172a] mt-4 transition-colors"
        >
          Cancel — keep my account
        </Link>
      </div>

      <p className="text-xs text-[#94a3b8] text-center mt-6 leading-relaxed">
        Changed your mind? You can simply{" "}
        <Link href="/dashboard" className="text-[#059669] hover:underline">go back to your dashboard</Link>.
        <br />
        Questions? Email us at{" "}
        <a href="mailto:jayeshsevatkar55@gmail.com" className="text-[#059669] hover:underline">
          jayeshsevatkar55@gmail.com
        </a>
      </p>
    </div>
  );
}
