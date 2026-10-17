import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    const orderNumber = searchParams.get("order")?.trim().toUpperCase();
    const phone = searchParams.get("phone")?.replace(/[^0-9]/g, "");

    let order = null;

    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
    } else if (orderNumber) {
      const where: any = { orderNumber };
      if (phone) {
        where.customerPhone = { contains: phone.slice(-10) };
      }
      order = await prisma.order.findFirst({
        where,
        include: { items: true },
      });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found. Please verify Order Number and Phone." },
        { status: 404 }
      );
    }

    // Step calculation
    const steps = [
      {
        key: "CONFIRMED",
        title: "Payment Confirmed",
        desc: "Order received & assigned to kitchen",
        done: true,
      },
      {
        key: "PREPARING",
        title: "Preparing in Kitchen",
        desc: "Roasting fresh nuts & hand-crafting chocolates",
        done: ["PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus),
      },
      {
        key: "OUT_FOR_DELIVERY",
        title: "Out for Delivery",
        desc: "Dispatched in temperature-safe packaging",
        done: ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus),
      },
      {
        key: "DELIVERED",
        title: "Delivered",
        desc: "Handed over to customer",
        done: order.orderStatus === "DELIVERED",
      },
    ];

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        houseFlat: order.houseFlat,
        streetArea: order.streetArea,
        city: order.city,
        pincode: order.pincode,
        deliveryDate: order.deliveryDate,
        deliverySlot: order.deliverySlot,
        boxMessage: order.boxMessage,
        specialNotes: order.specialNotes,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
        steps,
      },
    });
  } catch (err: any) {
    console.error("Order tracking error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to track order." },
      { status: 500 }
    );
  }
}
