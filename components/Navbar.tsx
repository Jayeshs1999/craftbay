"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Heart, Store, Menu, X, Search, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useCartStore } from "@/store/cartStore";

const NAV_LINKS = [
  { href: "/products",      label: "Shop" },
  { href: "/become-seller", label: "Sell" },
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
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e7e5e4] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold text-[#c05621]">CraftBay</span>
        </Link>

        {/* Search bar - desktop */}
        <Link href="/products"
          className="hidden md:flex items-center gap-2 flex-1 max-w-md bg-[#f5f5f4] rounded-xl px-4 py-2.5 text-sm text-[#78716c] hover:bg-[#ede9e6] transition-colors">
          <Search size={16} />
          Search handmade products...
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={"text-sm font-medium px-3 py-2 rounded-lg transition-colors " +
                (pathname.startsWith(href)
                  ? "text-[#c05621] bg-[#fef3e8]"
                  : "text-[#78716c] hover:text-[#c05621] hover:bg-[#fef3e8]")}>
              {label}
            </Link>
          ))}

          {/* Cart */}
          <Link href="/cart"
            className={"relative p-2 rounded-xl transition-colors " +
              (pathname === "/cart" ? "bg-[#fef3e8] text-[#c05621]" : "hover:bg-[#fef3e8] text-[#78716c] hover:text-[#c05621]")}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#c05621] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/wishlist"
                className={"p-2 rounded-xl transition-colors " +
                  (pathname === "/wishlist" ? "bg-[#fef3e8] text-[#c05621]" : "hover:bg-[#fef3e8] text-[#78716c] hover:text-[#c05621]")}>
                <Heart size={20} />
              </Link>

              {/* Avatar dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((o) => !o)}
                  className={"flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl transition-colors " +
                    (dropOpen ? "bg-[#fef3e8]" : "hover:bg-[#fef3e8]")}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#c05621] flex items-center justify-center text-white font-bold text-xs">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#1c1917] max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14} className={"text-[#78716c] transition-transform " + (dropOpen ? "rotate-180" : "")} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#e7e5e4] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#e7e5e4] bg-[#fef3e8]">
                      <p className="font-semibold text-sm text-[#1c1917]">{user.name}</p>
                      <p className="text-xs text-[#78716c] truncate">{user.email}</p>
                    </div>
                    <nav className="py-1">
                      <Link href="/dashboard"
                        className={"flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors " +
                          (pathname === "/dashboard" ? "bg-[#fef3e8] text-[#c05621]" : "hover:bg-[#fef3e8] text-[#1c1917]")}
                        onClick={() => setDropOpen(false)}>
                        <LayoutDashboard size={14} className="text-[#78716c]" /> My Orders
                      </Link>
                      {user.isSeller ? (
                        <Link href="/seller"
                          className={"flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors " +
                            (pathname.startsWith("/seller") ? "bg-[#fef3e8] text-[#c05621]" : "hover:bg-[#fef3e8] text-[#1c1917]")}
                          onClick={() => setDropOpen(false)}>
                          <Store size={14} className="text-[#78716c]" /> Seller Dashboard
                        </Link>
                      ) : (
                        <Link href="/become-seller"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[#fef3e8] text-[#1c1917] transition-colors"
                          onClick={() => setDropOpen(false)}>
                          <Store size={14} className="text-[#78716c]" /> Start Selling
                        </Link>
                      )}
                    </nav>
                    <div className="border-t border-[#e7e5e4] py-1">
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
                className={"text-sm font-medium px-3 py-2 rounded-lg transition-colors " +
                  (pathname === "/login" ? "text-[#c05621] bg-[#fef3e8]" : "text-[#78716c] hover:text-[#c05621] hover:bg-[#fef3e8]")}>
                Login
              </Link>
              <Link href="/register"
                className="text-sm font-medium bg-[#c05621] text-white px-4 py-2 rounded-xl hover:bg-[#9a3e12] transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: cart + toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/cart" className="relative p-2 rounded-xl hover:bg-[#fef3e8] text-[#78716c]">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#c05621] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-xl hover:bg-[#fef3e8] text-[#78716c]">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#e7e5e4] bg-white px-4 py-4 flex flex-col gap-1">
          {/* Search */}
          <Link href="/products" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#f5f5f4] text-sm text-[#78716c] mb-2">
            <Search size={15} /> Search products...
          </Link>

          <Link href="/products"
            className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors " +
              (pathname.startsWith("/products") ? "bg-[#fef3e8] text-[#c05621]" : "text-[#1c1917] hover:bg-[#f5f5f4]")}>
            🛍️ Shop All Products
          </Link>

          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-3 my-1 bg-[#fef3e8] rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#c05621] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1c1917] truncate">{user.name}</p>
                  <p className="text-xs text-[#78716c] truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/dashboard"
                className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors " +
                  (pathname === "/dashboard" ? "bg-[#fef3e8] text-[#c05621] font-medium" : "text-[#1c1917] hover:bg-[#f5f5f4]")}>
                <LayoutDashboard size={15} /> My Orders
              </Link>
              <Link href="/wishlist"
                className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors " +
                  (pathname === "/wishlist" ? "bg-[#fef3e8] text-[#c05621] font-medium" : "text-[#1c1917] hover:bg-[#f5f5f4]")}>
                <Heart size={15} /> Wishlist
              </Link>
              {user.isSeller ? (
                <Link href="/seller"
                  className={"flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors " +
                    (pathname.startsWith("/seller") ? "bg-[#fef3e8] text-[#c05621] font-medium" : "text-[#1c1917] hover:bg-[#f5f5f4]")}>
                  <Store size={15} /> Seller Dashboard
                </Link>
              ) : (
                <Link href="/become-seller" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#1c1917] hover:bg-[#f5f5f4] transition-colors">
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
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e7e5e4] mt-2">
              <Link href="/login"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border border-[#e7e5e4] text-[#1c1917] hover:border-[#c05621] hover:text-[#c05621] transition-colors">
                Login
              </Link>
              <Link href="/register"
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#c05621] text-white hover:bg-[#9a3e12] transition-colors">
                Sign Up — It&apos;s Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}