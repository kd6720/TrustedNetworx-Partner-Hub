import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      connection_id, to, subject, body: emailBody,
      linked_type, linked_id,
      smtp_host, smtp_port, smtp_user, smtp_password_enc,
      from_address, from_name,
    } = body;

    if (!smtp_host || !smtp_user || !smtp_password_enc || !to || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Decrypt the password (base64 for now — upgrade to AES in production)
    const smtpPass = Buffer.from(smtp_password_enc, "base64").toString("utf-8");

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_port === 465,
      auth: { user: smtp_user, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    // Send
    await transporter.sendMail({
      from: from_name ? `"${from_name}" <${from_address}>` : from_address,
      to,
      subject,
      text: emailBody,
    });

    // Log to email_activities
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("account_id").eq("id", user.id).single();

      await supabase.from("email_activities").insert({
        account_id: profile?.account_id,
        user_id: user.id,
        connection_id: connection_id || null,
        direction: "sent",
        subject,
        body_text: emailBody,
        snippet: emailBody?.slice(0, 200) || "",
        from_address,
        from_name: from_name || null,
        to_addresses: [to],
        linked_type: linked_type || null,
        linked_id: linked_id || null,
        status: "sent",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
