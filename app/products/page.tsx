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

function Skeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
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
}

function ProductsPageInner() {
  const searchParams = useSearchParams();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [loadingMore,setLoadingMore]= useState(false);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [qInput,   setQInput]   = useState(searchParams.get("q")        || "");
  const [q,        setQ]        = useState(searchParams.get("q")        || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort,     setSort]     = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Debounce search input so typing letters or single words searches automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(qInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [qInput]);

  // Sentinel element for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ---------- fetch ----------
  const fetchPage = useCallback(async (pg: number, replace: boolean) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params: Record<string, string> = {
        page: String(pg), limit: String(PAGE_LIMIT), sort,
      };
      if (q.trim()) params.q        = q.trim();
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

  // Fetch page 1 whenever filters change
  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  // IntersectionObserver — load next page when sentinel enters viewport
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPage(page + 1, false);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPage]);

  function clearFilters() {
    setQInput(""); setQ(""); setCategory(""); setSort("newest"); setMinPrice(""); setMaxPrice("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Search + Sort bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setQ(qInput);
              }
            }}
            placeholder="Search handmade products..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#ecfdf5]"
          />
          {qInput && (
            <button
              onClick={() => { setQInput(""); setQ(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#059669] cursor-pointer">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={"md:hidden flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium transition-colors cursor-pointer " +
              (filterOpen ? "border-[#059669] text-[#059669] bg-[#ecfdf5]" : "border-[#e2e8f0] hover:border-[#059669]")}>
            <SlidersHorizontal size={14} />
            Filters
            {(category || minPrice || maxPrice) && (
              <span className="bg-[#059669] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {[category, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Filter Modal/Drawer ── */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0] mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#059669]" />
                  <h3 className="font-bold text-base text-[#0f172a]">Filters</h3>
                </div>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2.5">Category</p>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {CATEGORIES.map((c) => (
                    <label key={c} className="flex items-center gap-2.5 cursor-pointer hover:text-[#059669] text-sm transition-colors py-1">
                      <input
                        type="radio" name="mobile-cat" value={c} checked={category === c}
                        onChange={() => setCategory(c)} className="accent-[#059669] w-4 h-4" />
                      {c}
                    </label>
                  ))}
                </div>
                {category && (
                  <button onClick={() => setCategory("")} className="flex items-center gap-1 text-xs text-red-500 mt-2 font-medium">
                    <X size={12} /> Clear category
                  </button>
                )}
              </div>

              {/* Price range */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2.5">Price Range (₹)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#059669]" />
                  <span className="text-[#94a3b8]">-</span>
                  <input
                    type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#059669]" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e2e8f0] flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 px-3 border border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer">
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2.5 px-3 bg-[#059669] text-white rounded-xl text-sm font-semibold hover:bg-[#047857] shadow-sm cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">

        {/* ── Desktop Filter sidebar ── */}
        <aside className="hidden md:block shrink-0 w-60">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#0f172a]">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-[#059669] hover:underline cursor-pointer">Clear all</button>
            </div>

            {/* Category */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-[#059669] text-sm transition-colors py-0.5">
                    <input
                      type="radio" name="cat" value={c} checked={category === c}
                      onChange={() => setCategory(c)} className="accent-[#059669]" />
                    {c}
                  </label>
                ))}
                {category && (
                  <button onClick={() => setCategory("")} className="flex items-center gap-1 text-xs text-red-500 mt-1 cursor-pointer">
                    <X size={10} /> Clear category
                  </button>
                )}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Price (₹)</p>
              <div className="flex gap-2">
                <input
                  type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#059669]" />
                <input
                  type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-2.5 py-1.5 text-xs border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#059669]" />
              </div>
            </div>

            <button
              onClick={() => fetchPage(1, true)}
              className="w-full bg-[#059669] text-white py-2 rounded-xl text-sm font-semibold hover:bg-[#047857] shadow-sm hover:shadow transition-colors cursor-pointer">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* ── Products grid ── */}
        <div className="flex-1 min-w-0">

          {/* Result count */}
          {!loading && (
            <p className="text-sm text-[#64748b] mb-4">
              {total.toLocaleString()} {total === 1 ? "product" : "products"} found
              {category && <span> in <strong className="text-[#0f172a]">{category}</strong></span>}
            </p>
          )}

          {/* Initial loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Skeletons count={PAGE_LIMIT} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-[#64748b]">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold text-[#0f172a]">No products found</p>
              <p className="text-sm mt-1">Try different keywords or clear filters</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-[#059669] hover:underline cursor-pointer">
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
                    priority={i < 4}
                  />
                ))}

                {/* Inline skeleton cards while loading more */}
                {loadingMore && <Skeletons count={4} />}
              </div>

              {/* ── Sentinel for IntersectionObserver ── */}
              <div ref={sentinelRef} className="h-4 mt-4" />

              {/* End-of-list message */}
              {!hasMore && products.length > 0 && (
                <p className="text-center text-sm text-[#94a3b8] mt-6 pb-4">
                  You&apos;ve seen all {total.toLocaleString()} products
                </p>
              )}

              {/* Spinner while loading more */}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <Loader2 size={22} className="animate-spin text-[#059669]" />
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
        <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  );
}
