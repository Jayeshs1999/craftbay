"use client";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1c1917] text-[#a8a29e] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/">
            <p className="text-xl font-extrabold text-white mb-2 hover:text-[#f59e0b] transition-colors">CraftBay</p>
          </Link>
          <p className="text-sm leading-relaxed">
            India&apos;s marketplace for handmade &amp; creative products.
            No GST needed — just creativity.
          </p>
        </div>

        {/* Shop */}
        <div>
          <p className="text-white font-semibold mb-3 text-sm">Shop</p>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/products" className="hover:text-white transition-colors">All Products</Link>
            <Link href="/products?category=Jewellery" className="hover:text-white transition-colors">Jewellery</Link>
            <Link href="/products?category=Home+Decor" className="hover:text-white transition-colors">Home Decor</Link>
            <Link href="/products?category=Clothing" className="hover:text-white transition-colors">Clothing</Link>
            <Link href="/products?category=Paintings" className="hover:text-white transition-colors">Paintings</Link>
          </nav>
        </div>

        {/* Account */}
        <div>
          <p className="text-white font-semibold mb-3 text-sm">Account</p>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">My Orders</Link>
            <Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
            <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
          </nav>
        </div>

        {/* Sell */}
        <div>
          <p className="text-white font-semibold mb-3 text-sm">Sell on CraftBay</p>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/become-seller" className="hover:text-white transition-colors">Start Selling — Free</Link>
            <Link href="/seller" className="hover:text-white transition-colors">Seller Dashboard</Link>
          </nav>
          <div className="mt-5 bg-[#292524] rounded-xl px-3 py-2.5 text-xs text-[#a8a29e]">
            Only 2% fee on sales.<br />No monthly charges.
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#292524] py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="text-xs text-[#57534e]">
            &copy; {new Date().getFullYear()} CraftBay. Made with ❤️ for India&apos;s creators.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1.5 text-xs text-[#78716c] hover:text-white transition-colors bg-[#292524] px-3 py-1.5 rounded-lg"
            title="Back to top"
          >
            <ArrowUp size={13} /> Top
          </button>
        </div>
      </div>
    </footer>
  );
}