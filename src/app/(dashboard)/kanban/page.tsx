"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DragDropContext, Droppable, Draggable,
  type DropResult, type DroppableProvided, type DraggableProvided,
} from "@hello-pangea/dnd";
import {
  Plus, MoreHorizontal, Calendar, Clock, User, Tag, Trash2,
  Layout, ChevronDown, Search, Star, Archive, Loader2, X, GripVertical,
  AlertCircle, CheckCircle2, ArrowUp, ArrowDown, ArrowRight, PanelRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import KpiBar from "@/components/kanban/KpiBar";
import SubtaskSection from "@/components/kanban/SubtaskSection";

interface Board {
  id: string; name: string; color: string; is_favorite: boolean; is_archived: boolean;
  columns: Column[];
}
interface Column { id: string; board_id: string; name: string; color: string; sort_order: number; }
interface Task {
  id: string; board_id: string; column_id: string; title: string;
  description: string; priority: string; project: string | null;
  due_date: string | null; estimated_hours: number | null;
  assigned_to: string[]; tags: string[]; sort_order: number;
  created_by: string; created_at: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

const COLUMN_COLORS: Record<string, string> = {
  Backlog: "#94a3b8", Ready: "#3b82f6", "In Progress": "#f59e0b",
  "In Review": "#8b5cf6", Completed: "#10b981", Blocked: "#ef4444",
  Ideas: "#ec4899", Planned: "#06b6d4", Testing: "#f97316",
  Waiting: "#6b7280", Archived: "#9ca3af",
};

export default function KanbanPage() {
  const supabase = createClient();

  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeBoard = boards.find(b => b.id === activeBoardId);

  // Load boards
  useEffect(() => { loadBoards(); }, []);

  async function loadBoards() {
    const res = await fetch("/api/kanban/boards");
    const data = await res.json();
    if (Array.isArray(data)) {
      setBoards(data);
      if (data.length > 0 && !activeBoardId) setActiveBoardId(data[0].id);
    }
    setLoading(false);
  }

  // Load tasks when board changes
  useEffect(() => {
    if (!activeBoardId) return;
    loadTasks(activeBoardId);
  }, [activeBoardId]);

  async function loadTasks(boardId: string) {
    const res = await fetch(`/api/kanban/tasks?board_id=${boardId}`);
    const data = await res.json();
    if (Array.isArray(data)) setTasks(data);
  }

  async function createBoard() {
    if (!newBoardName.trim()) return;
    const res = await fetch("/api/kanban/boards", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBoardName }),
    });
    const board = await res.json();
    if (board.id) {
      await loadBoards();
      setActiveBoardId(board.id);
      setNewBoardName("");
      setShowNewBoard(false);
    }
  }

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedTask = tasks.find(t => t.id === draggableId);
    if (!movedTask) return;

    // Update locally for instant feedback
    const updated = tasks.map(t =>
      t.id === draggableId ? { ...t, column_id: destination.droppableId } : t
    );
    setTasks(updated);

    // Persist to backend
    await fetch("/api/kanban/tasks", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggableId, column_id: destination.droppableId }),
    });
  }, [tasks]);

  async function createTask(columnId: string) {
    const title = prompt("Task title:");
    if (!title?.trim()) return;
    const res = await fetch("/api/kanban/tasks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board_id: activeBoardId, column_id: columnId, title }),
    });
    const task = await res.json();
    if (task.id) setTasks(t => [...t, task]);
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const res = await fetch("/api/kanban/tasks", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const updated = await res.json();
    if (updated.id) {
      setTasks(t => t.map(tk => tk.id === id ? { ...tk, ...updated } : tk));
      if (selectedTask?.id === id) setSelectedTask(updated);
    }
  }

  async function archiveTask(id: string) {
    await fetch(`/api/kanban/tasks?id=${id}`, { method: "DELETE" });
    setTasks(t => t.filter(tk => tk.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
  }

  const filteredTasks = searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  const columns = activeBoard?.columns?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const tasksByColumn = (colId: string) => filteredTasks.filter(t => t.column_id === colId);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* KPI Status Bar */}
      <KpiBar />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Board Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-[var(--color-brand-primary)]">
              <Layout size={20} />
              {activeBoard?.name || "Select Board"}
              <ChevronDown size={16} />
            </button>
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {boards.filter(b => !b.is_archived).map(board => (
                <button key={board.id}
                  onClick={() => setActiveBoardId(board.id)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${board.id === activeBoardId ? "bg-gray-50 font-medium" : ""}`}>
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: board.color }} />
                  {board.name}
                  {board.is_favorite && <Star size={12} className="text-yellow-400 ml-auto" />}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button onClick={() => setShowNewBoard(true)} className="w-full text-left px-4 py-2 text-sm text-[var(--color-brand-primary)] hover:bg-gray-50 flex items-center gap-2">
                  <Plus size={14} /> New Board
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{tasks.length} tasks</span>
        </div>
      </div>

      {/* New Board Dialog */}
      {showNewBoard && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowNewBoard(false)}>
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Create New Board</h3>
            <input autoFocus value={newBoardName} onChange={e => setNewBoardName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createBoard()}
              placeholder="Board name..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewBoard(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={createBoard} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full pb-4">
            {columns.map(column => (
              <div key={column.id} className="flex-shrink-0 w-72 flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color || COLUMN_COLORS[column.name] || "#94a3b8" }} />
                    <h3 className="text-sm font-semibold text-gray-700">{column.name}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{tasksByColumn(column.id).length}</span>
                  </div>
                  <button onClick={() => createTask(column.id)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                    <Plus size={16} />
                  </button>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={column.id}>
                  {(provided: DroppableProvided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className="flex-1 rounded-xl bg-gray-50/80 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                      {tasksByColumn(column.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided: DraggableProvided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps}
                              onClick={() => setSelectedTask(task)}
                              className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow group">
                              <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps} className="mt-0.5 text-gray-300 group-hover:text-gray-500 flex-shrink-0">
                                  <GripVertical size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {task.priority && (
                                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                                    )}
                                    {task.due_date && (
                                      <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Calendar size={10} /> {new Date(task.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                    {task.project && (
                                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{task.project}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Add Column Button */}
            {activeBoard && (
              <div className="flex-shrink-0 w-72">
                <button onClick={() => {
                  const name = prompt("Column name:");
                  if (name?.trim()) {
                    fetch("/api/kanban/boards", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, board_id: activeBoardId }),
                    });
                  }
                }}
                  className="w-full h-12 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 text-sm transition-colors">
                  <Plus size={16} /> Add Column
                </button>
              </div>
            )}
          </div>
        </DragDropContext>
      </div>

      {/* Task Detail Slide-out Panel */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-slideIn" style={{ animation: "slideIn 0.2s ease-out" }}>
          {/* Panel Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex-1 mr-4">{selectedTask.title}</h2>
            <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
              <X size={18} />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Status & Priority */}
            <div className="flex items-center gap-3">
              <select value={selectedTask.column_id}
                onChange={e => updateTask(selectedTask.id, { column_id: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
                {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={selectedTask.priority}
                onChange={e => updateTask(selectedTask.id, { priority: e.target.value })}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
                {["critical", "high", "medium", "low"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
              <textarea value={selectedTask.description || ""}
                onChange={e => updateTask(selectedTask.id, { description: e.target.value })}
                placeholder="Add a description..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[100px] resize-y"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Project</label>
              <input value={selectedTask.project || ""}
                onChange={e => updateTask(selectedTask.id, { project: e.target.value })}
                placeholder="e.g. Q3 Launch, Website Redesign..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Due Date</label>
              <input type="date" value={selectedTask.due_date || ""}
                onChange={e => updateTask(selectedTask.id, { due_date: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            {/* Est Hours */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Estimated Hours</label>
              <input type="number" value={selectedTask.estimated_hours || ""}
                onChange={e => updateTask(selectedTask.id, { estimated_hours: parseFloat(e.target.value) || null })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tags</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {(selectedTask.tags || []).map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {tag}
                    <button onClick={() => {
                      const newTags = selectedTask.tags.filter((_, j) => j !== i);
                      updateTask(selectedTask.id, { tags: newTags });
                    }} className="hover:text-red-500"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <input placeholder="Add tag..." onKeyDown={e => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    updateTask(selectedTask.id, { tags: [...(selectedTask.tags || []), val] });
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>

            {/* Subtasks */}
            <SubtaskSection
              taskId={selectedTask.id}
              boardId={selectedTask.board_id}
              columnId={selectedTask.column_id}
            />

            {/* Created info */}
            <div className="text-xs text-gray-400 pt-3 border-t border-gray-100">
              Created {new Date(selectedTask.created_at).toLocaleDateString()}
            </div>

            {/* Archive */}
            <button onClick={() => { archiveTask(selectedTask.id); }}
              className="flex items-center gap-2 text-xs text-red-500 hover:text-red-700">
              <Trash2 size={12} /> Archive Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
