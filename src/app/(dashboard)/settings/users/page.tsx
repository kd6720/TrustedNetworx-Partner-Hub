"use client";

import { Mail, X } from "lucide-react";

const teamMembers = [
  {
    name: "Carter Dewey",
    email: "carter@trustednetworx.com",
    role: "Admin" as const,
    isYou: true,
  },
  {
    name: "Angel Garcia",
    email: "angel@trustednetworx.com",
    role: "Rep" as const,
  },
  {
    name: "Deeno Perez",
    email: "deeno@trustednetworx.com",
    role: "Rep" as const,
  },
];

const keyContacts = {
  billing: { name: "Carter Dewey", email: "carter@trustednetworx.com", phone: "305-498-7530" },
  support: { name: "TrustedNetworx NOC", email: "support@trustednetworx.com", phone: "305-498-7530" },
  legal: { name: "Carter Dewey", email: "legal@trustednetworx.com", phone: "305-498-7530" },
};

export default function UsersPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Invite User */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Invite Team Member
        </h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="colleague@example.com"
              className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>
          <select className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
            <option>Rep</option>
            <option>Admin</option>
          </select>
          <button className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
            Invite User
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Team Members
        </h3>
        <div className="space-y-3">
          {teamMembers.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white text-sm font-semibold">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {m.name}{" "}
                    {m.isYou && (
                      <span className="text-xs text-gray-400">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    m.role === "Admin"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {m.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  Edit Profile
                </button>
                {!m.isYou && (
                  <button className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Contacts */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Key Contacts
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(keyContacts).map(([type, contact]) => (
            <div key={type}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {type}
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <label className="text-xs text-gray-400">Name</label>
                  <input
                    defaultValue={contact.name}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Email</label>
                  <input
                    defaultValue={contact.email}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Phone</label>
                  <input
                    defaultValue={contact.phone}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm mt-0.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Save Contacts
        </button>
      </div>
    </div>
  );
}
