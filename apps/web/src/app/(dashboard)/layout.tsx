import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#f4f6f4]">
      <Sidebar />
      <main className="flex-1 min-w-0 px-0 pb-12 pt-4 md:px-8">
        {children}
      </main>
    </div>
  );
}
