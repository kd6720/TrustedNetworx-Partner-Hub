"use client";

import { useEffect, useState } from "react";
import { Mail, Send, ArrowDown, ArrowUp, Clock, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ComposeModal from "@/components/ComposeModal";

interface Props {
  linkedType: "contact" | "lead" | "opportunity" | "company";
  linkedId: string;
  linkedName?: string;
  linkedEmail?: string;
}

export default function EmailTimeline({ linkedType, linkedId, linkedName, linkedEmail }: Props) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadActivities();
  }, [linkedId, linkedType]);

  async function loadActivities() {
    const { data } = await supabase
      .from("email_activities")
      .select("*")
      .eq("linked_type", linkedType)
      .eq("linked_id", linkedId)
      .order("created_at", { ascending: false })
      .limit(20);
    setActivities(data || []);
    setLoading(false);
  }

  function formatDate(d: string) {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-[var(--color-brand-primary)]" />
            <h3 className="font-semibold text-gray-900">Email Timeline</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{activities.length}</span>
          </div>
          <button
            onClick={() => setComposeOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            <Plus size={13} /> Compose
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              <Clock size={16} className="mr-2 animate-pulse" />
              Loading timeline...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Mail size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No emails yet</p>
              <p className="text-xs text-gray-400 mt-1">
                {linkedEmail
                  ? `Send an email to ${linkedEmail} to start the conversation.`
                  : "Compose an email to get started."}
              </p>
              <button
                onClick={() => setComposeOpen(true)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--color-brand-primary)] hover:underline"
              >
                <Send size={12} /> Compose First Email
              </button>
            </div>
          ) : (
            activities.map((email) => (
              <div key={email.id} className="px-5 py-3.5 hover:bg-gray-50/50 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  {/* Direction icon */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                    email.direction === "sent" ? "bg-blue-50" : "bg-green-50"
                  }`}>
                    {email.direction === "sent" ? (
                      <ArrowUp size={14} className="text-blue-500" />
                    ) : (
                      <ArrowDown size={14} className="text-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${
                          email.direction === "sent"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {email.direction === "sent" ? "Sent" : "Received"}
                        </span>
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {email.subject || "(no subject)"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(email.created_at)}</span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {email.direction === "sent"
                        ? `To: ${email.to_addresses?.[0] || "unknown"}`
                        : `From: ${email.from_name || email.from_address}`}
                    </p>

                    {email.snippet && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{email.snippet}</p>
                    )}

                    {email.status === "bounced" && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-500">
                        ⚠ Bounced
                      </span>
                    )}
                    {email.status === "failed" && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-500">
                        ⚠ Failed — {email.error_message?.slice(0, 80)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Compose modal */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => { setComposeOpen(false); loadActivities(); }}
        toEmail={linkedEmail}
        toName={linkedName}
        linkedType={linkedType}
        linkedId={linkedId}
        linkedName={linkedName}
      />
    </>
  );
}
