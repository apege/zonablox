import { NextResponse } from "next/server";
import { query, cachedQuery, invalidateCache } from "@/lib/db";

// GET /api/products
// Automatically computes:
// 1. Popular = package with highest purchase count in orders
// 2. Promo = package selected in store settings
// 3. VIP = packages with Robux tier > 10,000 R$
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active_only") !== "false";
    const cacheKey = `products:active_${activeOnly}`;

    const productsSql = `
      SELECT id, name, robux, price, is_active
      FROM public.products
      ${activeOnly ? "WHERE is_active = true" : ""}
      ORDER BY robux ASC;
    `;

    // Cached for 60 seconds (protects Neon compute and egress)
    const rawProducts = await cachedQuery(cacheKey, productsSql, [], 60);

    // 1. Top sales from orders for automatic Popular badge
    let topSalesRobux: number | null = null;
    try {
      const topSalesRows = await cachedQuery(
        "products:top_sales",
        `SELECT robux, COUNT(*) as sales_count
         FROM public.orders
         WHERE order_status != 'cancelled'
         GROUP BY robux
         ORDER BY sales_count DESC, robux ASC
         LIMIT 1;`,
        [],
        60
      );
      if (topSalesRows && topSalesRows.length > 0 && Number(topSalesRows[0].sales_count) > 0) {
        topSalesRobux = Number(topSalesRows[0].robux);
      }
    } catch {
      // ignore
    }

    // 2. Promo settings for automatic Promo badge
    let promoActive = false;
    let promoRobux: number | null = null;
    try {
      const settingsRows = await cachedQuery(
        "store_settings:default",
        `SELECT promo_active, promo_package FROM public.store_settings WHERE id = 'default' LIMIT 1;`,
        [],
        60
      );
      if (settingsRows && settingsRows.length > 0) {
        const s = settingsRows[0];
        promoActive = Boolean(s.promo_active);
        if (s.promo_package) {
          const clean = String(s.promo_package).replace(/,/g, "");
          const match = clean.match(/\d+/);
          if (match) {
            promoRobux = parseInt(match[0], 10);
          }
        }
      }
    } catch {
      // ignore
    }

    // Map each product with automatic badges and categories
    const products = rawProducts.map((p: any) => {
      const robuxNum = Number(p.robux);
      const isVip = robuxNum > 10000;
      const isPromo = promoActive && promoRobux !== null && robuxNum === promoRobux;
      const isPopular = !isPromo && topSalesRobux !== null && robuxNum === topSalesRobux;

      let badge: string | null = null;
      if (isPromo) {
        badge = "PROMO";
      } else if (isVip) {
        badge = "VIP";
      } else if (isPopular) {
        badge = "POPULAR";
      }

      return {
        id: p.id,
        name: p.name,
        robux: robuxNum,
        price: Number(p.price),
        is_active: Boolean(p.is_active),
        stock: p.is_active ? "in_stock" : "out_of_stock",
        popular: isPopular,
        promo: isPromo,
        vip: isVip,
        badge: badge,
        category: isVip ? "vip" : "bestseller",
      };
    });

    return NextResponse.json(
      { success: true, data: products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      robux,
      price,
      is_active = true,
      image_path = null,
    } = body;

    if (!name || !robux || price === undefined) {
      return NextResponse.json(
        { success: false, error: "name, robux, and price are required." },
        { status: 400 }
      );
    }

    const insertSql = `
      INSERT INTO public.products (
        name, robux, price, is_active, image_path
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await query(insertSql, [
      name,
      Number(robux),
      Number(price),
      is_active,
      image_path,
    ]);

    // Invalidate product caches immediately so storefront updates in real-time
    invalidateCache("products");

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
