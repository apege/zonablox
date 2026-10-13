"use client";

import Image from "next/image";
import {
  TrendingUp,
  Inbox,
  Clock,
  CheckCircle2,
  CreditCard,
  Zap,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Coins,
} from "lucide-react";
import { AdminOrder, formatCurrency } from "@/app/data/adminOrdersData";
import { AdminTab } from "./AdminSidebar";

interface DashboardViewProps {
  orders: AdminOrder[];
  currency: "MYR" | "IDR";
  onSelectTab: (tab: AdminTab) => void;
  onSelectOrder: (order: AdminOrder) => void;
  onQuickProcess: (orderId: string) => void;
}

export default function DashboardView({
  orders,
  currency,
  onSelectTab,
  onSelectOrder,
  onQuickProcess,
}: DashboardViewProps) {
  const masukCount = orders.filter((o) => o.status === "masuk").length;
  const diprosesCount = orders.filter((o) => o.status === "diproses").length;
  const selesaiCount = orders.filter((o) => o.status === "selesai").length;
  const dibatalkanCount = orders.filter((o) => o.status === "dibatalkan").length;
  const totalOrders = orders.length;

  // Calculate total revenue from non-cancelled orders
  const totalOmsetMYR = orders
    .filter((o) => o.status !== "dibatalkan")
    .reduce((sum, o) => sum + o.priceMYR, 0);

  const totalOmsetIDR = orders
    .filter((o) => o.status !== "dibatalkan")
    .reduce((sum, o) => sum + o.priceIDR, 0);

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-[#0c1813] via-[#08120e] to-[#0a1510] p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span>ZonaBlox Control Center</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                Admin Panel!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 text-xs sm:text-base text-zinc-300 leading-relaxed">
              Monitor Robux top up transactions in real-time, dispatch gamepass deliveries instantly, and manage your store seamlessly.
            </p>
          </div>

          {/* Action button */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onSelectTab("orders-masuk")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6)] hover:scale-102 active:scale-98 transition-all group"
            >
              <span>Manage Orders</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* 3 Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-emerald-950/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#0e1c15]/70 border border-emerald-900/40 hover:border-emerald-500/40 transition flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs sm:text-sm font-bold">Fast Transactions</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Real-time Robux top up tracking.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1c15]/70 border border-emerald-900/40 hover:border-emerald-500/40 transition flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs sm:text-sm font-bold">Instant Delivery</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Automated and rapid order fulfillment.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1c15]/70 border border-emerald-900/40 hover:border-emerald-500/40 transition flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs sm:text-sm font-bold">Manage Packages</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Configure Robux tiers and pricing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Summary Stats Cards (2x2 on Mobile, 4 columns on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL REVENUE */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate">
              TOTAL REVENUE
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight truncate">
              {formatCurrency(
                currency === "MYR" ? totalOmsetMYR : totalOmsetIDR,
                currency
              )}
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400 font-semibold truncate">
              <span>↑ Successful transactions</span>
            </div>
          </div>
        </div>

        {/* INCOMING ORDERS */}
        <div
          onClick={() => onSelectTab("orders-masuk")}
          className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-orange-500/25 shadow-lg relative overflow-hidden group hover:border-orange-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate">
              INCOMING
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-black text-orange-400 tracking-tight">
              {masukCount}
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-orange-400 font-bold group-hover:underline truncate">
              <span>Action required</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* IN PROGRESS */}
        <div
          onClick={() => onSelectTab("orders-diproses")}
          className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-cyan-500/25 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate">
              PROCESSING
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-black text-cyan-400 tracking-tight">
              {diprosesCount}
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-cyan-400 font-bold group-hover:underline truncate">
              <span>In queue</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* COMPLETED ORDERS */}
        <div
          onClick={() => onSelectTab("orders-selesai")}
          className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate">
              COMPLETED
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight">
              {selesaiCount}
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-zinc-400 truncate">
              Out of {totalOrders} total
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-emerald-950/80">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              Recent Orders
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Latest 5 transactions received in the system
            </p>
          </div>
          <button
            onClick={() => onSelectTab("orders-masuk")}
            className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/30 text-xs font-bold transition shadow-sm"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Recent Orders */}
        <div className="divide-y divide-emerald-950/60 mt-2">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-[#0e1d16]/40 px-2 rounded-2xl transition"
            >
              {/* Order Info Left */}
              <div className="flex items-center gap-3.5">
                {/* Robux Coin Icon */}
                <div className="relative w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  <Image
                    src="/robux.webp"
                    alt="Robux"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="text-sm sm:text-base font-extrabold text-orange-400 hover:text-orange-300 tracking-tight transition"
                    >
                      #{order.id}
                    </button>
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        order.status === "masuk"
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : order.status === "diproses"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : order.status === "selesai"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
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
                  <div className="text-xs text-zinc-400 mt-0.5">
                    <span className="font-semibold text-zinc-300">@{order.username}</span>
                    <span className="mx-1.5">•</span>
                    <span>{order.robuxAmount.toLocaleString()} Robux</span>
                    <span className="mx-1.5 hidden sm:inline">•</span>
                    <span className="text-zinc-500 hidden sm:inline">{order.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Order Info Right & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-emerald-950/50">
                <div className="text-left sm:text-right">
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {formatCurrency(
                      currency === "MYR" ? order.priceMYR : order.priceIDR,
                      currency
                    )}
                  </div>
                  <div className="mt-0.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        order.channel === "whatsapp"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {order.channel}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {order.status === "masuk" && (
                    <button
                      onClick={() => onQuickProcess(order.id)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition"
                    >
                      Process
                    </button>
                  )}
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
