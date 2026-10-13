import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/blacklists/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await queryOne(
      "DELETE FROM public.blacklists WHERE id::text = $1 OR roblox_username = $1 RETURNING *;",
      [id]
    );

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Blacklist entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User unblocked and removed from blacklist",
      data: deleted,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
