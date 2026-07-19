"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Users, Target, Building2, FileText, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/lib/types";

type RecentLead = Pick<Lead, "id" | "name" | "company_name" | "status" | "estimated_value" | "created_at">;

export default function CrmPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ leads: 0, contacts: 0, companies: 0, won: 0 });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadData() {
      const [leadsRes, contactsRes, companiesRes, recentRes] = await Promise.all([
        supabase.from("leads").select("id, status", { count: "exact" }),
        supabase.from("contacts").select("id", { count: "exact" }),
        supabase.from("companies").select("id", { count: "exact" }),
        supabase.from("leads").select("id, name, company_name, status, estimated_value, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const won = ((leadsRes.data ?? []) as Pick<Lead, "id" | "status">[]).filter((l) => l.status === "won").length || 0;

      setStats({
        leads: leadsRes.count || 0,
        contacts: contactsRes.count || 0,
        companies: companiesRes.count || 0,
        won,
      });
      setRecentLeads(recentRes.data || []);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? "Admin — Global View" : "CRM Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? "All accounts, all data" : `${profile?.full_name || "Partner"} — your leads`}
          </p>
        </div>
        <Link href="/crm/leads" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add Lead
        </Link>
      </div>

      {isAdmin && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          🔐 Admin view: You see all accounts and all data. Agents see only their own records.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: stats.leads, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Companies", value: stats.companies, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Contacts", value: stats.contacts, icon: Phone, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Won Deals", value: stats.won, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{loading ? "—" : s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {recentLeads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Company</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Value</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((l, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 pr-4 font-medium text-gray-900">{l.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{l.company_name || "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      l.status === "won" ? "bg-green-100 text-green-700" :
                      ["qualified", "proposal_sent"].includes(l.status) ? "bg-blue-100 text-blue-700" :
                      l.status === "contacted" ? "bg-amber-100 text-amber-700" :
                      l.status === "lost" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{l.status}</span>
                  </td>
                  <td className="py-3 pr-4 font-medium">{l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
