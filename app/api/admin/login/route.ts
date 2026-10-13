import { NextResponse } from "next/server";
import { createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = (body.username || "").trim();
    const password = (body.password || "").trim();

    const expectedUsername = (
      process.env.ADMIN_USERNAME || "admin_zonablox"
    ).trim();
    const expectedPassword = (
      process.env.ADMIN_PASSWORD || "@Zonablox2026"
    ).trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Generate secure HMAC session token
    const token = await createAdminToken(username);

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json(
      { success: true, message: "Welcome back, Admin!" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Cloudflare-CDN-Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Server error during authentication." },
      { status: 500 }
    );
  }
}
