import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      shortDesc,
      description,
      ingredients,
      price,
      originalPrice,
      weight,
      imageUrl,
      categoryId,
      isVeg = true,
      isEggless = true,
      inStock = true,
      featured = false,
      bestSeller = false,
    } = body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        shortDesc,
        description: description || shortDesc,
        ingredients: ingredients || "Cocoa Solids, Roasted Nuts, Milk Solids",
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        weight: weight || "1 Piece",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
        categoryId,
        isVeg,
        isEggless,
        inStock,
        featured,
        bestSeller,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error("Create product error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, inStock, price, originalPrice, name, shortDesc, featured, bestSeller } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (inStock !== undefined) dataToUpdate.inStock = inStock;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (originalPrice !== undefined) dataToUpdate.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (name !== undefined) dataToUpdate.name = name;
    if (shortDesc !== undefined) dataToUpdate.shortDesc = shortDesc;
    if (featured !== undefined) dataToUpdate.featured = featured;
    if (bestSeller !== undefined) dataToUpdate.bestSeller = bestSeller;

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("Update product error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
