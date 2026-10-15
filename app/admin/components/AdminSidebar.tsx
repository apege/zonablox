"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Users,
  MessageCircle,
  ExternalLink,
  LogOut,
  X,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  CreditCard,
  Settings,
  Zap,
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "orders-masuk"
  | "orders-diproses"
  | "orders-selesai"
  | "orders-dibatalkan"
  | "order-detail"
  | "pricelist"
  | "customers"
  | "blacklist"
  | "activations"
  | "testimonials"
  | "finance"
  | "settings";

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  orderCounts: {
    masuk: number;
    diproses: number;
    selesai: number;
    dibatalkan: number;
  };
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export default function AdminSidebar({
  currentTab,
  onSelectTab,
  orderCounts,
  mobileOpen,
  onCloseMobile,
  onLogout,
}: AdminSidebarProps) {
  // Prevent background body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const isOrderTab = (tab: AdminTab) =>
    ["orders-masuk", "orders-diproses", "orders-selesai", "orders-dibatalkan"].includes(tab);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 sm:w-72 bg-[#09120e] border-r border-emerald-900/30 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header & Brand */}
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          {/* Brand Logo */}
          <div className="p-5 border-b border-emerald-950/80 flex items-center justify-between">
            <Link
              href="/admin"
              onClick={() => {
                onSelectTab("dashboard");
                onCloseMobile();
              }}
              className="flex items-center gap-3 group select-none"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(234,88,12,0.35)] border border-emerald-500/40 group-hover:border-orange-500/60 transition-all shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="ZonaBlox Admin"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight leading-none italic uppercase">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400">
                      ZONA
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                      BLOX
                    </span>
                    <span className="text-orange-500 text-sm not-italic font-bold ml-0.5">
                      .id
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400/90 font-bold tracking-wider uppercase">
                    Admin Panel
                  </span>
                </div>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 text-sm font-medium">
            {/* Dashboard Link */}
            <div>
              <button
                onClick={() => {
                  onSelectTab("dashboard");
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all text-left ${
                  currentTab === "dashboard"
                    ? "bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-transparent text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(5,150,105,0.15)]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-emerald-950/30 border border-transparent"
                }`}
              >
                <LayoutDashboard
                  className={`w-4 h-4 ${
                    currentTab === "dashboard" ? "text-emerald-400" : "text-zinc-400"
                  }`}
                />
                <span>Dashboard</span>
              </button>
            </div>

            {/* ORDER MANAGEMENT */}
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                Order Management
              </span>

              <div className="space-y-1 pt-1.5">
                {/* Incoming Orders */}
                <button
                  onClick={() => {
                    onSelectTab("orders-masuk");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "orders-masuk"
                      ? "bg-gradient-to-r from-orange-500/20 via-orange-600/15 to-transparent text-orange-300 border border-orange-500/40 shadow-[0_0_15px_rgba(234,88,12,0.15)] font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Inbox
                      className={`w-4 h-4 ${
                        currentTab === "orders-masuk" ? "text-orange-400" : "text-zinc-400"
                      }`}
                    />
                    <span>Incoming Orders</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      currentTab === "orders-masuk"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    }`}
                  >
                    {orderCounts.masuk}
                  </span>
                </button>

                {/* Processing */}
                <button
                  onClick={() => {
                    onSelectTab("orders-diproses");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "orders-diproses"
                      ? "bg-gradient-to-r from-cyan-500/20 via-cyan-600/15 to-transparent text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock
                      className={`w-4 h-4 ${
                        currentTab === "orders-diproses" ? "text-cyan-400" : "text-zinc-400"
                      }`}
                    />
                    <span>Processing</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      currentTab === "orders-diproses"
                        ? "bg-cyan-500 text-white"
                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    }`}
                  >
                    {orderCounts.diproses}
                  </span>
                </button>

                {/* Completed */}
                <button
                  onClick={() => {
                    onSelectTab("orders-selesai");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "orders-selesai"
                      ? "bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-transparent text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(5,150,105,0.15)] font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        currentTab === "orders-selesai" ? "text-emerald-400" : "text-zinc-400"
                      }`}
                    />
                    <span>Completed</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {orderCounts.selesai}
                  </span>
                </button>

                {/* Cancelled */}
                <button
                  onClick={() => {
                    onSelectTab("orders-dibatalkan");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "orders-dibatalkan"
                      ? "bg-gradient-to-r from-rose-500/20 via-rose-600/15 to-transparent text-rose-300 border border-rose-500/40 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <XCircle
                      className={`w-4 h-4 ${
                        currentTab === "orders-dibatalkan" ? "text-rose-400" : "text-zinc-400"
                      }`}
                    />
                    <span>Cancelled</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-zinc-800 text-zinc-400">
                    {orderCounts.dibatalkan}
                  </span>
                </button>
              </div>
            </div>

            {/* PRICELIST */}
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                Pricelist
              </span>
              <div className="pt-1.5">
                <button
                  onClick={() => {
                    onSelectTab("pricelist");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "pricelist"
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-transparent text-amber-300 border border-amber-500/40 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <Tag
                    className={`w-4 h-4 ${
                      currentTab === "pricelist" ? "text-amber-400" : "text-zinc-400"
                    }`}
                  />
                  <span>Robux Pricelist</span>
                </button>
              </div>
            </div>

            {/* CUSTOMERS */}
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                Customers
              </span>
              <div className="pt-1.5">
                <button
                  onClick={() => {
                    onSelectTab("customers");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "customers"
                      ? "bg-gradient-to-r from-teal-500/20 via-teal-600/15 to-transparent text-teal-300 border border-teal-500/40 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <Users
                    className={`w-4 h-4 ${
                      currentTab === "customers" ? "text-teal-400" : "text-zinc-400"
                    }`}
                  />
                  <span>Customer Directory</span>
                </button>

                {/* Blacklist */}
                <button
                  onClick={() => {
                    onSelectTab("blacklist");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "blacklist"
                      ? "bg-gradient-to-r from-rose-500/20 via-rose-600/15 to-transparent text-rose-300 border border-rose-500/40 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <ShieldAlert
                    className={`w-4 h-4 ${
                      currentTab === "blacklist" ? "text-rose-400" : "text-zinc-400"
                    }`}
                  />
                  <span>Blacklist &amp; Fraud</span>
                </button>

                {/* ID Roblox Activation */}
                <button
                  onClick={() => {
                    onSelectTab("activations");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "activations"
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-transparent text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap
                      className={`w-4 h-4 ${
                        currentTab === "activations" ? "text-amber-400 fill-amber-400" : "text-zinc-400"
                      }`}
                    />
                    <span>Aktivasi ID Roblox</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Sistem
                  </span>
                </button>
              </div>
            </div>

            {/* CONTENT & REVIEWS */}
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                Content &amp; Reviews
              </span>
              <div className="pt-1.5">
                <button
                  onClick={() => {
                    onSelectTab("testimonials");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "testimonials"
                      ? "bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-transparent text-amber-300 border border-amber-500/40 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 ${
                      currentTab === "testimonials" ? "text-amber-400" : "text-zinc-400"
                    }`}
                  />
                  <span>Manage Reviews</span>
                </button>
              </div>
            </div>

            {/* FINANCE */}
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                Finance &amp; Ledger
              </span>
              <div className="pt-1.5">
                <button
                  onClick={() => {
                    onSelectTab("finance");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "finance"
                      ? "bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-transparent text-emerald-300 border border-emerald-500/40 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <CreditCard
                    className={`w-4 h-4 ${
                      currentTab === "finance" ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  />
                  <span>Payment History</span>
                </button>
              </div>
            </div>

            {/* SETTINGS */}
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                Settings
              </span>
              <div className="pt-1.5">
                <button
                  onClick={() => {
                    onSelectTab("settings");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                    currentTab === "settings"
                      ? "bg-gradient-to-r from-orange-500/20 via-orange-600/15 to-transparent text-orange-300 border border-orange-500/40 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-emerald-950/30 border border-transparent font-medium"
                  }`}
                >
                  <Settings
                    className={`w-4 h-4 ${
                      currentTab === "settings" ? "text-orange-400" : "text-zinc-400"
                    }`}
                  />
                  <span>Store Settings</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Support Card & Links */}
        <div className="p-4 border-t border-emerald-950/80 space-y-3 bg-[#070e0b]/90">
          {/* Help Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#0e1d16] to-[#0a1510] border border-emerald-500/25 shadow-md">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Need Help?</span>
            </h5>
            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
              ZonaBlox support team is available 24/7!
            </p>
            <a
              href="https://wa.me/?text=Hello%20ZonaBlox%20Admin%2C%20I%20need%20assistance%20in%20the%20Admin%20Panel"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-emerald-600/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contact Support</span>
            </a>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-emerald-400 transition"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-rose-400/90 hover:text-rose-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
