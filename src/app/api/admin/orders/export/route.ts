import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV Header
    const headers = [
      "Order Number",
      "Created At",
      "Customer Name",
      "Customer Phone",
      "Delivery Date",
      "Delivery Slot",
      "Address",
      "City",
      "Pincode",
      "Items Summary",
      "Subtotal",
      "Discount",
      "Delivery Fee",
      "Total Amount",
      "Payment Status",
      "Order Status",
      "Box Message",
      "Razorpay ID",
    ];

    const rows = orders.map((o) => {
      const itemsText = o.items
        .map((i) => `${i.productName} (${i.quantity}x)`)
        .join("; ");

      const addressText = `${o.houseFlat}, ${o.streetArea}${o.landmark ? `, ${o.landmark}` : ""}`;

      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleString("en-IN")}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        `"${o.deliveryDate}"`,
        `"${o.deliverySlot}"`,
        `"${addressText.replace(/"/g, '""')}"`,
        `"${o.city}"`,
        `"${o.pincode}"`,
        `"${itemsText.replace(/"/g, '""')}"`,
        o.subtotal,
        o.discount,
        o.deliveryFee,
        o.total,
        `"${o.paymentStatus}"`,
        `"${o.orderStatus}"`,
        `"${(o.boxMessage || "").replace(/"/g, '""')}"`,
        `"${o.razorpayPaymentId || ""}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="chocofusion-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("CSV Export error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to export orders" },
      { status: 500 }
    );
  }
}
