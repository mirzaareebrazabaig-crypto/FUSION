"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, CheckCircle2, X, MapPin, ArrowRight } from "lucide-react";

export const PhoneLoginModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Check on mount if customer is already logged in locally
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chocofusion_saved_customer");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          setCustomerProfile(parsed);
          setPhone(parsed.phone);
        }
      }
    } catch {}
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/[^0-9]/g, "").slice(-10);
    if (clean.length !== 10) {
      setFeedback("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/customer/profile?phone=${clean}`);
      const data = await res.json();
      if (data.success && data.exists && data.profile) {
        setCustomerProfile(data.profile);
        localStorage.setItem("chocofusion_saved_customer", JSON.stringify(data.profile));
        setFeedback("Welcome back! Your saved delivery address has been loaded.");
      } else {
        const basicProfile = { phone: clean };
        setCustomerProfile(basicProfile);
        localStorage.setItem("chocofusion_saved_customer", JSON.stringify(basicProfile));
        setFeedback("Logged in! When you enter your address at checkout, it will be saved permanently.");
      }
    } catch {
      setFeedback("Connected offline. Phone saved for 1-click checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chocofusion_saved_customer");
    setCustomerProfile(null);
    setPhone("");
    setFeedback(null);
  };

  return (
    <>
      {/* Trigger Button in Header */}
      {customerProfile ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF6EC]/15 hover:bg-[#FFF6EC]/25 text-[#F5B83D] rounded-full text-xs font-bold transition-all border border-[#F5B83D]/30"
          title="Account & Saved Address"
        >
          <User className="w-3.5 h-3.5" />
          <span className="max-w-[85px] sm:max-w-[110px] truncate">
            {customerProfile.name ? customerProfile.name.split(" ")[0] : customerProfile.phone.slice(-4)}
          </span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF6EC]/10 hover:bg-[#FFF6EC]/20 text-[#FFF6EC] rounded-full text-xs font-bold transition-all border border-white/20"
        >
          <Phone className="w-3.5 h-3.5 text-[#F5B83D]" />
          <span>Login</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFF6EC] text-[#3B1F14] w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#3B1F14]/15 space-y-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#3B1F14] text-[#F5B83D] flex items-center justify-center mb-2 shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black font-serif text-[#3B1F14]">
                {customerProfile ? "Your ChocoFusion Account" : "Quick Phone Login"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {customerProfile
                  ? "Logged in without password or OTP. Address auto-loads at checkout."
                  : "Enter your 10-digit number to instantly retrieve your saved address."}
              </p>
            </div>

            {/* Profile Logged In State */}
            {customerProfile ? (
              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 shadow-sm text-xs space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span className="text-gray-500">Mobile Number:</span>
                    <span className="font-extrabold text-[#3B1F14]">+91 {customerProfile.phone}</span>
                  </div>
                  {customerProfile.name && (
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-semibold text-[#3B1F14]">{customerProfile.name}</span>
                    </div>
                  )}
                  {customerProfile.houseFlat ? (
                    <div className="pt-1">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                        Saved Delivery Address
                      </span>
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {customerProfile.houseFlat}, {customerProfile.streetArea}
                        {customerProfile.landmark ? `, Near ${customerProfile.landmark}` : ""},{" "}
                        {customerProfile.city} - {customerProfile.pincode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 pt-1 italic">
                      No address saved yet. Enter your address once at checkout and it will be remembered permanently.
                    </p>
                  )}
                </div>

                {feedback && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{feedback}</span>
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 bg-[#3B1F14] text-[#F5B83D] rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3.5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              /* Phone Input Form */
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#3B1F14] block mb-1">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 9986120044"
                      className="w-full text-xs pl-12 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF4F8B] font-bold text-[#3B1F14] bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    No OTP or password required. Frictionless 1-step login.
                  </p>
                </div>

                {feedback && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl font-medium">
                    {feedback}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || phone.trim().length !== 10}
                  className="w-full min-h-[44px] bg-gradient-to-r from-[#FF4F8B] to-[#FF8A3D] text-white font-extrabold text-xs rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>{loading ? "Checking Database..." : "Continue with Phone"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
