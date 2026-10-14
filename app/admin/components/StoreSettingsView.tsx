"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { compressImageToWebP } from "@/lib/imageCompression";
import {
  Store,
  Flame,
  QrCode,
  ChevronDown,
  ChevronUp,
  Save,
  Calendar,
  Clock,
  Upload,
  Check,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
} from "lucide-react";

import { invalidateClientStoreSettings } from "@/lib/clientStoreSettings";

interface StoreSettingsViewProps {
  onToast?: (title: string, desc: string, type?: "success" | "info" | "warning") => void;
  onOpenReceiptModal?: (imageUrl: string, orderId: string) => void;
}

export default function StoreSettingsView({
  onToast,
  onOpenReceiptModal,
}: StoreSettingsViewProps) {
  // Collapsible section states
  const [sectionIdentityOpen, setSectionIdentityOpen] = useState(true);
  const [sectionPromoOpen, setSectionPromoOpen] = useState(true);
  const [sectionQrisOpen, setSectionQrisOpen] = useState(true);

  // 1. Store Identity & Contact
  const [storeName, setStoreName] = useState("ZonaBlox.id");
  const [whatsappCS, setWhatsappCS] = useState("60123456789");
  const [whatsappServiceActive, setWhatsappServiceActive] = useState<boolean>(false);
  const [telegramCS, setTelegramCS] = useState("@zonabloxmy");

  // 2. Promo Banner
  const [promoActive, setPromoActive] = useState(true);
  const [promoPackage, setPromoPackage] = useState("2,700 Robux (RM 12.00)");
  const [promoHeadline, setPromoHeadline] = useState("SPECIAL MALAYSIA ROBUX FLASH SALE");
  const [promoDescription, setPromoDescription] = useState(
    "Instant Robux delivery, 100% legal, safe & guaranteed money back! No password required."
  );
  const [promoEndDate, setPromoEndDate] = useState("31 October 2026 • 23:59 MYT");
  const [promoSelectedDay, setPromoSelectedDay] = useState(31);
  const [promoSelectedMonth, setPromoSelectedMonth] = useState("October 2026");
  const [promoHour, setPromoHour] = useState("23");
  const [promoMinute, setPromoMinute] = useState("59");

  // 3. QR Payment & Store Logo
  const [qrisNmid, setQrisNmid] = useState("MY1029384756102");
  const [qrisImage, setQrisImage] = useState(
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80"
  );
  const [storeLogo, setStoreLogo] = useState("/logo.jpg");

  // Countdown Modal State
  const [timerModalOpen, setTimerModalOpen] = useState(false);

  // Available packages loaded from catalog
  const [availablePackages, setAvailablePackages] = useState<{ id: string | number; robux: number; price: number; name: string }[]>([]);

  // Automatic WebP image compression handlers
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await compressImageToWebP(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
      setQrisImage(dataUrl);
      if (onToast) onToast("QR Code Updated", "Image processed and ready to save.", "success");
    } catch {
      alert("Failed to process image. Please try another image file.");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await compressImageToWebP(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 });
      setStoreLogo(dataUrl);
      if (onToast) onToast("Logo Updated", "Image processed and ready to save.", "success");
    } catch {
      alert("Failed to process image. Please try another image file.");
    }
  };

  // Load from Neon API on mount with localStorage cache fallback
  useEffect(() => {
    async function loadSettings() {
      // Load products for promo select
      fetch("/api/products?active_only=true")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAvailablePackages(json.data);
          }
        })
        .catch(() => {});

      try {
        const res = await fetch("/api/store-settings?admin=true&_t=" + Date.now(), { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.store_name) setStoreName(d.store_name);
          if (d.whatsapp_cs) setWhatsappCS(d.whatsapp_cs);
          if (d.whatsapp_service_active !== undefined) setWhatsappServiceActive(Boolean(d.whatsapp_service_active));
          if (d.telegram_cs) setTelegramCS(d.telegram_cs);
          if (d.promo_active !== undefined) setPromoActive(Boolean(d.promo_active));
          if (d.promo_package) setPromoPackage(d.promo_package);
          if (d.promo_headline) setPromoHeadline(d.promo_headline);
          if (d.promo_description) setPromoDescription(d.promo_description);
          if (d.promo_end_date) setPromoEndDate(d.promo_end_date);
          if (d.qris_nmid) setQrisNmid(d.qris_nmid);
          if (d.qris_image) setQrisImage(d.qris_image);
          if (d.store_logo) setStoreLogo(d.store_logo);
          return;
        }
      } catch {
        // network or server offline
      }

      try {
        const saved = localStorage.getItem("zonablox_store_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.storeName) setStoreName(parsed.storeName);
          if (parsed.whatsappCS) setWhatsappCS(parsed.whatsappCS);
          if (parsed.whatsapp_service_active !== undefined) setWhatsappServiceActive(Boolean(parsed.whatsapp_service_active));
          if (parsed.telegramCS) setTelegramCS(parsed.telegramCS);
          if (parsed.promoActive !== undefined) setPromoActive(parsed.promoActive);
          if (parsed.promoPackage) setPromoPackage(parsed.promoPackage);
          if (parsed.promoHeadline) setPromoHeadline(parsed.promoHeadline);
          if (parsed.promoDescription) setPromoDescription(parsed.promoDescription);
          if (parsed.promoEndDate) setPromoEndDate(parsed.promoEndDate);
          if (parsed.qrisNmid) setQrisNmid(parsed.qrisNmid);
          if (parsed.qrisImage) setQrisImage(parsed.qrisImage);
          if (parsed.storeLogo) setStoreLogo(parsed.storeLogo);
        }
      } catch {
        // ignore
      }
    }

    loadSettings();
  }, []);

  const saveToBackend = async (override?: Record<string, unknown>) => {
    const payload = {
      store_name: override?.store_name !== undefined ? override.store_name : storeName,
      whatsapp_cs: override?.whatsapp_cs !== undefined ? override.whatsapp_cs : whatsappCS,
      whatsapp_service_active: override?.whatsapp_service_active !== undefined ? override.whatsapp_service_active : whatsappServiceActive,
      telegram_cs: override?.telegram_cs !== undefined ? override.telegram_cs : telegramCS,
      promo_active: override?.promo_active !== undefined ? override.promo_active : promoActive,
      promo_package: override?.promo_package !== undefined ? override.promo_package : promoPackage,
      promo_headline: override?.promo_headline !== undefined ? override.promo_headline : promoHeadline,
      promo_description: override?.promo_description !== undefined ? override.promo_description : promoDescription,
      promo_end_date: override?.promo_end_date !== undefined ? override.promo_end_date : promoEndDate,
      qris_nmid: override?.qris_nmid !== undefined ? override.qris_nmid : qrisNmid,
      qris_image: override?.qris_image !== undefined ? override.qris_image : qrisImage,
      store_logo: override?.store_logo !== undefined ? override.store_logo : storeLogo,
    };

    try {
      localStorage.setItem("zonablox_store_settings", JSON.stringify(payload));
      invalidateClientStoreSettings();
      await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // ignore
    }
  };

  // Master Collapse / Expand All
  const areAllOpen = sectionIdentityOpen && sectionPromoOpen && sectionQrisOpen;
  const toggleAllSections = () => {
    if (areAllOpen) {
      setSectionIdentityOpen(false);
      setSectionPromoOpen(false);
      setSectionQrisOpen(false);
    } else {
      setSectionIdentityOpen(true);
      setSectionPromoOpen(true);
      setSectionQrisOpen(true);
    }
  };

  // Save Identity & Contact
  const handleSaveIdentity = () => {
    saveToBackend({
      store_name: storeName,
      whatsapp_cs: whatsappCS,
      whatsapp_service_active: whatsappServiceActive,
      telegram_cs: telegramCS,
    });
    if (onToast) {
      onToast("Identity Saved", "Store identity, WhatsApp, and Telegram CS contacts updated.", "success");
    }
  };

  // Save Promo Banner
  const handleSavePromo = () => {
    saveToBackend({
      promo_active: promoActive,
      promo_package: promoPackage,
      promo_headline: promoHeadline,
      promo_description: promoDescription,
      promo_end_date: promoEndDate,
    });
    if (onToast) {
      onToast("Banner Saved", "Storefront hero promo banner updated in Neon database.", "success");
    }
  };

  // Save QR & Logo
  const handleSaveQrisLogo = () => {
    saveToBackend({ qris_nmid: qrisNmid, qris_image: qrisImage, store_logo: storeLogo });
    if (onToast) {
      onToast("Payment & Logo Saved", "DuitNow QR code and brand logo configurations saved in Neon.", "success");
    }
  };

  // Apply Countdown Timer from Modal
  const handleApplyTimer = () => {
    const formatted = `${promoSelectedDay} ${promoSelectedMonth} • ${promoHour}:${promoMinute} MYT`;
    setPromoEndDate(formatted);
    setTimerModalOpen(false);
    if (onToast) {
      onToast("Timer Updated", `Promo countdown set to expire on ${formatted}.`, "info");
    }
  };

  // Quick Preset Handlers
  const handleApplyPresetDays = (daysToAdd: number) => {
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    const day = now.getDate();
    setPromoSelectedDay(day);
    setPromoHour("23");
    setPromoMinute("59");
  };

  const handleApplyEndOfMonth = () => {
    setPromoSelectedDay(31);
    setPromoHour("23");
    setPromoMinute("59");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Store Settings &amp; Banner
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure store identity, WhatsApp support phone, DuitNow QR, and customer promo banner
          </p>
        </div>

        {/* Top Right: Collapse / Expand All Button */}
        <button
          onClick={toggleAllSections}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition shadow-sm w-fit"
        >
          {areAllOpen ? (
            <>
              <ChevronUp className="w-4 h-4 text-emerald-400" />
              <span>Collapse All Sections</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-emerald-400" />
              <span>Expand All Sections</span>
            </>
          )}
        </button>
      </div>

      {/* 2. SECTION 1: STORE IDENTITY & CS CONTACT */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl overflow-hidden transition-all duration-300">
        {/* Section Header */}
        <div
          onClick={() => setSectionIdentityOpen(!sectionIdentityOpen)}
          className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-emerald-950/20 transition select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                STORE IDENTITY &amp; CONTACT
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Brand name displayed on storefront navbar and customer service WhatsApp number
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Store Name Badge */}
            <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#070e0b] border border-emerald-950 text-zinc-300 whitespace-nowrap">
              {storeName}
            </span>

            {/* Telegram CS Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950/40 border border-sky-500/30 text-sky-400 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              <span className="font-mono">{telegramCS || "@zonabloxmy"}</span>
            </span>

            {/* WhatsApp Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                whatsappServiceActive
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  whatsappServiceActive
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-zinc-600"
                }`}
              />
              <span>{whatsappServiceActive ? "WA Online" : "WA Offline"}</span>
            </span>

            <div className="p-1 rounded-xl text-zinc-400 hover:text-white">
              {sectionIdentityOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Section Body */}
        {sectionIdentityOpen && (
          <div className="p-5 sm:p-6 pt-0 border-t border-emerald-950/70 space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">
              {/* Field 1: Store Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Store Name (Storefront Navbar)
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="ZonaBlox.id"
                  className="w-full bg-[#070e0b] text-sm font-bold text-white placeholder-zinc-500 px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
                />
                <p className="text-[11px] text-zinc-500 pt-0.5">
                  Appears on the top header navigation.
                </p>
              </div>

              {/* Field 2: Telegram CS Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Telegram CS Handle</span>
                  <span className="text-[10px] text-sky-400 font-semibold uppercase">Active CS</span>
                </label>
                <input
                  type="text"
                  value={telegramCS}
                  onChange={(e) => setTelegramCS(e.target.value)}
                  placeholder="@zonabloxmy"
                  className="w-full bg-[#070e0b] text-sm font-bold text-white placeholder-zinc-500 px-4 py-3 rounded-2xl border border-sky-900/50 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 transition shadow-inner"
                />
                <p className="text-[11px] text-zinc-500 pt-0.5">
                  Primary customer service handle (e.g. @zonabloxmy).
                </p>
              </div>

              {/* Field 3: WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  WhatsApp Support Phone (Format: 60... / 62...)
                </label>
                <input
                  type="text"
                  value={whatsappCS}
                  onChange={(e) => setWhatsappCS(e.target.value)}
                  placeholder="60123456789"
                  className="w-full bg-[#070e0b] text-sm font-bold text-white placeholder-zinc-500 px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
                />
                <p className="text-[11px] text-zinc-500 pt-0.5">
                  Secondary chat support (can be enabled via toggle below).
                </p>
              </div>
            </div>

            {/* Field 3: WhatsApp Ordering Service Toggle */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#070e0b] border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    WhatsApp Direct Ordering Channel
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      whatsappServiceActive
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {whatsappServiceActive ? "Active & Servicing" : "Not Servicing / Inactive"}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  {whatsappServiceActive
                    ? "Storefront will show 'Online & Servicing Orders' and allow customers to place orders directly through WhatsApp."
                    : "Storefront will show 'Currently not servicing WhatsApp' and advise customers to checkout via Website."}
                </p>
              </div>

              <div
                onClick={() => setWhatsappServiceActive(!whatsappServiceActive)}
                className={`w-14 h-7 rounded-full transition-colors p-1 cursor-pointer flex items-center shrink-0 ${
                  whatsappServiceActive ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
              </div>
            </div>

            {/* Bottom Button */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleSaveIdentity}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm transition shadow-[0_0_20px_rgba(249,115,22,0.35)]"
              >
                <Save className="w-4 h-4" />
                <span>Save Identity &amp; Contact</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. SECTION 2: STOREFRONT PROMO BANNER SETTINGS */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl overflow-hidden transition-all duration-300">
        {/* Section Header */}
        <div
          onClick={() => setSectionPromoOpen(!sectionPromoOpen)}
          className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-emerald-950/20 transition select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                STOREFRONT PROMO BANNER SETTINGS
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure promotional packages, headline, and countdown timer at top of website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                promoActive
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {promoActive ? `Active • ${promoPackage}` : "Disabled"}
            </span>

            {/* Switch Toggle */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setPromoActive(!promoActive);
              }}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                promoActive ? "bg-orange-500 justify-end" : "bg-zinc-800 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
            </div>

            <div className="p-1 rounded-xl text-zinc-400 hover:text-white">
              {sectionPromoOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Section Body */}
        {sectionPromoOpen && (
          <div className="p-5 sm:p-6 pt-0 border-t border-emerald-950/70 space-y-5 animate-in fade-in duration-200">
            <div className="space-y-4 pt-5">
              {/* Field 1: Featured Promo Package */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Featured Promo Package
                </label>
                <select
                  value={promoPackage}
                  onChange={(e) => setPromoPackage(e.target.value)}
                  className="w-full bg-[#070e0b] text-sm font-bold text-white px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 transition shadow-inner cursor-pointer"
                >
                  {availablePackages.length > 0 ? (
                    availablePackages.map((pkg) => {
                      const val = `${pkg.robux.toLocaleString()} Robux (RM ${pkg.price})`;
                      return (
                        <option key={pkg.id} value={val}>
                          {pkg.robux.toLocaleString()} Robux (RM {pkg.price}) ⚡ Promo
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="2,700 Robux (RM 12.00)">2,700 Robux (RM 12.00) ⚡ Promo</option>
                      <option value="2,200 Robux (RM 10.00)">2,200 Robux (RM 10.00) ⚡ Promo</option>
                      <option value="1,800 Robux (RM 8.00)">1,800 Robux (RM 8.00) ⚡ Promo</option>
                      <option value="10,500 Robux (RM 46.00)">10,500 Robux (RM 46.00) ⚡ Promo</option>
                    </>
                  )}
                </select>
                <p className="text-[11px] text-zinc-400 mt-1">
                  The package selected here will automatically receive the <strong className="text-amber-400">⚡ PROMO</strong> badge on the Pricelist and Storefront.
                </p>
              </div>

              {/* Field 2: Banner Headline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Banner Headline Text
                </label>
                <input
                  type="text"
                  value={promoHeadline}
                  onChange={(e) => setPromoHeadline(e.target.value)}
                  placeholder="SPECIAL MALAYSIA ROBUX FLASH SALE"
                  className="w-full bg-[#070e0b] text-sm font-bold text-white px-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 transition shadow-inner uppercase tracking-wider"
                />
              </div>



              {/* Field 4: Promo End Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Promo Expiration (Countdown Timer)
                </label>

                <div className="p-4 rounded-2xl bg-[#070e0b] border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">
                        {promoEndDate}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Click to configure end date and countdown hour
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setTimerModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider transition uppercase shadow-sm self-start sm:self-center"
                  >
                    CONFIGURE
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleSavePromo}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm transition shadow-[0_0_20px_rgba(249,115,22,0.35)]"
              >
                <Save className="w-4 h-4" />
                <span>Save Promo Banner</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. SECTION 3: DUITNOW QR & STORE LOGO */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-xl overflow-hidden transition-all duration-300">
        {/* Section Header */}
        <div
          onClick={() => setSectionQrisOpen(!sectionQrisOpen)}
          className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-emerald-950/20 transition select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                DUITNOW QR &amp; BRAND LOGO
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automated QR payment barcode and official storefront brand logo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-[#070e0b] border border-emerald-950 text-zinc-300">
              DuitNow: Active • Logo: Active
            </span>
            <div className="p-1 rounded-xl text-zinc-400 hover:text-white">
              {sectionQrisOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Section Body */}
        {sectionQrisOpen && (
          <div className="p-5 sm:p-6 pt-0 border-t border-emerald-950/70 space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
              {/* Card 1: DuitNow QR Barcode Status */}
              <div className="p-5 rounded-2xl bg-[#070e0b] border border-emerald-950/80 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        DuitNow QR Barcode Status
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        PayNet ID: {qrisNmid}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ✓ Active
                    </span>
                  </div>

                  {/* QR Image Box */}
                  <div
                    onClick={() => {
                      if (onOpenReceiptModal) {
                        onOpenReceiptModal(qrisImage, "DuitNow QR ZonaBlox");
                      }
                    }}
                    className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-emerald-950 hover:border-emerald-500/40 transition cursor-pointer text-center space-y-2 group"
                  >
                    <div className="relative w-36 h-36 mx-auto rounded-xl overflow-hidden bg-white p-2">
                      <Image
                        src={qrisImage}
                        alt="DuitNow QR Code"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 group-hover:text-emerald-400 transition font-medium">
                      Click image to view full QR code
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <label className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-emerald-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Upload QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Or enter DuitNow QR image URL:", qrisImage);
                      if (url) {
                        setQrisImage(url);
                        if (onToast) onToast("QR Code Updated", "DuitNow QR image URL updated.", "info");
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-emerald-950 text-xs font-semibold"
                    title="Enter Image URL"
                  >
                    URL
                  </button>
                </div>
              </div>

              {/* Card 2: Storefront Logo Status */}
              <div className="p-5 rounded-2xl bg-[#070e0b] border border-emerald-950/80 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        Storefront Brand Logo
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Brand asset (persisted in database)
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ✓ Active
                    </span>
                  </div>

                  {/* Logo Image Box */}
                  <div
                    onClick={() => {
                      if (onOpenReceiptModal) {
                        onOpenReceiptModal(storeLogo, "ZonaBlox Brand Logo");
                      }
                    }}
                    className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-emerald-950 hover:border-emerald-500/40 transition cursor-pointer text-center space-y-2 group"
                  >
                    <div className="relative w-36 h-36 mx-auto rounded-xl overflow-hidden bg-[#0a120e] p-2 flex items-center justify-center border border-emerald-950">
                      <Image
                        src={storeLogo}
                        alt="Storefront Logo"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 group-hover:text-emerald-400 transition font-medium">
                      Click image to view full logo
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <label className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-emerald-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Or enter Store Logo URL:", storeLogo);
                      if (url) {
                        setStoreLogo(url);
                        if (onToast) onToast("Logo Updated", "Storefront logo updated.", "info");
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-emerald-950 text-xs font-semibold"
                    title="Enter Image URL"
                  >
                    URL
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleSaveQrisLogo}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm transition shadow-[0_0_20px_rgba(249,115,22,0.35)]"
              >
                <Save className="w-4 h-4" />
                <span>Save QR &amp; Logo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL POPUP: Configure Promo Expiration Timer */}
      {timerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0c1712] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleApplyPresetDays(3)}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#070e0b] hover:bg-zinc-800 text-zinc-300 border border-emerald-950 transition"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetDays(7)}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#070e0b] hover:bg-zinc-800 text-zinc-300 border border-emerald-950 transition"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetDays(14)}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#070e0b] hover:bg-zinc-800 text-zinc-300 border border-emerald-950 transition"
              >
                +14 Days
              </button>
              <button
                type="button"
                onClick={handleApplyEndOfMonth}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-sm"
              >
                End of Month
              </button>
            </div>

            {/* Calendar Month & Navigation */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-extrabold text-white">
                  {promoSelectedMonth}
                </span>
                <div className="flex items-center gap-1 text-zinc-400">
                  <button className="p-1 rounded hover:text-white">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-zinc-400">
                <span className="text-rose-400">Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {[27, 28, 29, 30].map((d) => (
                  <span key={`prev-${d}`} className="p-1.5 text-zinc-600 select-none">
                    {d}
                  </span>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isSelected = promoSelectedDay === day;
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setPromoSelectedDay(day)}
                      className={`p-1.5 rounded-xl font-bold transition select-none ${
                        isSelected
                          ? "bg-amber-600 text-white shadow-md scale-105"
                          : "text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Picker Section */}
            <div className="p-3.5 rounded-2xl bg-[#070e0b] border border-emerald-950 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Set Expiration Time</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px]">
                  {promoHour}:{promoMinute} MYT
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-zinc-500 block mb-1 text-[10px]">Hour (00 - 23)</label>
                  <select
                    value={promoHour}
                    onChange={(e) => setPromoHour(e.target.value)}
                    className="w-full bg-zinc-900 text-white font-bold rounded-xl px-2.5 py-1.5 border border-emerald-950"
                  >
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1 text-[10px]">Minute (00 - 59)</label>
                  <select
                    value={promoMinute}
                    onChange={(e) => setPromoMinute(e.target.value)}
                    className="w-full bg-zinc-900 text-white font-bold rounded-xl px-2.5 py-1.5 border border-emerald-950"
                  >
                    {["00", "15", "30", "45", "59"].map((m) => (
                      <option key={m} value={m}>
                        Minute {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleApplyTimer}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply Promo Timer</span>
              </button>

              <button
                type="button"
                onClick={() => setTimerModalOpen(false)}
                className="w-full py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
