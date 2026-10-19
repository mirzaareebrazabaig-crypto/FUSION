import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AdminLayout – wraps the admin pages with a persistent sidebar and header.
 * It receives the current active tab and a setter so the sidebar can switch tabs.
 */
interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: ReactNode;
}

export default function AdminLayout({ activeTab, setActiveTab, children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#FFF6EC]">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header bar */}
        <Header />
        {/* Page specific content */}
        <main className="px-3 sm:px-6 pt-4 max-w-6xl mx-auto pb-24 text-[#3B1F14]">
          {children}
        </main>
      </div>
    </div>
  );
}
