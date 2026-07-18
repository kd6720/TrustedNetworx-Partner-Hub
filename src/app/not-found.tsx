import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Zap size={28} className="text-[var(--color-brand-primary)]" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Back to Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-8">
          TrustedNetworx Partner Hub
        </p>
      </div>
    </div>
  );
}
