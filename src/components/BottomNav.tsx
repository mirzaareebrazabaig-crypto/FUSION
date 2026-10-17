"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Menu", href: "/menu", icon: UtensilsCrossed },
    { label: "Cart", href: "/cart", icon: ShoppingBag, badge: cartCount },
    { label: "Track", href: "/track", icon: Truck },
    { label: "Admin", href: "/admin", icon: ShieldCheck },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#24120B]/98 backdrop-blur-lg border-t border-[#F5B83D]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-safe">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center tap-target transition-all duration-200 ${
                isActive
                  ? "text-[#F5B83D]"
                  : "text-[#FFF6EC]/60 hover:text-[#FFF6EC]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-115 stroke-[2.5]" : "stroke-[1.75]"
                  }`}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FF4F8B] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight font-medium ${
                  isActive ? "text-[#F5B83D] font-bold" : "text-[#FFF6EC]/70"
                }`}
              >
                {item.label}
              </span>

              {/* Active gold dot indicator */}
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-[#F5B83D]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
