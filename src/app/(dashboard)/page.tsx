"use client";

import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import WorkspaceOverview from "@/components/dashboard/WorkspaceOverview";

const stages = [
  { num: 1, label: "Working with TrustedNetworx", status: "done" as const },
  { num: 2, label: "Account & Operations", status: "done" as const },
  { num: 3, label: "Product Training", status: "active" as const },
  { num: 4, label: "Sales Enablement", status: "future" as const },
  { num: 5, label: "Marketing", status: "future" as const },
  { num: 6, label: "Client Onboarding", status: "future" as const },
];

export default function HomePage() {
  const { profile } = useAuth();

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Partner";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="gradient-hero rounded-2xl p-8 md:p-10 text-white">
        <p className="text-sm text-white/70 mb-2">{greeting()}, {displayName}.</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Ready to sell TrustedNetworx?
        </h1>
        <p className="text-white/80 max-w-xl mb-6">
          Everything you need to pitch, handle objections, run a demo, and
          close — all in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/documentation"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-sidebar)] hover:bg-gray-100 transition-colors"
          >
            Start the track <ChevronRight size={16} />
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Library
          </Link>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Opportunities
          </Link>
        </div>
        <p className="text-xs text-white/50 mt-4">
          TrustedNetworx · Partner since 2025
        </p>
      </div>

      {/* Onboarding tracker */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Progress</h2>
        <div className="space-y-3">
          {stages.map((s) => (
            <div key={s.num} className="flex items-center gap-3">
              {s.status === "done" ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : s.status === "active" ? (
                <Circle size={20} className="text-[var(--color-brand-primary)] fill-current" />
              ) : (
                <Circle size={20} className="text-gray-300" />
              )}
              <span className={`text-sm ${s.status === "future" ? "text-gray-400" : "text-gray-700"}`}>
                {s.label}
              </span>
              {s.status === "active" && (
                <span className="text-[10px] bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] px-1.5 py-0.5 rounded-full font-medium">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Workspace Overview */}
      <WorkspaceOverview />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Register a Deal", desc: "Submit a new opportunity", href: "/opportunities", icon: "📋" },
          { label: "Open Content Library", desc: "Sales decks and one-pagers", href: "/library", icon: "📚" },
          { label: "Complete a Lesson", desc: "Continue your product training", href: "/documentation", icon: "🎓" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="text-2xl mb-2">{a.icon}</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-brand-primary)]">{a.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 py-4">
        TrustedNetworx Partner Hub · Questions? Contact your channel manager.
      </p>
    </div>
  );
}
