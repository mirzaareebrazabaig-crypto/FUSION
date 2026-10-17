import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const date = searchParams.get("date");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "ALL") {
      where.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus;
    }

    if (date) {
      where.deliveryDate = date;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        notificationLogs: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Summary statistics
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingPrep = orders.filter((o) => o.orderStatus === "CONFIRMED" || o.orderStatus === "PREPARING").length;
    const outForDelivery = orders.filter((o) => o.orderStatus === "OUT_FOR_DELIVERY").length;

    return NextResponse.json({
      success: true,
      orders,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        pendingPrep,
        outForDelivery,
      },
    });
  } catch (err: any) {
    console.error("Admin orders error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orderId, orderStatus, paymentStatus, specialNotes } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID required" },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (orderStatus) dataToUpdate.orderStatus = orderStatus;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (specialNotes !== undefined) dataToUpdate.specialNotes = specialNotes;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: dataToUpdate,
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Admin update order error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
