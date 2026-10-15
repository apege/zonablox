"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Sparkles,
  Lock,
  Check,
  Zap,
  X,
  Search,
  Edit2,
} from "lucide-react";
import { AdminOrder } from "@/app/data/adminOrdersData";

interface IdActivationViewProps {
  orders?: AdminOrder[];
  prefilledUsername?: string | null;
  currency: "MYR" | "IDR";
  onToast: (
    title: string,
    desc: string,
    type?: "success" | "info" | "warning"
  ) => void;
  onClearPrefill?: () => void;
}

export default function IdActivationView({
  orders = [],
  prefilledUsername,
  currency,
  onToast,
  onClearPrefill,
}: IdActivationViewProps) {
  // Input username
  const [usernameInput, setUsernameInput] = useState<string>(
    prefilledUsername ? prefilledUsername.replace(/^@/, "") : "erewfrwfw"
  );

  // Current activation status for the input username
  const [isActive, setIsActive] = useState<boolean>(false);
  const [feeAmount, setFeeAmount] = useState<number>(100000);
  const [feeCurrency, setFeeCurrency] = useState<string>("IDR");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  // Success Toast Banner at top of card (as in screenshot 3)
  const [topToastMessage, setTopToastMessage] = useState<string | null>(null);

  // Quick edit fee modal/state
  const [isEditingFee, setIsEditingFee] = useState<boolean>(false);
  const [tempFee, setTempFee] = useState<string>("100000");

  // Load status for current username
  const checkUsernameStatus = async (user: string) => {
    const clean = user.trim().replace(/^@/, "");
    if (!clean) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/activations?username=${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setIsActive(Boolean(json.data.is_active));
        setFeeAmount(Number(json.data.fee_amount) || 100000);
        setFeeCurrency(json.data.currency || "IDR");
        setTempFee(String(json.data.fee_amount || 100000));
        setNotes(json.data.notes || "");
      } else {
        setIsActive(false);
      }
    } catch {
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const targetUser = prefilledUsername ? prefilledUsername.replace(/^@/, "") : usernameInput;
    if (targetUser) {
      setUsernameInput(targetUser);
      checkUsernameStatus(targetUser);
    }
    if (onClearPrefill) onClearPrefill();
  }, [prefilledUsername]);

  // Handle Form Submit / Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkUsernameStatus(usernameInput);
  };

  // Handle Activate Confirmation
  const handleConfirmActivate = async () => {
    const clean = usernameInput.trim().replace(/^@/, "");
    if (!clean) return;

    setIsSaving(true);
    setConfirmModalOpen(false);

    try {
      const res = await fetch("/api/activations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roblox_username: clean,
          is_active: true,
          fee_amount: feeAmount,
          currency: feeCurrency,
          notes: notes || "Activated via Admin Panel",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsActive(true);
        setTopToastMessage(`ID @${clean} BERHASIL DIAKTIFKAN!`);
        onToast("ID Diaktifkan", `ID @${clean} telah berhasil diaktifkan.`, "success");
      } else {
        onToast("Gagal Mengaktifkan", json.error || "Terjadi kesalahan.", "warning");
      }
    } catch (err: any) {
      onToast("Error", err.message || "Gagal menghubungi server.", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Deactivate Toggle
  const handleToggleDeactivate = async () => {
    const clean = usernameInput.trim().replace(/^@/, "");
    if (!clean) return;

    if (!confirm(`Nonaktifkan ID @${clean}? Order untuk akun ini akan kembali memerlukan aktivasi.`)) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/activations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roblox_username: clean,
          is_active: false,
          fee_amount: feeAmount,
          currency: feeCurrency,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsActive(false);
        setTopToastMessage(null);
        onToast("ID Dinonaktifkan", `Status ID @${clean} berhasil dinonaktifkan.`, "info");
      }
    } catch {
      onToast("Error", "Gagal menonaktifkan ID.", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  // Save new fee amount
  const handleSaveFee = () => {
    const parsed = parseFloat(tempFee.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed) && parsed >= 0) {
      setFeeAmount(parsed);
      setIsEditingFee(false);
      onToast("Biaya Diperbarui", `Biaya pengaktifan diubah menjadi ${formatFeeDisplay(parsed, feeCurrency)}`, "success");
    }
  };

  // Format fee display
  const formatFeeDisplay = (amount: number, curr: string = feeCurrency) => {
    if (curr === "IDR") {
      return `Rp ${amount.toLocaleString("id-ID")}`;
    }
    return `RM ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const cleanUser = usernameInput.trim().replace(/^@/, "");

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto py-2">
      {/* 1. Top Toast Notification (as seen in Image 3) */}
      {topToastMessage && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 px-5 py-3.5 flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.15)] text-emerald-300 font-bold text-sm tracking-wide">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-md">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span>{topToastMessage}</span>
          </div>
          <button
            onClick={() => setTopToastMessage(null)}
            className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Main Activation Card (Matching Client Screenshot Layout & ZonaBlox Theme) */}
      <div
        className={`rounded-3xl p-6 sm:p-10 border transition-all duration-300 relative overflow-hidden shadow-2xl ${
          isActive
            ? "bg-gradient-to-b from-[#091a13] to-[#06100b] border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
            : "bg-gradient-to-b from-[#141208] to-[#0a0904] border-amber-500/35 shadow-[0_0_40px_rgba(245,158,11,0.12)]"
        }`}
      >
        {/* Subtle Ambient Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none ${
            isActive ? "bg-emerald-500/15" : "bg-amber-500/15"
          }`}
        />

        {/* Top Status Pill Badge */}
        <div className="flex justify-center mb-4 relative z-10">
          {isActive ? (
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Sparkles className="w-4 h-4" />
              <span>STATUS TERAKTIVASI</span>
              <Sparkles className="w-4 h-4" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <AlertTriangle className="w-4 h-4" />
              <span>PERINGATAN SISTEM</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Title Heading */}
        <h2
          className={`text-2xl sm:text-4xl font-mono font-black text-center tracking-widest uppercase mb-8 transition-colors ${
            isActive
              ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"
              : "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.25)]"
          }`}
        >
          {isActive ? "ID ROBLOX SUDAH AKTIF" : "ID ROBLOX BELUM AKTIF"}
        </h2>

        {/* Username Row with Autocomplete & Search */}
        <div className="flex justify-center mb-8 relative z-10">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl"
          >
            <span className="text-zinc-400 font-black text-xs sm:text-sm tracking-wider uppercase shrink-0">
              USERNAME :
            </span>

            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 font-bold text-sm">
                @
              </div>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.replace(/^@/, ""))}
                placeholder="masukkan username roblox..."
                className="w-full pl-8 pr-12 py-3 rounded-full bg-[#060c09] border border-emerald-500/40 text-white font-mono font-bold text-sm sm:text-base placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner transition"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute inset-y-1.5 right-1.5 px-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Cek status username"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cek</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2-Column Info Grid (Layout Identical to Screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
          {/* Left Box: Aktivasi Diperlukan / Berhasil Teraktivasi (Spans 2 cols) */}
          <div
            className={`md:col-span-2 rounded-2xl p-5 sm:p-6 border flex items-start gap-4 transition-all ${
              isActive
                ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                : "bg-amber-500/5 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
            }`}
          >
            {/* Rounded Square Icon Badge */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isActive
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              }`}
            >
              {isActive ? (
                <Check className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Lock className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>

            {/* Texts */}
            <div className="space-y-1.5">
              <h3
                className={`font-black text-sm tracking-wider uppercase ${
                  isActive ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isActive ? "ID BERHASIL TERAKTIVASI" : "AKTIVASI DIPERLUKAN"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {isActive ? (
                  <>
                    ID Roblox pada order akun{" "}
                    <span className="font-bold text-emerald-300">
                      @{cleanUser || "username"}
                    </span>{" "}
                    telah aktif dan terverifikasi legal. Transaksi pengiriman Robux dapat segera
                    dilanjutkan.
                  </>
                ) : (
                  <>
                    ID Roblox pada order akun{" "}
                    <span className="font-bold text-amber-300">
                      @{cleanUser || "username"}
                    </span>{" "}
                    belum aktif di server. Silakan aktifkan ID terlebih dahulu untuk melanjutkan proses
                    pengiriman Robux.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Box: Biaya Pengaktifan ID (Spans 1 col) */}
          <div className="rounded-2xl p-5 sm:p-6 bg-[#060c09]/90 border border-emerald-500/20 flex flex-col justify-center items-center text-center relative group">
            <span className="text-[11px] font-black text-zinc-400 tracking-wider uppercase mb-2">
              BIAYA PENGAKTIFAN ID
            </span>

            {isEditingFee ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempFee}
                  onChange={(e) => setTempFee(e.target.value)}
                  className="w-28 px-2 py-1 rounded bg-zinc-800 border border-amber-400 text-amber-400 font-mono font-bold text-center text-sm focus:outline-none"
                />
                <button
                  onClick={handleSaveFee}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-tight drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                  {formatFeeDisplay(feeAmount, feeCurrency)}
                </span>
                <button
                  onClick={() => setIsEditingFee(true)}
                  className="opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-white p-1 cursor-pointer"
                  title="Ubah nominal biaya"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Catatan Admin Bar */}
        <div className="rounded-2xl p-4 bg-[#060c09]/80 border border-emerald-500/20 flex items-center gap-3 text-xs sm:text-sm text-zinc-300 mb-8 relative z-10">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Catatan Admin:</strong> Setelah ID{" "}
            <span className="font-bold text-amber-300">@{cleanUser || "username"}</span> diaktifkan,
            order dapat langsung diproses seperti biasa.
          </span>
        </div>

        {/* Primary Action Button (Big Full-Width at Bottom) */}
        <div className="relative z-10">
          {isActive ? (
            <button
              onClick={handleToggleDeactivate}
              disabled={isSaving}
              className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.45)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>
                ✓ ID @{cleanUser.toUpperCase() || "USERNAME"} SUDAH AKTIF (KLIK UNTUK NONAKTIFKAN)
              </span>
            </button>
          ) : (
            <button
              onClick={() => setConfirmModalOpen(true)}
              disabled={isSaving || !cleanUser}
              className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-black font-mono font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_45px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>
                AKTIFKAN ID @{cleanUser.toUpperCase() || "USERNAME"} SEKARANG
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Confirmation Popup Modal (Image 2) */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1711] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Top Lightning Badge */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              <Zap className="w-8 h-8 fill-current" />
            </div>

            {/* Modal Heading & Description */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Konfirmasi Pengaktifan ID
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed px-2">
                Lakukan pengaktifan ID Roblox untuk akun{" "}
                <span className="font-bold text-amber-400">@{cleanUser}</span> dengan biaya{" "}
                <strong className="text-white font-mono">
                  {formatFeeDisplay(feeAmount, feeCurrency)}
                </strong>
                ?
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="py-3 px-4 rounded-xl border border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-sm transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmActivate}
                disabled={isSaving}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-black font-black text-sm transition shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 cursor-pointer"
              >
                {isSaving ? "Memproses..." : "Ya, Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
