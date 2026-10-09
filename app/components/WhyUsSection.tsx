"use client";

import Link from "next/link";
import { Check, Award, ArrowRight } from "lucide-react";

export default function WhyUsSection() {
  return (
    <section id="why-us" className="relative py-16 sm:py-24">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 -z-10 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Explanatory Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Malaysia Region Special Pricing</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Why Is Robux at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                ZonaBlox
              </span>{" "}
              Way More Affordable?
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Standard in-game Roblox rates often charge hefty app store transaction taxes (up to 30%). At <strong>ZonaBlox Malaysia</strong>, we leverage authorized regional developer channels and volume exchange partner programs to offer genuine Robux at wholesale rates directly in Malaysian Ringgit (MYR).
            </p>

            {/* Benefit Checkpoints */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">100% Legal & Legitimate Source</h4>
                  <p className="text-xs text-zinc-400">All Robux are verified and safe. No carding, no black market, and zero risk of account ban.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">Zero Password Policy</h4>
                  <p className="text-xs text-zinc-400">We never request your password, 2FA codes, or cookie data. Only your public username is needed.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">Local Currency (MYR) - No Hidden Conversion Fees</h4>
                  <p className="text-xs text-zinc-400">What you see is what you pay. No foreign exchange markups or international card surcharges.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="#topup-section"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(5,150,105,0.4)] transition-all cursor-pointer"
              >
                <span>Check Robux Price List</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Statistics & Visual Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Top Stat Card: 10K+ Orders & Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-[#0b1410]/90 border border-emerald-500/25 shadow-xl text-center">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  10,000+
                </div>
                <div className="text-xs font-semibold text-zinc-300 mt-1">
                  Orders Completed
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  Across Malaysia
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#0b1410]/90 border border-emerald-500/25 shadow-xl text-center">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  4.95 / 5.0
                </div>
                <div className="text-xs font-semibold text-zinc-300 mt-1">
                  Customer Rating
                </div>
                <div className="text-[11px] text-amber-400 mt-0.5">
                  ⭐⭐⭐⭐⭐ Verified
                </div>
              </div>
            </div>

            {/* Bottom Stat Card: 24/7 Fast Support */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1611] to-[#060c09] border border-orange-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30">
                  Fast Support Guarantee
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>

              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                24/7 Instant Response
              </div>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Got a question regarding your order? Our friendly Malaysian customer care team is available around the clock via WhatsApp.
              </p>

              <div className="mt-6 pt-4 border-t border-emerald-950/80 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                <span>Average Response Time:</span>
                <span className="text-emerald-400 font-bold">&lt; 2 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
