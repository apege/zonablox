import { NextResponse } from "next/server";
import { query, queryOne, invalidateCache } from "@/lib/db";

// GET /api/activations
// Query: ?username=... (single check) or empty (list all)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim().replace(/^@/, "");

    if (username) {
      const row = await queryOne<{
        id: string;
        roblox_username: string;
        is_active: boolean;
        fee_amount: number;
        currency: string;
        notes: string | null;
        activated_at: string;
        created_at: string;
      }>(
        `SELECT id, roblox_username, is_active, fee_amount, currency, notes, activated_at, created_at 
         FROM public.id_activations 
         WHERE LOWER(roblox_username) = LOWER($1) 
         LIMIT 1;`,
        [username]
      );

      if (row) {
        return NextResponse.json({
          success: true,
          data: {
            ...row,
            fee_amount: Number(row.fee_amount),
            is_active: Boolean(row.is_active),
          },
        });
      }

      // Default inactive state for unregistered username
      return NextResponse.json({
        success: true,
        data: {
          roblox_username: username,
          is_active: false,
          fee_amount: 100000,
          currency: "IDR",
          notes: null,
          activated_at: null,
        },
      });
    }

    // List all activations
    const rows = await query(
      `SELECT id, roblox_username, is_active, fee_amount, currency, notes, activated_at, created_at
       FROM public.id_activations
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 100;`
    );

    const formatted = rows.map((r: any) => ({
      ...r,
      fee_amount: Number(r.fee_amount),
      is_active: Boolean(r.is_active),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/activations
// Toggle / create activation for a Roblox username
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let {
      roblox_username,
      is_active = true,
      fee_amount = 100000,
      currency = "IDR",
      notes = "",
    } = body;

    if (!roblox_username || typeof roblox_username !== "string") {
      return NextResponse.json(
        { success: false, error: "roblox_username is required" },
        { status: 400 }
      );
    }

    const cleanUsername = roblox_username.trim().replace(/^@/, "");
    if (!cleanUsername) {
      return NextResponse.json(
        { success: false, error: "Invalid roblox_username" },
        { status: 400 }
      );
    }

    const upsertSql = `
      INSERT INTO public.id_activations (
        roblox_username, is_active, fee_amount, currency, notes, activated_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, now(), now())
      ON CONFLICT (roblox_username) DO UPDATE SET
        is_active = EXCLUDED.is_active,
        fee_amount = EXCLUDED.fee_amount,
        currency = EXCLUDED.currency,
        notes = EXCLUDED.notes,
        activated_at = CASE WHEN EXCLUDED.is_active = true THEN now() ELSE public.id_activations.activated_at END,
        updated_at = now()
      RETURNING *;
    `;

    const result = await queryOne(upsertSql, [
      cleanUsername,
      Boolean(is_active),
      Number(fee_amount) || 100000,
      currency,
      notes,
    ]);

    invalidateCache("activations");

    return NextResponse.json({
      success: true,
      message: is_active
        ? `ID @${cleanUsername} successfully activated!`
        : `ID @${cleanUsername} deactivated.`,
      data: result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/activations?username=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim().replace(/^@/, "");

    if (!username) {
      return NextResponse.json(
        { success: false, error: "username parameter is required" },
        { status: 400 }
      );
    }

    await query(`DELETE FROM public.id_activations WHERE LOWER(roblox_username) = LOWER($1);`, [
      username,
    ]);

    invalidateCache("activations");

    return NextResponse.json({
      success: true,
      message: `Activation record for @${username} deleted.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
