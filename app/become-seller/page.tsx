"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Store, CheckCircle, Palette, Truck, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import FieldLabel from "@/components/FieldLabel";

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [form, setForm] = useState({
    shopName: "", shopDesc: "", shopCity: "", shopState: "", pickupPincode: "",
  });
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] text-center px-4">
      <div>
        <p className="text-xl font-bold text-[#1c1917] mb-4">Please log in first</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    </div>
  );

  if (user.isSeller) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] text-center px-4">
      <div>
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <p className="text-xl font-bold text-[#1c1917] mb-2">You are already a seller!</p>
        <Link href="/seller"><Button>Go to Dashboard</Button></Link>
      </div>
    </div>
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/auth/become-seller", form);
      const { data } = await api.get("/auth/me");
      setUser(data);
      router.push("/seller");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to activate seller account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <a href="/" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#059669] transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Home
        </a>
      </div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] py-16 px-4 text-center text-white mt-4">
        <Store size={48} className="mx-auto mb-4 opacity-90" />
        <h1 className="text-3xl font-extrabold mb-2">Start Selling on Banavoo.in</h1>
        <p className="text-white/80 max-w-md mx-auto">
          No GSTN. No registration fee. Just your creativity and a bank account to receive payments.
        </p>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-6">
        {[
          { icon: Palette,    title: "List Anything",    desc: "Jewellery, paintings, clothes, candles -- if you made it, you can sell it." },
          { icon: Truck,      title: "Delivery Handled", desc: "We arrange courier pickup or you can self-ship or allow local pickup." },
          { icon: DollarSign, title: "100% Free",        desc: "No monthly fee. No commission. Keep everything you earn." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-[#e7e5e4] p-6">
            <Icon size={24} className="text-[#059669] mb-3" />
            <h3 className="font-bold text-[#1c1917] mb-1">{title}</h3>
            <p className="text-sm text-[#78716c]">{desc}</p>
          </div>
        ))}
      </section>

      {/* Form */}
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#1c1917] mb-6">Set Up Your Shop</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Shop Name *" name="shopName" value={form.shopName}
              onChange={handleChange} placeholder="e.g. Priya's Pottery Studio" required />
            <div>
              <FieldLabel>Shop Description</FieldLabel>
              <textarea
                name="shopDesc" value={form.shopDesc} onChange={handleChange} rows={3}
                placeholder="Tell buyers what makes your shop unique..."
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5] resize-none" />
            </div>
            <Input
              label="City *" name="shopCity" value={form.shopCity}
              onChange={handleChange} placeholder="Pune" required />
            <div>
              <FieldLabel required>State</FieldLabel>
              <select
                name="shopState" value={form.shopState} onChange={handleChange} required
                className="w-full rounded-xl border border-[#e7e5e4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669]">
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input
              label="Pickup Pincode *" name="pickupPincode" value={form.pickupPincode}
              onChange={handleChange} placeholder="411001" required
              helpText="Your shop's pincode — shown to buyers for local pickup." />
            <p className="text-xs text-[#78716c] text-center">
              By activating your seller account you agree to our{" "}
              <a href="/terms" className="text-[#059669] hover:underline">Terms &amp; Conditions</a>
              {" "}and{" "}
              <a href="/privacy" className="text-[#059669] hover:underline">Privacy Policy</a>.
            </p>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <Store size={16} /> Activate Seller Account
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}