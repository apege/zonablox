import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - ZonaBlox.id",
  description: "ZonaBlox Admin Control, Order Management & Robux Delivery Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060c09] text-zinc-100 selection:bg-orange-500 selection:text-white font-sans antialiased">
      {children}
    </div>
  );
}
