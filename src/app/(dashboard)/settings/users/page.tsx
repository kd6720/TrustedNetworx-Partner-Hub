"use client";

import { useState, useEffect } from "react";
import { Mail, X, Shield, User, Loader2, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "manager" | "user";
  account_id: string | null;
  phone: string | null;
  title: string | null;
  is_active: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-blue-50 text-blue-700",
  manager: "bg-green-50 text-green-700",
  user: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const { profile: me } = useAuth();
  const supabase = createClient();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const isManager = me?.role === "admin" || me?.role === "manager";
  const isAdmin = me?.role === "admin";

  useEffect(() => { loadUsers(); }, [me?.account_id]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function loadUsers() {
    if (!me?.account_id && me?.role !== "admin") { setLoading(false); return; }

    let query = supabase.from("profiles").select("id, email, full_name, role, account_id, phone, title, is_active").eq("is_active", true);

    if (me?.role === "admin") {
      // Admin sees all users
    } else if (me?.account_id) {
      query = query.eq("account_id", me.account_id);
    }

    const { data, error } = await query.order("role").order("full_name");
    if (!error && data) setUsers(data as Profile[]);
    setLoading(false);
  }

  async function inviteUser(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setSending(true);
    const res = await fetch("/api/account/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      showToast("success", data.message || "Invitation sent");
      setInviteEmail("");
      loadUsers();
    } else {
      showToast("error", data.error || "Failed to send invitation");
    }
  }

  async function changeRole(userId: string, newRole: string) {
    const res = await fetch(`/api/account/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (data.success) {
      showToast("success", "Role updated");
      loadUsers();
    } else {
      showToast("error", data.error || "Failed to update role");
    }
  }

  async function removeUser(userId: string) {
    const res = await fetch(`/api/account/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("success", "User deactivated");
      setConfirmRemove(null);
      loadUsers();
    } else {
      showToast("error", data.error || "Failed to remove user");
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
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

      {/* Invite User (manager/admin only) */}
      {isManager && (
        <form onSubmit={inviteUser} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" required
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              />
            </div>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
              <option value="user">Partner</option>
              <option value="manager">Manager</option>
              {isAdmin && <option value="admin">Admin</option>}
            </select>
            <button type="submit" disabled={sending}
              className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
              {sending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Invite User
            </button>
          </div>
        </form>
      )}

      {/* Team Members */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members ({users.length})</h3>
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No team members yet. Invite someone to get started.</p>
        ) : (
          <div className="space-y-1">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white text-sm font-semibold">
                    {getInitials(u.full_name, u.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.full_name || u.email.split("@")[0]}
                      {u.id === me?.id && <span className="text-xs text-gray-400 ml-1">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {/* Role change (for managers, not on self) */}
                  {isManager && u.id !== me?.id && (
                    <div className="relative">
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        className="appearance-none rounded-lg border border-gray-200 px-2 py-1.5 text-xs bg-white hover:border-gray-300 cursor-pointer pr-6"
                      >
                        <option value="user">Partner</option>
                        <option value="manager">Manager</option>
                        {isAdmin && <option value="admin">Admin</option>}
                      </select>
                      <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  )}

                  {/* Remove (not on self) */}
                  {isManager && u.id !== me?.id && (
                    confirmRemove === u.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => removeUser(u.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 px-1">Confirm</button>
                        <button onClick={() => setConfirmRemove(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 px-1">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemove(u.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Remove user">
                        <X size={16} />
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="card p-4 flex items-center gap-4 text-xs text-gray-500">
        <Shield size={14} />
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> Admin: full access</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500" /> Manager: manage team + branding</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-gray-400" /> Partner: standard access</span>
      </div>
    </div>
  );
}
