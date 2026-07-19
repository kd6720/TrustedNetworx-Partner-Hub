"use client";

import { useState } from "react";
import { User, Lock, Bell, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountPage() {
  const { profile, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [title, setTitle] = useState(profile?.title || "");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences
  const [prefs, setPrefs] = useState({
    notifications: { email: true, leads: true },
    marketing: false,
  });

  // Re-sync form fields when the loaded profile changes (adjust state during render)
  const [syncedProfile, setSyncedProfile] = useState(profile);
  if (profile !== syncedProfile) {
    setSyncedProfile(profile);
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setTitle(profile.title || "");
      if (profile.preferences) {
        try {
          const p = typeof profile.preferences === "string"
            ? JSON.parse(profile.preferences)
            : profile.preferences;
          setPrefs({
            notifications: { email: p.notifications?.email ?? true, leads: p.notifications?.leads ?? true },
            marketing: p.marketing ?? false,
          });
        } catch { /* ignore parse errors */ }
      }
    }
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, phone, title }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) showToast("success", "Profile updated");
    else showToast("error", data.error || "Failed to update");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      showToast("success", "Password changed");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } else {
      showToast("error", data.error || "Failed to change password");
    }
  }

  async function savePreferences() {
    setSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: prefs }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) showToast("success", "Preferences saved");
    else showToast("error", data.error || "Failed to save preferences");
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
          toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Profile */}
      <form onSubmit={saveProfile} className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <User size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={profile?.email || ""} disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title / Role</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Account Manager"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Save Profile
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        </div>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Update Password
        </button>
      </form>

      {/* Preferences */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900">Email notifications</p>
              <p className="text-xs text-gray-500">Get notified about new leads and status changes</p>
            </div>
            <input type="checkbox" checked={prefs.notifications.email}
              onChange={e => setPrefs(p => ({ ...p, notifications: { ...p.notifications, email: e.target.checked } }))}
              className="h-5 w-5 rounded border-gray-300 text-[var(--color-brand-primary)]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900">Lead assignment alerts</p>
              <p className="text-xs text-gray-500">Get notified when leads are assigned to you</p>
            </div>
            <input type="checkbox" checked={prefs.notifications.leads}
              onChange={e => setPrefs(p => ({ ...p, notifications: { ...p.notifications, leads: e.target.checked } }))}
              className="h-5 w-5 rounded border-gray-300 text-[var(--color-brand-primary)]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900">Marketing emails</p>
              <p className="text-xs text-gray-500">Product updates, webinars, and partner news</p>
            </div>
            <input type="checkbox" checked={prefs.marketing}
              onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
              className="h-5 w-5 rounded border-gray-300 text-[var(--color-brand-primary)]" />
          </label>
        </div>
        <button onClick={savePreferences} disabled={saving}
          className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Save Preferences
        </button>
      </div>
    </div>
  );
}
