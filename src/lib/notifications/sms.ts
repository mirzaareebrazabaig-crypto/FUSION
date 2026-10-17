import { prisma } from "../prisma";

interface SmsOrderData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  deliveryDate: string;
  deliverySlot: string;
}

export async function sendOwnerSms(order: SmsOrderData): Promise<{ success: boolean; simulated: boolean; response?: any; error?: string }> {
  const provider = process.env.SMS_PROVIDER || "twilio";
  const rawOwnerPhone = process.env.OWNER_SMS_NUMBER || "+919820012345";
  const ownerPhone = rawOwnerPhone.replace(/[^0-9+]/g, "");

  const smsText = `ChocoFusion Alert: New Order #${order.orderNumber} by ${order.customerName} for Rs.${order.total}. Delivery on ${order.deliveryDate} (${order.deliverySlot}). Phone: ${order.customerPhone}`;

  // Twilio Check
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  // MSG91 Check
  const msg91Key = process.env.MSG91_AUTH_KEY;

  const isTwilioConfigured = Boolean(twilioSid && twilioAuth && twilioPhone && !twilioSid.startsWith("ACxxx"));
  const isMsg91Configured = Boolean(msg91Key && msg91Key.length > 10);

  if (!isTwilioConfigured && !isMsg91Configured) {
    console.log("ℹ️ [SMS Provider - SIMULATED to Owner]");
    console.log(`To: ${ownerPhone}`);
    console.log(smsText);

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "SMS",
        recipientType: "OWNER",
        recipientPhone: ownerPhone,
        status: "SIMULATED",
        message: smsText,
        responseLog: `Simulated SMS (${provider} credentials not configured in .env)`,
      },
    });

    return { success: true, simulated: true, response: "Logged in simulation mode" };
  }

  // Twilio Flow
  if (provider === "twilio" && isTwilioConfigured) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");

      const params = new URLSearchParams();
      params.append("To", ownerPhone);
      params.append("From", twilioPhone!);
      params.append("Body", smsText);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Twilio SMS error");

      await prisma.notificationLog.create({
        data: {
          orderId: order.orderId,
          channel: "SMS",
          recipientType: "OWNER",
          recipientPhone: ownerPhone,
          status: "SUCCESS",
          message: smsText,
          responseLog: JSON.stringify(resData),
        },
      });

      return { success: true, simulated: false, response: resData };
    } catch (err: any) {
      console.error("❌ Twilio SMS to Owner failed:", err.message);
      await prisma.notificationLog.create({
        data: {
          orderId: order.orderId,
          channel: "SMS",
          recipientType: "OWNER",
          recipientPhone: ownerPhone,
          status: "FAILED",
          message: smsText,
          responseLog: err.message,
        },
      });
      return { success: false, simulated: false, error: err.message };
    }
  }

  // MSG91 Flow
  if (isMsg91Configured) {
    try {
      const url = "https://control.msg91.com/api/v5/flow/";
      const cleanPhone = ownerPhone.replace(/[^0-9]/g, "");

      const payload = {
        template_id: process.env.MSG91_TEMPLATE_ID,
        sender: process.env.MSG91_SENDER_ID || "CHOFUS",
        short_url: "0",
        recipients: [
          {
            mobiles: cleanPhone,
            order_id: order.orderNumber,
            customer_name: order.customerName,
            amount: order.total,
          },
        ],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          authkey: msg91Key!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      await prisma.notificationLog.create({
        data: {
          orderId: order.orderId,
          channel: "SMS",
          recipientType: "OWNER",
          recipientPhone: ownerPhone,
          status: res.ok ? "SUCCESS" : "FAILED",
          message: smsText,
          responseLog: JSON.stringify(resData),
        },
      });

      return { success: res.ok, simulated: false, response: resData };
    } catch (err: any) {
      console.error("❌ MSG91 SMS to Owner failed:", err.message);
      return { success: false, simulated: false, error: err.message };
    }
  }

  return { success: false, simulated: true, error: "No SMS provider configured" };
}

export async function sendCustomerSms(order: SmsOrderData): Promise<{ success: boolean; simulated: boolean; response?: any; error?: string }> {
  const provider = process.env.SMS_PROVIDER || "twilio";
  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

  const smsText = `ChocoFusion: Order #${order.orderNumber} confirmed! Scheduled for ${order.deliveryDate} (${order.deliverySlot}). Total: Rs.${order.total}. Track at ${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/track`;

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const isTwilioConfigured = Boolean(twilioSid && twilioAuth && twilioPhone && !twilioSid.startsWith("ACxxx"));

  if (!isTwilioConfigured) {
    console.log("ℹ️ [SMS Provider - SIMULATED to Customer]");
    console.log(`To: ${formattedPhone}`);
    console.log(smsText);

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "SMS",
        recipientType: "CUSTOMER",
        recipientPhone: formattedPhone,
        status: "SIMULATED",
        message: smsText,
        responseLog: "Simulated SMS fallback",
      },
    });

    return { success: true, simulated: true, response: "Logged in simulation mode" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const authHeader = "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", formattedPhone);
    params.append("From", twilioPhone!);
    params.append("Body", smsText);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || "Twilio SMS error");

    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "SMS",
        recipientType: "CUSTOMER",
        recipientPhone: formattedPhone,
        status: "SUCCESS",
        message: smsText,
        responseLog: JSON.stringify(resData),
      },
    });

    return { success: true, simulated: false, response: resData };
  } catch (err: any) {
    console.error("❌ Twilio SMS to Customer failed:", err.message);
    await prisma.notificationLog.create({
      data: {
        orderId: order.orderId,
        channel: "SMS",
        recipientType: "CUSTOMER",
        recipientPhone: formattedPhone,
        status: "FAILED",
        message: smsText,
        responseLog: err.message,
      },
    });
    return { success: false, simulated: false, error: err.message };
  }
}
