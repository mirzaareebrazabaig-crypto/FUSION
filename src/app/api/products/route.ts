import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATIC_PRODUCTS } from "@/lib/productsData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const featuredOnly = searchParams.get("featured") === "true";
    const bestSellerOnly = searchParams.get("bestseller") === "true";

    let products: any[] = [];

    // 1. Try fetching from database first
    try {
      const where: any = {};

      if (categorySlug && categorySlug !== "all") {
        where.category = { slug: categorySlug };
      }

      if (featuredOnly) {
        where.featured = true;
      }

      if (bestSellerOnly) {
        where.bestSeller = true;
      }

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { shortDesc: { contains: search } },
          { description: { contains: search } },
        ];
      }

      products = await prisma.product.findMany({
        where,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      });
    } catch (dbErr) {
      console.warn("DB product fetch fallback:", dbErr);
    }

    // 2. If database has no products yet (e.g. freshly deployed to Vercel without local sqlite file), use built-in catalog
    if (!products || products.length === 0) {
      products = STATIC_PRODUCTS.filter((p) => {
        const matchesCategory =
          !categorySlug || categorySlug === "all" || p.category.slug === categorySlug;
        const matchesFeatured = !featuredOnly || p.featured;
        const matchesBestSeller = !bestSellerOnly || p.bestSeller;
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
          p.ingredients.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesFeatured && matchesBestSeller && matchesSearch;
      });
    }

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error("Products API error:", err);
    return NextResponse.json(
      { success: true, products: STATIC_PRODUCTS },
      { status: 200 }
    );
  }
}
