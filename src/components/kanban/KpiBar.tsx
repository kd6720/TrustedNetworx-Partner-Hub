"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, AlertCircle, Clock, Play, Activity,
  Calendar, XCircle, Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface KpiData {
  activeTasks: number;
  dueToday: number;
  overdue: number;
  completedToday: number;
  activeSchedules: number;
  failedSchedules: number;
  upcomingRuns: number;
  agentStatus: { online: number; total: number };
}

export default function KpiBar() {
  const supabase = createClient();
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKpis() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const today = new Date().toISOString().split("T")[0];

        const [
          activeRes, dueRes, overdueRes, completedRes,
          activeSchedRes, failedSchedRes, upcomingRes,
          agentRes, totalAgentRes,
        ] = await Promise.all([
          supabase.from("kanban_tasks").select("*", { count: "exact", head: true }).not("column_id", "is", null),
          supabase.from("kanban_tasks").select("*", { count: "exact", head: true }).eq("due_date", today),
          supabase.from("kanban_tasks").select("*", { count: "exact", head: true }).lt("due_date", today).not("column_id", "is", null),
          supabase.from("kanban_activity_log").select("*", { count: "exact", head: true }).eq("action", "column_change").eq("new_value", "Completed").gte("created_at", `${today}T00:00:00`),
          supabase.from("agent_schedules").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("agent_schedules").select("*", { count: "exact", head: true }).eq("last_status", "failure"),
          supabase.from("agent_schedules").select("*", { count: "exact", head: true }).gt("next_run_at", new Date().toISOString()).lt("next_run_at", new Date(Date.now() + 86400000).toISOString()),
          supabase.from("agent_connections").select("*", { count: "exact", head: true }).eq("status", "connected"),
          supabase.from("agent_connections").select("*", { count: "exact", head: true }),
        ]);

        setData({
          activeTasks: activeRes.count || 0,
          dueToday: dueRes.count || 0,
          overdue: overdueRes.count || 0,
          completedToday: completedRes.count || 0,
          activeSchedules: activeSchedRes.count || 0,
          failedSchedules: failedSchedRes.count || 0,
          upcomingRuns: upcomingRes.count || 0,
          agentStatus: { online: agentRes.count || 0, total: totalAgentRes.count || 0 },
        });
      } catch { /* silent */ }
      setLoading(false);
    }
    loadKpis();
  }, [supabase]);

  if (loading) return null;

  const kpis = data ? [
    { label: "Active Tasks", value: data.activeTasks, icon: Activity, color: "bg-blue-50 text-blue-600" },
    { label: "Due Today", value: data.dueToday, icon: Calendar, color: "bg-amber-50 text-amber-600" },
    { label: "Overdue", value: data.overdue, icon: AlertCircle, color: "bg-red-50 text-red-600" },
    { label: "Done Today", value: data.completedToday, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
    { label: "Active Schedules", value: data.activeSchedules, icon: Play, color: "bg-indigo-50 text-indigo-600" },
    { label: "Failed", value: data.failedSchedules, icon: XCircle, color: "bg-red-50 text-red-600" },
    { label: "Upcoming Runs", value: data.upcomingRuns, icon: Clock, color: "bg-violet-50 text-violet-600" },
    {
      label: "Agent Health",
      value: `${data.agentStatus.online}/${data.agentStatus.total}`,
      icon: Zap,
      color: data.agentStatus.online === 0 && data.agentStatus.total > 0
        ? "bg-red-50 text-red-600"
        : data.agentStatus.online === data.agentStatus.total
          ? "bg-green-50 text-green-600"
          : "bg-amber-50 text-amber-600",
    },
  ] : [];

  return (
    <div className="grid grid-cols-8 gap-3 mb-4">
      {kpis.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className={`rounded-xl p-3 flex items-center gap-2.5 ${color.replace("text-", "bg-").replace("bg-bg-", "bg-")} bg-opacity-10 border border-gray-100`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-[10px] text-gray-500 leading-tight truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
