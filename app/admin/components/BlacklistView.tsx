"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  Unlock,
  AlertTriangle,
  UserX,
  ExternalLink,
} from "lucide-react";

export interface BlacklistItem {
  id: string; // unique id
  username: string;
  whatsapp: string;
  robloxUserId: string;
  reason: string;
  totalOrders: number;
  totalSpentMYR: number;
  blockedAt: string;
}

// Initial empty dataset - loaded dynamically from Neon database
const DEFAULT_BLACKLIST: BlacklistItem[] = [];

interface BlacklistViewProps {
  onToast?: (title: string, desc: string, type?: "success" | "info" | "warning") => void;
  externalPrefill?: { username: string; whatsapp?: string; robloxUserId?: string } | null;
  onClearPrefill?: () => void;
}

export default function BlacklistView({
  onToast,
  externalPrefill,
  onClearPrefill,
}: BlacklistViewProps) {
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>(DEFAULT_BLACKLIST);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formUsername, setFormUsername] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formRobloxId, setFormRobloxId] = useState("");
  const [formReason, setFormReason] = useState("Indication of fraud or payment abuse");
  const [formError, setFormError] = useState("");

  // Fetch from Neon API on mount with localStorage cache fallback
  useEffect(() => {
    async function loadBlacklist() {
      try {
        const res = await fetch("/api/blacklists");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: BlacklistItem[] = json.data.map((b: any) => ({
            id: String(b.id),
            username: b.roblox_username,
            whatsapp: b.phone || "-",
            robloxUserId: b.roblox_user_id || "Not recorded",
            reason: b.reason || "Indication of fraud or payment abuse",
            totalOrders: Number(b.total_orders || 0),
            totalSpentMYR: Number(b.total_spent || 0),
            blockedAt: b.created_at
              ? new Date(b.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recent",
          }));
          setBlacklist(mapped);
          return;
        }
      } catch {
        // network or server offline
      }

      try {
        const saved = localStorage.getItem("zonablox_blacklist");
        if (saved) {
          setBlacklist(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }

    loadBlacklist();
  }, []);

  // Prefill check
  useEffect(() => {
    if (externalPrefill) {
      setFormUsername(externalPrefill.username);
      setFormWhatsapp(externalPrefill.whatsapp || "");
      setFormRobloxId(externalPrefill.robloxUserId || "");
      setFormReason("Indication of fraud or payment abuse");
      setFormError("");
      setModalOpen(true);
      if (onClearPrefill) onClearPrefill();
    }
  }, [externalPrefill, onClearPrefill]);

  const saveBlacklist = (items: BlacklistItem[]) => {
    setBlacklist(items);
    try {
      localStorage.setItem("zonablox_blacklist", JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleOpenAddModal = () => {
    setFormUsername("");
    setFormWhatsapp("");
    setFormRobloxId("");
    setFormReason("Indication of fraud or payment abuse");
    setFormError("");
    setModalOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onToast) {
        onToast("Data Refreshed", "Blacklist registry synchronized.", "info");
      }
    }, 600);
  };

  // Submit Modal to Block Account
  const handleSubmitBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = formUsername.trim().replace(/^@/, "");

    if (!cleanUser) {
      setFormError("Roblox username is required.");
      return;
    }

    const tempId = `bl-${Date.now()}`;
    const newItem: BlacklistItem = {
      id: tempId,
      username: cleanUser,
      whatsapp: formWhatsapp.trim() || "-",
      robloxUserId: formRobloxId.trim() || "Not recorded",
      reason: formReason.trim() || "Indication of fraud or payment abuse",
      totalOrders: 0,
      totalSpentMYR: 0,
      blockedAt: "Today",
    };

    const updated = [newItem, ...blacklist];
    saveBlacklist(updated);
    setModalOpen(false);

    // Save to Neon DB
    fetch("/api/blacklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roblox_username: cleanUser,
        phone: formWhatsapp.trim() || null,
        roblox_user_id: formRobloxId.trim() || null,
        reason: formReason.trim() || "Indication of fraud or payment abuse",
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (json.success && json.data) {
          setBlacklist((prev) =>
            prev.map((b) => (b.id === tempId ? { ...b, id: String(json.data.id) } : b))
          );
        }
      })
      .catch(() => {});

    if (onToast) {
      onToast(
        "Account Blocked!",
        `@${newItem.username} was added to the blacklist and banned from checking out.`,
        "warning"
      );
    }
  };

  // Unblock account
  const handleUnblock = (id: string) => {
    const target = blacklist.find((b) => b.id === id);
    const updated = blacklist.filter((b) => b.id !== id);
    saveBlacklist(updated);

    // Delete in Neon DB
    fetch(`/api/blacklists/${id}`, {
      method: "DELETE",
    }).catch(() => {});

    if (onToast && target) {
      onToast(
        "Account Unblocked",
        `@${target.username} was removed from the blacklist and can order again.`,
        "success"
      );
    }
  };

  const filtered = blacklist.filter(
    (b) =>
      b.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.whatsapp.includes(searchTerm) ||
      b.robloxUserId.includes(searchTerm) ||
      b.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Blacklist &amp; Fraud Prevention
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Accounts blocked from ordering due to fraudulent activity or policy abuse
          </p>
        </div>

        {/* Top Right Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Blacklist</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Main Blacklist Container Card */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 p-4 sm:p-7 shadow-xl space-y-6">
        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-950/80">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blacklisted accounts, WhatsApp, or reason..."
              className="w-full bg-[#070e0b] text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-900/40 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition shadow-inner"
            />
          </div>

          <div className="text-xs font-bold text-zinc-400 shrink-0">
            Showing <span className="text-rose-400">{filtered.length}</span> blacklisted accounts
          </div>
        </div>

        {/* List of Blacklisted Account Cards */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#070e0b] border border-rose-950/60 hover:border-rose-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left Side */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-black text-base sm:text-lg text-rose-500 tracking-tight">
                      @{item.username}
                    </span>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      BLACKLISTED
                    </span>
                  </div>

                  {/* Subtext info */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium">
                    <span>
                      ID: <span className="text-zinc-300 italic">{item.robloxUserId}</span>
                    </span>

                    <span>•</span>

                    <span>
                      WA: <span className="text-zinc-300 font-semibold">{item.whatsapp}</span>
                    </span>

                    <span>•</span>

                    <span className="text-rose-400/90 font-medium">
                      Reason: {item.reason}
                    </span>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-950/60">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-bold text-white">
                      {item.totalOrders} Orders
                    </div>
                    <div className="text-xs font-extrabold text-rose-400">
                      Total: RM {item.totalSpentMYR.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Unblock Button */}
                  <button
                    onClick={() => handleUnblock(item.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow-sm"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unblock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-200">
              No Accounts Blacklisted
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Currently no buyer accounts are restricted from ordering.
            </p>
          </div>
        )}
      </div>

      {/* 3. MODAL POPUP: Add Account to Blacklist */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0c1712] border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Add Account to Blacklist
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmitBlacklist} className="space-y-4">
              {/* Field 1: Username Roblox */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Roblox Username
                </label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g. bad_player_99"
                  className="w-full bg-[#070e0b] text-sm font-medium text-white placeholder-zinc-500 px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition shadow-inner"
                />
              </div>

              {/* Field 2: WhatsApp Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">
                  WhatsApp Phone (Optional)
                </label>
                <input
                  type="text"
                  value={formWhatsapp}
                  onChange={(e) => setFormWhatsapp(e.target.value)}
                  placeholder="e.g. +60123456789"
                  className="w-full bg-[#070e0b] text-sm font-medium text-white placeholder-zinc-500 px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition shadow-inner"
                />
                <p className="text-[11px] text-zinc-500 leading-tight pt-0.5">
                  This phone number will also be immediately rejected during checkout.
                </p>
              </div>

              {/* Field 3: Roblox ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Roblox User ID (Optional)
                </label>
                <input
                  type="text"
                  value={formRobloxId}
                  onChange={(e) => setFormRobloxId(e.target.value)}
                  placeholder="e.g. 1350738735 (if available)"
                  className="w-full bg-[#070e0b] text-sm font-medium text-white placeholder-zinc-500 px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition shadow-inner"
                />
              </div>

              {/* Field 4: Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Reason for Blacklist
                </label>
                <input
                  type="text"
                  required
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Indication of fraud or fake transfer proof"
                  className="w-full bg-[#070e0b] text-sm font-medium text-white placeholder-zinc-500 px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition shadow-inner"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs transition shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                >
                  Block Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
