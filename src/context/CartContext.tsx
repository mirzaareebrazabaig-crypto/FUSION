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
  total: number;
  boxMessage: string;
  setBoxMessage: (msg: string) => void;
  getItemQuantity: (productId: string, variantName?: string | null) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Standard Rapido / Porter parcel charges
const RAPIDO_PARCEL_CHARGES = 75;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [boxMessage, setBoxMessage] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chocofusion_cart");
      if (saved) {
        setItems(JSON.parse(saved));
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
      localStorage.setItem("chocofusion_box_message", boxMessage);
    } catch {
      // Ignore storage errors
    }
  }, [items, boxMessage, isHydrated]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery charges are at actuals via Rapido / Porter (paid on delivery)
  const deliveryFee = 0;
  const total = subtotal;

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
    setBoxMessage("");
    try {
      localStorage.removeItem("chocofusion_cart");
      localStorage.removeItem("chocofusion_coupon");
      localStorage.removeItem("chocofusion_box_message");
    } catch {
      // ignore
    }
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
