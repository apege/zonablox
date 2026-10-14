"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Heart, Send } from "lucide-react";
import { getStoreSettings } from "@/lib/clientStoreSettings";

export default function Footer() {
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

  const nameParts = storeName.trim().split(" ");
  const firstWord = nameParts[0] || "ZonaBlox";
  const restWords = nameParts.slice(1).join(" ");

  return (
    <footer className="relative bg-[#060c09] border-t border-emerald-900/30 pt-16 pb-12 overflow-hidden text-zinc-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group select-none w-fit">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-emerald-500/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight leading-none italic uppercase">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400">
                    {firstWord}
                  </span>
                  {restWords ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 ml-1.5 not-italic">
                      {restWords}
                    </span>
                  ) : null}
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">
                  Robux Store
                </span>
              </div>
            </Link>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
              {storeName} is the premier, #1 trusted Roblox Robux distributor serving players across Malaysia. Faster delivery, wholesale regional rates, and guaranteed safe transactions without sharing your password.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Malaysia Roblox Community Partner</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#topup-section" className="hover:text-emerald-400 transition-colors">
                  Order Robux
                </Link>
              </li>
              <li>
                <Link href="#how-to-order" className="hover:text-emerald-400 transition-colors">
                  How To Order
                </Link>
              </li>
              <li>
                <Link href="#why-us" className="hover:text-emerald-400 transition-colors">
                  Why Malaysia Region?
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-emerald-400 transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-emerald-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Customer Support
            </h4>
            <p className="text-xs text-zinc-400">
              Need assistance with an ongoing transaction or bulk inquiry? Reach our Malaysian support desk anytime.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`https://t.me/${telegramCS.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all w-fit cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Telegram CS ({telegramCS})</span>
              </a>

              <a
                href={`https://wa.me/${whatsappPhone}?text=Hi%20${encodeURIComponent(storeName)}%2C%20I%20have%20an%20inquiry%20regarding%20Robux%20Malaysia`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 font-medium text-xs transition-all w-fit cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            &copy; 2026 {storeName}. All rights reserved. Zona Malaysia Roblox Community.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Robloxian Malaysia.
          </p>
        </div>
      </div>
    </footer>
  );
}
