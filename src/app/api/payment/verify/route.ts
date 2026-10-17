import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { dispatchOrderNotifications } from "@/lib/notifications/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment parameters." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error(`❌ Invalid payment signature for order ${order.orderNumber}`);
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json(
        { success: false, error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // Mark order as PAID
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      include: { items: true },
    });

    // Dispatch WhatsApp and SMS notifications in background
    dispatchOrderNotifications({
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.customerName,
      customerPhone: updatedOrder.customerPhone,
      customerEmail: updatedOrder.customerEmail,
      houseFlat: updatedOrder.houseFlat,
      streetArea: updatedOrder.streetArea,
      landmark: updatedOrder.landmark,
      city: updatedOrder.city,
      pincode: updatedOrder.pincode,
      deliveryDate: updatedOrder.deliveryDate,
      deliverySlot: updatedOrder.deliverySlot,
      boxMessage: updatedOrder.boxMessage,
      specialNotes: updatedOrder.specialNotes,
      items: updatedOrder.items.map((i) => ({
        productName: i.productName,
        variantName: i.variantName,
        quantity: i.quantity,
        price: i.price,
        total: i.total,
      })),
      subtotal: updatedOrder.subtotal,
      deliveryFee: updatedOrder.deliveryFee,
      discount: updatedOrder.discount,
      total: updatedOrder.total,
      paymentStatus: "PAID",
      razorpayPaymentId: razorpay_payment_id,
    }).catch((notifErr) => {
      console.error("Background notification error:", notifErr);
    });

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      message: "Payment successfully verified and order confirmed!",
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
