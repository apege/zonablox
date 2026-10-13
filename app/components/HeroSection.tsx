"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, ShieldCheck, Users, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { getStoreSettings, StoreSettingsData } from "@/lib/clientStoreSettings";

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5 fill-amber-400/20" />,
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    borderHover: "hover:border-emerald-500/40",
    title: "Instant Delivery",
    desc: "Average 1–3 mins",
  },
  {
    icon: <span className="text-base font-black">RM</span>,
    iconBg: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    borderHover: "hover:border-orange-500/40",
    title: "Cheaper Prices",
    desc: "Direct regional rates",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    borderHover: "hover:border-emerald-500/40",
    title: "100% Safe",
    desc: "No password required",
  },
  {
    icon: <Users className="w-5 h-5" />,
    iconBg: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    borderHover: "hover:border-teal-500/40",
    title: "24/7 CS Support",
    desc: "Always ready to assist",
  },
];

export default function HeroSection() {
  const [storeSettings, setStoreSettings] = useState<StoreSettingsData | null>(null);

  useEffect(() => {
    getStoreSettings().then((data) => {
      if (data) {
        setStoreSettings(data);
      }
    });
  }, []);
  return (
    <section className="relative overflow-hidden pt-6 pb-16 md:pt-10 md:pb-24">
      {/* Background Glow Orbs */}
      <div className="absolute top-10 left-1/4 -z-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 -z-10 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-40 bg-radial from-emerald-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Card with Custom Generated 3D Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-[#0c1611]/90 via-[#060e0a]/95 to-[#0b1410] shadow-[0_20px_60px_-15px_rgba(4,120,87,0.35)]">
          {/* Banner Graphic Background - Responsive Mobile & Desktop Layout */}
          <div className="absolute inset-0 z-0">
            {/* Mobile (sm:hidden): Dedicated 9:16 portrait banner designed for mobile screens */}
            <div className="block sm:hidden absolute inset-0">
              <Image
                src="/hero_banner_mobile.jpg"
                alt="ZonaBlox Robux Malaysia Promo Mobile"
                fill
                priority
                className="object-cover object-top opacity-40 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#060f0a]/30 via-[#060f0a]/70 to-[#060f0a]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060f0a] via-[#060f0a]/80 to-transparent" />
            </div>

            {/* Desktop (hidden sm:block): 16:9 widescreen landscape banner with character on the right */}
            <div className="hidden sm:block absolute inset-0">
              <Image
                src="/hero_banner_custom.jpg"
                alt="ZonaBlox Robux Malaysia Promo"
                fill
                priority
                className="object-cover object-center opacity-40 mix-blend-screen scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060f0a] via-[#060f0a]/90 to-transparent sm:to-[#060f0a]/40" />
            </div>
          </div>

          {/* Banner Inner Content */}
          <div className="relative z-10 px-4 py-8 sm:px-12 sm:py-16 md:py-20 lg:py-24 max-w-3xl">
            {/* Top Verified Badge: Authentic Malaysia Flag & ZonaBlox Theme */}
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-sm font-bold shadow-[0_4px_16px_rgba(4,120,87,0.3)]">
                <span className="text-sm sm:text-base leading-none">🇲🇾</span>
                <span>Official Distributor • Malaysia Region</span>
              </div>

              {/* Dynamic Flash Sale Ribbon from Neon store_settings */}
              {storeSettings?.promo_active && (
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-orange-600/30 to-amber-600/20 border border-orange-500/40 text-orange-200 text-[11px] sm:text-xs font-semibold backdrop-blur-md animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="font-extrabold uppercase text-amber-300 tracking-wide">
                    {storeSettings.promo_headline || "FLASH SALE"}
                  </span>
                  {storeSettings.promo_package && (
                    <span className="bg-orange-500/30 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {storeSettings.promo_package}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.2] sm:leading-[1.15]">
              Top Up Robux{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 drop-shadow-[0_2px_15px_rgba(249,115,22,0.4)]">
                More Affordable,
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Instant Process!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-3 sm:mt-6 text-xs sm:text-base lg:text-lg text-zinc-300 font-normal leading-relaxed max-w-xl">
              Robux delivered straight to your account with only your Roblox Username. No password needed, safe from bans, fast 1–5 minute delivery, and best rates for players in Malaysia!
            </p>

            {/* Trust Highlights Pills */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-sm font-medium">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>1–5 Minutes Average</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-teal-950/70 border border-teal-500/30 text-teal-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>100% Legal & Safe</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-orange-950/70 border border-orange-500/30 text-orange-300">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span>10,000+ Happy Gamers</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="#topup-section"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(249,115,22,0.45)] hover:shadow-[0_0_35px_rgba(249,115,22,0.65)] hover:scale-102 active:scale-98 transition-all group"
              >
                <span>Top Up Robux Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-to-order"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-emerald-500/30 hover:border-emerald-400/50 font-semibold text-xs sm:text-sm transition-all"
              >
                <span>See How It Works</span>
              </Link>
            </div>

            {/* Social Proof Mini Bar */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-emerald-950/60 flex items-center gap-3">
              <div className="flex -space-x-1.5 sm:-space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-900 bg-orange-600 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                  MY
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-900 bg-emerald-600 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                  KL
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-900 bg-teal-600 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                  JB
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-tight">
                <strong className="text-emerald-400 font-semibold">500+ orders</strong> processed today in Malaysia!
              </p>
            </div>
          </div>
        </div>

        {/* Feature Value Props Strip - Mobile Continuous Auto Slider & Desktop 4-Col Grid */}
        {/* Mobile View: Continuous Infinite Auto-Moving Marquee Slider */}
        <div className="mt-5 block md:hidden overflow-hidden relative [mask-image:_linear-gradient(to_right,transparent_0,_black_16px,_black_calc(100%-16px),transparent_100%)]">
          <div className="animate-marquee flex gap-3">
            {[...FEATURES, ...FEATURES].map((feat, idx) => (
              <div
                key={idx}
                className="w-[230px] shrink-0 p-3.5 rounded-2xl bg-gradient-to-r from-[#0d1712] via-[#09130e] to-[#0d1712] border border-emerald-500/30 flex items-center gap-3 shadow-md select-none"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${feat.iconBg}`}
                >
                  {feat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white text-xs font-bold tracking-tight truncate">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View: 4-Column Grid */}
        <div className="mt-6 hidden md:grid md:grid-cols-4 gap-4">
          {FEATURES.map((feat, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl bg-[#0d1712]/80 border border-emerald-900/40 ${feat.borderHover} transition-all flex items-center gap-3.5 shadow-sm group`}
            >
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center ${feat.iconBg} group-hover:scale-110 transition-transform shrink-0`}
              >
                {feat.icon}
              </div>
              <div>
                <h4 className="text-white text-xs sm:text-sm font-bold">{feat.title}</h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
