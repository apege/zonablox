import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/storage-cleanup
export async function GET() {
  try {
    const logs = await query(
      `SELECT * FROM public.storage_cleanup_logs ORDER BY created_at DESC LIMIT 50;`
    );
    return NextResponse.json({ success: true, data: logs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/storage-cleanup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cleaned_count = 0,
      order_codes = [],
      mode = "manual",
      executed_by = "admin",
      details = null,
    } = body;

    const insertSql = `
      INSERT INTO public.storage_cleanup_logs (
        cleaned_count, order_codes, mode, executed_by, details
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const log = await queryOne(insertSql, [
      cleaned_count,
      order_codes,
      mode,
      executed_by,
      details ? JSON.stringify(details) : null,
    ]);

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
