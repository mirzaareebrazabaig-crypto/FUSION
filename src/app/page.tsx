"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Truck,
  Flame,
  MessageCircle,
  Clock,
  Gift,
  ChevronRight,
  Layers,
  Award,
} from "lucide-react";
import { ProductCard, ProductData } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeModalProduct, setActiveModalProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products?featured=true"),
          fetch("/api/categories"),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setFeaturedProducts(prodData.products);
        if (catData.success) setCategories(catData.categories);
      } catch (err) {
        console.error("Home page fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF6EC] text-[#3B1F14]">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1F0E07] via-[#2A140B] to-[#180A05] text-[#FFF6EC] pt-8 pb-16 px-4 rounded-b-[3rem] shadow-2xl border-b border-[#F5B83D]/30">
        {/* Decorative Luxury Glows */}
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-[#F5B83D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-12 w-96 h-96 bg-[#FF4F8B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-[#0A3F31]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Circular Brand Logo Emblem with Gold Halo */}
          <div className="relative group cursor-pointer mb-5">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#F5B83D] via-[#FF8A3D] to-[#F5B83D] rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[#F5B83D] shadow-2xl bg-[#1A0C06] p-0.5">
              <Image
                src="/logo.jpeg"
                alt="ChocoFusion Luxury Emblem"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Luxury Crown Pill */}
          <div className="inline-flex items-center gap-2 bg-[#F5B83D]/15 border border-[#F5B83D]/50 text-[#F5B83D] text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 backdrop-blur-md shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4F8B] animate-spin" style={{ animationDuration: "6s" }} />
            <span>Luxury Handcrafted Chocolatier • Hyderabad</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif tracking-tight text-[#FFF6EC] max-w-3xl leading-[1.15]">
            Artisanal Chocolate. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B83D] via-[#FFA85C] to-[#FF4F8B]">
              Freshly Roasted Nuts.
            </span>
          </h1>

          {/* Subtitle / Brand Promise */}
          <p className="mt-4 text-xs sm:text-base text-[#F7EAD7]/85 max-w-xl leading-relaxed font-normal">
            Indulge in our signature <b>Roasted Almond Delights</b>, crunchy nut fusions, and the viral <b>Dubai Pistachio Kunafa Bars</b>. Handcrafted fresh every morning with Grand Cru cocoa and premium dry fruits.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            <Link
              href="/menu"
              className="w-full sm:w-auto flex-1 min-h-[52px] bg-gradient-to-r from-[#FF4F8B] via-[#FF8A3D] to-[#F5B83D] text-[#1A0C06] font-black text-sm rounded-2xl shadow-[0_8px_25px_rgba(255,79,139,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 px-6"
            >
              <span>Explore Luxury Menu</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <a
              href="https://wa.me/919986120044?text=Hi%20ChocoFusion%2C%20I%20would%20like%20to%20order%20chocolates!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[52px] px-6 bg-white/10 hover:bg-white/20 text-[#2EC4B6] font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md border border-[#2EC4B6]/40 flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp (9986120044)</span>
            </a>
          </div>

          {/* Trust Highlights Bar */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-6 text-[11px] sm:text-xs text-[#F7EAD7]/80 border-t border-white/10 pt-5 w-full max-w-lg">
            <div className="flex flex-col items-center">
              <span className="font-bold text-[#F5B83D] text-sm sm:text-base">100%</span>
              <span className="text-[10px] text-gray-300">Veg & Eggless</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10 px-2">
              <span className="font-bold text-amber-400 text-sm sm:text-base flex items-center gap-0.5">
                4.9★
              </span>
              <span className="text-[10px] text-gray-300">2,500+ Happy Orders</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[#2EC4B6] text-sm sm:text-base">2-Hour</span>
              <span className="text-[10px] text-gray-300">Time Slot Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CATEGORY CHIPS ===================== */}
      <section className="py-6 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-[#3B1F14] font-serif">
              Curated Collections
            </h2>
            <p className="text-xs text-gray-500">Pick your favorite flavor profile</p>
          </div>
          <Link
            href="/menu"
            className="text-xs font-bold text-[#FF4F8B] flex items-center gap-0.5 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scrollable Horizontal Category Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link
            href="/menu"
            className="flex-shrink-0 bg-[#3B1F14] text-[#F5B83D] px-5 py-3 rounded-2xl text-xs font-bold shadow-md border border-[#F5B83D]/40 flex items-center gap-2 hover:bg-black transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#FF4F8B]" />
            <span>Complete Menu</span>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="flex-shrink-0 bg-white hover:bg-[#FAF3EB] text-[#3B1F14] px-5 py-3 rounded-2xl text-xs font-bold shadow-sm border border-[#3B1F14]/10 transition-all flex items-center gap-2 hover:shadow-md"
            >
              <span>{cat.name}</span>
              <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-1.5 py-0.2 rounded-full">
                {cat._count?.products || 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== FEATURED PRODUCTS (2-Col Mobile / 4-Col Desktop) ===================== */}
      <section className="py-4 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-[#FF4F8B] uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-current text-[#FF8A3D]" />
              <span>Signature Best Sellers</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#3B1F14] font-serif mt-0.5">
              Handcrafted Indulgences
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs font-bold text-[#FF4F8B] hover:underline hidden sm:block"
          >
            Explore 12+ Creations →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-72 p-4 animate-shimmer border border-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===================== LUXURY VIRAL KUNAFA SPOTLIGHT ===================== */}
      <section className="py-8 px-4 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#0B2E24] via-[#103D31] to-[#1A0C06] text-white p-6 sm:p-12 shadow-2xl border-2 border-[#F5B83D]/40">
          {/* Subtle ornate background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5B83D]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-[#F5B83D] text-[#0B2E24] text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Viral Dubai Sensation
            </span>

            <h3 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#FFF6EC] leading-tight">
              Dubai Pistachio &amp; Kunafa Chocolate Bar
            </h3>

            <p className="text-xs sm:text-sm text-[#F7EAD7]/90 leading-relaxed font-light">
              Crispy browned kataifi pastry fried to a golden crunch in pure clarified butter, blended with rich Sicilian pistachio cream and tahini, encased inside a thick Belgian milk chocolate shell.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#F5B83D]">₹349</span>
                <span className="text-xs text-gray-300 line-through">₹399</span>
                <span className="text-[10px] bg-red-500/80 text-white font-bold px-1.5 py-0.5 rounded">
                  SAVE ₹50
                </span>
              </div>

              <Link
                href="/menu?category=kunafa-collection"
                className="bg-gradient-to-r from-[#F5B83D] to-[#FF8A3D] text-[#1A0C06] text-xs sm:text-sm font-extrabold px-6 py-3 rounded-xl transition-transform active:scale-95 shadow-xl hover:brightness-110 flex items-center gap-1.5"
              >
                <span>Order Kunafa Bar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHY CHOCOFUSION (4 Luxury Pillars) ===================== */}
      <section className="py-12 px-4 bg-[#FAF3EB] border-y border-[#3B1F14]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF8A3D]">
              Artisanal Craftsmanship
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-serif text-[#3B1F14] mt-1">
              Why ChocoFusion Tastes Superior
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1.5">
              We never use vegetable oils or industrial compound chocolate. Every bite is genuine grand-cru cocoa and fresh nuts.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3B1F14]/5 text-center flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#FF4F8B]/10 text-[#FF4F8B] flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h4 className="font-extrabold text-sm text-[#3B1F14]">Handmade in Hyderabad</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Fresh daily batches crafted by master chocolatiers with passion.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3B1F14]/5 text-center flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F5B83D]/15 text-[#DDA126] flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#3B1F14]">Freshly Roasted Nuts</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                California almonds, Mangalore cashews &amp; Turkish hazelnuts roasted in-house.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3B1F14]/5 text-center flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#3B1F14]">100% Veg &amp; Eggless</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Pure cocoa butter, gelatin-free, preservative-free indulgence.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3B1F14]/5 text-center flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#FF8A3D]/10 text-[#FF8A3D] flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#3B1F14]">Time Slot Delivery</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Select your 2-hour delivery window across Hyderabad with ice-pack protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CUSTOM GIFT HAMPERS HIGHLIGHT ===================== */}
      <section className="py-10 px-4 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#3B1F14]/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4F8B] bg-[#FF4F8B]/10 px-2.5 py-1 rounded-full">
              Bespoke Celebrations
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#3B1F14]">
              Customized Gift Hampers &amp; Wedding Favors
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Wrapped in plush velvet-touch keepsake boxes with personalized handwritten gold-foil greeting cards. Perfect for corporate gifting, birthdays, Diwali, and luxury weddings.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/menu?category=gift-hampers"
                className="px-5 py-2.5 bg-[#3B1F14] text-[#F5B83D] font-bold text-xs rounded-xl hover:bg-black transition-colors"
              >
                Browse Hampers (₹800 – ₹1399)
              </Link>
              <a
                href="https://wa.me/919986120044?text=Hi%20ChocoFusion%2C%20I%20am%20looking%20for%20bulk%2Fcustom%20gift%20hampers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#0E7A70] flex items-center gap-1 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Bulk Inquiry via WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="relative w-full md:w-80 h-56 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
              alt="Luxury Hamper"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* ===================== VERIFIED REVIEWS ===================== */}
      <section className="py-10 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#3B1F14]">
            Celebrated by Chocolate Connoisseurs
          </h2>
          <p className="text-xs text-gray-500 mt-1">Real reviews from Hyderabad food lovers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3B1F14]/10 space-y-2">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              &ldquo;The Kunafa Big Bar was sensational! The crunch of the kataifi pastry with pistachio butter blew everyone away at our party. Fresh and high-end.&rdquo;
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#3B1F14]">Priya Sharma</span>
              <span className="text-[10px] text-gray-400">Jubilee Hills</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3B1F14]/10 space-y-2">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              &ldquo;Ordered Roasted Almond and All Nuts Festival delights. The nuts were deeply roasted and super crunchy, coated in rich cocoa. 10/10.&rdquo;
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#3B1F14]">Rohit Mehta</span>
              <span className="text-[10px] text-gray-400">Banjara Hills</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#3B1F14]/10 space-y-2">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              &ldquo;Delivery was on time in the exact 12-2 PM slot. The handwritten note inside the box gave it such an elegant, personalized feel.&rdquo;
            </p>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#3B1F14]">Ananya &amp; Kabir</span>
              <span className="text-[10px] text-gray-400">Gachibowli</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-[#180A05] text-[#FFF6EC] pt-12 pb-24 md:pb-12 px-4 border-t border-[#F5B83D]/30">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border-b border-white/10 pb-8">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#F5B83D] bg-[#24120B]">
                <Image src="/logo.jpeg" alt="ChocoFusion" fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-black font-serif text-[#FFF6EC]">
                  Choco<span className="text-[#F5B83D]">Fusion</span>
                </h3>
                <p className="text-xs text-[#F7EAD7]/70">
                  Premium Handcrafted Chocolates • Freshly Roasted Nuts • Finest Dry Fruits
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/919986120044"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2EC4B6] hover:bg-[#28B0A3] text-[#1A0C06] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp: +91 9986120044</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-[#F7EAD7]/80">
            <div>
              <h5 className="font-extrabold text-[#F5B83D] mb-3 uppercase text-[11px] tracking-wider">
                Explore Menu
              </h5>
              <ul className="space-y-2 text-xs">
                <li><Link href="/menu" className="hover:text-white">All Chocolates</Link></li>
                <li><Link href="/menu?category=nut-delights" className="hover:text-white">Roasted Nut Delights</Link></li>
                <li><Link href="/menu?category=kunafa-collection" className="hover:text-white">Dubai Kunafa Bars</Link></li>
                <li><Link href="/menu?category=dry-fruit-bars" className="hover:text-white">Dry Fruit Bars</Link></li>
                <li><Link href="/menu?category=gift-hampers" className="hover:text-white">Luxury Gift Hampers</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-extrabold text-[#F5B83D] mb-3 uppercase text-[11px] tracking-wider">
                Customer Care
              </h5>
              <ul className="space-y-2 text-xs">
                <li><Link href="/track" className="hover:text-white">Track Live Order</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us &amp; Kitchen</Link></li>
                <li><Link href="/cart" className="hover:text-white">View Shopping Bag</Link></li>
                <li><a href="https://wa.me/919986120044" className="hover:text-white">WhatsApp Concierge</a></li>
              </ul>
            </div>

            <div className="col-span-2">
              <h5 className="font-extrabold text-[#F5B83D] mb-3 uppercase text-[11px] tracking-wider">
                Freshly Handcrafted in Hyderabad
              </h5>
              <p className="text-xs leading-relaxed text-[#F7EAD7]/75">
                Every batch is made fresh to order. We deliver across Hyderabad with insulated packaging to ensure your chocolates arrive in pristine condition. 100% vegetarian, eggless, and made with pure cocoa butter.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Certified FSSAI Standards • Handcrafted with love</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 pt-6 border-t border-white/5">
            © {new Date().getFullYear()} ChocoFusion. All Rights Reserved. Artisanal Luxury Chocolatier.
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
}
