import Link from "next/link";
import { Store, Mail } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { href: "/shops",         label: "Browse Shops" },
    { href: "/products",      label: "All Products" },
    { href: "/become-seller", label: "Start Selling Free" },
  ],
  Support: [
    { href: "/about",         label: "About Us" },
    { href: "/terms",         label: "Terms & Conditions" },
    { href: "/privacy",       label: "Privacy Policy" },
  ],
  Account: [
    { href: "/login",         label: "Login" },
    { href: "/register",      label: "Create Account" },
    { href: "/dashboard",     label: "My Orders" },
    { href: "/seller",        label: "Seller Dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-[#94a3b8] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span className="text-xl font-black tracking-tight text-[#059669]">
                Banavoo<span className="text-[#d97706]">.In</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#64748b] mb-4">
              India&apos;s handmade shop platform. Open a free shop, list your creations, and reach buyers across India — no GSTN, no commission.
            </p>
            <a href="mailto:jayeshsevatkar55@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#059669] transition-colors">
              <Mail size={13} /> hello@banavoo.in
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-3">{section}</p>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-xs text-[#64748b] hover:text-[#059669] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1e293b] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
          <p>© {new Date().getFullYear()} Banavoo.In — All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms"   className="hover:text-[#059669] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#059669] transition-colors">Privacy</Link>
            <Link href="/about"   className="hover:text-[#059669] transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
