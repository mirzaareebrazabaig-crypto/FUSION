"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  MessageCircle,
  Search,
  MapPin,
  Sparkles,
  Phone,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Full Menu", href: "/menu" },
    { label: "Nut Delights", href: "/menu?category=nut-delights" },
    { label: "Viral Kunafa", href: "/menu?category=kunafa-collection" },
    { label: "Gift Hampers", href: "/menu?category=gift-hampers" },
    { label: "Track Order", href: "/track" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <>
      {/* Top Luxury Announcement Ribbon */}
      <div className="bg-[#180A05] text-[#F5B83D] text-[11px] sm:text-xs py-2 px-4 border-b border-[#F5B83D]/20 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4F8B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4F8B]" />
            </span>
            <span className="font-medium tracking-wide text-[#FFF6EC]">
              Festive Gifting Live • Fresh Daily Batches • Delivery via Rapido / Porter Parcel Charges
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-[#F7EAD7]/75">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF8A3D]" /> Delivering Across Hyderabad Metro
            </span>
            <span className="text-gray-500">|</span>
            <a
              href="https://wa.me/919986120044"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2EC4B6] transition-colors flex items-center gap-1 text-[#2EC4B6] font-semibold"
            >
              <MessageCircle className="w-3 h-3 fill-current" /> Concierge: +91 9986120044
            </a>
          </div>
        </div>
      </div>

      {/* Main High-End Navigation Bar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#24120B] via-[#2D160C] to-[#1F0E07] border-b border-[#F5B83D]/30 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo & Royal Monogram */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#F5B83D] shadow-[0_0_15px_rgba(245,184,61,0.35)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0 bg-[#1A0C06]">
              <Image
                src="/logo.jpeg"
                alt="ChocoFusion Brand Emblem"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#FFF6EC] font-serif">
                  Choco<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B83D] via-[#FF8A3D] to-[#F5B83D]">Fusion</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest bg-gradient-to-r from-[#FF4F8B] to-[#FF8A3D] text-white px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                  LUXURY MENU
                </span>
              </div>
              <span className="text-[10px] text-[#F7EAD7]/70 font-medium tracking-wide hidden xs:block">
                Handcrafted Artisanal Chocolatier • Hyderabad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Laptop / Widescreen) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || (link.href.includes("?") && pathname === "/menu");

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#F5B83D] to-[#FF8A3D] text-[#1A0C06] shadow-md"
                      : "text-[#FFF6EC]/85 hover:text-[#FFF6EC] hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp VIP Ordering CTA (Desktop & Mobile) */}
            <a
              href="https://wa.me/919986120044?text=Hi%20ChocoFusion%2C%20I%20would%20like%20to%20order%20chocolates!"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#2EC4B6] border border-[#2EC4B6]/40 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Order</span>
            </a>

            {/* Quick Menu Button on Mobile */}
            <Link
              href="/menu"
              className="sm:hidden px-3 py-1.5 bg-[#F5B83D] text-[#1A0C06] rounded-full text-xs font-bold shadow-sm"
            >
              Menu
            </Link>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#FF4F8B] to-[#FF8A3D] text-white rounded-full font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#F5B83D] text-[#1A0C06] text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#FFF6EC] hover:bg-white/10 rounded-xl"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu when toggled */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1A0C06] border-t border-[#F5B83D]/20 px-4 py-3 space-y-2 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold text-[#FFF6EC]/90 hover:text-[#F5B83D] border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex items-center justify-between text-xs text-[#F7EAD7]/70">
              <span>Direct WhatsApp: <b>9986120044</b></span>
              <a
                href="https://wa.me/919986120044"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2EC4B6] font-bold"
              >
                Chat Now →
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
