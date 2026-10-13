import { NextResponse } from "next/server";
import { queryOne, invalidateCache } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/testimonials/[id]
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = ["status", "admin_reply", "rating", "message", "is_verified"];
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

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields provided to update" }, { status: 400 });
    }

    updates.push(`updated_at = now()`);
    values.push(id);

    const updateSql = `
      UPDATE public.testimonials
      SET ${updates.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const updated = await queryOne(updateSql, values);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }

    // Invalidate testimonials cache immediately
    invalidateCache("testimonials");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/testimonials/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await queryOne(
      "DELETE FROM public.testimonials WHERE id = $1 RETURNING *;",
      [id]
    );

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
    }

    // Invalidate testimonials cache immediately
    invalidateCache("testimonials");

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
