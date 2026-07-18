"use client";

import { BarChart3, TrendingUp, Users, Target, Phone, Building2, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function CrmPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Lead &amp; pipeline management</p>
        </div>
        <Link href="/crm/leads" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: "247", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Qualified", value: "84", icon: Target, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pipeline Value", value: "$342K", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Won This Month", value: "12", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Leads", desc: "Track and manage leads", href: "/crm/leads", icon: Target },
          { label: "Contacts", desc: "People directory", href: "/crm/contacts", icon: Phone },
          { label: "Companies", desc: "Organization profiles", href: "/crm/companies", icon: Building2 },
          { label: "Forms", desc: "Lead capture forms", href: "/crm/forms", icon: FileText },
        ].map(item => (
          <Link key={item.label} href={item.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <item.icon size={24} className="text-[var(--color-brand-primary)] mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-brand-primary)]">{item.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Company</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Value</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Metro Health Systems", company: "Metro Health", status: "Qualified", value: "$45,000", date: "Jul 14" },
              { name: "Sunrise Hospitality", company: "Sunrise Group", status: "New", value: "$28,000", date: "Jul 13" },
              { name: "Bay Area Education", company: "BAE District", status: "Contacted", value: "$62,000", date: "Jul 12" },
              { name: "Coastal Retail Corp", company: "CRC", status: "Proposal Sent", value: "$89,000", date: "Jul 10" },
              { name: "Gulf Property Mgmt", company: "GPM", status: "Won", value: "$34,000", date: "Jul 8" },
            ].map((l, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 pr-4 font-medium text-gray-900">{l.name}</td>
                <td className="py-3 pr-4 text-gray-500">{l.company}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    l.status === "Won" ? "bg-green-100 text-green-700" :
                    l.status === "Qualified" || l.status === "Proposal Sent" ? "bg-blue-100 text-blue-700" :
                    l.status === "Contacted" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>{l.status}</span>
                </td>
                <td className="py-3 pr-4 font-medium">{l.value}</td>
                <td className="py-3 text-gray-400 text-xs">{l.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
