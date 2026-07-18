"use client";

import { Search, Plus, Building2, Globe, Users } from "lucide-react";

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add Company
        </button>
      </div>
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Search companies..." className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "Metro Health Systems", industry: "Healthcare", contacts: 8, leads: 3, website: "metrohealth.com" },
          { name: "Sunrise Hospitality Group", industry: "Hospitality", contacts: 5, leads: 2, website: "sunrisegroup.com" },
          { name: "Bay Area Education District", industry: "Education", contacts: 12, leads: 5, website: "bae.edu" },
          { name: "Coastal Retail Corporation", industry: "Retail", contacts: 6, leads: 4, website: "crc.com" },
          { name: "Gulf Property Management", industry: "Real Estate", contacts: 4, leads: 2, website: "gpm.com" },
          { name: "Meridian Healthcare", industry: "Healthcare", contacts: 7, leads: 3, website: "meridianhealth.com" },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Building2 size={20} className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <p className="text-xs text-gray-500">{c.industry}</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users size={13} /> {c.contacts} contacts</span>
              <span>{c.leads} leads</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Globe size={11} /> {c.website}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
