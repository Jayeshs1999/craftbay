"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Order, User } from "@/types";
import {
  Package, Users, ShoppingBag, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Clock, Truck, Bell, Eye, ChevronDown,
  ChevronUp, Phone, Mail, RefreshCw,
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
  order, onNudge,
}: {
  order: AdminOrder; onNudge: (o: AdminOrder) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [statusValue, setStatusValue] = useState(order.orderStatus);
  const [updating, setUpdating] = useState(false);

  const meta = STATUS_META[order.orderStatus] || STATUS_META.pending;
  const age  = hoursAgo(order.createdAt);
  const isUnresponded = ["pending", "confirmed"].includes(order.orderStatus) && age >= 24;

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
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

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
            <p className="text-sm text-[#78716c] mt-0.5">Full order tracking · Buyer–Seller visibility · Seller nudge</p>
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
            <OrderRow key={o._id} order={o} onNudge={setNudgeOrder} />
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
