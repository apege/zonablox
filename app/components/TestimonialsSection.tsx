"use client";

import { useState } from "react";
import Image from "next/image";
import { TESTIMONIALS } from "../data/robuxData";
import { Star, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 2 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= TESTIMONIALS.length - 2 ? 0 : prev + 1
    );
  };

  return (
    <section id="testimonials" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Real Customer Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                Customers Say
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl">
              Thousands of players across Malaysia count on ZonaBlox every single day for their Robux top-ups.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              aria-label="Previous testimonial"
              className="w-11 h-11 rounded-2xl bg-[#0b1410] border border-emerald-500/30 text-zinc-300 hover:text-white hover:border-emerald-400 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next testimonial"
              className="w-11 h-11 rounded-2xl bg-[#0b1410] border border-emerald-500/30 text-zinc-300 hover:text-white hover:border-emerald-400 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid (Show 2 Cards side by side like VietBlox layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.slice(currentIndex, currentIndex + 2).map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-[#0b1410]/95 border border-emerald-500/25 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all hover:border-emerald-400/50"
            >
              <div>
                {/* Header Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-emerald-500/40">
                      <Image
                        src={item.avatar}
                        alt={item.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm sm:text-base">
                        {item.username}
                      </h4>
                      <p className="text-xs text-zinc-400">{item.handle}</p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-zinc-300 leading-relaxed italic mb-6">
                  &ldquo;{item.comment}&rdquo;
                </p>

                {/* Admin Reply Box (inspired by VietBlox admin reply pill) */}
                <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/25 p-4 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ZonaBlox Admin Reply:</span>
                  </div>
                  <p className="text-xs text-emerald-200">
                    &ldquo;{item.adminReply}&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom Order Badge */}
              <div className="pt-4 border-t border-emerald-950/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                    <div className="relative w-4 h-4">
                      <Image src="/robux.webp" alt="Robux" fill className="object-contain" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Package:</span>
                    <span className="text-xs font-extrabold text-white">
                      +{item.robuxAmount.toLocaleString()} Robux
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400">
                  {item.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(TESTIMONIALS.length / 2) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * 2)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex / 2 === idx
                  ? "w-8 bg-orange-500"
                  : "w-2 bg-emerald-950"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
