import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    // Fetch active slots
    const slots = await prisma.deliverySlot.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Fetch blocked dates
    const blockedDates = await prisma.blockedDate.findMany({
      select: { date: true, reason: true },
    });

    // Check capacity if date is provided
    let slotAvailability = slots.map((s) => ({
      ...s,
      isFull: false,
      ordersBooked: 0,
      remaining: s.maxOrdersPerDay,
    }));

    if (dateStr) {
      // Count existing orders for this date and slot
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
    }

    return NextResponse.json({
      success: true,
      slots: slotAvailability,
      blockedDates: blockedDates.map((b) => b.date),
      minLeadTimeHours: 24,
    });
  } catch (err: any) {
    console.error("Delivery slots API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch delivery slots" },
      { status: 500 }
    );
  }
}
