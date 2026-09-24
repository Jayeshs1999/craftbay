"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Order, User } from "@/types";
import {
  Package, Users, ShoppingBag, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Clock, Bell, ChevronDown,
  ChevronUp, Phone, Mail, RefreshCw, Send, Store, Banknote, ShieldCheck, Camera, ExternalLink,
  Search, ClipboardList, UserCheck,
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
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${
      warn   ? "border-red-200 bg-red-50" :
      accent ? "border-emerald-200 bg-emerald-50" :
               "border-gray-200 bg-white"
    }`}>
      <div className={`p-2 rounded-lg ${warn ? "bg-red-100" : accent ? "bg-emerald-100" : "bg-gray-100"}`}>
        <Icon size={18} className={warn ? "text-red-600" : accent ? "text-emerald-600" : "text-gray-500"} />
      </div>
      <div>
        <p className="text-xl font-extrabold text-gray-900 leading-tight">{value}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
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

  const sellers = Array.from(
    new Map(order.items.map((i) => [i.seller?._id, i.seller])).values()
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Nudge Seller</h3>
        <p className="text-sm text-gray-500 mb-4">
          Send an action-required email to the seller(s) for order{" "}
          <span className="font-mono font-semibold">#{order._id.slice(-8).toUpperCase()}</span>.
        </p>
        <div className="space-y-2 mb-4">
          {sellers.map((s: any) => (
            <div key={s._id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                {s.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-500 truncate">{s.email}</p>
              </div>
              {s.phone && (
                <a href={`tel:${s.phone}`} className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline shrink-0">
                  <Phone size={12} /> {s.phone}
                </a>
              )}
            </div>
          ))}
        </div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Custom message (optional)</label>
        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          rows={3}
          placeholder="e.g. The buyer has been waiting. Please confirm ASAP."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={send}
            disabled={loading || sent}
            className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {sent ? <><CheckCircle size={14} /> Sent!</> : loading ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : <><Bell size={14} /> Send Nudge</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Table Row ──────────────────────────────────────────────────────────

function OrderTableRow({
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
      await api.put(`/admin/orders/${order._id}/status`, { status: statusValue, note: "Admin override" });
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
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isUnresponded ? "bg-red-50 hover:bg-red-50" : ""}`}>
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded((x) => !x)} className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <span className="font-mono text-xs font-bold text-gray-800">#{order._id.slice(-8).toUpperCase()}</span>
            {isUnresponded && <span title={`No seller action for ${age}h`}><AlertTriangle size={13} className="text-red-500" /></span>}
          </div>
          <p className="text-[11px] text-gray-400 ml-7">{fmtDate(order.createdAt)}</p>
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
          {order.paymentMethod === "razorpay" && (
            <span className={`ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </span>
          )}
        </td>
        <td className="px-3 py-3">
          <p className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">{buyer?.name ?? "—"}</p>
          <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{buyer?.email ?? "—"}</p>
          {buyer?.phone && <p className="text-[11px] text-gray-400">{buyer.phone}</p>}
        </td>
        <td className="px-3 py-3">
          {uniqueSellers.map((s: any) => (
            <div key={s._id} className="flex items-center gap-1 flex-wrap mb-0.5">
              <p className="text-xs font-semibold text-gray-800 truncate max-w-[110px]">{s.name}</p>
              {s.phone && <a href={`tel:${s.phone}`} className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5"><Phone size={9} /></a>}
            </div>
          ))}
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-right">
          <span className="font-bold text-emerald-700 text-sm">₹{order.totalAmount.toLocaleString("en-IN")}</span>
          {order.orderStatus === "delivered" && order.paymentMethod === "razorpay" && (
            <p className={`text-[10px] font-semibold ${payoutDone ? "text-purple-600" : "text-orange-500"}`}>
              {payoutDone ? "Paid out" : "Payout due"}
            </p>
          )}
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value as any)}
              title="Quick status override"
              className="border border-gray-200 rounded-lg px-1.5 py-1 text-[11px] text-gray-700 focus:outline-none focus:border-emerald-500 bg-white max-w-[110px]">
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
            </select>
            <button onClick={forceStatus} disabled={updating || statusValue === order.orderStatus}
              title="Apply status change"
              className="text-[11px] font-bold bg-gray-800 text-white px-2 py-1 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors">
              {updating ? "…" : "Set"}
            </button>
            <button onClick={() => onNudge(order)} title="Email seller reminder"
              className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 border border-orange-200 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors">
              <Bell size={11} /> Nudge
            </button>
            {canReleasePayout && (
              <button onClick={releasePayout} disabled={payoutLoading}
                className="flex items-center gap-1 text-[11px] font-bold bg-orange-500 text-white px-2 py-1 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors">
                {payoutLoading ? <RefreshCw size={11} className="animate-spin" /> : <Banknote size={11} />} Pay
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Items Ordered</p>
                <div className="space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-2">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                        {item.variant && <p className="text-[11px] text-gray-500">{item.variant}</p>}
                        <p className="text-[11px] text-gray-400">Seller: {(item.seller as any)?.name || item.seller}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        <p className="text-[11px] text-gray-400">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                  <p className="text-xs text-gray-700">
                    {order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />
                    {[order.shippingAddress.line1, order.shippingAddress.line2,
                      order.shippingAddress.city, order.shippingAddress.state,
                      order.shippingAddress.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status History</p>
                  <div className="space-y-1">
                    {order.statusHistory.slice().reverse().map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className={`mt-0.5 px-1.5 py-0.5 rounded-full font-semibold ${STATUS_META[h.status]?.color || "bg-gray-100 text-gray-600"}`}>{h.status}</span>
                        <span className="text-gray-500">
                          {h.note && <span className="text-gray-700">{h.note} · </span>}
                          by <strong>{h.updatedBy}</strong> · {fmtDate(h.timestamp)} {fmtTime(h.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500 shrink-0">Force status:</label>
                  <select value={statusValue} onChange={(e) => setStatusValue(e.target.value as any)}
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-500">
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
                  </select>
                  <button onClick={forceStatus} disabled={updating || statusValue === order.orderStatus}
                    className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors">
                    {updating ? "…" : "Apply"}
                  </button>
                </div>
                {(canReleasePayout || payoutDone) && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${payoutDone ? "bg-purple-50 border-purple-200" : "bg-orange-50 border-orange-200"}`}>
                    <Banknote size={16} className={payoutDone ? "text-purple-600 shrink-0" : "text-orange-600 shrink-0"} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${payoutDone ? "text-purple-700" : "text-orange-700"}`}>
                        {payoutDone ? "Payout Released to Seller" : "Payout Pending — Order Delivered"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {payoutDone
                          ? `₹${order.itemsTotal?.toLocaleString("en-IN")} sent · ${order.sellerPaidAt ? fmtDate(order.sellerPaidAt) : ""}`
                          : `Release ₹${order.itemsTotal?.toLocaleString("en-IN")} to seller(s)`}
                      </p>
                    </div>
                    {canReleasePayout && (
                      <button onClick={releasePayout} disabled={payoutLoading}
                        className="flex items-center gap-1.5 text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shrink-0">
                        {payoutLoading ? <RefreshCw size={12} className="animate-spin" /> : <Banknote size={12} />}
                        {payoutLoading ? "Releasing…" : "Release Payout"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Buyer Mail Types ─────────────────────────────────────────────────────────

const BUYER_MAIL_TYPES = [
  { value: "become_seller_intro", label: "Become a Seller — Intro",       desc: "Gentle intro: 'Did you know you can also sell on Banavoo?'",    icon: "🌿" },
  { value: "become_seller_nudge", label: "Your Craft Deserves a Shop",     desc: "Warm encouragement for buyers who make handmade products",       icon: "🎨" },
  { value: "seller_benefits",     label: "Seller Benefits (Comparison)",   desc: "Shows Instagram vs Big Marketplaces vs Banavoo.in table",       icon: "💰" },
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
    } catch { toast.error("Failed to load buyers"); }
    finally { setLoadingBuyers(false); }
  }, [buyerFilter]);

  useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

  function toggleBuyer(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAll() {
    setSelected(selected.size === buyers.length ? new Set() : new Set(buyers.map((b) => b._id)));
  }

  async function sendMails() {
    if (selected.size === 0) { toast.error("Select at least one buyer"); return; }
    if (!confirm(`Send "${BUYER_MAIL_TYPES.find(m => m.value === mailType)?.label}" email to ${selected.size} buyer(s)?`)) return;
    setSending(true); setResult(null);
    try {
      const { data } = await api.post("/admin/mail-buyers", { buyerIds: Array.from(selected), mailType, customNote: customNote.trim() || undefined });
      setResult(data);
      toast.success(`✅ Sent to ${data.sent.length} buyer(s)`);
      setSelected(new Set());
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed to send"); }
    finally { setSending(false); }
  }

  const chosenMailType = BUYER_MAIL_TYPES.find((m) => m.value === mailType)!;

  return (
    <div className="space-y-5">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex gap-3">
        <span className="text-2xl shrink-0">💡</span>
        <div>
          <p className="text-sm font-bold text-emerald-800 mb-0.5">Buyer → Seller Conversion Emails</p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            These emails target buyers who joined Banavoo but never opened a seller account. Goal: let them know they can <strong>create a shop and earn</strong> — free, no GSTN needed.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Step 1 — Choose Email Type</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {BUYER_MAIL_TYPES.map((mt) => (
            <button key={mt.value} onClick={() => setMailType(mt.value)}
              className={`text-left rounded-xl border p-3.5 transition-all ${mailType === mt.value ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-emerald-300"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{mt.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{mt.label}</span>
                {mailType === mt.value && <CheckCircle size={14} className="ml-auto text-emerald-600" />}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{mt.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-2">
          <Mail size={13} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email Subject Preview</p>
            <p className="text-xs text-gray-700 font-medium">
              {mailType === "become_seller_intro" && "[Buyer Name], did you know you can also sell on Banavoo.in? 🌿"}
              {mailType === "become_seller_nudge" && "[Buyer Name], your craft deserves its own shop on Banavoo.in 🎨"}
              {mailType === "seller_benefits"     && "Turn your passion into income — sell on Banavoo.in, [Buyer Name] 💰"}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Personal note (optional)</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            rows={2}
            placeholder="e.g. I noticed you've been browsing jewellery — if you make any, I'd love to see your shop!"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 2 — Select Buyers</p>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "no_orders", "has_orders"] as const).map((f) => (
              <button key={f} onClick={() => setBuyerFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${buyerFilter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {f === "all" ? "All Buyers" : f === "no_orders" ? "Never Ordered" : "Has Orders"}
              </button>
            ))}
            <button onClick={fetchBuyers} className="p-1.5 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={13} /></button>
          </div>
        </div>
        {loadingBuyers ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : buyers.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><Users size={32} className="mx-auto mb-2 text-gray-200" /><p className="text-sm">No buyers match this filter</p></div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={selected.size === buyers.length && buyers.length > 0} onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer" />
                <span className="text-xs text-gray-500 font-medium">
                  {selected.size === buyers.length && buyers.length > 0 ? `Deselect all (${buyers.length})` : `Select all ${buyers.length}`}
                </span>
              </label>
              {selected.size > 0 && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{selected.size} selected</span>}
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-3 py-2"></th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Email</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-500">Orders</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {buyers.map((buyer) => (
                    <tr key={buyer._id} onClick={() => toggleBuyer(buyer._id)}
                      className={`cursor-pointer transition-colors ${selected.has(buyer._id) ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={selected.has(buyer._id)} onChange={() => toggleBuyer(buyer._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer" />
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-800">{buyer.name}</td>
                      <td className="px-3 py-2 text-gray-500">{buyer.email}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${buyer.orderCount === 0 ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-amber-700"}`}>{buyer.orderCount}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-400">{fmtDate(buyer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Step 3 — Send Email</p>
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1">
          <div className="flex justify-between text-xs"><span className="text-gray-500">Email type</span><span className="font-semibold text-gray-800">{chosenMailType.icon} {chosenMailType.label}</span></div>
          <div className="flex justify-between text-xs"><span className="text-gray-500">Recipients</span><span className="font-semibold text-gray-800">{selected.size} buyer{selected.size !== 1 ? "s" : ""}</span></div>
          <div className="flex justify-between text-xs"><span className="text-gray-500">Personal note</span><span className="font-semibold text-gray-800">{customNote.trim() ? "Yes" : "No"}</span></div>
        </div>
        <button onClick={sendMails} disabled={sending || selected.size === 0}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
          {sending ? <><RefreshCw size={15} className="animate-spin" /> Sending…</> : <><Send size={15} /> Send to {selected.size} Buyer{selected.size !== 1 ? "s" : ""}</>}
        </button>
        {result && (
          <div className="mt-4 space-y-2">
            {result.sent.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1.5"><CheckCircle size={13} /> {result.sent.length} sent successfully</p>
                {result.sent.map((s: any) => <p key={s.id} className="text-xs text-gray-700">✓ {s.name} · {s.email}</p>)}
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1.5"><XCircle size={13} /> {result.failed.length} failed</p>
                {result.failed.map((f: any) => <p key={f.id} className="text-xs text-red-600">✗ {f.name || f.id} — {f.reason}</p>)}
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
  { value: "no_products",         label: "Empty Shop",           desc: "Seller registered but added 0 products",                         color: "bg-red-50 text-red-700 border-red-200",       icon: "🏪" },
  { value: "one_product",         label: "Only 1 Product",        desc: "Nudge to add more products for first order",                     color: "bg-amber-50 text-amber-700 border-amber-200", icon: "📦" },
  { value: "keep_going",          label: "Keep Going",            desc: "Motivational nudge for any seller",                              color: "bg-blue-50 text-blue-700 border-blue-200",    icon: "💪" },
  { value: "share_shop",          label: "Share Shop Link",       desc: "Remind seller to share their shop on social media",              color: "bg-purple-50 text-purple-700 border-purple-200", icon: "🔗" },
  { value: "tips",                label: "5 Tips to First Order", desc: "Actionable tips to get their first sale",                        color: "bg-green-50 text-green-700 border-green-200", icon: "💡" },
  { value: "product_image_issue", label: "Fix Product Photos",    desc: "Ask seller to delete blurry/wrong photos & upload clear images", color: "bg-amber-50 text-amber-700 border-amber-200", icon: "📸" },
];

type AdminSellerWithCount = User & { productCount: number };

// ─── Mail Sellers Panel ───────────────────────────────────────────────────────

function MailSellersPanel() {
  const [sellerFilter,   setSellerFilter]   = useState<"all" | "no_products" | "one_product">("all");
  const [sellers,        setSellers]        = useState<AdminSellerWithCount[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [mailType,       setMailType]       = useState("no_products");
  const [customNote,     setCustomNote]     = useState("");
  const [sending,        setSending]        = useState(false);
  const [result,         setResult]         = useState<{ sent: any[]; failed: any[] } | null>(null);

  const fetchSellers = useCallback(async () => {
    setLoadingSellers(true); setSelected(new Set()); setResult(null);
    try {
      const { data } = await api.get("/admin/sellers", { params: { filter: sellerFilter } });
      setSellers(data.sellers);
    } catch { toast.error("Failed to load sellers"); }
    finally { setLoadingSellers(false); }
  }, [sellerFilter]);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  function toggleSeller(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAll() {
    setSelected(selected.size === sellers.length ? new Set() : new Set(sellers.map((s) => s._id)));
  }

  async function sendMails() {
    if (selected.size === 0) { toast.error("Select at least one seller"); return; }
    if (!confirm(`Send "${MAIL_TYPES.find(m => m.value === mailType)?.label}" email to ${selected.size} seller(s)?`)) return;
    setSending(true); setResult(null);
    try {
      const { data } = await api.post("/admin/mail-sellers", { sellerIds: Array.from(selected), mailType, customNote: customNote.trim() || undefined });
      setResult(data);
      toast.success(`✅ Sent to ${data.sent.length} seller(s)`);
      setSelected(new Set());
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed to send"); }
    finally { setSending(false); }
  }

  const chosenMailType = MAIL_TYPES.find((m) => m.value === mailType)!;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Step 1 — Choose Email Type</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MAIL_TYPES.map((mt) => (
            <button key={mt.value} onClick={() => setMailType(mt.value)}
              className={`text-left rounded-xl border p-3.5 transition-all ${mailType === mt.value ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-emerald-300"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{mt.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{mt.label}</span>
                {mailType === mt.value && <CheckCircle size={14} className="ml-auto text-emerald-600" />}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{mt.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-2">
          <Mail size={13} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email Subject Preview</p>
            <p className="text-xs text-gray-700 font-medium">
              {mailType === "no_products"         && "[Seller Name], your shop is empty — let's fix that 🛍️"}
              {mailType === "one_product"         && "One product is a start, [Seller Name] — here's what happens next 🌱"}
              {mailType === "keep_going"          && "[Seller Name], your Banavoo shop is growing — keep going 💪"}
              {mailType === "share_shop"          && "[Seller Name], have you shared your Banavoo shop link yet? 🔗"}
              {mailType === "tips"                && "5 tips to get your first order on Banavoo.in, [Seller Name] 💡"}
              {mailType === "product_image_issue" && "⚠️ Action Required: Please update product photos on [Shop Name] 📸"}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Personal note / feedback for seller <span className="text-gray-400">(optional)</span></label>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            rows={2}
            placeholder={mailType === "product_image_issue"
              ? "e.g. Please replace the low resolution photos with bright daylight pictures."
              : "e.g. I personally reviewed your shop and think your products are beautiful. Just need more listings!"}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 2 — Select Sellers</p>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "no_products", "one_product"] as const).map((f) => (
              <button key={f} onClick={() => setSellerFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sellerFilter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {f === "all" ? "All Sellers" : f === "no_products" ? "0 Products" : "1 Product"}
              </button>
            ))}
            <button onClick={fetchSellers} className="p-1.5 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={13} /></button>
          </div>
        </div>
        {loadingSellers ? (
          <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><Store size={32} className="mx-auto mb-2 text-gray-200" /><p className="text-sm">No sellers match this filter</p></div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={selected.size === sellers.length && sellers.length > 0} onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer" />
                <span className="text-xs text-gray-500 font-medium">
                  {selected.size === sellers.length && sellers.length > 0 ? `Deselect all (${sellers.length})` : `Select all ${sellers.length}`}
                </span>
              </label>
              {selected.size > 0 && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{selected.size} selected</span>}
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-3 py-2"></th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Shop</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Email</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-500">Products</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sellers.map((seller) => (
                    <tr key={seller._id} onClick={() => toggleSeller(seller._id)}
                      className={`cursor-pointer transition-colors ${selected.has(seller._id) ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={selected.has(seller._id)} onChange={() => toggleSeller(seller._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer" />
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-800">{seller.name}</td>
                      <td className="px-3 py-2 text-gray-500">{seller.sellerProfile?.shopName || "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{seller.email}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${seller.productCount === 0 ? "bg-red-100 text-red-700" : seller.productCount === 1 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          {seller.productCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Step 3 — Send Email</p>
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 space-y-1">
          <div className="flex justify-between text-xs"><span className="text-gray-500">Email type</span><span className="font-semibold text-gray-800">{chosenMailType.icon} {chosenMailType.label}</span></div>
          <div className="flex justify-between text-xs"><span className="text-gray-500">Recipients</span><span className="font-semibold text-gray-800">{selected.size} seller{selected.size !== 1 ? "s" : ""}</span></div>
          <div className="flex justify-between text-xs"><span className="text-gray-500">Personal note</span><span className="font-semibold text-gray-800">{customNote.trim() ? "Yes" : "No"}</span></div>
        </div>
        <button onClick={sendMails} disabled={sending || selected.size === 0}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
          {sending ? <><RefreshCw size={15} className="animate-spin" /> Sending…</> : <><Send size={15} /> Send to {selected.size} Seller{selected.size !== 1 ? "s" : ""}</>}
        </button>
        {result && (
          <div className="mt-4 space-y-2">
            {result.sent.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1.5"><CheckCircle size={13} /> {result.sent.length} sent successfully</p>
                {result.sent.map((s) => <p key={s.id} className="text-xs text-gray-700">✓ {s.name} · {s.email}</p>)}
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1.5"><XCircle size={13} /> {result.failed.length} failed</p>
                {result.failed.map((f) => <p key={f.id} className="text-xs text-red-600">✗ {f.name || f.id} — {f.reason}</p>)}
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
      setPayouts(data.orders); setPage(data.page); setPages(data.pages); setTotal(data.total);
    } catch { toast.error("Failed to load payouts"); }
    finally { setLoading(false); }
  }, [payoutFilter]);

  useEffect(() => { fetchPayouts(1); }, [fetchPayouts]);

  return (
    <div className="space-y-5">
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex gap-3">
        <Banknote size={20} className="text-orange-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-orange-800 mb-0.5">Seller Payouts — Super Admin Control</p>
          <p className="text-xs text-orange-700 leading-relaxed">
            When an online (Razorpay) order is delivered, the buyer&apos;s payment is held by Banavoo.
            Verify delivery and manually release the payout. Seller receives a notification email.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5">
          {(["pending", "released"] as const).map((f) => (
            <button key={f} onClick={() => setPayoutFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${payoutFilter === f ? (f === "pending" ? "bg-orange-500 text-white" : "bg-purple-600 text-white") : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {f === "pending" ? "Payout Pending" : "Payout Released"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">{total} order{total !== 1 ? "s" : ""}</p>
          <button onClick={() => fetchPayouts(1)} className="p-1.5 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={13} /></button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Banknote size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No {payoutFilter === "pending" ? "pending" : "released"} payouts found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Order ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Buyer</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Seller(s)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Amount</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map((o) => {
                const uniqueSellers = Array.from(
                  new Map(o.items.map((i) => [i.seller?._id, i.seller])).values()
                ).filter(Boolean) as AdminSeller[];
                return (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{o.buyer?.name ?? "—"}</p>
                      <p className="text-gray-400">{o.buyer?.email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {uniqueSellers.map((s: any) => <p key={s._id} className="font-semibold text-gray-800">{s.name}</p>)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">
                      ₹{o.itemsTotal?.toLocaleString("en-IN") ?? o.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {o.sellerPaid
                        ? <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">Released</span>
                        : <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">Pending</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!o.sellerPaid && <PayoutReleaseButton order={o} onReleased={() => fetchPayouts(page)} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchPayouts(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PayoutReleaseButton({ order, onReleased }: { order: AdminOrder; onReleased: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  async function release() {
    if (!confirm(`Release payout of ₹${order.itemsTotal?.toLocaleString("en-IN")} for order #${order._id.slice(-8).toUpperCase()}?`)) return;
    setLoading(true);
    try {
      await api.post(`/admin/orders/${order._id}/release-payout`);
      setDone(true);
      toast.success("Payout released — seller notified by email");
      onReleased();
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed to release payout"); }
    finally { setLoading(false); }
  }

  if (done) return <span className="text-xs text-purple-600 font-semibold">Released ✓</span>;
  return (
    <button onClick={release} disabled={loading}
      className="flex items-center gap-1 text-xs font-bold bg-orange-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors">
      {loading ? <RefreshCw size={11} className="animate-spin" /> : <Banknote size={11} />}
      {loading ? "…" : "Release"}
    </button>
  );
}

// ─── Users Panel ──────────────────────────────────────────────────────────────

type AdminUserEntry = {
  _id: string; name: string; email: string; phone?: string;
  isSeller: boolean; role: string; createdAt: string;
  sellerProfile?: { shopName?: string; approved?: boolean };
  orderCount?: number; productCount?: number;
};

function UsersPanel() {
  const [userType,    setUserType]    = useState<"all" | "buyers" | "sellers">("all");
  const [search,      setSearch]      = useState("");
  const [users,       setUsers]       = useState<AdminUserEntry[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [pages,       setPages]       = useState(1);
  const [total,       setTotal]       = useState(0);
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const searchRef     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchUsers = useCallback(async (p = 1, q = search, type = userType) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: p, limit: 25 };
      if (q.trim())       params.search  = q.trim();
      if (type !== "all") params.type    = type;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.users ?? data); setPage(data.page ?? 1); setPages(data.pages ?? 1); setTotal(data.total ?? data.length);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, [search, userType]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  function handleSearchChange(v: string) {
    setSearch(v);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchUsers(1, v, userType), 400);
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex gap-3">
        <Users size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800 mb-0.5">User Management</p>
          <p className="text-xs text-blue-700 leading-relaxed">View all registered users — buyers and sellers. Search by name, email, or phone.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {(["all","buyers","sellers"] as const).map((t) => (
            <button key={t} onClick={() => { setUserType(t); fetchUsers(1, search, t); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${userType === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name / email / phone…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button onClick={() => fetchUsers(1)} className="p-2 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors"><RefreshCw size={13} /></button>
        <span className="text-xs text-gray-400 ml-auto">{total} user{total !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Users size={36} className="mx-auto mb-2 text-gray-200" /><p className="text-sm">No users match</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">User</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 hidden sm:table-cell">Shop / Orders</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Joined</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <React.Fragment key={u._id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${u.isSeller ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                          {u.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 max-w-[140px] truncate">{u.name}</p>
                          {u.role === "admin" && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 max-w-[160px] truncate">{u.email}</p>
                      {u.phone && <p className="text-gray-400 flex items-center gap-1"><Phone size={9} /> {u.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {u.isSeller ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          <Store size={9} /> Seller
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                          <UserCheck size={9} /> Buyer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {u.isSeller && u.sellerProfile?.shopName ? (
                        <p className="font-semibold text-gray-800 max-w-[130px] truncate">{u.sellerProfile.shopName}</p>
                      ) : null}
                      {u.orderCount !== undefined && <p className="text-gray-400">{u.orderCount} order{u.orderCount !== 1 ? "s" : ""}</p>}
                      {u.productCount !== undefined && <p className="text-gray-400">{u.productCount} product{u.productCount !== 1 ? "s" : ""}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a href={`mailto:${u.email}`} title={`Email ${u.name}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                          <Mail size={12} />
                        </a>
                        <button onClick={() => setExpanded(expanded === u._id ? null : u._id)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          {expanded === u._id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === u._id && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div><p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">User ID</p><p className="font-mono text-gray-700">{u._id}</p></div>
                          <div><p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">Email</p><a href={`mailto:${u.email}`} className="text-emerald-600 hover:underline">{u.email}</a></div>
                          {u.phone && <div><p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">Phone</p><a href={`tel:${u.phone}`} className="text-emerald-600 hover:underline">{u.phone}</a></div>}
                          {u.isSeller && <div><p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">Seller Approved</p><p className={u.sellerProfile?.approved ? "text-emerald-600 font-semibold" : "text-orange-500 font-semibold"}>{u.sellerProfile?.approved ? "Yes" : "Pending"}</p></div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchUsers(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Custom Requests Panel ────────────────────────────────────────────────────

type AdminCustomRequest = {
  _id: string; title: string; description: string; budget: number;
  status: string; createdAt: string;
  buyer: { _id: string; name: string; email: string; phone?: string };
  bids: { _id: string; seller: { name: string; email?: string }; price: number; deliveryDays?: number; status: string; note?: string }[];
  category?: string; deadline?: string; buyerPhone?: string;
};

const CR_STATUS_META: Record<string, { label: string; color: string }> = {
  open:      { label: "Open",      color: "bg-emerald-100 text-emerald-700" },
  closed:    { label: "Closed",    color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-purple-100 text-purple-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600" },
};

function CustomRequestsPanel() {
  const [crStatus,   setCrStatus]   = useState<"all" | "open" | "closed" | "completed" | "cancelled">("all");
  const [crSearch,   setCrSearch]   = useState("");
  const [requests,   setRequests]   = useState<AdminCustomRequest[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [total,      setTotal]      = useState(0);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const crSearchRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchRequests = useCallback(async (p = 1, q = crSearch) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: p, limit: 20 };
      if (crStatus !== "all") params.status = crStatus;
      if (q.trim()) params.search = q.trim();
      const { data } = await api.get("/custom-requests", { params });
      setRequests(data.requests ?? data); setPage(data.page ?? 1); setPages(data.pages ?? 1); setTotal(data.total ?? data.length);
    } catch { toast.error("Failed to load custom requests"); }
    finally { setLoading(false); }
  }, [crStatus, crSearch]);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  function handleCrSearchChange(v: string) {
    setCrSearch(v);
    clearTimeout(crSearchRef.current);
    crSearchRef.current = setTimeout(() => fetchRequests(1, v), 400);
  }

  async function adminCancelRequest(id: string, title: string) {
    if (!confirm(`Force-cancel "${title}"? This will notify any bidding sellers.`)) return;
    setCancelling(id);
    try {
      await api.delete(`/custom-requests/admin/${id}`);
      toast.success("Request cancelled");
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: "cancelled" } : r));
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 flex gap-3">
        <ClipboardList size={20} className="text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-purple-800 mb-0.5">Custom Request Management</p>
          <p className="text-xs text-purple-700 leading-relaxed">All buyer custom requests. Monitor bids, force-cancel spam, and track activity.</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {(["all","open","closed","completed","cancelled"] as const).map((s) => (
            <button key={s} onClick={() => setCrStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${crStatus === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Search title or buyer…" value={crSearch}
            onChange={(e) => handleCrSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-500" />
        </div>
        <button onClick={() => fetchRequests(1)} className="p-2 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors"><RefreshCw size={13} /></button>
        <span className="text-xs text-gray-400">{total} request{total !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-400">
          <ClipboardList size={36} className="mx-auto mb-2 text-gray-200" /><p className="text-sm">No custom requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 w-5"></th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Request</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Buyer</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Budget</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500">Bids</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Date</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => {
                const meta = CR_STATUS_META[r.status] || CR_STATUS_META.open;
                const isExpanded = expanded === r._id;
                return (
                  <React.Fragment key={r._id}>
                    <tr className={`hover:bg-gray-50 transition-colors ${r.status === "cancelled" ? "opacity-60" : ""}`}>
                      <td className="pl-3 pr-1 py-3">
                        <button onClick={() => setExpanded(isExpanded ? null : r._id)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors">
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-gray-800 max-w-[180px] truncate">{r.title}</p>
                        {r.category && <p className="text-gray-400">{r.category}</p>}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-gray-800">{r.buyer?.name ?? "—"}</p>
                        <p className="text-gray-400 max-w-[140px] truncate">{r.buyer?.email ?? "—"}</p>
                        {r.buyerPhone && (
                          <a href={`tel:${r.buyerPhone}`} className="text-emerald-600 flex items-center gap-1 hover:underline mt-0.5">
                            <Phone size={9} /> {r.buyerPhone}
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-700">
                        {r.budget ? `₹${Number(r.budget).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${r.bids.length > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{r.bids.length}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                      <td className="px-3 py-3 text-right">
                        {r.status !== "cancelled" && r.status !== "completed" && (
                          <button
                            onClick={() => adminCancelRequest(r._id, r.title)}
                            disabled={cancelling === r._id}
                            className="flex items-center gap-1 text-[11px] font-bold text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto">
                            {cancelling === r._id ? <RefreshCw size={10} className="animate-spin" /> : <XCircle size={10} />}
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                            <div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{r.description}</p>
                              <div className="mt-3 flex flex-wrap gap-3 text-gray-500">
                                {r.deadline && <p>Deadline: <span className="font-semibold text-gray-700">{fmtDate(r.deadline)}</span></p>}
                                {r.buyerPhone && <p>Phone: <a href={`tel:${r.buyerPhone}`} className="font-semibold text-emerald-600 hover:underline">{r.buyerPhone}</a></p>}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bids ({r.bids.length})</p>
                              {r.bids.length === 0 ? <p className="text-gray-400">No bids yet</p> : (
                                <div className="space-y-1.5">
                                  {r.bids.map((b) => (
                                    <div key={b._id} className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <p className="font-semibold text-gray-800">{b.seller?.name || "Unknown"}</p>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-emerald-700">₹{Number(b.price).toLocaleString("en-IN")}</span>
                                          {b.deliveryDays && <span className="text-gray-400">{b.deliveryDays}d</span>}
                                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${b.status === "accepted" ? "bg-emerald-100 text-emerald-700" : b.status === "rejected" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>{b.status}</span>
                                        </div>
                                      </div>
                                      {b.note && <p className="text-gray-500 italic text-[11px]">"{b.note}"</p>}
                                      {b.seller?.email && <a href={`mailto:${b.seller.email}`} className="text-[11px] text-emerald-600 hover:underline">{b.seller.email}</a>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchRequests(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type AdminTab = "orders" | "payouts" | "products" | "users" | "custom_requests" | "mail" | "mail_buyers";

const NAV_ITEMS: { id: AdminTab; label: string; icon: any; badge?: string }[] = [
  { id: "orders",          label: "Orders",           icon: Package },
  { id: "payouts",         label: "Payouts",          icon: Banknote },
  { id: "products",        label: "Product Photos",   icon: Camera },
  { id: "users",           label: "Users",            icon: Users },
  { id: "custom_requests", label: "Custom Requests",  icon: ClipboardList },
  { id: "mail",            label: "Mail Sellers",     icon: Send },
  { id: "mail_buyers",     label: "Mail Buyers",      icon: Mail },
];

export default function AdminPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  const [activeTab,   setActiveTab]   = useState<AdminTab>("orders");
  const [stats,       setStats]       = useState<AdminStats | null>(null);
  const [orders,      setOrders]      = useState<AdminOrder[]>([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [pages,       setPages]       = useState(1);
  const [filter,      setFilter]      = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [unresponded, setUnresponded] = useState(false);
  const [fetching,    setFetching]    = useState(false);
  const [nudgeOrder,  setNudgeOrder]  = useState<AdminOrder | null>(null);

  const [productsList,            setProductsList]            = useState<any[]>([]);
  const [prodPage,                setProdPage]                = useState(1);
  const [prodPages,               setProdPages]               = useState(1);
  const [prodTotal,               setProdTotal]               = useState(0);
  const [prodSearch,              setProdSearch]              = useState("");
  const [prodLoading,             setProdLoading]             = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
  const [productNoticeNote,       setProductNoticeNote]       = useState("");
  const [sendingProductNotice,    setSendingProductNotice]    = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/login?redirect=/admin");
    }
  }, [user, isLoading, router]);

  const fetchStats = useCallback(async () => {
    try { const { data } = await api.get("/admin/stats"); setStats(data); } catch {}
  }, []);

  const fetchOrders = useCallback(async (p = 1) => {
    setFetching(true);
    try {
      const params: Record<string, any> = { page: p, limit: 20 };
      if (filter)           params.status      = filter;
      if (unresponded)      params.unresponded = "true";
      if (orderSearch.trim()) params.search    = orderSearch.trim();
      const { data } = await api.get("/admin/orders", { params });
      setOrders(data.orders); setTotal(data.total); setPage(data.page); setPages(data.pages);
    } catch {}
    finally { setFetching(false); }
  }, [filter, unresponded, orderSearch]);

  const fetchAdminProducts = useCallback(async (p = 1) => {
    setProdLoading(true);
    try {
      const { data } = await api.get("/admin/products", { params: { page: p, limit: 20, search: prodSearch.trim() || undefined } });
      setProductsList(data.products); setProdPage(data.page); setProdPages(data.pages); setProdTotal(data.total);
    } catch { toast.error("Failed to load products"); }
    finally { setProdLoading(false); }
  }, [prodSearch]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchStats(); fetchOrders(1);
  }, [user, fetchStats, fetchOrders]);

  useEffect(() => {
    if (activeTab === "products" && user?.role === "admin") fetchAdminProducts(1);
  }, [activeTab, user, fetchAdminProducts]);

  async function handleSendProductImageNotice() {
    if (!selectedProductForModal) return;
    setSendingProductNotice(true);
    try {
      const { data } = await api.post(`/admin/products/${selectedProductForModal._id}/notify-image-issue`, { note: productNoticeNote.trim() || undefined });
      toast.success(data.message || "Email sent successfully");
      setSelectedProductForModal(null); setProductNoticeNote("");
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to send notice"); }
    finally { setSendingProductNotice(false); }
  }

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gray-900 rounded-lg"><ShieldCheck size={16} className="text-white" /></div>
            <div>
              <span className="text-sm font-extrabold text-gray-900">Super Admin</span>
              <span className="ml-2 text-xs text-gray-400 hidden sm:inline">Banavoo Control Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats && stats.unrespondedOrders > 0 && (
              <button onClick={() => { setActiveTab("orders"); setUnresponded(true); setFilter(""); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                <AlertTriangle size={13} /> {stats.unrespondedOrders} unresponded
              </button>
            )}
            <button onClick={() => { fetchStats(); fetchOrders(1); }}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
            <StatCard label="Orders"    value={stats.totalOrders}       icon={Package} />
            <StatCard label="Pending"   value={stats.pendingOrders}     icon={Clock} />
            <StatCard label=">24h"      value={stats.unrespondedOrders} icon={AlertTriangle} warn={stats.unrespondedOrders > 0} />
            <StatCard label="Delivered" value={stats.deliveredOrders}   icon={CheckCircle} accent />
            <StatCard label="Cancelled" value={stats.cancelledOrders}   icon={XCircle} />
            <StatCard label="Revenue"   value={`₹${(stats.totalRevenue/1000).toFixed(0)}k`} icon={TrendingUp} accent />
            <StatCard label="Users"     value={stats.totalUsers}        icon={Users} />
            <StatCard label="Sellers"   value={stats.totalSellers}      icon={ShoppingBag} />
            <StatCard label="Products"  value={stats.totalProducts}     icon={Package} />
          </div>
        )}

        <div className="flex gap-5">
          {/* Sidebar nav — desktop */}
          <nav className="w-48 shrink-0 hidden md:block">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-20">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold transition-colors border-b border-gray-100 last:border-b-0 text-left ${
                    activeTab === item.id ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <item.icon size={14} className="shrink-0" /> <span className="truncate">{item.label}</span>
                  {item.id === "orders" && stats?.unrespondedOrders ? (
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${activeTab === "orders" ? "bg-white text-red-600" : "bg-red-100 text-red-600"}`}>{stats.unrespondedOrders}</span>
                  ) : item.id === "payouts" && stats?.pendingOrders ? (
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${activeTab === "payouts" ? "bg-white text-orange-600" : "bg-orange-100 text-orange-600"}`}>{stats.pendingOrders}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden w-full mb-4 flex gap-1 overflow-x-auto pb-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === item.id ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>
                <item.icon size={13} /> {item.label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <div>
                {/* Search + status filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 space-y-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by buyer name, email, or order ID…"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") fetchOrders(1); }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <button onClick={() => { setUnresponded(false); setFilter(""); fetchOrders(1); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!unresponded && !filter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      All
                    </button>
                    <button onClick={() => { setUnresponded(true); setFilter(""); fetchOrders(1); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${unresponded ? "bg-red-600 text-white" : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"}`}>
                      <AlertTriangle size={10} /> &gt;24h
                      {stats?.unrespondedOrders ? (
                        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${unresponded ? "bg-white text-red-600" : "bg-red-600 text-white"}`}>{stats.unrespondedOrders}</span>
                      ) : null}
                    </button>
                    {["pending","confirmed","processing","shipped","delivered","cancelled"].map((s) => (
                      <button key={s} onClick={() => { setUnresponded(false); setFilter(s); fetchOrders(1); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!unresponded && filter === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {STATUS_META[s]?.label || s}
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-400">{fetching ? "Loading…" : `${total} order${total !== 1 ? "s" : ""}`}</span>
                      <button onClick={() => fetchOrders(1)} className="p-1.5 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={12} /></button>
                    </div>
                  </div>
                </div>

                {fetching ? (
                  <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-xl border border-gray-200 text-gray-400">
                    <Package size={40} className="mx-auto mb-3 text-gray-200" />
                    No orders match the current filter.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-3 text-left font-semibold text-gray-500">Order</th>
                          <th className="px-3 py-3 text-left font-semibold text-gray-500">Status</th>
                          <th className="px-3 py-3 text-left font-semibold text-gray-500">Buyer</th>
                          <th className="px-3 py-3 text-left font-semibold text-gray-500">Seller(s)</th>
                          <th className="px-3 py-3 text-right font-semibold text-gray-500">Amount</th>
                          <th className="px-3 py-3 text-right font-semibold text-gray-500">Status · Nudge · Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <OrderTableRow key={o._id} order={o} onNudge={setNudgeOrder} onPayoutReleased={() => fetchStats()} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => fetchOrders(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === "users" && <UsersPanel />}

            {/* ── CUSTOM REQUESTS TAB ── */}
            {activeTab === "custom_requests" && <CustomRequestsPanel />}

            {/* ── PAYOUTS TAB ── */}
            {activeTab === "payouts" && <PayoutsPanel />}

            {/* ── PRODUCT PHOTOS TAB ── */}
            {activeTab === "products" && (
              <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex gap-3">
                  <Camera size={22} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-0.5">Product Image Moderation</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Review photos uploaded by sellers. Click <strong>&quot;Fix&quot;</strong> to email a seller about blurry or incorrect images.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input type="text" placeholder="Search by title or category…" value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") fetchAdminProducts(1); }}
                    className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:border-emerald-500" />
                  <button onClick={() => fetchAdminProducts(1)} className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-700 transition-colors shrink-0">Search</button>
                  <button onClick={() => fetchAdminProducts(1)} className="p-2 text-gray-500 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors"><RefreshCw size={13} /></button>
                  <span className="text-xs text-gray-400">{prodTotal} products</span>
                </div>

                {prodLoading ? (
                  <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                ) : productsList.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400">
                    <Camera size={36} className="mx-auto mb-2 text-gray-200" /><p className="text-sm">No products found</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Photos</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Product</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Seller</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Category</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-500">Price</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {productsList.map((prod) => (
                          <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2">
                              <div className="flex gap-1">
                                {prod.images && prod.images.length > 0 ? (
                                  prod.images.slice(0, 4).map((img: any, idx: number) => (
                                    <div key={idx} className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                                      <img src={img.url} alt={`img ${idx+1}`} className="w-full h-full object-cover" />
                                      {img.isMain && <span className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-[8px] font-bold text-center leading-3 py-0.5">✓</span>}
                                    </div>
                                  ))
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                                    <span className="text-red-400 text-[10px] font-bold">0</span>
                                  </div>
                                )}
                                {prod.images && prod.images.length > 4 && (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500">+{prod.images.length - 4}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <p className="font-semibold text-gray-800 max-w-[160px] truncate">{prod.name}</p>
                              <p className="text-gray-400">{prod.images?.length || 0} image{prod.images?.length !== 1 ? "s" : ""}</p>
                            </td>
                            <td className="px-4 py-2">
                              <p className="font-semibold text-gray-800">{prod.seller?.name || "Unknown"}</p>
                              {prod.seller?.sellerProfile?.shopName && <p className="text-gray-400">{prod.seller.sellerProfile.shopName}</p>}
                            </td>
                            <td className="px-4 py-2 text-gray-500">{prod.category}</td>
                            <td className="px-4 py-2 text-right font-bold text-emerald-700">₹{prod.price}</td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a href={`/products/${prod._id}`} target="_blank" rel="noreferrer"
                                  className="p-1.5 text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                  <ExternalLink size={12} />
                                </a>
                                <button onClick={() => { setSelectedProductForModal(prod); setProductNoticeNote(""); }}
                                  className="flex items-center gap-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg transition-colors">
                                  <Mail size={11} /> Fix
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {prodPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: prodPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => fetchAdminProducts(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${prodPage === p ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{p}</button>
                    ))}
                  </div>
                )}

                {selectedProductForModal && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📸</span>
                          <div>
                            <h3 className="text-base font-bold text-gray-900">Send Product Image Issue Email</h3>
                            <p className="text-xs text-gray-500">Alert seller to remove incorrect photos & upload proper images</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedProductForModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                          <XCircle size={18} />
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
                        <p><strong>Product:</strong> {selectedProductForModal.name}</p>
                        <p><strong>Seller:</strong> {selectedProductForModal.seller?.name} ({selectedProductForModal.seller?.email})</p>
                        <p><strong>Shop:</strong> {selectedProductForModal.seller?.sellerProfile?.shopName || "N/A"}</p>
                        <p className="text-emerald-600">✓ Includes direct edit link for seller</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Specific feedback (optional)</label>
                        <textarea rows={3}
                          placeholder="e.g. The first image is very blurry. Please take a photo in natural daylight."
                          value={productNoticeNote}
                          onChange={(e) => setProductNoticeNote(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:border-emerald-500 resize-none" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setSelectedProductForModal(null)}
                          className="flex-1 border border-gray-200 text-gray-500 text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={handleSendProductImageNotice} disabled={sendingProductNotice}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                          {sendingProductNotice ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                          {sendingProductNotice ? "Sending…" : "Send Photo Fix Notice"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MAIL SELLERS TAB ── */}
            {activeTab === "mail" && <MailSellersPanel />}

            {/* ── MAIL BUYERS TAB ── */}
            {activeTab === "mail_buyers" && <MailBuyersPanel />}

          </div>
        </div>
      </div>

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
