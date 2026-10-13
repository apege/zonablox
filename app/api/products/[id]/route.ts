import { NextResponse } from "next/server";
import { queryOne, invalidateCache } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await queryOne(
      "SELECT id, name, robux, price, popular, best_seller, vip, badge, stock, category, is_active FROM public.products WHERE id = $1;",
      [id]
    );
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PATCH /api/products/[id]
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.stock !== undefined && body.is_active === undefined) {
      body.is_active = body.stock === "in_stock";
    }

    const allowedFields = [
      "name",
      "robux",
      "price",
      "is_active",
      "image_path",
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

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields provided to update" }, { status: 400 });
    }

    updates.push(`updated_at = now()`);
    values.push(id);

    const updateSql = `
      UPDATE public.products
      SET ${updates.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const updated = await queryOne(updateSql, values);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Invalidate product caches immediately
    invalidateCache("products");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await queryOne(
      "DELETE FROM public.products WHERE id = $1 RETURNING *;",
      [id]
    );

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Invalidate product caches immediately
    invalidateCache("products");

    return NextResponse.json({ success: true, message: "Product deleted successfully", data: deleted });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
