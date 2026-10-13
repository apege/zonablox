import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { decodeReviewToken } from "@/lib/reviewToken";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing review token." },
        { status: 400 }
      );
    }

    const orderCode = decodeReviewToken(token);
    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: "Invalid review token format." },
        { status: 400 }
      );
    }

    // Lookup order in Neon
    const order = await queryOne<{
      order_code: string;
      roblox_username: string;
      roblox_avatar_url: string | null;
      robux: number;
      price: number;
      order_status: string;
    }>(
      `SELECT order_code, roblox_username, roblox_avatar_url, robux, price, order_status
       FROM public.orders
       WHERE order_code = $1
       LIMIT 1;`,
      [orderCode]
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found. Please verify your link." },
        { status: 404 }
      );
    }

    if (order.order_status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "This order is not marked as completed yet. Reviews can only be submitted once top-up delivery is finished.",
        },
        { status: 400 }
      );
    }

    // Check if testimonial already exists for this order
    const existingReview = await queryOne<{
      id: string;
      rating: number;
      message: string;
      created_at: string;
    }>(
      `SELECT id, rating, message, created_at
       FROM public.testimonials
       WHERE order_code = $1
       LIMIT 1;`,
      [orderCode]
    );

    return NextResponse.json({
      success: true,
      already_reviewed: Boolean(existingReview),
      order: {
        order_code: order.order_code,
        roblox_username: order.roblox_username,
        roblox_avatar_url: order.roblox_avatar_url,
        robux: Number(order.robux),
        price: Number(order.price),
      },
      review: existingReview || null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
