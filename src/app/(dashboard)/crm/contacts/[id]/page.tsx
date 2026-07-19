"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EmailTimeline from "@/components/EmailTimeline";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import Link from "next/link";
import type { Contact } from "@/lib/types";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("contacts").select("*").eq("id", id).single();
      setContact(data);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!contact) return <div className="text-center py-12 text-gray-400">Contact not found.</div>;

  return (
    <div className="space-y-6">
      <Link href="/crm/contacts" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
        <ArrowLeft size={14} /> Back to Contacts
      </Link>

      {/* Contact header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contact.first_name} {contact.last_name}</h1>
            {contact.title && <p className="text-sm text-gray-500 mt-1">{contact.title}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              {contact.email && <span className="flex items-center gap-1"><Mail size={14} /> {contact.email}</span>}
              {contact.phone && <span className="flex items-center gap-1"><Phone size={14} /> {contact.phone}</span>}
            </div>
          </div>
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {contact.status || "Active"}
          </span>
        </div>
      </div>

      {/* Email Timeline */}
      <EmailTimeline
        linkedType="contact"
        linkedId={id}
        linkedName={`${contact.first_name} ${contact.last_name}`}
        linkedEmail={contact.email ?? undefined}
      />
    </div>
  );
}
