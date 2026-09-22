"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import api from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { DeliveryMode, DeliveryConfig } from "@/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Truck, MapPin, CreditCard, Package, CheckCircle, StoreIcon, Loader2, Zap, ShieldCheck } from "lucide-react";
import { useRequireAuth } from "@/utils/useRequireAuth";
import toast from "react-hot-toast";
import FieldLabel from "@/components/FieldLabel";

// Emails allowed to use online payment (demo whitelist)
const ONLINE_PAYMENT_EMAILS = ["jayeshsevatkar55@gmail.com"];

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

// All possible delivery methods — enabled/disabled resolved at runtime from seller config
const ALL_DELIVERY_MODES: { mode: DeliveryMode; label: string; baseDesc: string; configKey: keyof Pick<DeliveryConfig, "selfShipEnabled" | "pickupEnabled" | "banavooShipEnabled">; comingSoon?: boolean }[] = [
  { mode: "self_ship",    label: "Seller Ships",       baseDesc: "Seller ships via their own courier.",                                            configKey: "selfShipEnabled" },
  { mode: "pickup",       label: "Local Pickup — Free", baseDesc: "Pick up directly from the seller. No shipping fee.",                            configKey: "pickupEnabled" },
  { mode: "banavoo_ship", label: "Banavoo Express",     baseDesc: "End-to-end fulfilment managed by Banavoo.in. Track your order in real-time.",   configKey: "banavooShipEnabled", comingSoon: true },
];

export default function CheckoutPage() {
  const router  = useRouter();
  const { user, isLoading } = useRequireAuth("/login?redirect=/checkout");
  const { items, total, clearCart } = useCartStore();
  const cartTotal = total();

  // Prevents the "items empty → push /cart" guard from firing after order success
  const ordered = useRef(false);

  const [step,         setStep]         = useState<1 | 2 | 3>(1);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("self_ship");
  const [payMethod,    setPayMethod]    = useState<"razorpay" | "cod">("cod");
  // Seller's delivery config — used to show/hide methods at checkout
  const [sellerDeliveryCfg, setSellerDeliveryCfg] = useState<Pick<DeliveryConfig, "selfShipEnabled" | "pickupEnabled" | "banavooShipEnabled">>({
    selfShipEnabled: true,
    pickupEnabled: true,
    banavooShipEnabled: true,
  });
  const [quote,        setQuote]        = useState<{ shippingCharge: number; platformFee: number; totalAmount: number; deliveryNotes?: string[] } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  // per-mode quote cache: keyed by deliveryMode so step 2 can show charges for each option
  const [modeQuotes,   setModeQuotes]   = useState<Partial<Record<DeliveryMode, { shippingCharge: number; totalAmount: number; deliveryNotes?: string[] }>>>({});
  const [loading,      setLoading]      = useState(false);

  const isPickup = deliveryMode === "pickup";

  const [address, setAddress] = useState({
    fullName: "", phone: "", line1: "", line2: "",
    city: "", state: "", pincode: "", country: "India",
  });

  // Fetch the seller's delivery config as soon as we know which seller's items are in the cart
  useEffect(() => {
    const sellerId = useCartStore.getState().cartSellerId;
    if (!sellerId) return;
    api.get(`/sellers/${sellerId}/delivery-config`)
      .then(({ data }) => {
        setSellerDeliveryCfg(data);
        // Auto-select first enabled non-coming-soon method
        const first = ALL_DELIVERY_MODES.find((m) => !m.comingSoon && data[m.configKey]);
        if (first) setDeliveryMode(first.mode);
      })
      .catch(() => { /* keep defaults */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;                  // useRequireAuth handles redirect
    if (items.length === 0 && !ordered.current) router.push("/cart");
  }, [user, isLoading, items]);

  useEffect(() => {
    const def = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (def) setAddress({
      fullName: def.fullName, phone: def.phone, line1: def.line1,
      line2: def.line2 || "", city: def.city, state: def.state,
      pincode: def.pincode, country: def.country,
    });
  }, [user]);

  // When switching to pickup mode, force payment to COD (cash at pickup)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isPickup) {
      setPayMethod("cod");
      // Pre-fill contact details from user profile if not already set
      setAddress((a) => ({
        ...a,
        fullName: a.fullName || user?.name || "",
        phone:    a.phone    || user?.phone || "",
      }));
    }
  // Re-run only when pickup mode toggles, not on every user/address change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPickup]);

  function handleAddrChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));
  }

  // Fetch quotes for all shipping modes as soon as we have a valid address (entering step 2+)
  async function fetchAllQuotes() {
    if (!address.city || !address.state) return;
    setQuoteLoading(true);
    const cartItems = items.map((i) => ({ product: i.product._id, quantity: i.quantity, variant: i.variant }));

    // pickup is always free — no API call needed
    const pickupQuote = { shippingCharge: 0, totalAmount: cartTotal };

    try {
      const { data } = await api.post("/orders/quote", {
        cartItems, shippingAddress: address, deliveryMode: "self_ship", paymentMethod: payMethod,
      });
      setModeQuotes({ self_ship: data, pickup: pickupQuote });
      // also set active quote
      setQuote(deliveryMode === "pickup" ? { shippingCharge: 0, platformFee: 0, totalAmount: cartTotal } : data);
    } catch {
      setModeQuotes({ pickup: pickupQuote });
    } finally {
      setQuoteLoading(false);
    }
  }

  // Re-fetch quotes whenever payMethod changes (COD surcharge affects amount)
  useEffect(() => {
    if (step >= 2) fetchAllQuotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, payMethod]);

  // Keep active quote in sync when user switches delivery mode
  useEffect(() => {
    const q = modeQuotes[deliveryMode];
    if (q) setQuote(deliveryMode === "pickup"
      ? { shippingCharge: 0, platformFee: 0, totalAmount: cartTotal }
      : { ...q, platformFee: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMode, modeQuotes]);

  async function placeOrder() {
    setLoading(true);
    try {
      const orderAddress = isPickup
        ? {
            fullName: address.fullName,
            phone:    address.phone,
            line1:    "Local Pickup",
            city:     "Local Pickup",
            state:    address.state || "N/A",
            pincode:  address.pincode || "000000",
            country:  "India",
          }
        : address;

      const cartPayload = items.map((i) => ({
        product: i.product._id, quantity: i.quantity, variant: i.variant,
        customizationRequirement: i.customizationRequirement,
      }));

      // ── Online payment via Razorpay ───────────────────────────────────────
      if (payMethod === "razorpay") {
        // Step 1: validate cart + get a Razorpay order ID (no DB order created yet)
        let rpData: { razorpayOrderId: string; amount: number; currency: string; key: string };
        try {
          const { data } = await api.post("/orders/razorpay-init", {
            cartItems: cartPayload, shippingAddress: orderAddress, deliveryMode,
          });
          rpData = data;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Could not initiate payment. Please try again.");
          return;   // stay on checkout, nothing was created
        }

        // Step 2: open Razorpay modal — if user dismisses, nothing happened
        const paymentResult = await new Promise<
          { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } | null
        >((resolve) => {
          const options = {
            key:         rpData.key,
            amount:      rpData.amount,
            currency:    rpData.currency,
            name:        "Banavoo.in",
            description: "Online Payment",
            order_id:    rpData.razorpayOrderId,
            prefill: {
              name:    user?.name  || "",
              email:   user?.email || "",
              contact: orderAddress.phone || "",
            },
            theme: { color: "#059669" },
            handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
              resolve(response);
            },
            modal: {
              ondismiss: () => resolve(null),   // user closed modal — resolve with null (no error, no order)
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });

        // User closed/dismissed the payment modal without paying
        if (!paymentResult) {
          toast("Payment cancelled. Your order was not placed.", { icon: "ℹ️" });
          return;   // stay on checkout page — cart is still intact
        }

        // Step 3: verify signature + create DB order atomically on the backend
        try {
          const { data: order } = await api.post("/orders/razorpay-confirm", {
            ...paymentResult,
            cartItems: cartPayload, shippingAddress: orderAddress, deliveryMode,
          });
          ordered.current = true;
          clearCart();
          router.push(`/order-success?id=${order._id}&paid=true`);
        } catch (err: any) {
          // Payment went through but server-side confirm failed (very rare)
          toast.error(err.response?.data?.message || "Payment received but order creation failed. Contact support.");
        }
        return;
      }

      // ── Cash on Delivery ─────────────────────────────────────────────────
      const { data } = await api.post("/orders", {
        cartItems: cartPayload, shippingAddress: orderAddress, deliveryMode, paymentMethod: "cod",
      });
      ordered.current = true;
      clearCart();
      router.push(`/order-success?id=${data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Build the delivery method list for this checkout: show all 3, but
  // disable any the seller has turned off (and always disable coming-soon ones)
  const deliveryModeMeta = ALL_DELIVERY_MODES.map((m) => ({
    ...m,
    disabled: m.comingSoon || !sellerDeliveryCfg[m.configKey],
  }));

  if (!user || (items.length === 0 && !ordered.current)) return null;

  // Address step: for pickup only name+phone are required
  const addrValid = isPickup
    ? !!(address.fullName && address.phone)
    : !!(address.fullName && address.phone && address.line1 && address.city && address.state && address.pincode);

  // Button label for step 3
  const orderBtnLabel = isPickup
    ? `Place Order — Rs.${cartTotal.toLocaleString("en-IN")} (pay at pickup)`
    : payMethod === "razorpay"
      ? `Pay Now via Razorpay — Rs.${quote ? quote.totalAmount.toLocaleString("en-IN") : cartTotal.toLocaleString("en-IN")}`
      : `Place Order${quote ? ` — Rs.${quote.totalAmount.toLocaleString("en-IN")}` : ""}`;

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    <div className="max-w-4xl mx-auto px-4 py-8">
      <a href="/cart" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Back to Cart
      </a>
      <h1 className="text-2xl font-extrabold text-[#1c1917] mb-6">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center mb-10 w-full">
        {[
          { n: 1, label: isPickup ? "Contact" : "Address" },
          { n: 2, label: "Delivery" },
          { n: 3, label: "Payment" },
        ].map(({ n, label }, idx) => (
          <div key={n} className="flex items-center min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className={"w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 flex items-center justify-center text-xs sm:text-sm font-bold " +
                (step > n ? "bg-green-500 text-white" : step === n ? "bg-[#059669] text-white" : "bg-[#e7e5e4] text-[#78716c]")}>
                {step > n ? <CheckCircle size={14} /> : n}
              </div>
              <span className={"text-xs sm:text-sm font-medium whitespace-nowrap " + (step === n ? "text-[#059669]" : "text-[#78716c]")}>{label}</span>
            </div>
            {idx < 2 && <div className="flex-1 min-w-[12px] h-px bg-[#e7e5e4] mx-1.5 sm:mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* ── Step 1: Address / Contact ── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
              {isPickup ? (
                <>
                  <h2 className="font-bold text-[#1c1917] mb-1 flex items-center gap-2">
                    <StoreIcon size={18} className="text-[#059669]" /> Your Contact Details
                  </h2>
                  <p className="text-sm text-[#78716c] mb-5">
                    You&apos;ve chosen <span className="font-semibold text-[#059669]">Local Pickup</span>. The seller will
                    contact you to arrange a pickup time. No shipping address needed.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name *" name="fullName" value={address.fullName} onChange={handleAddrChange} required />
                    <Input label="Phone *" name="phone" type="tel" value={address.phone} onChange={handleAddrChange} required />
                  </div>

                  {/* Pickup info banner */}
                  <div className="mt-5 flex gap-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-3">
                    <StoreIcon size={16} className="text-[#059669] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#065f46] leading-relaxed">
                      After placing the order, the seller will reach out to confirm a pickup time and share their location.
                      No payment is charged until you collect your item.
                    </p>
                  </div>
                </>
              ) : (
                <>
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
                      <FieldLabel required>State</FieldLabel>
                      <select name="state" value={address.state} onChange={handleAddrChange} required
                        className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]">
                        <option value="">Select state</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <Input label="Pincode *" name="pincode" value={address.pincode} onChange={handleAddrChange} placeholder="411001" required />
                  </div>
                </>
              )}
              <Button className="mt-6" size="lg" onClick={() => setStep(2)} disabled={!addrValid}>
                Continue to Delivery
              </Button>
            </div>
          )}

          {/* ── Step 2: Delivery ── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
              <h2 className="font-bold text-[#1c1917] mb-5 flex items-center gap-2">
                <Truck size={18} className="text-[#059669]" /> Delivery Method
              </h2>
              <div className="space-y-3 mb-6">
                {deliveryModeMeta.map(({ mode, label, baseDesc, disabled, comingSoon }) => {
                  const mq = modeQuotes[mode];
                  const charge = mode === "pickup" ? 0 : mq?.shippingCharge;
                  return (
                    <label key={mode}
                      className={"flex items-start gap-3 p-4 rounded-xl border transition-all " +
                        (disabled
                          ? "border-[#e7e5e4] opacity-50 cursor-not-allowed"
                          : deliveryMode === mode
                            ? "border-[#059669] bg-[#ecfdf5] cursor-pointer"
                            : "border-[#e7e5e4] hover:border-[#059669]/50 cursor-pointer")}>
                      <input type="radio" name="delivery" value={mode}
                        checked={deliveryMode === mode}
                        disabled={disabled}
                        onChange={() => !disabled && setDeliveryMode(mode)}
                        className="mt-0.5 accent-[#059669]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            {mode === "banavoo_ship" && <Zap size={13} className="text-[#7c5cd8] shrink-0" />}
                            <p className="font-semibold text-sm text-[#1c1917]">{label}</p>
                            {comingSoon && (
                              <span className="text-[10px] font-medium bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded-md">Coming Soon</span>
                            )}
                          </span>
                          {!disabled && (
                            quoteLoading ? (
                              <Loader2 size={13} className="text-[#78716c] animate-spin shrink-0" />
                            ) : charge !== undefined ? (
                              <span className={"text-sm font-bold shrink-0 " + (charge === 0 ? "text-[#059669]" : "text-[#1c1917]")}>
                                {charge === 0 ? "Free" : `Rs.${charge}`}
                              </span>
                            ) : null
                          )}
                        </div>
                        <p className="text-xs text-[#78716c] mt-0.5">{baseDesc}
                          {mode === "self_ship" && mq?.deliveryNotes && mq.deliveryNotes.length > 0 && (
                            <span className="block mt-1 text-amber-700">{mq.deliveryNotes.join(" · ")}</span>
                          )}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Pickup extra info when selected */}
              {isPickup && (
                <div className="mb-5 flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <StoreIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed space-y-1">
                    <p className="font-semibold">How Local Pickup works:</p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Place your order — no shipping fee charged.</li>
                      <li>Seller confirms &amp; contacts you to arrange a time.</li>
                      <li>Visit the seller&apos;s location to collect your item.</li>
                      <li>Pay the seller directly when you pick up.</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
              <h2 className="font-bold text-[#1c1917] mb-5 flex items-center gap-2">
                <CreditCard size={18} className="text-[#059669]" /> Payment Method
              </h2>

              {isPickup ? (
                /* ── Pickup: only pay-at-pickup option ── */
                <div className="space-y-3 mb-6">
                  <label className={"flex items-start gap-3 p-4 rounded-xl border border-[#059669] bg-[#ecfdf5] cursor-default"}>
                    <input type="radio" name="pay" value="cod" checked readOnly className="mt-0.5 accent-[#059669]" />
                    <div>
                      <p className="font-semibold text-sm text-[#1c1917]">Pay at Pickup</p>
                      <p className="text-xs text-[#78716c] mt-0.5">
                        Pay the seller directly (cash / UPI) when you collect your order. No extra charges.
                      </p>
                    </div>
                  </label>

                  <div className="flex gap-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl px-4 py-3">
                    <StoreIcon size={15} className="text-[#059669] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#065f46] leading-relaxed">
                      No online payment required. The seller will contact you to confirm pickup details.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Shipping: standard payment options ── */
                <div className="space-y-3 mb-6">
                  {/* Online Payment — Razorpay (whitelisted emails only) */}
                  {ONLINE_PAYMENT_EMAILS.includes(user?.email ?? "") ? (
                    <label className={"flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all " +
                      (payMethod === "razorpay" ? "border-[#059669] bg-[#ecfdf5]" : "border-[#e7e5e4] hover:border-[#059669]/50")}>
                      <input type="radio" name="pay" value="razorpay" checked={payMethod === "razorpay"}
                        onChange={() => setPayMethod("razorpay")} className="mt-0.5 accent-[#059669]" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#1c1917] flex items-center gap-2">
                          <ShieldCheck size={14} className="text-[#059669] shrink-0" />
                          Online Payment
                          <span className="text-[10px] font-medium bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] px-1.5 py-0.5 rounded-md ml-auto">Secure</span>
                        </p>
                        <p className="text-xs text-[#78716c] mt-0.5">Pay via UPI, card, or netbanking (Razorpay)</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {["UPI", "Credit Card", "Debit Card", "Net Banking"].map((m) => (
                            <span key={m} className="text-[10px] font-medium bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded">{m}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ) : (
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-[#e7e5e4] opacity-50 cursor-not-allowed">
                      <input type="radio" name="pay" value="razorpay" disabled className="mt-0.5 accent-[#059669]" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#1c1917] flex items-center gap-2">
                          <ShieldCheck size={14} className="text-[#78716c] shrink-0" />
                          Online Payment
                          <span className="text-[10px] font-medium bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded-md ml-auto">Coming Soon</span>
                        </p>
                        <p className="text-xs text-[#78716c] mt-0.5">Pay via UPI, card, or netbanking (Razorpay)</p>
                      </div>
                    </label>
                  )}

                  {/* Cash on Delivery */}
                  <label className={"flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all " +
                    (payMethod === "cod" ? "border-[#059669] bg-[#ecfdf5]" : "border-[#e7e5e4] hover:border-[#059669]/50")}>
                    <input type="radio" name="pay" value="cod" checked={payMethod === "cod"}
                      onChange={() => setPayMethod("cod")} className="mt-0.5 accent-[#059669]" />
                    <div>
                      <p className="font-semibold text-sm text-[#1c1917]">Cash on Delivery</p>
                      <p className="text-xs text-[#78716c] mt-0.5">
                        {modeQuotes.self_ship
                          ? (() => {
                              const codTotal = modeQuotes.self_ship.shippingCharge;
                              return codTotal > 0
                                ? `Rs.${codTotal} delivery charge (includes COD handling fee)`
                                : "No extra COD charge for this order";
                            })()
                          : "Extra COD handling charge may apply"}
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button size="lg" loading={loading} onClick={placeOrder} className="flex-1">
                  {orderBtnLabel}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order summary sidebar ── */}
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
              {isPickup ? (
                <>
                  <div className="flex justify-between text-[#57534e]">
                    <span>Shipping</span>
                    <span className="text-[#059669] font-medium">Free (Pickup)</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1c1917] pt-2 border-t border-[#e7e5e4]">
                    <span>Total</span>
                    <span className="text-[#059669]">Rs.{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                </>
              ) : quote ? (
                <>
                  <div className="flex justify-between text-[#57534e]">
                    <span>Shipping</span>
                    <span>{quote.shippingCharge === 0 ? "Free" : "Rs." + quote.shippingCharge}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1c1917] pt-2 border-t border-[#e7e5e4]">
                    <span>Total</span>
                    <span className="text-[#059669]">Rs.{quote.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {quote.deliveryNotes && quote.deliveryNotes.length > 0 && (
                    <div className="mt-2 flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <Truck size={13} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">{quote.deliveryNotes.join(" · ")}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between font-bold text-[#1c1917] pt-2 border-t border-[#e7e5e4]">
                  <span>Total</span>
                  <span className="text-[#059669]">Rs.{cartTotal.toLocaleString("en-IN")}+</span>
                </div>
              )}
            </div>

            {/* Delivery mode badge in sidebar */}
            {deliveryMode && (
              <div className={"mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg " +
                (deliveryMode === "pickup" ? "bg-amber-50 text-amber-700" : deliveryMode === "banavoo_ship" ? "bg-purple-50 text-purple-700" : "bg-[#f7f8fa] text-[#57534e]")}>
                {deliveryMode === "pickup" ? <StoreIcon size={12} /> : deliveryMode === "banavoo_ship" ? <Zap size={12} /> : <Truck size={12} />}
                {deliveryMode === "pickup" ? "Local Pickup — Free" : deliveryMode === "banavoo_ship" ? "Banavoo Express" : "Seller Ships"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
