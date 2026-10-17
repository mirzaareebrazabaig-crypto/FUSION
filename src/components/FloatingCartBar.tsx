"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const FloatingCartBar: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, total } = useCart();

  // Hide on checkout, cart, and confirmation pages
  if (
    cartCount === 0 ||
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-confirmed") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-[68px] md:bottom-6 left-3 right-3 md:left-auto md:right-8 md:w-96 z-40 animate-slide-up">
      <Link
        href="/cart"
        className="block bg-gradient-to-r from-[#24120B] via-[#3B1F14] to-[#24120B] text-white p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.35)] border border-[#F5B83D]/40 hover:border-[#F5B83D] transition-all active:scale-[0.98]"
      >
        {/* Rapido / Porter Notice Header */}
        <div className="mb-2 text-[10px] flex items-center justify-between text-[#FFF6EC]/90 border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1.5 text-[#F5B83D]">
            <Truck className="w-3.5 h-3.5" />
            <span className="font-semibold">Delivery via Rapido / Porter Parcel</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Hyderabad Metro</span>
        </div>

        {/* Main Bar Items & Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-[#FF4F8B] rounded-xl text-white">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#F5B83D] text-[#24120B] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <div>
              <div className="text-xs text-[#F7EAD7]/80 font-medium">
                {cartCount} {cartCount === 1 ? "item" : "items"} in cart
              </div>
              <div className="text-base font-extrabold text-[#FFF6EC]">
                ₹{total}{" "}
                <span className="text-[10px] font-normal text-[#F5B83D]">
                  + Rapido / Porter charges
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F5B83D] text-[#24120B] px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#DDA126] transition-colors">
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
};
