import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/blacklists
// Optional query: ?username=... OR ?search=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkUsername = searchParams.get("username");
    const checkPhone = searchParams.get("phone");
    const search = searchParams.get("search");

    // Fast check if a specific user/phone is blacklisted
    if (checkUsername || checkPhone) {
      const match = await queryOne(
        `SELECT * FROM public.blacklists
         WHERE (LOWER(roblox_username) = LOWER($1))
            OR ($2::text IS NOT NULL AND phone = $2)
         LIMIT 1;`,
        [checkUsername?.trim() || "", checkPhone?.trim() || null]
      );

      return NextResponse.json({
        success: true,
        isBlacklisted: !!match,
        data: match,
      });
    }

    let sql = "SELECT * FROM public.blacklists";
    const params: unknown[] = [];

    if (search?.trim()) {
      sql += " WHERE roblox_username ILIKE $1 OR phone ILIKE $1 OR reason ILIKE $1";
      params.push(`%${search.trim()}%`);
    }

    sql += " ORDER BY created_at DESC;";

    const blacklists = await query(sql, params);
    return NextResponse.json({ success: true, data: blacklists });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/blacklists
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roblox_username,
      reason = "Indication of fraud or fake transfer receipts",
      roblox_user_id = null,
      phone = null,
      total_orders = 0,
      total_spent = 0,
    } = body;

    if (!roblox_username?.trim()) {
      return NextResponse.json(
        { success: false, error: "roblox_username is required" },
        { status: 400 }
      );
    }

    const insertSql = `
      INSERT INTO public.blacklists (
        roblox_username, reason, roblox_user_id, phone, total_orders, total_spent
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (roblox_username)
      DO UPDATE SET
        reason = EXCLUDED.reason,
        phone = COALESCE(EXCLUDED.phone, public.blacklists.phone),
        roblox_user_id = COALESCE(EXCLUDED.roblox_user_id, public.blacklists.roblox_user_id)
      RETURNING *;
    `;

    const result = await queryOne(insertSql, [
      roblox_username.trim(),
      reason,
      roblox_user_id,
      phone?.trim() || null,
      total_orders,
      total_spent,
    ]);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
