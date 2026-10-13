import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function GET() {
  const cookieStore = await cookies();

  try {
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const { valid, username } = await verifyAdminToken(token);

    return NextResponse.json(
      {
        authenticated: valid,
        username: valid ? username : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Cloudflare-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Check auth error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to verify session" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
