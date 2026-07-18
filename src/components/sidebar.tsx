"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, FileText, Briefcase, Settings,
  ChevronDown, LogOut, Globe, PanelLeftClose, Zap,
  Target, GraduationCap, Layout,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Content Library", icon: BookOpen },
  { href: "/documentation", label: "Documentation", icon: FileText },
  { href: "/training", label: "Training", icon: GraduationCap },
  { href: "/crm", label: "CRM", icon: Target },
  { href: "/kanban", label: "Kanban", icon: Layout },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
];

const settingsSubItems = [
  { href: "/settings/account", label: "Account" },
  { href: "/settings/brand-kit", label: "Brand & Company" },
  { href: "/settings/users", label: "Team Members" },
  { href: "/settings/email", label: "Email Connections" },
  { href: "/admin", label: "Admin Panel" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/settings") || pathname.startsWith("/admin")
  );
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-[var(--color-sidebar-active)] text-white"
        : "text-gray-300 hover:text-white hover:bg-[var(--color-sidebar-hover)]"
    }`;

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Partner";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleLabel = profile?.role === "admin" ? "Admin" : profile?.role === "manager" ? "Manager" : "Partner";

  if (collapsed) {
    return (
      <aside className="sidebar-bg fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="mb-6 text-gray-400 hover:text-white p-1"
          aria-label="Expand sidebar"
        >
          <PanelLeftClose size={20} />
        </button>
        <div className="flex flex-col items-center gap-4 flex-1">
          {navItems.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`p-2 rounded-lg transition-colors ${
                isActive(href)
                  ? "bg-[var(--color-sidebar-active)] text-white"
                  : "text-gray-300 hover:text-white hover:bg-[var(--color-sidebar-hover)]"
              }`}
              title={href === "/" ? "Home" : href.slice(1)}
            >
              <Icon size={20} />
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar-bg fixed left-0 top-0 z-40 flex h-screen w-64 flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">
            Trusted<span className="text-[var(--color-brand-primary)]">Networx</span>
          </span>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            Partner Hub
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}

        {/* Settings with sub-items */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname.startsWith("/settings") || pathname.startsWith("/admin")
                ? "bg-[var(--color-sidebar-active)] text-white"
                : "text-gray-300 hover:text-white hover:bg-[var(--color-sidebar-hover)]"
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              <span>Settings</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {settingsOpen && (
            <div className="ml-9 mt-1 space-y-1">
              {settingsSubItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(href)
                      ? "text-white bg-[var(--color-sidebar-active)]"
                      : "text-gray-400 hover:text-white hover:bg-[var(--color-sidebar-hover)]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom — user info with dynamic profile */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white text-sm font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-400">{roleLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Globe size={14} />
          <span>English</span>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-white"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
