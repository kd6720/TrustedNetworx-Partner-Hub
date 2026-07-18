"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Shield, Clock, UserPlus, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
  const { profile } = useAuth();
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [pRes, aRes] = await Promise.all([
      supabase.from("pending_registrations").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("pending_registrations").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    setPending(pRes.data || []);
    setApproved((aRes.data || []).filter((r: any) => r.status !== "pending"));
    setLoading(false);
  }

  async function handleApprove(id: string, email: string, domain: string, companyName: string) {
    // Update registration status
    await supabase.from("pending_registrations").update({
      status: "approved",
      reviewed_by: profile?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);

    // Log to audit
    await supabase.from("audit_log").insert({
      actor_id: profile?.id,
      actor_email: profile?.email,
      action: "account_approved",
      details: { email, domain, company_name: companyName }
    });

    loadData();
  }

  async function handleDeny(id: string, email: string) {
    await supabase.from("pending_registrations").update({
      status: "denied",
      reviewed_by: profile?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);

    await supabase.from("audit_log").insert({
      actor_id: profile?.id,
      actor_email: profile?.email,
      action: "account_denied",
      details: { email }
    });

    loadData();
  }

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Shield size={48} className="text-gray-300 mb-3" />
        <h1 className="text-xl font-bold text-gray-900">Admin Access Required</h1>
        <p className="text-sm text-gray-500 mt-1">This panel is restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Account approvals, role management, audit log</p>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          {pending.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{pending.length}</span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-4">Loading...</p>
        ) : pending.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <CheckCircle2 size={16} className="text-green-400" /> No pending requests
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
                <div>
                  <p className="font-medium text-gray-900">{r.full_name || r.email}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{r.email}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded">@{r.domain}</span>
                    <span>{r.company_name}</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(r.id, r.email, r.domain, r.company_name)}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button onClick={() => handleDeny(r.id, r.email)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    <XCircle size={14} /> Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Registrations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Domain</th>
                <th className="pb-3 pr-4">Company</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((r: any) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">{r.full_name || "—"}</td>
                  <td className="py-3 pr-4 text-gray-500">{r.email}</td>
                  <td className="py-3 pr-4 text-gray-500">@{r.domain}</td>
                  <td className="py-3 pr-4 text-gray-500">{r.company_name || "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "approved" ? "bg-green-100 text-green-700" :
                      r.status === "denied" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus size={18} className="text-[var(--color-brand-primary)]" />
            <h3 className="font-semibold text-gray-900">Invite Partner</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Manually invite a partner by email. They&apos;ll receive a signup link.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem("inviteEmail") as HTMLInputElement;
            const inviteEmail = input.value;
            if (!inviteEmail) return;
            const domain = inviteEmail.split("@")[1];
            const res = await fetch("/api/admin/invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: inviteEmail }),
            });
            const result = await res.json();
            if (result.error) {
              alert(result.error);
            } else {
              await supabase.from("audit_log").insert({
                actor_id: profile?.id,
                actor_email: profile?.email,
                action: "user_invited",
                details: { email: inviteEmail },
              });
              alert(`Invite sent to ${inviteEmail}`);
              input.value = "";
            }
          }} className="flex gap-2">
            <input name="inviteEmail" type="email" placeholder="partner@agency.com"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" required />
            <button type="submit" className="rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Invite
            </button>
          </form>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900">Audit Log</h3>
          </div>
          <p className="text-sm text-gray-500">View all admin actions, role changes, and cross-account access.</p>
          <button className="mt-3 text-sm text-[var(--color-brand-primary)] hover:underline">View Audit Log →</button>
        </div>
      </div>
    </div>
  );
}
