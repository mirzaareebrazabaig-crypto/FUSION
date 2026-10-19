import React from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';

/**
 * Reusable table component for displaying orders in the admin dashboard.
 * It expects the full order objects (as returned by the Prisma query) and a
 * callback to update the order status.
 */
export default function OrderTable({
  orders,
  onStatusChange,
}: {
  orders: any[];
  onStatusChange: (orderId: string, newStatus: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#3B1F14]/10 bg-white shadow-sm">
      <table className="min-w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#F5F5F5]">
          <tr>
            <th className="px-3 py-2 font-medium">Order #</th>
            <th className="px-3 py-2 font-medium">Customer</th>
            <th className="px-3 py-2 font-medium">Phone</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Total (₹)</th>
            <th className="px-3 py-2 font-medium">Created</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-[#3B1F14]">{o.orderNumber}</td>
              <td className="px-3 py-2 text-[#3B1F14]">{o.customerName}</td>
              <td className="px-3 py-2 flex items-center gap-1 text-gray-600">
                <span>{o.customerPhone}</span>
                <a
                  href={`https://wa.me/91${o.customerPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2EC4B6] hover:opacity-80"
                  title="WhatsApp Customer"
                >
                  <MessageCircle className="w-4 h-4 inline-block" />
                </a>
              </td>
              <td className="px-3 py-2">
                <select
                  value={o.orderStatus}
                  onChange={(e) => onStatusChange(o.id, e.target.value)}
                  className="text-xs font-bold p-1.5 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </td>
              <td className="px-3 py-2 font-bold text-[#3B1F14]">₹{o.total}</td>
              <td className="px-3 py-2 text-gray-500">
                {new Date(o.createdAt).toLocaleString('en-IN')}
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onStatusChange(o.id, o.orderStatus)}
                  className="flex items-center gap-1 text-xs text-[#3B1F14] hover:text-[#3B1F14]/80"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
