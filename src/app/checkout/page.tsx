"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, boxMessage, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [houseFlat, setHouseFlat] = useState("");
  const [streetArea, setStreetArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("500034");
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean;
    serviceable: boolean;
    areaName?: string;
    error?: string;
  }>({ checked: false, serviceable: true });

  // Date and Time Slot
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [minDateString, setMinDateString] = useState("");

  // Process & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrderData, setCreatedOrderData] = useState<any | null>(null);
  const [paymentFailedState, setPaymentFailedState] = useState<boolean>(false);

  // Calculate minimum delivery date (24h lead time from now)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    const formattedTomorrow = `${yyyy}-${mm}-${dd}`;
    setMinDateString(formattedTomorrow);
    setDeliveryDate(formattedTomorrow);
  }, []);

  // Fetch slots and blocked dates
  useEffect(() => {
    async function fetchSlots() {
      if (!deliveryDate) return;
      try {
        const res = await fetch(`/api/delivery-slots?date=${deliveryDate}`);
        const data = await res.json();
        if (data.success) {
          setAvailableSlots(data.slots || []);
          setBlockedDates(data.blockedDates || []);
          // Set first available slot
          const firstAvailable = data.slots.find((s: any) => !s.isFull);
          if (firstAvailable) {
            setDeliverySlot(firstAvailable.label);
          }
        }
      } catch (err) {
        console.error("Error fetching delivery slots:", err);
      }
    }
    fetchSlots();
  }, [deliveryDate]);

  // Validate pincode automatically when 6 digits are typed
  const checkPincode = async (codeToCheck: string) => {
    if (!/^\d{6}$/.test(codeToCheck)) {
      setPincodeStatus({ checked: true, serviceable: false, error: "Enter a valid 6-digit PIN code." });
      return;
    }

    try {
      const res = await fetch(`/api/pincodes/validate?pincode=${codeToCheck}`);
      const data = await res.json();
      if (data.serviceable) {
        setPincodeStatus({
          checked: true,
          serviceable: true,
          areaName: data.areaName,
        });
      } else {
        setPincodeStatus({
          checked: true,
          serviceable: false,
          error: data.error || "Currently not serviceable.",
        });
      }
    } catch {
      setPincodeStatus({ checked: true, serviceable: true });
    }
  };

  useEffect(() => {
    if (pincode.length === 6) {
      checkPincode(pincode);
    }
  }, [pincode]);

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold font-serif text-[#3B1F14]">No Items to Checkout</h2>
        <p className="text-xs text-gray-500 mt-1">Please add chocolate treats to your cart first.</p>
        <Link
          href="/menu"
          className="mt-4 px-5 py-2.5 bg-[#3B1F14] text-[#F5B83D] rounded-xl font-bold text-xs"
        >
          View Menu
        </Link>
      </div>
    );
  }

  // Handle Razorpay Online Payment Flow
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPaymentFailedState(false);

    // Validations
    if (!customerName.trim() || !customerPhone.trim() || !houseFlat.trim() || !streetArea.trim() || !pincode.trim()) {
      setErrorMessage("Please fill in all mandatory customer and address details.");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (pincodeStatus.checked && !pincodeStatus.serviceable) {
      setErrorMessage("Please provide a serviceable Hyderabad PIN code.");
      return;
    }

    if (!deliveryDate || !deliverySlot) {
      setErrorMessage("Please choose a delivery date and preferred time slot.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Order on Backend
      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone: cleanPhone,
          customerEmail,
          houseFlat,
          streetArea,
          landmark,
          city,
          pincode,
          deliveryDate,
          deliverySlot,
          boxMessage,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            variantName: i.variantName,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initiate order.");
      }

      setCreatedOrderData(orderData);

      // 2. Open Razorpay Modal or Dev Simulation
      if (typeof window.Razorpay !== "undefined" && orderData.isLiveRazorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "ChocoFusion",
          description: `Order #${orderData.orderNumber}`,
          image: "/logo.jpeg",
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: orderData.customer.name,
            contact: orderData.customer.phone,
            email: orderData.customer.email || "",
          },
          theme: {
            color: "#3B1F14",
          },
          handler: async function (response: any) {
            // Verify payment on server
            await verifyPayment({
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: async function () {
              setIsSubmitting(false);
              setPaymentFailedState(true);
              await fetch("/api/payment/failure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  reason: "Customer cancelled payment window",
                }),
              });
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", async function (response: any) {
          setIsSubmitting(false);
          setPaymentFailedState(true);
          await fetch("/api/payment/failure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              reason: response.error?.description || "Payment failed at gateway",
            }),
          });
        });
        rzp.open();
      } else {
        // Test / Sandbox mode fallback
        console.log("ℹ️ Running in Seamless Test / Sandbox Razorpay Mode");
        await verifyPayment({
          orderId: orderData.orderId,
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: "mock_verified_signature",
        });
      }
    } catch (err: any) {
      console.error("Checkout process error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  // Verify Payment on Backend
  const verifyPayment = async (payload: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        clearCart();
        router.push(`/order-confirmed?orderId=${payload.orderId}`);
      } else {
        throw new Error(verifyData.error || "Payment verification failed.");
      }
    } catch (err: any) {
      setPaymentFailedState(true);
      setErrorMessage(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6EC] pb-24 text-[#3B1F14] px-4 pt-4 max-w-5xl mx-auto">
      {/* Load Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Header */}
      <div className="border-b border-[#3B1F14]/10 pb-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-black font-serif text-[#3B1F14]">
          Checkout & Scheduled Delivery
        </h1>
        <p className="text-xs text-gray-500">
          Secure online payment via Razorpay • UPI, Cards, NetBanking
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {paymentFailedState && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>Payment Pending or Cancelled</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-normal">
            Your order was not completed because payment was cancelled or interrupted. You can retry paying now.
          </p>
        </div>
      )}

      <form onSubmit={handleProceedToPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Customer, Address, Date & Slot Forms */}
          <div className="lg:col-span-7 space-y-5">
            {/* STEP 1: Contact Details */}
            <div className="bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#3B1F14] text-[#F5B83D] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14]">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Areeb Mirza"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="9820012345"
                        className="w-full text-xs pl-10 pr-2.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Delivery Address & Serviceable Pincode */}
            <div className="bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#3B1F14] text-[#F5B83D] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14]">
                  Delivery Address
                </h3>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                    House / Flat No., Floor, Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={houseFlat}
                    onChange={(e) => setHouseFlat(e.target.value)}
                    placeholder="e.g. Flat 402, Sea Breeze Apartments"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                    Street, Area & Road *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetArea}
                    onChange={(e) => setStreetArea(e.target.value)}
                    placeholder="e.g. Road No. 36, Jubilee Hills"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near GVK One Mall"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={city}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="400050"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] font-bold"
                    />
                  </div>
                </div>

                {/* Live Pincode Verification Feedback */}
                {pincodeStatus.checked && (
                  <div
                    className={`p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
                      pincodeStatus.serviceable
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {pincodeStatus.serviceable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Serviceable in <b>{pincodeStatus.areaName || "Hyderabad"}</b> ({pincode})
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>{pincodeStatus.error}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: Delivery Date & Slot Selector */}
            <div className="bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#3B1F14] text-[#F5B83D] text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14]">
                  Scheduled Delivery Date & Slot
                </h3>
              </div>

              <div className="space-y-3">
                {/* Date Picker */}
                <div>
                  <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                    Select Delivery Date (Min 24 Hours Fresh Lead Time)
                  </label>
                  <input
                    type="date"
                    required
                    min={minDateString}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] font-semibold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    We handcraft every chocolate batch fresh after order placement.
                  </p>
                </div>

                {/* Time Slot Picker */}
                <div>
                  <label className="text-xs font-bold text-[#3B1F14] block mb-1.5">
                    Select 2-Hour Delivery Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableSlots.map((slot) => {
                      const isSelected = deliverySlot === slot.label;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={slot.isFull}
                          onClick={() => setDeliverySlot(slot.label)}
                          className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all flex items-center justify-between ${
                            slot.isFull
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : isSelected
                              ? "bg-[#3B1F14] text-[#F5B83D] border-[#F5B83D] shadow-sm"
                              : "bg-[#FFF6EC]/50 text-[#3B1F14] border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{slot.label}</span>
                          </div>
                          {slot.isFull ? (
                            <span className="text-[9px] text-red-500 font-bold uppercase">
                              Slot Full
                            </span>
                          ) : isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B83D]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Payment Button (Sticky on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3 lg:sticky lg:top-24">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14] pb-2 border-b border-gray-100">
                Order Summary ({items.length} items)
              </h3>

              {/* Items Thumbnail List */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {items.map((i, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={i.imageUrl} alt={i.name} fill className="object-cover" />
                      </div>
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-[#3B1F14]">{i.name}</span>
                        {i.variantName && (
                          <span className="text-[10px] text-gray-500 block">
                            {i.variantName}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-[#3B1F14]">
                      {i.quantity} × ₹{i.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="border-t border-gray-100 pt-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#3B1F14]">₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <div>
                    <span>Rapido / Porter Parcel Charges</span>
                    <span className="block text-[10px] text-gray-400">Doorstep delivery across Hyderabad</span>
                  </div>
                  <span className="font-semibold text-[#3B1F14]">₹{deliveryFee}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-extrabold text-[#3B1F14]">
                  <span>Total Payable</span>
                  <span className="text-lg text-[#3B1F14]">₹{total}</span>
                </div>
              </div>

              {/* Security & Payment Notice */}
              <div className="p-3 bg-[#FAF3EB] rounded-xl border border-[#3B1F14]/10 text-[11px] text-[#3B1F14]/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#3B1F14]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Razorpay Safe & Encrypted Checkout</span>
                </div>
                <p className="text-[10px] text-gray-500">
                  Orders are confirmed upon successful online payment. Instant notifications will be sent to your WhatsApp and the Chocolatier.
                </p>
              </div>

              {/* Submit / Pay Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] bg-gradient-to-r from-[#FF4F8B] to-[#FF8A3D] hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isSubmitting ? "Initiating Razorpay..." : `Pay ₹${total} & Confirm Order`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
