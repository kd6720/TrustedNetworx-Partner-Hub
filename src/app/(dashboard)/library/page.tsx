"use client";

import { useState } from "react";
import {
  Folder,
  ChevronRight,
  Search,
  Eye,
  Share2,
  FileText,
  Play,
  FileSpreadsheet,
} from "lucide-react";

const folders = [
  { name: "Co-Branded Collateral", desc: "Sales decks, one-pagers, and competitive briefs with your branding", items: 6, updated: "Jul 12, 2026", },
  { name: "Pitch & Demo Resources", desc: "Demo scripts, elevator pitches, and presentation resources", items: 4, updated: "Jul 8, 2026", },
  { name: "Product Sheets & Battle Cards", desc: "Technical specs, feature comparisons, and objection handling", items: 8, updated: "Jun 30, 2026", },
];

const currentItems = [
  { type: "deck" as const, name: "TrustedNetworx Overview Deck", desc: "Full company and product portfolio presentation", added: "Jul 12, 2026", size: "4.2 MB" },
  { type: "doc" as const, name: "POTS Replacement Battle Card", desc: "Competitive positioning and objection responses", added: "Jul 10, 2026", size: "1.1 MB" },
  { type: "video" as const, name: "Hosted Voice Demo Walkthrough", desc: "15-minute product demo for prospects", added: "Jul 5, 2026", size: "128 MB" },
];

const typeIcons = { deck: FileSpreadsheet, doc: FileText, video: Play };
const typeLabels = { deck: "Deck", doc: "Document", video: "Video" };

export default function LibraryPage() {
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  if (openFolder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setOpenFolder(null)} className="text-[var(--color-brand-primary)] hover:underline font-medium">
            Content Library
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-700 font-medium truncate">{openFolder}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">{openFolder}</h2>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search items..." className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
          </div>
        </div>

        <div className="space-y-3">
          {currentItems.map((item, i) => {
            const Icon = typeIcons[item.type];
            return (
              <div key={i} className="card p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 flex-shrink-0">
                        {typeLabels[item.type]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
                      <span>{item.added}</span>
                      <span>{item.size}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Eye size={14} /> Preview
                      </button>
                      <button className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-brand-secondary)]">
                        <Share2 size={14} /> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Content Library</h2>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search all content..." className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
        </div>
      </div>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {folders.map((f, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setOpenFolder(f.name)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Folder size={20} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{f.name}</p>
                      <p className="text-sm text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{f.items}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{f.updated}</td>
                <td className="px-6 py-4">
                  <ChevronRight size={16} className="text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {folders.map((f, i) => (
          <div key={i} className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOpenFolder(f.name)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Folder size={20} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{f.name}</p>
                  <p className="text-xs text-gray-500 truncate">{f.desc}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>{f.items} items</span>
              <span>{f.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
