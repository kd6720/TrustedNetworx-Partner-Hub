"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Branding {
  id: string;
  account_id: string;
  company_name_override: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  accent_color: string;
  sidebar_color: string;
}

interface BrandingContextType {
  branding: Branding | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: null,
  loading: true,
  refresh: async () => {},
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadBranding = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("id", user.id)
      .single();

    if (!profile?.account_id) { setLoading(false); return; }

    const { data } = await supabase
      .from("account_branding")
      .select("*")
      .eq("account_id", profile.account_id)
      .single();

    setBranding(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      await loadBranding();
    }
    init();
  }, [loadBranding]);

  // Apply CSS variables when branding changes
  useEffect(() => {
    if (!branding) return;
    const root = document.documentElement;
    root.style.setProperty("--color-brand-primary", branding.primary_color);
    root.style.setProperty("--color-brand-accent", branding.accent_color);
    root.style.setProperty("--color-sidebar-bg", branding.sidebar_color);
    root.style.setProperty("--color-sidebar-active", adjustColor(branding.primary_color, -20));
    root.style.setProperty("--color-sidebar-hover", "rgba(255,255,255,0.08)");
    if (branding.favicon_url) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) link.href = branding.favicon_url;
    }
  }, [branding]);

  return (
    <BrandingContext.Provider value={{ branding, loading, refresh: loadBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}

/** Darken a hex color by a percentage (negative = darker). */
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
