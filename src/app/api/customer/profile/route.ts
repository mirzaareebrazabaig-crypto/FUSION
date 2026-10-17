import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Lookup Customer by Phone Number
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

    // First check Customer table
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    // If not yet in customer table, fallback to recent orders
    if (!customer) {
      const recentOrder = await prisma.order.findFirst({
        where: { customerPhone: { contains: cleanPhone } },
        orderBy: { createdAt: "desc" },
      });

      if (recentOrder) {
        // Automatically migrate to Customer table
        customer = await prisma.customer.create({
          data: {
            phone: cleanPhone,
            name: recentOrder.customerName,
            email: recentOrder.customerEmail,
            houseFlat: recentOrder.houseFlat,
            streetArea: recentOrder.streetArea,
            landmark: recentOrder.landmark,
            city: recentOrder.city,
            pincode: recentOrder.pincode,
          },
        });
      }
    }

    if (!customer) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: "New customer. Please provide delivery address.",
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      profile: {
        phone: customer.phone,
        name: customer.name || "",
        email: customer.email || "",
        houseFlat: customer.houseFlat || "",
        streetArea: customer.streetArea || "",
        landmark: customer.landmark || "",
        city: customer.city || "Hyderabad",
        pincode: customer.pincode || "",
      },
    });
  } catch (err: any) {
    console.error("Customer lookup error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve customer details." },
      { status: 500 }
    );
  }
}

// 2. POST: Save / Update Customer Address directly in backend DB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name, email, houseFlat, streetArea, landmark, city, pincode } = body;

    const cleanPhone = phone?.replace(/[^0-9]/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Valid 10-digit mobile number required." },
        { status: 400 }
      );
    }

    const savedCustomer = await prisma.customer.upsert({
      where: { phone: cleanPhone },
      update: {
        name: name || undefined,
        email: email || undefined,
        houseFlat: houseFlat || undefined,
        streetArea: streetArea || undefined,
        landmark: landmark || undefined,
        city: city || "Hyderabad",
        pincode: pincode || undefined,
      },
      create: {
        phone: cleanPhone,
        name: name || "",
        email: email || "",
        houseFlat: houseFlat || "",
        streetArea: streetArea || "",
        landmark: landmark || "",
        city: city || "Hyderabad",
        pincode: pincode || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer address saved in backend.",
      customer: savedCustomer,
    });
  } catch (err: any) {
    console.error("Save customer error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save customer details in backend." },
      { status: 500 }
    );
  }
}
