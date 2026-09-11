import Link from "next/link";
import { ArrowRight, Store, Heart, ShieldCheck, MapPin, Users } from "lucide-react";

export const metadata = {
  title: "About Us — Banavoo.In",
  description: "Learn about Banavoo.in — India's free handmade shop platform built for artisans, hobbyists, and independent creators.",
};

const VALUES = [
  {
    icon: Store,
    title: "Shop-first, always",
    desc: "Every seller on Banavoo.in gets their own storefront. Buyers browse shops, discover the maker behind the product, and build real relationships.",
  },
  {
    icon: Heart,
    title: "Built for every maker",
    desc: "You don't need a GSTN, a registered business, or a minimum number of products. If you make something, you can sell it here.",
  },
  {
    icon: ShieldCheck,
    title: "Honest & transparent",
    desc: "Zero commission. No hidden fees. What you earn is yours. We believe the platform should work for the maker, not the other way around.",
  },
  {
    icon: MapPin,
    title: "Local at heart",
    desc: "India's handmade culture is hyper-local. We built Local Pickup specifically so buyers can support makers in their own city.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#78716c] mb-8">
        <Link href="/" className="hover:text-[#059669] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1c1917] font-medium">About Us</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] rounded-2xl px-8 py-12 text-white text-center mb-12">
        <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-3">Our Story</p>
        <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
          We built Banavoo.In<br />for India&apos;s makers
        </h1>
        <p className="text-emerald-50/90 text-base max-w-xl mx-auto leading-relaxed">
          A free platform where any artisan, hobbyist, or independent creator can open their own online shop,
          list handmade products, and reach buyers across India — without paperwork, subscriptions, or commissions.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-12">
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-4">Why we exist</h2>
        <div className="space-y-4 text-[#57534e] leading-relaxed text-sm">
          <p>
            India has millions of talented creators — potters in Khurja, weavers in Varanasi, jewellery makers in Jaipur,
            candle makers in Bangalore. Most of them have no easy way to reach buyers beyond their neighbourhood.
            Existing e-commerce platforms require a GSTN, charge commissions, and treat small sellers as an afterthought.
          </p>
          <p>
            We built Banavoo.in to change that. Our belief is simple: <strong className="text-[#0f172a]">if you can make it, you should be able to sell it</strong> — regardless of whether you have a registered business, a tax number, or a team of ten.
          </p>
          <p>
            The name <strong className="text-[#0f172a]">"Banavoo"</strong> comes from the Hindi word <em>बनावो</em> — meaning "make" or "create". That's the spirit of this platform.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-6">What we stand for</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 bg-[#ecfdf5] rounded-xl flex items-center justify-center mb-4">
                <v.icon size={18} className="text-[#059669]" />
              </div>
              <h3 className="font-bold text-[#0f172a] mb-1.5 text-sm">{v.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How the platform works */}
      <div className="bg-[#f8faf8] border border-[#e2e8f0] rounded-2xl p-7 mb-12">
        <h2 className="text-xl font-extrabold text-[#0f172a] mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#059669]" /> How Banavoo.In works
        </h2>
        <div className="space-y-3 text-sm text-[#57534e] leading-relaxed">
          <p>
            <strong className="text-[#0f172a]">For sellers:</strong> Create a free shop, list as many products as you want, configure your own delivery charges, and receive orders directly. You ship the order yourself or offer local pickup — full control, no middleman.
          </p>
          <p>
            <strong className="text-[#0f172a]">For buyers:</strong> Browse shops from independent makers, discover unique handmade products, and buy with confidence using Cash on Delivery or local pickup. Real reviews from verified buyers so you always know what you're getting.
          </p>
          <p>
            <strong className="text-[#0f172a]">Zero commission:</strong> We currently charge no commission on any sale. Our goal is to grow the community first. This may change in the future, but sellers will always be notified well in advance.
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="text-center border border-[#e2e8f0] rounded-2xl p-8 mb-6">
        <h2 className="text-xl font-extrabold text-[#0f172a] mb-2">Get in touch</h2>
        <p className="text-sm text-[#64748b] mb-4">Questions, feedback, or partnership ideas? We&apos;d love to hear from you.</p>
        <a href="mailto:jayeshsevatkar55@gmail.com"
          className="inline-flex items-center gap-2 bg-[#059669] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#047857] transition-colors">
          hello@banavoo.in
        </a>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/become-seller">
          <button className="inline-flex items-center gap-2 bg-[#d97706] text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#b45309] shadow-sm transition-all cursor-pointer">
            Open your free shop <ArrowRight size={15} />
          </button>
        </Link>
      </div>

    </div>
  );
}
