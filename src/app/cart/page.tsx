"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Check,
  Sparkles,
  Info,
  Gift,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total,
    boxMessage,
    setBoxMessage,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;

    setIsApplying(true);
    setCouponFeedback(null);
    const result = await applyCoupon(code);
    setIsApplying(false);

    if (result.success) {
      setCouponFeedback({ type: "success", text: result.message });
      setCouponInput("");
    } else {
      setCouponFeedback({ type: "error", text: result.message });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-[#FAF3EB] rounded-full flex items-center justify-center text-[#3B1F14] mb-4 border border-[#3B1F14]/10 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-[#FF4F8B]" />
        </div>
        <h2 className="text-xl font-bold font-serif text-[#3B1F14]">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
          Looks like you haven&apos;t added any artisanal chocolates yet. Explore our freshly roasted nut delights and Kunafa bars!
        </p>
        <Link
          href="/menu"
          className="mt-5 px-6 py-3 bg-[#3B1F14] text-[#F5B83D] rounded-xl font-bold text-xs shadow-md hover:bg-black transition-all flex items-center gap-1.5"
        >
          <span>Explore Luxury Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;

  return (
    <div className="min-h-screen bg-[#FFF6EC] pb-24 text-[#3B1F14] px-4 pt-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#3B1F14]/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-[#3B1F14]">
            Your Chocolate Cart
          </h1>
          <p className="text-xs text-gray-500">
            {items.reduce((s, i) => s + i.quantity, 0)} items in your box
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Free Delivery Progress Notification */}
      <div className="mt-3 p-3 bg-white rounded-2xl border border-[#F5B83D]/40 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="flex items-center gap-1 text-[#3B1F14]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5B83D]" />
            {isFreeDelivery ? "FREE Delivery Unlocked!" : `₹${amountNeededForFreeDelivery} more for Free Delivery`}
          </span>
          <span className="text-[10px] text-gray-500 font-bold">
            {Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))}%
          </span>
        </div>
        <div className="w-full bg-[#FAF3EB] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF8A3D] to-[#2EC4B6] transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Items List */}
      <div className="mt-4 space-y-3">
        {items.map((item, idx) => (
          <div
            key={`${item.productId}-${item.variantName || "base"}-${idx}`}
            className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#3B1F14]/10 flex items-center gap-3"
          >
            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF3EB] flex-shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-[#3B1F14] truncate">
                {item.name}
              </h3>
              {item.variantName && (
                <span className="inline-block text-[10px] text-[#FF4F8B] font-semibold bg-[#FF4F8B]/10 px-1.5 py-0.2 rounded mt-0.5">
                  {item.variantName}
                </span>
              )}
              {item.customMessage && (
                <p className="text-[10px] text-gray-500 italic truncate mt-0.5">
                  &ldquo;{item.customMessage}&rdquo;
                </p>
              )}
              <div className="text-xs font-extrabold text-[#3B1F14] mt-1">
                ₹{item.price * item.quantity}
                {item.quantity > 1 && (
                  <span className="text-[10px] text-gray-400 font-normal ml-1">
                    (₹{item.price} each)
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center bg-[#FAF3EB] rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantName)}
                className="p-1.5 hover:bg-black/5 active:scale-95 text-[#3B1F14] tap-target flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold min-w-[20px] text-center text-[#3B1F14]">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantName)}
                className="p-1.5 hover:bg-black/5 active:scale-95 text-[#3B1F14] tap-target flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message on Box / Special Gifting Notes */}
      <div className="mt-4 bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 space-y-1.5">
        <label className="text-xs font-bold text-[#3B1F14] flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-[#FF4F8B]" />
          <span>Message on Box / Gift Note</span>
        </label>
        <textarea
          rows={2}
          value={boxMessage}
          onChange={(e) => setBoxMessage(e.target.value)}
          placeholder="e.g. Wishing you a very Happy Birthday! From Rohan & Family"
          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] bg-[#FFF6EC]/50 text-[#3B1F14] resize-none"
        />
        <p className="text-[10px] text-gray-400">
          We handwrite this message on our gold foil card and enclose it with your box.
        </p>
      </div>

      {/* Coupon Section */}
      <div className="mt-4 bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#3B1F14] flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#F5B83D]" />
            <span>Apply Coupon Code</span>
          </span>
          {appliedCoupon && (
            <button
              onClick={removeCoupon}
              className="text-[11px] text-red-500 font-bold hover:underline"
            >
              Remove
            </button>
          )}
        </div>

        {appliedCoupon ? (
          <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-1.5 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>&ldquo;{appliedCoupon.code}&rdquo; Applied</span>
            </div>
            <span className="font-extrabold text-emerald-700">
              -₹{appliedCoupon.discountAmount}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B1F14] uppercase tracking-wider font-semibold"
            />
            <button
              type="button"
              disabled={isApplying || !couponInput.trim()}
              onClick={() => handleApplyCoupon()}
              className="px-4 py-2.5 bg-[#3B1F14] text-[#F5B83D] rounded-xl text-xs font-bold hover:bg-black disabled:opacity-50 transition-all"
            >
              {isApplying ? "Checking..." : "Apply"}
            </button>
          </div>
        )}

        {couponFeedback && (
          <p
            className={`text-[11px] font-medium ${
              couponFeedback.type === "success" ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {couponFeedback.text}
          </p>
        )}

        {/* Suggested Quick Coupons */}
        {!appliedCoupon && (
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto hide-scrollbar text-[11px]">
            <span className="text-gray-400 text-[10px] font-medium flex-shrink-0">Try:</span>
            {["CHOCO10", "FIRSTBITE", "FUSION20"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleApplyCoupon(c)}
                className="flex-shrink-0 px-2 py-1 bg-[#FAF3EB] hover:bg-[#F5DEC0] border border-dashed border-[#F5B83D] text-[#3B1F14] font-bold rounded-lg transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bill Details Breakdown */}
      <div className="mt-4 bg-white p-4 rounded-2xl border border-[#3B1F14]/10 space-y-2 text-xs">
        <h4 className="font-bold text-[#3B1F14] text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
          Bill Summary
        </h4>

        <div className="flex justify-between text-gray-600">
          <span>Item Total</span>
          <span className="font-semibold text-[#3B1F14]">₹{subtotal}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Coupon Discount ({appliedCoupon.code})</span>
            <span>-₹{appliedCoupon.discountAmount}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600">
          <div>
            <span>Delivery Fee</span>
            <span className="block text-[10px] text-gray-400">Via Rapido / Porter Parcel</span>
          </div>
          <span>
            {deliveryFee === 0 ? (
              <span className="text-emerald-600 font-bold">FREE</span>
            ) : (
              `₹${deliveryFee}`
            )}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-extrabold text-[#3B1F14]">
          <span>To Pay</span>
          <span className="text-base text-[#3B1F14]">₹{total}</span>
        </div>
        <p className="text-[10px] text-gray-400 text-right">Taxes included in product price</p>
      </div>

      {/* Checkout Button */}
      <div className="mt-5">
        <Link
          href="/checkout"
          className="w-full min-h-[50px] bg-gradient-to-r from-[#FF4F8B] to-[#FF8A3D] text-white font-extrabold text-sm rounded-2xl shadow-xl hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-between px-5"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold opacity-90">Total Payable</span>
            <span className="text-base font-black">₹{total}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
