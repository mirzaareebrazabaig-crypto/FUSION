import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATIC_CATEGORIES } from "@/lib/productsData";

export async function GET() {
  try {
    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
      });
    } catch (dbErr) {
      console.warn("DB categories fallback:", dbErr);
    }

    if (!categories || categories.length === 0) {
      categories = STATIC_CATEGORIES;
    }

    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    console.error("Categories fetch error:", err);
    return NextResponse.json(
      { success: true, categories: STATIC_CATEGORIES },
      { status: 200 }
    );
  }
}
