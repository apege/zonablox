import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

export async function POST() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === "") {
    return NextResponse.json(
      {
        success: false,
        error: "DATABASE_URL is not set in .env.local. Please provide your Neon connection string.",
      },
      { status: 500 }
    );
  }

  try {
    const sql = neon(databaseUrl);
    const schemaPath = path.join(process.cwd(), "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    // Split SQL by semicolons, filtering out comments and empty statements
    // We execute statements sequentially to avoid multi-statement edge cases in serverless HTTP
    const statements = schemaSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      if (stmt.trim()) {
        await sql.query(stmt);
      }
    }

    // Verify created tables
    const tables = await sql.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );

    return NextResponse.json({
      success: true,
      message: "Neon database schema initialized and seeded successfully!",
      tables: tables.map((t: Record<string, unknown>) => t.table_name),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: `Database initialization failed: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
