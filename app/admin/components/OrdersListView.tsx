"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  RefreshCw,
  ExternalLink,
  Coins,
  CheckCircle2,
  Clock,
  Inbox,
  XCircle,
  Eye,
  Filter,
  ArrowRight,
  Star,
} from "lucide-react";
import { AdminOrder, formatCurrency } from "@/app/data/adminOrdersData";
import { AdminTab } from "./AdminSidebar";

interface OrdersListViewProps {
  currentTab: AdminTab;
  orders: AdminOrder[];
  currency: "MYR" | "IDR";
  onSelectOrder: (order: AdminOrder) => void;
  onQuickProcess: (orderId: string) => void;
  onRefreshData: () => void;
  onOpenReceipt: (imageUrl: string, orderId: string) => void;
  onOpenReviewModal?: (order: AdminOrder) => void;
}

export default function OrdersListView({
  currentTab,
  orders,
  currency,
  onSelectOrder,
  onQuickProcess,
  onRefreshData,
  onOpenReceipt,
  onOpenReviewModal,
}: OrdersListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"all" | "website" | "whatsapp" | "telegram">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine current active status filter based on currentTab
  const getStatusFromTab = (tab: AdminTab): string | null => {
    switch (tab) {
      case "orders-masuk":
        return "masuk";
      case "orders-diproses":
        return "diproses";
      case "orders-selesai":
        return "selesai";
      case "orders-dibatalkan":
        return "dibatalkan";
      default:
        return null;
    }
  };

  const currentStatus = getStatusFromTab(currentTab);

  // Tab titles & subtitles
  const getTabTitle = () => {
    switch (currentTab) {
      case "orders-masuk":
        return {
          title: "Incoming Orders",
          subtitle: "Review and process newly placed Robux orders on ZonaBlox",
        };
      case "orders-diproses":
        return {
          title: "Processing Orders",
          subtitle: "Robux orders currently in the gamepass delivery queue",
        };
      case "orders-selesai":
        return {
          title: "Completed Orders",
          subtitle: "Transactions successfully delivered to customer Roblox accounts",
        };
      case "orders-dibatalkan":
        return {
          title: "Cancelled Orders",
          subtitle: "Orders cancelled by customer or expired automatically",
        };
      default:
        return {
          title: "All Orders",
          subtitle: "Full Robux order registry across ZonaBlox",
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (currentStatus && order.status !== currentStatus) return false;

    // Channel filter
    if (selectedChannel !== "all" && order.channel !== selectedChannel) return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.username.toLowerCase().includes(q) ||
        order.robloxUserId.includes(q) ||
        order.customerWhatsapp.includes(q)
      );
    }
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition shadow-sm w-fit"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Main Order Table/List Card */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 p-4 sm:p-7 shadow-xl space-y-6">
        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-emerald-950/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-2xl">
            {/* Search filter input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by Order ID, username, or WhatsApp..."
                className="w-full bg-[#070e0b] text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-900/40 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
              />
            </div>

            {/* Channel filter pills */}
            <div className="grid grid-cols-4 sm:flex items-center gap-1.5 p-1 rounded-2xl bg-[#070e0b] border border-emerald-950/80 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setSelectedChannel("all")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-center transition ${
                  selectedChannel === "all"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedChannel("website")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-center transition ${
                  selectedChannel === "website"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Website
              </button>
              <button
                onClick={() => setSelectedChannel("telegram")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-center transition ${
                  selectedChannel === "telegram"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Telegram
              </button>
              <button
                onClick={() => setSelectedChannel("whatsapp")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-center transition ${
                  selectedChannel === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                WhatsApp
              </button>
            </div>
          </div>

          {/* Counter info */}
          <div className="text-xs font-bold text-zinc-400 shrink-0">
            Showing <span className="text-emerald-400">{filteredOrders.length}</span> orders
          </div>
        </div>

        {/* Order items list */}
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-emerald-950/70 space-y-1">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="py-4 sm:py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group hover:bg-[#0e1d16]/30 px-3 rounded-2xl transition"
              >
                {/* Left Info Column */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Order ID */}
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="text-base sm:text-lg font-black text-orange-400 hover:text-orange-300 tracking-tight transition"
                    >
                      #{order.id}
                    </button>

                    {/* Status Pill */}
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                        order.status === "masuk"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : order.status === "diproses"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : order.status === "selesai"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {order.status === "masuk"
                        ? "Incoming"
                        : order.status === "diproses"
                        ? "Processing"
                        : order.status === "selesai"
                        ? "Completed"
                        : "Cancelled"}
                    </span>
                  </div>

                  {/* Metadata Row: Username, Date, Channel, Photo status */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    {/* Roblox Username with link */}
                    <a
                      href={`https://www.roblox.com/users/search?keyword=${order.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:text-emerald-400 transition inline-flex items-center gap-1"
                    >
                      <span>@{order.username}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>

                    <span>•</span>
                    <span className="text-zinc-400">{order.createdAt}</span>

                    <span>•</span>
                    {/* Channel badge */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        order.channel === "telegram"
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : order.channel === "whatsapp"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {order.channel}
                    </span>

                    {/* Receipt Status */}
                    {order.receiptImage ? (
                      <button
                        onClick={() => onOpenReceipt(order.receiptImage!, order.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1 ml-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>(View Receipt)</span>
                      </button>
                    ) : (
                      <span className="text-zinc-500 italic text-[11px]">
                        (No receipt attached)
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Robux & Action Buttons Column */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 sm:gap-5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-emerald-950/60">
                  {/* Robux & Price */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Image
                        src="/robux.webp"
                        alt="Robux"
                        width={22}
                        height={22}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="text-sm font-extrabold text-white">
                        {order.robuxAmount.toLocaleString()} Robux
                      </div>
                      <div className="text-sm font-bold text-orange-400">
                        {formatCurrency(
                          currency === "MYR" ? order.priceMYR : order.priceIDR,
                          currency
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === "masuk" && (
                      <button
                        onClick={() => onQuickProcess(order.id)}
                        className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-sm"
                      >
                        Process
                      </button>
                    )}
                    {order.status === "diproses" && (
                      <button
                        onClick={() => onQuickProcess(order.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-sm"
                      >
                        Complete
                      </button>
                    )}
                    {order.status === "selesai" && (
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal?.(order)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        title="Send Review Link"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Send Review</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(234,88,12,0.3)] flex items-center gap-1.5"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-300">
              No Orders Found
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No orders match the selected filter or search keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
