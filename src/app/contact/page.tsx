"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  Sparkles,
  Heart,
  Truck,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Order Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate sending message or open WhatsApp direct
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello ChocoFusion! 👋\nMy name is ${formData.name || "Customer"}.\nSubject: ${formData.subject}\nMessage: ${formData.message || "I have an inquiry regarding your handcrafted chocolates."}`
    );
    window.open(`https://wa.me/919986120044?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FFF6EC] text-[#3B1F14] pb-24 pt-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#F5B83D]/20 border border-[#F5B83D]/50 text-[#8B4513] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4F8B]" />
            <span>We&apos;re Here to Assist You</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-[#2D160C]">
            Get in Touch With Our Kitchen
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Have questions about your order, custom corporate gifting hampers, or delivery timing across Hyderabad? Our team is always ready to help.
          </p>
        </div>

        {/* 3 Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: WhatsApp Concierge */}
          <div className="bg-white rounded-3xl p-6 border border-[#3B1F14]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-bold text-base text-[#2D160C]">WhatsApp Concierge</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Fastest response for real-time order tracking, custom flavor selections, and instant support.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-4">
              <a
                href="https://wa.me/919986120044?text=Hi%20ChocoFusion%2C%20I%20have%20an%20inquiry%20regarding%20handcrafted%20chocolates!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#0E7A70] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#2EC4B6]/40"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp (+91 9986120044)</span>
              </a>
            </div>
          </div>

          {/* Card 2: Kitchen & Workshop */}
          <div className="bg-white rounded-3xl p-6 border border-[#3B1F14]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#2D160C]">Kitchen &amp; Operations</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Handcrafted fresh daily in our dedicated artisanal chocolate kitchen in Hyderabad. Dispatched via Rapido &amp; Porter.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-4 text-xs font-semibold text-[#8B4513] space-y-1">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-[#FF8A3D] flex-shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                <Truck className="w-3.5 h-3.5 text-[#2EC4B6] flex-shrink-0" />
                <span>Citywide Doorstep Delivery</span>
              </div>
            </div>
          </div>

          {/* Card 3: Working Hours & Support */}
          <div className="bg-white rounded-3xl p-6 border border-[#3B1F14]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#2D160C]">Operating Hours</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Fresh roasting and chocolate tempering start early morning. Delivery slots operate 7 days a week.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-4 text-xs space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>Kitchen Production:</span>
                <span className="font-bold text-[#2D160C]">8:00 AM – 9:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Support:</span>
                <span className="font-bold text-[#2D160C]">9:00 AM – 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form & FAQs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Message Box */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#3B1F14]/10 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#2D160C]">
                Send Us a Message
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fill out the details below and we&apos;ll get back to you promptly, or send it directly over WhatsApp.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-900 text-sm">Thank You for Reaching Out!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                  We have received your message. If your inquiry is urgent regarding an order in progress, you can also send it straight to our WhatsApp.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={handleWhatsAppDirect}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Open in WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", phone: "", email: "", subject: "Order Inquiry", message: "" });
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Send Another Note
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2D160C] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Areeb Mirza"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] text-[#2D160C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2D160C] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9820012345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] text-[#2D160C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2D160C] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] text-[#2D160C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2D160C] mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] bg-white text-[#2D160C]"
                    >
                      <option value="Order Inquiry">Order Inquiry / Delivery Status</option>
                      <option value="Custom Flavors & Hampers">Bespoke Gifting &amp; Hampers</option>
                      <option value="Corporate Orders">Corporate &amp; Bulk Orders</option>
                      <option value="Feedback / Compliment">Feedback or Suggestion</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D160C] mb-1">
                    Your Message / Order Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us how we can help you or detail your custom request..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] text-[#2D160C]"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-6 bg-[#3B1F14] hover:bg-black text-[#F5B83D] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Sending Note..." : "Submit Message"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppDirect}
                    className="py-3 px-5 bg-[#2EC4B6]/15 hover:bg-[#2EC4B6]/25 text-[#0E7A70] font-bold text-xs rounded-xl border border-[#2EC4B6]/40 flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Common Questions & Delivery Facts */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#3B1F14]/10 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8B4513] uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-[#FF4F8B]" />
                <span>Frequently Asked Questions</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#FAF3EB] rounded-2xl">
                  <h4 className="font-bold text-[#2D160C] mb-1">How does delivery work in Hyderabad?</h4>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    We deliver across all areas and pincodes in Hyderabad. Deliveries are dispatched using on-demand Rapido and Porter riders. Parcel delivery fees are payable at actuals directly to the delivery partner upon arrival.
                  </p>
                </div>

                <div className="p-3 bg-[#FAF3EB] rounded-2xl">
                  <h4 className="font-bold text-[#2D160C] mb-1">When is payment required?</h4>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Payment is fulfilled online once your chocolate batch is handcrafted and strictly before dispatch. Per food hygiene and customization standards, all sales are final with no cancellations or refunds.
                  </p>
                </div>

                <div className="p-3 bg-[#FAF3EB] rounded-2xl">
                  <h4 className="font-bold text-[#2D160C] mb-1">Are all items vegetarian &amp; eggless?</h4>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Yes! 100% of our chocolates, roasted nut bites, and Dubai Kunafa bars are vegetarian, eggless, and handcrafted with pure cocoa butter.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Link to Track Order */}
            <div className="bg-gradient-to-r from-[#24120B] to-[#3B1F14] text-[#FFF6EC] rounded-3xl p-6 shadow-md flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#F5B83D]">Already placed an order?</h4>
                <p className="text-[11px] text-[#F7EAD7]/75 mt-0.5">
                  Track your preparation and rider dispatch live anytime.
                </p>
              </div>
              <Link
                href="/track"
                className="px-4 py-2 bg-[#F5B83D] hover:bg-[#FFA85C] text-[#1A0C06] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
