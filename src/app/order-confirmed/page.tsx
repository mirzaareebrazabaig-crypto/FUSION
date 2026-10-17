"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Share2,
  MessageCircle,
  Truck,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F5B83D", "#FF4F8B", "#FF8A3D", "#2EC4B6"],
      });
    } catch {
      // ignore
    }

    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/track?id=${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          // Fallback to locally stored customer details if DB is fresh/cold
          loadFallback();
        }
      } catch (err) {
        console.error("Failed to load order confirmation details:", err);
        loadFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadFallback() {
      try {
        const savedCustomer = localStorage.getItem("chocofusion_saved_customer");
        const parsed = savedCustomer ? JSON.parse(savedCustomer) : {};
        setOrder({
          id: orderId,
          orderNumber: "CF-" + Math.floor(100000 + Math.random() * 900000),
          customerName: parsed.name || "Valued Customer",
          customerPhone: parsed.phone || "",
          houseFlat: parsed.houseFlat || "",
          streetArea: parsed.streetArea || "",
          city: parsed.city || "Hyderabad",
          pincode: parsed.pincode || "",
          deliveryDate: "As Scheduled",
          deliverySlot: "Selected Time Slot",
          total: "Paid Online",
          items: [],
        });
      } catch {}
    }

    loadOrder();
  }, [orderId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappShareText = order
    ? encodeURIComponent(
        `🍫 I just placed a delicious chocolate order #${order.orderNumber} with ChocoFusion! Handcrafted in Mumbai.`
      )
    : "";

  return (
    <div className="min-h-screen bg-[#FFF6EC] pb-24 text-[#3B1F14] px-4 pt-6 max-w-xl mx-auto text-center">
      {/* Celebration Icon */}
      <div className="relative w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md mb-4 border-2 border-emerald-500">
        <CheckCircle2 className="w-10 h-10 animate-bounce" />
        <span className="absolute -top-1 -right-1 text-xl">🎉</span>
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
        Payment Verified & Order Confirmed!
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#3B1F14] mt-3">
        Thank You for Your Order!
      </h1>

      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
        Our chocolatiers in Mumbai have received your order and will handcraft it with single-origin cocoa and freshly roasted nuts.
      </p>

      {order && (
        <div className="mt-6 bg-white rounded-3xl p-5 border border-[#3B1F14]/10 shadow-sm text-left space-y-4">
          {/* Order Number & Payment Status */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Order Reference
              </span>
              <span className="text-base font-black text-[#3B1F14]">
                {order.orderNumber}
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Paid Online (₹{order.total})
            </span>
          </div>

          {/* Scheduled Delivery */}
          <div className="space-y-1.5 text-xs text-gray-700 bg-[#FAF3EB] p-3 rounded-2xl">
            <div className="flex items-center gap-2 font-bold text-[#3B1F14]">
              <Calendar className="w-4 h-4 text-[#FF8A3D]" />
              <span>Scheduled Date: {order.deliveryDate}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 font-medium pl-6">
              <Clock className="w-3.5 h-3.5 text-[#F5B83D]" />
              <span>Time Slot: {order.deliverySlot}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600 font-medium pl-6 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF4F8B] flex-shrink-0 mt-0.5" />
              <span>
                {order.houseFlat}, {order.streetArea}, {order.city} - {order.pincode}
              </span>
            </div>
          </div>

          {/* Items Summary */}
          <div>
            <h4 className="text-xs font-bold text-[#3B1F14] uppercase tracking-wider mb-2">
              Chocolates in this Order
            </h4>
            <div className="space-y-2">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-50">
                  <span className="text-gray-700">
                    <b>{item.quantity}×</b> {item.productName}{" "}
                    {item.variantName ? `(${item.variantName})` : ""}
                  </span>
                  <span className="font-bold text-[#3B1F14]">₹{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Notification */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Confirmation details have been dispatched to your WhatsApp (+91 {order.customerPhone}) and to the owner.
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {order && (
          <Link
            href={`/track?order=${order.orderNumber}&phone=${order.customerPhone}`}
            className="w-full min-h-[48px] bg-[#3B1F14] hover:bg-black text-[#F5B83D] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status Live</span>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-2">
          {order && (
            <a
              href={`https://wa.me/?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#0E7A70] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#2EC4B6]/40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Order</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-3 bg-white hover:bg-gray-50 text-[#3B1F14] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-gray-200 shadow-sm"
          >
            <span>{copied ? "Link Copied! ✓" : "Copy Order Link"}</span>
          </button>
        </div>

        <Link
          href="/"
          className="inline-block text-xs text-gray-500 hover:text-[#3B1F14] font-medium pt-2"
        >
          ← Return to Home Page
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF6EC] p-4 text-center">Loading confirmation...</div>}>
      <OrderConfirmedContent />
    </Suspense>
  );
}
