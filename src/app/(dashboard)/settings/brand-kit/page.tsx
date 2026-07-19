"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import NextImage from "next/image";
import { Palette, Upload, Building2, Eye, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULTS = { primary: "#06b6d4", accent: "#0891b2", sidebar: "#0f172a" };

export default function BrandKitPage() {
  const { profile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULTS.primary);
  const [accentColor, setAccentColor] = useState(DEFAULTS.accent);
  const [sidebarColor, setSidebarColor] = useState(DEFAULTS.sidebar);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const isManager = profile?.role === "admin" || profile?.role === "manager";

  const accountId = profile?.account_id;

  const loadBranding = useCallback(async () => {
    if (!accountId) { setLoading(false); return; }
    const { data } = await supabase
      .from("account_branding")
      .select("*")
      .eq("account_id", accountId)
      .single();

    if (data) {
      setCompanyName(data.company_name_override || "");
      setLogoUrl(data.logo_url);
      setPrimaryColor(data.primary_color || DEFAULTS.primary);
      setAccentColor(data.accent_color || DEFAULTS.accent);
      setSidebarColor(data.sidebar_color || DEFAULTS.sidebar);
    }
    setLoading(false);
  }, [accountId, supabase]);

  useEffect(() => {
    async function run() {
      await loadBranding();
    }
    run();
  }, [loadBranding]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function uploadLogo(file: File) {
    if (!profile?.account_id) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `${profile.account_id}/logo.${ext}`;

    setLogoUploading(true);
    const { error } = await supabase.storage
      .from("branding")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    setLogoUploading(false);

    if (error) {
      showToast("error", error.message || "Failed to upload logo");
      return null;
    }

    const { data: urlData } = supabase.storage.from("branding").getPublicUrl(path);
    return urlData.publicUrl;
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Logo must be under 5MB");
      return;
    }
    const url = await uploadLogo(file);
    if (url) {
      setLogoUrl(url);
      showToast("success", "Logo uploaded");
    }
  }

  async function saveBranding(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/account/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name_override: companyName,
        logo_url: logoUrl,
        primary_color: primaryColor,
        accent_color: accentColor,
        sidebar_color: sidebarColor,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) showToast("success", "Branding saved");
    else showToast("error", data.error || "Failed to save");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="card p-6 max-w-3xl">
        <div className="text-center py-8">
          <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Branding Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            Only account managers and admins can customize branding. Contact your manager to update the brand kit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
          toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <form onSubmit={saveBranding}>
        {/* Colors */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Brand Colors</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Primary Color", value: primaryColor, set: setPrimaryColor, desc: "Buttons, links, icons" },
              { label: "Accent Color", value: accentColor, set: setAccentColor, desc: "Hover states, highlights" },
              { label: "Sidebar Color", value: sidebarColor, set: setSidebarColor, desc: "Navigation background" },
            ].map(({ label, value, set, desc }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg border border-gray-200 flex-shrink-0" style={{ backgroundColor: value }} />
                  <input
                    type="color" value={value} onChange={e => set(e.target.value)}
                    className="h-9 w-9 rounded border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text" value={value} onChange={e => set(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono"
                    pattern="^#[0-9a-fA-F]{6}$"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Company Logo</h3>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 cursor-pointer hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-colors overflow-hidden"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoUrl ? (
                <NextImage src={logoUrl} alt="Logo preview" width={96} height={96} unoptimized className="h-full w-full object-contain p-2" />
              ) : logoUploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Upload size={24} />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Click to upload your logo</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, or SVG up to 5MB</p>
              {logoUrl && (
                <button type="button" onClick={() => { setLogoUrl(null); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                  className="text-xs text-red-500 hover:text-red-700 mt-2">
                  Remove logo
                </button>
              )}
            </div>
          </div>
          <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} className="hidden" />
        </div>

        {/* Company Info */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Company Info</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Display Name</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                placeholder={profile?.email?.split("@")[1] || "Your Company"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Shown in sidebar and header</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={20} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Mini sidebar preview */}
            <div className="flex h-48">
              <div className="w-48 flex-shrink-0 flex flex-col p-4 gap-3" style={{ backgroundColor: sidebarColor }}>
                <div className="flex items-center gap-2 mb-2">
                  {logoUrl ? (
                    <NextImage src={logoUrl} alt="Company logo" width={24} height={24} unoptimized className="h-6 w-6 rounded object-contain bg-white/10" />
                  ) : (
                    <div className="h-6 w-6 rounded" style={{ backgroundColor: primaryColor }} />
                  )}
                  <span className="text-xs font-semibold text-white truncate">{companyName || "Partner Hub"}</span>
                </div>
                {["Dashboard", "Training", "CRM", "Settings"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
                    i === 3 ? "text-white font-medium" : "text-gray-300"
                  }`} style={i === 3 ? { backgroundColor: primaryColor } : {}}>
                    <div className="h-2 w-2 rounded-full opacity-50" style={{ backgroundColor: i === 3 ? "white" : "gray" }} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-24 rounded" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-white border border-gray-100 p-2">
                      <div className="h-2 w-12 rounded mb-2" style={{ backgroundColor: primaryColor, opacity: 0.2 }} />
                      <div className="h-2 w-8 rounded" style={{ backgroundColor: accentColor, opacity: 0.15 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Save Branding
        </button>
      </form>
    </div>
  );
}
