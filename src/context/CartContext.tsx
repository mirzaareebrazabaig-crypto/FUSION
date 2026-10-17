"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
  imageUrl: string;
  weight: string;
  variantName?: string | null;
  customMessage?: string | null;
}

export interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  discountAmount: number;
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    imageUrl: string;
    weight: string;
  }, variantName?: string | null, customMessage?: string | null, customPrice?: number) => void;
  removeItem: (productId: string, variantName?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantName?: string | null) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (couponCode: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  total: number;
  boxMessage: string;
  setBoxMessage: (msg: string) => void;
  getItemQuantity: (productId: string, variantName?: string | null) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_DELIVERY_THRESHOLD = 999;
const STANDARD_DELIVERY_FEE = 75;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [boxMessage, setBoxMessage] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chocofusion_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem("chocofusion_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
      const savedMsg = localStorage.getItem("chocofusion_box_message");
      if (savedMsg) {
        setBoxMessage(savedMsg);
      }
    } catch {
      // LocalStorage access fallback
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("chocofusion_cart", JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem("chocofusion_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("chocofusion_coupon");
      }
      localStorage.setItem("chocofusion_box_message", boxMessage);
    } catch {
      // Ignore storage errors
    }
  }, [items, appliedCoupon, boxMessage, isHydrated]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  // Calculate discount based on subtotal
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    // Cap discount to subtotal
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const getItemQuantity = (productId: string, variantName?: string | null) => {
    const item = items.find(
      (i) => i.productId === productId && (i.variantName || null) === (variantName || null)
    );
    return item ? item.quantity : 0;
  };

  const addItem = (
    product: {
      id: string;
      name: string;
      price: number;
      originalPrice?: number | null;
      imageUrl: string;
      weight: string;
    },
    variantName?: string | null,
    customMessage?: string | null,
    customPrice?: number
  ) => {
    const priceToUse = customPrice ?? product.price;
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && (i.variantName || null) === (variantName || null)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        if (customMessage) next[existingIndex].customMessage = customMessage;
        return next;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: priceToUse,
          originalPrice: product.originalPrice,
          quantity: 1,
          imageUrl: product.imageUrl,
          weight: product.weight,
          variantName: variantName || null,
          customMessage: customMessage || null,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number, variantName?: string | null) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (i) => !(i.productId === productId && (i.variantName || null) === (variantName || null))
        );
      }
      return prev.map((item) => {
        if (item.productId === productId && (item.variantName || null) === (variantName || null)) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const removeItem = (productId: string, variantName?: string | null) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && (i.variantName || null) === (variantName || null))
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setBoxMessage("");
    try {
      localStorage.removeItem("chocofusion_cart");
      localStorage.removeItem("chocofusion_coupon");
      localStorage.removeItem("chocofusion_box_message");
    } catch {
      // ignore
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: "Please enter a coupon code." };
    }

    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(cleanCode)}&subtotal=${subtotal}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || "Invalid coupon code." };
      }

      const couponData = data.coupon;
      let calculatedDiscount = 0;
      if (couponData.discountType === "PERCENTAGE") {
        calculatedDiscount = Math.round((subtotal * couponData.discountValue) / 100);
        if (couponData.maxDiscount && calculatedDiscount > couponData.maxDiscount) {
          calculatedDiscount = couponData.maxDiscount;
        }
      } else {
        calculatedDiscount = couponData.discountValue;
      }

      const newCoupon: AppliedCoupon = {
        code: couponData.code,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        discountAmount: calculatedDiscount,
        description: couponData.description,
      };

      setAppliedCoupon(newCoupon);
      return { success: true, message: `Coupon ${couponData.code} applied! Saved ₹${calculatedDiscount}` };
    } catch {
      // Fallback local coupon check if network is unavailable
      if (cleanCode === "CHOCO10" && subtotal >= 499) {
        const disc = Math.min(Math.round(subtotal * 0.1), 150);
        setAppliedCoupon({ code: "CHOCO10", discountType: "PERCENTAGE", discountValue: 10, discountAmount: disc });
        return { success: true, message: `Coupon CHOCO10 applied! Saved ₹${disc}` };
      }
      if (cleanCode === "FIRSTBITE" && subtotal >= 699) {
        setAppliedCoupon({ code: "FIRSTBITE", discountType: "FLAT", discountValue: 100, discountAmount: 100 });
        return { success: true, message: "Coupon FIRSTBITE applied! Saved ₹100" };
      }
      return { success: false, message: "Could not validate coupon. Please check code." };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        amountNeededForFreeDelivery,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        total,
        boxMessage,
        setBoxMessage,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
