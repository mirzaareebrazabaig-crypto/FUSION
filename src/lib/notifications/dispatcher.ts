import { sendOwnerWhatsAppNotification, sendCustomerWhatsAppNotification } from "./whatsapp";
import { sendOwnerSms, sendCustomerSms } from "./sms";

interface OrderPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  houseFlat: string;
  streetArea: string;
  landmark?: string | null;
  city: string;
  pincode: string;
  deliveryDate: string;
  deliverySlot: string;
  boxMessage?: string | null;
  specialNotes?: string | null;
  items: Array<{
    productName: string;
    variantName?: string | null;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: string;
  razorpayPaymentId?: string | null;
}

export async function dispatchOrderNotifications(order: OrderPayload) {
  console.log(`🚀 Dispatching notifications for Order #${order.orderNumber}...`);
  const results = {
    ownerWhatsApp: { success: false, status: "pending" },
    ownerSms: { success: false, status: "pending" },
    customerWhatsApp: { success: false, status: "pending" },
    customerSms: { success: false, status: "pending" },
  };

  // 1. Send WhatsApp to Owner
  try {
    const waResult = await sendOwnerWhatsAppNotification(order);
    results.ownerWhatsApp = {
      success: waResult.success,
      status: waResult.simulated ? "simulated" : waResult.success ? "sent" : "failed",
    };
  } catch (err: any) {
    console.error("Owner WhatsApp dispatch exception:", err.message);
    results.ownerWhatsApp = { success: false, status: "failed" };
  }

  // 2. Send SMS to Owner (as fallback or addition)
  try {
    const smsResult = await sendOwnerSms({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      total: order.total,
      deliveryDate: order.deliveryDate,
      deliverySlot: order.deliverySlot,
    });
    results.ownerSms = {
      success: smsResult.success,
      status: smsResult.simulated ? "simulated" : smsResult.success ? "sent" : "failed",
    };
  } catch (err: any) {
    console.error("Owner SMS dispatch exception:", err.message);
    results.ownerSms = { success: false, status: "failed" };
  }

  // 3. Send WhatsApp to Customer
  try {
    const custWa = await sendCustomerWhatsAppNotification(order);
    results.customerWhatsApp = {
      success: custWa.success,
      status: custWa.simulated ? "simulated" : custWa.success ? "sent" : "failed",
    };
  } catch (err: any) {
    console.error("Customer WhatsApp dispatch exception:", err.message);
    results.customerWhatsApp = { success: false, status: "failed" };
  }

  // 4. Send SMS to Customer
  try {
    const custSms = await sendCustomerSms({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      total: order.total,
      deliveryDate: order.deliveryDate,
      deliverySlot: order.deliverySlot,
    });
    results.customerSms = {
      success: custSms.success,
      status: custSms.simulated ? "simulated" : custSms.success ? "sent" : "failed",
    };
  } catch (err: any) {
    console.error("Customer SMS dispatch exception:", err.message);
    results.customerSms = { success: false, status: "failed" };
  }

  return results;
}
