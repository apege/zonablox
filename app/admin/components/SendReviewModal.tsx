"use client";

import { useState, useEffect } from "react";
import { AdminOrder } from "@/app/data/adminOrdersData";
import { generateReviewToken } from "@/lib/reviewToken";
import {
  X,
  Star,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface SendReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onToast?: (title: string, desc: string, type?: "success" | "info" | "warning") => void;
}

export default function SendReviewModal({
  isOpen,
  onClose,
  order,
  onToast,
}: SendReviewModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isOpen || !order) return null;

  const token = generateReviewToken(order.id);
  const reviewUrl = `${origin || "https://zonablox.com"}/review?token=${token}`;

  const cleanPhone = (order.customerWhatsapp || "").replace(/\D/g, "");

  const fullWaMessage =
    `*ZONABLOX - ORDER COMPLETED & REVIEW* 🌟\n\n` +
    `Hello @${order.username}! Your Robux top-up order (*#${order.id}* - ${order.robuxAmount.toLocaleString()} Robux) has been successfully delivered to your Roblox account! 🎮✨\n\n` +
    `We would truly appreciate it if you could take 1 minute to leave a review and rating for our service:\n` +
    `👉 ${reviewUrl}\n\n` +
    `Thank you for trusting ZonaBlox!`;

  const waShareUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullWaMessage)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    onToast?.("Link Copied!", "Review link has been copied to your clipboard.", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(fullWaMessage);
    setCopiedMsg(true);
    onToast?.("Message Copied!", "Full WhatsApp review message copied to clipboard.", "success");
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0b1410] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-emerald-950/80 bg-[#070e0b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Send Customer Review Link</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Order <span className="text-orange-400 font-bold">#{order.id}</span> • Completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Target Customer Info */}
          <div className="p-3.5 rounded-2xl bg-[#060c09] border border-emerald-950 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">
                Customer &amp; Package
              </span>
              <span className="text-white font-bold text-sm">
                @{order.username}
              </span>
              <span className="text-emerald-400 font-semibold ml-2">
                ({order.robuxAmount.toLocaleString()} Robux)
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">
                WhatsApp
              </span>
              <span className="text-zinc-200 font-mono font-medium">
                {order.customerWhatsapp || "No phone"}
              </span>
            </div>
          </div>

          {/* Tokenized Review Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Tokenized Review URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={reviewUrl}
                className="flex-1 bg-[#060c09] text-xs font-mono text-emerald-400 px-3.5 py-2.5 rounded-xl border border-emerald-900/60 outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              The token securely validates this specific completed order and prevents duplicate submissions.
            </p>
          </div>

          {/* WhatsApp Pre-written Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Pre-Filled Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                {copiedMsg ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-[#060c09] border border-emerald-950 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-sans">
              {fullWaMessage}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#070e0b] border-t border-emerald-950/80 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <a
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm text-center shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send to Customer WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
