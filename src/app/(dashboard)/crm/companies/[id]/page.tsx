"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EmailTimeline from "@/components/EmailTimeline";
import { ArrowLeft, Globe, Users, Target, Building2 } from "lucide-react";
import Link from "next/link";
import type { Company } from "@/lib/types";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [leadCount, setLeadCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      const { data: co } = await supabase.from("companies").select("*").eq("id", id).single();
      if (!co) { setLoading(false); return; }
      setCompany(co);
      const [{ count: lc }, { count: cc }] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("company_name", co.name),
        supabase.from("contacts").select("id", { count: "exact", head: true }).eq("company_id", id),
      ]);
      setLeadCount(lc || 0);
      setContactCount(cc || 0);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!company) return <div className="text-center py-12 text-gray-400">Company not found.</div>;

  return (
    <div className="space-y-6">
      <Link href="/crm/companies" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
        <ArrowLeft size={14} /> Back to Companies
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
            <Building2 size={24} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {company.industry && <span>{company.industry}</span>}
              {company.website && <span className="flex items-center gap-1"><Globe size={13} /> {company.website}</span>}
              <span className="flex items-center gap-1"><Target size={13} /> {leadCount} leads</span>
              <span className="flex items-center gap-1"><Users size={13} /> {contactCount} contacts</span>
            </div>
            {company.address && (
              <p className="text-sm text-gray-400 mt-2">
                {[company.address, company.city, company.state, company.zip].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      <EmailTimeline linkedType="company" linkedId={id} linkedName={company.name} />
    </div>
  );
}
