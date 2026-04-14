import { NextResponse } from "next/server";

// Team password - change this to whatever you want
const GATE_PASSWORD = process.env.GATE_PASSWORD ?? "flightschool2026";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === GATE_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("gate_access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
