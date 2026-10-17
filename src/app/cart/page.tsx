"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Gift,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    boxMessage,
    setBoxMessage,
  } = useCart();

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

      {/* Delivery Notice */}
      <div className="mt-3 p-3 bg-white rounded-2xl border border-[#3B1F14]/10 shadow-sm flex items-center gap-2.5 text-xs text-[#3B1F14]">
        <Truck className="w-4 h-4 text-[#FF4F8B] flex-shrink-0" />
        <div>
          <span className="font-bold">Doorstep Delivery Across Hyderabad</span>
          <p className="text-[11px] text-gray-500">
            Dispatched fresh via Rapido / Porter parcel service.
          </p>
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

      {/* Bill Details Breakdown */}
      <div className="mt-4 bg-white p-4 rounded-2xl border border-[#3B1F14]/10 space-y-2 text-xs">
        <h4 className="font-bold text-[#3B1F14] text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
          Bill Summary
        </h4>

        <div className="flex justify-between text-gray-600">
          <span>Item Total</span>
          <span className="font-semibold text-[#3B1F14]">₹{subtotal}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <div>
            <span className="font-medium text-[#3B1F14]">Delivery</span>
            <span className="block text-[10px] text-gray-400">Rapido / Porter parcel charges</span>
          </div>
          <span className="font-semibold text-[#3B1F14]">₹{deliveryFee}</span>
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
