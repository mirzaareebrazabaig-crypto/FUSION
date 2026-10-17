"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Sparkles, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, ProductData } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalProduct, setActiveModalProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenuData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.products);
        if (catData.success) setCategories(catData.categories);
      } catch (err) {
        console.error("Failed to load menu:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMenuData();
  }, []);

  // Sync category param if query changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category?.slug === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFF6EC] pb-24 text-[#3B1F14]">
      {/* Top Banner & Search Section */}
      <div className="bg-[#3B1F14] text-[#FFF6EC] pt-4 pb-5 px-4 rounded-b-3xl shadow-md border-b border-[#F5B83D]/30">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight">
                Luxury Chocolate Menu
              </h1>
              <p className="text-[11px] text-[#F7EAD7]/80">
                Freshly crafted with roasted nuts &amp; Belgian cocoa • Standard portions 100g (or Each as noted) • Delivering across Hyderabad
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-[#F5B83D] text-[#1A0C06] px-2 py-0.5 rounded-full">
                Hyderabad
              </span>
              <span className="text-[10px] font-bold bg-[#FF4F8B] text-white px-2 py-0.5 rounded-full">
                100% Veg
              </span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Roasted Almonds, Kunafa, Hampers..."
              className="w-full pl-10 pr-9 py-2.5 bg-white text-[#3B1F14] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4F8B] placeholder:text-gray-400 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        {/* Horizontally Scrollable Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-[#3B1F14] text-[#F5B83D] shadow-sm border border-[#F5B83D]/40"
                : "bg-white text-[#3B1F14] border border-[#3B1F14]/10 hover:bg-gray-50"
            }`}
          >
            All Items ({products.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#3B1F14] text-[#F5B83D] shadow-sm border border-[#F5B83D]/40"
                    : "bg-white text-[#3B1F14] border border-[#3B1F14]/10 hover:bg-gray-50"
                }`}
              >
                {cat.name} ({cat._count?.products || 0})
              </button>
            );
          })}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-gray-500 my-3">
          <span>
            Showing <b className="text-[#3B1F14]">{filteredProducts.length}</b> delights
          </span>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-[#FF4F8B] font-semibold hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* 2-Column Mobile Grid (3-col on tablets, 4-col on desktop) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-64 p-3 animate-shimmer"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#3B1F14]/10 my-6">
            <p className="text-sm font-semibold text-[#3B1F14]">
              No chocolate creations found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-gray-400 mt-1">Try another search keyword or browse all categories.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 px-4 py-2 bg-[#3B1F14] text-[#F5B83D] rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Bottom-Sheet Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF6EC] p-4 text-center">Loading ChocoFusion Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
