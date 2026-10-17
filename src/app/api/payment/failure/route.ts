import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Only update if it wasn't already paid
    if (order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          specialNotes: order.specialNotes
            ? `${order.specialNotes} | Payment failed: ${reason || "User cancelled or gateway timeout"}`
            : `Payment failed: ${reason || "User cancelled or gateway timeout"}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order marked as payment pending / failed.",
      orderNumber: order.orderNumber,
    });
  } catch (err: any) {
    console.error("Payment failure recording error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
