"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ShieldCheck,
  Sparkles,
  Eye,
  Save,
  Star,
} from "lucide-react";
import { AdminOrder, formatCurrency } from "@/app/data/adminOrdersData";

interface OrderDetailViewProps {
  order: AdminOrder;
  currency: "MYR" | "IDR";
  onBack: () => void;
  onUpdateStatus: (orderId: string, newStatus: AdminOrder["status"]) => void;
  onSaveAdminNotes: (orderId: string, notes: string) => void;
  onOpenReceipt: (imageUrl: string, orderId: string) => void;
  onOpenReviewModal?: (order: AdminOrder) => void;
}

export default function OrderDetailView({
  order,
  currency,
  onBack,
  onUpdateStatus,
  onSaveAdminNotes,
  onOpenReceipt,
  onOpenReviewModal,
}: OrderDetailViewProps) {
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || "");
  const [isSaved, setIsSaved] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNotes = () => {
    onSaveAdminNotes(order.id, adminNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // WhatsApp chat generator with pre-filled English message
  const generateWhatsAppLink = () => {
    const rawNumber = order.customerWhatsapp.replace(/[^0-9]/g, "");
    const statusText =
      order.status === "masuk"
        ? "Pending Payment"
        : order.status === "diproses"
        ? "Currently Being Processed"
        : order.status === "selesai"
        ? "Successfully Delivered"
        : "Cancelled";

    const message = encodeURIComponent(
      `Hello @${order.username}, this is ZonaBlox.id Admin regarding your Robux order #${order.id} (${order.robuxAmount.toLocaleString()} Robux).\n\nCurrent status: ${statusText}.\n\nDo you need any assistance regarding your Roblox account or gamepass? Thank you!`
    );
    return `https://wa.me/${rawNumber}?text=${message}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* 1. Top Navigation & Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-400 hover:text-emerald-400 transition mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Orders List</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                ORDER <span className="text-orange-400">#{order.id}</span>
              </h1>
              {/* Status Badge */}
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
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
                  ? "Pending Payment"
                  : order.status === "diproses"
                  ? "Processing"
                  : order.status === "selesai"
                  ? "Completed"
                  : "Cancelled"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Created on {order.createdAt}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1611] border border-emerald-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          QUICK STATUS UPDATE:
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Process Order Button */}
          <button
            onClick={() => onUpdateStatus(order.id, "diproses")}
            className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              order.status === "diproses"
                ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Process</span>
          </button>

          {/* Complete Order Button */}
          <button
            onClick={() => onUpdateStatus(order.id, "selesai")}
            className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              order.status === "selesai"
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete</span>
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => onUpdateStatus(order.id, "dibatalkan")}
            className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              order.status === "dibatalkan"
                ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                : "bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/50"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          {/* Chat Customer Button */}
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(5,150,105,0.3)]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat Buyer</span>
          </a>

          {/* Send Review Button for Completed Orders */}
          {order.status === "selesai" && (
            <button
              type="button"
              onClick={() => onOpenReviewModal?.(order)}
              className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Send Review</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Content: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: ORDER DETAILS & TIMELINE */}
        <div className="space-y-6">
          {/* Card: ORDER DETAILS */}
          <div className="p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2.5 pb-3.5 sm:pb-4 border-b border-emerald-950/80">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                ORDER DETAILS
              </h3>
            </div>

            {/* Product Table Header */}
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
              <span>PRODUCT</span>
              <span>PRICE</span>
            </div>

            {/* Product Row */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070e0b] border border-emerald-950/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Image
                    src="/robux.webp"
                    alt="Robux"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-white truncate">
                    {order.robuxAmount.toLocaleString()} Robux
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    Account: @{order.username}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-black text-white">
                  {formatCurrency(
                    currency === "MYR" ? order.priceMYR : order.priceIDR,
                    currency
                  )}
                </span>
              </div>
            </div>

            {/* Payment Method Row (Responsive stacking on mobile) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-2.5 border-b border-emerald-950/80 px-1 text-xs">
              <span className="text-zinc-400 font-medium shrink-0">Payment Method</span>
              <span
                className={`inline-flex items-center self-start sm:self-auto px-2.5 py-1.5 rounded-xl text-xs font-bold ${
                  order.channel === "whatsapp"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                }`}
              >
                <span className="uppercase font-black">{order.channel}</span>
                <span className="opacity-90 ml-1.5 font-semibold text-[11px]">({order.submethod})</span>
              </span>
            </div>

            {/* TOTAL AMOUNT */}
            <div className="flex items-center justify-between py-3 px-1 border-b border-emerald-950/80">
              <span className="text-white uppercase tracking-tight text-sm sm:text-base font-extrabold">TOTAL AMOUNT</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 font-extrabold text-xl">
                {formatCurrency(
                  currency === "MYR" ? order.priceMYR : order.priceIDR,
                  currency
                )}
              </span>
            </div>

            {/* Proof Callout / Image Preview */}
            <div>
              {order.receiptImage ? (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070e0b] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 min-w-0">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="truncate">Payment Receipt</span>
                    </div>
                    <button
                      onClick={() => onOpenReceipt(order.receiptImage!, order.id)}
                      className="shrink-0 whitespace-nowrap text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Fullscreen</span>
                    </button>
                  </div>
                  <div
                    onClick={() => onOpenReceipt(order.receiptImage!, order.id)}
                    className="relative w-full min-h-[220px] max-h-[320px] rounded-xl overflow-hidden cursor-pointer group border border-emerald-950 bg-black/60 flex items-center justify-center p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.receiptImage}
                      alt="Payment Receipt"
                      className="max-h-[300px] w-auto h-auto object-contain rounded-lg group-hover:scale-102 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs font-bold text-white backdrop-blur-[2px]">
                      Click to view full receipt
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#070e0b]/80 border border-emerald-950/80 text-center text-xs text-zinc-400 leading-relaxed">
                  No payment receipt uploaded or cleaned up by automatic retention policy.
                </div>
              )}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="p-5 rounded-3xl bg-[#0b1611] border border-emerald-500/20 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Order Timeline &amp; Event Log</span>
            </h4>
            <div className="space-y-3 pl-2 border-l-2 border-emerald-900/60 ml-2">
              {order.timeline?.map((item, idx) => (
                <div key={idx} className="relative pl-4 text-xs space-y-0.5">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0b1611]" />
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-[10px] text-zinc-400">{item.time}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">{item.desc}</p>
                </div>
              )) || (
                <div className="text-xs text-zinc-400">
                  Order logged on {order.createdAt}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER INFORMATION & ADMIN NOTES */}
        <div className="space-y-6">
          {/* Card: CUSTOMER INFORMATION */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-emerald-950/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                CUSTOMER INFORMATION
              </h3>
            </div>

            <div className="space-y-4 divide-y divide-emerald-950/60 text-xs sm:text-sm">
              {/* Username */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400 font-medium">Username</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.roblox.com/users/search?keyword=${order.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
                  >
                    <span>@{order.username}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopy(order.username, "username")}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                    title="Copy Username"
                  >
                    {copiedField === "username" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Roblox User ID */}
              <div className="flex items-center justify-between pt-3">
                <span className="text-zinc-400 font-medium">Roblox User ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-wide">
                    {order.robloxUserId}
                  </span>
                  <button
                    onClick={() => handleCopy(order.robloxUserId, "userId")}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                    title="Copy Roblox ID"
                  >
                    {copiedField === "userId" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* WhatsApp Phone */}
              <div className="flex items-center justify-between pt-3">
                <span className="text-zinc-400 font-medium">WhatsApp Phone</span>
                <div className="flex items-center gap-2">
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-400" />
                    <span>{order.customerWhatsapp}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(order.customerWhatsapp, "whatsapp")}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                    title="Copy WhatsApp Number"
                  >
                    {copiedField === "whatsapp" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="flex flex-col gap-1 pt-3">
                <span className="text-zinc-400 font-medium">Customer Notes</span>
                <div className="p-3 rounded-xl bg-[#070e0b] border border-emerald-950/80 text-zinc-200 text-xs">
                  {order.customerNotes || "No additional instructions provided by buyer."}
                </div>
              </div>
            </div>
          </div>

          {/* Card: ADMIN NOTES */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  ADMIN NOTES
                </h3>
              </div>

              {isSaved && (
                <span className="text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Notes saved successfully!</span>
                </span>
              )}
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Write internal notes for this order (admin only)..."
                rows={4}
                className="w-full bg-[#070e0b] border border-emerald-900/40 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition resize-none"
              />
            </div>

            {/* Save Notes Button */}
            <div>
              <button
                onClick={handleSaveNotes}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm transition shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Admin Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
