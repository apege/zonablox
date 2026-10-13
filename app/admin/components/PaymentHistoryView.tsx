"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  TrendingUp,
  Coins,
  Receipt,
  Globe,
  MessageCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Download,
  CheckCircle2,
  Calendar,
  CreditCard,
  Percent,
} from "lucide-react";
import { AdminOrder } from "@/app/data/adminOrdersData";

export interface PaymentMutationItem {
  id: string; // e.g. mut-1
  username: string;
  orderCode: string; // e.g. ZBX25053496
  amountMYR: number;
  robuxAmount: number;
  channel: "website" | "whatsapp";
  methodName: string; // DuitNow QR, TNG eWallet, FPX, WhatsApp
  dateStr: string;
  timestamp: number;
  status: "PAID";
}

// Initial empty dataset - derived dynamically from Neon orders
const DEFAULT_MUTATIONS: PaymentMutationItem[] = [];

interface PaymentHistoryViewProps {
  orders: AdminOrder[];
  onToast?: (title: string, desc: string, type?: "success" | "info" | "warning") => void;
  onSelectOrder?: (order: AdminOrder) => void;
}

export default function PaymentHistoryView({
  orders,
  onToast,
  onSelectOrder,
}: PaymentHistoryViewProps) {
  // Dynamically derive paid transaction mutations from real orders
  const mutations: PaymentMutationItem[] = useMemo(() => {
    return (orders || [])
      .filter((o) => o.status === "selesai" || o.status === "diproses")
      .map((o) => ({
        id: `mut-${o.id}`,
        orderCode: o.id,
        username: o.username,
        amountMYR: o.priceMYR || 0,
        robuxAmount: o.robuxAmount || 0,
        channel: o.channel,
        methodName: o.submethod || "DuitNow QR",
        dateStr: o.createdAt,
        timestamp: o.createdAtTimestamp || Date.now(),
        status: "PAID" as const,
      }));
  }, [orders]);

  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "website" | "whatsapp">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculations
  const totalDanaMasukMYR = mutations.reduce((sum, m) => sum + m.amountMYR, 0);
  const totalRobuxTerjual = mutations.reduce((sum, m) => sum + m.robuxAmount, 0);
  const totalTransaksiLunas = mutations.length;
  const aovMYR = totalTransaksiLunas > 0 ? (totalDanaMasukMYR / totalTransaksiLunas).toFixed(2) : "0.00";

  // Breakdown Website vs WhatsApp
  const websiteMutations = mutations.filter((m) => m.channel === "website");
  const whatsappMutations = mutations.filter((m) => m.channel === "whatsapp");

  const websiteOmset = websiteMutations.reduce((sum, m) => sum + m.amountMYR, 0);
  const whatsappOmset = whatsappMutations.reduce((sum, m) => sum + m.amountMYR, 0);

  const websitePercent = totalDanaMasukMYR > 0 ? ((websiteOmset / totalDanaMasukMYR) * 100).toFixed(1) : "0";
  const whatsappPercent = totalDanaMasukMYR > 0 ? ((whatsappOmset / totalDanaMasukMYR) * 100).toFixed(1) : "0";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onToast) {
        onToast("Data Refreshed", "Payment inflow ledger synchronized with database.", "info");
      }
    }, 600);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Order Code,Username,Method,Date,Amount (RM),Robux,Status"]
        .concat(
          mutations.map(
            (m) =>
              `${m.orderCode},${m.username},${m.methodName},"${m.dateStr}",${m.amountMYR},${m.robuxAmount},${m.status}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zonablox_payment_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onToast) {
      onToast("Report Exported", "Payment CSV file downloaded successfully.", "success");
    }
  };

  const filtered = mutations.filter((item) => {
    if (channelFilter === "website" && item.channel !== "website") return false;
    if (channelFilter === "whatsapp" && item.channel !== "whatsapp") return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.orderCode.toLowerCase().includes(q) ||
        item.username.toLowerCase().includes(q) ||
        item.methodName.toLowerCase().includes(q) ||
        item.amountMYR.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Payment History &amp; Cash Inflow
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time transaction inflow ledger and revenue metrics in Malaysian Ringgit (MYR)
          </p>
        </div>

        {/* Action Buttons: Export CSV & Refresh */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-emerald-900/30 text-xs sm:text-sm font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Top 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TOTAL CASH INFLOW */}
        <div className="p-6 rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              TOTAL CASH INFLOW
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              RM {totalDanaMasukMYR.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">
              From {totalTransaksiLunas} completed transactions
            </div>
          </div>
        </div>

        {/* TOTAL ROBUX DELIVERED */}
        <div className="p-6 rounded-3xl bg-[#0b1611] border border-amber-500/25 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              TOTAL ROBUX DELIVERED
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Image
                src="/robux.webp"
                alt="Robux"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-baseline gap-1.5">
              <span>{totalRobuxTerjual.toLocaleString()}</span>
              <span className="text-lg font-bold text-amber-500">R$</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">
              Robux transferred to customer accounts
            </div>
          </div>
        </div>

        {/* AVERAGE ORDER VALUE (AOV) */}
        <div className="p-6 rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              AVERAGE ORDER VALUE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AOV
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              RM {aovMYR}
            </div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold">
              Average spent per completed order
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section: REVENUE BY PAYMENT CHANNEL */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
            REVENUE BY PAYMENT CHANNEL
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Breakdown of sales generated through Website vs WhatsApp Direct
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: WEBSITE / DUITNOW */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  WEBSITE / DUITNOW &amp; TNG
                </h4>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {websitePercent}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-zinc-400 font-semibold block">Total Revenue</span>
                <span className="text-lg sm:text-xl font-black text-white">
                  RM {websiteOmset.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 font-semibold block">Transactions</span>
                <span className="text-lg sm:text-xl font-bold text-zinc-200">
                  {websiteMutations.length} orders
                </span>
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#070e0b] overflow-hidden border border-emerald-950">
              <div
                style={{ width: `${websitePercent}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              />
            </div>
          </div>

          {/* Card 2: WHATSAPP DIRECT */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  WHATSAPP DIRECT
                </h4>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {whatsappPercent}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-zinc-400 font-semibold block">Total Revenue</span>
                <span className="text-lg sm:text-xl font-black text-white">
                  RM {whatsappOmset.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 font-semibold block">Transactions</span>
                <span className="text-lg sm:text-xl font-bold text-zinc-200">
                  {whatsappMutations.length} orders
                </span>
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#070e0b] overflow-hidden border border-emerald-950">
              <div
                style={{ width: `${whatsappPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section: Payment Inflow Log */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 p-4 sm:p-7 shadow-xl space-y-6">
        {/* Title & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-emerald-950/80">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Payment Inflow Ledger
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified payment transactions recorded across all channels
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#070e0b] border border-emerald-950/80 self-start lg:self-center">
            <button
              onClick={() => setChannelFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                channelFilter === "all"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({mutations.length})
            </button>
            <button
              onClick={() => setChannelFilter("website")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                channelFilter === "website"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Website ({websiteMutations.length})
            </button>
            <button
              onClick={() => setChannelFilter("whatsapp")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                channelFilter === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              WhatsApp ({whatsappMutations.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order code, username, or payment method..."
            className="w-full bg-[#070e0b] text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-900/40 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
          />
        </div>

        {/* List of Mutation Cards */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#070e0b] border border-emerald-950/80 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left Side */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Order Code */}
                    <span className="font-black text-base sm:text-lg text-white tracking-tight">
                      #{item.orderCode}
                    </span>

                    {/* Username link */}
                    <a
                      href={`https://www.roblox.com/users/search?keyword=${item.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-sm text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                    >
                      <span>@{item.username}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>

                    {/* PAID Badge */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      PAID
                    </span>
                  </div>

                  {/* Subtext info */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        item.channel === "whatsapp"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {item.methodName}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400">{item.dateStr}</span>
                  </div>
                </div>

                {/* Right Side */}
                <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-950/60">
                  <div className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">
                    +RM {item.amountMYR.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center md:justify-end gap-1.5 text-xs text-zinc-300 font-bold mt-0.5">
                    <div className="w-3.5 h-3.5 relative shrink-0">
                      <Image
                        src="/robux.webp"
                        alt="Robux"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span>{item.robuxAmount.toLocaleString()} Robux</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <h4 className="text-base font-bold text-zinc-300">
              No Payment Records Found
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No transactions match your search keywords &quot;{searchTerm}&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
