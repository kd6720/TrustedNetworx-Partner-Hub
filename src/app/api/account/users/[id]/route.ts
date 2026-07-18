import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/** PATCH /api/account/users/[id]/role — change a user's role */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const targetUserId = (await params).id;
    const { role } = await req.json();

    if (!role || !["manager", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get calling user's role and account
    const { data: caller } = await supabase
      .from("profiles")
      .select("role, account_id")
      .eq("id", user.id)
      .single();

    if (!caller || (caller.role !== "admin" && caller.role !== "manager")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get target user — must be in same account (or caller is admin)
    const { data: target } = await supabase
      .from("profiles")
      .select("id, account_id, role")
      .eq("id", targetUserId)
      .single();

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (caller.role !== "admin" && target.account_id !== caller.account_id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Can't change own role
    if (target.id === user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    // Managers can't promote to admin
    if (role === "admin" && caller.role !== "admin") {
      return NextResponse.json({ error: "Only admins can assign admin role" }, { status: 403 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", targetUserId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_email: user.email,
      action: "role_change",
      target_user_id: targetUserId,
      target_account_id: caller.account_id,
      details: { from: target.role, to: role },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/account/users/[id] — deactivate a user */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const targetUserId = (await params).id;

    const { data: caller } = await supabase
      .from("profiles")
      .select("role, account_id")
      .eq("id", user.id)
      .single();

    if (!caller || (caller.role !== "admin" && caller.role !== "manager")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { data: target } = await supabase
      .from("profiles")
      .select("id, account_id")
      .eq("id", targetUserId)
      .single();

    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.id === user.id) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
    }
    if (caller.role !== "admin" && target.account_id !== caller.account_id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", targetUserId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_email: user.email,
      action: "user_deactivated",
      target_user_id: targetUserId,
      target_account_id: caller.account_id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
