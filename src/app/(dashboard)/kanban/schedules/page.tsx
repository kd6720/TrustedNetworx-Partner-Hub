"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Play, Pause, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Schedule {
  id: string; name: string; purpose: string | null; schedule_expression: string;
  next_run_at: string | null; last_run_at: string | null; last_status: string;
  last_error: string | null; is_active: boolean; trigger_type: string;
  execution_count: number; failure_count: number;
}

const STATUS_ICONS: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  success: { icon: CheckCircle2, color: "text-green-500" },
  failure: { icon: XCircle, color: "text-red-500" },
  running: { icon: RefreshCw, color: "text-blue-500" },
  pending: { icon: Clock, color: "text-gray-400" },
  paused: { icon: Pause, color: "text-yellow-500" },
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSchedules(); }, []);

  async function loadSchedules() {
    const supabase = createClient();
    const { data } = await supabase.from("agent_schedules").select("*").order("created_at", { ascending: false });
    if (data) setSchedules(data);
    setLoading(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active", value: schedules.filter(s => s.is_active).length, icon: Play, color: "text-green-600 bg-green-50" },
          { label: "Paused", value: schedules.filter(s => !s.is_active).length, icon: Pause, color: "text-yellow-600 bg-yellow-50" },
          { label: "Failed", value: schedules.filter(s => s.last_status === "failure").length, icon: AlertCircle, color: "text-red-600 bg-red-50" },
          { label: "Total Runs", value: schedules.reduce((sum, s) => sum + s.execution_count, 0), icon: RefreshCw, color: "text-blue-600 bg-blue-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule List */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">All Schedules</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <select className="rounded-lg border border-gray-200 px-2 py-1 text-xs">
              <option>All Status</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Failed</option>
            </select>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Calendar size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No schedules yet</p>
            <p className="text-xs mt-1">Connect a Hermes agent to start scheduling tasks</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {schedules.map(schedule => {
              const statusInfo = STATUS_ICONS[schedule.last_status || "pending"] || STATUS_ICONS.pending;
              const StatusIcon = statusInfo.icon;
              return (
                <div key={schedule.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${statusInfo.color}`}><StatusIcon size={16} /></div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{schedule.name}</h3>
                        {schedule.purpose && <p className="text-xs text-gray-500 mt-0.5">{schedule.purpose}</p>}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={11} /> {schedule.schedule_expression}</span>
                          {schedule.next_run_at && <span>Next: {new Date(schedule.next_run_at).toLocaleString()}</span>}
                          {schedule.last_run_at && <span>Last: {new Date(schedule.last_run_at).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        schedule.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {schedule.is_active ? "Active" : "Paused"}
                      </span>
                      {schedule.last_error && (
                        <span title={schedule.last_error} className="text-red-400 cursor-help"><AlertCircle size={14} /></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
