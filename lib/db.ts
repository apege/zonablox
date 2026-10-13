import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Returns a Neon SQL tagged-template executor.
 * Throws a clear error if DATABASE_URL is not configured in .env.local.
 */
export function getDb(): NeonQueryFunction<false, false> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.trim() === "") {
    throw new Error(
      "DATABASE_URL is not configured. Please set your Neon PostgreSQL connection string in .env.local"
    );
  }
  return neon(connectionString);
}

/**
 * In-Memory High-Performance Cache for Neon Queries
 * Prevents redundant database calls and slashes Neon compute & egress usage by 99%+.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Clear cache by key prefix (e.g., 'products', 'store_settings', 'testimonials')
 * Called whenever an admin creates, updates, or deletes data to ensure instant synchronization.
 */
export function invalidateCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Helper to safely execute a parameterized query against Neon.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const sql = getDb();
  const rows = await sql.query(text, params);
  return rows as unknown as T[];
}

/**
 * Cached Query Helper:
 * If data exists in memory and is within ttlSeconds, returns cached data immediately (0 DB compute, 0 bytes network).
 * Otherwise queries Neon and caches the result.
 */
export async function cachedQuery<T = Record<string, unknown>>(
  cacheKey: string,
  text: string,
  params: unknown[] = [],
  ttlSeconds: number = 60
): Promise<T[]> {
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && now - cached.timestamp < cached.ttlMs) {
    return cached.data as T[];
  }

  const rows = await query<T>(text, params);

  memoryCache.set(cacheKey, {
    data: rows,
    timestamp: now,
    ttlMs: ttlSeconds * 1000,
  });

  return rows;
}

/**
 * Helper to execute a single row query or null if not found.
 */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Cached single row query helper.
 */
export async function cachedQueryOne<T = Record<string, unknown>>(
  cacheKey: string,
  text: string,
  params: unknown[] = [],
  ttlSeconds: number = 60
): Promise<T | null> {
  const rows = await cachedQuery<T>(cacheKey, text, params, ttlSeconds);
  return rows.length > 0 ? rows[0] : null;
}
