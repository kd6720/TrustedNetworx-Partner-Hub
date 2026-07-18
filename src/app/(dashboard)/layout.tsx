"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  "/crm/contacts/[id]": "Contact",
  "/crm/companies": "Companies",
  "/crm/companies/[id]": "Company",
  "/crm/forms": "Forms",
  "/crm/leads/[id]": "Lead",
  "/admin": "Admin Panel",
  "/kanban": "Kanban Board",
  "/kanban/agents": "Agent Connections",
  "/kanban/schedules": "Schedules",
  "/opportunities": "Opportunities",
  "/settings/account": "Account",
  "/settings/brand-kit": "Brand & Company",
  "/settings/users": "Team Members",
  "/settings/email": "Email Connections",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const title = pageTitles[pathname] || "TrustedNetworx Partner Hub";
  const [aiOpen, setAiOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages(m => [...m, { role: "user", content: text }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply || "Sorry, I could not process that." }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "The assistant is coming online soon. In the meantime, check the Knowledge Base or contact your TrustedNetworx representative." }]);
    }
    setSending(false);
  }

  // Redirect to login if not authenticated (client-side fallback for middleware)
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  // Show nothing while checking auth
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar title={title} />
        <main id="main-content" className="p-6 max-w-[1240px]">{children}</main>
      </div>

      {/* AI Assistant FAB */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        aria-label={aiOpen ? "Close AI assistant" : "Open AI assistant"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white shadow-lg hover:bg-[var(--color-brand-secondary)] transition-all hover:scale-105"
      >
        <Sparkles size={24} />
      </button>

      {/* AI Chat Drawer */}
      {aiOpen && (
        <div className="fixed right-0 top-0 z-50 h-full w-[380px] bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-900 text-white">
            <h3 className="font-semibold">Networx Assistant</h3>
            <button onClick={() => setAiOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close assistant">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-20">
                How can I help? Ask me about the Partner Hub, platform, sales materials, pricing, or anything about TrustedNetworx solutions.
              </p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-[var(--color-brand-primary)] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 animate-pulse">Thinking...</div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question..."
                aria-label="Ask a question"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 flex-shrink-0"
              >
                Send
              </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Responses are generated using AI and may contain mistakes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
