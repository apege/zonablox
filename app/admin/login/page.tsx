"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLoginView from "../components/AdminLoginView";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("/api/admin/check-auth", { cache: "no-store" });
        const data = await res.json();
        if (data.authenticated) {
          router.replace("/admin");
          return;
        }
      } catch {
        // proceed to show login
      } finally {
        setChecking(false);
      }
    }
    verify();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen w-full bg-[#060c09] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <div className="text-sm font-semibold text-zinc-300">
          Checking security session...
        </div>
      </div>
    );
  }

  return (
    <AdminLoginView
      onLoginSuccess={() => {
        router.replace("/admin");
      }}
    />
  );
}
