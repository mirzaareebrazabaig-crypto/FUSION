import { prisma } from "../prisma";

interface OrderNotificationData {
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

export async function sendOwnerWhatsAppNotification(order: OrderNotificationData): Promise<{ success: boolean; simulated: boolean; response?: any; error?: string }> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const rawOwnerPhone = process.env.OWNER_WHATSAPP_NUMBER || "+919820012345";
  const ownerPhone = rawOwnerPhone.replace(/[^0-9]/g, "");

  const itemsListText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}* ${item.variantName ? `(${item.variantName})` : ""} × ${item.quantity} = ₹${item.total}`
    )
    .join("\n");

  const addressText = `${order.houseFlat}, ${order.streetArea}${order.landmark ? `, Near ${order.landmark}` : ""}, ${order.city} - ${order.pincode}`;

  const messageText = `🍫 *NEW CHOCOFUSION ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* ${order.orderNumber}
💳 *Payment Status:* ${order.paymentStatus} ${order.razorpayPaymentId ? `(${order.razorpayPaymentId})` : ""}
💰 *Total Amount:* ₹${order.total}

👤 *Customer Details:*
• Name: ${order.customerName}
• Phone: ${order.customerPhone}

📍 *Delivery Address:*
${addressText}

🗓 *Scheduled Delivery:*
• Date: ${order.deliveryDate}
• Time Slot: ${order.deliverySlot}

🛒 *Items Ordered:*
${itemsListText}
${order.boxMessage ? `\n💌 *Message on Box:* "${order.boxMessage}"` : ""}
${order.specialNotes ? `📝 *Special Notes:* "${order.specialNotes}"` : ""}

💵 *Billing Summary:*
• Subtotal: ₹${order.subtotal}
• Delivery: ₹${order.deliveryFee}
• Discount: ₹${order.discount}
• *Grand Total: ₹${order.total}*
━━━━━━━━━━━━━━━━━━━━
_Dispatch via ChocoFusion Admin: ${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin_`;

  // If no Meta credentials configured, record as SIMULATED
  if (!token || !phoneNumberId || token.startsWith("EAAB...")) {
    console.log("ℹ️ [WhatsApp Cloud API - SIMULATED to Owner]");
    console.log(`To: ${ownerPhone}`);
    console.log(messageText);

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "WHATSAPP",
        recipientType: "OWNER",
        recipientPhone: ownerPhone,
        status: "SIMULATED",
        message: messageText,
        responseLog: "Simulated sandbox mode (API token not configured in .env)",
      },
    });

    return { success: true, simulated: true, response: "Logged in simulation mode" };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: ownerPhone,
      type: "text",
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await res.json();

    if (!res.ok) {
      throw new Error(resData.error?.message || "WhatsApp Cloud API error");
    }

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "WHATSAPP",
        recipientType: "OWNER",
        recipientPhone: ownerPhone,
        status: "SUCCESS",
        message: messageText,
        responseLog: JSON.stringify(resData),
      },
    });

    return { success: true, simulated: false, response: resData };
  } catch (err: any) {
    console.error("❌ WhatsApp send to Owner failed:", err.message);

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "WHATSAPP",
        recipientType: "OWNER",
        recipientPhone: ownerPhone,
        status: "FAILED",
        message: messageText,
        responseLog: err.message,
      },
    });

    return { success: false, simulated: false, error: err.message };
  }
}

export async function sendCustomerWhatsAppNotification(order: OrderNotificationData): Promise<{ success: boolean; simulated: boolean; response?: any; error?: string }> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const customerPhone = order.customerPhone.replace(/[^0-9]/g, "");
  const formattedPhone = customerPhone.length === 10 ? `91${customerPhone}` : customerPhone;

  const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/track?order=${order.orderNumber}&phone=${order.customerPhone}`;

  const messageText = `🍫 *Order Confirmed! Thank you for choosing ChocoFusion!*

Hello ${order.customerName}, your delicious artisanal chocolate order *#${order.orderNumber}* has been confirmed and received by our kitchen.

🗓 *Scheduled Delivery:* ${order.deliveryDate} (${order.deliverySlot})
📍 *Address:* ${order.houseFlat}, ${order.streetArea}, ${order.city} - ${order.pincode}
💰 *Amount Paid:* ₹${order.total}

🔍 *Track your order live:*
${trackingUrl}

We are preparing your treats with single-origin cocoa and premium ingredients. For any assistance, reply to this message or call us at ${process.env.OWNER_WHATSAPP_NUMBER || "+91 98200 12345"}.`;

  if (!token || !phoneNumberId || token.startsWith("EAAB...")) {
    console.log("ℹ️ [WhatsApp Cloud API - SIMULATED to Customer]");
    console.log(`To: ${formattedPhone}`);
    console.log(messageText);

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "WHATSAPP",
        recipientType: "CUSTOMER",
        recipientPhone: formattedPhone,
        status: "SIMULATED",
        message: messageText,
        responseLog: "Simulated sandbox mode (API token not configured in .env)",
      },
    });

    return { success: true, simulated: true, response: "Logged in simulation mode" };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        preview_url: true,
        body: messageText,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await res.json();

    if (!res.ok) {
      throw new Error(resData.error?.message || "WhatsApp Cloud API error");
    }

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "WHATSAPP",
        recipientType: "CUSTOMER",
        recipientPhone: formattedPhone,
        status: "SUCCESS",
        message: messageText,
        responseLog: JSON.stringify(resData),
      },
    });

    return { success: true, simulated: false, response: resData };
  } catch (err: any) {
    console.error("❌ WhatsApp send to Customer failed:", err.message);

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "WHATSAPP",
        recipientType: "CUSTOMER",
        recipientPhone: formattedPhone,
        status: "FAILED",
        message: messageText,
        responseLog: err.message,
      },
    });

    return { success: false, simulated: false, error: err.message };
  }
}
