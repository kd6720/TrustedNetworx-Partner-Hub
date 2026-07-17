"use client";

import { CheckCircle2, Circle, ChevronRight, Clock } from "lucide-react";

const stages = [
  { num: 1, label: "Working with TrustedNetworx", status: "done" as const },
  { num: 2, label: "Account & Operations", status: "done" as const },
  { num: 3, label: "Product Training", status: "active" as const },
  { num: 4, label: "Sales Enablement", status: "future" as const },
  { num: 5, label: "Marketing", status: "future" as const },
  { num: 6, label: "Client Onboarding", status: "future" as const },
];

const notifications = [
  {
    title: "Battle Card: POTS Replacement was viewed",
    desc: "A prospect viewed your 'POTS Replacement Battle Card' deck.",
    date: "2 hours ago",
  },
  {
    title: "New content available: Q3 Product Updates",
    desc: "Check out the latest product training materials in the Documentation section.",
    date: "1 day ago",
  },
  {
    title: "Deal moved to Proposal stage",
    desc: "Sunset Senior Living has advanced to the Proposal stage.",
    date: "2 days ago",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="gradient-hero rounded-2xl p-8 md:p-10 text-white">
        <p className="text-sm text-white/70 mb-2">Good evening, Carter Dewey.</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Ready to sell TrustedNetworx?
        </h1>
        <p className="text-white/80 max-w-xl mb-6">
          Everything you need to pitch, handle objections, run a demo, and
          close — all in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-sidebar)] hover:bg-gray-100 transition-colors">
            Start the track <ChevronRight size={16} />
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
            Library
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
            Opportunities
          </button>
        </div>
        <p className="text-xs text-white/50 mt-4">
          TrustedNetworx · Partner since 2025
        </p>
      </div>

      {/* Onboarding Progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Onboarding Progress
          </h2>
          <span className="text-sm text-gray-500">
            Stage 3 of 6
          </span>
        </div>

        {/* Stage stepper */}
        <div className="flex items-center justify-between mb-8">
          {stages.map((stage, i) => (
            <div key={stage.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    stage.status === "done"
                      ? "bg-[var(--color-brand-primary)] text-white"
                      : stage.status === "active"
                      ? "bg-gray-900 text-white ring-4 ring-[var(--color-brand-primary)]/20"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {stage.status === "done" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    stage.num
                  )}
                </div>
                <span className="text-[11px] text-gray-500 mt-1.5 text-center max-w-[80px] leading-tight">
                  {stage.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    stage.status === "done"
                      ? "bg-[var(--color-brand-primary)]"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Active stage details */}
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-bold text-gray-900">Stage 3</span>
            <span className="text-sm font-semibold text-gray-900">
              Product Training
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              In Progress
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Learn about TrustedNetworx products — POTS replacement, hosted
            voice, connectivity, and wireless failover.
          </p>
          <div className="space-y-2 mb-4">
            {[
              "POTS Replacement Overview",
              "Hosted Voice / UCaaS",
              "Connectivity & Failover",
              "Partner Portal & Provisioning",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < 1 ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <Circle size={18} className="text-gray-300" />
                )}
                <span
                  className={`text-sm ${i < 1 ? "text-gray-500 line-through" : "text-gray-700"}`}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>1/4 completed</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full max-w-[120px]">
              <div className="h-full w-1/4 bg-[var(--color-brand-primary)] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Notifications
        </h2>
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div
              key={i}
              className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.desc}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4 flex items-center gap-1">
                <Clock size={12} />
                {n.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
