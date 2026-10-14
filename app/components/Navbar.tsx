"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShieldCheck, Zap, MessageCircle, Menu, X, Send } from "lucide-react";
import { getStoreSettings } from "@/lib/clientStoreSettings";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeName, setStoreName] = useState("ZonaBlox Malaysia");
  const [storeLogo, setStoreLogo] = useState("/logo.jpg");
  const [whatsappPhone, setWhatsappPhone] = useState("60123456789");
  const [telegramCS, setTelegramCS] = useState("@zonabloxmy");

  useEffect(() => {
    getStoreSettings().then((data) => {
      if (data) {
        if (data.store_name) setStoreName(data.store_name);
        if (data.store_logo) setStoreLogo(data.store_logo);
        if (data.whatsapp_cs) {
          setWhatsappPhone(data.whatsapp_cs.replace(/\D/g, ""));
        }
        if (data.telegram_cs) {
          setTelegramCS(data.telegram_cs);
        }
      }
    });
  }, []);

  // Split store name for two-tone gradient branding
  const nameParts = storeName.trim().split(" ");
  const firstWord = nameParts[0] || "ZonaBlox";
  const restWords = nameParts.slice(1).join(" ");

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0a110e]/90 border-b border-emerald-900/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand: Icon + Dynamic Editable Text */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-emerald-500/30 group-hover:border-orange-500/60 transition-all shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storeLogo}
                alt={storeName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-black tracking-tight leading-none italic uppercase">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]">
                  {firstWord}
                </span>
                {restWords ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 ml-1.5 not-italic">
                    {restWords}
                  </span>
                ) : null}
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">
                Robux Store
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="#topup-section"
              className="text-zinc-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              Order Robux
            </Link>
            <Link
              href="#how-to-order"
              className="text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#why-us"
              className="text-zinc-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Why Malaysia Region?
            </Link>
            <Link
              href="#testimonials"
              className="text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Actions & Customer Support CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://t.me/${telegramCS.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold text-xs uppercase tracking-wider hover:from-sky-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(14,165,233,0.35)] border border-sky-400/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Telegram CS ({telegramCS})</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-emerald-900/40 bg-[#070e0b]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            href="#topup-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-emerald-950/50 hover:text-emerald-300 font-medium text-sm"
          >
            Order Robux
          </Link>
          <Link
            href="#how-to-order"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-emerald-950/50 hover:text-emerald-300 font-medium text-sm"
          >
            How It Works
          </Link>
          <Link
            href="#why-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-emerald-950/50 hover:text-emerald-300 font-medium text-sm"
          >
            Why Malaysia Region?
          </Link>
          <Link
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-emerald-950/50 hover:text-emerald-300 font-medium text-sm"
          >
            Testimonials
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-emerald-950/50 hover:text-emerald-300 font-medium text-sm"
          >
            FAQ
          </Link>

          <div className="pt-2">
            <a
              href={`https://t.me/${telegramCS.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm hover:from-sky-400 hover:to-blue-500 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Telegram CS ({telegramCS})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
