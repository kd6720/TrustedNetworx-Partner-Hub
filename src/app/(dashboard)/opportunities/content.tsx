"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const stages = [
  "1. Qualification",
  "2. Site Survey",
  "3. Proposal",
  "4. Contracting",
  "5. Closed Won",
  "6. Awaiting Install",
  "7. Activated",
];

const verticals = ["senior_living", "hospitality", "healthcare", "property_management", "enterprise"];

interface Opportunity {
  id: string; company_name: string; stage: number; close_date: string | null;
  lines: number; mrc_per_line: number; vertical: string | null;
  contact_name: string | null; contact_email: string | null; notes: string | null;
  owner_id: string; created_at: string;
}

export default function OpportunitiesContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [stage, setStageState] = useState(1);
  const [lines, setLines] = useState(1);
  const [mrcPerLine, setMrcPerLine] = useState(40);
  const [vertical, setVertical] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { loadOpportunities(); }, []);

  async function loadOpportunities() {
    const { data } = await supabase.from("opportunities").select("*").order("created_at", { ascending: false });
    if (data) setOpportunities(data as Opportunity[]);
    setLoading(false);
  }

  // Auto-open modal when navigating from header (+ Register opportunity)
  useEffect(() => {
    if (searchParams.get("create") === "true") openModal();
  }, [searchParams]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function resetForm() {
    setCompanyName(""); setStageState(1); setLines(1); setMrcPerLine(40);
    setVertical(""); setContactName(""); setContactEmail(""); setNotes("");
    setFormErrors({});
  }

  async function handleSubmit() {
    // Validate
    const errors: Record<string, string> = {};
    if (!companyName.trim()) errors.companyName = "Company name is required";
    if (contactEmail && !contactEmail.includes("@")) errors.contactEmail = "Invalid email";
    if (lines < 1) errors.lines = "Must be at least 1";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("opportunities").insert({
      company_name: companyName.trim(),
      stage,
      lines,
      mrc_per_line: mrcPerLine,
      vertical: vertical || null,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      notes: notes || null,
      created_by: user?.id,
      owner_id: user?.id,
      account_id: "00000000-0000-0000-0000-000000000001",
    });

    setSubmitting(false);

    if (error) {
      showToast("error", error.message);
    } else {
      showToast("success", companyName + " registered!");
      setShowModal(false);
      resetForm();
      loadOpportunities();
    }
  }

  function openModal() {
    resetForm();
    setShowModal(true);
  }

  const stageLabel = (n: number) => stages[n - 1] || `Stage ${n}`;
  const acv = (l: number, m: number) => `$${(l * m * 12).toLocaleString()}`;

  const filtered = opportunities.filter(d => {
    const matchesSearch = d.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "All Stages" || stageLabel(d.stage) === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
          toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Opportunity Pipeline</h2>
        <button onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
          <Plus size={16} /> Create Opportunity
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search by company name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
            className="rounded-lg border border-gray-300 pl-9 pr-8 py-2 text-sm appearance-none bg-white">
            <option>All Stages</option>
            {stages.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lines</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. ACV</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No opportunities yet. Create your first one!</td></tr>
            ) : (
              filtered.map(opp => (
                <tr key={opp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{opp.company_name}</p>
                    <p className="text-sm text-gray-500">{opp.contact_name || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      {stageLabel(opp.stage)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {opp.close_date ? new Date(opp.close_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{opp.lines}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{acv(opp.lines, opp.mrc_per_line)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/opportunities/${opp.id}`} className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Opportunity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Register Opportunity</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                  className={`w-full rounded-lg border ${formErrors.companyName ? "border-red-300" : "border-gray-300"} px-3 py-2 text-sm`}
                  placeholder="Enter company name" />
                {formErrors.companyName && <p className="text-xs text-red-500 mt-1">{formErrors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select value={stage} onChange={e => setStageState(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                  {stages.map((s, i) => <option key={s} value={i + 1}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lines / Sites</label>
                  <input type="number" value={lines} onChange={e => setLines(parseInt(e.target.value) || 0)}
                    className={`w-full rounded-lg border ${formErrors.lines ? "border-red-300" : "border-gray-300"} px-3 py-2 text-sm`} />
                  {formErrors.lines && <p className="text-xs text-red-500 mt-1">{formErrors.lines}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRC per Line</label>
                  <input type="number" value={mrcPerLine} onChange={e => setMrcPerLine(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                <select value={vertical} onChange={e => setVertical(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="">— Select —</option>
                  {verticals.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                  className={`w-full rounded-lg border ${formErrors.contactEmail ? "border-red-300" : "border-gray-300"} px-3 py-2 text-sm`} />
                {formErrors.contactEmail && <p className="text-xs text-red-500 mt-1">{formErrors.contactEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3}
                  placeholder="Optional context for your TrustedNetworx rep" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-brand-primary)] rounded-lg hover:bg-[var(--color-brand-secondary)] disabled:opacity-50">
                {submitting ? "Registering..." : "Register opportunity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
