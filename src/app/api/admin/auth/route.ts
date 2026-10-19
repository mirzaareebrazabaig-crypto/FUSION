import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPlain = process.env.ADMIN_SECRET_KEY || "hayat2808";
    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    // If a hashed password is provided, use bcrypt verification; otherwise fall back to plain compare (insecure).
    const isValid = adminHash ? await verifyPassword(password, adminHash) : password === adminPlain;

    if (isValid) {
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
