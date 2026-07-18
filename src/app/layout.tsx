import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1428",
};

export const metadata: Metadata = {
  title: {
    default: "TrustedNetworx Partner Hub",
    template: "%s | TrustedNetworx Partner Hub",
  },
  description:
    "Your partner enablement portal for TrustedNetworx telecom solutions — POTS replacement, UCaaS, SIP trunking, internet, and managed voice.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "TrustedNetworx Partner Hub",
    description:
      "Partner enablement portal for TrustedNetworx telecom solutions.",
    url: "https://hub.trustednetworx.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustedNetworx Partner Hub",
    description:
      "Partner enablement portal for TrustedNetworx telecom solutions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--color-brand-primary)] focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none"
        >
          Skip to main content
        </a>
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
