import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { AppShell } from "@/components/app-shell";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "JBV Credit Collection Services",
  description: "Cash Lending System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JBV Credit",
  },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
