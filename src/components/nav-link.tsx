"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  ReceiptText,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Landmark,
  ReceiptText,
  FileText,
  Settings,
  Users,
};

export function NavLink({
  href,
  label,
  icon,
  mobile,
  inverted,
}: {
  href: string;
  label: string;
  icon: string;
  mobile?: boolean;
  inverted?: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  const Icon = iconMap[icon];

  if (mobile) {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors duration-150 rounded-lg ${
          isActive
            ? "text-red-700 bg-red-50"
            : "text-slate-500 hover:text-red-700"
        }`}
      >
        <Icon size={20} aria-hidden="true" />
        {label}
      </Link>
    );
  }

  if (inverted) {
    return (
      <Link
        href={href}
        className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-white/20 text-white"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-red-50 text-red-700"
          : "text-slate-600 hover:bg-red-50 hover:text-red-700"
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
