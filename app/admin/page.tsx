"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Order, User } from "@/types";
import {
  Package, Users, ShoppingBag, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Clock, Bell, ChevronDown,
  ChevronUp, Phone, Mail, RefreshCw, Send, Store, Banknote, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  unrespondedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
}

interface AdminBuyer extends User {
  phone?: string;
}

interface AdminSeller extends User {
  phone?: string;
}

type AdminOrder = Omit<Order, "buyer" | "items"> & {
  buyer: AdminBuyer;
  items: (Omit<Order["items"][number], "seller"> & {
    seller: AdminSeller;
  })[];
  sellerPaid?: boolean;
  sellerPaidAt?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:          { label: "Pending",          color: "bg-yellow-100 text-yellow-700" },
  confirmed:        { label: "Confirmed",        color: "bg-blue-100 text-blue-700" },
  processing:       { label: "Processing",       color: "bg-orange-100 text-orange-700" },
  shipped:          { label: "Shipped",          color: "bg-purple-100 text-purple-700" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-100 text-indigo-700" },
  delivered:        { label: "Delivered",        color: "bg-green-100 text-green-700" },
  cancelled:        { label: "Cancelled",        color: "bg-red-100 text-red-600" },
  return_requested: { label: "Return Requested", color: "bg-pink-100 text-pink-700" },
  returned:         { label: "Returned",         color: "bg-gray-100 text-gray-600" },
};

const ALL_STATUSES = [
  "pending", "confirmed", "processing", "shipped",
  "out_for_delivery", "delivered", "cancelled", "return_requested", "returned",
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function hoursAgo(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 3_600_000);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, accent = false, warn = false,
}: {
  label: string; value: string | number; icon: any; accent?: boolean; warn?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
      warn   ? "border-red-200 bg-red-50" :
      accent ? "border-[#059669]/30 bg-[#ecfdf5]" :
               "border-[#e7e5e4] bg-white"
    }`}>
      <div className={`p-2.5 rounded-xl ${warn ? "bg-red-100" : accent ? "bg-[#d1fae5]" : "bg-[#f5f5f4]"}`}>
        <Icon size={20} className={warn ? "text-red-600" : accent ? "text-[#059669]" : "text-[#78716c]"} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[#1c1917]">{value}</p>
        <p className="text-xs text-[#78716c] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Nudge Modal ──────────────────────────────────────────────────────────────

function NudgeModal({
  order, onClose, onDone,
}: {
  order: AdminOrder; onClose: () => void; onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setLoading(true);
    try {
      await api.post(`/admin/orders/${order._id}/nudge-seller`, { note });
      setSent(true);
      setTimeout(onDone, 1200);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send nudge");
    } finally {
      setLoading(false);
    }
  }

  // unique sellers
  const sellers = Array.from(
    new Map(order.items.map((i) => [i.seller?._id, i.seller])).values()
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-[#1c1917] mb-1">Nudge Seller</h3>
        <p className="text-sm text-[#78716c] mb-4">
          Send an action-required email to the seller(s) for order{" "}
          <span className="font-mono font-semibold">#{order._id.slice(-8).toUpperCase()}</span>.
        </p>

        <div className="space-y-2 mb-4">
          {sellers.map((s: any) => (
            <div key={s._id} className="flex items-center gap-3 bg-[#f5f5f4] rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-[#d1fae5] flex items-center justify-center text-xs font-bold text-[#059669]">
                {s.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1c1917] truncate">{s.name}</p>
                <p className="text-xs text-[#78716c] truncate">{s.email}</p>
              </div>
              {s.phone && (
                <a href={`tel:${s.phone}`}
                   className="ml-auto flex items-center gap-1 text-xs text-[#059669] font-medium hover:underline shrink-0">
                  <Phone size={12} /> {s.phone}
                </a>
              )}
            </div>
          ))}
        </div>

        <label className="block text-xs font-medium text-[#78716c] mb-1">
          Custom message (optional)
        </label>
        <textarea
          className="w-full border border-[#e7e5e4] rounded-xl p-3 text-sm text-[#1c1917] resize-none focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20"
          rows={3}
          placeholder="e.g. The buyer has been waiting. Please confirm ASAP."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 border border-[#e7e5e4] rounded-xl py-2.5 text-sm font-medium text-[#78716c] hover:bg-[#f5f5f4] transition-colors">
            Cancel
          </button>
          <button
            onClick={send}
            disabled={loading || sent}
            className="flex-1 bg-[#059669] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#047857] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {sent ? (
              <><CheckCircle size={14} /> Sent!</>
            ) : loading ? (
              <><RefreshCw size={14} className="animate-spin" /> Sending…</>
            ) : (
              <><Bell size={14} /> Send Nudge</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({
  order, onNudge, onPayoutReleased,
}: {
  order: AdminOrder;
  onNudge: (o: AdminOrder) => void;
  onPayoutReleased?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [statusValue, setStatusValue] = useState(order.orderStatus);
  const [updating, setUpdating] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutDone, setPayoutDone] = useState(order.sellerPaid ?? false);

  const meta = STATUS_META[order.orderStatus] || STATUS_META.pending;
  const age  = hoursAgo(order.createdAt);
  const isUnresponded = ["pending", "confirmed"].includes(order.orderStatus) && age >= 24;

  // Show release button only for delivered + online (Razorpay) + payout not yet done
  const canReleasePayout = order.orderStatus === "delivered" &&
    order.paymentMethod === "razorpay" &&
    !payoutDone;

  const uniqueSellers = Array.from(
    new Map(order.items.map((i) => [i.seller?._id, i.seller])).values()
  ).filter(Boolean) as AdminSeller[];

  async function forceStatus() {
    if (!confirm(`Override status to "${statusValue}"?`)) return;
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, {
        status: statusValue,
        note:   "Admin override",
      });
      order.orderStatus = statusValue as any;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function releasePayout() {
    if (!confirm(`Release payout of ₹${order.itemsTotal?.toLocaleString("en-IN")} to seller(s) for order #${order._id.slice(-8).toUpperCase()}?`)) return;
    setPayoutLoading(true);
    try {
      await api.post(`/admin/orders/${order._id}/release-payout`);
      setPayoutDone(true);
      toast.success("Payout released — seller notified by email");
      onPayoutReleased?.();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to release payout");
    } finally {
      setPayoutLoading(false);
    }
  }

  const buyer = order.buyer;

  return (
    <div className={`bg-white rounded-2xl border ${isUnresponded ? "border-red-300" : "border-[#e7e5e4]"} overflow-hidden`}>
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-3 flex-wrap">
          {/* Order ID + age */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#1c1917]">
                #{order._id.slice(-8).toUpperCase()}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                {meta.label}
              </span>
              {/* Payment method badge */}
              {order.paymentMethod === "razorpay" && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  <ShieldCheck size={8} /> {order.paymentStatus === "paid" ? "Paid Online" : "Unpaid"}
                </span>
              )}
              {/* Payout badge */}
              {order.orderStatus === "delivered" && order.paymentMethod === "razorpay" && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  payoutDone ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                }`}>
                  <Banknote size={8} /> {payoutDone ? "Payout Released" : "Payout Pending"}
                </span>
              )}
              {isUnresponded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertTriangle size={9} /> No seller action {age}h
                </span>
              )}
            </div>
            <p className="text-xs text-[#78716c] mt-0.5">
              {fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}
            </p>
          </div>

          {/* Amount */}
          <span className="font-bold text-[#059669] text-sm shrink-0">
            ₹{order.totalAmount.toLocaleString("en-IN")}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNudge(order)}
              title="Email seller reminder"
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 border border-orange-200 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
              <Bell size={12} /> Nudge
            </button>
            <button
              onClick={() => setExpanded((x) => !x)}
              className="p-1.5 text-[#78716c] hover:bg-[#f5f5f4] rounded-lg transition-colors">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Buyer + Seller summary */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-[#f5f5f4] rounded-xl px-3 py-2">
            <Users size={13} className="text-[#78716c] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-[#a8a29e] font-medium uppercase tracking-wide">Buyer</p>
              <p className="text-xs font-semibold text-[#1c1917] truncate">{buyer?.name ?? "—"}</p>
              <p className="text-[11px] text-[#78716c] truncate">{buyer?.email ?? "—"}</p>
              {buyer?.phone && <p className="text-[11px] text-[#78716c]">{buyer.phone}</p>}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#f5f5f4] rounded-xl px-3 py-2">
            <ShoppingBag size={13} className="text-[#78716c] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#a8a29e] font-medium uppercase tracking-wide">Seller(s)</p>
              {uniqueSellers.map((s: any) => (
                <div key={s._id} className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-semibold text-[#1c1917] truncate">{s.name}</p>
                  {s.phone && (
                    <a href={`tel:${s.phone}`} className="text-[11px] text-[#059669] hover:underline flex items-center gap-0.5">
                      <Phone size={9} /> {s.phone}
                    </a>
                  )}
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="text-[11px] text-[#78716c] hover:underline flex items-center gap-0.5">
                      <Mail size={9} /> {s.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#f5f5f4] bg-[#fafaf9] px-4 py-4 space-y-4">
          {/* Items */}
          <div>
            <p className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wide mb-2">Items Ordered</p>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-[#e7e5e4] px-3 py-2">
                  {item.image && (
                    <img src={item.image} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#e7e5e4] shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#1c1917] truncate">{item.name}</p>
                    {item.variant && <p className="text-[11px] text-[#78716c]">{item.variant}</p>}
                    <p className="text-[11px] text-[#a8a29e]">
                      Seller: {(item.seller as any)?.name || item.seller}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#1c1917]">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-[#78716c]">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          <div>
            <p className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wide mb-1">Delivery Address</p>
            <p className="text-xs text-[#374151]">
              {order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />
              {[order.shippingAddress.line1, order.shippingAddress.line2,
                order.shippingAddress.city, order.shippingAddress.state,
                order.shippingAddress.pincode].filter(Boolean).join(", ")}
            </p>
          </div>

          {/* Status history */}
          <div>
            <p className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wide mb-2">Status History</p>
            <div className="space-y-1">
              {order.statusHistory.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className={`mt-0.5 px-1.5 py-0.5 rounded-full font-semibold ${
                    STATUS_META[h.status]?.color || "bg-gray-100 text-gray-600"
                  }`}>{h.status}</span>
                  <span className="text-[#78716c]">
                    {h.note && <span className="text-[#374151]">{h.note} · </span>}
                    by <strong>{h.updatedBy}</strong> · {fmtDate(h.timestamp)} {fmtTime(h.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin override status */}
          <div className="flex items-center gap-3 pt-1">
            <label className="text-xs font-medium text-[#78716c] shrink-0">Force status:</label>
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value as any)}
              className="flex-1 border border-[#e7e5e4] rounded-lg px-2 py-1.5 text-xs text-[#1c1917] focus:outline-none focus:border-[#059669]">
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
              ))}
            </select>
            <button
              onClick={forceStatus}
              disabled={updating || statusValue === order.orderStatus}
              className="bg-[#1c1917] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#374151] disabled:opacity-40 transition-colors">
              {updating ? "…" : "Apply"}
            </button>
          </div>

          {/* Payout release — only for delivered Razorpay orders */}
          {(canReleasePayout || payoutDone) && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${payoutDone ? "bg-purple-50 border-purple-200" : "bg-orange-50 border-orange-200"}`}>
              <Banknote size={16} className={payoutDone ? "text-purple-600 shrink-0" : "text-orange-600 shrink-0"} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${payoutDone ? "text-purple-700" : "text-orange-700"}`}>
                  {payoutDone ? "Payout Released to Seller" : "Payout Pending — Order Delivered"}
                </p>
                <p className="text-[11px] text-[#78716c]">
                  {payoutDone
                    ? `₹${order.itemsTotal?.toLocaleString("en-IN")} sent to seller · ${order.sellerPaidAt ? fmtDate(order.sellerPaidAt) : ""}`
                    : `Release ₹${order.itemsTotal?.toLocaleString("en-IN")} to seller(s) — payment was collected online.`}
                </p>
              </div>
              {canReleasePayout && (
                <button
                  onClick={releasePayout}
                  disabled={payoutLoading}
                  className="flex items-center gap-1.5 text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shrink-0">
                  {payoutLoading ? <RefreshCw size={12} className="animate-spin" /> : <Banknote size={12} />}
                  {payoutLoading ? "Releasing…" : "Release Payout"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Buyer Mail Types ─────────────────────────────────────────────────────────

const BUYER_MAIL_TYPES = [
  {
    value: "become_seller_intro",
    label: "Become a Seller — Intro",
    desc: "Gentle intro: 'Did you know you can also sell on Banavoo?'",
    icon: "🌿",
  },
  {
    value: "become_seller_nudge",
    label: "Your Craft Deserves a Shop",
    desc: "Warm encouragement for buyers who make handmade products",
    icon: "🎨",
  },
  {
    value: "seller_benefits",
    label: "Seller Benefits (Comparison)",
    desc: "Shows Instagram vs Big Marketplaces vs Banavoo.in table",
    icon: "💰",
  },
];

type AdminBuyerWithCount = { _id: string; name: string; email: string; createdAt: string; orderCount: number };

// ─── Mail Buyers Panel ────────────────────────────────────────────────────────

function MailBuyersPanel() {
  const [buyerFilter,   setBuyerFilter]   = useState<"all" | "no_orders" | "has_orders">("all");
  const [buyers,        setBuyers]        = useState<AdminBuyerWithCount[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [mailType,      setMailType]      = useState("become_seller_intro");
  const [customNote,    setCustomNote]    = useState("");
  const [sending,       setSending]       = useState(false);
  const [result,        setResult]        = useState<{ sent: any[]; failed: any[] } | null>(null);

  const fetchBuyers = useCallback(async () => {
    setLoadingBuyers(true);
    setSelected(new Set());
    setResult(null);
    try {
      const { data } = await api.get("/admin/buyers", { params: { filter: buyerFilter } });
      setBuyers(data.buyers);
    } catch {
      toast.error("Failed to load buyers");
    } finally {
      setLoadingBuyers(false);
    }
  }, [buyerFilter]);

  useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

  function toggleBuyer(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(selected.size === buyers.length
      ? new Set()
      : new Set(buyers.map((b) => b._id)));
  }

  async function sendMails() {
    if (selected.size === 0) { toast.error("Select at least one buyer"); return; }
    if (!confirm(`Send "${BUYER_MAIL_TYPES.find(m => m.value === mailType)?.label}" email to ${selected.size} buyer(s)?`)) return;
    setSending(true);
    setResult(null);
    try {
      const { data } = await api.post("/admin/mail-buyers", {
        buyerIds: Array.from(selected),
        mailType,
        customNote: customNote.trim() || undefined,
      });
      setResult(data);
      toast.success(`✅ Sent to ${data.sent.length} buyer(s)`);
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const chosenMailType = BUYER_MAIL_TYPES.find((m) => m.value === mailType)!;

  return (
    <div className="space-y-6">

      {/* Info banner */}
      <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl px-5 py-4 flex gap-3">
        <span className="text-2xl shrink-0">💡</span>
        <div>
          <p className="text-sm font-bold text-[#065f46] mb-0.5">Buyer → Seller Conversion Emails</p>
          <p className="text-xs text-[#047857] leading-relaxed">
            These emails are sent to buyers who joined Banavoo but never opened a seller account.
            The goal is to gently let them know they can also <strong>create a shop, list products, and earn</strong> — completely free, no GSTN needed.
          </p>
        </div>
      </div>

      {/* Step 1 — Choose email type */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-3">
          Step 1 — Choose Email Type
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {BUYER_MAIL_TYPES.map((mt) => (
            <button
              key={mt.value}
              onClick={() => setMailType(mt.value)}
              className={`text-left rounded-xl border p-3.5 transition-all ${
                mailType === mt.value
                  ? "border-[#059669] bg-[#ecfdf5] ring-2 ring-[#059669]/20"
                  : "border-[#e7e5e4] hover:border-[#059669]/40 hover:bg-[#f9fafb]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{mt.icon}</span>
                <span className="text-sm font-semibold text-[#1c1917]">{mt.label}</span>
                {mailType === mt.value && <CheckCircle size={14} className="ml-auto text-[#059669]" />}
              </div>
              <p className="text-xs text-[#78716c] leading-relaxed">{mt.desc}</p>
            </button>
          ))}
        </div>

        {/* Subject preview */}
        <div className="mt-4 bg-[#f5f5f4] rounded-xl px-4 py-3 flex items-start gap-2">
          <Mail size={13} className="text-[#78716c] mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wide mb-0.5">Email Subject Preview</p>
            <p className="text-xs text-[#374151] font-medium">
              {mailType === "become_seller_intro" && "[Buyer Name], did you know you can also sell on Banavoo.in? 🌿"}
              {mailType === "become_seller_nudge" && "[Buyer Name], your craft deserves its own shop on Banavoo.in 🎨"}
              {mailType === "seller_benefits"     && "Turn your passion into income — sell on Banavoo.in, [Buyer Name] 💰"}
            </p>
          </div>
        </div>

        {/* Personal note */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-[#78716c] mb-1.5">
            Personal note to add at the bottom <span className="text-[#a8a29e]">(optional)</span>
          </label>
          <textarea
            className="w-full border border-[#e7e5e4] rounded-xl p-3 text-sm text-[#1c1917] resize-none focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20"
            rows={2}
            placeholder="e.g. I noticed you've been browsing jewellery — if you make any, I'd love to see your shop on Banavoo!"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
          />
        </div>
      </div>

      {/* Step 2 — Select Buyers */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <p className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">
            Step 2 — Select Buyers
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "no_orders", "has_orders"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setBuyerFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  buyerFilter === f
                    ? "bg-[#1c1917] text-white"
                    : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]"
                }`}>
                {f === "all" ? "All Buyers" : f === "no_orders" ? "Never Ordered" : "Has Orders"}
              </button>
            ))}
            <button
              onClick={fetchBuyers}
              className="p-1.5 text-[#78716c] border border-[#e7e5e4] hover:bg-[#f5f5f4] rounded-lg transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {loadingBuyers ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : buyers.length === 0 ? (
          <div className="text-center py-10 text-[#78716c]">
            <Users size={32} className="mx-auto mb-2 text-[#e7e5e4]" />
            <p className="text-sm">No buyers match this filter</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selected.size === buyers.length && buyers.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[#e7e5e4] text-[#059669] focus:ring-[#059669]/30 cursor-pointer"
                />
                <span className="text-xs text-[#78716c] font-medium">
                  {selected.size === buyers.length && buyers.length > 0
                    ? `Deselect all (${buyers.length})`
                    : `Select all ${buyers.length} buyer${buyers.length !== 1 ? "s" : ""}`}
                </span>
              </label>
              {selected.size > 0 && (
                <span className="text-xs font-semibold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-full">
                  {selected.size} selected
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {buyers.map((buyer) => (
                <label
                  key={buyer._id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                    selected.has(buyer._id)
                      ? "border-[#059669] bg-[#f0fdf4]"
                      : "border-[#e7e5e4] hover:border-[#059669]/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(buyer._id)}
                    onChange={() => toggleBuyer(buyer._id)}
                    className="w-4 h-4 rounded border-[#e7e5e4] text-[#059669] focus:ring-[#059669]/30 cursor-pointer shrink-0"
                  />
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                    {buyer.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1c1917] truncate">{buyer.name}</p>
                    <p className="text-xs text-[#78716c] truncate flex items-center gap-1">
                      <Mail size={10} /> {buyer.email}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    buyer.orderCount === 0
                      ? "bg-gray-100 text-gray-600"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {buyer.orderCount} order{buyer.orderCount !== 1 ? "s" : ""}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Step 3 — Send */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-4">
          Step 3 — Send Email
        </p>
        <div className="bg-[#f5f5f4] rounded-xl px-4 py-3 mb-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#78716c]">Email type</span>
            <span className="font-semibold text-[#1c1917]">{chosenMailType.icon} {chosenMailType.label}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#78716c]">Recipients</span>
            <span className="font-semibold text-[#1c1917]">{selected.size} buyer{selected.size !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#78716c]">Personal note</span>
            <span className="font-semibold text-[#1c1917]">{customNote.trim() ? "Yes" : "No"}</span>
          </div>
        </div>

        <button
          onClick={sendMails}
          disabled={sending || selected.size === 0}
          className="w-full bg-[#059669] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#047857] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
          {sending ? (
            <><RefreshCw size={15} className="animate-spin" /> Sending…</>
          ) : (
            <><Send size={15} /> Send Email to {selected.size} Buyer{selected.size !== 1 ? "s" : ""}</>
          )}
        </button>

        {result && (
          <div className="mt-4 space-y-2">
            {result.sent.length > 0 && (
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-[#065f46] mb-1 flex items-center gap-1.5">
                  <CheckCircle size={13} /> {result.sent.length} email{result.sent.length !== 1 ? "s" : ""} sent successfully
                </p>
                {result.sent.map((s: any) => (
                  <p key={s.id} className="text-xs text-[#374151]">✓ {s.name} · {s.email}</p>
                ))}
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1.5">
                  <XCircle size={13} /> {result.failed.length} failed
                </p>
                {result.failed.map((f: any) => (
                  <p key={f.id} className="text-xs text-red-600">✗ {f.name || f.id} — {f.reason}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Seller Mail Types ────────────────────────────────────────────────────────

const MAIL_TYPES = [
  {
    value: "no_products",
    label: "Empty Shop",
    desc: "Seller registered but added 0 products",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: "🏪",
  },
  {
    value: "one_product",
    label: "Only 1 Product",
    desc: "Nudge to add more products for first order",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "📦",
  },
  {
    value: "keep_going",
    label: "Keep Going",
    desc: "Motivational nudge for any seller",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "💪",
  },
  {
    value: "share_shop",
    label: "Share Shop Link",
    desc: "Remind seller to share their shop on social media",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "🔗",
  },
  {
    value: "tips",
    label: "5 Tips to First Order",
    desc: "Actionable tips to get their first sale",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: "💡",
  },
];

type AdminSellerWithCount = User & { productCount: number };

// ─── Mail Sellers Panel ───────────────────────────────────────────────────────

function MailSellersPanel() {
  const [sellerFilter,  setSellerFilter]  = useState<"all" | "no_products" | "one_product">("all");
  const [sellers,       setSellers]       = useState<AdminSellerWithCount[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [mailType,      setMailType]      = useState("no_products");
  const [customNote,    setCustomNote]    = useState("");
  const [sending,       setSending]       = useState(false);
  const [result,        setResult]        = useState<{ sent: any[]; failed: any[] } | null>(null);

  const fetchSellers = useCallback(async () => {
    setLoadingSellers(true);
    setSelected(new Set());
    setResult(null);
    try {
      const { data } = await api.get("/admin/sellers", { params: { filter: sellerFilter } });
      setSellers(data.sellers);
    } catch {
      toast.error("Failed to load sellers");
    } finally {
      setLoadingSellers(false);
    }
  }, [sellerFilter]);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  function toggleSeller(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === sellers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sellers.map((s) => s._id)));
    }
  }

  async function sendMails() {
    if (selected.size === 0) { toast.error("Select at least one seller"); return; }
    if (!confirm(`Send "${MAIL_TYPES.find(m => m.value === mailType)?.label}" email to ${selected.size} seller(s)?`)) return;
    setSending(true);
    setResult(null);
    try {
      const { data } = await api.post("/admin/mail-sellers", {
        sellerIds: Array.from(selected),
        mailType,
        customNote: customNote.trim() || undefined,
      });
      setResult(data);
      toast.success(`✅ Sent to ${data.sent.length} seller(s)`);
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const chosenMailType = MAIL_TYPES.find((m) => m.value === mailType)!;

  return (
    <div className="space-y-6">

      {/* Step 1 — Choose email type */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-3">
          Step 1 — Choose Email Type
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MAIL_TYPES.map((mt) => (
            <button
              key={mt.value}
              onClick={() => setMailType(mt.value)}
              className={`text-left rounded-xl border p-3.5 transition-all ${
                mailType === mt.value
                  ? "border-[#059669] bg-[#ecfdf5] ring-2 ring-[#059669]/20"
                  : "border-[#e7e5e4] hover:border-[#059669]/40 hover:bg-[#f9fafb]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{mt.icon}</span>
                <span className="text-sm font-semibold text-[#1c1917]">{mt.label}</span>
                {mailType === mt.value && <CheckCircle size={14} className="ml-auto text-[#059669]" />}
              </div>
              <p className="text-xs text-[#78716c] leading-relaxed">{mt.desc}</p>
            </button>
          ))}
        </div>

        {/* Preview subject line */}
        <div className="mt-4 bg-[#f5f5f4] rounded-xl px-4 py-3 flex items-start gap-2">
          <Mail size={13} className="text-[#78716c] mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wide mb-0.5">Email Subject Preview</p>
            <p className="text-xs text-[#374151] font-medium">
              {mailType === "no_products"  && "[Seller Name], your shop is empty — let's fix that 🛍️"}
              {mailType === "one_product"  && "One product is a start, [Seller Name] — here's what happens next 🌱"}
              {mailType === "keep_going"   && "[Seller Name], your Banavoo shop is growing — keep going 💪"}
              {mailType === "share_shop"   && "[Seller Name], have you shared your Banavoo shop link yet? 🔗"}
              {mailType === "tips"         && "5 tips to get your first order on Banavoo.in, [Seller Name] 💡"}
            </p>
          </div>
        </div>

        {/* Optional personal note */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-[#78716c] mb-1.5">
            Personal note to add at the bottom of the email <span className="text-[#a8a29e]">(optional)</span>
          </label>
          <textarea
            className="w-full border border-[#e7e5e4] rounded-xl p-3 text-sm text-[#1c1917] resize-none focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20"
            rows={2}
            placeholder="e.g. I personally reviewed your shop and think your products are beautiful. Just need more listings!"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
          />
        </div>
      </div>

      {/* Step 2 — Filter & Select Sellers */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <p className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">
            Step 2 — Select Sellers
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "no_products", "one_product"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSellerFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  sellerFilter === f
                    ? "bg-[#1c1917] text-white"
                    : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]"
                }`}>
                {f === "all" ? "All Sellers" : f === "no_products" ? "0 Products" : "1 Product"}
              </button>
            ))}
            <button
              onClick={fetchSellers}
              className="p-1.5 text-[#78716c] border border-[#e7e5e4] hover:bg-[#f5f5f4] rounded-lg transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {loadingSellers ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-10 text-[#78716c]">
            <Store size={32} className="mx-auto mb-2 text-[#e7e5e4]" />
            <p className="text-sm">No sellers match this filter</p>
          </div>
        ) : (
          <>
            {/* Select all bar */}
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selected.size === sellers.length && sellers.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[#e7e5e4] text-[#059669] focus:ring-[#059669]/30 cursor-pointer"
                />
                <span className="text-xs text-[#78716c] font-medium">
                  {selected.size === sellers.length && sellers.length > 0
                    ? `Deselect all (${sellers.length})`
                    : `Select all ${sellers.length} seller${sellers.length !== 1 ? "s" : ""}`}
                </span>
              </label>
              {selected.size > 0 && (
                <span className="text-xs font-semibold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-full">
                  {selected.size} selected
                </span>
              )}
            </div>

            {/* Seller list */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {sellers.map((seller) => (
                <label
                  key={seller._id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                    selected.has(seller._id)
                      ? "border-[#059669] bg-[#f0fdf4]"
                      : "border-[#e7e5e4] hover:border-[#059669]/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(seller._id)}
                    onChange={() => toggleSeller(seller._id)}
                    className="w-4 h-4 rounded border-[#e7e5e4] text-[#059669] focus:ring-[#059669]/30 cursor-pointer shrink-0"
                  />
                  <div className="w-8 h-8 rounded-full bg-[#d1fae5] flex items-center justify-center text-xs font-bold text-[#059669] shrink-0">
                    {seller.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1c1917] truncate">
                      {seller.name}
                      {seller.sellerProfile?.shopName && (
                        <span className="text-[#78716c] font-normal"> · {seller.sellerProfile.shopName}</span>
                      )}
                    </p>
                    <p className="text-xs text-[#78716c] truncate flex items-center gap-1">
                      <Mail size={10} /> {seller.email}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    seller.productCount === 0
                      ? "bg-red-100 text-red-700"
                      : seller.productCount === 1
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {seller.productCount} product{seller.productCount !== 1 ? "s" : ""}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Step 3 — Send */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-4">
          Step 3 — Send Email
        </p>

        <div className="bg-[#f5f5f4] rounded-xl px-4 py-3 mb-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#78716c]">Email type</span>
            <span className="font-semibold text-[#1c1917]">{chosenMailType.icon} {chosenMailType.label}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#78716c]">Recipients</span>
            <span className="font-semibold text-[#1c1917]">{selected.size} seller{selected.size !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#78716c]">Personal note</span>
            <span className="font-semibold text-[#1c1917]">{customNote.trim() ? "Yes" : "No"}</span>
          </div>
        </div>

        <button
          onClick={sendMails}
          disabled={sending || selected.size === 0}
          className="w-full bg-[#059669] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#047857] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
          {sending ? (
            <><RefreshCw size={15} className="animate-spin" /> Sending…</>
          ) : (
            <><Send size={15} /> Send Email to {selected.size} Seller{selected.size !== 1 ? "s" : ""}</>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-4 space-y-2">
            {result.sent.length > 0 && (
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-[#065f46] mb-1 flex items-center gap-1.5">
                  <CheckCircle size={13} /> {result.sent.length} email{result.sent.length !== 1 ? "s" : ""} sent successfully
                </p>
                {result.sent.map((s) => (
                  <p key={s.id} className="text-xs text-[#374151]">✓ {s.name} · {s.email}</p>
                ))}
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1.5">
                  <XCircle size={13} /> {result.failed.length} failed
                </p>
                {result.failed.map((f) => (
                  <p key={f.id} className="text-xs text-red-600">✗ {f.name || f.id} — {f.reason}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payouts Panel ────────────────────────────────────────────────────────────

function PayoutsPanel() {
  const [payoutFilter, setPayoutFilter] = useState<"pending" | "released">("pending");
  const [payouts,      setPayouts]      = useState<AdminOrder[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [pages,        setPages]        = useState(1);
  const [total,        setTotal]        = useState(0);

  const fetchPayouts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const paid = payoutFilter === "released" ? "true" : "false";
      const { data } = await api.get("/admin/payouts", { params: { page: p, limit: 20, paid } });
      setPayouts(data.orders);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }, [payoutFilter]);

  useEffect(() => { fetchPayouts(1); }, [fetchPayouts]);

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex gap-3">
        <Banknote size={20} className="text-orange-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-orange-800 mb-0.5">Seller Payouts — Super Admin Control</p>
          <p className="text-xs text-orange-700 leading-relaxed">
            When an online (Razorpay) order is delivered, the buyer&apos;s payment is held by Banavoo.
            The super admin verifies delivery and manually releases the payout to the seller.
            Seller receives a notification email once payout is released.
          </p>
        </div>
      </div>

      {/* Filter + refresh */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5">
          {(["pending", "released"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPayoutFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                payoutFilter === f
                  ? f === "pending" ? "bg-orange-500 text-white" : "bg-purple-600 text-white"
                  : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]"
              }`}>
              {f === "pending" ? "Payout Pending" : "Payout Released"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-[#78716c]">{total} order{total !== 1 ? "s" : ""}</p>
          <button onClick={() => fetchPayouts(1)}
            className="p-1.5 text-[#78716c] border border-[#e7e5e4] hover:bg-[#f5f5f4] rounded-lg transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-16 text-[#78716c]">
          <Banknote size={40} className="mx-auto mb-3 text-[#e7e5e4]" />
          <p className="text-sm">No {payoutFilter === "pending" ? "pending" : "released"} payouts found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((o) => (
            <OrderRow key={o._id} order={o} onNudge={() => {}} onPayoutReleased={() => fetchPayouts(page)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchPayouts(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === p ? "bg-[#059669] text-white" : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]"
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  const [activeTab,   setActiveTab]   = useState<"orders" | "mail" | "mail_buyers" | "payouts">("orders");
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [orders,  setOrders]  = useState<AdminOrder[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [filter,  setFilter]  = useState("");
  const [unresponded, setUnresponded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [nudgeOrder, setNudgeOrder] = useState<AdminOrder | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/login?redirect=/admin");
    }
  }, [user, isLoading, router]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch {}
  }, []);

  const fetchOrders = useCallback(async (p = 1) => {
    setFetching(true);
    try {
      const params: Record<string, any> = { page: p, limit: 20 };
      if (filter)      params.status       = filter;
      if (unresponded) params.unresponded  = "true";
      const { data } = await api.get("/admin/orders", { params });
      setOrders(data.orders);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {}
    finally { setFetching(false); }
  }, [filter, unresponded]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchStats();
    fetchOrders(1);
  }, [user, fetchStats, fetchOrders]);

  if (isLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (user.role !== "admin") return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1c1917]">Super Admin Dashboard</h1>
            <p className="text-sm text-[#78716c] mt-0.5">Full order tracking · Buyer–Seller visibility · Seller nudge · Mail sellers</p>
          </div>
          <button
            onClick={() => { fetchStats(); fetchOrders(1); }}
            className="flex items-center gap-2 text-sm font-medium text-[#78716c] border border-[#e7e5e4] px-3 py-2 rounded-xl hover:bg-[#f5f5f4] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Orders"       value={stats.totalOrders}       icon={Package} />
          <StatCard label="Pending / Confirmed" value={stats.pendingOrders}    icon={Clock} />
          <StatCard
            label="Unresponded (>24h)"
            value={stats.unrespondedOrders}
            icon={AlertTriangle}
            warn={stats.unrespondedOrders > 0}
          />
          <StatCard label="Delivered"           value={stats.deliveredOrders}  icon={CheckCircle} accent />
          <StatCard label="Cancelled"           value={stats.cancelledOrders}  icon={XCircle} />
          <StatCard label="Platform Revenue"    value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} icon={TrendingUp} accent />
          <StatCard label="Total Users"         value={stats.totalUsers}       icon={Users} />
          <StatCard label="Active Sellers"      value={stats.totalSellers}     icon={ShoppingBag} />
          <StatCard label="Live Products"       value={stats.totalProducts}    icon={Package} />
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 bg-[#f5f5f4] p-1 rounded-2xl mb-6 w-fit flex-wrap">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "orders"
              ? "bg-white text-[#1c1917] shadow-sm"
              : "text-[#78716c] hover:text-[#1c1917]"
          }`}>
          <Package size={15} /> Orders
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "payouts"
              ? "bg-white text-[#1c1917] shadow-sm"
              : "text-[#78716c] hover:text-[#1c1917]"
          }`}>
          <Banknote size={15} /> Payouts
        </button>
        <button
          onClick={() => setActiveTab("mail")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "mail"
              ? "bg-white text-[#1c1917] shadow-sm"
              : "text-[#78716c] hover:text-[#1c1917]"
          }`}>
          <Send size={15} /> Mail Sellers
        </button>
        <button
          onClick={() => setActiveTab("mail_buyers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "mail_buyers"
              ? "bg-white text-[#1c1917] shadow-sm"
              : "text-[#78716c] hover:text-[#1c1917]"
          }`}>
          <Users size={15} /> Mail Buyers
        </button>
      </div>

      {/* ── MAIL SELLERS TAB ── */}
      {activeTab === "mail" && <MailSellersPanel />}

      {/* ── MAIL BUYERS TAB ── */}
      {activeTab === "mail_buyers" && <MailBuyersPanel />}

      {/* ── PAYOUTS TAB ── */}
      {activeTab === "payouts" && <PayoutsPanel />}

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && <>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <button
          onClick={() => { setUnresponded(false); setFilter(""); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !unresponded && !filter ? "bg-[#1c1917] text-white" : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]"
          }`}>
          All Orders
        </button>
        <button
          onClick={() => { setUnresponded(true); setFilter(""); }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
            unresponded ? "bg-red-600 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}>
          <AlertTriangle size={10} /> Unresponded (&gt;24h)
          {stats?.unrespondedOrders ? (
            <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              unresponded ? "bg-white text-red-600" : "bg-red-600 text-white"
            }`}>{stats.unrespondedOrders}</span>
          ) : null}
        </button>
        {["pending","confirmed","processing","shipped","delivered","cancelled"].map((s) => (
          <button key={s}
            onClick={() => { setUnresponded(false); setFilter(s); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !unresponded && filter === s
                ? "bg-[#059669] text-white"
                : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]"
            }`}>
            {STATUS_META[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#78716c]">
          {fetching ? "Loading…" : `${total} order${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {fetching ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-[#78716c]">
          <Package size={40} className="mx-auto mb-3 text-[#e7e5e4]" />
          No orders match the current filter.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o._id} order={o} onNudge={setNudgeOrder} onPayoutReleased={() => fetchStats()} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p}
              onClick={() => fetchOrders(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === p ? "bg-[#059669] text-white" : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]"
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}

      </> /* end orders tab */}

      {/* Nudge modal */}
      {nudgeOrder && (
        <NudgeModal
          order={nudgeOrder}
          onClose={() => setNudgeOrder(null)}
          onDone={() => { setNudgeOrder(null); fetchOrders(page); }}
        />
      )}
    </div>
  );
}
