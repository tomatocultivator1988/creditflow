"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton({ inverted }: { inverted?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
        inverted
          ? "text-white/80 hover:bg-white/10 hover:text-white"
          : "text-slate-600 hover:bg-red-50 hover:text-red-700"
      }`}
      title="Sign out"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
