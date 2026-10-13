import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

interface RouteParams {
  params: Promise<{ code: string }>;
}

// GET /api/orders/[code]
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const order = await queryOne(
      `SELECT o.*, p.name as product_name
       FROM public.orders o
       LEFT JOIN public.products p ON o.product_id = p.id
       WHERE o.order_code = $1 OR o.id::text = $1;`,
      [code]
    );

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PATCH /api/orders/[code]
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await request.json();

    // Fetch existing order first
    const existing = await queryOne<{
      id: string | number;
      order_code: string;
      timeline: Array<Record<string, unknown>> | string;
    }>(
      `SELECT id, order_code, timeline FROM public.orders WHERE order_code = $1 OR id::text = $1;`,
      [code]
    );

    if (!existing) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const allowedFields = [
      "order_status",
      "payment_status",
      "admin_notes",
      "customer_notes",
      "gamepass_link",
      "payment_proof_path",
    ];

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(body[key]);
        idx++;
      }
    }

    // Optional timeline append
    if (body.new_timeline_event) {
      const existingTimeline: Array<Record<string, unknown>> = Array.isArray(existing.timeline)
        ? existing.timeline
        : typeof existing.timeline === "string"
        ? JSON.parse(existing.timeline)
        : [];

      const nowTimeStr = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const updatedTimeline = [
        ...existingTimeline,
        {
          time: body.new_timeline_event.time || `${nowTimeStr} MYT`,
          title: body.new_timeline_event.title || "Status Updated",
          desc: body.new_timeline_event.desc || "",
          by: body.new_timeline_event.by || "Admin",
        },
      ];

      updates.push(`timeline = $${idx}`);
      values.push(JSON.stringify(updatedTimeline));
      idx++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 }
      );
    }

    updates.push(`updated_at = now()`);
    values.push(existing.id);

    const updateSql = `
      UPDATE public.orders
      SET ${updates.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const updated = await queryOne(updateSql, values);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
