"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/services/api";
import { Order, Product } from "@/types";
import { Package, Truck, CheckCircle, XCircle, Clock, ShoppingBag, Settings2 } from "lucide-react";
import Button from "@/components/Button";
import { useRequireAuth } from "@/utils/useRequireAuth";

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pending:          { label: "Pending",          color: "bg-yellow-100 text-yellow-700", icon: Clock },
  confirmed:        { label: "Confirmed",        color: "bg-blue-100 text-blue-700",    icon: CheckCircle },
  processing:       { label: "Processing",       color: "bg-orange-100 text-orange-700",icon: Package },
  shipped:          { label: "Shipped",          color: "bg-purple-100 text-purple-700",icon: Truck },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-100 text-indigo-700",icon: Truck },
  delivered:        { label: "Delivered",        color: "bg-green-100 text-green-700",  icon: CheckCircle },
  cancelled:        { label: "Cancelled",        color: "bg-red-100 text-red-600",      icon: XCircle },
  return_requested: { label: "Return Requested", color: "bg-pink-100 text-pink-700",    icon: XCircle },
  returned:         { label: "Returned",         color: "bg-gray-100 text-gray-600",    icon: XCircle },
};

const FILTERS = [
  { v: "",          l: "All" },
  { v: "pending",   l: "Pending" },
  { v: "shipped",   l: "Shipped" },
  { v: "delivered", l: "Delivered" },
  { v: "cancelled", l: "Cancelled" },
];

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth("/login?redirect=/dashboard");

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [fetching, setFetching] = useState(false);
  const [filter,  setFilter]  = useState("");
  // Track whether we have already fetched for this filter value
  const fetchedFilter = useRef<string | null>(null);

  // Fetch orders only when user is confirmed present AND filter changes
  useEffect(() => {
    if (!user) return;                          // wait for auth
    if (fetchedFilter.current === filter) return; // already fetched this filter
    fetchedFilter.current = filter;

    let cancelled = false;
    (async () => {
      setFetching(true);
      try {
        const params: Record<string, string> = {};
        if (filter) params.status = filter;
        const { data } = await api.get("/orders/my", { params });
        if (!cancelled) setOrders(data.orders);
      } catch { }
      finally { if (!cancelled) setFetching(false); }
    })();

    return () => { cancelled = true; };
  }, [user, filter]);

  // Reset fetched-filter cache when filter changes so next effect run re-fetches
  const handleFilterChange = (v: string) => {
    fetchedFilter.current = null;
    setFilter(v);
  };

  async function cancelOrder(id: string) {
    if (!confirm("Cancel this order?")) return;
    try {
      await api.put("/orders/" + id + "/cancel", { reason: "Buyer cancelled" });
      setOrders((os) =>
        os.map((o) => o._id === id ? { ...o, orderStatus: "cancelled" as any } : o)
      );
    } catch (e: any) {
      alert(e.response?.data?.message || "Cannot cancel this order");
    }
  }

  // Still loading auth -- show skeleton
  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <a href="/" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Home
      </a>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#1c1917] mb-1">My Orders</h1>
        <p className="text-[#78716c] text-sm">Hello, {user.name} 👋</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          ["Browse Products", "/products"],
          ["My Wishlist",     "/wishlist"],
          ["Start Selling",   "/become-seller"],
        ].map(([label, href]) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex items-center gap-2 hover:border-[#059669] hover:bg-[#ecfdf5] transition-all text-sm font-medium text-[#1c1917]">
            {label}
          </Link>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(({ v, l }) => (
          <button key={v} onClick={() => handleFilterChange(v)}
            className={"px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
              (filter === v
                ? "bg-[#059669] text-white"
                : "bg-[#f5f5f4] text-[#78716c] hover:bg-[#e7e5e4]")}>
            {l}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {fetching ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="text-[#e7e5e4] mx-auto mb-3" />
          <p className="text-[#78716c]">
            {filter ? "No " + filter + " orders" : "No orders yet"}
          </p>
          <Link href="/products">
            <Button variant="outline" className="mt-4">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const meta = STATUS_META[order.orderStatus] || STATUS_META.pending;
            const Icon = meta.icon;
            const canCancel = ["pending", "confirmed", "processing"].includes(order.orderStatus);

            // Max customization days across items that have a requirement
            const maxCustomDays = order.items.reduce(
              (max, item) => Math.max(max, item.customizationRequirement ? (item.customizationDays ?? 0) : 0),
              0
            );
            // Adjusted delivery = original shipping ETA + customization days
            const adjustedDelivery = order.estimatedDelivery
              ? new Date(new Date(order.estimatedDelivery).getTime() + maxCustomDays * 86_400_000)
              : null;

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-[#78716c]">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-[#a8a29e]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {order.items.some((item) => item.customizationRequirement) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] px-2 py-0.5 rounded-full">
                        <Settings2 size={9} /> Custom Order
                      </span>
                    )}
                    <span className={"inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full " + meta.color}>
                      <Icon size={10} />
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i}>
                      <Link
                        href={`/products/${typeof item.product === "string" ? item.product : (item.product as unknown as Product)?._id ?? ""}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 bg-[#f5f5f4] hover:bg-[#ecfdf5] hover:border-[#059669] border border-transparent rounded-xl p-1.5 pr-3 transition-all group"
                      >
                        {item.image && (
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 border border-[#e7e5e4]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-xs text-[#1c1917] font-medium group-hover:text-[#059669] transition-colors">{item.name}</span>
                        <span className="text-xs text-[#78716c]">×{item.quantity}</span>
                      </Link>
                      {item.customizationRequirement && (
                        <div className="mt-1 ml-1 flex items-start gap-1.5 bg-[#fffbeb] border border-[#fcd34d] rounded-xl px-3 py-2">
                          <Settings2 size={11} className="text-[#d97706] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-semibold text-[#92400e] mb-0.5">Your customisation</p>
                            <p className="text-xs text-[#78716c] leading-relaxed">{item.customizationRequirement}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-[#059669]">
                    Rs.{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.trackingNumber && (
                      <span className="text-xs text-[#78716c] bg-[#f5f5f4] px-2.5 py-1 rounded-lg">
                        Track: {order.trackingNumber}
                      </span>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {adjustedDelivery &&
                  order.orderStatus !== "delivered" &&
                  order.orderStatus !== "cancelled" && (
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <p className="text-xs text-[#78716c]">
                      Est. delivery:{" "}
                      <strong>
                        {adjustedDelivery.toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </strong>
                    </p>
                    {maxCustomDays > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] px-1.5 py-0.5 rounded-full">
                        <Settings2 size={8} />
                        includes {maxCustomDays}d customisation
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}