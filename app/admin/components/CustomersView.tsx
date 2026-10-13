"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  Check,
  Copy,
  ChevronRight,
  TrendingUp,
  Coins,
} from "lucide-react";
import { AdminOrder } from "@/app/data/adminOrdersData";

export interface CustomerItem {
  id: string; // Roblox User ID
  username: string;
  whatsapp: string;
  totalOrders: number;
  totalSpentMYR: number;
  totalSpentIDR?: number;
  lastOrderDate: string;
  lastOrderTimestamp: number;
  isActive: boolean;
}

// Initial empty dataset - loaded dynamically from Neon database orders
const INITIAL_CUSTOMERS: CustomerItem[] = [];

interface CustomersViewProps {
  orders: AdminOrder[];
  currency?: "MYR" | "IDR";
  onSelectCustomerOrder?: (order: AdminOrder) => void;
  onBlacklistCustomer?: (customer: { username: string; whatsapp?: string; robloxUserId?: string }) => void;
  onToast?: (title: string, desc: string, type?: "success" | "info" | "warning") => void;
}

export default function CustomersView({
  orders,
  onBlacklistCustomer,
  onToast,
}: CustomersViewProps) {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dynamically aggregate customer directory from Neon orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      const map = new Map<string, CustomerItem>();
      orders.forEach((o) => {
        const key = o.username.toLowerCase();
        const existing = map.get(key);
        const orderTime = o.createdAtTimestamp || Date.now();
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpentMYR += o.priceMYR || 0;
          if (orderTime > existing.lastOrderTimestamp) {
            existing.lastOrderTimestamp = orderTime;
            existing.lastOrderDate = o.createdAt;
          }
        } else {
          map.set(key, {
            id: o.robloxUserId || o.id,
            username: o.username,
            whatsapp: o.customerWhatsapp || "-",
            totalOrders: 1,
            totalSpentMYR: o.priceMYR || 0,
            lastOrderDate: o.createdAt,
            lastOrderTimestamp: orderTime,
            isActive: true,
          });
        }
      });
      setCustomers(Array.from(map.values()));
    } else {
      setCustomers([]);
    }
  }, [orders]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onToast) {
        onToast("Data Refreshed", "Customer directory synchronized with real-time orders.", "info");
      }
    }, 600);
  };

  const filtered = customers.filter(
    (c) =>
      c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.includes(searchTerm) ||
      c.whatsapp.includes(searchTerm)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Buyer accounts aggregated from transaction history and activity
          </p>
        </div>

        {/* Refresh Data Button */}
        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition shadow-sm w-fit"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Main Customer Container Card */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 p-4 sm:p-7 shadow-xl space-y-6">
        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-950/80">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username, Roblox ID, or WhatsApp..."
              className="w-full bg-[#070e0b] text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-900/40 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
            />
          </div>

          <div className="text-xs font-bold text-zinc-400 shrink-0">
            Showing <span className="text-emerald-400">{filtered.length}</span> customers
          </div>
        </div>

        {/* List of Customer Cards */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((cust) => (
              <div
                key={cust.username}
                className="p-4 sm:p-5 rounded-2xl bg-[#070e0b] border border-emerald-950/80 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left Side: Username, Status Badge, ID, WA, Last Order */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Username with external link */}
                    <a
                      href={`https://www.roblox.com/users/search?keyword=${cust.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-base sm:text-lg text-orange-400 hover:text-orange-300 transition flex items-center gap-1.5"
                    >
                      <span>@{cust.username}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 transition" />
                    </a>

                    {/* Status Badge: ACTIVE */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <UserCheck className="w-3 h-3" />
                      <span>ACTIVE</span>
                    </span>
                  </div>

                  {/* Subtext info: ID • WA • Last Order */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <span>ID:</span>
                      <span className="text-zinc-300 font-semibold">{cust.id}</span>
                      <button
                        onClick={() => handleCopy(cust.id)}
                        className="text-zinc-500 hover:text-white"
                        title="Copy ID"
                      >
                        {copiedText === cust.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <span>WA:</span>
                      <a
                        href={`https://wa.me/${cust.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 font-semibold hover:text-emerald-400 transition"
                      >
                        +{cust.whatsapp}
                      </a>
                    </span>

                    <span>•</span>

                    <span>Last order: {cust.lastOrderDate}</span>
                  </div>
                </div>

                {/* Right Side: Orders count, Total RM, Blacklist Button */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-950/60">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      {cust.totalOrders}X ORDERS
                    </div>
                    <div className="text-base sm:text-lg font-black text-white tracking-tight">
                      RM {cust.totalSpentMYR.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Blacklist Button */}
                  <button
                    onClick={() => {
                      if (onBlacklistCustomer) {
                        onBlacklistCustomer({
                          username: cust.username,
                          whatsapp: cust.whatsapp,
                          robloxUserId: cust.id,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 text-xs font-bold transition shadow-sm"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Blacklist</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <h4 className="text-base font-bold text-zinc-300">
              No Customers Found
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No customers match your search criteria &quot;{searchTerm}&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
