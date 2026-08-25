import Link from "next/link";
import { ArrowRight, Palette, Truck, ShieldCheck, Star } from "lucide-react";

const CATEGORIES = [
  { name: "Jewellery",  emoji: "\uD83D\uDC8D", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Home Decor", emoji: "\uD83C\uDFE1", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Clothing",   emoji: "\uD83D\uDC57", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { name: "Pottery",    emoji: "\uD83C\uDFFA", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { name: "Paintings",  emoji: "\uD83C\uDFA8", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { name: "Candles",    emoji: "\uD83D\uDD6F\uFE0F", color: "bg-stone-50 text-stone-700 border-stone-200" },
  { name: "Bags",       emoji: "\uD83D\uDC5C", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { name: "Skincare",   emoji: "\uD83E\uDDF4", color: "bg-green-50 text-green-700 border-green-200" },
];

const FEATURES = [
  { icon: Palette,     title: "No GSTN needed",    desc: "Anyone can sell -- hobbyist or professional. Just create and list." },
  { icon: Truck,       title: "We handle delivery", desc: "Choose platform delivery, self-ship, or local pickup. Flexible for all." },
  { icon: ShieldCheck, title: "Secure payments",    desc: "Razorpay-powered checkout. Cash on delivery also available." },
  { icon: Star,        title: "Verified reviews",   desc: "Real buyer reviews so your talent speaks for itself." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] py-20 px-4 overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-emerald-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-md tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
            100% Authentic Handmade &amp; Creative
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5 tracking-tight">
            Sell What You Make.<br />
            <span className="text-[#fde68a]">No GSTN. No Barriers.</span>
          </h1>
          <p className="text-emerald-50/90 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            CraftBay is India&apos;s marketplace for handcrafted products. From jewelry to paintings,
            candles to clothing -- list anything creative, reach buyers everywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 bg-white text-[#047857] font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg hover:shadow-xl hover:bg-emerald-50 active:scale-[0.98] transition-all cursor-pointer">
                Browse Products <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/become-seller">
              <button className="inline-flex items-center gap-2 bg-[#d97706] text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#b45309] shadow-lg active:scale-[0.98] transition-all cursor-pointer">
                Start Selling Free
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 40" className="w-full h-10 fill-[#f8faf8]" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-[#e2e8f0] py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["10,000+","Products"],["5,000+","Sellers"],["50,000+","Happy Buyers"],["99.9%","Uptime"]].map(([v,l]) => (
            <div key={l}>
              <p className="text-3xl font-extrabold text-[#059669]">{v}</p>
              <p className="text-sm text-[#64748b] mt-1 font-medium">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2">Shop by Category</h2>
          <p className="text-[#64748b]">Hand-picked categories of India&apos;s finest handmade goods</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.name} href={`/products?category=${encodeURIComponent(c.name)}`}>
              <div className={`flex flex-col items-center gap-2 p-6 rounded-2xl border ${c.color} hover:shadow-md transition-all duration-200 cursor-pointer`}>
                <span className="text-4xl">{c.emoji}</span>
                <span className="font-semibold text-sm">{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/products">
            <button className="inline-flex items-center gap-2 bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#047857] shadow-sm hover:shadow transition-all cursor-pointer">
              View All Products <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* WHY CRAFTBAY */}
      <section className="bg-[#ecfdf5] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2">Why CraftBay?</h2>
            <p className="text-[#64748b]">Built for creators who just want to share their passion</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#ecfdf5] rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-[#059669]" />
                </div>
                <h3 className="font-bold text-[#0f172a] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="py-16 px-4 bg-[#0f172a] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to sell your creations?</h2>
          <p className="text-[#94a3b8] mb-8">
            Join thousands of makers selling on Instagram and Facebook -- now also on CraftBay with delivery handled.
          </p>
          <Link href="/become-seller">
            <button className="inline-flex items-center gap-2 bg-[#059669] text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-[#047857] active:scale-[0.98] shadow-lg transition-all cursor-pointer">
              Start Selling -- It&apos;s Free <ArrowRight size={18} />
            </button>
          </Link>
          <p className="text-[#64748b] text-xs mt-4">No GSTN · No subscription · 2% platform fee only on sales</p>
        </div>
      </section>

    </div>
  );
}