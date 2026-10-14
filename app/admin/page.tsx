"use client";

import { useState, useEffect } from "react";
import AdminSidebar, { AdminTab } from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import DashboardView from "./components/DashboardView";
import OrdersListView from "./components/OrdersListView";
import OrderDetailView from "./components/OrderDetailView";
import PricelistView from "./components/PricelistView";
import CustomersView from "./components/CustomersView";
import BlacklistView from "./components/BlacklistView";
import TestimonialsView from "./components/TestimonialsView";
import PaymentHistoryView from "./components/PaymentHistoryView";
import StoreSettingsView from "./components/StoreSettingsView";
import ReceiptModal from "./components/ReceiptModal";
import SendReviewModal from "./components/SendReviewModal";
import AdminLoginView from "./components/AdminLoginView";
import {
  AdminOrder,
  INITIAL_ADMIN_ORDERS,
  formatCurrency,
} from "@/app/data/adminOrdersData";
import { CheckCircle2, Bell, Sparkles, X, Info, Shield } from "lucide-react";

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS);
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [currency, setCurrency] = useState<"MYR" | "IDR">("MYR"); // Default to MYR for Malaysia
  const [mobileOpen, setMobileOpen] = useState(false);
  const [blacklistPrefill, setBlacklistPrefill] = useState<{
    username: string;
    whatsapp?: string;
    robloxUserId?: string;
  } | null>(null);

  // Send Review Modal State
  const [reviewModalOrder, setReviewModalOrder] = useState<AdminOrder | null>(null);

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    orderId: string;
  }>({
    isOpen: false,
    imageUrl: null,
    orderId: "",
  });

  // Toast alert state
  const [toast, setToast] = useState<{
    title: string;
    desc: string;
    type?: "success" | "info" | "warning";
  } | null>(null);

  // Verify admin authentication session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/check-auth", { cache: "no-store" });
        const data = await res.json();
        if (data.authenticated) {
          setAuthStatus("authenticated");
        } else {
          setAuthStatus("unauthenticated");
        }
      } catch {
        setAuthStatus("unauthenticated");
      }
    }
    checkAuth();
  }, []);

  // Fetch from Neon API on mount with localStorage cache fallback
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: AdminOrder[] = json.data.map((o: any) => ({
            id: o.order_code,
            username: o.roblox_username,
            robloxUserId: o.roblox_user_id || "",
            robloxAvatarUrl: o.roblox_avatar_url || undefined,
            robuxAmount: Number(o.robux),
            priceMYR: Number(o.price),
            priceIDR: Math.round(Number(o.price) * 3500),
            channel: o.payment_channel || "website",
            submethod: o.submethod || "DuitNow QR",
            status: (
              o.order_status === "completed" ? "selesai" :
              o.order_status === "processing" ? "diproses" :
              o.order_status === "cancelled" ? "dibatalkan" : "masuk"
            ) as "masuk" | "diproses" | "selesai" | "dibatalkan",
            createdAt: o.created_at
              ? new Date(o.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " MYT"
              : "Recent",
            createdAtTimestamp: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
            customerWhatsapp: o.customer_phone,
            customerNotes: o.customer_notes || "",
            adminNotes: o.admin_notes || "",
            receiptImage: o.payment_proof_path || null,
            gamepassLink: o.gamepass_link || undefined,
            timeline: Array.isArray(o.timeline)
              ? o.timeline
              : typeof o.timeline === "string"
              ? JSON.parse(o.timeline)
              : [],
          }));
          setOrders(mapped);
          return;
        }
      } catch {
        // network or server offline
      }

      try {
        const savedOrders = localStorage.getItem("zonablox_admin_orders");
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      } catch {
        // ignore
      }
    }

    loadOrders();

    try {
      const savedCurr = localStorage.getItem("zonablox_admin_currency");
      if (savedCurr === "MYR" || savedCurr === "IDR") {
        setCurrency(savedCurr);
      }
    } catch {
      // LocalStorage unavailable, keep defaults
    }
  }, [authStatus]);

  // Save to LocalStorage helper
  const persistOrders = (updated: AdminOrder[]) => {
    setOrders(updated);
    try {
      localStorage.setItem("zonablox_admin_orders", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const showToast = (
    title: string,
    desc: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    setToast({ title, desc, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Toggle currency between MYR & IDR
  const handleToggleCurrency = () => {
    const next = currency === "MYR" ? "IDR" : "MYR";
    setCurrency(next);
    try {
      localStorage.setItem("zonablox_admin_currency", next);
    } catch {
      // ignore
    }
    showToast(
      "Currency Switched",
      `Display currency changed to ${next === "MYR" ? "Malaysian Ringgit (RM)" : "Indonesian Rupiah (Rp)"}`,
      "info"
    );
  };

  // Order Counts
  const orderCounts = {
    masuk: orders.filter((o) => o.status === "masuk").length,
    diproses: orders.filter((o) => o.status === "diproses").length,
    selesai: orders.filter((o) => o.status === "selesai").length,
    dibatalkan: orders.filter((o) => o.status === "dibatalkan").length,
  };

  // Select Tab
  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select Order for Detail View
  const handleSelectOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setCurrentTab("order-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Quick Process Status Transition
  const handleQuickProcess = (orderId: string) => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) return;

    const nextStatus: AdminOrder["status"] =
      existing.status === "masuk"
        ? "diproses"
        : existing.status === "diproses"
        ? "selesai"
        : existing.status;

    const timelineEntry = {
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " MYT",
      title: nextStatus === "diproses" ? "Order Processing" : "Order Delivered",
      desc:
        nextStatus === "diproses"
          ? "Admin is transferring Robux to gamepass"
          : "Robux 100% successfully transferred",
      by: "Admin",
    };

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: nextStatus,
          timeline: [...(o.timeline || []), timelineEntry],
        };
      }
      return o;
    });

    persistOrders(updated);
    const target = updated.find((o) => o.id === orderId);
    if (target && selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(target);
    }

    // Persist status change to Neon DB
    const backendStatus =
      nextStatus === "selesai" ? "completed" :
      nextStatus === "diproses" ? "processing" : "pending";

    fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_status: backendStatus,
        new_timeline_event: timelineEntry,
      }),
    }).catch(() => {});

    showToast(
      "Status Updated",
      `Order #${orderId} is now: ${
        target?.status === "diproses" ? "Processing" : "Completed"
      }!`
    );
  };

  // Update Status from Detail View
  const handleUpdateStatus = (
    orderId: string,
    newStatus: AdminOrder["status"]
  ) => {
    const timelineEntry = {
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " MYT",
      title: `Status: ${newStatus.toUpperCase()}`,
      desc: `Status manually changed by Admin to ${newStatus}`,
      by: "Super Admin",
    };

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          timeline: [...(o.timeline || []), timelineEntry],
        };
      }
      return o;
    });

    persistOrders(updated);
    const target = updated.find((o) => o.id === orderId);
    if (target) {
      setSelectedOrder(target);
    }

    // Persist status change to Neon DB
    const backendStatus =
      newStatus === "selesai" ? "completed" :
      newStatus === "diproses" ? "processing" :
      newStatus === "dibatalkan" ? "cancelled" : "pending";

    fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_status: backendStatus,
        new_timeline_event: timelineEntry,
      }),
    }).catch(() => {});

    showToast(
      "Status Updated",
      `Order #${orderId} has been moved to ${newStatus}.`
    );
  };

  // Save Admin Notes
  const handleSaveAdminNotes = (orderId: string, notes: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, adminNotes: notes } : o
    );
    persistOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, adminNotes: notes });
    }

    // Persist notes to Neon DB
    fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_notes: notes }),
    }).catch(() => {});

    showToast("Notes Saved", `Admin notes for #${orderId} saved.`);
  };

  // Create Mock Order with ZBX prefix
  const handleCreateMockOrder = () => {
    const randomId = "ZBX" + Math.floor(10000000 + Math.random() * 90000000);
    const usernames = ["gamer_bloxx", "roblox_star", "malaysia_speed", "naufal_gaming", "sarah_rbx"];
    const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
    const randomRobux = [1800, 2200, 3200, 4200, 10500][Math.floor(Math.random() * 5)];
    const priceMap: Record<number, { myr: number; idr: number }> = {
      1800: { myr: 8, idr: 35000 },
      2200: { myr: 10, idr: 45000 },
      3200: { myr: 14, idr: 63000 },
      4200: { myr: 18, idr: 79000 },
      10500: { myr: 46, idr: 210000 },
    };
    const channels: ("whatsapp" | "website" | "telegram")[] = ["whatsapp", "website", "telegram"];
    const selectedChan = channels[Math.floor(Math.random() * channels.length)];

    const newOrder: AdminOrder = {
      id: randomId,
      username: randomUser,
      robloxUserId: String(Math.floor(1000000000 + Math.random() * 9000000000)),
      robuxAmount: randomRobux,
      priceMYR: priceMap[randomRobux].myr,
      priceIDR: priceMap[randomRobux].idr,
      channel: selectedChan,
      submethod: selectedChan === "website" ? "DuitNow QR Instant" : selectedChan === "telegram" ? "Telegram Direct" : "WhatsApp Direct",
      status: "masuk",
      createdAt: "Just now",
      createdAtTimestamp: Date.now(),
      customerWhatsapp: "+601" + Math.floor(10000000 + Math.random() * 90000000),
      customerNotes: "Simulation demo order",
      adminNotes: "",
      receiptImage: selectedChan === "website" ? "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80" : null,
      timeline: [
        {
          time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " MYT",
          title: "New Order Placed",
          desc: "Order created via demo simulation",
          by: "System",
        },
      ],
    };

    const updated = [newOrder, ...orders];
    persistOrders(updated);
    showToast(
      "New Order Received! 🔥",
      `Order #${newOrder.id} (${newOrder.robuxAmount.toLocaleString()} Robux) from @${newOrder.username} was created!`
    );
  };

  const handleRefreshData = async () => {
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: AdminOrder[] = json.data.map((o: any) => ({
          id: o.order_code,
          username: o.roblox_username,
          robloxUserId: o.roblox_user_id || "",
          robloxAvatarUrl: o.roblox_avatar_url || undefined,
          robuxAmount: Number(o.robux),
          priceMYR: Number(o.price),
          priceIDR: Math.round(Number(o.price) * 3500),
          channel: o.payment_channel || "website",
          submethod: o.submethod || "DuitNow QR",
          status: (
            o.order_status === "completed" ? "selesai" :
            o.order_status === "processing" ? "diproses" :
            o.order_status === "cancelled" ? "dibatalkan" : "masuk"
          ) as "masuk" | "diproses" | "selesai" | "dibatalkan",
          createdAt: o.created_at
            ? new Date(o.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }) + " MYT"
            : "Recent",
          createdAtTimestamp: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
          customerWhatsapp: o.customer_phone,
          customerNotes: o.customer_notes || "",
          adminNotes: o.admin_notes || "",
          receiptImage: o.payment_proof_path || null,
          gamepassLink: o.gamepass_link || undefined,
          timeline: Array.isArray(o.timeline)
            ? o.timeline
            : typeof o.timeline === "string"
            ? JSON.parse(o.timeline)
            : [],
        }));
        setOrders(mapped);
      }
    } catch {
      // ignore
    }

    showToast(
      "Sync Completed",
      "All transactions and delivery queue synchronized from Neon database.",
      "info"
    );
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of ZonaBlox Admin Panel?")) {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch {
        // ignore
      }
      setAuthStatus("unauthenticated");
    }
  };

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen w-full bg-[#060c09] text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <Shield className="w-7 h-7 text-emerald-400 animate-pulse" />
        </div>
        <div className="text-sm font-bold text-white tracking-wide">
          Verifying Admin Access...
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          ZonaBlox Security Guard
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <AdminLoginView
        onLoginSuccess={() => {
          setAuthStatus("authenticated");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#060c09] text-zinc-100 flex">
      {/* 1. Left Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        orderCounts={orderCounts}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* 2. Main Layout Area (with responsive left padding for sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72">
        {/* Top Header */}
        <AdminHeader
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          currency={currency}
          orders={orders}
          onSelectOrder={handleSelectOrder}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {currentTab === "dashboard" && (
            <DashboardView
              orders={orders}
              currency={currency}
              onSelectTab={handleSelectTab}
              onSelectOrder={handleSelectOrder}
              onQuickProcess={handleQuickProcess}
            />
          )}

          {[
            "orders-masuk",
            "orders-diproses",
            "orders-selesai",
            "orders-dibatalkan",
          ].includes(currentTab) && (
            <OrdersListView
              currentTab={currentTab}
              orders={orders}
              currency={currency}
              onSelectOrder={handleSelectOrder}
              onQuickProcess={handleQuickProcess}
              onRefreshData={handleRefreshData}
              onOpenReceipt={(img, id) =>
                setReceiptModal({ isOpen: true, imageUrl: img, orderId: id })
              }
              onOpenReviewModal={(order) => setReviewModalOrder(order)}
            />
          )}

          {currentTab === "order-detail" && selectedOrder && (
            <OrderDetailView
              order={selectedOrder}
              currency={currency}
              onBack={() => handleSelectTab("orders-masuk")}
              onUpdateStatus={handleUpdateStatus}
              onSaveAdminNotes={handleSaveAdminNotes}
              onOpenReceipt={(img, id) =>
                setReceiptModal({ isOpen: true, imageUrl: img, orderId: id })
              }
              onOpenReviewModal={(order) => setReviewModalOrder(order)}
            />
          )}

          {currentTab === "pricelist" && (
            <PricelistView currency={currency} onToast={showToast} />
          )}

          {currentTab === "customers" && (
            <CustomersView
              orders={orders}
              currency={currency}
              onSelectCustomerOrder={handleSelectOrder}
              onBlacklistCustomer={(cust) => {
                setBlacklistPrefill(cust);
                setCurrentTab("blacklist");
              }}
              onToast={showToast}
            />
          )}

          {currentTab === "blacklist" && (
            <BlacklistView
              onToast={showToast}
              externalPrefill={blacklistPrefill}
              onClearPrefill={() => setBlacklistPrefill(null)}
            />
          )}

          {currentTab === "testimonials" && (
            <TestimonialsView onToast={showToast} />
          )}

          {currentTab === "finance" && (
            <PaymentHistoryView
              orders={orders}
              onToast={showToast}
              onSelectOrder={handleSelectOrder}
            />
          )}

          {currentTab === "settings" && (
            <StoreSettingsView
              onToast={showToast}
              onOpenReceiptModal={(img, title) =>
                setReceiptModal({ isOpen: true, imageUrl: img, orderId: title })
              }
            />
          )}
        </main>
      </div>

      {/* Image Receipt Zoom Modal */}
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        imageUrl={receiptModal.imageUrl}
        orderId={receiptModal.orderId}
        onClose={() =>
          setReceiptModal({ isOpen: false, imageUrl: null, orderId: "" })
        }
      />

      {/* Send Review Token Modal */}
      <SendReviewModal
        isOpen={Boolean(reviewModalOrder)}
        order={reviewModalOrder}
        onClose={() => setReviewModalOrder(null)}
        onToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="p-4 rounded-2xl bg-[#0c1813] border border-emerald-500/40 shadow-[0_10px_35px_rgba(4,120,87,0.35)] flex items-start gap-3 max-w-sm backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-bold text-white">{toast.title}</h5>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                {toast.desc}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
