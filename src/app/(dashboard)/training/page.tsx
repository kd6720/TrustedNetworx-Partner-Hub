"use client";

import { FileText, BookOpen, Video, Clock } from "lucide-react";
import Link from "next/link";

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Training Hub</h1>
        <p className="text-sm text-gray-500 mt-1">Sales enablement, product training, and onboarding resources</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/training/videos" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 mb-3"><Video size={20} className="text-red-500" /></div>
          <h3 className="font-semibold text-gray-900">Video Library</h3>
          <p className="text-sm text-gray-500 mt-1">Product demos, sales training, and webinar recordings</p>
          <span className="text-xs text-[var(--color-brand-primary)] mt-2 inline-block">12 videos →</span>
        </Link>
        <Link href="/training/documents" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 mb-3"><FileText size={20} className="text-blue-500" /></div>
          <h3 className="font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-500 mt-1">Sales playbooks, battle cards, technical guides, and price sheets</p>
          <span className="text-xs text-[var(--color-brand-primary)] mt-2 inline-block">24 documents →</span>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 mb-3"><BookOpen size={20} className="text-green-500" /></div>
          <h3 className="font-semibold text-gray-900">Certification</h3>
          <p className="text-sm text-gray-500 mt-1">Partner certification tracks with badges and rewards</p>
          <span className="text-xs text-gray-400 mt-2 inline-block">Coming soon</span>
        </div>
      </div>

      {/* Featured */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Training</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "POTS Replacement — Full Product Training", type: "Video Course", duration: "45 min", modules: 6 },
            { title: "UCaaS Platform Demo Script", type: "Document", duration: "15 min read", modules: 1 },
            { title: "Objection Handling: Telecom Edition", type: "Video", duration: "22 min", modules: 1 },
            { title: "MSP Partner Onboarding Guide", type: "Document", duration: "30 min read", modules: 8 },
          ].map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-medium text-[var(--color-brand-primary)] uppercase tracking-wider">{item.type}</span>
                  <h3 className="font-medium text-gray-900 mt-1">{item.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock size={12} /> {item.duration}</span>
                <span>{item.modules} {item.modules === 1 ? 'module' : 'modules'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
