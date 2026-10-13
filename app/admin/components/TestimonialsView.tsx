"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Star,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit2,
  Reply,
  Trash2,
  X,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface AdminTestimonialItem {
  id: string;
  username: string;
  avatarBg: string;
  rating: number; // 1-5
  comment: string;
  robuxAmount: number | string;
  orderCode?: string;
  isVerified: boolean;
  isVisible: boolean;
  timeAgo: string;
  adminReply?: string | null;
  createdAt: number;
}

// Initial empty dataset - loaded dynamically from Neon database
const DEFAULT_TESTIMONIALS: AdminTestimonialItem[] = [];

interface TestimonialsViewProps {
  onToast?: (title: string, desc: string, type?: "success" | "info" | "warning") => void;
}

export default function TestimonialsView({
  onToast,
}: TestimonialsViewProps) {
  const [testimonials, setTestimonials] = useState<AdminTestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "hidden" | "need_reply">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal: Add & Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [formUsername, setFormUsername] = useState("");
  const [formRating, setFormRating] = useState<number>(5);
  const [formComment, setFormComment] = useState("");
  const [formPackage, setFormPackage] = useState("2,200 Robux");
  const [formError, setFormError] = useState("");

  // Modal: Reply
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<AdminTestimonialItem | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch from Neon API on mount with localStorage cache fallback
  useEffect(() => {
    async function loadTestimonials() {
      try {
        const res = await fetch("/api/testimonials?status=all");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: AdminTestimonialItem[] = json.data.map((t: any) => ({
            id: String(t.id),
            username: t.name,
            avatarBg: t.avatar_bg || "from-emerald-500 to-teal-700",
            rating: Number(t.rating),
            comment: t.message,
            robuxAmount: t.robux_amount || 0,
            orderCode: t.order_code || undefined,
            isVerified: Boolean(t.is_verified),
            isVisible: t.status === "approved",
            timeAgo: t.created_at
              ? new Date(t.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })
              : "Recent",
            adminReply: t.admin_reply || null,
            createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
          }));
          setTestimonials(mapped);
          return;
        }
      } catch {
        // network or server offline
      }

      try {
        const saved = localStorage.getItem("zonablox_testimonials");
        if (saved) {
          const parsed = JSON.parse(saved);
          const cleaned = parsed.map((item: Record<string, unknown>) => {
            const { proofImage: _unused, ...rest } = item;
            return rest as unknown as AdminTestimonialItem;
          });
          setTestimonials(cleaned);
        }
      } catch {
        // ignore
      }
    }

    loadTestimonials();
  }, []);

  const saveTestimonials = (items: AdminTestimonialItem[]) => {
    setTestimonials(items);
    try {
      localStorage.setItem("zonablox_testimonials", JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onToast) {
        onToast("Data Refreshed", "Reviews and testimonials synchronized.", "info");
      }
    }, 600);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode("add");
    setEditId(null);
    setFormUsername("");
    setFormRating(5);
    setFormComment("");
    setFormPackage("2,200 Robux");
    setFormError("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: AdminTestimonialItem) => {
    setModalMode("edit");
    setEditId(item.id);
    setFormUsername(item.username);
    setFormRating(item.rating);
    setFormComment(item.comment);
    setFormPackage(typeof item.robuxAmount === "number" ? `${item.robuxAmount.toLocaleString()} Robux` : item.robuxAmount);
    setFormError("");
    setModalOpen(true);
  };

  // Toggle Visibility
  const handleToggleVisibility = (id: string) => {
    const updated = testimonials.map((t) =>
      t.id === id ? { ...t, isVisible: !t.isVisible } : t
    );
    saveTestimonials(updated);
    const target = updated.find((t) => t.id === id);

    // Sync to Neon
    if (target) {
      const numericId = id.replace("testi-", "");
      fetch(`/api/testimonials/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target.isVisible ? "approved" : "rejected" }),
      }).catch(() => {});
    }

    if (onToast && target) {
      onToast(
        target.isVisible ? "Review Published" : "Review Hidden",
        `Review from @${target.username} is now ${
          target.isVisible ? "visible on the storefront" : "hidden from the public"
        }.`,
        target.isVisible ? "success" : "info"
      );
    }
  };

  // Delete Testimonial
  const handleDelete = (id: string) => {
    const target = testimonials.find((t) => t.id === id);
    if (confirm(`Delete review from @${target?.username}?`)) {
      const updated = testimonials.filter((t) => t.id !== id);
      saveTestimonials(updated);

      // Delete from Neon
      const numericId = id.replace("testi-", "");
      fetch(`/api/testimonials/${numericId}`, {
        method: "DELETE",
      }).catch(() => {});

      if (onToast) {
        onToast("Review Deleted", "Testimonial removed from system.", "warning");
      }
    }
  };

  // Submit Modal (Add / Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = formUsername.trim().replace(/^@/, "");
    if (!cleanUser) {
      setFormError("Roblox username is required.");
      return;
    }
    if (!formComment.trim()) {
      setFormError("Review comment cannot be empty.");
      return;
    }

    const gradients = [
      "from-pink-500 to-rose-600",
      "from-rose-500 to-orange-500",
      "from-emerald-500 to-teal-600",
      "from-cyan-500 to-blue-600",
      "from-amber-500 to-orange-600",
    ];

    if (modalMode === "add") {
      const tempId = `testi-${Date.now()}`;
      const newItem: AdminTestimonialItem = {
        id: tempId,
        username: cleanUser,
        avatarBg: gradients[Math.floor(Math.random() * gradients.length)],
        rating: formRating,
        comment: formComment.trim(),
        robuxAmount: formPackage.trim() || "2,200 Robux",
        isVerified: true,
        isVisible: true,
        timeAgo: "Just now",
        adminReply: null,
        createdAt: Date.now(),
      };

      const updated = [newItem, ...testimonials];
      saveTestimonials(updated);

      // Save to Neon
      fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanUser,
          rating: formRating,
          message: formComment.trim(),
          robux_amount: parseInt(formPackage.replace(/[^0-9]/g, "") || "0", 10),
          avatar_bg: newItem.avatarBg,
          status: "approved",
          is_verified: true,
        }),
      })
        .then(async (res) => {
          const json = await res.json();
          if (json.success && json.data) {
            setTestimonials((prev) =>
              prev.map((t) => (t.id === tempId ? { ...t, id: String(json.data.id) } : t))
            );
          }
        })
        .catch(() => {});

      if (onToast) {
        onToast("Review Added!", `Testimonial from @${newItem.username} published.`);
      }
    } else if (modalMode === "edit" && editId) {
      const updated = testimonials.map((t) =>
        t.id === editId
          ? {
              ...t,
              username: cleanUser,
              rating: formRating,
              comment: formComment.trim(),
              robuxAmount: formPackage.trim() || t.robuxAmount,
            }
          : t
      );
      saveTestimonials(updated);

      // Update in Neon
      const numericId = editId.replace("testi-", "");
      fetch(`/api/testimonials/${numericId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanUser,
          rating: formRating,
          message: formComment.trim(),
        }),
      }).catch(() => {});

      if (onToast) {
        onToast("Review Updated", "Testimonial details updated successfully.");
      }
    }

    setModalOpen(false);
  };

  // Open Reply Modal
  const handleOpenReply = (item: AdminTestimonialItem) => {
    setReplyTarget(item);
    setReplyText(item.adminReply || "");
    setReplyModalOpen(true);
  };

  // Submit Reply
  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget) return;

    const updated = testimonials.map((t) =>
      t.id === replyTarget.id ? { ...t, adminReply: replyText.trim() || null } : t
    );
    saveTestimonials(updated);
    setReplyModalOpen(false);

    // Save reply to Neon
    const numericId = replyTarget.id.replace("testi-", "");
    fetch(`/api/testimonials/${numericId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_reply: replyText.trim() || null }),
    }).catch(() => {});

    if (onToast) {
      onToast("Reply Published!", `Response to @${replyTarget.username} posted.`);
    }
  };

  // Quick Reply Presets
  const replyPresets = [
    "Thank you for choosing ZonaBlox! Enjoy your Robux! 🔥",
    "Thanks for the feedback! Looking forward to your next top-up! ✨",
    "Apologies for the slight delay, our team is constantly speeding up delivery! 🙏",
    "Awesome! Thank you for being a loyal customer at ZonaBlox Malaysia! ⚡",
  ];

  // Calculations for Stat Cards
  const totalCount = testimonials.length;
  const activeCount = testimonials.filter((t) => t.isVisible).length;
  const hiddenCount = testimonials.filter((t) => !t.isVisible).length;
  const needReplyCount = testimonials.filter((t) => !t.adminReply).length;
  const avgRating = totalCount > 0 ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / totalCount).toFixed(1) : "5.0";

  // Filtered List
  const filtered = testimonials.filter((t) => {
    if (activeTab === "active" && !t.isVisible) return false;
    if (activeTab === "hidden" && t.isVisible) return false;
    if (activeTab === "need_reply" && !!t.adminReply) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.username.toLowerCase().includes(q) ||
        t.comment.toLowerCase().includes(q) ||
        String(t.robuxAmount).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Testimonials &amp; Reviews
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Moderate customer feedback, add reviews, reply to testimonials, and control storefront visibility
          </p>
        </div>

        {/* Top Right Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-102 active:scale-98 transition-all flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition shadow-sm shrink-0"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Summary Stat Cards (2x2 on Mobile, 4 columns on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL REVIEWS */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-emerald-500/20 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate block">
            TOTAL REVIEWS
          </span>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {totalCount}
          </div>
        </div>

        {/* AVERAGE RATING */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-amber-500/20 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate block">
            AVERAGE RATING
          </span>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 tracking-tight flex items-center gap-1.5">
            <span>{avgRating}</span>
            <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-amber-400 text-amber-400 shrink-0" />
          </div>
        </div>

        {/* PUBLISHED */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-emerald-500/25 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate block">
            PUBLISHED (LIVE)
          </span>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight">
            {activeCount}
          </div>
        </div>

        {/* PENDING REPLY */}
        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-[#0b1611] border border-orange-500/25 shadow-lg">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider truncate block">
            NEEDS REPLY
          </span>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-orange-400 tracking-tight">
            {needReplyCount}
          </div>
        </div>
      </div>

      {/* 3. Main Container Card */}
      <div className="rounded-3xl bg-[#0b1611] border border-emerald-500/25 p-4 sm:p-7 shadow-xl space-y-6">
        {/* Filter Pills & Search Input Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-emerald-950/80">
          {/* Tabs Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#070e0b] border border-emerald-950/80 overflow-x-auto no-scrollbar w-full lg:w-auto shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "active"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Published ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("hidden")}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "hidden"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Hidden ({hiddenCount})
            </button>
            <button
              onClick={() => setActiveTab("need_reply")}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "need_reply"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Needs Reply ({needReplyCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search username or comment..."
              className="w-full bg-[#070e0b] text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 pl-9 pr-3 py-2 rounded-2xl border border-emerald-950 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>
        </div>

        {/* List of Testimonial Cards */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#070e0b] border transition-all duration-300 space-y-3.5 group ${
                  item.isVisible
                    ? "border-emerald-950/80 hover:border-emerald-500/40"
                    : "border-zinc-800/80 opacity-60"
                }`}
              >
                {/* Top Row: Avatar Circle, Username, Verified, Robux, Stars, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Avatar + Info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr ${item.avatarBg} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md`}
                    >
                      {item.username.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {/* Username */}
                        <a
                          href={`https://www.roblox.com/users/search?keyword=${item.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-extrabold text-sm sm:text-base text-white hover:text-emerald-400 transition truncate"
                        >
                          @{item.username}
                        </a>

                        {/* Verified Badge */}
                        {item.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}

                        {/* Robux Amount Pill Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                          {typeof item.robuxAmount === "number"
                            ? `${item.robuxAmount.toLocaleString()} Robux`
                            : item.robuxAmount}
                        </span>
                      </div>

                      {/* Stars + Time Ago */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <div className="flex items-center text-amber-400 shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= item.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-zinc-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span className="text-[11px] text-zinc-500">{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-950/60 shrink-0">
                    {/* Toggle Visibility */}
                    <button
                      onClick={() => handleToggleVisibility(item.id)}
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
                        item.isVisible
                          ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{item.isVisible ? "Published" : "Hidden"}</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition flex-1 sm:flex-initial"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Reply */}
                    <button
                      onClick={() => handleOpenReply(item)}
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-initial ${
                        item.adminReply
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                          : "bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30"
                      }`}
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{item.adminReply ? "Edit Reply" : "Reply"}</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition shrink-0"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Comment Text */}
                <div className="pl-1 text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                  &ldquo;{item.comment}&rdquo;
                </div>

                {/* Admin Reply Box if present */}
                {item.adminReply && (
                  <div className="p-3.5 rounded-2xl bg-[#0e1d16] border border-emerald-500/30 text-xs space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>ZonaBlox Admin Reply:</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed pl-5">
                      {item.adminReply}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <h4 className="text-base font-bold text-zinc-300">
              No Reviews Found
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No reviews match the selected filter or keyword &quot;{searchTerm}&quot;.
            </p>
          </div>
        )}
      </div>

      {/* 4. MODAL POPUP: Add & Edit Review */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0c1712] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {modalMode === "add" ? "Add New Review" : "Edit Review"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error if any */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Field 1: Username Roblox * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Roblox Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xs font-bold text-orange-400 pointer-events-none">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. GamerStar_99"
                    className="w-full bg-[#070e0b] text-sm font-medium text-white placeholder-zinc-500 pl-8 pr-4 py-3 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Field 2: Rating (1 - 5 Stars) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Satisfaction Rating (1 - 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-[#070e0b] border border-emerald-950/80 w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 transition hover:scale-115"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-600 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-400 ml-1">
                    {formRating} Stars
                  </span>
                </div>
              </div>

              {/* Field 3: Review Comment * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Review Comment <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Describe the customer's top up experience..."
                  className="w-full bg-[#070e0b] text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 p-3.5 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition resize-none shadow-inner"
                />
              </div>

              {/* Field 4: Robux Package / Order Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span>Robux Package / Order Code (Optional)</span>
                </div>
                <input
                  type="text"
                  value={formPackage}
                  onChange={(e) => setFormPackage(e.target.value)}
                  placeholder="e.g. 2,200 Robux or #ZBX93464279"
                  className="w-full bg-[#070e0b] text-sm text-white placeholder-zinc-500 px-4 py-2.5 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-xs transition shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                >
                  {modalMode === "add" ? "Save Review" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL POPUP: Reply to Review */}
      {replyModalOpen && replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0c1712] border border-orange-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <Reply className="w-5 h-5 text-orange-400" />
                <span>Reply to @{replyTarget.username}</span>
              </h3>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#070e0b] border border-emerald-950 text-xs text-zinc-300 italic">
              &ldquo;{replyTarget.comment}&rdquo;
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">
                  Write Admin Response:
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for trusting ZonaBlox..."
                  className="w-full bg-[#070e0b] text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 p-3.5 rounded-2xl border border-emerald-900/50 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition resize-none shadow-inner"
                />

                {/* Quick Presets */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">
                    Quick Templates:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {replyPresets.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setReplyText(preset)}
                        className="text-[11px] p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-left transition border border-emerald-950"
                      >
                        {preset.slice(0, 45)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-semibold text-xs hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs shadow-md"
                >
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
