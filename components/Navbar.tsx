"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Heart, Store, Menu, X, Search, LayoutDashboard, LogOut, ChevronDown, ShieldCheck, ClipboardList } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useCartStore } from "@/store/cartStore";

const NAV_LINKS = [
  { href: "/shops",    label: "Shops" },
  { href: "/products", label: "All Products" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const cartCount = useCartStore((s) => s.count());
  const pathname  = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-black tracking-tight text-[#059669]">Banavoo<span className="text-[#d97706]">.In</span></span>
        </Link>

        {/* Search bar - desktop */}
        <Link href="/products"
          className="hidden md:flex items-center gap-2 flex-1 max-w-md bg-[#f1f5f9] rounded-xl px-4 py-2.5 text-sm text-[#64748b] hover:bg-[#e2e8f0] transition-colors">
          <Search size={16} />
          Search handmade products...
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={"text-sm font-semibold px-3 py-2 rounded-lg transition-colors " +
                (pathname.startsWith(href)
                  ? "text-[#059669] bg-[#ecfdf5]"
                  : "text-[#64748b] hover:text-[#059669] hover:bg-[#ecfdf5]")}>
              {label}
            </Link>
          ))}

          {/* Custom Requests — only for non-seller buyers who are logged in */}
          {user && !user.isSeller && (
            <Link href="/custom-requests/my"
              className={"text-sm font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 " +
                (pathname.startsWith("/custom-requests")
                  ? "text-amber-700 bg-amber-50"
                  : "text-[#64748b] hover:text-amber-700 hover:bg-amber-50")}>
              <ClipboardList size={14} />
              Custom Order
            </Link>
          )}

          {/* Sell link — only for non-sellers */}
          {(!user || !user.isSeller) && (
            <Link href="/become-seller"
              className={"text-sm font-semibold px-3 py-2 rounded-lg transition-colors " +
                (pathname.startsWith("/become-seller")
                  ? "text-[#059669] bg-[#ecfdf5]"
                  : "text-[#64748b] hover:text-[#059669] hover:bg-[#ecfdf5]")}>
              Sell
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart"
            className={"relative p-2 rounded-xl transition-colors " +
              (pathname === "/cart" ? "bg-[#ecfdf5] text-[#059669]" : "hover:bg-[#ecfdf5] text-[#64748b] hover:text-[#059669]")}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#059669] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/wishlist"
                className={"p-2 rounded-xl transition-colors " +
                  (pathname === "/wishlist" ? "bg-[#ecfdf5] text-[#059669]" : "hover:bg-[#ecfdf5] text-[#64748b] hover:text-[#059669]")}>
                <Heart size={20} />
              </Link>

              {/* Avatar dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((o) => !o)}
                  className={"flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl transition-colors " +
                    (dropOpen ? "bg-[#ecfdf5]" : "hover:bg-[#ecfdf5]")}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-[#059669]/20" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#059669] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#0f172a] max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14} className={"text-[#64748b] transition-transform " + (dropOpen ? "rotate-180" : "")} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#ecfdf5]">
                      <p className="font-semibold text-sm text-[#0f172a]">{user.name}</p>
                      <p className="text-xs text-[#64748b] truncate">{user.email}</p>
                    </div>
                    <nav className="py-1">
                      <Link href="/dashboard"
                        className={"flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors " +
                          (pathname === "/dashboard" ? "bg-[#ecfdf5] text-[#059669] font-medium" : "hover:bg-[#ecfdf5] text-[#0f172a]")}
                        onClick={() => setDropOpen(false)}>
                        <LayoutDashboard size={14} className="text-[#64748b]" /> My Orders
                      </Link>

                      {/* Custom Requests — buyers only */}
                      {!user.isSeller && (
                        <Link href="/custom-requests/my"
                          className={"flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors " +
                            (pathname.startsWith("/custom-requests") ? "bg-amber-50 text-amber-700 font-medium" : "hover:bg-amber-50 text-[#0f172a]")}
                          onClick={() => setDropOpen(false)}>
                          <ClipboardList size={14} className="text-amber-600" /> Custom Orders ✨
                        </Link>
                      )}

                      {user.role === "admin" && (
                        <Link href="/admin"
                          className={"flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors " +
                            (pathname.startsWith("/admin") ? "bg-amber-50 text-amber-700 font-medium" : "hover:bg-amber-50 text-[#0f172a]")}
                          onClick={() => setDropOpen(false)}>
                          <ShieldCheck size={14} className="text-amber-600" /> Admin Dashboard
                        </Link>
                      )}
                      {user.isSeller ? (
                        <Link href="/seller"
                          className={"flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors " +
                            (pathname.startsWith("/seller") ? "bg-[#ecfdf5] text-[#059669] font-medium" : "hover:bg-[#ecfdf5] text-[#0f172a]")}
                          onClick={() => setDropOpen(false)}>
                          <Store size={14} className="text-[#64748b]" /> Seller Dashboard
                        </Link>
                      ) : (
                        <Link href="/become-seller"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[#ecfdf5] text-[#0f172a] transition-colors"
                          onClick={() => setDropOpen(false)}>
                          <Store size={14} className="text-[#64748b]" /> Start Selling
                        </Link>
                      )}
                    </nav>
                    <div className="border-t border-[#e2e8f0] py-1">
                      <button
                        onClick={() => { logout(); setDropOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login"
                className={"text-sm font-semibold px-3 py-2 rounded-lg transition-colors " +
                  (pathname === "/login" ? "text-[#059669] bg-[#ecfdf5]" : "text-[#64748b] hover:text-[#059669] hover:bg-[#ecfdf5]")}>
                Login
              </Link>
              <Link href="/register"
                className="text-sm font-semibold bg-[#059669] text-white px-4 py-2 rounded-xl hover:bg-[#047857] shadow-sm hover:shadow transition-all">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: cart + toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/cart" className="relative p-2 rounded-xl hover:bg-[#ecfdf5] text-[#64748b]">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#059669] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-xl hover:bg-[#ecfdf5] text-[#64748b]">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#e2e8f0] bg-white px-4 py-4 flex flex-col gap-1">
          {/* Search */}
          <Link href="/products" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#f1f5f9] text-sm text-[#64748b] mb-2">
            <Search size={15} /> Search products...
          </Link>

          <Link href="/shops"
            className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors " +
              (pathname.startsWith("/shops") || pathname.startsWith("/shop") ? "bg-[#ecfdf5] text-[#059669]" : "text-[#0f172a] hover:bg-[#f1f5f9]")}>
            🏪 Browse Shops
          </Link>
          <Link href="/products"
            className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors " +
              (pathname.startsWith("/products") ? "bg-[#ecfdf5] text-[#059669]" : "text-[#0f172a] hover:bg-[#f1f5f9]")}>
            🛍️ All Products
          </Link>

          {user ? (
            <>
              {/* Custom Requests — buyers only */}
              {!user.isSeller && (
                <Link href="/custom-requests/my"
                  className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors " +
                    (pathname.startsWith("/custom-requests") ? "bg-amber-50 text-amber-700 font-medium" : "text-[#0f172a] hover:bg-amber-50")}>
                  <ClipboardList size={15} className="text-amber-600" /> Custom Orders ✨
                </Link>
              )}

              <div className="flex items-center gap-3 px-3 py-3 my-1 bg-[#ecfdf5] rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0f172a] truncate">{user.name}</p>
                  <p className="text-xs text-[#64748b] truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/dashboard"
                className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors " +
                  (pathname === "/dashboard" ? "bg-[#ecfdf5] text-[#059669] font-medium" : "text-[#0f172a] hover:bg-[#f1f5f9]")}>
                <LayoutDashboard size={15} /> My Orders
              </Link>
              <Link href="/wishlist"
                className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors " +
                  (pathname === "/wishlist" ? "bg-[#ecfdf5] text-[#059669] font-medium" : "text-[#0f172a] hover:bg-[#f1f5f9]")}>
                <Heart size={15} /> Wishlist
              </Link>
              {user.role === "admin" && (
                <Link href="/admin"
                  className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors " +
                    (pathname.startsWith("/admin") ? "bg-amber-50 text-amber-700 font-medium" : "text-[#0f172a] hover:bg-amber-50")}>
                  <ShieldCheck size={15} className="text-amber-600" /> Admin Dashboard
                </Link>
              )}
              {user.isSeller ? (
                <Link href="/seller"
                  className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors " +
                    (pathname.startsWith("/seller") ? "bg-[#ecfdf5] text-[#059669] font-medium" : "text-[#0f172a] hover:bg-[#f1f5f9]")}>
                  <Store size={15} /> Seller Dashboard
                </Link>
              ) : (
                <Link href="/become-seller" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#0f172a] hover:bg-[#f1f5f9] transition-colors">
                  <Store size={15} /> Start Selling
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors mt-1">
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e2e8f0] mt-2">
              <Link href="/login"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border border-[#e2e8f0] text-[#0f172a] hover:border-[#059669] hover:text-[#059669] transition-colors">
                Login
              </Link>
              <Link href="/register"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#059669] text-white hover:bg-[#047857] transition-colors shadow-xs">
                Sign Up — It&apos;s Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}