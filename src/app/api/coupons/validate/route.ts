import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();
    const subtotal = parseFloat(searchParams.get("subtotal") || "0");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({
        success: false,
        error: `Coupon "${code}" is invalid or expired.`,
      });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({
        success: false,
        error: `Coupon "${code}" has expired.`,
      });
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        success: false,
        error: `Coupon "${code}" is only valid on orders above ₹${coupon.minOrderValue}. Add items worth ₹${Math.ceil(coupon.minOrderValue - subtotal)} more!`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        description: coupon.description,
        minOrderValue: coupon.minOrderValue,
      },
    });
  } catch (err: any) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
