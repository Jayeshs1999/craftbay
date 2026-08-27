"use client";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/Button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const cartTotal = total();

  if (items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-[#78716c]">
      <ShoppingBag size={56} className="opacity-30" />
      <p className="text-xl font-bold text-[#1c1917]">Your cart is empty</p>
      <p className="text-sm">Add some handmade products to get started</p>
      <Link href="/products"><Button>Browse Products</Button></Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back nav */}
      <a href="/products" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Continue Shopping
      </a>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1c1917]">Shopping Cart <span className="text-[#78716c] font-normal text-lg">({items.length} {items.length === 1 ? "item" : "items"})</span></h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear all</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const img = item.product.images.find((i) => i.isMain)?.url || item.product.images[0]?.url;
            return (
              <div key={item.product._id + (item.variant || "")}
                className="flex gap-4 bg-white rounded-2xl border border-[#e7e5e4] p-4">
                <Link href={`/products/${item.product.slug || item.product._id}`}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f5f5f4] shrink-0">
                    {img ? <img src={img} alt={item.product.name} className="w-full h-full object-cover" /> : null}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug || item.product._id}`}>
                    <p className="font-semibold text-[#1c1917] text-sm leading-snug hover:text-[#059669] transition-colors line-clamp-2">
                      {item.product.name}
                    </p>
                  </Link>
                  {item.variant && <p className="text-xs text-[#78716c] mt-0.5">{item.variant}</p>}
                  <p className="text-[#059669] font-bold mt-1">Rs.{item.product.price.toLocaleString("en-IN")}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-[#e7e5e4] rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(item.product._id, Math.max(1, item.quantity - 1), item.variant)}
                        className="px-2 py-1 hover:bg-[#ecfdf5] transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product._id, Math.min(item.product.stock, item.quantity + 1), item.variant)}
                        className="px-2 py-1 hover:bg-[#ecfdf5] transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product._id, item.variant)}
                      className="p-1.5 text-[#a8a29e] hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="font-bold text-[#1c1917] shrink-0">
                  Rs.{(item.product.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 sticky top-20">
            <h2 className="font-bold text-[#1c1917] mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-[#57534e]">
                <span>Subtotal ({items.reduce((s,i) => s + i.quantity, 0)} items)</span>
                <span>Rs.{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#57534e]">
                <span>Shipping</span>
                <span className="text-green-600">{cartTotal >= 999 ? "Free" : "Calculated at checkout"}</span>
              </div>
              <div className="border-t border-[#e7e5e4] pt-3 flex justify-between font-bold text-[#1c1917]">
                <span>Total</span>
                <span className="text-[#059669]">Rs.{cartTotal.toLocaleString("en-IN")}+</span>
              </div>
            </div>
            {cartTotal >= 999 && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-3 py-2 mb-4">
                Free shipping applied on this order!
              </div>
            )}
            <Link href="/checkout">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
            <Link href="/products">
              <button className="w-full mt-3 text-sm text-[#78716c] hover:text-[#059669] transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
