"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/services/api";
import { Store, MapPin, Package, Search, X, ArrowRight } from "lucide-react";

interface PreviewImage {
  url: string;
  productName: string;
  price: number;
}

interface SellerCard {
  _id: string;
  name: string;
  sellerProfile?: {
    shopName?: string;
    shopDesc?: string;
    shopCity?: string;
    shopState?: string;
    rating?: number;
    totalSales?: number;
    isVerified?: boolean;
  };
  productCount: number;
  previewImages: PreviewImage[];
}

function ShopCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
      {/* Preview strip */}
      <div className="grid grid-cols-4 gap-0.5 h-28 bg-[#f1f5f9]">
        {[0,1,2,3].map((i) => <div key={i} className="skeleton h-full" />)}
      </div>
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-8 rounded-xl mt-3" />
      </div>
    </div>
  );
}

function ShopCard({ shop }: { shop: SellerCard }) {
  const shopName  = shop.sellerProfile?.shopName  || shop.name;
  const shopDesc  = shop.sellerProfile?.shopDesc;
  const shopCity  = shop.sellerProfile?.shopCity;
  const shopState = shop.sellerProfile?.shopState;
  const previews  = shop.previewImages.slice(0, 4);

  return (
    <Link href={`/shop/${shop._id}`}>
      <div className="group bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">

        {/* Product preview strip */}
        <div className="grid grid-cols-4 gap-0.5 h-32 bg-[#f1f5f9] shrink-0">
          {previews.length > 0 ? (
            <>
              {previews.map((img, i) => (
                <div key={i} className="overflow-hidden bg-[#e2e8f0]">
                  <img
                    src={img.url}
                    alt={img.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
              {/* Fill remaining slots with grey placeholders */}
              {Array.from({ length: Math.max(0, 4 - previews.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#e8edf2] flex items-center justify-center">
                  <Package size={16} className="text-[#94a3b8]" />
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-4 flex items-center justify-center">
              <Store size={32} className="text-[#cbd5e1]" />
            </div>
          )}
        </div>

        {/* Shop info */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#0f172a] text-sm leading-snug line-clamp-1 group-hover:text-[#059669] transition-colors flex-1">
              {shopName}
            </h3>
            {shop.sellerProfile?.isVerified && (
              <span className="shrink-0 text-[10px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] px-1.5 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>

          {(shopCity || shopState) && (
            <p className="flex items-center gap-1 text-xs text-[#78716c] mb-1">
              <MapPin size={10} className="shrink-0" />
              {[shopCity, shopState].filter(Boolean).join(", ")}
            </p>
          )}

          {shopDesc && (
            <p className="text-xs text-[#78716c] line-clamp-2 leading-relaxed mb-2 flex-1">
              {shopDesc}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#f1f5f9]">
            <span className="text-xs text-[#64748b] font-medium flex items-center gap-1">
              <Package size={11} />
              {shop.productCount} product{shop.productCount !== 1 ? "s" : ""}
            </span>
            <span className="text-xs font-semibold text-[#059669] flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
              Visit Shop <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ShopsPage() {
  const [shops,      setShops]      = useState<SellerCard[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [loadingMore,setLoadingMore]= useState(false);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [q,          setQ]          = useState("");
  const [qInput,     setQInput]     = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const fetchPage = useCallback(async (pg: number, replace: boolean) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params: Record<string, string> = { page: String(pg), limit: "12" };
      if (q.trim()) params.q = q.trim();
      const { data } = await api.get("/sellers", { params });
      setShops((prev) => replace ? data.sellers : [...prev, ...data.sellers]);
      setTotal(data.total);
      setPage(data.page);
      setHasMore(data.page < data.pages);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [q]);

  useEffect(() => { fetchPage(1, true); }, [fetchPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a] mb-1">Browse Shops</h1>
        <p className="text-[#64748b]">Discover handmade products directly from the creators</p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xl mb-8">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search shops by name or city..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5]"
        />
        {qInput && (
          <button
            onClick={() => { setQInput(""); setQ(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#94a3b8] hover:text-[#0f172a]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-sm text-[#64748b] mb-5">
          {total} shop{total !== 1 ? "s" : ""} found
          {q && <span> for <strong className="text-[#0f172a]">&quot;{q}&quot;</strong></span>}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ShopCardSkeleton key={i} />)}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-20 text-[#64748b]">
          <Store size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-[#0f172a]">No shops found</p>
          <p className="text-sm mt-1">Try a different search term</p>
          {q && (
            <button onClick={() => { setQInput(""); setQ(""); }} className="mt-4 text-sm text-[#059669] hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
          </div>

          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={() => fetchPage(page + 1, false)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 bg-white border border-[#e2e8f0] text-[#0f172a] font-semibold px-6 py-2.5 rounded-xl text-sm hover:border-[#059669] hover:text-[#059669] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingMore ? "Loading..." : "Load More Shops"}
              </button>
            </div>
          )}

          {!hasMore && shops.length > 0 && (
            <p className="text-center text-sm text-[#94a3b8] mt-8">
              You&apos;ve seen all {total} shop{total !== 1 ? "s" : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
