"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  LogOut,
  Menu,
  Bell,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { AdminOrder, formatCurrency } from "@/app/data/adminOrdersData";

interface AdminHeaderProps {
  onToggleMobile: () => void;
  currency: "MYR" | "IDR";
  orders: AdminOrder[];
  onSelectOrder: (order: AdminOrder) => void;
  onLogout: () => void;
}

export default function AdminHeader({
  onToggleMobile,
  currency,
  orders,
  onSelectOrder,
  onLogout,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.robloxUserId.includes(searchQuery) ||
          o.customerWhatsapp.includes(searchQuery)
      )
    : [];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#08110d]/90 backdrop-blur-md border-b border-emerald-900/30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl bg-zinc-900/80 text-zinc-300 hover:text-white border border-emerald-900/40"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search orders, user, ID..."
              className="w-full bg-[#0d1813] text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 pl-9 sm:pl-10 pr-4 py-2 rounded-2xl border border-emerald-900/40 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c1611] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        onSelectOrder(order);
                        setSearchFocused(false);
                        setSearchQuery("");
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-emerald-950/50 flex items-center justify-between text-left transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                          ZBX
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-emerald-300">
                            #{order.id}
                          </div>
                          <div className="text-xs text-zinc-400">
                            @{order.username} • {order.robuxAmount.toLocaleString()} Robux
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">
                          {formatCurrency(
                            currency === "MYR" ? order.priceMYR : order.priceIDR,
                            currency
                          )}
                        </span>
                        <div className="text-[10px] text-zinc-500 uppercase">
                          {order.status === "masuk"
                            ? "Incoming"
                            : order.status === "diproses"
                            ? "Processing"
                            : order.status === "selesai"
                            ? "Completed"
                            : "Cancelled"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400">
                  No orders found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions & Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Profile Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0">
            <Image
              src="/logo.jpg"
              alt="ZonaBlox Admin"
              fill
              className="object-cover"
            />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              ZonaBlox Admin
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
              Super Admin
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-rose-950/40 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
