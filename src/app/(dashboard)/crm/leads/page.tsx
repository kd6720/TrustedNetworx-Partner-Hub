"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, ChevronRight, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Lead } from "@/lib/types";

const statuses = ["All", "new", "contacted", "qualified", "proposal_sent", "won", "lost"];

export default function LeadsPage() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // Form state
  const [leadName, setLeadName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [leadStatus, setLeadStatus] = useState("new");
  const [leadNotes, setLeadNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadLeads = useCallback(async () => {
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "All") query = query.eq("status", statusFilter);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data } = await query;
    setLeads(data || []);
    setLoading(false);
  }, [supabase, search, statusFilter]);

  useEffect(() => {
    async function load() {
      await loadLeads();
    }
    load();
  }, [loadLeads]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function openModal() {
    setLeadName(""); setCompany(""); setEmail(""); setPhone("");
    setLeadStatus("new"); setLeadNotes(""); setFormErrors({});
    setShowModal(true);
  }

  async function handleSubmit() {
    const errors: Record<string, string> = {};
    if (!leadName.trim()) errors.leadName = "Name is required";
    if (email && !email.includes("@")) errors.email = "Invalid email";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("leads").insert({
      account_id: "00000000-0000-0000-0000-000000000001",
      name: leadName.trim(),
      company_name: company || null,
      contact_email: email || null,
      contact_phone: phone || null,
      status: leadStatus,
      notes: leadNotes || null,
      owner_user_id: user?.id,
    });

    setSubmitting(false);
    if (error) { showToast("error", error.message); return; }

    showToast("success", "Lead added!");
    setShowModal(false);
    loadLeads();
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
          toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{profile?.role === "admin" ? "All accounts" : "Your leads"}</p>
        </div>
        <button onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
          {statuses.map(s => <option key={s}>{s === "new" ? "New" : s === "contacted" ? "Contacted" : s === "qualified" ? "Qualified" : s === "proposal_sent" ? "Proposal Sent" : s === "won" ? "Won" : s === "lost" ? "Lost" : s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400"><Loader2 size={20} className="animate-spin mx-auto" /></div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No leads found. Click Add Lead to create one.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3">Lead</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Value</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} onClick={() => router.push(`/crm/leads/${l.id}`)}
                  className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                  <td className="px-4 py-3 text-gray-500">{l.company_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      l.status === "won" ? "bg-green-100 text-green-700" :
                      ["qualified", "proposal_sent"].includes(l.status) ? "bg-blue-100 text-blue-700" :
                      l.status === "contacted" ? "bg-amber-100 text-amber-700" :
                      l.status === "lost" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
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

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Lead</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={leadName} onChange={e => setLeadName(e.target.value)}
                  className={`w-full rounded-lg border ${formErrors.leadName ? "border-red-300" : "border-gray-300"} px-3 py-2 text-sm`} />
                {formErrors.leadName && <p className="text-xs text-red-500 mt-1">{formErrors.leadName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input value={company} onChange={e => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    className={`w-full rounded-lg border ${formErrors.email ? "border-red-300" : "border-gray-300"} px-3 py-2 text-sm`} />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={leadStatus} onChange={e => setLeadStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                  {statuses.filter(s => s !== "All").map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={leadNotes} onChange={e => setLeadNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-brand-primary)] rounded-lg hover:bg-[var(--color-brand-secondary)] disabled:opacity-50">
                {submitting ? "Adding..." : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
