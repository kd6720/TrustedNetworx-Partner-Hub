"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Zap } from "lucide-react";
import Link from "next/link";

function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isToken, setIsToken] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Detect if user arrived via reset link
    const token = searchParams.get("token");
    if (token) setIsToken(true);
  }, [searchParams]);

  // Step 1: Request reset
  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/recovery",
    });
    setLoading(false);
    // Neutral message — don't leak whether email exists
    setMessage("If that email has an account, a reset link is on the way.");
    if (err) setError(err.message);
  }

  // Step 2: Set new password
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    }
  }

  return (
    <>
      {isToken ? (
        // Step 2: Set new password
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              placeholder="Re-enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </form>
      ) : (
        // Step 1: Request reset
        <form onSubmit={handleRequestReset} className="space-y-4">
          <p className="text-sm text-gray-500">Enter your email and we will send you a reset link.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
              placeholder="you@company.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      {message && (
        <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}
    </>
  );
}

export default function RecoveryPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-primary)]">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Password Recovery</h1>
          <p className="text-sm text-gray-500 mt-1">Reset your TrustedNetworx account</p>
        </div>

        <Suspense fallback={<div className="text-center py-8 text-sm text-gray-400">Loading...</div>}>
          <RecoveryForm />
        </Suspense>

        <p className="mt-4 text-center text-xs text-gray-400">
          <Link href="/login" className="text-[var(--color-brand-primary)] hover:underline">Back to Sign In</Link>
          <span className="mx-2">·</span>
          Partner Hub © 2026
        </p>
      </div>
    </div>
  );
}
