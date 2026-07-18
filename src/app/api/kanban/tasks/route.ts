import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET — list tasks for a board (optionally filter by column)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("board_id");
    if (!boardId) return NextResponse.json({ error: "board_id required" }, { status: 400 });

    const { data: tasks, error } = await supabase
      .from("kanban_tasks")
      .select("*, subtasks:kanban_tasks!parent_id(*, attachments:kanban_task_attachments(*))")
      .eq("board_id", boardId)
      .is("parent_id", null)
      .order("sort_order");

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(tasks || []);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST — create a new task
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("account_id").eq("id", user.id).single();
    if (!profile?.account_id) return NextResponse.json({ error: "No account" }, { status: 400 });

    const body = await req.json();
    const { data: task, error } = await supabase.from("kanban_tasks").insert({
      account_id: profile.account_id,
      board_id: body.board_id,
      column_id: body.column_id,
      title: body.title,
      description: body.description || "",
      priority: body.priority || "medium",
      project: body.project || null,
      due_date: body.due_date || null,
      estimated_hours: body.estimated_hours || null,
      assigned_to: body.assigned_to || [],
      tags: body.tags || [],
      created_by: user.id,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: actorProfile } = await supabase.from("profiles").select("email").eq("id", user.id).single();
    const actorName = actorProfile?.email || user.email || "Unknown";

    // Log activity
    await supabase.from("kanban_activity_log").insert({
      task_id: task.id,
      actor_id: user.id,
      actor_name: actorName,
      action: "created",
    });

    return NextResponse.json(task);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH — update a task (move column, change status, edit fields)
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

    // If moving column, log it
    if (updates.column_id) {
      const { data: oldTask } = await supabase.from("kanban_tasks").select("column_id").eq("id", id).single();
      if (oldTask && oldTask.column_id !== updates.column_id) {
        const { data: oldCol } = await supabase.from("kanban_columns").select("name").eq("id", oldTask.column_id).single();
        const { data: newCol } = await supabase.from("kanban_columns").select("name").eq("id", updates.column_id).single();
        await supabase.from("kanban_activity_log").insert({
          task_id: id,
          actor_id: user.id,
          action: "column_change",
          field: "column",
          old_value: oldCol?.name || oldTask.column_id,
          new_value: newCol?.name || updates.column_id,
        });
      }
    }

    updates.updated_at = new Date().toISOString();
    const { data: task, error } = await supabase.from("kanban_tasks").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(task);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE — archive a task
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

    const { error } = await supabase.from("kanban_tasks").update({
      status: "archived",
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
