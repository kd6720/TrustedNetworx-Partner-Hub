"use client";

import { Copy, ExternalLink, Plus } from "lucide-react";

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Capture Forms</h1>
          <p className="text-sm text-gray-500 mt-1">Embeddable forms for your website</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Create Form
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { name: "POTS Replacement Inquiry", submissions: 47, embedCode: '<script src="https://hub.trustednetworx.com/forms/pots-inquiry.js"></script>' },
          { name: "UCaaS Demo Request", submissions: 32, embedCode: '<script src="https://hub.trustednetworx.com/forms/ucaas-demo.js"></script>' },
          { name: "General Contact", submissions: 89, embedCode: '<script src="https://hub.trustednetworx.com/forms/contact.js"></script>' },
          { name: "Partner Application", submissions: 15, embedCode: '<script src="https://hub.trustednetworx.com/forms/partner.js"></script>' },
        ].map((f, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{f.name}</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{f.submissions} submissions</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-green-400 overflow-x-auto mb-3">
              {f.embedCode}
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                <Copy size={12} /> Copy
              </button>
              <button className="inline-flex items-center gap-1 text-xs text-[var(--color-brand-primary)] hover:underline px-2 py-1">
                <ExternalLink size={12} /> Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
