import { NextResponse } from "next/server";
import { queryOne, invalidateCache } from "@/lib/db";

// GET /api/store-settings
// Real-time fresh settings with strict anti-cache headers for Cloudflare Edge & Browser
export async function GET(request: Request) {
  try {
    const settings = await queryOne(
      `SELECT store_name, whatsapp_cs, whatsapp_service_active, promo_active, promo_package, promo_headline, promo_description, promo_end_date, qris_nmid, qris_image, store_logo
       FROM public.store_settings
       WHERE id = 'default' LIMIT 1;`
    );

    const fallback = {
      store_name: "ZonaBlox Malaysia",
      whatsapp_cs: "60123456789",
      whatsapp_service_active: false,
      promo_active: true,
      promo_package: "2,700 Robux (RM 12.00)",
      promo_headline: "SPECIAL MALAYSIA ROBUX FLASH SALE",
      promo_description: "",
      promo_end_date: "31 October 2026 • 23:59 MYT",
      qris_nmid: "MY1029384756102",
      qris_image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
      store_logo: "/logo.jpg",
    };

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    const headers: Record<string, string> = isAdmin
      ? {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
          "Surrogate-Control": "no-store",
          "CDN-Cache-Control": "no-store",
          "Cloudflare-CDN-Cache-Control": "no-store",
        }
      : {
          "Cache-Control": "public, max-age=10, s-maxage=30, stale-while-revalidate=60",
          "CDN-Cache-Control": "public, max-age=30",
          "Cloudflare-CDN-Cache-Control": "public, max-age=30",
        };

    return NextResponse.json(
      { success: true, data: settings || fallback },
      { headers }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PUT /api/store-settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const allowedFields = [
      "store_name",
      "whatsapp_cs",
      "whatsapp_service_active",
      "promo_active",
      "promo_package",
      "promo_headline",
      "promo_description",
      "promo_end_date",
      "qris_nmid",
      "qris_image",
      "store_logo",
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

    const updateSql = `
      INSERT INTO public.store_settings (id, ${allowedFields.filter((k) => body[k] !== undefined).join(", ")}, updated_at)
      VALUES ('default', ${values.map((_, i) => `$${i + 1}`).join(", ")}, now())
      ON CONFLICT (id) DO UPDATE SET
        ${updates.join(", ")}
      RETURNING *;
    `;

    const updated = await queryOne(updateSql, values);

    // Invalidate cache immediately so storefront and products see new promo info instantly
    invalidateCache("store_settings");
    invalidateCache("products");

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
