"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Plus, Minus, Sparkles, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  ingredients: string;
  price: number;
  originalPrice?: number | null;
  weight: string;
  imageUrl: string;
  isVeg: boolean;
  isEggless: boolean;
  inStock: boolean;
  featured: boolean;
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  variants?: string | null;
  category?: {
    name: string;
    slug: string;
  };
}

interface ProductCardProps {
  product: ProductData;
  onOpenDetails: (product: ProductData) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const [imageError, setImageError] = useState(false);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#3B1F14]/10 hover:border-[#F5B83D]/50 flex flex-col justify-between group relative">
      {/* Top Image & Badges */}
      <div
        className="relative aspect-square w-full bg-[#FAF3EB] overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails(product)}
      >
        <Image
          src={
            imageError
              ? "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80"
              : product.imageUrl
          }
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          onError={() => setImageError(true)}
        />

        {/* Veg & Eggless Mark (Indian Standard FSSAI Green Square & Dot) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <div
            className="w-4 h-4 bg-white/95 rounded-sm border-2 border-emerald-600 flex items-center justify-center p-0.5 shadow-md"
            title="100% Vegetarian & Eggless"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>
          {product.bestSeller && (
            <span className="bg-gradient-to-r from-[#FF8A3D] to-[#FF4F8B] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
              Bestseller
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-2.5 right-2.5 bg-[#FF4F8B] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
            {discountPercent}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-[#1A0C06]/80 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-red-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div onClick={() => onOpenDetails(product)} className="cursor-pointer space-y-1">
          {/* Rating & Portion Weight */}
          <div className="flex items-center justify-between text-[11px] text-[#3B1F14]/70">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-[10px]">({product.reviewCount})</span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold bg-[#FAF3EB] px-2 py-0.5 rounded-md">
              {product.weight}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-extrabold text-xs sm:text-sm text-[#3B1F14] line-clamp-1 leading-snug group-hover:text-[#FF4F8B] transition-colors pt-0.5 font-serif">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
            {product.shortDesc}
          </p>
        </div>

        {/* Price & Stepper Row */}
        <div className="mt-3.5 pt-2.5 border-t border-[#3B1F14]/10 flex items-center justify-between gap-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#3B1F14]">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add or Quantity Stepper */}
          {product.inStock ? (
            quantity > 0 ? (
              <div className="flex items-center bg-[#24120B] text-[#FFF6EC] rounded-xl shadow-md border border-[#F5B83D]/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="p-1.5 hover:bg-black/30 active:scale-95 transition-all tap-target flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-black min-w-[20px] text-center text-[#F5B83D]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="p-1.5 hover:bg-black/30 active:scale-95 transition-all tap-target flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product)}
                className="bg-[#24120B] hover:bg-[#FF4F8B] active:scale-95 text-[#FFF6EC] text-xs font-black px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1 border border-[#F5B83D]/40 hover:border-transparent group-hover:bg-[#FF4F8B]"
              >
                <Plus className="w-3.5 h-3.5 text-[#F5B83D] group-hover:text-white" />
                <span>ADD</span>
              </button>
            )
          ) : (
            <span className="text-[10px] font-bold text-gray-400">UNAVAILABLE</span>
          )}
        </div>
      </div>
    </div>
  );
};
