"use client";

import { useState, useEffect } from "react";
import { X, Send, Paperclip, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional pre-fill
  toEmail?: string;
  toName?: string;
  subject?: string;
  linkedType?: "contact" | "lead" | "opportunity" | "company";
  linkedId?: string;
  linkedName?: string; // for display
}

export default function ComposeModal({ isOpen, onClose, toEmail, toName, subject: initialSubject, linkedType, linkedId, linkedName }: ComposeModalProps) {
  const { profile } = useAuth();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      loadConnections();
      setTo(toEmail || "");
      setSubject(initialSubject || "");
      setBody("");
      setError("");
    }
  }, [isOpen, toEmail, initialSubject]);

  async function loadConnections() {
    const { data } = await supabase.from("email_connections").select("*").eq("user_id", profile?.id).eq("is_active", true);
    setConnections(data || []);
    const defaultConn = data?.find((c: any) => c.is_default);
    setSelectedConnection(defaultConn?.id || data?.[0]?.id || "");
  }

  async function handleSend() {
    if (!to || !subject || !selectedConnection) {
      setError("Please fill in all required fields and select a sending account.");
      return;
    }
    setSending(true);
    setError("");

    // Get the connection details
    const { data: conn } = await supabase.from("email_connections").select("*").eq("id", selectedConnection).single();
    if (!conn) { setError("Email connection not found."); setSending(false); return; }

    // Send via our API route
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: conn.id,
        to: to,
        subject,
        body,
        linked_type: linkedType,
        linked_id: linkedId,
        smtp_host: conn.smtp_host,
        smtp_port: conn.smtp_port,
        smtp_user: conn.smtp_user,
        smtp_password_enc: conn.smtp_password_enc,
        from_address: conn.email_address,
        from_name: conn.display_name,
      }),
    });

    const result = await res.json();
    if (result.error) {
      setError(result.error);
    } else {
      // Log the email activity
      await supabase.from("email_activities").insert({
        account_id: profile!.account_id,
        user_id: profile!.id,
        connection_id: conn.id,
        direction: "sent",
        subject,
        body_text: body,
        snippet: body.slice(0, 200),
        from_address: conn.email_address,
        from_name: conn.display_name,
        to_addresses: [to],
        linked_type: linkedType || null,
        linked_id: linkedId || null,
        status: "sent",
      });

      onClose();
    }
    setSending(false);
  }

  if (!isOpen) return null;

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
              {connections.map((c: any) => (
                <option key={c.id} value={c.id}>{c.email_address}</option>
              ))}
            </select>
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
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
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
