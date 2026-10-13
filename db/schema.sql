-- ==============================================================================
-- ZonaBlox Database Schema (Adapted for Neon PostgreSQL)
-- Target: Neon Serverless Postgres
-- Currency: MYR (Malaysia Ringgit)
-- Order Prefix: ZBX...
-- ==============================================================================

-- Enable pgcrypto for UUID generation (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Users & Admin Staff)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NULL,
  username text UNIQUE NULL,
  password_hash text NULL,
  full_name text NULL,
  phone text NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS (Robux Packages & Top Up Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  robux integer NOT NULL CHECK (robux > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  popular boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  vip boolean NOT NULL DEFAULT false,
  badge text NULL,
  stock text NOT NULL DEFAULT 'in_stock' CHECK (stock IN ('in_stock', 'out_of_stock')),
  category text NOT NULL DEFAULT 'bestseller' CHECK (category IN ('bestseller', 'vip', 'standard')),
  is_active boolean NOT NULL DEFAULT true,
  image_path text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. ORDERS (Customer Purchases & Top Up Queue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_code text NOT NULL UNIQUE,
  product_id bigint NULL REFERENCES public.products(id) ON DELETE SET NULL,
  user_id uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  roblox_username text NOT NULL,
  roblox_user_id text NULL,
  roblox_avatar_url text NULL,
  customer_phone text NOT NULL,
  robux integer NOT NULL CHECK (robux > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  payment_method text NOT NULL DEFAULT 'Website' CHECK (payment_method IN ('Website', 'WhatsApp', 'DuitNow QR', 'TNG eWallet', 'Bank Transfer')),
  payment_channel text NOT NULL DEFAULT 'website' CHECK (payment_channel IN ('website', 'whatsapp')),
  submethod text NULL DEFAULT 'DuitNow QR',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_proof_path text NULL,
  order_status text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'completed', 'cancelled')),
  gamepass_link text NULL,
  customer_notes text NULL,
  admin_notes text NULL,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. BLACKLISTS (Fraud Prevention & Banned Users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blacklists (
  id bigserial PRIMARY KEY,
  roblox_username text NOT NULL UNIQUE,
  reason text NULL DEFAULT 'Indication of fraud or fake transfer receipts',
  roblox_user_id text NULL,
  phone text NULL,
  total_orders integer NOT NULL DEFAULT 0,
  total_spent numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. TESTIMONIALS (Customer Reviews & Ratings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  message text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  robux_amount integer NULL DEFAULT 0,
  order_code text NULL,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_verified boolean NOT NULL DEFAULT true,
  avatar_bg text NULL DEFAULT 'from-emerald-500 to-teal-700',
  admin_reply text NULL,
  image_path text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. STORE SETTINGS (Store Config, Announcement & Payment QR)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  store_name text NOT NULL DEFAULT 'ZonaBlox Malaysia',
  whatsapp_cs text NOT NULL DEFAULT '60123456789',
  promo_active boolean NOT NULL DEFAULT true,
  promo_package text NULL DEFAULT '2,700 Robux (RM 12.00)',
  promo_headline text NULL DEFAULT 'SPECIAL MALAYSIA ROBUX FLASH SALE',
  promo_description text NULL DEFAULT 'Instant Robux delivery, 100% legal, safe & guaranteed money back! No password required.',
  promo_end_date text NULL DEFAULT '31 October 2026 • 23:59 MYT',
  qris_nmid text NULL DEFAULT 'MY1029384756102',
  qris_image text NULL DEFAULT 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  store_logo text NULL DEFAULT '/logo.jpg',
  whatsapp_service_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. STORAGE CLEANUP LOGS (Storage maintenance & Cron jobs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.storage_cleanup_logs (
  id bigserial PRIMARY KEY,
  cleaned_count integer NOT NULL DEFAULT 0,
  order_codes text[] NOT NULL DEFAULT '{}'::text[],
  mode text NOT NULL DEFAULT 'cron',
  executed_by text NULL DEFAULT 'system',
  details jsonb NULL,
  created_at timestamptz NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_blacklists_username ON public.blacklists(roblox_username);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_order_code_unique ON public.testimonials(order_code) WHERE order_code IS NOT NULL;

-- ------------------------------------------------------------------------------
-- SEED INITIAL DATA (Safe Insert / Upsert)
-- ------------------------------------------------------------------------------

-- Seed Products (Pricelist in Ringgit Malaysia)
INSERT INTO public.products (name, robux, price, popular, best_seller, vip, badge, stock, category, is_active)
VALUES
  ('1,800 Robux', 1800, 8.00, true, true, false, 'Most Popular 🔥', 'in_stock', 'bestseller', true),
  ('2,200 Robux', 2200, 10.00, false, true, false, '⚡ PROMO', 'in_stock', 'bestseller', true),
  ('2,700 Robux', 2700, 12.00, false, true, false, 'Hot Deal ✨', 'in_stock', 'bestseller', true),
  ('3,200 Robux', 3200, 14.00, false, true, false, NULL, 'in_stock', 'bestseller', true),
  ('3,700 Robux', 3700, 16.00, false, true, false, NULL, 'in_stock', 'bestseller', true),
  ('4,200 Robux', 4200, 18.00, false, true, false, NULL, 'in_stock', 'bestseller', true),
  ('4,700 Robux', 4700, 21.00, false, false, true, 'VIP Tier 👑', 'in_stock', 'vip', true),
  ('5,500 Robux', 5500, 24.00, false, false, true, 'VIP Tier 👑', 'in_stock', 'vip', true),
  ('6,000 Robux', 6000, 27.00, false, false, true, 'VIP Tier 👑', 'in_stock', 'vip', true),
  ('7,000 Robux', 7000, 31.00, false, false, true, 'VIP Tier 👑', 'in_stock', 'vip', true),
  ('8,500 Robux', 8500, 38.00, false, false, true, 'Whale Pack 🐋', 'in_stock', 'vip', true),
  ('10,000 Robux', 10000, 45.00, false, false, true, 'King Pack 💎', 'in_stock', 'vip', true)
ON CONFLICT DO NOTHING;

-- Seed Default Store Settings
INSERT INTO public.store_settings (id, store_name, whatsapp_cs, promo_active, promo_package, promo_headline, promo_description, promo_end_date, qris_nmid)
VALUES (
  'default',
  'ZonaBlox Malaysia',
  '60123456789',
  true,
  '2,700 Robux (RM 12.00)',
  'SPECIAL MALAYSIA ROBUX FLASH SALE',
  'Instant Robux delivery, 100% legal, safe & guaranteed money back! No password required.',
  '31 October 2026 • 23:59 MYT',
  'MY1029384756102'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Blacklists
INSERT INTO public.blacklists (roblox_username, reason, roblox_user_id, phone, total_orders, total_spent)
VALUES
  ('abuser_malaysia', 'Indication of fraud or fake transfer receipts', 'Not recorded', '+60123456789', 0, 0.00),
  ('fake_player99', 'Spam fake orders without payment', '1122334455', '+60129999888', 1, 0.00)
ON CONFLICT (roblox_username) DO NOTHING;

-- Seed Initial Testimonials
INSERT INTO public.testimonials (name, message, rating, robux_amount, order_code, status, is_verified, avatar_bg, admin_reply)
VALUES
  ('Londoireng61', 'A bit slow in response but overall completely safe and Robux arrived intact!', 4, 4200, '#ZBX62019482', 'approved', true, 'from-pink-500 to-rose-600', NULL),
  ('Crasiel17', 'Insane delivery speed! Robux arrived in under 2 minutes after payment. Definitely my go-to shop.', 5, 3700, '#ZBX33918274', 'approved', true, 'from-rose-500 to-orange-500', 'Thank you for shopping with ZonaBlox Malaysia! Looking forward to your next order.'),
  ('haikal_cool', 'First time ordering and was slightly hesitant, but turned out 100% legit. Recommended!', 5, 2200, '#ZBX88291024', 'approved', true, 'from-emerald-500 to-teal-500', NULL),
  ('mamat_roblox9', 'Fast service, helpful admin. Robux credited via gamepass smoothly.', 5, 5500, '#ZBX19482736', 'approved', true, 'from-amber-500 to-red-500', NULL),
  ('AlyaGamer', 'Recommended for Malaysian players! Cheap price compared to official in-game store.', 5, 1800, '#ZBX77401928', 'approved', true, 'from-purple-500 to-indigo-500', NULL)
ON CONFLICT DO NOTHING;
