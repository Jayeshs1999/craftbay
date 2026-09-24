import Link from "next/link";
import { ArrowRight, Palette, Store, ShieldCheck, Star, MapPin, Heart, ClipboardList, Banknote, MessageSquare } from "lucide-react";

const CATEGORIES = [
  { name: "Jewellery",  emoji: "💍", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Home Decor", emoji: "🏡", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Clothing",   emoji: "👗", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { name: "Pottery",    emoji: "🏺", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { name: "Paintings",  emoji: "🎨", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { name: "Candles",    emoji: "🕯️", color: "bg-stone-50 text-stone-700 border-stone-200" },
  { name: "Bags",       emoji: "👜", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { name: "Skincare",   emoji: "🧴", color: "bg-green-50 text-green-700 border-green-200" },
];

const FEATURES = [
  {
    icon: Palette,
    title: "Open your shop in minutes",
    desc: "No GSTN, no paperwork, no subscription fees. Create your shop and start listing what you make — it's completely free.",
  },
  {
    icon: Store,
    title: "Your shop, your brand",
    desc: "Every seller gets their own storefront. Share your shop link, tell your story, and let buyers discover everything you create.",
  },
  {
    icon: ShieldCheck,
    title: "Cash on Delivery",
    desc: "Buyers can pay cash on delivery or at pickup. You set your own delivery charges — full control, no surprises.",
  },
  {
    icon: Star,
    title: "Real buyer reviews",
    desc: "Verified purchase reviews build trust naturally. Let your craft speak — happy buyers bring more buyers.",
  },
];

const HOW_IT_WORKS_SELLER = [
  { step: "01", title: "Create your shop", desc: "Sign up free, fill in your shop name, city, and a short description. Done in 2 minutes." },
  { step: "02", title: "List your products", desc: "Add photos, set your price, and describe what makes each piece special." },
  { step: "03", title: "Set delivery charges", desc: "Configure your own shipping rates per zone — local, state-wide, or pan-India." },
  { step: "04", title: "Receive orders & ship", desc: "Buyers order directly from your shop. Pack, ship, and mark it delivered." },
];

const HOW_IT_WORKS_BUYER = [
  { step: "01", title: "Browse shops", desc: "Discover handmade shops from makers across India, filtered by city or category." },
  { step: "02", title: "Explore products", desc: "Each shop is unique. Find one-of-a-kind pieces you won't see on any big marketplace." },
  { step: "03", title: "Order with confidence", desc: "Pay COD or pick up locally. Real reviews from real buyers guide every decision." },
  { step: "04", title: "Support local makers", desc: "Every rupee you spend goes directly to an independent artisan or creator." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] py-24 px-4 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-10 left-10 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-emerald-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-md tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
            India&apos;s Handmade Shop Platform
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5 tracking-tight">
            Your Shop.<br />
            <span className="text-[#fde68a]">Your Craft. Your Customers.</span>
          </h1>
          <p className="text-emerald-50/90 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Banavoo.in lets any maker in India open a free online shop — no GSTN, no fees.
            Buyers browse shops, discover unique handmade products, and order directly from you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/shops">
              <button className="inline-flex items-center gap-2 bg-white text-[#047857] font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg hover:shadow-xl hover:bg-emerald-50 active:scale-[0.98] transition-all cursor-pointer">
                <Store size={16} /> Browse Shops
              </button>
            </Link>
            <Link href="/become-seller">
              <button className="inline-flex items-center gap-2 bg-[#d97706] text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#b45309] shadow-lg active:scale-[0.98] transition-all cursor-pointer">
                Open Your Shop Free <ArrowRight size={16} />
              </button>
            </Link>
          </div>
          <p className="text-emerald-200/60 text-xs mt-5">No GSTN · No subscription · No commission</p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 40" className="w-full h-10 fill-[#f8faf8]" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-white border-b border-[#e2e8f0] py-7 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            ["🆓", "Zero Commission", "Keep every rupee you earn"],
            ["🏪", "Shop-first Model", "Buyers browse your storefront"],
            ["📦", "COD Supported", "Flexible for every buyer"],
            ["📍", "Local Pickup", "Serve your neighbourhood too"],
          ].map(([emoji, title, sub]) => (
            <div key={title} className="py-2">
              <p className="text-2xl mb-1">{emoji}</p>
              <p className="font-bold text-sm text-[#0f172a]">{title}</p>
              <p className="text-xs text-[#64748b] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2">What&apos;s in the shops?</h2>
          <p className="text-[#64748b]">Handmade goods from independent makers across India</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.name} href={`/products?category=${encodeURIComponent(c.name)}`}>
              <div className={`flex flex-col items-center gap-2 p-6 rounded-2xl border ${c.color} hover:shadow-md transition-all duration-200 cursor-pointer group`}>
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{c.emoji}</span>
                <span className="font-semibold text-sm">{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/shops">
            <button className="inline-flex items-center gap-2 bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#047857] shadow-sm hover:shadow transition-all cursor-pointer">
              <Store size={15} /> Explore All Shops
            </button>
          </Link>
          <Link href="/products">
            <button className="inline-flex items-center gap-2 bg-white border border-[#e2e8f0] text-[#0f172a] px-6 py-3 rounded-xl text-sm font-semibold hover:border-[#059669] hover:text-[#059669] transition-all cursor-pointer">
              Browse All Products
            </button>
          </Link>
        </div>
      </section>

      {/* ── CUSTOM ORDERS FEATURE ── */}
      <section className="py-16 px-4 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              ✨ New Feature
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2">Can&apos;t find it? Request it.</h2>
            <p className="text-[#64748b] max-w-xl mx-auto leading-relaxed">
              Post a custom order request — describe exactly what you need, set your budget, and let sellers bid to make it for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: ClipboardList,
                title: "Describe what you want",
                desc: "Post a request with your design, size, colour, and budget. Add reference photos to help sellers understand.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: MessageSquare,
                title: "Sellers bid for you",
                desc: "Active sellers on Banavoo.in review your request and submit their best price and delivery timeline.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Banknote,
                title: "Accept the best bid",
                desc: "Review bids, accept the one you like. Contact details are shared so you can coordinate directly.",
                color: "bg-blue-50 text-blue-600",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#f8faf8] rounded-2xl p-6 border border-[#e2e8f0]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <h3 className="font-bold text-[#0f172a] mb-1.5">{item.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/custom-requests/my">
              <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer">
                <ClipboardList size={16} /> Post a Custom Order Request
              </button>
            </Link>
            <p className="text-xs text-[#94a3b8] mt-3">Free to post · No commitment until you accept a bid</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#f8faf8] py-16 px-4 border-y border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2">How it works</h2>
            <p className="text-[#64748b]">Simple for sellers. Simple for buyers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Seller flow */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#ecfdf5] rounded-xl flex items-center justify-center">
                  <Store size={16} className="text-[#059669]" />
                </div>
                <h3 className="font-extrabold text-[#0f172a]">For Sellers</h3>
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS_SELLER.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-xs font-black text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] w-8 h-8 shrink-0 rounded-xl flex items-center justify-center">{item.step}</span>
                    <div>
                      <p className="font-semibold text-sm text-[#0f172a]">{item.title}</p>
                      <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/become-seller">
                <button className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-[#059669] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#047857] transition-colors cursor-pointer">
                  Open My Shop Free <ArrowRight size={15} />
                </button>
              </Link>
            </div>

            {/* Buyer flow */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-7">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Heart size={16} className="text-amber-600" />
                </div>
                <h3 className="font-extrabold text-[#0f172a]">For Buyers</h3>
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS_BUYER.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 w-8 h-8 shrink-0 rounded-xl flex items-center justify-center">{item.step}</span>
                    <div>
                      <p className="font-semibold text-sm text-[#0f172a]">{item.title}</p>
                      <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/shops">
                <button className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-600 transition-colors cursor-pointer">
                  Start Exploring Shops <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section className="py-16 px-4 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              Watch Demo
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2">See how it works in 5 minutes</h2>
            <p className="text-[#64748b] max-w-xl mx-auto">
              Watch how any Indian maker can open a free shop, list products and start receiving orders — step by step.
            </p>
          </div>
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-lg" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/Hr1jugB2zlU?si=cwGbFiVTIty801PS"
              title="Banavoo.in Demo — How to Create Your Free Shop & Add Products"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="text-center mt-8">
            <Link href="/become-seller">
              <button className="inline-flex items-center gap-2 bg-[#059669] text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#047857] shadow-sm transition-all cursor-pointer">
                Open My Free Shop <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY BANAVOO ── */}
      <section className="bg-[#ecfdf5] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-2">Why Banavoo.in?</h2>
            <p className="text-[#64748b]">The only platform where your shop is front and centre</p>
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

      {/* ── LOCAL ANGLE ── */}
      <section className="py-16 px-4 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#ecfdf5] rounded-2xl mb-5">
            <MapPin size={26} className="text-[#059669]" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#0f172a] mb-3">Shop local. Support local.</h2>
          <p className="text-[#64748b] text-base max-w-xl mx-auto leading-relaxed mb-7">
            Every shop on Banavoo.in is run by a real person in a real city.
            Search by your city, order from a neighbour, or pick up in person — no middlemen, no bulk warehouses.
          </p>
          <Link href="/shops">
            <button className="inline-flex items-center gap-2 bg-[#059669] text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-[#047857] shadow-sm transition-all cursor-pointer">
              Find shops near you <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── SELLER CTA ── */}
      <section className="py-20 px-4 bg-[#0f172a] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">For Creators &amp; Makers</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Your craft deserves<br />its own shop.
          </h2>
          <p className="text-[#94a3b8] mb-8 leading-relaxed">
            Open a free shop on Banavoo.in in minutes. Set your own prices, configure your delivery charges,
            and let buyers from across India find you — on your terms.
          </p>
          <Link href="/become-seller">
            <button className="inline-flex items-center gap-2 bg-[#059669] text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-[#047857] active:scale-[0.98] shadow-lg transition-all cursor-pointer">
              Open My Free Shop <ArrowRight size={18} />
            </button>
          </Link>
          <p className="text-[#475569] text-xs mt-4">No GSTN &nbsp;·&nbsp; No subscription &nbsp;·&nbsp; No commission &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

    </div>
  );
}