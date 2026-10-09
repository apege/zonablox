"use client";

import { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";

export default function TopUpSection() {
  const [username, setUsername] = useState("");
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<RobuxPackage | null>(
    ROBUX_PACKAGES[0] // default to 1800 Robux
  );
  // Selected channel: "website" or "whatsapp"
  const [selectedChannel, setSelectedChannel] = useState<"website" | "whatsapp">("website");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "bestseller" | "vip">("all");

  // Modal states
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [whatsappSuccessModalOpen, setWhatsappSuccessModalOpen] = useState(false);

  const handleCheckUsername = () => {
    if (!username.trim()) return;
    setIsCheckingUser(true);
    // Simulate quick Roblox profile lookup
    setTimeout(() => {
      setIsCheckingUser(false);
      setUserVerified(true);
    }, 600);
  };

  const filteredPackages = ROBUX_PACKAGES.filter((pkg) => {
    if (filterTab === "all") return true;
    return pkg.category === filterTab;
  });

  const handleCheckout = () => {
    if (!username.trim()) {
      alert("Please enter your Roblox username first!");
      return;
    }
    if (!selectedPackage) {
      alert("Please select a Robux package!");
      return;
    }

    if (selectedChannel === "website") {
      // Buka popup pembayaran via website untuk upload bukti transfer
      setReceiptFile(null);
      setReceiptPreview(null);
      setUploadError("");
      setWebsiteModalOpen(true);
    } else {
      // Mode via WhatsApp: Tampilkan pop up sukses
      setWhatsappSuccessModalOpen(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload an image file (JPG, PNG, WEBP).");
        return;
      }
      setReceiptFile(file);
      setUploadError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmWebsitePayment = () => {
    if (!receiptFile) {
      setUploadError("Payment receipt is required! Please upload your transfer screenshot.");
      return;
    }

    // Automatically redirect to WhatsApp admin to confirm payment receipt
    const message = encodeURIComponent(
      `*PAYMENT CONFIRMATION VIA WEBSITE - ZONABLOX MALAYSIA*\n\n` +
        `Hello Admin ZonaBlox, I have completed the transfer and attached my payment receipt on the website:\n\n` +
        `• *Roblox Username*: ${username}\n` +
        `• *Robux Package*: ${selectedPackage?.amount.toLocaleString()} Robux\n` +
        `• *Total Amount*: RM ${selectedPackage?.priceMYR}\n` +
        `• *Payment Method*: Website Checkout (DuitNow QR / FPX)\n` +
        `• *Buyer WhatsApp*: ${whatsappNumber ? `+60${whatsappNumber}` : "-"}\n` +
        `• *Payment Receipt*: Attached / Uploaded (${receiptFile.name})\n\n` +
        `Please process the Robux top-up to my Roblox account. Thank you!`
    );

    setWebsiteModalOpen(false);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const copyPaymentInfo = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
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

            {/* Username status banner */}
            {userVerified ? (
              <div className="mt-3 w-full px-4 py-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Username <strong>@{username}</strong> verified and ready for delivery!
                </span>
              </div>
            ) : (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-400">
                <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Make sure your username spelling is correct before continuing.</span>
              </div>
            )}
          </div>

          {/* Step 2: Choose Robux Package */}
          <div className="mb-10 pb-8 border-b border-emerald-950/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                  2
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Choose Robux Package
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060c09] border border-emerald-900/40 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === "all"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All Packages
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("bestseller")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    filterTab === "bestseller"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Best Seller
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("vip")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    filterTab === "vip"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  VIP Tier
                </button>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 border text-center flex flex-col justify-between select-none ${
                      isSelected
                        ? "bg-gradient-to-b from-[#14261d] to-[#0a1610] border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.35)] scale-102 ring-2 ring-orange-500/50"
                        : "bg-[#070e0b]/80 border-emerald-900/40 hover:border-emerald-500/50 hover:bg-[#0d1a13]"
                    }`}
                  >
                    {/* Badge */}
                    {pkg.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                        Popular 🔥
                      </span>
                    )}
                    {pkg.vip && !pkg.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                        VIP 👑
                      </span>
                    )}

                    <div>
                      {/* Robux Coin Icon */}
                      <div className="relative w-10 h-10 mx-auto my-2 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                        <Image
                          src="/robux.webp"
                          alt="Robux"
                          fill
                          className="object-contain"
                        />
                      </div>

                      {/* Robux Amount */}
                      <div className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {pkg.amount.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-400">
                        ROBUX
                      </div>
                    </div>

                    {/* Price in MYR */}
                    <div className="mt-4 pt-3 border-t border-emerald-950/80">
                      <div className="text-base sm:text-lg font-black text-white">
                        <span className="text-xs text-orange-400 font-bold mr-0.5">
                          RM
                        </span>
                        {pkg.priceMYR}
                      </div>
                    </div>

                    {/* Active Check Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

                  {/* Notice: Currently not servicing whatsapp */}
                  <div className="px-3 py-2 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span className="font-semibold">Currently not servicing WhatsApp</span>
                  </div>
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
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  WhatsApp Number (For Order Receipt & Updates)
                </label>
                <div className="flex gap-2">
                  <span className="px-3.5 py-3.5 rounded-xl bg-[#060c09] border border-emerald-800/40 text-emerald-400 font-bold text-sm flex items-center">
                    +60
                  </span>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="12-3456789"
                    className="flex-1 px-4 py-3.5 rounded-xl bg-[#060c09] border border-emerald-800/40 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-zinc-500 text-sm font-medium outline-none transition-all"
                  />
                </div>
                <p className="mt-2 text-[11px] text-zinc-400">
                  Optional but recommended for rapid order confirmation and priority live chat support.
                </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1611] border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setWebsiteModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Website Checkout & Payment
                </h3>
                <p className="text-xs text-zinc-400">
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
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 mb-5 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  DuitNow QR / Malaysian Banks
                </span>
                <button
                  type="button"
                  onClick={() => copyPaymentInfo("112233445566")}
                  className="inline-flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedAccount ? "Copied!" : "Copy Account No."}</span>
                </button>
              </div>
              <p className="text-zinc-300 text-[11px]">
                Please scan DuitNow QR or transfer <strong>RM {selectedPackage?.priceMYR}</strong> to ZonaBlox official account, then screenshot your transfer receipt.
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
                      JPG, PNG, or WEBP supported
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
                onClick={handleConfirmWebsitePayment}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm text-center shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Submit & Confirm WA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: MODAL SUKSES METODE VIA WHATSAPP */}
      {whatsappSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b1611] border border-orange-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
            {/* Close Button */}
            <button
              onClick={() => setWhatsappSuccessModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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

            {/* Notice: Currently not servicing whatsapp */}
            <div className="my-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>System Notice:</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Our admin team is <strong>currently not servicing WhatsApp</strong>. For fastest fulfillment, we strongly recommend using <strong>Via Website</strong> checkout so your Robux is processed automatically without waiting!
              </p>
            </div>

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

              <button
                type="button"
                onClick={() => setWhatsappSuccessModalOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
