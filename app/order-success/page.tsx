"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Order } from "@/types";
import { CheckCircle, Package, ShoppingBag, LayoutDashboard, PartyPopper, Loader2, StoreIcon, ShieldCheck, Clock } from "lucide-react";
import Button from "@/components/Button";

// ─── Inner component (uses useSearchParams — must be inside <Suspense>) ───────
function OrderSuccessContent() {
  const params  = useSearchParams();
  const orderId = params.get("id") ?? "";
  const justPaid = params.get("paid") === "true";

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    api.get(`/orders/${orderId}`)
      .then((r) => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf5]">
      <Loader2 size={32} className="animate-spin text-[#059669]" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#e7e5e4] shadow-xl overflow-hidden">

          {/* Header — changes colour based on payment status */}
          <div className={`px-8 py-10 text-center ${justPaid || order?.paymentMethod === "cod" ? "bg-[#059669]" : "bg-amber-500"}`}>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
              {justPaid || order?.paymentMethod === "cod"
                ? <CheckCircle size={44} className="text-white" strokeWidth={2.5} />
                : <Clock size={44} className="text-white" strokeWidth={2.5} />
              }
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">
              {justPaid ? "Payment Successful!" : order?.paymentMethod === "cod" ? "Order Placed!" : "Order Saved — Payment Pending"}
            </h1>
            <p className="text-white/80 text-sm">
              {justPaid
                ? "Your payment is confirmed. Order is being processed."
                : order?.paymentMethod === "cod"
                  ? "A confirmation has been sent to your email."
                  : "Your order is saved but payment is not yet complete."}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-5">

            {/* Order ID */}
            <div className="flex items-center justify-between bg-[#f7f8fa] rounded-xl px-4 py-3">
              <span className="text-xs text-[#78716c] font-medium uppercase tracking-wide">Order ID</span>
              <span className="text-sm font-bold text-[#1c1917] font-mono tracking-wider">
                #{orderId.slice(-8).toUpperCase()}
              </span>
            </div>

            {/* Items */}
            {order && order.items.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-2">Items Ordered</p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-[#374151] min-w-0">
                        <Package size={13} className="text-[#059669] shrink-0" />
                        <span className="line-clamp-1">{item.name}</span>
                        <span className="text-[#9ca3af] shrink-0">×{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-[#1c1917] shrink-0 ml-3">
                        Rs.{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total + Payment Method */}
            {order && (
              <>
                <div className="flex items-center justify-between border-t border-[#e7e5e4] pt-4">
                  <span className="text-sm font-semibold text-[#57534e]">
                    {order.paymentStatus === "paid" ? "Total Paid" : "Order Total"}
                  </span>
                  <span className="text-lg font-extrabold text-[#059669]">
                    Rs.{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {order.paymentMethod === "razorpay" ? (
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      <ShieldCheck size={11} />
                      {order.paymentStatus === "paid" ? "Paid via Razorpay" : "Online Payment — Pending"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      Cash on Delivery
                    </span>
                  )}
                </div>
              </>
            )}

            {/* What's next */}
            {order?.deliveryMode === "pickup" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
                <StoreIcon size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed space-y-1">
                  <p className="font-semibold">Next steps for Local Pickup:</p>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>The seller will contact you to confirm a pickup time.</li>
                    <li>Visit the seller&apos;s location to collect your item.</li>
                    <li>Pay the seller directly (cash / UPI) when you arrive.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-[#ecfdf5] rounded-xl px-4 py-3 flex gap-3">
                <PartyPopper size={18} className="text-[#059669] shrink-0 mt-0.5" />
                <p className="text-xs text-[#065f46] leading-relaxed">
                  The seller will confirm &amp; process your order shortly.
                  You&apos;ll get an email update at every step.
                </p>
              </div>
            )}

          </div>

          {/* Action buttons */}
          <div className="px-8 pb-8 flex flex-col gap-3">
            <Link href="/products" className="w-full">
              <Button size="lg" className="w-full gap-2">
                <ShoppingBag size={17} />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" size="lg" className="w-full gap-2">
                <LayoutDashboard size={17} />
                View My Orders
              </Button>
            </Link>
          </div>

        </div>

        <p className="text-center text-xs text-[#a8a29e] mt-5">
          Need help?&nbsp;
          <a href="mailto:support@banavoo.in" className="underline hover:text-[#059669] transition-colors">
            Contact support
          </a>
        </p>

      </div>
    </div>
  );
}

// ─── Page export — wraps in Suspense (required for useSearchParams) ───────────
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5]">
        <Loader2 size={32} className="animate-spin text-[#059669]" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
