import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            total: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
