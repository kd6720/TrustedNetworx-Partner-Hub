"use client";

import { useState } from "react";
import { Zap, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "checking" | "approved" | "pending" | "blocked">("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) { setError("Please enter a valid email"); return; }

    setLoading(true);
    setStep("checking");

    // 1. Check if domain is blocked (free email)
    const { data: blocked } = await supabase
      .from("blocked_domains").select("domain").eq("domain", domain).single();

    if (blocked) {
      setStep("blocked");
      setLoading(false);
      return;
    }

    // 2. Check if account already exists for this domain
    const { data: existingAccount } = await supabase
      .from("accounts").select("id, company_name").eq("domain", domain).single();

    if (existingAccount) {
      // 3. Account exists — check if there's an invite or proceed
      const { data: invite } = await supabase
        .from("pending_registrations").select("id").eq("email", email).eq("status", "approved").single();

      if (invite) {
        // Invited user — create account directly
        const { error: signUpErr } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } }
        });
        if (signUpErr) { setError(signUpErr.message); setStep("form"); setLoading(false); return; }
        setStep("approved");
        setLoading(false);
        return;
      }

      // No invite — block self-attach to existing account for security
      setError(`The domain @${domain} already has an account. Ask your account admin to invite you.`);
      setStep("form");
      setLoading(false);
      return;
    }

    // 4. New domain — submit for admin approval
    const { error: insertErr } = await supabase.from("pending_registrations").insert({
      email, full_name: fullName, domain,
      company_name: companyName || domain,
      status: "pending"
    });

    if (insertErr) { setError(insertErr.message); setStep("form"); setLoading(false); return; }

    setStep("pending");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-primary)]">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TrustedNetworx</h1>
          <p className="text-sm text-gray-500 mt-1">Request Partner Hub Access</p>
        </div>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                placeholder="John Smith" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                placeholder="you@yourcompany.com" required />
              <p className="text-xs text-gray-400 mt-1">Business email required. No @gmail, @yahoo, etc.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                placeholder="Your Company Inc." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                placeholder="Min 8 characters" required minLength={8} />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Checking..." : "Request Access"}
            </button>
          </form>
        )}

        {step === "blocked" && (
          <div className="text-center py-4">
            <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Business Email Required</h2>
            <p className="text-sm text-gray-500 mb-4">
              @{email.split("@")[1]} is a personal email provider. Please use your work email to register.
            </p>
            <button onClick={() => { setStep("form"); setEmail(""); }} className="text-sm text-[var(--color-brand-primary)] hover:underline">
              Try a different email
            </button>
          </div>
        )}

        {step === "pending" && (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted</h2>
            <p className="text-sm text-gray-500 mb-1">
              We received your request for <strong>{email}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              An admin will review your domain <strong>@{email.split("@")[1]}</strong> and approve your account. You&apos;ll receive an email when approved.
            </p>
          </div>
        )}

        {step === "approved" && (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-sm text-gray-500 mb-4">
              Your account is ready. Check your email to confirm, then sign in.
            </p>
            <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-primary)] hover:underline">
              Go to Sign In <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {step === "form" && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Already have access? <Link href="/login" className="text-[var(--color-brand-primary)] hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
