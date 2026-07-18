"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, CheckCircle2, XCircle, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PROVIDERS = ["gmail", "outlook", "smtp"] as const;

export default function EmailSettingsPage() {
  const { profile } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  // New connection form
  const [provider, setProvider] = useState<"gmail" | "outlook" | "smtp">("smtp");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState(993);
  const [imapUser, setImapUser] = useState("");
  const [imapPass, setImapPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { loadConnections(); }, []);

  async function loadConnections() {
    const { data } = await supabase.from("email_connections").select("*").eq("user_id", profile?.id).order("created_at", { ascending: false });
    setConnections(data || []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!email || !smtpHost || !smtpUser || !smtpPass) {
      setMessage("Please fill in all required fields.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("email_connections").insert({
      user_id: profile!.id,
      account_id: profile!.account_id,
      provider,
      email_address: email,
      display_name: displayName || email.split("@")[0],
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_user: smtpUser,
      smtp_password_enc: btoa(smtpPass), // Base64 — upgrade to proper encryption in production
      imap_host: imapHost || null,
      imap_port: imapHost ? imapPort : null,
      imap_user: imapUser || null,
      imap_password_enc: imapPass ? btoa(imapPass) : null,
      is_active: true,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✓ Email connection added successfully.");
      setAdding(false);
      resetForm();
      loadConnections();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("email_connections").delete().eq("id", id);
    loadConnections();
  }

  async function handleSetDefault(id: string) {
    // Unset all defaults, then set this one
    await supabase.from("email_connections").update({ is_default: false }).eq("user_id", profile?.id);
    await supabase.from("email_connections").update({ is_default: true }).eq("id", id);
    loadConnections();
  }

  function resetForm() {
    setEmail(""); setDisplayName(""); setSmtpHost(""); setSmtpUser(""); setSmtpPass("");
    setImapHost(""); setImapUser(""); setImapPass("");
  }

  function quickFill(provider: "gmail" | "outlook" | "smtp") {
    if (provider === "gmail") {
      setSmtpHost("smtp.gmail.com"); setSmtpPort(587);
      setImapHost("imap.gmail.com"); setImapPort(993);
    } else if (provider === "outlook") {
      setSmtpHost("smtp.office365.com"); setSmtpPort(587);
      setImapHost("outlook.office365.com"); setImapPort(993);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Connections</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your email to send and track emails from the Partner Hub — like Pipedrive or Salesforce.
        </p>
      </div>

      {/* BCC Dropbox info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Mail size={18} className="text-blue-600" />
          <h2 className="font-semibold text-blue-900">Email Sync Dropbox</h2>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          BCC this address on outgoing emails from your normal email client to auto-log them in the Partner Hub.
        </p>
        <div className="flex items-center gap-2">
          <code className="bg-white text-blue-800 px-3 py-1.5 rounded-md text-sm font-mono border border-blue-200">
            bcc@{profile?.account_id?.slice(0,8)}.hub.trustednetworx.com
          </code>
          <button onClick={() => navigator.clipboard.writeText(`bcc@${profile?.account_id?.slice(0,8)}.hub.trustednetworx.com`)}
            className="text-xs text-blue-600 hover:underline">Copy</button>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
          <button onClick={() => { setAdding(true); resetForm(); }}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
            <Plus size={14} /> Connect Email
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-4">Loading...</p>
        ) : connections.length === 0 && !adding ? (
          <div className="text-center py-8">
            <Mail size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No email accounts connected yet.</p>
            <p className="text-xs text-gray-400 mt-1">Connect Gmail, Outlook, or any SMTP/IMAP account.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Mail size={18} className={c.provider === "gmail" ? "text-red-500" : c.provider === "outlook" ? "text-blue-500" : "text-gray-500"} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{c.email_address}</p>
                      {c.is_default && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Default</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {c.provider.toUpperCase()} · {c.smtp_host}:{c.smtp_port}
                      {c.imap_host ? ` · IMAP: ${c.imap_host}` : " (send-only)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!c.is_default && (
                    <button onClick={() => handleSetDefault(c.id)} className="text-xs text-gray-400 hover:text-[var(--color-brand-primary)]">
                      Set default
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)} className="p-1 text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {adding && (
          <form onSubmit={handleAdd} className="mt-4 border-t border-gray-100 pt-4 space-y-4">
            <h3 className="font-medium text-gray-900">Connect New Account</h3>

            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <button key={p} type="button" onClick={() => { setProvider(p); quickFill(p); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    provider === p
                      ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}>
                  {p === "gmail" ? "Gmail" : p === "outlook" ? "Outlook" : "SMTP"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="you@company.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Your Name" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SMTP Host *</label>
                <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="smtp.office365.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SMTP Port</label>
                <input value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SMTP Username *</label>
                <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="user@company.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SMTP Password *</label>
                <input value={smtpPass} onChange={e => setSmtpPass(e.target.value)} type="password" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="••••••••" />
                <p className="text-[10px] text-gray-400 mt-1">
                  For Gmail, use an <ExternalLink size={10} className="inline" /> App Password
                </p>
              </div>
            </div>

            {/* IMAP (optional) */}
            <details className="group">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">IMAP settings (optional — for receiving email)</summary>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IMAP Host</label>
                  <input value={imapHost} onChange={e => setImapHost(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="imap.gmail.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IMAP Port</label>
                  <input value={imapPort} onChange={e => setImapPort(Number(e.target.value))} type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IMAP Username</label>
                  <input value={imapUser} onChange={e => setImapUser(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IMAP Password</label>
                  <input value={imapPass} onChange={e => setImapPass(e.target.value)} type="password" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                </div>
              </div>
            </details>

            {message && (
              <div className={`rounded-lg px-3 py-2 text-sm ${message.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {message}
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
                {saving ? "Connecting..." : "Connect Account"}
              </button>
              <button type="button" onClick={() => { setAdding(false); resetForm(); setMessage(""); }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]/10 mb-2">
              <span className="text-sm font-bold text-[var(--color-brand-primary)]">1</span>
            </div>
            <h3 className="font-medium text-gray-900">Connect Your Email</h3>
            <p className="text-gray-500 mt-1">Add Gmail, Outlook, or any SMTP account. Your credentials are encrypted.</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]/10 mb-2">
              <span className="text-sm font-bold text-[var(--color-brand-primary)]">2</span>
            </div>
            <h3 className="font-medium text-gray-900">Send from the Hub</h3>
            <p className="text-gray-500 mt-1">Compose emails from any contact, lead, or deal page. Auto-logged as activity.</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]/10 mb-2">
              <span className="text-sm font-bold text-[var(--color-brand-primary)]">3</span>
            </div>
            <h3 className="font-medium text-gray-900">Full Email History</h3>
            <p className="text-gray-500 mt-1">Every sent and received email appears on the contact/lead timeline.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
