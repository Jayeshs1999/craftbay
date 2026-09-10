"use client";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, AlertTriangle, X } from "lucide-react";

/**
 * Global modal — renders whenever cartStore.pendingAdd is non-null.
 * Place this once in the layout; it works across all pages.
 */
export default function SellerConflictModal() {
  const pendingAdd      = useCartStore((s) => s.pendingAdd);
  const confirmReplace  = useCartStore((s) => s.confirmReplace);
  const cancelPendingAdd = useCartStore((s) => s.cancelPendingAdd);
  const items           = useCartStore((s) => s.items);

  if (!pendingAdd) return null;

  const currentShopName =
    (items[0]?.product.seller as any)?.sellerProfile?.shopName ||
    (items[0]?.product.seller as any)?.name ||
    "current seller";

  const newShopName =
    (pendingAdd.product.seller as any)?.sellerProfile?.shopName ||
    (pendingAdd.product.seller as any)?.name ||
    "this seller";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-150">

        {/* Close */}
        <button
          onClick={cancelPendingAdd}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-amber-500" />
        </div>

        <h2 className="text-base font-bold text-[#1c1917] text-center mb-1">
          Your cart has items from a different seller
        </h2>
        <p className="text-sm text-[#78716c] text-center mb-5 leading-relaxed">
          Your cart currently has items from{" "}
          <span className="font-semibold text-[#1c1917]">{currentShopName}</span>.
          Adding this item will clear your cart and start a new order from{" "}
          <span className="font-semibold text-[#1c1917]">{newShopName}</span>.
        </p>

        {/* Product being added */}
        <div className="flex items-center gap-3 bg-[#f7f8fa] rounded-xl p-3 mb-5 border border-[#e5e7eb]">
          {pendingAdd.product.images[0]?.url && (
            <img
              src={pendingAdd.product.images[0].url}
              alt={pendingAdd.product.name}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1c1917] line-clamp-1">{pendingAdd.product.name}</p>
            <p className="text-xs text-[#059669] font-medium">Rs.{pendingAdd.product.price.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={cancelPendingAdd}
            className="flex-1 py-2.5 rounded-xl border border-[#e7e5e4] text-sm font-semibold text-[#57534e] hover:bg-[#f7f8fa] transition-colors cursor-pointer"
          >
            Keep Current Cart
          </button>
          <button
            onClick={confirmReplace}
            className="flex-1 py-2.5 rounded-xl bg-[#059669] text-white text-sm font-semibold hover:bg-[#047857] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart size={14} />
            Replace Cart
          </button>
        </div>
      </div>
    </div>
  );
}
