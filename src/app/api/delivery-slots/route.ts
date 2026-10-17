import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const DEFAULT_DELIVERY_SLOTS = [
  { id: "slot-1", startTime: "10:00", endTime: "12:00", label: "10:00 AM - 12:00 PM (Morning Slot)", maxOrdersPerDay: 25, sortOrder: 1, isActive: true },
  { id: "slot-2", startTime: "12:00", endTime: "14:00", label: "12:00 PM - 02:00 PM (Afternoon Slot)", maxOrdersPerDay: 25, sortOrder: 2, isActive: true },
  { id: "slot-3", startTime: "14:00", endTime: "16:00", label: "02:00 PM - 04:00 PM (Mid-Day Slot)", maxOrdersPerDay: 25, sortOrder: 3, isActive: true },
  { id: "slot-4", startTime: "16:00", endTime: "18:00", label: "04:00 PM - 06:00 PM (Evening Slot)", maxOrdersPerDay: 30, sortOrder: 4, isActive: true },
  { id: "slot-5", startTime: "18:00", endTime: "20:00", label: "06:00 PM - 08:00 PM (Night Slot)", maxOrdersPerDay: 30, sortOrder: 5, isActive: true },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    let slots: any[] = [];
    let blockedDates: any[] = [];

    // 1. Try DB query
    try {
      slots = await prisma.deliverySlot.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });

      blockedDates = await prisma.blockedDate.findMany({
        select: { date: true, reason: true },
      });
    } catch (dbErr) {
      console.warn("DB delivery slots fetch error, using defaults:", dbErr);
    }

    // 2. If DB has no slots seeded yet (e.g. freshly deployed to Vercel), use default slots
    if (!slots || slots.length === 0) {
      slots = DEFAULT_DELIVERY_SLOTS;
    }

    // 3. Count capacity if DB orders exist
    let slotAvailability = slots.map((s) => ({
      ...s,
      isFull: false,
      ordersBooked: 0,
      remaining: s.maxOrdersPerDay,
    }));

    if (dateStr) {
      try {
        const bookedCounts = await prisma.order.groupBy({
          by: ["deliverySlot"],
          where: {
            deliveryDate: dateStr,
            paymentStatus: { in: ["PAID", "PENDING"] },
            orderStatus: { not: "CANCELLED" },
          },
          _count: {
            _all: true,
          },
        });

        const countMap: Record<string, number> = {};
        bookedCounts.forEach((b) => {
          countMap[b.deliverySlot] = b._count._all;
        });

        slotAvailability = slots.map((s) => {
          const booked = countMap[s.label] || 0;
          return {
            ...s,
            isFull: booked >= s.maxOrdersPerDay,
            ordersBooked: booked,
            remaining: Math.max(0, s.maxOrdersPerDay - booked),
          };
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      slots: slotAvailability,
      blockedDates: blockedDates ? blockedDates.map((b) => b.date) : [],
      minLeadTimeHours: 24,
    });
  } catch (err: any) {
    console.error("Delivery slots API error:", err);
    return NextResponse.json({
      success: true,
      slots: DEFAULT_DELIVERY_SLOTS.map((s) => ({ ...s, isFull: false, ordersBooked: 0, remaining: s.maxOrdersPerDay })),
      blockedDates: [],
      minLeadTimeHours: 24,
    });
  }
}
