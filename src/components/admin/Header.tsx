import React from 'react';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

/**
 * Header bar displayed at the top of the admin dashboard.
 * Includes the logo, portal title, and a logout button.
 */
export default function Header() {
  const handleLogout = () => {
    // Trigger logout by removing auth flag from localStorage and refreshing.
    localStorage.removeItem('chocofusion_admin_auth');
    window.location.reload();
  };

  return (
    <header className="bg-[#3B1F14] text-[#FFF6EC] p-4 rounded-3xl shadow-md border-b border-[#F5B83D]/30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#F5B83D]">
          <Image src="/logo.jpeg" alt="ChocoFusion" fill className="object-cover" />
        </div>
        <h1 className="text-base font-bold font-serif">ChocoFusion Admin</h1>
      </div>
      <button
        onClick={handleLogout}
        className="p-2 bg-white/10 hover:bg-white/20 text-[#FFF6EC] rounded-xl text-xs flex items-center gap-1 transition-colors"
        title="Log out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}
