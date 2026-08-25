"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";
import Button from "@/components/Button";
import Link from "next/link";

export default function WishlistPage() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => { if (!user) router.push("/login"); }, [user]);

  useEffect(() => {
    api.get("/wishlist").then(({ data }) => {
      setProducts(data);
      setWishlist(data.map((p: Product) => p._id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function toggle(id: string) {
    const { data } = await api.post("/wishlist/" + id);
    setWishlist(data.wishlist);
    if (!data.added) setProducts((ps) => ps.filter((p) => p._id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <a href="/" className="inline-flex items-center gap-1 text-sm text-[#78716c] hover:text-[#c05621] transition-colors mb-5 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        Home
      </a>
      <h1 className="text-2xl font-extrabold text-[#1c1917] mb-6 flex items-center gap-2">
        <Heart size={22} className="text-[#c05621]" /> My Wishlist
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({length:4}).map((_,i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="text-[#e7e5e4] mx-auto mb-3" />
          <p className="text-[#78716c] mb-4">Your wishlist is empty</p>
          <Link href="/products"><Button>Explore Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} wishlisted={wishlist.includes(p._id)} onWishlist={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}
