"use client";

import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import Link from "next/link";

const stages = [
  "1. Qualification",
  "2. Site Survey",
  "3. Proposal",
  "4. Contracting",
  "5. Closed Won",
  "6. Awaiting Install",
  "7. Activated",
];

const mockDeals = [
  {
    id: "2d64416f-1111-4aaa-bbbb-cccccccccccc",
    prospect: "Sunset Senior Living",
    stage: "3. Proposal",
    closeDate: "Aug 15, 2026",
    lines: 45,
    acv: "$18,900",
    contact: "Maria Torres",
  },
  {
    id: "3e75527a-2222-4bbb-cccc-dddddddddddd",
    prospect: "Bayview Hospitality Group",
    stage: "1. Qualification",
    closeDate: "Sep 1, 2026",
    lines: 120,
    acv: "$50,400",
    contact: "James Chen",
  },
  {
    id: "4f86638b-3333-4ccc-dddd-eeeeeeeeeeee",
    prospect: "Metro Medical Center",
    stage: "5. Closed Won",
    closeDate: "Jul 28, 2026",
    lines: 85,
    acv: "$35,700",
    contact: "Dr. Sarah Kim",
  },
];

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [showModal, setShowModal] = useState(false);

  const filtered = mockDeals.filter(
    (d) =>
      d.prospect.toLowerCase().includes(search.toLowerCase()) &&
      (stageFilter === "All Stages" || d.stage === stageFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Opportunity Pipeline
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={16} /> Create Opportunity
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by prospect name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-lg border border-gray-300 pl-9 pr-8 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
          >
            <option>All Stages</option>
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prospect
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Close Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lines
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. ACV
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal) => (
              <tr
                key={deal.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{deal.prospect}</p>
                  <p className="text-sm text-gray-500">{deal.contact}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {deal.stage}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {deal.closeDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {deal.lines}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {deal.acv}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/opportunities/${deal.id}`}
                    className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Opportunity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Register Opportunity
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lines / Sites
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vertical
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                    <option>Senior Living</option>
                    <option>Hospitality</option>
                    <option>Healthcare</option>
                    <option>Property Management</option>
                    <option>Enterprise</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Optional context for your TrustedNetworx rep"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-brand-primary)] rounded-lg hover:bg-[var(--color-brand-secondary)]">
                Register opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
