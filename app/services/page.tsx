import {
  ArrowRight, Globe, Smartphone, ShoppingCart, Palette, Code, Wrench,
  Rocket, Mail, Phone, Check, MessageSquare, FileText, Hammer,
} from "lucide-react";

export const metadata = {
  title: "Banavoo — Web & App Development Company",
  description:
    "Banavoo builds custom websites, online stores, marketplaces and web apps for businesses and artisans across India. Share your idea and get a free quote.",
};

const CONTACT_EMAIL = "jayeshsevatkar55@gmail.com";
const CONTACT_PHONE = "+918888585093";
const CONTACT_PHONE_DISPLAY = "+91 88885 85093";

const SERVICES = [
  {
    icon: ShoppingCart,
    title: "Online Stores & Marketplaces",
    desc: "Your own shop or multi-seller marketplace with payments, delivery, order tracking and an admin panel.",
  },
  {
    icon: Globe,
    title: "Business Websites",
    desc: "Fast, mobile-friendly websites for businesses, studios and creators, built to be found on Google.",
  },
  {
    icon: Code,
    title: "Custom Web Apps",
    desc: "Dashboards, booking systems, portals and internal tools designed around how your business works.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    desc: "Every project works smoothly on phones first, because most of your customers will use one.",
  },
  {
    icon: Palette,
    title: "Branding & UI Design",
    desc: "Logo, colours and a clean interface so your product looks professional and trustworthy.",
  },
  {
    icon: Wrench,
    title: "Support & Maintenance",
    desc: "Hosting, updates, bug fixes and new features after launch, so you are never left on your own.",
  },
];

const STEPS = [
  { icon: MessageSquare, title: "1. Tell us your idea", desc: "Share what you want to build in a short message or call." },
  { icon: FileText,      title: "2. Get a quote",       desc: "We send a clear scope, price and timeline. No hidden costs." },
  { icon: Hammer,        title: "3. We build it",       desc: "You see progress at every stage and can ask for changes." },
  { icon: Rocket,        title: "4. Launch & support",  desc: "We deploy, train you to use it, and stay available afterwards." },
];

const WHY = [
  "Built for Indian businesses: UPI, cards, COD, GST-ready flows",
  "Proven e-commerce platform to start from, so you launch faster",
  "Clear pricing, written scope and fixed timelines",
  "Direct communication with the person building your product",
  "Training and support after launch",
];

export default function ServicesPage() {
  const mailto =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("New project enquiry — Banavoo")}` +
    `&body=${encodeURIComponent(
      "Hi Banavoo,\n\nName:\nBusiness:\nWhat do you want to build:\nBudget (approx.):\nExpected timeline:\n\nThanks!",
    )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#059669] rounded-2xl px-8 py-14 text-white text-center mb-14">
        <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-3">Banavoo</p>
        <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
          We build websites, stores<br />and apps for your business
        </h1>
        <p className="text-emerald-50/90 text-base max-w-2xl mx-auto leading-relaxed mb-8">
          From a single artisan shop to a full multi-seller marketplace, Banavoo designs, builds and
          supports custom software that helps Indian businesses sell online.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={mailto}
            className="inline-flex items-center gap-2 bg-[#d97706] text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#b45309] transition-colors">
            Start your project <ArrowRight size={15} />
          </a>
          <a href={`tel:${CONTACT_PHONE}`}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/20 transition-colors">
            <Phone size={15} /> {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* Services */}
      <section className="mb-14">
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">What we do</h2>
        <p className="text-sm text-[#64748b] mb-6">Everything you need to go from idea to a working product.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 bg-[#ecfdf5] rounded-xl flex items-center justify-center mb-4">
                <s.icon size={18} className="text-[#059669]" />
              </div>
              <h3 className="font-bold text-[#0f172a] mb-1.5 text-sm">{s.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured work */}
      <section className="bg-[#f8faf8] border border-[#e2e8f0] rounded-2xl p-7 mb-14">
        <p className="text-[#059669] text-xs font-bold uppercase tracking-widest mb-2">Featured work</p>
        <h2 className="text-xl font-extrabold text-[#0f172a] mb-2">Banavoo.in — handmade marketplace</h2>
        <p className="text-sm text-[#57534e] leading-relaxed mb-4">
          Our own multi-seller marketplace for Indian artisans. Seller storefronts, product management,
          Razorpay and COD checkout, flexible delivery options, order tracking and an admin dashboard.
          We can customise this platform for your brand, or build something new from scratch.
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#047857]">
          {["Next.js", "React", "TypeScript", "Node.js", "MongoDB", "Razorpay"].map((t) => (
            <span key={t} className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-full px-3 py-1">{t}</span>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mb-14">
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-6">How we work</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <div key={s.title} className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
              <div className="w-10 h-10 bg-[#fffbeb] rounded-xl flex items-center justify-center mb-4">
                <s.icon size={18} className="text-[#d97706]" />
              </div>
              <h3 className="font-bold text-[#0f172a] mb-1.5 text-sm">{s.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="mb-14">
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-5">Why work with Banavoo</h2>
        <ul className="space-y-3">
          {WHY.map((w) => (
            <li key={w} className="flex items-start gap-3 text-sm text-[#57534e]">
              <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                <Check size={12} className="text-[#059669]" />
              </span>
              {w}
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section className="text-center border border-[#e2e8f0] rounded-2xl p-10 bg-white">
        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">Have a project in mind?</h2>
        <p className="text-sm text-[#64748b] mb-6 max-w-md mx-auto">
          Tell us what you want to build. We usually reply within one business day with questions or a quote.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={`tel:${CONTACT_PHONE}`}
            className="inline-flex items-center gap-2 bg-[#059669] text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-[#047857] transition-colors">
            <Phone size={15} /> {CONTACT_PHONE_DISPLAY}
          </a>
          <a href={mailto}
            className="inline-flex items-center gap-2 border border-[#059669] text-[#059669] font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-[#ecfdf5] transition-colors">
            <Mail size={15} /> {CONTACT_EMAIL}
          </a>
        </div>
      </section>

    </div>
  );
}
