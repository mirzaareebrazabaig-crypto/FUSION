import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phoneInput = searchParams.get("phone")?.replace(/[^0-9]/g, "");

    if (!phoneInput || phoneInput.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const cleanPhone = phoneInput.slice(-10);

    // Retrieve most recent order by phone
    const recentOrder = await prisma.order.findFirst({
      where: {
        customerPhone: { contains: cleanPhone },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!recentOrder) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: "No previous address found. New customer.",
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      profile: {
        name: recentOrder.customerName,
        phone: recentOrder.customerPhone,
        email: recentOrder.customerEmail || "",
        houseFlat: recentOrder.houseFlat,
        streetArea: recentOrder.streetArea,
        landmark: recentOrder.landmark || "",
        city: recentOrder.city,
        pincode: recentOrder.pincode,
      },
    });
  } catch (err: any) {
    console.error("Customer lookup error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to retrieve saved customer profile." },
      { status: 500 }
    );
  }
}
