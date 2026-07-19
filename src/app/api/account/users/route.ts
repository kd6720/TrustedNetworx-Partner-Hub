import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role — only admin and manager can invite
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_id")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "manager")) {
      return NextResponse.json({ error: "Only admins and managers can invite users" }, { status: 403 });
    }

    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }
    if (!["manager", "user"].includes(role)) {
      return NextResponse.json({ error: "Role must be 'manager' or 'user'" }, { status: 400 });
    }

    // Managers cannot create admin accounts
    if (role === "admin" && profile.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create admin accounts" }, { status: 403 });
    }

    // Send invite via Supabase Auth — admin API requires the service-role key
    // (the session client's anon key cannot call auth.admin.*)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { invited_by: user.id, role, account_id: profile.account_id },
    });

    if (error) {
      // Handle common errors
      if (error.message?.includes("already")) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the invite
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_email: user.email,
      action: "user_invited",
      target_user_id: data?.user?.id,
      target_account_id: profile.account_id,
      details: { role, email },
    });

    return NextResponse.json({
      success: true,
      user: data?.user,
      message: `Invitation sent to ${email}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
