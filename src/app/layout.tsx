import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrustedNetworx Partner Hub",
  description: "Your partner enablement portal for TrustedNetworx telecom solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
