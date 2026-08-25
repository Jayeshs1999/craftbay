"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
  onWishlist?: (id: string) => void;
  wishlisted?: boolean;
  /** Pass true for cards above the fold so they load eagerly */
  priority?: boolean;
}

export default function ProductCard({ product, onWishlist, wishlisted, priority = false }: ProductCardProps) {
  const addItem  = useCartStore((s) => s.addItem);
  const mainImg  = product.images.find((i) => i.isMain)?.url || product.images[0]?.url;
  const [imgErr, setImgErr] = useState(false);

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-[#e7e5e4] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">

      {/* Image */}
      <Link href={`/products/${product.slug || product._id}`} tabIndex={-1}>
        <div className="relative aspect-square overflow-hidden bg-[#f5f5f4]">

          {mainImg && !imgErr ? (
            <Image
              src={mainImg}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              onError={() => setImgErr(true)}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#a8a29e]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              <span className="text-xs">No image</span>
            </div>
          )}

          {/* Badges */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              {discount}% OFF
            </span>
          )}
          {product.freeShipping && (
            <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full z-10">
              Free Shipping
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <span className="bg-white text-[#78716c] text-xs font-semibold px-3 py-1 rounded-full border border-[#e7e5e4]">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      {onWishlist && (
        <button
          onClick={() => onWishlist(product._id)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow hover:bg-white transition-colors z-20"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} className={wishlisted ? "fill-red-500 text-red-500" : "text-[#78716c]"} />
        </button>
      )}

      {/* Info */}
      <div className="p-3.5">
        <Link href={`/products/${product.slug || product._id}`}>
          <p className="text-[11px] text-[#78716c] mb-0.5 uppercase tracking-wide font-medium">{product.category}</p>
          <h3 className="font-semibold text-[#1c1917] text-sm leading-snug line-clamp-2 hover:text-[#c05621] transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={10}
                className={s <= Math.round(product.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"} />
            ))}
          </div>
          <span className="text-[11px] text-[#78716c]">
            {product.rating.toFixed(1)}
            {product.numReviews > 0 && <span className="text-[#a8a29e]"> ({product.numReviews})</span>}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-bold text-[#c05621] text-base">Rs.{product.price.toLocaleString("en-IN")}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-[#a8a29e] line-through">Rs.{product.comparePrice.toLocaleString("en-IN")}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#fef3e8] text-[#c05621] font-semibold text-sm py-2 rounded-xl hover:bg-[#c05621] hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={14} />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}