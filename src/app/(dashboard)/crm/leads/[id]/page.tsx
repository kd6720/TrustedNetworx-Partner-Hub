"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EmailTimeline from "@/components/EmailTimeline";
import { ArrowLeft, DollarSign } from "lucide-react";
import Link from "next/link";
import type { Lead } from "@/lib/types";

const statusColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted: "bg-amber-100 text-amber-700",
  qualified: "bg-blue-100 text-blue-700",
  proposal_sent: "bg-blue-100 text-blue-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("leads").select("*").eq("id", id).single();
      setLead(data);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!lead) return <div className="text-center py-12 text-gray-400">Lead not found.</div>;

  return (
    <div className="space-y-6">
      <Link href="/crm/leads" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
        <ArrowLeft size={14} /> Back to Leads
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            {lead.company_name && <p className="text-sm text-gray-500 mt-1">{lead.company_name}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              {lead.contact_email && <span>{lead.contact_email}</span>}
              {lead.contact_phone && <span>{lead.contact_phone}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || "bg-gray-100 text-gray-700"}`}>
              {lead.status?.replace("_", " ")}
            </span>
            {lead.estimated_value && (
              <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <DollarSign size={14} /> {lead.estimated_value.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes */}
        {lead.notes && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-500 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* Email Timeline */}
        <div className={lead.notes ? "lg:col-span-2" : "lg:col-span-3"}>
          <EmailTimeline
            linkedType="lead"
            linkedId={id}
            linkedName={lead.name}
            linkedEmail={lead.contact_email ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
