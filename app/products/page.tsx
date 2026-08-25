"use client";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Jewellery","Home Decor","Clothing","Pottery","Paintings",
  "Candles","Bags","Skincare","Toys","Stationery","Other",
];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "popular",    label: "Most Popular" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated" },
];
const PAGE_LIMIT = 12;

function ProductsPageInner() {
  const searchParams = useSearchParams();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [loadingMore,setLoadingMore]= useState(false);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [q,        setQ]        = useState(searchParams.get("q")        || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort,     setSort]     = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sentinel element for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ---------- fetch ----------
  const fetchPage = useCallback(async (pg: number, replace: boolean) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params: Record<string, string> = {
        page: String(pg), limit: String(PAGE_LIMIT), sort,
      };
      if (q)        params.q        = q;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await api.get("/products", { params });

      setProducts((prev) => replace ? data.products : [...prev, ...data.products]);
      setTotal(data.total);
      setPage(data.page);
      setHasMore(data.page < data.pages);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [q, category, sort, minPrice, maxPrice]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  // IntersectionObserver â€” load next page when sentinel enters viewport
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPage(page + 1, false);
        }
      },
      { rootMargin: "200px" }   // trigger 200px before the sentinel is visible
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPage]);

  function clearFilters() {
    setQ(""); setCategory(""); setSort("newest"); setMinPrice(""); setMaxPrice("");
  }

  // Skeleton cards
  const Skeletons = ({ count = 8 }: { count?: number }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#e7e5e4] overflow-hidden">
          <div className="skeleton aspect-square" />
          <div className="p-3.5 space-y-2">
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-4 rounded-lg" />
            <div className="skeleton h-4 w-2/3 rounded-lg" />
            <div className="skeleton h-8 rounded-xl mt-3" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* â”€â”€ Search + Sort bar â”€â”€ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPage(1, true)}
            placeholder="Search handmade products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e7e5e4] rounded-xl text-sm focus:outline-none focus:border-[#c05621] focus:ring-2 focus:ring-[#fef3e8]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[#e7e5e4] rounded-xl text-sm focus:outline-none focus:border-[#c05621] cursor-pointer">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={"flex items-center gap-1.5 px-3 py-2.5 bg-white border rounded-xl text-sm transition-colors " +
              (filterOpen ? "border-[#c05621] text-[#c05621]" : "border-[#e7e5e4] hover:border-[#c05621]")}>
            <SlidersHorizontal size={14} />
            Filters
            {(category || minPrice || maxPrice) && (
              <span className="bg-[#c05621] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {[category, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">

        {/* â”€â”€ Filter sidebar â”€â”€ */}
        <aside className={`shrink-0 w-60 ${filterOpen ? "block" : "hidden"} md:block`}>
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#1c1917]">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-[#c05621] hover:underline">Clear all</button>
            </div>

            {/* Category */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-[#c05621] text-sm transition-colors py-0.5">
                    <input
                      type="radio" name="cat" value={c} checked={category === c}
                      onChange={() => setCategory(c)} className="accent-[#c05621]" />
                    {c}
                  </label>
                ))}
                {category && (
                  <button onClick={() => setCategory("")} className="flex items-center gap-1 text-xs text-red-500 mt-1">
                    <X size={10} /> Clear category
                  </button>
                )}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-2">Price (Rs.)</p>
              <div className="flex gap-2">
                <input
                  type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-2.5 py-1.5 text-xs border border-[#e7e5e4] rounded-lg focus:outline-none focus:border-[#c05621]" />
                <input
                  type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-2.5 py-1.5 text-xs border border-[#e7e5e4] rounded-lg focus:outline-none focus:border-[#c05621]" />
              </div>
            </div>

            <button
              onClick={() => fetchPage(1, true)}
              className="w-full bg-[#c05621] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#9a3e12] transition-colors">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* â”€â”€ Products grid â”€â”€ */}
        <div className="flex-1 min-w-0">

          {/* Result count */}
          {!loading && (
            <p className="text-sm text-[#78716c] mb-4">
              {total.toLocaleString()} {total === 1 ? "product" : "products"} found
              {category && <span> in <strong className="text-[#1c1917]">{category}</strong></span>}
            </p>
          )}

          {/* Initial loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Skeletons count={PAGE_LIMIT} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-[#78716c]">
              <p className="text-5xl mb-4">ðŸ”</p>
              <p className="font-semibold text-[#1c1917]">No products found</p>
              <p className="text-sm mt-1">Try different keywords or clear filters</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-[#c05621] hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p, i) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    priority={i < 4}   // first 4 cards load eagerly (above the fold)
                  />
                ))}

                {/* Inline skeleton cards while loading more */}
                {loadingMore && <Skeletons count={4} />}
              </div>

              {/* â”€â”€ Sentinel for IntersectionObserver â”€â”€ */}
              <div ref={sentinelRef} className="h-4 mt-4" />

              {/* End-of-list message */}
              {!hasMore && products.length > 0 && (
                <p className="text-center text-sm text-[#a8a29e] mt-6 pb-4">
                  You&apos;ve seen all {total.toLocaleString()} products
                </p>
              )}

              {/* Spinner while loading more (fallback for observers that don't fire) */}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <Loader2 size={22} className="animate-spin text-[#c05621]" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#c05621] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  );
}