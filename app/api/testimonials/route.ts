import { NextResponse } from "next/server";
import { query, queryOne, cachedQuery, invalidateCache } from "@/lib/db";

// GET /api/testimonials
// Optional query: ?status=approved | all | pending
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "approved";
    const cacheKey = `testimonials:status_${status}`;

    let sql = `
      SELECT id, name, message, rating, robux_amount, order_code, status, is_verified, avatar_bg, admin_reply, created_at
      FROM public.testimonials
    `;
    const params: unknown[] = [];

    if (status !== "all") {
      sql += " WHERE status = $1";
      params.push(status);
    }

    sql += " ORDER BY created_at DESC LIMIT 50;";

    // Cached for 60 seconds for public storefront, 15 seconds for admin
    const ttl = status === "approved" ? 60 : 15;
    const testimonials = await cachedQuery(cacheKey, sql, params, ttl);

    return NextResponse.json(
      { success: true, data: testimonials },
      {
        headers: {
          "Cache-Control":
            status === "approved"
              ? "public, max-age=10, s-maxage=30, stale-while-revalidate=60"
              : "no-cache",
          ...(status === "approved"
            ? {
                "CDN-Cache-Control": "public, max-age=30",
                "Cloudflare-CDN-Cache-Control": "public, max-age=30",
              }
            : {}),
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/testimonials
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let {
      name,
      message,
      rating,
      robux_amount = 0,
      order_code = null,
      user_id = null,
      status = "approved",
      is_verified = true,
      avatar_bg = "from-emerald-500 to-teal-700",
      admin_reply = null,
      token = null,
    } = body;

    // If token provided, decode and validate from order
    if (token) {
      const { decodeReviewToken } = await import("@/lib/reviewToken");
      const decodedCode = decodeReviewToken(token);
      if (decodedCode) {
        order_code = decodedCode;
        const order = await queryOne<{ roblox_username: string; robux: number; order_status: string }>(
          `SELECT roblox_username, robux, order_status FROM public.orders WHERE order_code = $1 LIMIT 1`,
          [order_code]
        );
        if (order) {
          name = order.roblox_username;
          robux_amount = Number(order.robux);
          is_verified = true;
          status = "approved";
        }
      }
    }

    if (!name || !message || rating === undefined) {
      return NextResponse.json(
        { success: false, error: "name, message, and rating are required." },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, error: "rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    // Check duplicate review for same order_code
    if (order_code) {
      const existing = await queryOne(
        `SELECT 1 FROM public.testimonials WHERE order_code = $1 LIMIT 1`,
        [order_code]
      );
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A review for this order has already been submitted." },
          { status: 409 }
        );
      }
    }

    const insertSql = `
      INSERT INTO public.testimonials (
        user_id, name, message, rating, robux_amount, order_code, status, is_verified, avatar_bg, admin_reply
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const result = await queryOne(insertSql, [
      user_id,
      name.trim(),
      message.trim(),
      numericRating,
      robux_amount,
      order_code,
      status,
      is_verified,
      avatar_bg,
      admin_reply,
    ]);

    // Invalidate testimonials cache immediately
    invalidateCache("testimonials");

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
