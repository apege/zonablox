import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
let dbUrl = "";
for (const line of envContent.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    dbUrl = line.substring("DATABASE_URL=".length).trim();
    break;
  }
}

if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log("Migrating database for Telegram CS support...");
  await sql.query(`ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS telegram_cs TEXT NULL DEFAULT '@zonabloxmy';`);
  await sql.query(`UPDATE public.store_settings SET telegram_cs = COALESCE(telegram_cs, '@zonabloxmy');`);
  await sql.query(`ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;`);
  await sql.query(`ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_channel_check;`);
  
  const res = await sql.query(`SELECT store_name, whatsapp_cs, whatsapp_service_active, telegram_cs FROM public.store_settings WHERE id = 'default' LIMIT 1;`);
  console.log("Current store settings:", res);
  console.log("Migration successful!");
}

main().catch(console.error);
