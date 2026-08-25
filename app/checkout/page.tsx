"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { DeliveryMode } from "@/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Truck, MapPin, CreditCard, Package, CheckCircle } from "lucide-react";

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

const DELIVERY_MODES: { mode: DeliveryMode; label: string; desc: string }[] = [
  { mode: "platform",  label: "Platform Delivery (Recommended)", desc: "We arrange courier pickup and delivery. Rs.40-Rs.80 by distance. Free on orders Rs.999+." },
  { mode: "self_ship", label: "Seller Ships",                     desc: "Seller ships via their own courier. Rates as stated by seller." },
  { mode: "pickup",    label: "Local Pickup -- Free",             desc: "Pick up directly from the seller. Best for local buyers." },
];

export default function CheckoutPage() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const { items, total, clearCart } = useCartStore();
  const cartTotal = total();

  const [step,         setStep]         = useState<1 | 2 | 3>(1);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("platform");
  const [payMethod,    setPayMethod]    = useState<"razorpay" | "cod">("razorpay");
  const [quote,        setQuote]        = useState<{ shippingCharge: number; platformFee: number; totalAmount: number } | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [placed,       setPlaced]       = useState(false);
  const [orderId,      setOrderId]      = useState("");

  const [address, setAddress] = useState({
    fullName: "", phone: "", line1: "", line2: "",
    city: "", state: "", pincode: "", country: "India",
  });

  useEffect(() => {
    if (!user) router.push("/login?redirect=/checkout");
    if (items.length === 0) router.push("/cart");
  }, [user, items]);

  useEffect(() => {
    const def = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (def) setAddress({
      fullName: def.fullName, phone: def.phone, line1: def.line1,
      line2: def.line2 || "", city: def.city, state: def.state,
      pincode: def.pincode, country: def.country,
    });
  }, [user]);

  function handleAddrChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));
  }

  async function fetchQuote() {
    try {
      const { data } = await api.post("/orders/quote", {
        cartItems: items.map((i) => ({ product: i.product._id, quantity: i.quantity, variant: i.variant })),
        shippingAddress: address, deliveryMode, paymentMethod: payMethod,
      });
      setQuote(data);
    } catch { }
  }

  useEffect(() => {
    if (step === 3 && address.city) fetchQuote();
  }, [step, deliveryMode, payMethod]);

  async function placeOrder() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        cartItems: items.map((i) => ({ product: i.product._id, quantity: i.quantity, variant: i.variant })),
        shippingAddress: address, deliveryMode, paymentMethod: payMethod,
      });
      clearCart();
      setOrderId(data._id);
      setPlaced(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (placed) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] px-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-[#1c1917] mb-2">Order Placed!</h2>
        <p className="text-[#78716c] mb-2">Your order has been received. The seller will start processing it soon.</p>
        <p className="text-xs text-[#a8a29e] mb-6">Order ID: {orderId}</p>
        <Button onClick={() => router.push("/dashboard")}>View My Orders</Button>
      </div>
    </div>
  );

  if (!user || items.length === 0) return null;

  const addrValid = address.fullName && address.phone && address.line1 && address.city && address.state && address.pincode;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <a href="/cart" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Back to Cart
      </a>
      <h1 className="text-2xl font-extrabold text-[#1c1917] mb-6">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {[{ n: 1, label: "Address" }, { n: 2, label: "Delivery" }, { n: 3, label: "Payment" }].map(({ n, label }, idx) => (
          <div key={n} className="flex items-center gap-2">
            <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " +
              (step > n ? "bg-green-500 text-white" : step === n ? "bg-[#059669] text-white" : "bg-[#e7e5e4] text-[#78716c]")}>
              {step > n ? <CheckCircle size={16} /> : n}
            </div>
            <span className={"text-sm font-medium " + (step === n ? "text-[#059669]" : "text-[#78716c]")}>{label}</span>
            {idx < 2 && <div className="w-8 h-px bg-[#e7e5e4] mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
              <h2 className="font-bold text-[#1c1917] mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-[#059669]" /> Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name *" name="fullName" value={address.fullName} onChange={handleAddrChange} required />
                <Input label="Phone *" name="phone" type="tel" value={address.phone} onChange={handleAddrChange} required />
                <div className="sm:col-span-2">
                  <Input label="Address Line 1 *" name="line1" value={address.line1} onChange={handleAddrChange} placeholder="House No, Street, Area" required />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Address Line 2" name="line2" value={address.line2} onChange={handleAddrChange} placeholder="Landmark (optional)" />
                </div>
                <Input label="City *" name="city" value={address.city} onChange={handleAddrChange} required />
                <div>
                  <label className="text-sm font-medium text-[#1c1917] block mb-1">State *</label>
                  <select name="state" value={address.state} onChange={handleAddrChange} required
                    className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]">
                    <option value="">Select state</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Input label="Pincode *" name="pincode" value={address.pincode} onChange={handleAddrChange} placeholder="411001" required />
              </div>
              <Button className="mt-6" size="lg" onClick={() => setStep(2)} disabled={!addrValid}>
                Continue to Delivery
              </Button>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
              <h2 className="font-bold text-[#1c1917] mb-5 flex items-center gap-2">
                <Truck size={18} className="text-[#059669]" /> Delivery Method
              </h2>
              <div className="space-y-3 mb-6">
                {DELIVERY_MODES.map(({ mode, label, desc }) => (
                  <label key={mode}
                    className={"flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all " +
                      (deliveryMode === mode ? "border-[#059669] bg-[#ecfdf5]" : "border-[#e7e5e4] hover:border-[#059669]/50")}>
                    <input type="radio" name="delivery" value={mode} checked={deliveryMode === mode}
                      onChange={() => setDeliveryMode(mode)} className="mt-0.5 accent-[#059669]" />
                    <div>
                      <p className="font-semibold text-sm text-[#1c1917]">{label}</p>
                      <p className="text-xs text-[#78716c] mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
              <h2 className="font-bold text-[#1c1917] mb-5 flex items-center gap-2">
                <CreditCard size={18} className="text-[#059669]" /> Payment Method
              </h2>
              <div className="space-y-3 mb-6">
                {[
                  { val: "razorpay", label: "Online Payment",     desc: "Pay via UPI, card, or netbanking (Razorpay)" },
                  { val: "cod",      label: "Cash on Delivery",   desc: "Pay Rs.30 extra COD handling charge" },
                ].map(({ val, label, desc }) => (
                  <label key={val}
                    className={"flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all " +
                      (payMethod === val ? "border-[#059669] bg-[#ecfdf5]" : "border-[#e7e5e4] hover:border-[#059669]/50")}>
                    <input type="radio" name="pay" value={val} checked={payMethod === val}
                      onChange={() => setPayMethod(val as any)} className="mt-0.5 accent-[#059669]" />
                    <div>
                      <p className="font-semibold text-sm text-[#1c1917]">{label}</p>
                      <p className="text-xs text-[#78716c] mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button size="lg" loading={loading} onClick={placeOrder} className="flex-1">
                  Place Order{quote ? " -- Rs." + quote.totalAmount.toLocaleString("en-IN") : ""}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 sticky top-20">
            <h3 className="font-bold text-[#1c1917] mb-4 flex items-center gap-2">
              <Package size={16} /> Order Summary
            </h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => {
                const img = item.product.images.find((i) => i.isMain)?.url || item.product.images[0]?.url;
                return (
                  <div key={item.product._id + (item.variant || "")} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f4] shrink-0">
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1c1917] line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-[#78716c]">x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold shrink-0">Rs.{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#e7e5e4] pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-[#57534e]">
                <span>Subtotal</span><span>Rs.{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              {quote ? (
                <>
                  <div className="flex justify-between text-[#57534e]">
                    <span>Shipping</span>
                    <span>{quote.shippingCharge === 0 ? "Free" : "Rs." + quote.shippingCharge}</span>
                  </div>
                  <div className="flex justify-between text-[#57534e]">
                    <span>Platform fee</span><span>Rs.{quote.platformFee.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1c1917] pt-2 border-t border-[#e7e5e4]">
                    <span>Total</span>
                    <span className="text-[#059669]">Rs.{quote.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-bold text-[#1c1917] pt-2 border-t border-[#e7e5e4]">
                  <span>Total</span>
                  <span className="text-[#059669]">Rs.{cartTotal.toLocaleString("en-IN")}+</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}