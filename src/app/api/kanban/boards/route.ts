import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET — list all boards for the account
export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("kanban_boards")
      .select("*, columns:kanban_columns(*)")
      .eq("is_archived", false)
      .order("sort_order");

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST — create a new board
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("account_id").eq("id", user.id).single();
    if (!profile?.account_id) return NextResponse.json({ error: "No account" }, { status: 400 });

    const body = await req.json();
    const { data: board } = await supabase.from("kanban_boards").insert({
      account_id: profile.account_id,
      name: body.name,
      description: body.description || "",
      color: body.color || "#6366f1",
      created_by: user.id,
    }).select().single();

    if (!board) return NextResponse.json({ error: "Failed to create board" }, { status: 500 });

    // Create default columns
    const defaultColumns = [
      { name: "Backlog", color: "#94a3b8", sort_order: 0 },
      { name: "Ready", color: "#3b82f6", sort_order: 1 },
      { name: "In Progress", color: "#f59e0b", sort_order: 2 },
      { name: "In Review", color: "#8b5cf6", sort_order: 3 },
      { name: "Completed", color: "#10b981", sort_order: 4 },
    ];

    const columns = defaultColumns.map(c => ({ board_id: board.id, ...c }));
    await supabase.from("kanban_columns").insert(columns);

    return NextResponse.json(board);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
