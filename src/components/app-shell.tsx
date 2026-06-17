"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import { LogoutButton } from "@/components/logout-button";
import { InstallPrompt } from "@/components/install-prompt";

const sharedLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/loans", label: "Loans", icon: "Landmark" },
  { href: "/payments", label: "Payments", icon: "ReceiptText" },
];

const adminLinks = [
  { href: "/reports", label: "Reports", icon: "FileText" },
  { href: "/admin/config", label: "Settings", icon: "Settings" },
  { href: "/admin/users", label: "Users", icon: "Users" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoginPage = pathname === "/login";
  const isAdmin = session?.user?.role === "ADMIN";

  const navLinks = isAdmin ? [...sharedLinks, ...adminLinks] : sharedLinks;

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white shadow-md print:hidden">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-2.5 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/15 p-1">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-wide">JBV Credit</span>
            </span>
          </Link>
          <nav className="hidden sm:flex items-center ml-auto gap-0.5">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} icon={link.icon} inverted />
            ))}
            <span className="mx-1 h-5 w-px bg-white/20" />
            <LogoutButton inverted />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <InstallPrompt />

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white sm:hidden print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            mobile
          />
        ))}
        <LogoutButton />
      </nav>
    </div>
  );
}
