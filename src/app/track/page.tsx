"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  MessageCircle,
  AlertCircle,
  PackageCheck,
  Phone,
  FileText,
  User,
  ShoppingBag,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [activeTab, setActiveTab] = useState<"phone" | "orderNumber">(
    initialOrder ? "orderNumber" : "phone"
  );
  const [phone, setPhone] = useState(initialPhone);
  const [orderNumber, setOrderNumber] = useState(initialOrder);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from localStorage saved profile
  useEffect(() => {
    if (!phone) {
      try {
        const saved = localStorage.getItem("chocofusion_saved_customer");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.phone) {
            setPhone(parsed.phone);
          }
        }
      } catch {}
    }
  }, []);

  const fetchTrack = async (opts: { ord?: string; ph?: string }) => {
    const qPh = (opts.ph ?? phone).trim().replace(/[^0-9]/g, "");
    const qOrd = (opts.ord ?? orderNumber).trim();

    if (!qPh && !qOrd) {
      setError("Please enter your 10-digit mobile number or order ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = "/api/orders/track?";
      if (qOrd) {
        url += `order=${encodeURIComponent(qOrd)}`;
        if (qPh) url += `&phone=${encodeURIComponent(qPh)}`;
      } else {
        url += `phone=${encodeURIComponent(qPh)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setAllOrders(data.orders || [data.order]);

        // Auto-save address to localStorage for seamless checkout login
        if (data.savedAddress) {
          try {
            localStorage.setItem("chocofusion_saved_customer", JSON.stringify(data.savedAddress));
          } catch {}
        }
      } else {
        setError(data.error || "No orders found. Please verify details.");
        setSelectedOrder(null);
        setAllOrders([]);
      }
    } catch {
      setError("Unable to connect. Please check internet connection.");
      setSelectedOrder(null);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder || initialPhone) {
      fetchTrack({ ord: initialOrder, ph: initialPhone });
    }
  }, [initialOrder, initialPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "phone") {
      fetchTrack({ ord: "", ph: phone });
    } else {
      fetchTrack({ ord: orderNumber, ph: phone });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6EC] pb-24 text-[#3B1F14] px-4 pt-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#3B1F14]/10">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#3B1F14] text-[#F5B83D] flex items-center justify-center mb-2 shadow-sm">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black font-serif text-[#3B1F14]">
          Track Your Chocolate Order
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track instantly using just your Mobile Number or Order Reference
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mt-4 flex bg-white p-1 rounded-2xl border border-[#3B1F14]/10 shadow-sm text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("phone")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "phone"
              ? "bg-[#3B1F14] text-[#F5B83D] shadow-sm"
              : "text-gray-500 hover:text-[#3B1F14]"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Track by Mobile Number</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orderNumber")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "orderNumber"
              ? "bg-[#3B1F14] text-[#F5B83D] shadow-sm"
              : "text-gray-500 hover:text-[#3B1F14]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>By Order ID</span>
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mt-3 bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
        {activeTab === "phone" ? (
          <div>
            <label className="text-xs font-bold text-[#3B1F14] block mb-1">
              Customer Mobile Number *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="10-digit mobile number (e.g. 9986120044)"
                className="w-full text-xs pl-12 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] font-bold text-[#3B1F14]"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              No password or OTP needed. Displays all orders placed with this phone number.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                Order Reference Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. CF-2610-8921"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] uppercase tracking-wider font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                Mobile Number (Optional verification)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="10-digit mobile number"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] font-semibold"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (activeTab === "phone" ? !phone.trim() : !orderNumber.trim())}
          className="w-full min-h-[44px] bg-[#3B1F14] hover:bg-black text-[#F5B83D] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{loading ? "Searching Orders..." : activeTab === "phone" ? "Find My Orders" : "Track Order"}</span>
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Multiple Orders Selector (when tracking by phone) */}
      {allOrders.length > 1 && (
        <div className="mt-4 bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Found {allOrders.length} Orders for this Mobile
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`px-3 py-2 rounded-xl text-left border text-xs flex-shrink-0 transition-all ${
                    isSelected
                      ? "bg-[#3B1F14] text-[#F5B83D] border-[#3B1F14]"
                      : "bg-[#FFF6EC]/50 text-[#3B1F14] border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-extrabold">{ord.orderNumber}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    ₹{ord.total} • {ord.deliveryDate}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Status Display */}
      {selectedOrder && (
        <div className="mt-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#3B1F14]/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                  Current Status
                </span>
                <span className="text-sm font-black text-[#3B1F14] capitalize">
                  {selectedOrder.orderStatus.replace(/_/g, " ")}
                </span>
              </div>
              <span className="bg-[#2EC4B6]/15 text-[#0E7A70] font-bold text-xs px-2.5 py-1 rounded-full border border-[#2EC4B6]/40">
                {selectedOrder.orderNumber}
              </span>
            </div>

            {/* Visual 4-Step Progress Line */}
            <div className="space-y-4 py-2">
              {selectedOrder.steps?.map((step: any, idx: number) => {
                const isCompleted = step.done;
                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {idx < selectedOrder.steps.length - 1 && (
                      <div
                        className={`absolute left-[13px] top-[26px] bottom-[-16px] w-[2px] ${
                          isCompleted ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCompleted ? "text-[#3B1F14]" : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer Saved Address & Delivery Slot */}
            <div className="bg-[#FAF3EB] p-3.5 rounded-2xl text-xs space-y-2 text-gray-700">
              <div className="flex items-center justify-between font-bold text-[#3B1F14] border-b border-[#3B1F14]/10 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF4F8B]" />
                  <span>{selectedOrder.customerName} ({selectedOrder.customerPhone})</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Saved Customer
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-[#3B1F14]">
                <Calendar className="w-3.5 h-3.5 text-[#FF8A3D]" />
                <span>Delivery Date: {selectedOrder.deliveryDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-3.5 h-3.5 text-[#F5B83D]" />
                <span>Slot: {selectedOrder.deliverySlot}</span>
              </div>
              <div className="flex items-start gap-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-[#FF4F8B] flex-shrink-0 mt-0.5" />
                <span>
                  {selectedOrder.houseFlat}, {selectedOrder.streetArea}
                  {selectedOrder.landmark ? `, Near ${selectedOrder.landmark}` : ""}, {selectedOrder.city} - {selectedOrder.pincode}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-medium pt-1">
                Parcel dispatched via Rapido / Porter service.
              </div>
            </div>

            {/* Items Summary */}
            <div>
              <h4 className="text-xs font-bold text-[#3B1F14] uppercase tracking-wider mb-2">
                Order Items ({selectedOrder.items?.length})
              </h4>
              <div className="space-y-1.5 border-t border-gray-100 pt-2">
                {selectedOrder.items?.map((i: any) => (
                  <div key={i.id} className="flex justify-between text-xs py-0.5">
                    <span className="text-gray-700">
                      {i.quantity}× {i.productName} {i.variantName ? `(${i.variantName})` : ""}
                    </span>
                    <span className="font-bold text-[#3B1F14]">₹{i.total}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs py-0.5 text-gray-500">
                  <span>Rapido / Porter Delivery</span>
                  <span>₹{selectedOrder.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-t border-gray-200 pt-2 text-[#3B1F14]">
                  <span>Total Paid</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Contact WhatsApp support */}
            <div className="pt-2">
              <a
                href={`https://wa.me/919986120044?text=Hi%20ChocoFusion%2C%20checking%20status%20of%20my%20order%20${selectedOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#0E7A70] border border-[#2EC4B6]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Ask Chocolatier on WhatsApp (9986120044)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF6EC] p-4 text-center">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
