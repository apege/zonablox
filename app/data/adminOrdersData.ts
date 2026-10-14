export interface AdminOrder {
  id: string; // e.g. "ZBX93464279"
  username: string; // e.g. "opositadapl"
  robloxUserId: string; // e.g. "5593439981"
  robloxAvatarUrl?: string;
  robuxAmount: number; // e.g. 2200
  priceMYR: number; // e.g. 10
  priceIDR: number; // e.g. 45000
  channel: "whatsapp" | "website" | "telegram";
  submethod: string; // e.g. "DuitNow QR", "TNG eWallet", "WhatsApp Direct", "Telegram Direct"
  status: "masuk" | "diproses" | "selesai" | "dibatalkan";
  createdAt: string; // e.g. "7 Oct 2026, 19:42 MYT"
  createdAtTimestamp: number;
  customerWhatsapp: string; // e.g. "+60128582837" or "+60123456789"
  customerNotes: string;
  adminNotes: string;
  receiptImage: string | null;
  gamepassLink?: string;
  timeline?: {
    time: string;
    title: string;
    desc: string;
    by: string;
  }[];
}

// Initial empty orders array - orders are loaded dynamically from Neon database via API
export const INITIAL_ADMIN_ORDERS: AdminOrder[] = [];

// Helper to format currency (Default to MYR)
export function formatCurrency(amount: number, currency: "MYR" | "IDR" = "MYR"): string {
  if (currency === "MYR") {
    return `RM ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
