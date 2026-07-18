"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import { Sparkles } from "lucide-react";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/library": "Content Library",
  "/documentation": "Documentation",
  "/training": "Training Hub",
  "/training/videos": "Video Library",
  "/training/documents": "Document Library",
  "/crm": "CRM Dashboard",
  "/crm/leads": "Leads",
  "/crm/contacts": "Contacts",
  "/crm/companies": "Companies",
  "/crm/forms": "Forms",
  "/admin": "Admin Panel",
  "/opportunities": "Opportunities",
  "/settings/brand-kit": "Brand & Company",
  "/settings/users": "Team Members",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "TrustedNetworx Partner Hub";
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar title={title} />
        <main className="p-6 max-w-[1240px]">
          {children}
        </main>
      </div>

      {/* AI Assistant FAB */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white shadow-lg hover:bg-[var(--color-brand-secondary)] transition-all hover:scale-105"
      >
        <Sparkles size={24} />
      </button>

      {/* AI Chat Drawer */}
      {aiOpen && (
        <div className="fixed right-0 top-0 z-50 h-full w-[380px] bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-900 text-white">
            <h3 className="font-semibold">Networx Assistant</h3>
            <button
              onClick={() => setAiOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <p className="text-gray-500 text-sm text-center mt-20">
              How can I help? Ask me about the Partner Hub, platform, sales
              materials, pricing, or anything about TrustedNetworx solutions.
            </p>
          </div>
          <div className="p-4 border-t border-gray-200">
            <input
              type="text"
              placeholder="Ask a question..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent"
            />
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Responses are generated using AI and may contain mistakes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
