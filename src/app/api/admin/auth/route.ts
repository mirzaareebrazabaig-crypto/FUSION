import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminKey = process.env.ADMIN_SECRET_KEY || "hayat2808";

    if (password === adminKey) {
      return NextResponse.json({ success: true, token: "admin_authenticated_session" });
    }

    return NextResponse.json(
      { success: false, error: "Incorrect admin password." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
