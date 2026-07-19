"use client";

import { useState, useEffect } from "react";
import { Zap, Plus, Trash2, RefreshCw, CheckCircle2, XCircle, Clock, Loader2, ExternalLink, Activity, Power, PowerOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Agent {
  id: string; name: string; endpoint_url: string | null; status: string;
  last_heartbeat: string | null; version: string | null; capabilities: string[];
  is_active?: boolean;
}

export default function AgentConnectionsPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEndpoint, setNewEndpoint] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isManager = profile?.role === "admin" || profile?.role === "manager";

  useEffect(() => { loadAgents(); }, []);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  async function loadAgents() {
    const { data } = await supabase.from("agent_connections").select("*").order("created_at");
    if (data) setAgents(data as Agent[]);
    setLoading(false);
  }

  async function addAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("account_id").eq("id", user?.id).single();

    const { error } = await supabase.from("agent_connections").insert({
      account_id: profile?.account_id,
      name: newName,
      endpoint_url: newEndpoint || null,
      status: "connecting",
    });

    setSaving(false);
    if (error) { showToast("Failed to add agent: " + error.message); return; }

    setNewName(""); setNewEndpoint(""); setShowAdd(false);
    showToast("Agent added");
    loadAgents();
  }

  async function testConnection(agentId: string, endpoint?: string | null) {
    if (!endpoint) { showToast("No endpoint configured"); return; }

    await supabase.from("agent_connections").update({ status: "connecting" }).eq("id", agentId);
    loadAgents();

    try {
      const res = await fetch(`${endpoint}/health`, { signal: AbortSignal.timeout(5000) });
      const ok = res.ok;
      await supabase.from("agent_connections").update({
        status: ok ? "connected" : "error",
        last_heartbeat: new Date().toISOString(),
      }).eq("id", agentId);
      showToast(ok ? "Connection successful" : "Health check returned error");
    } catch {
      await supabase.from("agent_connections").update({
        status: "error",
        last_heartbeat: new Date().toISOString(),
      }).eq("id", agentId);
      showToast("Connection failed");
    }
    loadAgents();
  }

  async function removeAgent(id: string) {
    await supabase.from("agent_connections").delete().eq("id", id);
    showToast("Agent removed");
    loadAgents();
  }

  async function toggleAgent(id: string, currentActive: boolean) {
    const newActive = !currentActive;
    await supabase.from("agent_connections").update({
      is_active: newActive,
      status: newActive ? "connecting" : "disconnected",
    }).eq("id", id);
    showToast(newActive ? "Agent enabled" : "Agent disconnected");
    loadAgents();
  }

  function timeAgo(date: string | null) {
    if (!date) return "Never";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agent Connections</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Hermes agents connected to your workspace</p>
        </div>
        {isManager && (
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
            <Plus size={16} /> Add Agent
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card p-6">
          <h3 className="text-base font-semibold mb-4">Connect New Agent</h3>
          <form onSubmit={addAgent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Production Hermes"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
              <input value={newEndpoint} onChange={e => setNewEndpoint(e.target.value)}
                placeholder="https://hermes.yourcompany.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Connect
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Zap size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No agents connected</p>
          <p className="text-xs mt-1">Add a Hermes agent to start automating workflows</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    agent.status === "connected" ? "bg-green-100 text-green-600" :
                    agent.status === "error" ? "bg-red-100 text-red-600" :
                    agent.status === "connecting" ? "bg-blue-100 text-blue-600" :
                    agent.status === "disconnected" ? "bg-amber-100 text-amber-600" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {agent.status === "connected" ? <CheckCircle2 size={20} /> :
                     agent.status === "error" ? <XCircle size={20} /> :
                     agent.status === "connecting" ? <RefreshCw size={20} className="animate-spin" /> :
                     agent.status === "disconnected" ? <PowerOff size={20} /> :
                     <Clock size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-xs text-gray-500">{agent.endpoint_url || "No endpoint"}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  agent.status === "connected" ? "bg-green-50 text-green-700" :
                  agent.status === "error" ? "bg-red-50 text-red-700" :
                  agent.status === "connecting" ? "bg-blue-50 text-blue-700" :
                  "bg-gray-100 text-gray-500"
                }`}>{agent.status}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Activity size={11} /> Heartbeat: {timeAgo(agent.last_heartbeat)}</span>
                {agent.version && <span>v{agent.version}</span>}
              </div>

              {agent.capabilities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.capabilities.map((c, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {isManager && (
                  <button onClick={() => toggleAgent(agent.id, agent.is_active !== false)}
                    className={`text-xs flex items-center gap-1 ${
                      agent.is_active !== false ? "text-amber-500 hover:text-amber-700" : "text-green-500 hover:text-green-700"
                    }`}>
                    {agent.is_active !== false ? <PowerOff size={11} /> : <Power size={11} />}
                    {agent.is_active !== false ? "Disconnect" : "Enable"}
                  </button>
                )}
                <button onClick={() => testConnection(agent.id, agent.endpoint_url)}
                  className="text-xs text-[var(--color-brand-primary)] hover:underline flex items-center gap-1">
                  <RefreshCw size={11} /> Test
                </button>
                {agent.endpoint_url && (
                  <a href={agent.endpoint_url} target="_blank" rel="noopener"
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                    <ExternalLink size={11} /> Open
                  </a>
                )}
                {isManager && (
                  <button onClick={() => removeAgent(agent.id)}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 ml-auto">
                    <Trash2 size={11} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
