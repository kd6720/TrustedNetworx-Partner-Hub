import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_id")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "manager")) {
      return NextResponse.json({ error: "Only admins and managers can manage branding" }, { status: 403 });
    }
    if (!profile.account_id) {
      return NextResponse.json({ error: "No account associated" }, { status: 400 });
    }

    const body = await req.json();
    const {
      company_name_override,
      logo_url,
      favicon_url,
      primary_color,
      accent_color,
      sidebar_color,
    } = body;

    // Validate colors
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    if (primary_color && !hexRegex.test(primary_color)) {
      return NextResponse.json({ error: "primary_color must be a valid hex color (e.g. #06b6d4)" }, { status: 400 });
    }
    if (accent_color && !hexRegex.test(accent_color)) {
      return NextResponse.json({ error: "accent_color must be a valid hex color" }, { status: 400 });
    }
    if (sidebar_color && !hexRegex.test(sidebar_color)) {
      return NextResponse.json({ error: "sidebar_color must be a valid hex color" }, { status: 400 });
    }

    // Upsert the branding record
    const { data: existing } = await supabase
      .from("account_branding")
      .select("id")
      .eq("account_id", profile.account_id)
      .single();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (company_name_override !== undefined) updates.company_name_override = company_name_override;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (favicon_url !== undefined) updates.favicon_url = favicon_url;
    if (primary_color !== undefined) updates.primary_color = primary_color;
    if (accent_color !== undefined) updates.accent_color = accent_color;
    if (sidebar_color !== undefined) updates.sidebar_color = sidebar_color;

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("account_branding")
        .update(updates)
        .eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("account_branding")
        .insert({ account_id: profile.account_id, ...updates }));
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
