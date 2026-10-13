"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Home,
  MessageSquare,
} from "lucide-react";

interface OrderReviewData {
  order_code: string;
  roblox_username: string;
  roblox_avatar_url: string | null;
  robux: number;
  price: number;
}

interface ExistingReview {
  id: string;
  rating: number;
  message: string;
  created_at: string;
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderReviewData | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No review token provided. Please check the review link sent by our admin team.");
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/testimonials/verify-token?token=${encodeURIComponent(token)}`);
        const json = await res.json();

        if (!json.success) {
          setError(json.error || "Invalid or expired review link.");
          return;
        }

        setOrder(json.order);
        setAlreadyReviewed(Boolean(json.already_reviewed));
        if (json.review) {
          setExistingReview(json.review);
        }
      } catch {
        setError("Could not connect to the verification server. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setSubmitError("Please write a short review or feedback message.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          message: message.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        setSubmitError(json.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setSubmitError("Network error while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return "⭐⭐⭐⭐⭐ Outstanding & Super Fast! ⚡";
      case 4:
        return "⭐⭐⭐⭐ Great Experience!";
      case 3:
        return "⭐⭐⭐ Good Service";
      case 2:
        return "⭐⭐ Needs Improvement";
      case 1:
        return "⭐ Unsatisfied";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#070e0b] text-zinc-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white font-sans antialiased">
      {/* Background visual glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-600/15 via-orange-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar Header */}
      <header className="border-b border-emerald-950/80 bg-[#070e0b]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Image src="/logo.jpg" alt="ZonaBlox Logo" fill className="object-cover" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                ZONABLOX
              </span>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest ml-1">
                REVIEW
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-emerald-900/40 text-xs font-semibold text-zinc-300 hover:text-white hover:border-emerald-500/50 transition-all"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Storefront</span>
          </Link>
        </div>
      </header>

      {/* Main Review Form Card */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {loading ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0b1611] border border-emerald-500/20 text-center space-y-4 shadow-2xl">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">Verifying Review Token...</h3>
            <p className="text-xs text-zinc-400">
              Validating your completed order with ZonaBlox secure order servers.
            </p>
          </div>
        ) : error ? (
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0b1611] border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Review Link Invalid</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:scale-101 transition-all"
              >
                <span>Back to ZonaBlox Home</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : submitted ? (
          /* Submission Success State */
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0b1611] border border-emerald-500/40 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-white">Review Submitted!</h3>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold">
              Thank you for trusting ZonaBlox for your Robux top-up!
            </p>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Your feedback helps other players across Malaysia find safe, reliable, and fast Robux delivery.
            </p>
            <div className="pt-4">
              <Link
                href="/#testimonials"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-101 transition-all"
              >
                <span>View Customer Reviews</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : alreadyReviewed ? (
          /* Already Reviewed State */
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0b1611] border border-emerald-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Review Already Submitted
            </h3>
            <p className="text-xs text-zinc-400">
              You have already shared your feedback for Order{" "}
              <strong className="text-orange-400">#{order?.order_code}</strong>.
            </p>

            {existingReview && (
              <div className="my-4 p-4 rounded-2xl bg-[#060c09] border border-emerald-950 text-left space-y-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < existingReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-600"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-zinc-400 font-bold ml-1.5">
                    {existingReview.rating} / 5
                  </span>
                </div>
                <p className="text-xs text-zinc-200 italic">
                  &ldquo;{existingReview.message}&rdquo;
                </p>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/#testimonials"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <span>Browse All Reviews</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Active Review Submission Form */
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 rounded-3xl bg-[#0b1611] border border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden"
          >
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Purchase Review</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Rate Your Experience
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                How was your Robux delivery with ZonaBlox?
              </p>
            </div>

            {/* Order Badge Info */}
            {order && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#060c09] border border-emerald-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-black/60 overflow-hidden shrink-0 flex items-center justify-center">
                    {order.roblox_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.roblox_avatar_url}
                        alt={order.roblox_username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-black text-emerald-400 uppercase">
                        {order.roblox_username.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">
                      @{order.roblox_username}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Order <span className="text-orange-400 font-mono font-bold">#{order.order_code}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black text-emerald-400">
                    {order.robux.toLocaleString()} Robux
                  </div>
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase">
                    Delivered
                  </div>
                </div>
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="space-y-2 text-center py-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Overall Satisfaction Rating
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 sm:p-1.5 transition-transform hover:scale-120 active:scale-95 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-bold text-amber-400 transition-all">
                {getRatingLabel(hoverRating || rating)}
              </p>
            </div>

            {/* Review Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                <span>Your Review / Feedback</span>
                <span className="text-[11px] text-zinc-500 font-normal">
                  {message.length}/500 chars
                </span>
              </label>
              <textarea
                required
                maxLength={500}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your honest review here (e.g. Fast process, trusted seller, Robux received instantly!)..."
                className="w-full p-3.5 rounded-2xl bg-[#060c09] border border-emerald-950 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <span>Submit My Review</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-emerald-950/60 text-center text-xs text-zinc-500">
        <p>© 2026 ZonaBlox Malaysia. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070e0b] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
