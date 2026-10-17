import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const featuredOnly = searchParams.get("featured") === "true";
    const bestSellerOnly = searchParams.get("bestseller") === "true";

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

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error("Products API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
