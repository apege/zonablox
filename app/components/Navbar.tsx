"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, Zap, MessageCircle, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0a110e]/85 border-b border-emerald-900/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand: Icon + Editable Text */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(234,88,12,0.3)] border border-emerald-500/30 group-hover:border-orange-500/60 transition-all shrink-0">
              <Image
                src="/logo.jpg"
                alt="ZonaBlox"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight leading-none italic uppercase">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]">
                  ZONA
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  BLOX
                </span>
                <span className="text-orange-500 text-base sm:text-lg not-italic font-bold ml-0.5">
                  .id
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">
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

          {/* Actions & WhatsApp Support CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://wa.me/?text=Hello%20ZonaBlox%2C%20I%20want%20to%20order%20Robux%20Malaysia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-xs uppercase tracking-wider hover:from-emerald-500 hover:to-teal-600 transition-all shadow-[0_0_20px_rgba(5,150,105,0.4)] border border-emerald-400/30 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Admin</span>
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
              href="https://wa.me/?text=Hello%20ZonaBlox%2C%20I%20want%20to%20order%20Robux%20Malaysia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-sm hover:from-emerald-500 hover:to-teal-600"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Admin (24/7)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
