import React from 'react';
import { ShoppingBag, Package, Truck, Gift, MessageCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Sidebar navigation for the admin dashboard.
 * Receives the current active tab and a setter to change it.
 */
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'coupons', label: 'Coupons', icon: Gift },
  { key: 'notifications', label: 'Logs', icon: MessageCircle },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#3B1F14] text-[#FFF6EC] hidden md:block">
      <div className="flex items-center gap-3 p-4 border-b border-[#F5B83D]/30">
        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#F5B83D]">
          <Image src="/logo.jpeg" alt="ChocoFusion" fill className="object-cover" />
        </div>
        <h1 className="text-base font-bold font-serif">ChocoFusion</h1>
      </div>
      <nav className="mt-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                isActive ? 'bg-[#F5B83D] text-[#3B1F14] font-bold' : 'hover:bg-[#4A2B22]'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {t.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
