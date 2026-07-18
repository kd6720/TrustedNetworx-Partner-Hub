"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Loader2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Props {
  taskId: string;
  boardId: string;
  columnId: string;
}

export default function SubtaskSection({ taskId, boardId, columnId }: Props) {
  const supabase = createClient();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [percent, setPercent] = useState(0);

  useEffect(() => { loadSubtasks(); }, [taskId]);

  async function loadSubtasks() {
    const { data } = await supabase
      .from("kanban_tasks")
      .select("id, title")
      .eq("parent_id", taskId)
      .order("sort_order");

    const subs = (data || []).map(t => ({ id: t.id, title: t.title, completed: false }));
    setSubtasks(subs);

    // Load parent completion percentage
    const { data: parent } = await supabase
      .from("kanban_tasks")
      .select("completion_percentage")
      .eq("id", taskId)
      .single();

    if (parent) setPercent(parent.completion_percentage || 0);
    setLoading(false);
  }

  async function addSubtask() {
    const title = newTitle.trim();
    if (!title) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("account_id").eq("id", user.id).single();
    if (!profile?.account_id) return;

    const { data, error } = await supabase.from("kanban_tasks").insert({
      account_id: profile.account_id,
      board_id: boardId,
      column_id: columnId,
      parent_id: taskId,
      title,
      created_by: user.id,
    }).select("id, title").single();

    if (data && !error) {
      setSubtasks(s => [...s, { id: data.id, title: data.title, completed: false }]);
      setNewTitle("");
      updatePercent(subtasks.length + 1);
    }
  }

  async function toggleSubtask(id: string, completed: boolean) {
    setSubtasks(s => s.map(st => st.id === id ? { ...st, completed } : st));
    const completedCount = subtasks.filter(s => (s.id === id ? completed : s.completed)).length;
    updatePercent(completedCount);
  }

  async function updatePercent(completedCount: number) {
    const total = subtasks.length + (completedCount > subtasks.length ? 1 : 0);
    const newPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    setPercent(newPct);

    await supabase.from("kanban_tasks").update({
      completion_percentage: newPct,
      updated_at: new Date().toISOString(),
    }).eq("id", taskId);
  }

  if (loading) {
    return <div className="py-4"><Loader2 size={16} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-2">
        Subtasks ({subtasks.length})
      </label>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{percent}% complete</span>
            <span>{subtasks.filter(s => s.completed).length}/{subtasks.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {/* Subtask list */}
      {subtasks.map(sub => (
        <label key={sub.id} className="flex items-center gap-2 py-1.5 cursor-pointer group hover:bg-gray-50 rounded px-1">
          <input type="checkbox" checked={sub.completed}
            onChange={e => toggleSubtask(sub.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
          <span className={`text-sm flex-1 ${sub.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
            {sub.title}
          </span>
        </label>
      ))}

      {/* Add subtask */}
      <div className="flex items-center gap-2 mt-2">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addSubtask()}
          placeholder="Add subtask..."
          className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm" />
        <button onClick={addSubtask}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
