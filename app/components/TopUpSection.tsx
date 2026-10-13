"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { compressImageToWebP } from "@/lib/imageCompression";
import {
  ROBUX_PACKAGES,
  RobuxPackage,
  PAYMENT_METHODS,
} from "../data/robuxData";
import {
  User,
  Check,
  Zap,
  ArrowRight,
  Sparkles,
  Globe,
  MessageCircle,
  Flame,
  Crown,
  Info,
  Upload,
  AlertCircle,
  X,
  FileCheck,
  CheckCircle2,
  Copy,
  ChevronDown,
} from "lucide-react";

export default function TopUpSection() {
  const [username, setUsername] = useState("");
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const [robloxUser, setRobloxUser] = useState<{
    id: number;
    username: string;
    displayName: string;
    hasVerifiedBadge: boolean;
    avatarUrl: string;
  } | null>(null);
  const [checkError, setCheckError] = useState("");
  const [packages, setPackages] = useState<RobuxPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<RobuxPackage | null>(null);
  // Selected channel: "website" or "whatsapp"
  const [selectedChannel, setSelectedChannel] = useState<"website" | "whatsapp">("website");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "bestseller" | "vip">("all");
  const [showAllPackages, setShowAllPackages] = useState(false);

  const [storeSettings, setStoreSettings] = useState<{
    whatsapp_cs?: string;
    whatsapp_service_active?: boolean;
    qris_nmid?: string;
    qris_image?: string;
    store_name?: string;
  } | null>(null);

  // Fetch active products and store settings from Neon API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, settingsRes] = await Promise.allSettled([
          fetch("/api/products?active_only=true"),
          fetch(`/api/store-settings?_t=${Date.now()}`, { cache: "no-store" }),
        ]);

        if (prodRes.status === "fulfilled") {
          const json = await prodRes.value.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: RobuxPackage[] = json.data.map((p: any) => ({
              id: `pkg-${p.id}`,
              amount: Number(p.robux),
              priceMYR: Number(p.price),
              popular: Boolean(p.popular),
              bestSeller: Boolean(p.popular || p.promo),
              vip: Boolean(p.vip),
              badge: p.badge || undefined,
              stock: (p.stock || "in_stock") as "in_stock" | "out_of_stock",
              category: (p.vip ? "vip" : "bestseller") as "bestseller" | "vip" | "standard",
            }));
            setPackages(mapped);
            setSelectedPackage(mapped[0]);
          }
        }

        if (settingsRes.status === "fulfilled") {
          const sJson = await settingsRes.value.json();
          if (sJson.success && sJson.data) {
            setStoreSettings(sJson.data);
          }
        }
      } catch {
        // network or server offline
      }
    }

    loadData();
  }, []);

  // Modal states
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  const [whatsappSuccessModalOpen, setWhatsappSuccessModalOpen] = useState(false);
  const [websiteSuccessModalOpen, setWebsiteSuccessModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderCode: string;
    username: string;
    robux: number;
    price: number;
    whatsapp: string;
    receiptName?: string;
    avatarUrl?: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleCheckUsername = async () => {
    if (!username.trim()) return;
    setIsCheckingUser(true);
    setCheckError("");
    setUserVerified(false);

    try {
      const res = await fetch("/api/roblox/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setRobloxUser(data.user);
        setUsername(data.user.username);
        setUserVerified(true);
      } else {
        setRobloxUser(null);
        setCheckError(data.message || "Roblox username not found.");
      }
    } catch {
      setRobloxUser(null);
      setCheckError("Could not connect to verification server. Please try again.");
    } finally {
      setIsCheckingUser(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    if (filterTab === "all") return true;
    return pkg.category === filterTab;
  });

  const displayedPackages = showAllPackages
    ? filteredPackages
    : filteredPackages.slice(0, 6);

  const handleCheckout = () => {
    if (!username.trim()) {
      alert("Please enter your Roblox username first!");
      return;
    }
    if (!selectedPackage) {
      alert("Please select a Robux package!");
      return;
    }

    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    if (!cleanPhone) {
      setWhatsappError("WhatsApp number is required to receive order receipts and delivery updates.");
      const inputEl = document.getElementById("whatsapp-input");
      if (inputEl) {
        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
        inputEl.focus();
      }
      return;
    }

    if (cleanPhone.length < 8) {
      setWhatsappError("Please enter a valid WhatsApp number (minimum 8 digits).");
      const inputEl = document.getElementById("whatsapp-input");
      if (inputEl) {
        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
        inputEl.focus();
      }
      return;
    }

    setWhatsappError("");

    if (selectedChannel === "website") {
      // Buka popup pembayaran via website untuk upload bukti transfer
      setReceiptFile(null);
      setReceiptPreview(null);
      setUploadError("");
      setWebsiteModalOpen(true);
    } else {
      // Record order into Neon for WhatsApp checkout
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roblox_username: username,
          roblox_user_id: robloxUser?.id ? String(robloxUser.id) : null,
          roblox_avatar_url: robloxUser?.avatarUrl || null,
          customer_phone: `+60${cleanPhone}`,
          robux: selectedPackage?.amount || 0,
          price: selectedPackage?.priceMYR || 0,
          payment_method: "WhatsApp",
          payment_channel: "whatsapp",
          submethod: "WhatsApp Direct",
        }),
      }).catch(() => {});

      if (storeSettings?.whatsapp_service_active) {
        // Open WhatsApp chat directly when service is active
        const waUrl = getWhatsappOrderUrl();
        window.open(waUrl, "_blank");
      }

      // Mode via WhatsApp: Tampilkan pop up sukses/status
      setWhatsappSuccessModalOpen(true);
    }
  };

  const getWhatsappOrderUrl = () => {
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    const csPhone = storeSettings?.whatsapp_cs ? storeSettings.whatsapp_cs.replace(/\D/g, "") : "60123456789";
    const message = encodeURIComponent(
      `*DIRECT ORDER VIA WHATSAPP - ${storeSettings?.store_name || "ZONABLOX"}*\n\n` +
        `Hello Admin, I would like to order Robux via WhatsApp:\n\n` +
        `• *Roblox Username*: ${username}\n` +
        `• *Robux Package*: ${selectedPackage?.amount.toLocaleString()} Robux\n` +
        `• *Total Price*: RM ${selectedPackage?.priceMYR}\n` +
        `• *Buyer WhatsApp*: +60${cleanPhone}\n\n` +
        `Please send payment instructions to complete this top-up. Thank you!`
    );
    return `https://wa.me/${csPhone}?text=${message}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPG or PNG).");
      return;
    }

    try {
      setUploadError("");
      const { file: compressedFile, dataUrl } = await compressImageToWebP(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.75,
      });
      setReceiptFile(compressedFile);
      setReceiptPreview(dataUrl);
    } catch {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmWebsitePayment = async () => {
    if (!receiptFile) {
      setUploadError("Payment receipt is required! Please upload your transfer screenshot.");
      return;
    }

    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    setIsSubmittingOrder(true);

    let createdOrderCode = `ZBX${Date.now().toString().slice(-8)}`;

    try {
      // Record order in Neon Database with WebP compressed payment proof
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roblox_username: username,
          roblox_user_id: robloxUser?.id ? String(robloxUser.id) : null,
          roblox_avatar_url: robloxUser?.avatarUrl || null,
          customer_phone: `+60${cleanPhone}`,
          robux: selectedPackage?.amount || 0,
          price: selectedPackage?.priceMYR || 0,
          payment_method: "Website",
          payment_channel: "website",
          submethod: "DuitNow QR",
          payment_proof_path: receiptPreview || null,
          customer_notes: null,
        }),
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data?.order_code) {
        createdOrderCode = resJson.data.order_code;
      }
    } catch {
      // fallback
    } finally {
      setIsSubmittingOrder(false);
    }

    // Automatically redirect to WhatsApp admin to confirm payment receipt
    const message = encodeURIComponent(
      `*PAYMENT CONFIRMATION VIA WEBSITE - ZONABLOX MALAYSIA*\n\n` +
        `Hello Admin ZonaBlox, I have completed the transfer and attached my payment receipt on the website:\n\n` +
        `• *Order Code*: ${createdOrderCode}\n` +
        `• *Roblox Username*: ${username}\n` +
        `• *Robux Package*: ${selectedPackage?.amount.toLocaleString()} Robux\n` +
        `• *Total Amount*: RM ${selectedPackage?.priceMYR}\n` +
        `• *Payment Method*: Website Checkout (DuitNow QR / FPX)\n` +
        `• *Buyer WhatsApp*: +60${cleanPhone}\n` +
        `• *Payment Receipt*: Attached / Uploaded (${receiptFile.name})\n\n` +
        `Please process the Robux top-up to my Roblox account. Thank you!`
    );

    const csPhone = storeSettings?.whatsapp_cs ? storeSettings.whatsapp_cs.replace(/\D/g, "") : "60123456789";
    const waUrl = `https://wa.me/${csPhone}?text=${message}`;

    setCompletedOrder({
      orderCode: createdOrderCode,
      username,
      robux: selectedPackage?.amount || 0,
      price: selectedPackage?.priceMYR || 0,
      whatsapp: `+60${cleanPhone}`,
      receiptName: receiptFile.name,
      avatarUrl: robloxUser?.avatarUrl,
    });

    setWebsiteModalOpen(false);
    setWebsiteSuccessModalOpen(true);
    window.open(waUrl, "_blank");
  };

  return (
    <section id="topup-section" className="relative py-12 sm:py-16">
      {/* Background visual accents */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Fast & Direct Order System</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Select Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Robux Package
            </span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Official Malaysia regional pricing. Enjoy instant transfer directly into your account safely.
          </p>
        </div>

        {/* Top Up Order Container */}
        <div className="bg-[#0b1410]/90 border border-emerald-500/25 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
          {/* Step 1: Input Roblox Username */}
          <div className="mb-10 pb-8 border-b border-emerald-950/80">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                1
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Enter Roblox Username
              </h3>
              <span className="text-xs text-zinc-400">
                (No password or pin needed)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUserVerified(false);
                  }}
                  placeholder="Enter your exact Roblox username (e.g. Builderman)..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#060c09] border border-emerald-800/40 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-zinc-500 text-sm font-medium outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleCheckUsername}
                disabled={!username.trim() || isCheckingUser}
                className="sm:w-36 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isCheckingUser ? (
                  <span>Checking...</span>
                ) : userVerified ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Verified!</span>
                  </>
                ) : (
                  <span>Check ID</span>
                )}
              </button>
            </div>

            {/* Real Roblox User Profile Banner */}
            {userVerified && robloxUser ? (
              <div className="mt-3.5 w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0a1610] to-emerald-950/60 border border-emerald-500/50 text-white flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-[#060c09] shrink-0 shadow-md">
                    {robloxUser.avatarUrl ? (
                      <Image
                        src={robloxUser.avatarUrl}
                        alt={robloxUser.username}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 m-auto text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base text-white truncate">
                        {robloxUser.displayName}
                      </span>
                      {robloxUser.hasVerifiedBadge && (
                        <span
                          className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0"
                          title="Verified Roblox Account"
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold truncate flex items-center gap-1.5">
                      <span>@{robloxUser.username}</span>
                      <span className="text-[10px] text-zinc-400">• ID: {robloxUser.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Account Verified</span>
                  <span className="sm:hidden">Verified</span>
                </div>
              </div>
            ) : checkError ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-950/50 border border-red-500/40 px-3.5 py-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{checkError}</span>
              </div>
            ) : (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-400">
                <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>
                  Enter your Roblox username and click <strong>Check ID</strong> to verify with official Roblox servers.
                </span>
              </div>
            )}
          </div>

          {/* Step 2: Choose Robux Package */}
          <div className="mb-10 pb-8 border-b border-emerald-950/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                  2
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white">
                  Choose Robux Package
                </h3>
              </div>

              {/* Filter Tabs - Mobile Responsive Scroll / Wrap */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060c09] border border-emerald-900/40 text-xs font-semibold overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-center transition-all whitespace-nowrap ${
                    filterTab === "all"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("bestseller")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                    filterTab === "bestseller"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Best Seller</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("vip")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                    filterTab === "vip"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP Tier</span>
                </button>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
              {displayedPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative rounded-2xl p-3 sm:p-5 cursor-pointer transition-all duration-200 border text-center flex flex-col justify-between select-none ${
                      isSelected
                        ? "bg-gradient-to-b from-[#14261d] to-[#0a1610] border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.35)] scale-102 ring-2 ring-orange-500/50"
                        : "bg-[#070e0b]/80 border-emerald-900/40 hover:border-emerald-500/50 hover:bg-[#0d1a13]"
                    }`}
                  >
                    {/* Automatic Badges: PROMO, VIP, POPULAR */}
                    {pkg.badge === "PROMO" ? (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-sm whitespace-nowrap">
                        ⚡ PROMO
                      </span>
                    ) : pkg.vip ? (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-sm whitespace-nowrap">
                        VIP 👑
                      </span>
                    ) : pkg.popular ? (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-sm whitespace-nowrap">
                        Popular 🔥
                      </span>
                    ) : null}

                    <div>
                      {/* Robux Coin Icon */}
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 mx-auto my-1.5 sm:my-2 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                        <Image
                          src="/robux.webp"
                          alt="Robux"
                          fill
                          className="object-contain"
                        />
                      </div>

                      {/* Robux Amount */}
                      <div className="text-base sm:text-xl font-black text-white tracking-tight">
                        {pkg.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-400">
                        ROBUX
                      </div>
                    </div>

                    {/* Price in MYR */}
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-emerald-950/80">
                      <div className="text-sm sm:text-lg font-black text-white">
                        <span className="text-[11px] sm:text-xs text-orange-400 font-bold mr-0.5">
                          RM
                        </span>
                        {pkg.priceMYR}
                      </div>
                    </div>

                    {/* Active Check Indicator */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* View More / Show Less Toggle (Paging control so mobile is not stretched too long) */}
            {filteredPackages.length > 6 && (
              <div className="mt-5 sm:mt-6 flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllPackages((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#060c09] hover:bg-emerald-950/60 border border-emerald-500/40 hover:border-orange-500/60 text-white font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer group"
                >
                  <span>
                    {showAllPackages
                      ? "Show Less Packages"
                      : `View More Packages (+${filteredPackages.length - 6} More)`}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-orange-400 transition-transform duration-300 ${
                      showAllPackages ? "rotate-180" : "group-hover:translate-y-0.5"
                    }`}
                  />
                </button>
                <span className="text-[11px] text-zinc-400">
                  Showing {displayedPackages.length} of {filteredPackages.length} Robux packages
                </span>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method (HANYA 2 METODE: VIA WEBSITE & VIA WHATSAPP) */}
          <div className="mb-10 pb-8 border-b border-emerald-950/80">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                3
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Select Payment Method
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Via Website */}
              <div
                onClick={() => setSelectedChannel("website")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                  selectedChannel === "website"
                    ? "bg-[#14261d] border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.25)] ring-2 ring-orange-500/50"
                    : "bg-[#070e0b]/70 border-emerald-900/40 hover:border-emerald-500/40"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-base">
                          Via Website
                        </div>
                        <div className="text-xs text-zinc-400">
                          DuitNow QR, Touch &apos;n Go, GrabPay, FPX
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedChannel === "website"
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-zinc-600"
                      }`}
                    >
                      {selectedChannel === "website" && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Instant automated verification. Transfer directly and attach receipt screenshot.
                  </p>
                </div>
              </div>

              {/* Option 2: Via WhatsApp */}
              <div
                onClick={() => setSelectedChannel("whatsapp")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                  selectedChannel === "whatsapp"
                    ? "bg-[#14261d] border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.25)] ring-2 ring-orange-500/50"
                    : "bg-[#070e0b]/70 border-emerald-900/40 hover:border-emerald-500/40"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-base flex items-center gap-2">
                          <span>Via WhatsApp</span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          Direct chat with CS Admin
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedChannel === "whatsapp"
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-zinc-600"
                      }`}
                    >
                      {selectedChannel === "whatsapp" && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>
                  </div>

                  {storeSettings?.whatsapp_service_active ? (
                    <div className="px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold">Online &amp; Servicing Orders</span>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span className="font-semibold">Currently not servicing WhatsApp</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: WhatsApp Contact & Summary */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                4
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Contact & Complete Order
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* WhatsApp Contact Input */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>
                    WhatsApp Number (For Order Receipt &amp; Updates) <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    Required
                  </span>
                </label>
                <div className="flex gap-2">
                  <span
                    className={`px-3.5 py-3.5 rounded-xl bg-[#060c09] font-bold text-sm flex items-center transition-all ${
                      whatsappError
                        ? "border-2 border-red-500/60 text-red-400"
                        : "border border-emerald-800/40 text-emerald-400"
                    }`}
                  >
                    +60
                  </span>
                  <input
                    id="whatsapp-input"
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => {
                      setWhatsappNumber(e.target.value);
                      if (whatsappError) setWhatsappError("");
                    }}
                    placeholder="12-3456789"
                    className={`flex-1 min-w-0 px-4 py-3.5 rounded-xl bg-[#060c09] text-white placeholder-zinc-500 text-sm font-medium outline-none transition-all ${
                      whatsappError
                        ? "border-2 border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                        : "border border-emerald-800/40 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    }`}
                  />
                </div>
                {whatsappError ? (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5 font-semibold animate-in fade-in duration-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{whatsappError}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-zinc-400">
                    Required for instant order confirmation, invoice delivery, and priority live chat support.
                  </p>
                )}
              </div>

              {/* Order Summary & Button */}
              <div className="p-5 rounded-2xl bg-[#070e0b] border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Method Selected:</span>
                  <strong className="text-white">
                    {selectedChannel === "website" ? "Via Website" : "Via WhatsApp"}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Selected Package:</span>
                  <strong className="text-emerald-400">
                    {selectedPackage ? `${selectedPackage.amount.toLocaleString()} Robux` : "-"}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                  <span>Total Payable:</span>
                  <span className="text-xl font-black text-orange-400">
                    RM {selectedPackage ? selectedPackage.priceMYR : 0}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Pay Now • RM {selectedPackage?.priceMYR}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP 1: MODAL PEMBAYARAN VIA WEBSITE */}
      {websiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1611] border border-emerald-500/40 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setWebsiteModalOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 sm:mb-5 pr-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  Website Checkout & Payment
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Transfer & upload receipt for instant verification
                </p>
              </div>
            </div>

            {/* Order Brief Summary */}
            <div className="p-4 rounded-2xl bg-[#060c09] border border-emerald-950 space-y-2 mb-5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Roblox Username:</span>
                <span className="text-white font-bold">@{username}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total Robux:</span>
                <span className="text-emerald-400 font-bold">
                  +{selectedPackage?.amount.toLocaleString()} Robux
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 pt-2 border-t border-emerald-950/80">
                <span>Total Payable:</span>
                <span className="text-orange-400 font-black text-base">
                  RM {selectedPackage?.priceMYR}
                </span>
              </div>
            </div>

            {/* QR / Bank Info Box */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 mb-5 text-xs space-y-3">
              {storeSettings?.qris_image && (
                <div className="flex justify-center py-1">
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-emerald-500/30 bg-white p-2 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={storeSettings.qris_image}
                      alt="DuitNow QRIS Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <p className="text-zinc-300 text-[11px] text-center">
                Please scan DuitNow QR or transfer <strong>RM {selectedPackage?.priceMYR}</strong> to {storeSettings?.store_name || "ZonaBlox"} official account, then upload your transfer receipt below.
              </p>
            </div>

            {/* UPLOAD PAYMENT RECEIPT */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>
                  Upload Payment Receipt <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-red-400 font-normal">
                  (Required)
                </span>
              </label>

              <div className="relative border-2 border-dashed border-emerald-700/50 hover:border-orange-500/60 rounded-2xl p-4 text-center bg-[#060c09] transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {receiptPreview ? (
                  <div className="flex items-center gap-3 text-left">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500 shrink-0">
                      <Image
                        src={receiptPreview}
                        alt="Payment Receipt"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{receiptFile?.name}</span>
                      </div>
                      <p className="text-[11px] text-emerald-400 mt-0.5">
                        Receipt attached & ready to confirm!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-3">
                    <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-300">
                      Click to upload transfer screenshot or photo
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      JPG or PNG supported
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWebsiteModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs sm:text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingOrder}
                onClick={handleConfirmWebsitePayment}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm text-center shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingOrder ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Submit & Confirm WA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: MODAL SUKSES METODE VIA WHATSAPP */}
      {whatsappSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1611] border border-orange-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-8 shadow-2xl relative text-center my-auto max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setWhatsappSuccessModalOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-20 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Order Registered Successfully!
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              Robux Order #{username} is Queued
            </p>

            {/* Notice: Dynamic depending on WhatsApp service active status */}
            {storeSettings?.whatsapp_service_active ? (
              <div className="my-5 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>WhatsApp CS is Online &amp; Ready</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  We have queued your order and opened WhatsApp chat with our CS. Please send the message in WhatsApp to finalize your payment and receive your Robux immediately!
                </p>
              </div>
            ) : (
              <div className="my-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>System Notice:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Our admin team is <strong>currently not servicing WhatsApp</strong>. For fastest fulfillment, we strongly recommend using <strong>Via Website</strong> checkout so your Robux is processed automatically without waiting!
                </p>
              </div>
            )}

            {/* Order Details */}
            <div className="p-4 rounded-xl bg-[#060c09] border border-emerald-950 text-xs text-left space-y-2 mb-6">
              <div className="flex justify-between text-zinc-400">
                <span>Username:</span>
                <span className="text-white font-bold">@{username}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Robux Package:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedPackage?.amount.toLocaleString()} Robux
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total:</span>
                <span className="text-orange-400 font-bold">
                  RM {selectedPackage?.priceMYR}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {storeSettings?.whatsapp_service_active ? (
                <>
                  <a
                    href={getWhatsappOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp Chat Again</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappSuccessModalOpen(false);
                      setSelectedChannel("website");
                      setWebsiteModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition"
                  >
                    Or Pay via Website (Automated)
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setWhatsappSuccessModalOpen(false);
                    setSelectedChannel("website");
                    setWebsiteModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs sm:text-sm shadow-md hover:from-orange-400 hover:to-red-500 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Switch to Website Checkout (Instant Process)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setWhatsappSuccessModalOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: MODAL SUKSES METODE VIA WEBSITE */}
      {websiteSuccessModalOpen && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1611] border border-emerald-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl relative text-center my-auto max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setWebsiteSuccessModalOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-20 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Success Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Payment Submitted!
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              Your order has been recorded and queued for processing
            </p>

            {/* Order Code Badge */}
            <div className="my-4 p-3 rounded-xl bg-[#060c09] border border-emerald-900/60 flex items-center justify-between gap-2">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                  Order Code
                </span>
                <span className="text-sm font-black text-white font-mono tracking-wider">
                  {completedOrder.orderCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(completedOrder.orderCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Order Summary Card */}
            <div className="p-4 rounded-xl bg-[#060c09] border border-emerald-950 text-xs text-left space-y-2.5 mb-5">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Account:</span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  {completedOrder.avatarUrl && (
                    <img
                      src={completedOrder.avatarUrl}
                      alt={completedOrder.username}
                      className="w-5 h-5 rounded-full border border-emerald-500/30 object-cover"
                    />
                  )}
                  @{completedOrder.username}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Package:</span>
                <span className="text-emerald-400 font-bold">
                  {completedOrder.robux.toLocaleString()} Robux
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total Amount:</span>
                <span className="text-orange-400 font-bold">
                  RM {completedOrder.price}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment Method:</span>
                <span className="text-zinc-200 font-medium">
                  Website (DuitNow QR)
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Status:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
                  Awaiting Verification
                </span>
              </div>
            </div>

            {/* Info notice */}
            <p className="text-[11px] text-zinc-400 mb-5 leading-relaxed">
              We opened WhatsApp in a new tab with your order confirmation. If the chat window didn&apos;t open, tap the button below to send your receipt to our CS admin.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <a
                href={`https://wa.me/${storeSettings?.whatsapp_cs ? storeSettings.whatsapp_cs.replace(/\D/g, "") : "60123456789"}?text=${encodeURIComponent(
                  `*PAYMENT CONFIRMATION VIA WEBSITE - ZONABLOX MALAYSIA*\n\n` +
                    `Hello Admin ZonaBlox, I have completed the transfer and attached my payment receipt on the website:\n\n` +
                    `• *Order Code*: ${completedOrder.orderCode}\n` +
                    `• *Roblox Username*: ${completedOrder.username}\n` +
                    `• *Robux Package*: ${completedOrder.robux.toLocaleString()} Robux\n` +
                    `• *Total Amount*: RM ${completedOrder.price}\n` +
                    `• *Payment Method*: Website Checkout (DuitNow QR / FPX)\n` +
                    `• *Buyer WhatsApp*: ${completedOrder.whatsapp}\n\n` +
                    `Please process the Robux top-up to my Roblox account. Thank you!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setWebsiteSuccessModalOpen(false);
                  setUsername("");
                  setUserVerified(false);
                  setRobloxUser(null);
                  setReceiptFile(null);
                  setReceiptPreview(null);
                }}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
              >
                Done / Place Another Order
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
