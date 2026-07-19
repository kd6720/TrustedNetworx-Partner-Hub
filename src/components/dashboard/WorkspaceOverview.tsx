"use client";

import { useState, useEffect } from "react";
import { Layout, Zap, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface RecentTask {
  id: string; title: string; priority: string; board_name: string; board_color: string;
  column_name: string; updated_at: string;
}
interface UpcomingSchedule {
  id: string; name: string; next_run_at: string | null; schedule_expression: string;
}

export default function WorkspaceOverview() {
  const supabase = createClient();
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Recent tasks
        const { data: tasks } = await supabase
          .from("kanban_tasks")
          .select("id, title, priority, board_id, column_id, updated_at")
          .is("parent_id", null)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (tasks?.length) {
          // Enrich with board/column names
          const boardIds = [...new Set(tasks.map(t => t.board_id))];
          const colIds = [...new Set(tasks.map(t => t.column_id))];
          const [{ data: boards }, { data: columns }] = await Promise.all([
            supabase.from("kanban_boards").select("id, name, color").in("id", boardIds),
            supabase.from("kanban_columns").select("id, name").in("id", colIds),
          ]);

          const boardMap = Object.fromEntries((boards || []).map(b => [b.id, { name: b.name, color: b.color }]));
          const colMap = Object.fromEntries((columns || []).map(c => [c.id, c.name]));

          setRecentTasks(tasks.map(t => ({
            ...t,
            board_name: boardMap[t.board_id]?.name || "Board",
            board_color: boardMap[t.board_id]?.color || "#6366f1",
            column_name: colMap[t.column_id] || "—",
          })));
        }

        // Upcoming schedules
        const { data: schedules } = await supabase
          .from("agent_schedules")
          .select("id, name, next_run_at, schedule_expression")
          .eq("is_active", true)
          .order("next_run_at")
          .limit(5);

        if (schedules) setUpcoming(schedules);
      } catch { /* silent */ }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  if (loading) {
    return <div className="card p-6 mb-6 flex items-center justify-center min-h-[200px]"><Loader2 size={20} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Link href="/kanban"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          <Layout size={16} /> Open Kanban
        </Link>
        <Link href="/kanban/agents"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Zap size={16} /> Agents
        </Link>
        <Link href="/kanban/schedules"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Clock size={16} /> Schedules
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Layout size={16} /> Recent Tasks
          </h3>
          {recentTasks.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No tasks yet. Create your first task in Kanban.</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.board_color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-[11px] text-gray-400">{task.board_name} · {task.column_name}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    task.priority === "critical" ? "bg-red-50 text-red-700" :
                    task.priority === "high" ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-500"
                  }`}>{task.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Schedules */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={16} /> Upcoming Schedules
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No upcoming schedules. Connect an agent to schedule tasks.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                    <Clock size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {s.schedule_expression} · Next: {s.next_run_at ? new Date(s.next_run_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
