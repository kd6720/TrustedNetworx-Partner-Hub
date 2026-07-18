import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // Require an authenticated admin caller
    const authed = await createServerSupabase();
    const { data: { user } } = await authed.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: me } = await authed
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (me?.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Use service role key (server-side only, never exposed to client)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://trustednetworxpartnerhub.netlify.app"}/login`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Auto-approve this registration since an admin invited them
    const domain = email.split("@")[1];
    await supabaseAdmin.from("pending_registrations").insert({
      email, domain, status: "approved",
      reviewed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, user: data.user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to invite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
