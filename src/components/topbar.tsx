"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/opportunities?create=true")}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-secondary)] transition-colors shadow-sm"
          >
            + Register opportunity
          </button>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              2
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
