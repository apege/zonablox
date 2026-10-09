"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function HowToOrderSection() {
  return (
    <section id="how-to-order" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>Simple 3-Step Guide</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              How to Order at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                ZonaBlox
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl">
              Easy, lightning fast, and totally hassle-free for all Roblox players across Malaysia.
            </p>
          </div>

          <Link
            href="#topup-section"
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 group cursor-pointer"
          >
            <span>Start Your Order Now</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3 Step Cards Layout (similar to VietBlox layout structure, but customized) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="relative rounded-3xl bg-[#0b1410]/90 border border-emerald-500/25 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-400/50 transition-all group shadow-xl">
            <div>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white font-extrabold text-base flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.5)]">
                  1
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                  Instant Lookup
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                Enter Roblox Username
              </h3>
              <p className="text-xs text-orange-400 font-medium mb-3">
                No password or account login required.
              </p>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Simply type your Roblox handle. Our system will verify your profile instantly to ensure 100% accuracy.
              </p>
            </div>

            {/* UI Mockup Element */}
            <div className="rounded-2xl bg-[#060c09] border border-emerald-900/40 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-emerald-500/30">
                  <Image src="/logo.jpg" alt="Player" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">GamerPro_MY</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Roblox Account Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative rounded-3xl bg-[#0b1410]/90 border border-emerald-500/25 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-400/50 transition-all group shadow-xl">
            <div>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white font-extrabold text-base flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.5)]">
                  2
                </div>
                <span className="text-xs font-semibold text-orange-400 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-500/20">
                  Zero Fees
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                Select Nominal & Pay
              </h3>
              <p className="text-xs text-orange-400 font-medium mb-3">
                Use your favorite Malaysian payment methods.
              </p>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Pick any Robux package from 1,800 up to 30,500 Robux and checkout with DuitNow QR or TNG eWallet.
              </p>
            </div>

            {/* UI Mockup Element */}
            <div className="rounded-2xl bg-[#060c09] border border-emerald-900/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-emerald-950/40 text-emerald-300 font-medium border border-emerald-500/20">
                <span className="font-bold">DuitNow QR</span>
                <span className="text-[10px] text-emerald-400">Scan & Pay</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-zinc-900/80 text-zinc-300 font-medium">
                <span className="font-bold">Touch &apos;n Go eWallet</span>
                <span className="text-[10px] text-zinc-400">Instant</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative rounded-3xl bg-[#0b1410]/90 border border-emerald-500/25 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-400/50 transition-all group shadow-xl">
            <div>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white font-extrabold text-base flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.5)]">
                  3
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                  1–5 Mins
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                Robux Received!
              </h3>
              <p className="text-xs text-orange-400 font-medium mb-3">
                Estimated delivery in 1–5 minutes.
              </p>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Sit back and relax! The Robux will appear directly in your Roblox wallet. Safe, legal, and ready to spend.
              </p>
            </div>

            {/* UI Mockup Element */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950/80 to-[#060c09] border border-emerald-500/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Robux Transferred!</span>
                  </div>
                  <div className="text-base font-black text-emerald-400 mt-1">
                    +1,800 Robux
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
