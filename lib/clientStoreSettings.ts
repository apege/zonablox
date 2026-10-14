// Shared Client-Side Store Settings Manager
// Deduplicates simultaneous calls across Navbar, Hero, TopUpSection, and Footer
// Reduces 4 separate network requests to 1 single request per page load.

export interface StoreSettingsData {
  store_name?: string;
  whatsapp_cs?: string;
  whatsapp_service_active?: boolean;
  telegram_cs?: string;
  promo_active?: boolean;
  promo_package?: string;
  promo_headline?: string;
  promo_description?: string;
  promo_end_date?: string;
  qris_nmid?: string;
  qris_image?: string;
  store_logo?: string;
}

let cachedSettings: StoreSettingsData | null = null;
let lastFetchTime = 0;
let inFlightPromise: Promise<StoreSettingsData | null> | null = null;

const CACHE_TTL_MS = 20 * 1000; // 20 seconds client memory cache

export async function getStoreSettings(forceRefresh = false): Promise<StoreSettingsData | null> {
  const now = Date.now();

  // Return in-memory cache if still fresh and not forcing refresh
  if (!forceRefresh && cachedSettings && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  // Deduplicate in-flight requests (if Navbar, Hero, and Footer call at the same millisecond)
  if (inFlightPromise && !forceRefresh) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const url = forceRefresh
        ? `/api/store-settings?admin=true&_t=${now}`
        : `/api/store-settings`;

      const res = await fetch(url, {
        cache: forceRefresh ? "no-store" : "default",
      });

      const json = await res.json();
      if (json.success && json.data) {
        cachedSettings = json.data;
        lastFetchTime = Date.now();
        return json.data;
      }
    } catch (e) {
      console.error("Failed to load store settings:", e);
    } finally {
      inFlightPromise = null;
    }
    return cachedSettings;
  })();

  return inFlightPromise;
}

export function invalidateClientStoreSettings() {
  cachedSettings = null;
  lastFetchTime = 0;
  inFlightPromise = null;
}
