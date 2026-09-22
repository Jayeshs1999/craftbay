"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Product, Order, OrderStatus, OrderItem, DeliveryConfig } from "@/types";
import {
  Package, ShoppingBag, Eye, TrendingUp, Plus, Trash2, Pencil,
  Truck, CheckCircle, X, Phone, MapPin, User as UserIcon,
  ClipboardList, Clock, XCircle, ChevronDown, ChevronUp,
  Hash, AlertCircle, StoreIcon, Settings,
} from "lucide-react";
import Button from "@/components/Button";
import { useRequireAuth } from "@/utils/useRequireAuth";
import toast from "react-hot-toast";

type Tab = "overview" | "products" | "orders" | "settings";

/** Buyer is populated by the API with name/email/phone */
interface PopulatedBuyer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

/** OrderItem with image always present (as returned by API) */
type PopulatedOrderItem = OrderItem & { image?: string };

// ─── status config ──────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  processing:       "Processing",
  shipped:          "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
  return_requested: "Return Requested",
  returned:         "Returned",
};
const STATUS_COLORS: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-blue-100 text-blue-700",
  processing:       "bg-orange-100 text-orange-700",
  shipped:          "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-600",
  return_requested: "bg-pink-100 text-pink-700",
  returned:         "bg-gray-200 text-gray-600",
};

// ─── Order Detail Modal ─────────────────────────────────────────────────────
interface OrderModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string, opts?: { trackingNumber?: string; courier?: string; note?: string }) => Promise<void>;
}

function OrderDetailModal({ order, onClose, onStatusUpdate }: OrderModalProps) {
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [courier, setCourier]               = useState(order.courier || "");
  const [rejectReason, setRejectReason]     = useState("");
  const [showReject, setShowReject]         = useState(false);
  const [loading, setLoading]               = useState(false);
  const [historyOpen, setHistoryOpen]       = useState(false);

  const buyer     = order.buyer as PopulatedBuyer;
  const addr      = order.shippingAddress;
  const isPickup  = order.deliveryMode === "pickup";

  const canConfirm  = order.orderStatus === "pending";
  const canProcess  = order.orderStatus === "confirmed";
  const canShip     = order.orderStatus === "processing";
  const canDeliver  = order.orderStatus === "shipped" || order.orderStatus === "out_for_delivery";
  const canReject   = !["delivered","cancelled","returned"].includes(order.orderStatus);

  async function handle(status: string, opts?: { trackingNumber?: string; courier?: string; note?: string }) {
    setLoading(true);
    try { await onStatusUpdate(order._id, status, opts); onClose(); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#e7e5e4] sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <p className="font-bold text-[#1c1917] text-base">Order #{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-[#78716c]">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              &nbsp;·&nbsp;
              {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#f5f5f4] text-[#78716c] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={"text-sm px-3 py-1 rounded-full font-semibold capitalize " + (STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600")}>
              {STATUS_LABELS[order.orderStatus] || order.orderStatus}
            </span>
            {isPickup && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700">
                <StoreIcon size={11} /> Local Pickup
              </span>
            )}
            <span className="text-xs text-[#78716c]">
              {isPickup ? "Pay at Pickup" : order.paymentMethod.toUpperCase()} · {order.paymentStatus}
            </span>
          </div>

          {/* Buyer Details */}
          <div className="bg-[#f7f8fa] rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1">Buyer Details</p>
            <div className="flex items-center gap-2 text-sm text-[#1c1917]">
              <UserIcon size={14} className="text-[#059669] shrink-0" />
              <span className="font-medium">{buyer?.name || "—"}</span>
            </div>
            {buyer?.email && (
              <div className="flex items-center gap-2 text-sm text-[#57534e]">
                <span className="w-3.5 h-3.5 shrink-0" />
                <span>{buyer.email}</span>
              </div>
            )}
            {buyer?.phone && (
              <div className="flex items-center gap-2 text-sm text-[#1c1917]">
                <Phone size={14} className="text-[#059669] shrink-0" />
                <a href={`tel:${buyer.phone}`} className="font-semibold hover:text-[#059669] transition-colors">
                  {buyer.phone}
                </a>
              </div>
            )}
          </div>

          {/* Shipping Address / Pickup Contact */}
          {isPickup ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <StoreIcon size={12} /> Pickup — Buyer Contact
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                The buyer will collect from your location. Contact them to arrange a time.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#1c1917]">
                <UserIcon size={14} className="text-amber-600 shrink-0" />
                <span className="font-medium">{addr.fullName}</span>
              </div>
              {addr.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-amber-600 shrink-0" />
                  <a href={`tel:${addr.phone}`} className="font-semibold text-amber-700 hover:underline">
                    {addr.phone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#f7f8fa] rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-2">Delivery Address</p>
              <div className="flex gap-2">
                <MapPin size={14} className="text-[#059669] shrink-0 mt-0.5" />
                <div className="text-sm text-[#1c1917] leading-relaxed">
                  <p className="font-semibold">{addr.fullName}</p>
                  {addr.phone && (
                    <a href={`tel:${addr.phone}`} className="flex items-center gap-1 text-[#059669] font-medium hover:underline mt-0.5">
                      <Phone size={12} /> {addr.phone}
                    </a>
                  )}
                  <p className="text-[#57534e] mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  <p className="text-[#57534e]">{addr.city}, {addr.state} – {addr.pincode}</p>
                  <p className="text-[#57534e]">{addr.country || "India"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-2">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <Link
                  key={i}
                  href={`/products/${typeof item.product === "string" ? item.product : (item.product as unknown as { _id: string })?._id ?? ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#f7f8fa] hover:bg-[#ecfdf5] rounded-xl p-3 transition-colors group"
                >
                  {(item as PopulatedOrderItem).image && (
                    <img src={(item as PopulatedOrderItem).image} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#e7e5e4]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1c1917] group-hover:text-[#059669] truncate transition-colors">{item.name}</p>
                    {item.variant && <p className="text-xs text-[#78716c]">{item.variant}</p>}
                    {item.customizationRequirement && (
                      <p className="text-xs text-[#d97706] mt-0.5 truncate">
                        Custom: {item.customizationRequirement}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#1c1917]">×{item.quantity}</p>
                    <p className="text-xs text-[#059669]">Rs.{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Customisation Requirements (if any items have them) */}
          {order.items.some((item) => item.customizationRequirement) && (
            <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#92400e] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                Customisation Requirements
              </p>
              <div className="space-y-3">
                {order.items.filter((item) => item.customizationRequirement).map((item, i) => (
                  <div key={i}>
                    <p className="text-xs font-medium text-[#78716c] mb-1">{item.name}</p>
                    <p className="text-sm text-[#1c1917] whitespace-pre-wrap bg-white rounded-lg px-3 py-2 border border-[#fcd34d]">
                      {item.customizationRequirement}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#78716c] mt-3">
                Contact the buyer to confirm details before starting work.
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-[#ecfdf5] rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-[#57534e]">
              <span>Items total</span>
              <span>Rs.{order.itemsTotal.toLocaleString("en-IN")}</span>
            </div>
            {order.shippingCharge > 0 && (
              <div className="flex justify-between text-[#57534e]">
                <span>Shipping</span>
                <span>Rs.{order.shippingCharge.toLocaleString("en-IN")}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>–Rs.{order.discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#1c1917] border-t border-[#d1fae5] pt-1.5 mt-1">
              <span>Total</span>
              <span>Rs.{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Tracking fields (shown when shipping — not for pickup) */}
          {canShip && !isPickup && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wide">Shipping Info (optional)</p>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number"
                className="w-full border border-[#e7e5e4] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
              />
              <input
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="Courier name (e.g. Delhivery, BlueDart)"
                className="w-full border border-[#e7e5e4] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
              />
            </div>
          )}

          {/* Existing tracking info */}
          {order.trackingNumber && !canShip && !isPickup && (
            <div className="bg-purple-50 rounded-xl p-3 text-sm">
              <div className="flex items-center gap-2 text-purple-700 font-medium">
                <Hash size={13} /> Tracking: {order.trackingNumber}
              </div>
              {order.courier && <p className="text-purple-600 mt-0.5 ml-5">{order.courier}</p>}
            </div>
          )}

          {/* Pickup ready banner (shown when processing & pickup) */}
          {canShip && isPickup && (
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <StoreIcon size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Once you click <strong>Ready for Pickup</strong>, the buyer will be notified to come collect.
              </p>
            </div>
          )}

          {/* Reject / Reason */}
          {showReject && (
            <div className="border border-red-200 rounded-xl p-4 space-y-2 bg-red-50">
              <p className="text-sm font-medium text-red-700 flex items-center gap-1.5">
                <AlertCircle size={14} /> Provide a reason for rejection
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Out of stock, unable to ship to this location, buyer unresponsive…"
                className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none bg-white"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowReject(false)}
                  className="text-xs px-3 py-1.5 border border-[#e7e5e4] rounded-lg text-[#78716c] hover:bg-white transition-colors">
                  Cancel
                </button>
                <button
                  disabled={!rejectReason.trim() || loading}
                  onClick={() => handle("cancelled", { note: rejectReason })}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Status History */}
          <div>
            <button onClick={() => setHistoryOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-[#78716c] hover:text-[#1c1917] transition-colors">
              <ClipboardList size={13} />
              Status History
              {historyOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {historyOpen && (
              <div className="mt-2 space-y-1.5 border-l-2 border-[#e7e5e4] pl-3 ml-1.5">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="text-xs">
                    <span className={"inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mr-1.5 " + (STATUS_COLORS[h.status] || "bg-gray-100 text-gray-600")}>
                      {STATUS_LABELS[h.status] || h.status}
                    </span>
                    <span className="text-[#78716c]">{new Date(h.timestamp).toLocaleString("en-IN")}</span>
                    {h.note && <p className="text-[#57534e] mt-0.5 italic">{h.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 pb-6 pt-2 flex flex-wrap gap-2 border-t border-[#e7e5e4] sticky bottom-0 bg-white rounded-b-2xl">
          {canConfirm && (
            <button disabled={loading} onClick={() => handle("confirmed")}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <CheckCircle size={14} /> Accept & Confirm
            </button>
          )}
          {canProcess && (
            <button disabled={loading} onClick={() => handle("processing")}
              className="flex items-center gap-1.5 text-sm bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors">
              <Package size={14} /> Mark Processing
            </button>
          )}
          {canShip && (
            isPickup ? (
              <button disabled={loading}
                onClick={() => handle("shipped", { note: "Order ready for pickup" })}
                className="flex items-center gap-1.5 text-sm bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors">
                <StoreIcon size={14} /> Ready for Pickup
              </button>
            ) : (
              <button disabled={loading}
                onClick={() => handle("shipped", { trackingNumber: trackingNumber || undefined, courier: courier || undefined })}
                className="flex items-center gap-1.5 text-sm bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
                <Truck size={14} /> Mark Shipped
              </button>
            )
          )}
          {canDeliver && (
            <button disabled={loading} onClick={() => handle("delivered")}
              className="flex items-center gap-1.5 text-sm bg-[#059669] text-white px-4 py-2 rounded-xl hover:bg-[#047857] disabled:opacity-50 transition-colors">
              <CheckCircle size={14} /> {isPickup ? "Mark Collected" : "Mark Delivered"}
            </button>
          )}
          {canReject && !showReject && (
            <button onClick={() => setShowReject(true)}
              className="flex items-center gap-1.5 text-sm border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
              <XCircle size={14} /> Reject Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function SellerDashboardPage() {
  const { user, isLoading } = useRequireAuth("/login");
  const router = useRouter();

  const [tab,      setTab]      = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [stats,    setStats]    = useState({ totalProducts: 0, activeProducts: 0, totalOrders: 0, pendingOrders: 0 });
  const [loading,  setLoading]  = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // ── Delivery config state ───────────────────────────────────────────────────
  const DEFAULT_DELIVERY_CFG: DeliveryConfig = {
    selfShipEnabled: true,
    pickupEnabled: true,
    banavooShipEnabled: true,
    freeShippingAbove: 0,
    localCharge: 10,
    regionalCharge: 10,
    nationalCharge: 10,
    codEnabled: true,
    codExtraCharge: 30,
    estimatedDaysLocal: 2,
    estimatedDaysRegional: 4,
    estimatedDaysNational: 7,
    deliveryNote: "",
  };
  const [deliveryCfg,     setDeliveryCfg]     = useState<DeliveryConfig>(DEFAULT_DELIVERY_CFG);
  const [cfgLoading,      setCfgLoading]      = useState(false);
  const [cfgSaving,       setCfgSaving]       = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [prRes, orRes] = await Promise.all([
        api.get("/products/my", { params: { limit: 50 } }),
        api.get("/orders/seller", { params: { limit: 50 } }),
      ]);
      setProducts(prRes.data.products);
      setOrders(orRes.data.orders);
      setStats({
        totalProducts:  prRes.data.total,
        activeProducts: prRes.data.products.filter((p: Product) => p.isActive).length,
        totalOrders:    orRes.data.total,
        pendingOrders:  orRes.data.orders.filter((o: Order) =>
          ["pending","confirmed","processing"].includes(o.orderStatus)).length,
      });
    } catch { } finally { setLoading(false); }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (!user.isSeller) { router.push("/become-seller"); return; }
    loadData();
  }, [user, isLoading]);

  async function toggleActive(id: string, current: boolean) {
    try {
      await api.put("/products/" + id, { isActive: !current });
      setProducts((ps) => ps.map((p) => p._id === id ? { ...p, isActive: !current } : p));
    } catch { }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Remove this product?")) return;
    try {
      await api.delete("/products/" + id);
      setProducts((ps) => ps.filter((p) => p._id !== id));
    } catch { }
  }

  async function updateOrderStatus(id: string, status: string, opts?: { trackingNumber?: string; courier?: string; note?: string }) {
    await api.put("/orders/" + id + "/status", { status, ...opts });
    setOrders((os) => os.map((o) => o._id === id ? {
      ...o,
      orderStatus: status as OrderStatus,
      trackingNumber: opts?.trackingNumber || o.trackingNumber,
      courier: opts?.courier || o.courier,
    } : o));
    // Also update stats
    setStats((s) => ({
      ...s,
      pendingOrders: orders.filter((o) =>
        (o._id === id ? status : o.orderStatus) &&
        ["pending","confirmed","processing"].includes(o._id === id ? status : o.orderStatus)
      ).length,
    }));
  }

  async function loadDeliveryConfig() {
    setCfgLoading(true);
    try {
      const { data } = await api.get("/sellers/delivery-config");
      setDeliveryCfg(data);
    } catch { } finally { setCfgLoading(false); }
  }

  async function saveDeliveryConfig(e: React.FormEvent) {
    e.preventDefault();
    setCfgSaving(true);
    try {
      const { data } = await api.put("/sellers/delivery-config", deliveryCfg);
      setDeliveryCfg(data);
      toast.success("Delivery settings saved!");
    } catch {
      toast.error("Failed to save delivery settings.");
    } finally { setCfgSaving(false); }
  }

  // Load delivery config when switching to settings tab
  useEffect(() => {
    if (tab === "settings" && !cfgLoading) loadDeliveryConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter((o) => o.orderStatus === orderFilter);

  const ORDER_FILTER_OPTIONS = [
    { value: "all",        label: "All" },
    { value: "pending",    label: "Pending" },
    { value: "confirmed",  label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped",    label: "Shipped" },
    { value: "delivered",  label: "Delivered" },
    { value: "cancelled",  label: "Cancelled" },
  ];

  const STAT_CARDS = [
    { label: "Total Products",  value: stats.totalProducts,  icon: Package,     color: "text-[#059669] bg-[#ecfdf5]" },
    { label: "Active Listings", value: stats.activeProducts, icon: Eye,         color: "text-green-700 bg-green-50" },
    { label: "Total Orders",    value: stats.totalOrders,    icon: ShoppingBag, color: "text-blue-700 bg-blue-50" },
    { label: "Pending Orders",  value: stats.pendingOrders,  icon: TrendingUp,  color: "text-amber-700 bg-amber-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Home
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1917]">Seller Dashboard</h1>
          <p className="text-[#78716c] text-sm">{user?.sellerProfile?.shopName}</p>
        </div>
        <Link href="/seller/new-product">
          <Button><Plus size={16} /> Add Product</Button>
        </Link>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-[#e7e5e4] mb-8 overflow-x-auto">
        {(["overview","products","orders","settings"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-5 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors whitespace-nowrap " +
              (tab === t ? "border-[#059669] text-[#059669]" : "border-transparent text-[#78716c] hover:text-[#1c1917]")}>
            {t === "settings" ? (
              <span className="flex items-center gap-1.5"><Settings size={13} />Settings</span>
            ) : t}
            {t === "orders" && stats.pendingOrders > 0 && (
              <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                {stats.pendingOrders}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + color}>
                      <Icon size={18} />
                    </div>
                    <p className="text-2xl font-extrabold text-[#1c1917]">{value}</p>
                    <p className="text-xs text-[#78716c] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#ecfdf5] rounded-2xl p-6 border border-[#fcd9b0]">
                <h3 className="font-bold text-[#1c1917] mb-3">Seller Tips</h3>
                <ul className="space-y-2 text-sm text-[#57534e]">
                  <li>Use clear, well-lit photos — products with 4+ images sell 3×better</li>
                  <li>Write a detailed description with materials, size, and care instructions</li>
                  <li>Keep your stock count up-to-date to avoid failed orders</li>
                  <li>Respond to new orders within 24 hours to maintain a high seller rating</li>
                </ul>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={48} className="text-[#e7e5e4] mx-auto mb-3" />
                  <p className="text-[#78716c] mb-4">No products yet</p>
                  <Link href="/seller/new-product"><Button>Add Your First Product</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => {
                    const img = product.images.find((i) => i.isMain)?.url || product.images[0]?.url;
                    return (
                      <div key={product._id} className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f4] shrink-0">
                          {img && <img src={img} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#1c1917] text-sm">{product.name}</p>
                              <p className="text-xs text-[#78716c]">{product.category} — Stock: {product.stock}</p>
                            </div>
                            <span className={"text-xs px-2 py-0.5 rounded-full font-medium " +
                              (product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-[#059669]">Rs.{product.price.toLocaleString("en-IN")}</span>
                            <div className="flex gap-2">
                              <Link href={`/seller/edit-product/${product._id}`}
                                className="p-1.5 rounded-lg border border-[#e7e5e4] hover:bg-[#ecfdf5] hover:border-[#059669] text-[#78716c] hover:text-[#059669] transition-colors">
                                <Pencil size={13} />
                              </Link>
                              <button
                                onClick={() => toggleActive(product._id, product.isActive)}
                                className="text-xs px-2.5 py-1 border border-[#e7e5e4] rounded-lg hover:bg-[#ecfdf5] text-[#78716c] transition-colors">
                                {product.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-400 transition-colors"
                                onClick={() => deleteProduct(product._id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {tab === "orders" && (
            <div>
              {/* Filter bar */}
              <div className="flex flex-wrap gap-2 mb-5">
                {ORDER_FILTER_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setOrderFilter(opt.value)}
                    className={"text-xs px-3 py-1.5 rounded-full border font-medium transition-colors " +
                      (orderFilter === opt.value
                        ? "bg-[#059669] text-white border-[#059669]"
                        : "border-[#e7e5e4] text-[#78716c] hover:border-[#059669] hover:text-[#059669]")}>
                    {opt.label}
                    {opt.value !== "all" && (
                      <span className="ml-1 opacity-70">
                        ({orders.filter((o) => o.orderStatus === opt.value).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="text-[#e7e5e4] mx-auto mb-3" />
                  <p className="text-[#78716c]">No orders {orderFilter !== "all" ? `with status "${orderFilter}"` : "yet"}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const buyer = order.buyer as PopulatedBuyer;
                    const addr  = order.shippingAddress;
                    const canAct = !["delivered","cancelled","returned"].includes(order.orderStatus);

                    return (
                      <div key={order._id}
                        className="bg-white rounded-2xl border border-[#e7e5e4] p-5 hover:border-[#059669]/30 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => setSelectedOrder(order)}>

                        {/* Top row */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-bold text-sm text-[#1c1917]">#{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-[#78716c] flex items-center gap-1 mt-0.5">
                              <Clock size={11} />
                              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <span className={"text-xs px-2.5 py-1 rounded-full font-semibold capitalize " + (STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600")}>
                            {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                          </span>
                        </div>

                        {/* Buyer quick info */}
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs text-[#57534e]">
                            <UserIcon size={12} className="text-[#059669]" />
                            <span className="font-medium">{buyer?.name || "—"}</span>
                          </div>
                          {addr.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-[#57534e]">
                              <Phone size={12} className="text-[#059669]" />
                              <span className="font-medium">{addr.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-[#57534e]">
                            <MapPin size={12} className="text-[#059669]" />
                            <span>{addr.city}, {addr.state} – {addr.pincode}</span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {order.items.map((item, i) => (
                            <Link
                              key={i}
                              href={`/products/${typeof item.product === "string" ? item.product : (item.product as unknown as { _id: string })?._id ?? ""}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 bg-[#f5f5f4] hover:bg-[#ecfdf5] hover:border-[#059669] border border-transparent rounded-xl p-1.5 pr-3 transition-all group"
                            >
                              {(item as PopulatedOrderItem).image && (
                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-[#e7e5e4]">
                                  <img
                                    src={(item as PopulatedOrderItem).image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span className="text-xs font-medium text-[#57534e] group-hover:text-[#059669] transition-colors">
                                {item.name} ×{item.quantity}
                              </span>
                            </Link>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#f5f5f4]">
                          <span className="font-bold text-[#059669] text-sm">Rs.{order.totalAmount.toLocaleString("en-IN")}</span>
                          <div className="flex items-center gap-2">
                            {canAct && (
                              <span className="text-xs text-[#059669] font-medium bg-[#ecfdf5] px-2.5 py-1 rounded-lg">
                                Action needed
                              </span>
                            )}
                            <span className="text-xs text-[#78716c] underline underline-offset-2">View details →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS — Delivery Configuration */}
          {tab === "settings" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-[#1c1917] mb-1 flex items-center gap-2">
                <Settings size={18} className="text-[#059669]" /> Delivery Settings
              </h2>
              <p className="text-sm text-[#78716c] mb-6">
                Control which delivery methods buyers can choose at checkout, and configure shipping charges.
              </p>

              {cfgLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                </div>
              ) : (
                <form onSubmit={saveDeliveryConfig} className="space-y-6">

                  {/* ── Delivery Method Toggles ── */}
                  <div className="bg-white border border-[#e7e5e4] rounded-2xl p-5 space-y-4">
                    <h3 className="font-semibold text-sm text-[#1c1917] flex items-center gap-2">
                      <Truck size={15} className="text-[#059669]" /> Available Delivery Methods
                    </h3>
                    <p className="text-xs text-[#78716c] -mt-1">
                      At least one method must remain enabled. Disabled methods won&apos;t appear at buyer checkout.
                    </p>
                    {(() => {
                      // Only count real (non-coming-soon) methods for the minimum-1 guard
                      const enabledCount = [deliveryCfg.selfShipEnabled, deliveryCfg.pickupEnabled].filter(Boolean).length;
                      const methods: { key: keyof DeliveryConfig; label: string; desc: string; comingSoon?: boolean }[] = [
                        { key: "selfShipEnabled",    label: "Seller Ships",     desc: "You ship via your own courier. Charges configured below." },
                        { key: "pickupEnabled",      label: "Local Pickup",     desc: "Buyer collects from your location. No shipping charge." },
                        { key: "banavooShipEnabled", label: "Banavoo Express",  desc: "Managed shipping via Banavoo.in — end-to-end fulfilment.", comingSoon: true },
                      ];
                      return (
                        <div className="space-y-3">
                          {methods.map(({ key, label, desc, comingSoon }) => {
                            const isOn = deliveryCfg[key] as boolean;
                            const isLastEnabled = enabledCount === 1 && isOn && !comingSoon;
                            return (
                              <div key={key} className={"flex items-start justify-between gap-4 p-3.5 rounded-xl border transition-colors " +
                                (isOn ? "border-[#059669] bg-[#ecfdf5]" : "border-[#e7e5e4] bg-white")}>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-[#1c1917]">{label}</span>
                                    {comingSoon && (
                                      <span className="text-[10px] font-medium bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded-md">Coming Soon</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#78716c] mt-0.5">{desc}</p>
                                  {isLastEnabled && (
                                    <p className="text-xs text-amber-600 mt-1">⚠ Must keep at least one method enabled</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  disabled={isLastEnabled || comingSoon}
                                  onClick={() => !isLastEnabled && !comingSoon && setDeliveryCfg((c) => ({ ...c, [key]: !isOn }))}
                                  title={comingSoon ? "Not available yet" : isLastEnabled ? "Cannot disable — last active method" : undefined}
                                  className={"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none " +
                                    (comingSoon || isLastEnabled ? "opacity-40 cursor-not-allowed " : "") +
                                    (isOn ? "bg-[#059669]" : "bg-[#d1d5db]")}>
                                  <span className={"pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform " +
                                    (isOn ? "translate-x-5" : "translate-x-0")} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Delivery charges by zone */}
                  <div className="bg-white border border-[#e7e5e4] rounded-2xl p-5 space-y-4">
                    <h3 className="font-semibold text-sm text-[#1c1917] flex items-center gap-2">
                      <Truck size={15} className="text-[#059669]" /> Delivery Charges by Zone
                    </h3>
                    <p className="text-xs text-[#78716c] -mt-1">
                      Zone is determined by comparing buyer&apos;s city/state to your shop location.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { key: "localCharge",    label: "Same City (Local)", days: "estimatedDaysLocal",    daysLabel: "Est. days" },
                        { key: "regionalCharge", label: "Same State (Regional)", days: "estimatedDaysRegional", daysLabel: "Est. days" },
                        { key: "nationalCharge", label: "Other States (National)", days: "estimatedDaysNational", daysLabel: "Est. days" },
                      ].map(({ key, label, days, daysLabel }) => (
                        <div key={key} className="space-y-2">
                          <label className="text-xs font-medium text-[#57534e]">{label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#78716c]">Rs.</span>
                            <input
                              type="number" min={0} max={9999}
                              value={deliveryCfg[key as keyof DeliveryConfig] as number}
                              onChange={(e) => setDeliveryCfg((c) => ({ ...c, [key]: Number(e.target.value) }))}
                              className="w-full rounded-xl border border-[#e7e5e4] pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min={1} max={30}
                              value={deliveryCfg[days as keyof DeliveryConfig] as number}
                              onChange={(e) => setDeliveryCfg((c) => ({ ...c, [days]: Number(e.target.value) }))}
                              className="w-16 rounded-xl border border-[#e7e5e4] px-2 py-1.5 text-xs focus:outline-none focus:border-[#059669]"
                            />
                            <span className="text-xs text-[#78716c]">{daysLabel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Free shipping threshold */}
                  <div className="bg-white border border-[#e7e5e4] rounded-2xl p-5 space-y-3">
                    <h3 className="font-semibold text-sm text-[#1c1917]">Free Shipping Threshold</h3>
                    <p className="text-xs text-[#78716c]">
                      Orders at or above this amount get free shipping. Set to <span className="font-medium">0</span> to never offer free shipping.
                    </p>
                    <div className="flex items-center gap-3 max-w-xs">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#78716c]">Rs.</span>
                        <input
                          type="number" min={0} max={99999}
                          value={deliveryCfg.freeShippingAbove}
                          onChange={(e) => setDeliveryCfg((c) => ({ ...c, freeShippingAbove: Number(e.target.value) }))}
                          className="w-full rounded-xl border border-[#e7e5e4] pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
                          placeholder="0"
                        />
                      </div>
                      {deliveryCfg.freeShippingAbove > 0 && (
                        <span className="text-xs text-[#059669] font-medium bg-[#ecfdf5] px-2.5 py-1 rounded-lg">
                          Free above Rs.{deliveryCfg.freeShippingAbove.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* COD settings */}
                  <div className="bg-white border border-[#e7e5e4] rounded-2xl p-5 space-y-3">
                    <h3 className="font-semibold text-sm text-[#1c1917]">Cash on Delivery (COD)</h3>
                    <label className="text-xs font-medium text-[#57534e]">COD Handling Charge</label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#78716c]">Rs.</span>
                      <input
                        type="number" min={0} max={999}
                        value={deliveryCfg.codExtraCharge}
                        onChange={(e) => setDeliveryCfg((c) => ({ ...c, codExtraCharge: Number(e.target.value) }))}
                        className="w-full rounded-xl border border-[#e7e5e4] pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <p className="text-xs text-[#78716c]">Extra charge added to COD orders to cover cash-collection costs. Set to 0 for no COD charge.</p>
                  </div>

                  {/* Delivery note */}
                  <div className="bg-white border border-[#e7e5e4] rounded-2xl p-5 space-y-3">
                    <h3 className="font-semibold text-sm text-[#1c1917]">Delivery Note (shown to buyer at checkout)</h3>
                    <textarea
                      rows={3}
                      maxLength={300}
                      value={deliveryCfg.deliveryNote}
                      onChange={(e) => setDeliveryCfg((c) => ({ ...c, deliveryNote: e.target.value }))}
                      placeholder="e.g. We ship every Monday and Thursday. Fragile items packed with extra care."
                      className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669] resize-none"
                    />
                    <p className="text-xs text-[#78716c] text-right">{deliveryCfg.deliveryNote.length}/300</p>
                  </div>

                  <Button type="submit" loading={cfgSaving} size="lg">
                    Save Delivery Settings
                  </Button>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={async (id, status, opts) => {
            await updateOrderStatus(id, status, opts);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
