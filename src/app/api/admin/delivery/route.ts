import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [slots, pincodes, blockedDates, coupons, settings] = await Promise.all([
      prisma.deliverySlot.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.serviceablePincode.findMany({ orderBy: { pincode: "asc" } }),
      prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
      prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.storeSetting.findMany(),
    ]);

    return NextResponse.json({
      success: true,
      slots,
      pincodes,
      blockedDates,
      coupons,
      settings,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "pincode") {
      const created = await prisma.serviceablePincode.create({
        data: {
          pincode: data.pincode,
          areaName: data.areaName,
          city: data.city || "Mumbai",
          deliveryFeeOverride: data.deliveryFeeOverride ? parseFloat(data.deliveryFeeOverride) : null,
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, created });
    }

    if (type === "slot") {
      const created = await prisma.deliverySlot.create({
        data: {
          startTime: data.startTime,
          endTime: data.endTime,
          label: data.label,
          maxOrdersPerDay: parseInt(data.maxOrdersPerDay || "25"),
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, created });
    }

    if (type === "blockedDate") {
      const created = await prisma.blockedDate.create({
        data: {
          date: data.date,
          reason: data.reason || "Kitchen Closed",
        },
      });
      return NextResponse.json({ success: true, created });
    }

    if (type === "coupon") {
      const created = await prisma.coupon.create({
        data: {
          code: data.code.toUpperCase(),
          discountType: data.discountType || "PERCENTAGE",
          discountValue: parseFloat(data.discountValue),
          minOrderValue: parseFloat(data.minOrderValue || "0"),
          maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
          description: data.description,
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, created });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ success: false, error: "Type and ID required" }, { status: 400 });
    }

    if (type === "pincode") {
      await prisma.serviceablePincode.delete({ where: { id } });
    } else if (type === "slot") {
      await prisma.deliverySlot.delete({ where: { id } });
    } else if (type === "blockedDate") {
      await prisma.blockedDate.delete({ where: { id } });
    } else if (type === "coupon") {
      await prisma.coupon.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
