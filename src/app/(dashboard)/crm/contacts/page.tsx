"use client";

import { Search, Plus, Mail, Phone, Building2 } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add Contact
        </button>
      </div>
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Search contacts..." className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Maria Santos", title: "CIO", company: "Metro Health", email: "msantos@metrohealth.com", phone: "555-0101", status: "Qualified" },
              { name: "David Park", title: "IT Director", company: "Sunrise Group", email: "dpark@sunrise.com", phone: "555-0102", status: "New" },
              { name: "Lisa Chen", title: "VP Ops", company: "BAE District", email: "lchen@bae.edu", phone: "555-0103", status: "Contacted" },
              { name: "Tom Wilson", title: "CFO", company: "Coastal Retail", email: "twilson@crc.com", phone: "555-0104", status: "Proposal Sent" },
              { name: "Anna Lee", title: "CEO", company: "Gulf PM", email: "alee@gpm.com", phone: "555-0105", status: "Customer" },
            ].map((c, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.company}</td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
