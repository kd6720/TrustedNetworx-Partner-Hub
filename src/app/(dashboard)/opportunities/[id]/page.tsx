"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const allStages = [
  "1. Qualification", "2. Site Survey", "3. Proposal", "4. Contracting",
  "5. Closed Won", "6. Awaiting Install", "7. Activated",
];

interface Opp {
  id: string; company_name: string; stage: number; close_date: string | null;
  lines: number; mrc_per_line: number; vertical: string | null;
  contact_name: string | null; contact_email: string | null; notes: string | null;
  owner_id: string; created_by: string; created_at: string; last_advanced_at: string | null;
}

export default function DealDetailPage() {
  const params = useParams();
  const supabase = useMemo(() => createClient(), []);
  const [opp, setOpp] = useState<Opp | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Editable fields
  const [closeDate, setCloseDate] = useState("");
  const [lines, setLines] = useState(0);
  const [mrc, setMrc] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadDeal = useCallback(async () => {
    const { data } = await supabase.from("opportunities").select("*").eq("id", params.id).single();
    if (data) {
      setOpp(data as Opp);
      setCloseDate(data.close_date || "");
      setLines(data.lines || 0);
      setMrc(data.mrc_per_line || 0);
    }
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    async function run() { await loadDeal(); }
    run();
  }, [loadDeal]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from("opportunities").update({
      close_date: closeDate || null,
      lines,
      mrc_per_line: mrc,
      updated_at: new Date().toISOString(),
    }).eq("id", params.id);
    setSaving(false);
    if (error) { showToast("error", error.message); return; }
    showToast("success", "Changes saved");
    loadDeal();
  }

  async function handleAdvance() {
    if (!opp || opp.stage >= 7) return;
    if (opp.stage === 4) {
      setShowConfirm(true); // Confirm before Closed Won
      return;
    }
    await doAdvance();
  }

  async function doAdvance() {
    const newStage = (opp?.stage || 1) + 1;
    const { error } = await supabase.from("opportunities").update({
      stage: newStage,
      last_advanced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", params.id);
    if (error) { showToast("error", error.message); return; }
    showToast("success", `Advanced to ${allStages[newStage - 1]}`);
    setShowConfirm(false);
    loadDeal();
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  if (!opp) return <div className="text-center py-20 text-gray-400">Opportunity not found.</div>;

  const acv = opp.lines * opp.mrc_per_line * 12;

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

      <div className="flex items-center gap-2">
        <Link href="/opportunities" className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Opportunities
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{opp.company_name}</h1>
        <span className="inline-flex items-center rounded-full bg-[var(--color-brand-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-brand-primary)]">
          {allStages[opp.stage - 1]}
        </span>
      </div>

      {/* Stage Stepper */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {allStages.map((s, i) => (
            <div key={s} className="flex items-center">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                i + 1 === opp.stage ? "bg-[var(--color-brand-primary)] text-white" :
                i + 1 < opp.stage ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-400"
              }`}>{s}</span>
              {i < allStages.length - 1 && <ChevronRight size={14} className="text-gray-300 mx-1" />}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Created: {new Date(opp.created_at).toLocaleDateString()}</span>
          <span>Last advanced: {opp.last_advanced_at ? new Date(opp.last_advanced_at).toLocaleDateString() : "—"}</span>
        </div>
        {opp.stage < 7 && (
          <button onClick={handleAdvance}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-secondary)]">
            Advance to {allStages[opp.stage]}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Opportunity Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Created</label>
              <p className="text-sm font-medium">{new Date(opp.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Close Date</label>
              <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lines / Sites</label>
              <input type="number" value={lines} onChange={e => setLines(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">MRC per Line</label>
              <input type="number" value={mrc} onChange={e => setMrc(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
          </div>
          <div className="mt-4 p-4 bg-[var(--color-brand-primary)]/5 rounded-xl border border-[var(--color-brand-primary)]/20">
            <p className="text-xs text-gray-500 mb-1">Estimated ACV</p>
            <p className="text-2xl font-bold text-gray-900">${acv.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{opp.lines} lines × ${opp.mrc_per_line} × 12 months</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div><p className="text-xs text-gray-500">Company</p><p className="font-medium">{opp.company_name}</p></div>
            <div><p className="text-xs text-gray-500">Vertical</p><p className="font-medium">{opp.vertical || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Contact</p><p className="font-medium">{opp.contact_name || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{opp.contact_email || "—"}</p></div>
          </div>
        </div>
      </div>

      {/* Confirm Closed Won */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm z-50 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Close Opportunity?</h3>
            <p className="text-sm text-gray-500 mb-6">Advance {opp.company_name} to <strong>Closed Won</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={doAdvance} className="px-4 py-2 text-sm bg-[var(--color-brand-primary)] text-white rounded-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
