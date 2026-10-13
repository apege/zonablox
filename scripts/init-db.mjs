import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Simple helper to load .env.local if DATABASE_URL not in process.env
function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl || dbUrl.trim() === "") {
  console.error("❌ Error: DATABASE_URL is not set in .env.local.");
  console.error('👉 Please add your Neon connection string into .env.local: DATABASE_URL="postgresql://..."');
  process.exit(1);
}

async function run() {
  console.log("🚀 Connecting to Neon PostgreSQL...");
  const sql = neon(dbUrl);

  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`📦 Executing ${statements.length} SQL statements from db/schema.sql...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.trim()) {
      try {
        await sql.query(stmt);
      } catch (err) {
        console.warn(`⚠️ Warning executing statement ${i + 1}: ${err.message}`);
      }
    }
  }

  const tables = await sql.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
  );

  console.log("✅ Neon Database initialized successfully!");
  console.log("📋 Public Tables created:");
  tables.forEach((t) => console.log(`   - ${t.table_name}`));
}

run().catch((err) => {
  console.error("❌ Fatal Error during initialization:", err);
  process.exit(1);
});
