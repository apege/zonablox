"use client";

import { X, ExternalLink, Download } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  orderId: string;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  imageUrl,
  orderId,
}: ReceiptModalProps) {
  if (!isOpen || !imageUrl) return null;

  const handleOpenNewTab = () => {
    if (!imageUrl) return;
    if (imageUrl.startsWith("data:")) {
      try {
        const byteString = atob(imageUrl.split(",")[1]);
        const mimeString = imageUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        return;
      } catch {
        // fallback
      }
    }
    window.open(imageUrl, "_blank");
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `Receipt_${orderId}.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0b1410] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-emerald-900/40 bg-[#070e0b] shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Payment Receipt</span>
              <span className="text-orange-400">#{orderId}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Verify customer transfer receipt or transaction proof
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container - Fixed minimum height & natural responsive scaling */}
        <div className="w-full bg-[#050907] flex items-center justify-center p-3 sm:p-6 min-h-[380px] sm:min-h-[520px] max-h-[72vh] overflow-y-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Payment Receipt ${orderId}`}
            className="max-h-[68vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl border border-emerald-950/80"
          />
        </div>

        {/* Footer info */}
        <div className="px-4 sm:px-6 py-3 bg-[#070e0b] border-t border-emerald-900/40 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Format: WebP / JPG / PNG • Secure Upload</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
