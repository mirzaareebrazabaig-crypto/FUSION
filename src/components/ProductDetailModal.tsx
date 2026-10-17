"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Star, Plus, Minus, ShoppingBag, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { ProductData } from "./ProductCard";
import { useCart } from "@/context/CartContext";

interface ProductDetailModalProps {
  product: ProductData | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<{ name: string; price: number } | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  // Parse variants if available
  let variants: Array<{ name: string; price: number }> = [];
  if (product.variants) {
    try {
      variants = JSON.parse(product.variants);
    } catch {
      variants = [];
    }
  }

  // Active price based on variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const totalPrice = currentPrice * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(
        product,
        selectedVariant ? selectedVariant.name : null,
        customNote.trim() ? customNote.trim() : null,
        currentPrice
      );
    }
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-lg bg-[#FFF6EC] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-t sm:border border-[#F5B83D]/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md tap-target flex items-center justify-center transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Product Image */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#FAF3EB] shadow-inner">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
            {/* Top badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="bg-white/95 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                100% Veg & Eggless
              </span>
              {product.bestSeller && (
                <span className="bg-[#FF8A3D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Title & Price Header */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#3B1F14]/70 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[#FF8A3D]">
                {product.category?.name || "Artisanal Cocoa"}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-gray-400">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3B1F14] font-serif leading-tight">
              {product.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#3B1F14]">
                ₹{currentPrice}
              </span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-xs bg-[#FF4F8B]/15 text-[#FF4F8B] font-bold px-2 py-0.5 rounded-full">
                Fresh Batch
              </span>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white/70 p-3.5 rounded-xl border border-[#3B1F14]/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B1F14]/80 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F5B83D]" />
              Artisanal Craft & Taste
            </h4>
            <p className="text-xs sm:text-sm text-[#3B1F14]/80 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Ingredients */}
          <div className="bg-white/70 p-3.5 rounded-xl border border-[#3B1F14]/10 space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B1F14]/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Pure Ingredients
            </h4>
            <p className="text-xs text-[#3B1F14]/70 leading-normal">
              {product.ingredients}
            </p>
          </div>

          {/* Variants Selector (if applicable) */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3B1F14]">
                Select Pack / Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.name === v.name || (!selectedVariant && variants[0]?.name === v.name);
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? "bg-[#3B1F14] text-[#FFF6EC] border-[#F5B83D] shadow-sm"
                          : "bg-white text-[#3B1F14] border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{v.name}</div>
                      <div className={`text-xs mt-0.5 ${isSelected ? "text-[#F5B83D]" : "text-gray-500"}`}>
                        ₹{v.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Gift Note / Box Customization */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#3B1F14] flex items-center justify-between">
              <span>Message on Box / Gifting Note</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g., Happy Birthday Sneha! • Lots of Love"
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#FF4F8B] bg-white text-[#3B1F14]"
              maxLength={100}
            />
          </div>
        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#3B1F14]/10 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#FAF3EB] rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2.5 hover:bg-black/5 active:scale-95 text-[#3B1F14] tap-target flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-sm text-[#3B1F14] min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2.5 hover:bg-black/5 active:scale-95 text-[#3B1F14] tap-target flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAddToCart}
            className={`flex-1 min-h-[48px] rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              addedAnimation
                ? "bg-emerald-600"
                : product.inStock
                ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF8A3D] hover:opacity-95"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {addedAnimation
                ? "Added to Cart! ✓"
                : product.inStock
                ? `Add ${quantity > 1 ? `(${quantity}) ` : ""}• ₹${totalPrice}`
                : "Out of Stock"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
