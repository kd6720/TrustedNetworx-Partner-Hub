"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const statuses = ["All", "new", "contacted", "qualified", "proposal_sent", "won", "lost"];

export default function LeadsPage() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "All") query = query.eq("status", statusFilter);
      if (search) query = query.ilike("name", `%${search}%`);
      const { data } = await query;
      setLeads(data || []);
      setLoading(false);
    }
    load();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{profile?.role === "admin" ? "All accounts" : "Your leads"}</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No leads found. {profile?.role === "admin" ? "No leads exist yet in any account." : "Add your first lead to get started."}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l: any, i: number) => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                  <td className="px-4 py-3 text-gray-500">{l.company_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      l.status === "won" ? "bg-green-100 text-green-700" :
                      ["qualified", "proposal_sent"].includes(l.status) ? "bg-blue-100 text-blue-700" :
                      l.status === "contacted" ? "bg-amber-100 text-amber-700" :
                      l.status === "lost" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><ChevronRight size={14} className="text-gray-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
