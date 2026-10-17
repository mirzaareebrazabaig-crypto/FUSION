import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    const orderNumber = searchParams.get("order")?.trim().toUpperCase();
    const phoneInput = searchParams.get("phone")?.replace(/[^0-9]/g, "");

    const buildSteps = (status: string) => [
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
        done: ["PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status),
      },
      {
        key: "OUT_FOR_DELIVERY",
        title: "Out for Delivery",
        desc: "Dispatched in temperature-safe packaging via Rapido / Porter",
        done: ["OUT_FOR_DELIVERY", "DELIVERED"].includes(status),
      },
      {
        key: "DELIVERED",
        title: "Delivered",
        desc: "Handed over to customer",
        done: status === "DELIVERED",
      },
    ];

    // Case 1: Tracking by Mobile Number directly (or list all orders for this customer)
    if (phoneInput && (!orderNumber && !orderId)) {
      const cleanPhone = phoneInput.slice(-10);
      const orders = await prisma.order.findMany({
        where: {
          customerPhone: { contains: cleanPhone },
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      if (!orders || orders.length === 0) {
        return NextResponse.json(
          { success: false, error: `No orders found for mobile number ending in ${cleanPhone}.` },
          { status: 404 }
        );
      }

      const formattedOrders = orders.map((ord) => ({
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        houseFlat: ord.houseFlat,
        streetArea: ord.streetArea,
        landmark: ord.landmark,
        city: ord.city,
        pincode: ord.pincode,
        deliveryDate: ord.deliveryDate,
        deliverySlot: ord.deliverySlot,
        boxMessage: ord.boxMessage,
        specialNotes: ord.specialNotes,
        orderStatus: ord.orderStatus,
        paymentStatus: ord.paymentStatus,
        subtotal: ord.subtotal,
        deliveryFee: ord.deliveryFee,
        discount: ord.discount,
        total: ord.total,
        createdAt: ord.createdAt,
        items: ord.items,
        steps: buildSteps(ord.orderStatus),
      }));

      // Return both latest order (for direct tracking) and list of all orders
      return NextResponse.json({
        success: true,
        order: formattedOrders[0],
        orders: formattedOrders,
        savedAddress: {
          name: orders[0].customerName,
          phone: orders[0].customerPhone,
          email: orders[0].customerEmail || "",
          houseFlat: orders[0].houseFlat,
          streetArea: orders[0].streetArea,
          landmark: orders[0].landmark || "",
          city: orders[0].city,
          pincode: orders[0].pincode,
        },
      });
    }

    // Case 2: Tracking by specific ID or Order Number (+ optional phone)
    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
    } else if (orderNumber) {
      const where: any = { orderNumber };
      if (phoneInput) {
        where.customerPhone = { contains: phoneInput.slice(-10) };
      }
      order = await prisma.order.findFirst({
        where,
        include: { items: true },
      });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found. Please verify your Order Number or Mobile Number." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        houseFlat: order.houseFlat,
        streetArea: order.streetArea,
        landmark: order.landmark,
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
        steps: buildSteps(order.orderStatus),
      },
      orders: [order],
    });
  } catch (err: any) {
    console.error("Order tracking error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to track order." },
      { status: 500 }
    );
  }
}
