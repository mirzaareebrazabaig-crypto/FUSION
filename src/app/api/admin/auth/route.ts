import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminKey = process.env.ADMIN_SECRET_KEY || "chocofusion2026";

    if (password === adminKey) {
      return NextResponse.json({ success: true, token: "admin_authenticated_session" });
    }

    return NextResponse.json(
      { success: false, error: "Incorrect admin password. Default is chocofusion2026" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
