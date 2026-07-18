"use client";

import { Play, Clock } from "lucide-react";

export default function TrainingVideosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "POTS Replacement — Product Overview", duration: "12:34", category: "Product Training" },
          { title: "UCaaS Platform Walkthrough", duration: "18:22", category: "Product Training" },
          { title: "SIP Trunking Technical Deep Dive", duration: "25:10", category: "Technical" },
          { title: "Wireless Failover Setup Guide", duration: "9:45", category: "Technical" },
          { title: "Objection Handling Masterclass", duration: "22:00", category: "Sales" },
          { title: "Building Your Telecom Pipeline", duration: "15:30", category: "Sales" },
          { title: "Competitive Battle Cards Walkthrough", duration: "14:15", category: "Sales" },
          { title: "Partner Portal Orientation", duration: "8:00", category: "Onboarding" },
          { title: "Deal Registration Process", duration: "6:20", category: "Onboarding" },
        ].map((v, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-gray-900 h-40 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                <Play size={20} className="text-white ml-0.5" />
              </div>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-medium text-[var(--color-brand-primary)] uppercase tracking-wider">{v.category}</span>
              <h3 className="font-medium text-gray-900 mt-1">{v.title}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <Clock size={12} /> {v.duration}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
