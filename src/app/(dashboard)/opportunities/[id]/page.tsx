"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

const allStages = [
  "1. Qualification",
  "2. Site Survey",
  "3. Proposal",
  "4. Contracting",
  "5. Closed Won",
  "6. Awaiting Install",
  "7. Activated",
];

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentStage = 2; // Index into allStages

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/opportunities"
          className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to Opportunities
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Sunset Senior Living
        </h1>
        <span className="inline-flex items-center rounded-full bg-[var(--color-brand-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-brand-primary)]">
          {allStages[currentStage]}
        </span>
      </div>

      {/* Stage Stepper */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          {allStages.map((s, i) => (
            <div key={s} className="flex items-center">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  i === currentStage
                    ? "bg-[var(--color-brand-primary)] text-white"
                    : i < currentStage
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {s}
              </span>
              {i < allStages.length - 1 && (
                <ChevronRight size={14} className="text-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Created: Jul 1, 2026</span>
          <span>Last advanced: Jul 14, 2026</span>
        </div>
        <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-secondary)]">
          Advance to {allStages[currentStage + 1]}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Deal Details */}
        <div className="col-span-2 card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Opportunity Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Create Date
              </label>
              <p className="text-sm font-medium">Jul 1, 2026</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Close Date
              </label>
              <input
                type="text"
                defaultValue="Aug 15, 2026"
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Lines / Sites
              </label>
              <input
                type="number"
                defaultValue={45}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                MRC per Line
              </label>
              <input
                type="text"
                defaultValue="$35.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-[var(--color-brand-primary)]/5 rounded-xl border border-[var(--color-brand-primary)]/20">
            <p className="text-xs text-gray-500 mb-1">Estimated ACV</p>
            <p className="text-2xl font-bold text-gray-900">$18,900.00</p>
            <p className="text-xs text-gray-500">
              45 lines × $35.00 × 12 months
            </p>
          </div>
          <button className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Save Changes
          </button>
        </div>

        {/* Account Info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Company Name</p>
              <p className="font-medium">Sunset Senior Living</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Seats</p>
              <p className="font-medium">45</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Owner</p>
              <p className="font-medium">Carter Dewey</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created By</p>
              <p className="font-medium">Carter Dewey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Timeline Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Engagement Timeline</h3>
          <div className="flex items-center gap-2 text-sm">
            {["Day", "Week", "Month"].map((t) => (
              <button
                key={t}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  t === "Week"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Views", value: "12", color: "text-[var(--color-brand-primary)]" },
            { label: "Unique Viewers", value: "3", color: "text-blue-600" },
            { label: "Most Viewed", value: "POTS Battle Card", color: "text-green-600" },
            { label: "Last Viewed · Trend", value: "2h ago ↑", color: "text-gray-600" },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
        {/* Simplified chart placeholder */}
        <div className="h-48 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
          <p className="text-sm text-gray-400">
            Views over time chart (Recharts-powered area chart)
          </p>
        </div>
      </div>
    </div>
  );
}
