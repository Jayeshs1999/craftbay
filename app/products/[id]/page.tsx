"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";
import { Product, DeliveryConfig } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { ShoppingCart, Heart, Star, Truck, ShieldCheck, Package, ChevronLeft, ChevronRight, Share2, Copy, Check, Mail, Ruler, Weight, Tag, Sparkles, BadgeCheck, Settings2, Clock } from "lucide-react";
import Button from "@/components/Button";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addItem   = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"desc" | "reviews" | "shipping">("desc");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customizationReq, setCustomizationReq] = useState("");
  const [customizationError, setCustomizationError] = useState("");

  useEffect(() => {
    api.get("/products/" + id)
      .then(({ data }) => setProduct(data))
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="space-y-4">{[140,80,60,100].map((w,i) => <div key={i} className="skeleton h-5 rounded-xl" style={{ width: w+"%" }} />)}</div>
    </div>
  );
  if (!product) return null;

  const variantStr = Object.entries(variant).map(([k,v]) => k+": "+v).join(", ");
  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out ${product.name} on Banavoo`;
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedText = encodeURIComponent(shareText);

  async function shareProduct() {
    if (navigator.share) {
      try {
        await navigator.share({ title: product!.name, text: shareText, url: productUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setShareOpen((open) => !open);
  }

  async function copyProductLink() {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitReview() {
    if (!user) { router.push("/login"); return; }
    setReviewing(true);
    try {
      await api.post("/products/" + product!._id + "/review", { rating, comment });
      const { data } = await api.get("/products/" + id);
      setProduct(data); setComment("");
    } catch { } finally { setReviewing(false); }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-2 text-xs text-[#78716c] mb-6 flex-wrap">
        <a href="/" className="hover:text-[#059669] transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-[#059669] transition-colors">Products</a>
        <span>/</span>
        <span className="text-[#1c1917] font-medium truncate max-w-[200px]">{product.name}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f5f4] border border-[#e7e5e4]">
            {product.images[mainImg] ? (
              <Image
                src={product.images[mainImg].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#a8a29e]">No image</div>
            )}
            {product.images.length > 1 && (<>
              <button onClick={() => setMainImg((i) => (i - 1 + product.images.length) % product.images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow z-10"><ChevronLeft size={16} /></button>
              <button onClick={() => setMainImg((i) => (i + 1) % product.images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow z-10"><ChevronRight size={16} /></button>
            </>)}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setMainImg(i)}
                  className={"relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 " + (i === mainImg ? "border-[#059669]" : "border-[#e7e5e4]")}>
                  <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs text-[#78716c] font-medium uppercase tracking-wide">{product.category}</span>
            {product.subCategory && (
              <span className="text-xs text-[#78716c]">/ {product.subCategory}</span>
            )}
            {product.handmade && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                <Sparkles size={10} /> Handmade
              </span>
            )}
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] px-2 py-0.5 rounded-full">
                <BadgeCheck size={10} /> Featured
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[#1c1917] mb-1">{product.name}</h1>

          {/* Customizable badge */}
          {product.isCustomizable && (
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#92400e] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#fcd34d]">
                <Settings2 size={11} /> Customisable
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#78716c]">
                <Clock size={11} className="text-[#059669]" />
                {product.customizationDays} day{product.customizationDays !== 1 ? "s" : ""} to complete
              </span>
            </div>
          )}
          {product.shortDesc && (
            <p className="text-sm text-[#57534e] mb-2 leading-relaxed">{product.shortDesc}</p>
          )}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} size={14} className={s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />)}</div>
            <span className="text-sm text-[#78716c]">{product.rating.toFixed(1)} - {product.numReviews} reviews</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-[#059669]">Rs.{product.price.toLocaleString("en-IN")}</span>
            {product.comparePrice && <span className="text-base text-[#a8a29e] line-through">Rs.{product.comparePrice.toLocaleString("en-IN")}</span>}
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm font-bold text-green-600">{Math.round((1 - product.price / product.comparePrice) * 100)}% off</span>)}
          </div>
          {product.variants.length > 0 && (
            <div className="mb-6 space-y-3">
              {[...new Set(product.variants.map((v) => v.name))].map((vName) => (
                <div key={vName}>
                  <p className="text-sm font-medium text-[#1c1917] mb-2">{vName}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.filter((v) => v.name === vName).map((v) => (
                      <button key={v.value} onClick={() => setVariant((prev) => ({ ...prev, [vName]: v.value }))}
                        className={"px-3 py-1.5 rounded-lg text-sm border transition-all " + (variant[vName] === v.value ? "border-[#059669] bg-[#ecfdf5] text-[#059669] font-medium" : "border-[#e7e5e4] hover:border-[#059669]")}>
                        {v.value}{v.additionalPrice > 0 && <span className="text-xs ml-1 text-[#78716c]">+Rs.{v.additionalPrice}</span>}
                      </button>))}
                  </div>
                </div>))}
            </div>)}
          <div className="flex items-center gap-3 mb-6">
            <p className="text-sm font-medium">Qty:</p>
            <div className="flex items-center border border-[#e7e5e4] rounded-xl overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-lg hover:bg-[#ecfdf5]">-</button>
              <span className="px-4 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-lg hover:bg-[#ecfdf5]">+</button>
            </div>
            <span className="text-xs text-[#78716c]">{product.stock} in stock</span>
            {product.sku && <span className="text-xs text-[#a8a29e]">SKU: {product.sku}</span>}
          </div>
          {/* Customization requirement box */}
          {product.isCustomizable && (
            <div className="mb-6 bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 size={15} className="text-[#d97706] shrink-0" />
                <p className="text-sm font-semibold text-[#92400e]">Customisation Details Required</p>
              </div>
              {product.customizationNote && (
                <p className="text-xs text-[#78716c] mb-3 leading-relaxed">{product.customizationNote}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-[#57534e] mb-3">
                <Clock size={12} className="text-[#059669] shrink-0" />
                <span>Estimated completion: <strong>{product.customizationDays} day{product.customizationDays !== 1 ? "s" : ""}</strong> after order confirmation. The seller may contact you to clarify details.</span>
              </div>
              <textarea
                value={customizationReq}
                onChange={(e) => { setCustomizationReq(e.target.value); if (e.target.value.trim()) setCustomizationError(""); }}
                placeholder="Describe your requirements — e.g. name to engrave, colour preference, size..."
                rows={3}
                className={"w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none resize-none " + (customizationError ? "border-red-400 focus:border-red-400" : "border-[#fcd34d] focus:border-[#d97706]")}
              />
              {customizationError && (
                <p className="text-xs text-red-500 mt-1">{customizationError}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <Button className="flex-1" size="lg" onClick={() => {
              if (product.isCustomizable && !customizationReq.trim()) {
                setCustomizationError("Please describe your customisation requirements before adding to cart.");
                return;
              }
              setCustomizationError("");
              const result = addItem(product, qty, variantStr || undefined, product.isCustomizable ? customizationReq.trim() : undefined);
              if (result === "ok") toast.success("Added to cart");
              else toast.error("Your cart has items from another seller.");
            }} disabled={product.stock === 0}>
              <ShoppingCart size={18} /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              if (product.isCustomizable && !customizationReq.trim()) {
                setCustomizationError("Please describe your customisation requirements before buying.");
                return;
              }
              setCustomizationError("");
              const result = addItem(product, qty, variantStr || undefined, product.isCustomizable ? customizationReq.trim() : undefined);
              if (result === "ok") router.push("/cart");
              else toast.error("Your cart has items from another seller.");
            }}>Buy Now</Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="lg" className="!px-3" aria-label="Add to wishlist"><Heart size={18} /></Button>
              <Button variant="outline" size="lg" className="!px-3" onClick={shareProduct} aria-label="Share product"><Share2 size={18} /></Button>
            </div>
          </div>
          {shareOpen && (
            <div className="mb-6 rounded-2xl border border-[#e7e5e4] bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-[#1c1917]">Share this product</p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#e7e5e4] px-3 py-2 text-sm hover:border-[#059669] hover:text-[#059669]">WhatsApp</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#e7e5e4] px-3 py-2 text-sm hover:border-[#059669] hover:text-[#059669]">Facebook</a>
                <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#e7e5e4] px-3 py-2 text-sm hover:border-[#059669] hover:text-[#059669]">X</a>
                <a href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#e7e5e4] px-3 py-2 text-sm hover:border-[#059669] hover:text-[#059669]">Telegram</a>
                <a href={`mailto:?subject=${encodedText}&body=${encodedText}%0A${encodedUrl}`} className="flex items-center gap-1.5 rounded-lg border border-[#e7e5e4] px-3 py-2 text-sm hover:border-[#059669] hover:text-[#059669]"><Mail size={14} /> Email</a>
                <button onClick={copyProductLink} className="flex items-center gap-1.5 rounded-lg border border-[#e7e5e4] px-3 py-2 text-sm hover:border-[#059669] hover:text-[#059669]">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          )}
          {!shareOpen && <div className="mb-3" />}
          {/* Delivery info strip — pulled from seller's delivery config */}
          {(() => {
            const sellerAny = product.seller as any;
            const cfg: DeliveryConfig | undefined = sellerAny?.sellerProfile?.deliveryConfig;
            const freeAbove = cfg?.freeShippingAbove ?? 0;
            const localCharge = cfg?.localCharge ?? 10;
            const codCharge = cfg?.codExtraCharge ?? 0;
            const deliveryNote = cfg?.deliveryNote ?? "";

            const shippingLine = product.freeShipping
              ? "Free shipping on this item"
              : freeAbove > 0
                ? `Starts from Rs.${localCharge} · Free on orders Rs.${freeAbove.toLocaleString("en-IN")}+`
                : `Starts from Rs.${localCharge} · Calculated at checkout`;

            const codLine = codCharge > 0
              ? `Cash on Delivery available · +Rs.${codCharge} handling charge`
              : "Cash on Delivery available";

            return (
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#57534e]">
                  <Truck size={14} className="text-[#059669] shrink-0" />
                  {shippingLine}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#57534e]">
                  <ShieldCheck size={14} className="text-[#059669] shrink-0" />
                  {codLine}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#57534e]">
                  <Package size={14} className="text-[#059669] shrink-0" />
                  Handmade &amp; carefully packed by the seller
                </div>
                {deliveryNote && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-1">
                    <Truck size={12} className="shrink-0 mt-0.5" />
                    {deliveryNote}
                  </div>
                )}
              </div>
            );
          })()}
          {product.seller && (
            <Link href={`/shop/${(product.seller as any)._id}`}>
              <div className="bg-[#ecfdf5] rounded-2xl p-4 border border-[#a7f3d0] hover:border-[#059669] hover:shadow-sm transition-all cursor-pointer">
                <p className="text-xs text-[#78716c] mb-1">Sold by</p>
                <p className="font-bold text-[#1c1917] hover:text-[#059669] transition-colors">
                  {(product.seller as any).sellerProfile?.shopName || (product.seller as any).name}
                </p>
                {(product.seller as any).sellerProfile?.shopCity && (
                  <p className="text-xs text-[#78716c]">{(product.seller as any).sellerProfile.shopCity}, {(product.seller as any).sellerProfile.shopState}</p>
                )}
                <p className="text-xs text-[#059669] font-medium mt-1">View all products from this seller →</p>
              </div>
            </Link>)}
        </div>
      </div>
      <div className="mt-12">
        <div className="flex border-b border-[#e7e5e4] mb-6">
          {(["desc","reviews","shipping"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-5 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors " + (tab===t?"border-[#059669] text-[#059669]":"border-transparent text-[#78716c] hover:text-[#1c1917]")}>
              {t==="desc"?"Description":t==="reviews"?"Reviews ("+product.numReviews+")":"Shipping & Returns"}
            </button>))}
        </div>
        {tab === "desc" && (
          <div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1c1917]">{product.description}</p>
            {product.isCustomizable && (
              <div className="mt-6 bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Settings2 size={15} className="text-[#d97706]" />
                  <h4 className="font-bold text-[#92400e]">Customisation Available</h4>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#57534e] mb-2">
                  <Clock size={13} className="text-[#059669]" />
                  <span>Estimated time to complete your custom order: <strong>{product.customizationDays} day{product.customizationDays !== 1 ? "s" : ""}</strong></span>
                </div>
                {product.customizationNote && (
                  <p className="text-sm text-[#57534e]">{product.customizationNote}</p>
                )}
              </div>
            )}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag) => <span key={tag} className="bg-[#f5f5f4] text-[#57534e] text-xs px-2.5 py-1 rounded-full">#{tag}</span>)}
              </div>)}
          </div>)}
        {tab === "reviews" && (
          <div className="space-y-6">
            {user && (
              <div className="bg-white border border-[#e7e5e4] rounded-2xl p-6">
                <h4 className="font-bold text-[#1c1917] mb-4">Write a Review</h4>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star size={24} className={s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 fill-gray-100"} />
                    </button>))}
                </div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={3}
                  className="w-full border border-[#e7e5e4] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#059669] resize-none mb-3" />
                <Button onClick={submitReview} loading={reviewing} disabled={!comment.trim()}>Submit Review</Button>
              </div>)}
            {product.reviews.length === 0
              ? <p className="text-[#78716c] text-sm">No reviews yet.</p>
              : product.reviews.map((r) => (
                <div key={r._id} className="border-b border-[#e7e5e4] pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#059669] font-bold text-sm">{r.name[0]}</div>
                    <div>
                      <p className="font-medium text-sm text-[#1c1917]">{r.name}</p>
                      <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} size={10} className={s<=r.rating?"fill-amber-400 text-amber-400":"fill-gray-200 text-gray-200"} />)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-[#57534e]">{r.comment}</p>
                </div>))}
          </div>)}
        {tab === "shipping" && (
          <div className="text-sm text-[#57534e] space-y-4 max-w-2xl">
            {/* Delivery options — seller-configured */}
            {(() => {
              const sellerAny = product.seller as any;
              const cfg: DeliveryConfig | undefined = sellerAny?.sellerProfile?.deliveryConfig;
              const local    = cfg?.localCharge           ?? 10;
              const regional = cfg?.regionalCharge        ?? 10;
              const national = cfg?.nationalCharge        ?? 10;
              const etaLocal    = cfg?.estimatedDaysLocal    ?? 2;
              const etaRegional = cfg?.estimatedDaysRegional ?? 4;
              const etaNational = cfg?.estimatedDaysNational ?? 7;
              const codCharge   = cfg?.codExtraCharge        ?? 0;
              const freeAbove   = cfg?.freeShippingAbove     ?? 0;
              const deliveryNote = cfg?.deliveryNote         ?? "";

              return (
                <>
                  <div className="bg-[#ecfdf5] rounded-2xl p-5 border border-[#a7f3d0]">
                    <h4 className="font-bold text-[#1c1917] mb-4 flex items-center gap-2">
                      <Truck size={15} className="text-[#059669]" /> Delivery Options
                    </h4>
                    <div className="space-y-3">
                      {/* Seller ships */}
                      <div className="bg-white rounded-xl border border-[#e7e5e4] p-3.5">
                        <p className="font-semibold text-xs text-[#1c1917] mb-2">Seller Ships</p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-[#57534e]">
                          <div className="space-y-0.5">
                            <p className="font-medium text-[#1c1917]">Same City</p>
                            <p className="text-[#059669] font-semibold">Rs.{local}</p>
                            <p className="text-[#a8a29e]">{etaLocal}–{etaLocal + 1} days</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-medium text-[#1c1917]">Same State</p>
                            <p className="text-[#059669] font-semibold">Rs.{regional}</p>
                            <p className="text-[#a8a29e]">{etaRegional}–{etaRegional + 1} days</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-medium text-[#1c1917]">Rest of India</p>
                            <p className="text-[#059669] font-semibold">Rs.{national}</p>
                            <p className="text-[#a8a29e]">{etaNational}–{etaNational + 1} days</p>
                          </div>
                        </div>
                        {freeAbove > 0 && (
                          <p className="mt-2 text-xs text-[#059669] font-medium">
                            🎉 Free shipping on orders above Rs.{freeAbove.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                      {/* Local pickup */}
                      <div className="bg-white rounded-xl border border-[#e7e5e4] p-3.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-[#1c1917]">Local Pickup</p>
                          <p className="text-xs text-[#78716c] mt-0.5">Collect directly from seller. No shipping fee.</p>
                        </div>
                        <span className="text-xs font-bold text-[#059669]">Free</span>
                      </div>
                      {/* COD */}
                      {/* <div className="bg-white rounded-xl border border-[#e7e5e4] p-3.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-[#1c1917]">Cash on Delivery</p>
                          <p className="text-xs text-[#78716c] mt-0.5">
                            {codCharge > 0 ? `+Rs.${codCharge} COD handling charge` : "No extra COD charge"}
                          </p>
                        </div>
                        <ShieldCheck size={15} className="text-[#059669]" />
                      </div> */}
                    </div>
                    {deliveryNote && (
                      <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        {deliveryNote}
                      </p>
                    )}
                  </div>

                  {/* Product details — fields collected at listing */}
                  <div className="bg-white rounded-2xl p-5 border border-[#e7e5e4] space-y-3">
                    <h4 className="font-bold text-[#1c1917] mb-1">Product Details</h4>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      {product.sku && (
                        <div className="flex items-center gap-2 text-[#57534e]">
                          <Tag size={12} className="text-[#059669] shrink-0" />
                          <span className="text-[#a8a29e]">SKU</span>
                          <span className="font-medium ml-auto">{product.sku}</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="flex items-center gap-2 text-[#57534e]">
                          <Weight size={12} className="text-[#059669] shrink-0" />
                          <span className="text-[#a8a29e]">Weight</span>
                          <span className="font-medium ml-auto">{product.weight}g</span>
                        </div>
                      )}
                      {(product as any).length && (
                        <div className="flex items-center gap-2 text-[#57534e]">
                          <Ruler size={12} className="text-[#059669] shrink-0" />
                          <span className="text-[#a8a29e]">Dimensions</span>
                          <span className="font-medium ml-auto">
                            {(product as any).length} × {(product as any).width} × {(product as any).height} cm
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[#57534e]">
                        <Sparkles size={12} className="text-[#059669] shrink-0" />
                        <span className="text-[#a8a29e]">Made by</span>
                        <span className="font-medium ml-auto">Artisan / Handmade</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#e7e5e4]">
                    <h4 className="font-bold text-[#1c1917] mb-2">Returns &amp; Refunds</h4>
                    <p>Returns accepted within 7 days for damaged or significantly different items. Contact the seller directly to initiate a return.</p>
                  </div>
                </>
              );
            })()}
          </div>)}
      </div>
    </div>
  );
}