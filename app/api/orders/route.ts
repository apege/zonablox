import { NextResponse } from "next/server";
import { query, queryOne, invalidateCache } from "@/lib/db";

// GET /api/orders
// Query params: ?search=...&status=...&payment_status=...&limit=50&offset=0
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (search.trim()) {
      conditions.push(
        `(o.order_code ILIKE $${idx} OR o.roblox_username ILIKE $${idx} OR o.customer_phone ILIKE $${idx})`
      );
      params.push(`%${search.trim()}%`);
      idx++;
    }

    if (status && status !== "all") {
      conditions.push(`o.order_status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (paymentStatus && paymentStatus !== "all") {
      conditions.push(`o.payment_status = $${idx}`);
      params.push(paymentStatus);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Specific projection to minimize network transfer
    const listSql = `
      SELECT
        o.id,
        o.order_code,
        o.roblox_username,
        o.roblox_user_id,
        o.roblox_avatar_url,
        o.customer_phone,
        o.robux,
        o.price,
        o.payment_method,
        o.payment_channel,
        o.submethod,
        o.payment_status,
        o.payment_proof_path,
        o.order_status,
        o.customer_notes,
        o.admin_notes,
        o.gamepass_link,
        o.timeline,
        o.created_at,
        p.name as product_name
      FROM public.orders o
      LEFT JOIN public.products p ON o.product_id = p.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    params.push(limit, offset);

    const countSql = `
      SELECT COUNT(*) as total FROM public.orders o ${whereClause};
    `;

    const [orders, countResult] = await Promise.all([
      query(listSql, params),
      queryOne<{ total: string | number }>(countSql, params.slice(0, idx - 1)),
    ]);

    return NextResponse.json({
      success: true,
      total: Number(countResult?.total || 0),
      limit,
      offset,
      data: orders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roblox_username,
      customer_phone,
      robux,
      price,
      product_id = null,
      user_id = null,
      roblox_user_id = null,
      roblox_avatar_url = null,
      payment_method = "Website",
      payment_channel = "website",
      submethod = "DuitNow QR",
      customer_notes = null,
      gamepass_link = null,
      payment_proof_path = null,
    } = body;

    if (!roblox_username || !customer_phone || !robux || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "roblox_username, customer_phone, robux, and price are required.",
        },
        { status: 400 }
      );
    }

    // 1. Ultra-fast index check for Blacklist (transferring only 1 byte)
    const blacklistCheck = await queryOne(
      `SELECT 1 FROM public.blacklists
       WHERE LOWER(roblox_username) = LOWER($1) OR (phone IS NOT NULL AND phone = $2)
       LIMIT 1;`,
      [roblox_username.trim(), customer_phone.trim()]
    );

    if (blacklistCheck) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This Roblox account or phone number is restricted from placing orders due to suspicious activity.",
        },
        { status: 403 }
      );
    }

    // 2. Generate unique order code (ZBX followed by 8 random digits)
    let orderCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      attempts++;
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
      const candidate = `ZBX${randomDigits}`;
      const existing = await queryOne(
        `SELECT 1 FROM public.orders WHERE order_code = $1 LIMIT 1;`,
        [candidate]
      );
      if (!existing) {
        orderCode = candidate;
        isUnique = true;
      }
    }

    if (!orderCode) {
      orderCode = `ZBX${Date.now().toString().slice(-8)}`;
    }

    // 3. Initial Timeline
    const nowTimeStr = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const initialTimeline = [
      {
        time: `${nowTimeStr} MYT`,
        title: "Order Created",
        desc: `Order placed via ${payment_channel === "whatsapp" ? "WhatsApp Direct" : "Website Checkout"}`,
        by: "System",
      },
    ];

    const insertSql = `
      INSERT INTO public.orders (
        order_code,
        product_id,
        user_id,
        roblox_username,
        roblox_user_id,
        roblox_avatar_url,
        customer_phone,
        robux,
        price,
        payment_method,
        payment_channel,
        submethod,
        payment_status,
        payment_proof_path,
        order_status,
        customer_notes,
        gamepass_link,
        timeline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', $13, 'pending', $14, $15, $16)
      RETURNING *;
    `;

    const newOrder = await queryOne(insertSql, [
      orderCode,
      product_id,
      user_id,
      roblox_username.trim(),
      roblox_user_id,
      roblox_avatar_url,
      customer_phone.trim(),
      robux,
      price,
      payment_method,
      payment_channel,
      submethod,
      payment_proof_path,
      customer_notes,
      gamepass_link,
      JSON.stringify(initialTimeline),
    ]);

    invalidateCache("orders");

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
