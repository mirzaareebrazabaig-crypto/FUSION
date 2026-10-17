"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  LogOut,
  ShoppingBag,
  DollarSign,
  Clock,
  Truck,
  Download,
  Filter,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Package,
  Layers,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "delivery" | "coupons" | "notifications">("orders");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalOrders: 0, totalRevenue: 0, pendingPrep: 0, outForDelivery: 0 });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [searchOrder, setSearchOrder] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    shortDesc: "",
    description: "",
    price: "",
    originalPrice: "",
    weight: "1 Piece",
    imageUrl: "",
    categoryId: "",
  });

  // Delivery & Settings State
  const [deliveryData, setDeliveryData] = useState<any>({
    slots: [],
    pincodes: [],
    blockedDates: [],
    coupons: [],
  });
  const [newPincode, setNewPincode] = useState({ pincode: "", areaName: "", city: "Mumbai" });
  const [newBlockedDate, setNewBlockedDate] = useState({ date: "", reason: "" });

  // Notifications Log
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);

  // Check stored auth
  useEffect(() => {
    const saved = localStorage.getItem("chocofusion_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("chocofusion_admin_auth", "true");
      } else {
        setAuthError(data.error || "Invalid password.");
      }
    } catch {
      setAuthError("Failed to authenticate.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("chocofusion_admin_auth");
  };

  // Load orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      let url = `/api/admin/orders?status=${statusFilter}&paymentStatus=${paymentFilter}`;
      if (searchOrder) url += `&search=${encodeURIComponent(searchOrder)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load products
  const loadProducts = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.success) setProducts(prodData.products || []);
      if (catData.success) {
        setCategories(catData.categories || []);
        if (catData.categories.length > 0) {
          setNewProduct((prev) => ({ ...prev, categoryId: catData.categories[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  // Load delivery config
  const loadDeliveryConfig = async () => {
    try {
      const res = await fetch("/api/admin/delivery");
      const data = await res.json();
      if (data.success) {
        setDeliveryData(data);
      }
    } catch (err) {
      console.error("Failed to load delivery settings:", err);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotificationLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load notification logs:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "orders") loadOrders();
    if (activeTab === "products") loadProducts();
    if (activeTab === "delivery" || activeTab === "coupons") loadDeliveryConfig();
    if (activeTab === "notifications") loadNotifications();
  }, [isAuthenticated, activeTab, statusFilter, paymentFilter]);

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Toggle inStock
  const handleToggleStock = async (productId: string, currentStock: boolean) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, inStock: !currentStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, inStock: !currentStock } : p))
        );
      }
    } catch (err) {
      console.error("Failed to toggle stock:", err);
    }
  };

  // Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProduct(false);
        loadProducts();
        setNewProduct({
          name: "",
          shortDesc: "",
          description: "",
          price: "",
          originalPrice: "",
          weight: "1 Piece",
          imageUrl: "",
          categoryId: categories[0]?.id || "",
        });
      }
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  // Add Pincode
  const handleAddPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPincode.pincode || !newPincode.areaName) return;
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pincode", data: newPincode }),
      });
      if (res.ok) {
        setNewPincode({ pincode: "", areaName: "", city: "Mumbai" });
        loadDeliveryConfig();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Pincode
  const handleDeletePincode = async (id: string) => {
    try {
      await fetch(`/api/admin/delivery?type=pincode&id=${id}`, { method: "DELETE" });
      loadDeliveryConfig();
    } catch (err) {
      console.error(err);
    }
  };

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFF6EC] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl border border-[#3B1F14]/15 text-center">
          <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[#F5B83D] mb-3">
            <Image src="/logo.jpeg" alt="ChocoFusion" fill className="object-cover" />
          </div>
          <h1 className="text-xl font-bold font-serif text-[#3B1F14]">
            ChocoFusion Admin
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Protected Chocolatier Management Portal
          </p>

          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#3B1F14]"
              />
            </div>

            {authError && (
              <p className="text-[11px] text-red-500 font-semibold">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#3B1F14] text-[#F5B83D] font-bold text-xs rounded-xl hover:bg-black transition-all shadow-md"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#FFF6EC] pb-24 text-[#3B1F14] px-3 sm:px-6 pt-4 max-w-6xl mx-auto">
      {/* Top Admin Header */}
      <div className="bg-[#3B1F14] text-[#FFF6EC] p-4 rounded-3xl shadow-md border-b border-[#F5B83D]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#F5B83D]">
            <Image src="/logo.jpeg" alt="ChocoFusion" fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-serif">
                ChocoFusion Portal
              </h1>
              <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-[#F7EAD7]/70">
              Orders, Catalog, Slots & WhatsApp Notification Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/orders/export"
            download
            className="px-3 py-1.5 bg-[#F5B83D] text-[#24120B] rounded-xl text-xs font-bold hover:bg-[#DDA126] transition-colors flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={handleLogout}
            className="p-2 bg-white/10 hover:bg-white/20 text-[#FFF6EC] rounded-xl text-xs flex items-center gap-1 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Total Revenue
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5">
            ₹{stats.totalRevenue?.toLocaleString("en-IN") || 0}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Total Orders
          </span>
          <div className="text-lg sm:text-xl font-black text-[#3B1F14] mt-0.5">
            {stats.totalOrders || 0}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Kitchen Prep
          </span>
          <div className="text-lg sm:text-xl font-black text-[#FF8A3D] mt-0.5">
            {stats.pendingPrep || 0}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            Out for Delivery
          </span>
          <div className="text-lg sm:text-xl font-black text-[#2EC4B6] mt-0.5">
            {stats.outForDelivery || 0}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar mt-4 border-b border-[#3B1F14]/10 pb-2">
        {[
          { key: "orders", label: "Orders" },
          { key: "products", label: "Menu Catalog" },
          { key: "delivery", label: "Delivery & Pincodes" },
          { key: "coupons", label: "Coupons" },
          { key: "notifications", label: "WhatsApp/SMS Logs" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === t.key
                ? "bg-[#3B1F14] text-[#F5B83D] shadow-sm"
                : "bg-white text-[#3B1F14] hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: ORDERS ================= */}
      {activeTab === "orders" && (
        <div className="mt-4 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-2xl border border-[#3B1F14]/10 flex flex-wrap items-center gap-2 justify-between">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-gray-200 bg-white font-medium text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-gray-200 bg-white font-medium text-xs"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                placeholder="Search Order # or Phone..."
                className="pl-8 pr-2.5 py-1.5 rounded-xl border border-gray-200 text-xs w-48 focus:outline-none"
              />
            </div>
          </div>

          {/* Orders Cards / Table */}
          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-gray-500 border border-[#3B1F14]/10">
              No orders found matching the filter.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl p-4 border border-[#3B1F14]/10 shadow-sm space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#3B1F14]">
                        {o.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Change Status Dropdown */}
                      <span className="text-[11px] text-gray-400 font-medium">Status:</span>
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="text-xs font-bold p-1.5 rounded-lg border border-gray-300 bg-white"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer, Date & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">
                        Customer
                      </span>
                      <span className="font-bold text-[#3B1F14]">{o.customerName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-500">{o.customerPhone}</span>
                        <a
                          href={`https://wa.me/91${o.customerPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2EC4B6] hover:opacity-80"
                          title="WhatsApp Customer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">
                        Scheduled Slot
                      </span>
                      <span className="font-bold text-[#3B1F14]">{o.deliveryDate}</span>
                      <span className="text-gray-500 block text-[11px]">{o.deliverySlot}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">
                        Delivery Address
                      </span>
                      <span className="text-gray-600 line-clamp-2">
                        {o.houseFlat}, {o.streetArea}, {o.city} - {o.pincode}
                      </span>
                    </div>
                  </div>

                  {/* Items and Box Note */}
                  <div className="bg-[#FAF3EB] p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex flex-wrap gap-2 text-gray-800 font-medium">
                      {o.items?.map((it: any) => (
                        <span key={it.id} className="bg-white/80 px-2 py-0.5 rounded border border-gray-200">
                          {it.quantity}× {it.productName} {it.variantName ? `(${it.variantName})` : ""}
                        </span>
                      ))}
                    </div>
                    {o.boxMessage && (
                      <p className="text-[11px] text-[#FF4F8B] font-semibold pt-1">
                        💌 Message on Box: &ldquo;{o.boxMessage}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Footer total and link */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50">
                    <span className="text-gray-400 text-[10px]">
                      Created: {new Date(o.createdAt).toLocaleString("en-IN")}
                    </span>
                    <span className="font-extrabold text-sm text-[#3B1F14]">
                      Total: ₹{o.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PRODUCTS ================= */}
      {activeTab === "products" && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#3B1F14]">
              Manage Chocolates & Stock ({products.length} items)
            </h3>
            <button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="px-3.5 py-1.5 bg-[#3B1F14] text-[#F5B83D] rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chocolate</span>
            </button>
          </div>

          {/* Add Product Form Modal / Collapsible */}
          {showAddProduct && (
            <form
              onSubmit={handleCreateProduct}
              className="bg-white p-4 rounded-2xl border border-[#3B1F14]/15 shadow-sm space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3B1F14]">
                Add New Chocolate Creation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Belgian Hazelnut Truffle"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="150"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Original / Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    placeholder="180"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Portion / Weight</label>
                  <input
                    type="text"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                    placeholder="1 Piece (65g)"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={newProduct.shortDesc}
                    onChange={(e) => setNewProduct({ ...newProduct, shortDesc: e.target.value })}
                    placeholder="Crafted with roasted nuts..."
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3B1F14] text-[#F5B83D] rounded-lg text-xs font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          )}

          {/* Products List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3.5 rounded-2xl border border-[#3B1F14]/10 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-[#3B1F14] truncate">{p.name}</h4>
                    <span className="text-[10px] text-gray-500 block">{p.weight}</span>
                    <span className="text-xs font-black text-[#3B1F14]">₹{p.price}</span>
                  </div>
                </div>

                {/* Stock Toggle Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStock(p.id, p.inStock)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                      p.inStock
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    {p.inStock ? "IN STOCK" : "OUT OF STOCK"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DELIVERY & PINCODES ================= */}
      {activeTab === "delivery" && (
        <div className="mt-4 space-y-5">
          {/* Serviceable Pincodes */}
          <div className="bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14]">
              Serviceable Mumbai PIN Codes ({deliveryData.pincodes?.length})
            </h3>

            <form onSubmit={handleAddPincode} className="flex gap-2">
              <input
                type="text"
                required
                maxLength={6}
                value={newPincode.pincode}
                onChange={(e) => setNewPincode({ ...newPincode, pincode: e.target.value })}
                placeholder="PIN (e.g. 400001)"
                className="w-28 p-2 border rounded-xl text-xs"
              />
              <input
                type="text"
                required
                value={newPincode.areaName}
                onChange={(e) => setNewPincode({ ...newPincode, areaName: e.target.value })}
                placeholder="Area Name (e.g. Colaba)"
                className="flex-1 p-2 border rounded-xl text-xs"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#3B1F14] text-[#F5B83D] rounded-xl text-xs font-bold"
              >
                Add Pin
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {deliveryData.pincodes?.map((pin: any) => (
                <span
                  key={pin.id}
                  className="bg-[#FAF3EB] text-[#3B1F14] text-xs font-medium px-2.5 py-1 rounded-xl border border-gray-200 flex items-center gap-1.5"
                >
                  <b>{pin.pincode}</b> ({pin.areaName})
                  <button
                    onClick={() => handleDeletePincode(pin.id)}
                    className="text-red-500 hover:text-red-700 p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Delivery Slots */}
          <div className="bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14]">
              Configured Time Windows ({deliveryData.slots?.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {deliveryData.slots?.map((s: any) => (
                <div key={s.id} className="p-2.5 bg-[#FAF3EB] rounded-xl border border-gray-200 flex justify-between">
                  <div>
                    <span className="font-bold text-[#3B1F14]">{s.label}</span>
                    <span className="text-[10px] text-gray-500 block">Cap: {s.maxOrdersPerDay} orders/day</span>
                  </div>
                  <span className="text-emerald-600 font-bold text-[10px]">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: COUPONS ================= */}
      {activeTab === "coupons" && (
        <div className="mt-4 bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14]">
            Active Promotional Discount Codes ({deliveryData.coupons?.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {deliveryData.coupons?.map((c: any) => (
              <div key={c.id} className="p-3 bg-[#FAF3EB] rounded-xl border border-[#F5B83D]/40 space-y-1 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[#3B1F14] font-black">{c.code}</span>
                  <span className="text-emerald-700">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">{c.description}</p>
                <div className="text-[10px] text-gray-400">Min Order: ₹{c.minOrderValue}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: NOTIFICATIONS AUDIT LOGS ================= */}
      {activeTab === "notifications" && (
        <div className="mt-4 bg-white p-4 rounded-2xl border border-[#3B1F14]/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#3B1F14]">
                WhatsApp & SMS Dispatch Logs
              </h3>
              <p className="text-[10px] text-gray-400">Real-time delivery verification for Owner and Customers</p>
            </div>
            <button
              onClick={loadNotifications}
              className="text-xs text-[#FF4F8B] font-bold hover:underline"
            >
              Refresh Logs
            </button>
          </div>

          {notificationLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No notifications dispatched yet. Complete an order to view live audit traces!
            </div>
          ) : (
            <div className="space-y-2">
              {notificationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-gray-200 bg-[#FAF3EB]/50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="bg-[#3B1F14] text-[#F5B83D] px-2 py-0.5 rounded text-[10px]">
                        {log.channel}
                      </span>
                      <span className="text-gray-700">To: {log.recipientType} ({log.recipientPhone})</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.status === "SIMULATED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 whitespace-pre-line bg-white/70 p-2 rounded-lg border border-gray-100">
                    {log.message}
                  </p>
                  <span className="text-[9px] text-gray-400 block text-right">
                    {new Date(log.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
