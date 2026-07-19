"use client";

import { FileText, Download } from "lucide-react";

export default function TrainingDocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Document Library</h1>
      <div className="grid grid-cols-1 gap-3">
        {[
          { title: "POTS Replacement Sales Playbook", type: "PDF", pages: 24, category: "Sales Enablement" },
          { title: "UCaaS Feature Comparison Matrix", type: "XLSX", pages: 8, category: "Sales Enablement" },
          { title: "SIP Trunking Technical Specification", type: "PDF", pages: 42, category: "Technical" },
          { title: "Wireless Failover Deployment Guide", type: "PDF", pages: 18, category: "Technical" },
          { title: "Hosted PBX Onboarding Checklist", type: "PDF", pages: 6, category: "Onboarding" },
          { title: "MSP Partner Agreement Template", type: "DOCX", pages: 12, category: "Legal" },
          { title: "Competitive Intelligence Brief Q3 2026", type: "PDF", pages: 15, category: "Sales Enablement" },
          { title: "POTS-in-a-Box Installation Guide", type: "PDF", pages: 28, category: "Technical" },
          { title: "Customer Success Story: Metro Health", type: "PDF", pages: 4, category: "Marketing" },
          { title: "Partner Co-Branding Guidelines", type: "PDF", pages: 10, category: "Marketing" },
          { title: "Elevator Pitch Scripts — All Products", type: "PDF", pages: 3, category: "Sales Enablement" },
          { title: "Billing & Commission Structure 2026", type: "PDF", pages: 7, category: "Operations" },
        ].map((d, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <FileText size={18} className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{d.title}</h3>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">{d.type}</span>
                  <span>{d.pages} pages</span>
                  <span>{d.category}</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1 text-sm text-[var(--color-brand-primary)] hover:underline font-medium">
              <Download size={14} /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
