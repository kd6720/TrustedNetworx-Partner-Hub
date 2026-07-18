"use client";

import { Search, Filter, Plus, ChevronRight } from "lucide-react";

const statuses = ["All", "New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search leads..." className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm" />
        </div>
        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
          <Filter size={14} /> Filters
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "POTS Replacement — Metro Health", company: "Metro Health Systems", status: "Qualified", value: "$45,000", owner: "John Smith", date: "Jul 14, 2026" },
              { name: "UCaaS Migration — Sunrise", company: "Sunrise Hospitality Group", status: "New", value: "$28,000", owner: "Sarah Chen", date: "Jul 13, 2026" },
              { name: "SIP Trunking — Bay Area", company: "Bay Area Education", status: "Contacted", value: "$62,000", owner: "John Smith", date: "Jul 12, 2026" },
              { name: "Managed Voice — Coastal", company: "Coastal Retail Corp", status: "Proposal Sent", value: "$89,000", owner: "Mike Torres", date: "Jul 10, 2026" },
              { name: "Wireless Failover — Gulf PM", company: "Gulf Property Management", status: "Won", value: "$34,000", owner: "John Smith", date: "Jul 8, 2026" },
              { name: "Hosted PBX — Meridian", company: "Meridian Healthcare", status: "Contacted", value: "$51,000", owner: "Sarah Chen", date: "Jul 5, 2026" },
              { name: "POTS Replacement — Lakeside", company: "Lakeside Senior Living", status: "Lost", value: "$18,000", owner: "Mike Torres", date: "Jun 28, 2026" },
            ].map((l, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                <td className="px-4 py-3 text-gray-500">{l.company}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    l.status === "Won" ? "bg-green-100 text-green-700" :
                    l.status === "Qualified" || l.status === "Proposal Sent" ? "bg-blue-100 text-blue-700" :
                    l.status === "Contacted" ? "bg-amber-100 text-amber-700" :
                    l.status === "Lost" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>{l.status}</span>
                </td>
                <td className="px-4 py-3 font-medium">{l.value}</td>
                <td className="px-4 py-3 text-gray-500">{l.owner}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{l.date}</td>
                <td className="px-4 py-3"><ChevronRight size={14} className="text-gray-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
