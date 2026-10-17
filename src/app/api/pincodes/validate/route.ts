import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get("pincode")?.trim();

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { serviceable: false, error: "Please enter a valid 6-digit Indian PIN code." },
        { status: 400 }
      );
    }

    const pinRecord = await prisma.serviceablePincode.findUnique({
      where: { pincode },
    });

    return NextResponse.json({
      serviceable: true,
      pincode,
      areaName: pinRecord?.areaName || "Hyderabad Metro & Suburbs",
      city: pinRecord?.city || "Hyderabad",
    });
  } catch (err: any) {
    console.error("Pincode validation error:", err);
    return NextResponse.json(
      { serviceable: false, error: "Error checking pincode" },
      { status: 500 }
    );
  }
}
