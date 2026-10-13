"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Crown,
  Zap,
  Flame,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Tag,
} from "lucide-react";

export interface RobuxPricelistItem {
  id: string;
  amount: number;
  priceMYR: number;
  priceIDR?: number;
  badge?: string;
  popular?: boolean;
  promo?: boolean;
  vip?: boolean;
  stock: "in_stock" | "out_of_stock";
}

// Initial empty dataset - loaded dynamically from Neon database
const DEFAULT_PRICELIST: RobuxPricelistItem[] = [];

interface PricelistViewProps {
  currency?: "MYR" | "IDR";
  onToast?: (title: string, desc: string, type?: "success" | "info" | "warning") => void;
}

export default function PricelistView({ onToast }: PricelistViewProps) {
  const [packages, setPackages] = useState<RobuxPricelistItem[]>(DEFAULT_PRICELIST);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "promo" | "inactive">("all");

  // Modal State for Add & Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields (No manual badge field - labels are 100% automatic)
  const [formAmount, setFormAmount] = useState<string>("");
  const [formPriceMYR, setFormPriceMYR] = useState<string>("");
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>("");

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refreshProducts = async () => {
    try {
      const res = await fetch("/api/products?active_only=false");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: RobuxPricelistItem[] = json.data.map((p: any) => ({
          id: String(p.id),
          amount: Number(p.robux),
          priceMYR: Number(p.price),
          badge: p.badge || undefined,
          popular: Boolean(p.popular),
          promo: Boolean(p.promo),
          vip: Boolean(p.vip),
          stock: (p.stock || "in_stock") as "in_stock" | "out_of_stock",
        }));
        setPackages(mapped);
        return mapped;
      }
    } catch {
      // network or server offline
    }
    return null;
  };

  // Fetch from Neon API on mount with localStorage cache fallback
  useEffect(() => {
    async function loadProducts() {
      const data = await refreshProducts();
      if (!data) {
        try {
          const saved = localStorage.getItem("zonablox_pricelist");
          if (saved) {
            setPackages(JSON.parse(saved));
          }
        } catch {
          // ignore
        }
      }
    }

    loadProducts();
  }, []);

  const savePackages = (items: RobuxPricelistItem[]) => {
    setPackages(items);
    try {
      localStorage.setItem("zonablox_pricelist", JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  // Open Modal to Add
  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditId(null);
    setFormAmount("");
    setFormPriceMYR("");
    setFormActive(true);
    setFormError("");
    setModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEditModal = (pkg: RobuxPricelistItem) => {
    setModalMode("edit");
    setEditId(pkg.id);
    setFormAmount(pkg.amount.toString());
    setFormPriceMYR(pkg.priceMYR.toString());
    setFormActive(pkg.stock === "in_stock");
    setFormError("");
    setModalOpen(true);
  };

  // Toggle Stock Active/Inactive
  const handleToggleActive = (id: string) => {
    const updated = packages.map((pkg) => {
      if (pkg.id === id) {
        const nextStock: RobuxPricelistItem["stock"] =
          pkg.stock === "in_stock" ? "out_of_stock" : "in_stock";
        return { ...pkg, stock: nextStock };
      }
      return pkg;
    });

    savePackages(updated);
    const target = updated.find((p) => p.id === id);
    if (target) {
      const numericId = id.replace("pkg-", "");
      fetch(`/api/products/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: target.stock === "in_stock" }),
      })
        .then(() => refreshProducts())
        .catch(() => {});
    }

    if (onToast && target) {
      onToast(
        target.stock === "in_stock" ? "Package Activated" : "Package Deactivated",
        `${target.amount.toLocaleString()} Robux is now ${
          target.stock === "in_stock" ? "live in store" : "hidden from storefront"
        }.`,
        target.stock === "in_stock" ? "success" : "info"
      );
    }
  };

  // Submit Modal (Add or Edit)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(formAmount.replace(/[^0-9]/g, ""));
    const priceNum = Number(formPriceMYR.replace(/[^0-9.]/g, ""));

    if (!amountNum || amountNum <= 0) {
      setFormError("Robux amount must be greater than 0.");
      return;
    }
    if (!priceNum || priceNum <= 0) {
      setFormError("Selling price must be greater than RM 0.");
      return;
    }

    if (modalMode === "add") {
      const tempId = `pkg-${amountNum}-${Date.now()}`;
      const newItem: RobuxPricelistItem = {
        id: tempId,
        amount: amountNum,
        priceMYR: priceNum,
        priceIDR: Math.round(priceNum * 4500),
        vip: amountNum > 10000,
        badge: amountNum > 10000 ? "VIP" : undefined,
        stock: formActive ? "in_stock" : "out_of_stock",
      };

      const updated = [newItem, ...packages];
      savePackages(updated);

      // Persist to Neon DB
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${amountNum.toLocaleString()} Robux`,
          robux: amountNum,
          price: priceNum,
          is_active: formActive,
        }),
      })
        .then(async (res) => {
          const json = await res.json();
          if (json.success) {
            refreshProducts();
          }
        })
        .catch(() => {});

      if (onToast) {
        onToast(
          "Package Added!",
          `${newItem.amount.toLocaleString()} Robux package was saved to store catalog.`
        );
      }
    } else if (modalMode === "edit" && editId) {
      const updated = packages.map((pkg) => {
        if (pkg.id === editId) {
          return {
            ...pkg,
            amount: amountNum,
            priceMYR: priceNum,
            priceIDR: Math.round(priceNum * 4500),
            vip: amountNum > 10000,
            stock: (formActive ? "in_stock" : "out_of_stock") as RobuxPricelistItem["stock"],
          };
        }
        return pkg;
      });

      savePackages(updated);

      // Persist to Neon DB
      const numericId = editId.replace("pkg-", "");
      fetch(`/api/products/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${amountNum.toLocaleString()} Robux`,
          robux: amountNum,
          price: priceNum,
          is_active: formActive,
        }),
      })
        .then(() => refreshProducts())
        .catch(() => {});

      if (onToast) {
        onToast(
          "Changes Saved",
          `${amountNum.toLocaleString()} Robux package successfully updated.`
        );
      }
    }

    setModalOpen(false);
  };

  // Delete Package
  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const target = packages.find((p) => p.id === deleteId);
    const updated = packages.filter((pkg) => pkg.id !== deleteId);
    savePackages(updated);

    // Delete in Neon DB
    const numericId = deleteId.replace("pkg-", "");
    fetch(`/api/products/${numericId}`, {
      method: "DELETE",
    }).catch(() => {});

    setDeleteId(null);
    if (onToast && target) {
      onToast(
        "Package Deleted",
        `${target.amount.toLocaleString()} Robux package was removed from catalog.`,
        "warning"
      );
    }
  };

  // Refresh Pricelist from Database
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/products?active_only=false&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: RobuxPricelistItem[] = json.data.map((p: any) => ({
          id: String(p.id),
          amount: Number(p.robux),
          priceMYR: Number(p.price),
          badge: p.badge || undefined,
          popular: Boolean(p.popular),
          promo: Boolean(p.promo),
          vip: Boolean(p.vip),
          stock: (p.stock || "in_stock") as "in_stock" | "out_of_stock",
        }));
        setPackages(mapped);
        localStorage.setItem("zonablox_pricelist", JSON.stringify(mapped));
        if (onToast) {
          onToast(
            "Pricelist Refreshed",
            "Robux package catalog successfully reloaded from database.",
            "success"
          );
        }
      }
    } catch {
      if (onToast) {
        onToast(
          "Refresh Failed",
          "Could not synchronize catalog with server.",
          "warning"
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    if (filterTab === "active" && pkg.stock !== "in_stock") return false;
    if (filterTab === "inactive" && pkg.stock !== "out_of_stock") return false;
    if (filterTab === "promo" && !pkg.badge && !pkg.vip && !pkg.popular) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchAmount = pkg.amount.toString().includes(q);
      const matchPrice = pkg.priceMYR.toString().includes(q);
      const matchBadge = pkg.badge ? pkg.badge.toLowerCase().includes(q) : false;
      return matchAmount || matchPrice || matchBadge;
    }
    return true;
  });

  const activeCount = packages.filter((p) => p.stock === "in_stock").length;
  const promoCount = packages.filter((p) => Boolean(p.badge || p.vip || p.popular)).length;
  const inactiveCount = packages.filter((p) => p.stock === "out_of_stock").length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Robux Pricelist
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage Robux tiers, selling prices in Malaysian Ringgit (MYR), and stock availability
          </p>
        </div>

        {/* Top Right Action: + Add New Package */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh Pricelist from Database"
            className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-emerald-900/30 transition shadow-sm disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 text-emerald-400 ${
                isRefreshing ? "animate-spin text-orange-400" : ""
              }`}
            />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-102 active:scale-98 transition-all flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar & Summary Strip */}
      <div className="p-4 rounded-3xl bg-[#0b1611] border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#070e0b] border border-emerald-950/80">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterTab === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All ({packages.length})
          </button>
          <button
            onClick={() => setFilterTab("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterTab === "active"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterTab("promo")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterTab === "promo"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Promo &amp; VIP ({promoCount})
          </button>
          {inactiveCount > 0 && (
            <button
              onClick={() => setFilterTab("inactive")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterTab === "inactive"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Robux packages..."
            className="w-full bg-[#070e0b] text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 pl-9 pr-3 py-2 rounded-2xl border border-emerald-950 focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>
      </div>

      {/* 3. 3-Column Grid of Robux Package Cards */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const isActive = pkg.stock === "in_stock";

            return (
              <div
                key={pkg.id}
                className={`p-5 sm:p-6 rounded-3xl bg-[#0b1611] border transition-all duration-300 relative flex flex-col justify-between shadow-xl group ${
                  isActive
                    ? "border-emerald-500/25 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_rgba(5,150,105,0.15)]"
                    : "border-zinc-800/80 bg-[#09110d]/60 opacity-65"
                }`}
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Robux Hexagon Gold Coin + Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                        <Image
                          src="/robux.webp"
                          alt="Robux Coin"
                          width={30}
                          height={30}
                          className="object-contain"
                        />
                      </div>

                      {/* Nominal Robux & Optional Badges */}
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                          {pkg.amount.toLocaleString()} Robux
                        </h3>

                        {/* Automatic Badges (PROMO, VIP, POPULAR) */}
                        {pkg.badge && (
                          <div className="pt-0.5">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                                pkg.badge.includes("PROMO")
                                  ? "bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                  : pkg.badge.includes("VIP")
                                  ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                                  : "bg-gradient-to-r from-orange-500/25 to-red-500/25 text-orange-300 border border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                              }`}
                            >
                              {pkg.badge.includes("PROMO") && <Zap className="w-3 h-3 fill-amber-400" />}
                              {pkg.badge.includes("VIP") && <Crown className="w-3 h-3 fill-yellow-400" />}
                              {pkg.badge.includes("POPULAR") && <Flame className="w-3 h-3 fill-orange-400" />}
                              <span>{pkg.badge === "POPULAR" ? "MOST POPULAR" : pkg.badge}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Right: Status Badge */}
                    <div>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Row (in RM) */}
                  <div className="mt-4 pl-1">
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      RM {pkg.priceMYR.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                      Official Rate Guarantee • Instant Delivery
                    </div>
                  </div>
                </div>

                {/* Bottom Row Action Bar */}
                <div className="mt-6 pt-4 border-t border-emerald-950/70 flex items-center justify-between text-xs">
                  {/* Left: Deactivate / Activate Toggle */}
                  <button
                    onClick={() => handleToggleActive(pkg.id)}
                    className={`font-bold transition hover:underline ${
                      isActive
                        ? "text-zinc-400 hover:text-rose-400"
                        : "text-emerald-400 hover:text-emerald-300"
                    }`}
                  >
                    {isActive ? "Deactivate" : "Activate"}
                  </button>

                  {/* Right: Pencil (Edit) and Trash (Delete) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(pkg)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="Edit Package"
                      aria-label="Edit package"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(pkg.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Delete Package"
                      aria-label="Delete package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#0b1611] border border-emerald-950/80 space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
            <Tag className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-zinc-300">
            No Packages Found
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No Robux packages match your search filter &quot;{searchTerm}&quot;.
          </p>
        </div>
      )}

      {/* 4. MODAL POPUP: Add & Edit Robux Package */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0c1712] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {modalMode === "add" ? "Add Robux Package" : "Edit Robux Package"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message if any */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Field 1: Robux Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <span>Robux Amount</span>
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Image
                      src="/robux.webp"
                      alt="Robux"
                      width={12}
                      height={12}
                      className="object-contain"
                    />
                  </div>
                </label>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="1,000"
                    className="w-full bg-[#070e0b] text-sm font-bold text-white placeholder-zinc-600 px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner pr-12"
                  />
                  <span className="absolute right-4 text-xs font-bold text-zinc-400 pointer-events-none">
                    R$
                  </span>
                </div>
              </div>

              {/* Field 2: Selling Price (RM) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Selling Price (RM)
                </label>

                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-bold text-orange-400 pointer-events-none">
                    RM
                  </span>
                  <input
                    type="text"
                    required
                    value={formPriceMYR}
                    onChange={(e) => setFormPriceMYR(e.target.value)}
                    placeholder="10.00"
                    className="w-full bg-[#070e0b] text-sm font-bold text-white placeholder-zinc-600 pl-12 pr-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Automatic Badges System Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/25 text-xs text-zinc-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Automatic Package Labels</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  These package badges are automatically managed by the system:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5 text-[11px]">
                  <div className="p-2 rounded-xl bg-[#070e0b] border border-orange-500/30 flex items-center gap-1.5 text-orange-300">
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>Popular:</strong> Most ordered Robux tier</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#070e0b] border border-amber-500/30 flex items-center gap-1.5 text-amber-300">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>Promo:</strong> Selected in Store Settings</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#070e0b] border border-yellow-500/30 flex items-center gap-1.5 text-yellow-300">
                    <Crown className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>VIP:</strong> Tiers above 10,000 Robux</span>
                  </div>
                </div>
              </div>

              {/* Field 4: Checkbox Active */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 bg-zinc-900 border-emerald-900/60 focus:ring-orange-500 cursor-pointer accent-orange-500"
                  />
                  <span className="text-xs font-semibold text-zinc-200">
                    Package Active &amp; Displayed in Store
                  </span>
                </label>
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs transition shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0c1712] border border-rose-500/40 rounded-3xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">
                Delete Robux Package?
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                This package will be permanently deleted from ZonaBlox pricelist.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
