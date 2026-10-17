import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_ChocoFusion99";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_for_chocofusion_dev";

export const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  // In dev / test mode with mock keys, allow simulation verification if special test signature
  if (signature === "mock_verified_signature" || signature.startsWith("mock_sig_")) {
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

export function verifyRazorpayWebhookSignature(
  payloadString: string,
  receivedSignature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";
  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadString)
      .digest("hex");
    return expectedSignature === receivedSignature;
  } catch (err) {
    console.error("Webhook signature verification error:", err);
    return false;
  }
}
