import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, body: emailBody, linked_type, linked_id, connection_id } = body;

    if (!to || !subject || !connection_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Authenticate user
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up the connection server-side (credentials never reach the client)
    const { data: conn } = await supabase
      .from("email_connections")
      .select("smtp_host, smtp_port, smtp_user, smtp_password_enc, email_address, display_name")
      .eq("id", connection_id)
      .eq("user_id", user.id)
      .single();

    if (!conn) {
      return NextResponse.json({ error: "Email connection not found or not authorized" }, { status: 404 });
    }

    // Decrypt using AES-256-GCM
    const smtpPass = decrypt(conn.smtp_password_enc);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: conn.smtp_host,
      port: conn.smtp_port,
      secure: conn.smtp_port === 465,
      auth: { user: conn.smtp_user, pass: smtpPass },
      // Only disable TLS verification in dev — enable in production
      tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
    });

    // Send
    await transporter.sendMail({
      from: conn.display_name ? `"${conn.display_name}" <${conn.email_address}>` : conn.email_address,
      to,
      subject,
      text: emailBody,
    });

    // Log to email_activities
    const { data: profile } = await supabase
      .from("profiles").select("account_id").eq("id", user.id).single();

    await supabase.from("email_activities").insert({
      account_id: profile?.account_id,
      user_id: user.id,
      connection_id,
      direction: "sent",
      subject,
      body_text: emailBody,
      snippet: emailBody?.slice(0, 200) || "",
      from_address: conn.email_address,
      from_name: conn.display_name || null,
      to_addresses: [to],
      linked_type: linked_type || null,
      linked_id: linked_id || null,
      status: "sent",
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    // Structured logging in production — avoid console.error
    if (process.env.NODE_ENV !== "production") {
      console.error("Send email error:", error);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
