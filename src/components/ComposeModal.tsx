"use client";

import { useState, useEffect } from "react";
import { X, Send, Paperclip, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EmailConnection {
  id: string;
  email_address: string;
  is_default: boolean | null;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  toEmail?: string;
  toName?: string;
  subject?: string;
  linkedType?: "contact" | "lead" | "opportunity" | "company";
  linkedId?: string;
  linkedName?: string;
}

export default function ComposeModal({ isOpen, toEmail, subject, ...rest }: ComposeModalProps) {
  if (!isOpen) return null;
  // Remount the modal content whenever it opens or its target changes so all
  // fields reset, matching the previous reset-on-open behavior.
  return (
    <ComposeModalContent
      key={`${toEmail ?? ""}|${subject ?? ""}`}
      toEmail={toEmail}
      subject={subject}
      {...rest}
    />
  );
}

function ComposeModalContent({ onClose, toEmail, subject: initialSubject, linkedType, linkedId, linkedName }: Omit<ComposeModalProps, "isOpen">) {
  const { profile } = useAuth();
  const [to, setTo] = useState(toEmail || "");
  const [subject, setSubject] = useState(initialSubject || "");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const supabase = createClient();
  const profileId = profile?.id;

  useEffect(() => {
    let cancelled = false;
    async function loadConnections() {
      const { data } = await supabase.from("email_connections").select("*").eq("user_id", profileId).eq("is_active", true);
      if (cancelled) return;
      const rows: EmailConnection[] = data || [];
      setConnections(rows);
      const defaultConn = rows.find((c) => c.is_default);
      setSelectedConnection(defaultConn?.id || rows[0]?.id || "");
    }
    loadConnections();
    return () => { cancelled = true; };
  }, [supabase, profileId]);

  async function handleSend() {
    if (!to || !subject || !selectedConnection) {
      setError("Please fill in all required fields and select a sending account.");
      return;
    }
    setSending(true);
    setError("");

    // Only send connection_id — server looks up credentials securely
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: selectedConnection,
        to,
        subject,
        body,
        linked_type: linkedType,
        linked_id: linkedId,
      }),
    });

    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Failed to send");
    } else {
      onClose();
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">New Message</h2>
            {linkedName && <p className="text-xs text-gray-400 mt-0.5">Re: {linkedName}</p>}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {/* From selector */}
        {connections.length > 1 && (
          <div className="px-5 pt-3">
            <select value={selectedConnection} onChange={e => setSelectedConnection(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 bg-gray-50">
              {connections.map((c) => (
                <option key={c.id} value={c.id}>{c.email_address}</option>
              ))}
            </select>
          </div>
        )}

        {connections.length === 0 && (
          <div className="px-5 pt-3">
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              No email account connected — go to <strong>Settings → Email Connections</strong> to set up sending.
            </p>
          </div>
        )}

        {/* To */}
        <div className="px-5 pt-3">
          <input
            type="email"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="To: email@company.com"
            className="w-full border-b border-gray-100 pb-2 text-sm focus:outline-none focus:border-[var(--color-brand-primary)]"
          />
        </div>

        {/* Subject */}
        <div className="px-5 pt-2">
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full border-b border-gray-100 pb-2 text-sm font-medium focus:outline-none focus:border-[var(--color-brand-primary)]"
          />
        </div>

        {/* Body */}
        <div className="px-5 pt-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your message..."
            rows={8}
            className="w-full text-sm focus:outline-none resize-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" aria-label="Attach file">
            <Paperclip size={16} />
          </button>

          {error && <p className="text-xs text-red-500 flex-1 mx-3">{error}</p>}

          <button
            onClick={handleSend}
            disabled={sending || !connections.length}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
