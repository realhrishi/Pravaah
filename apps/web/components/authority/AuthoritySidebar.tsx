"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/authority/dashboard", label: "Dashboard" },
  { href: "/authority/alerts", label: "Alerts" },
  { href: "/authority/sensors", label: "Sensors" },
  { href: "/authority/simulate", label: "Simulate" },
  {href:"/" , label: "Public Site"},
];

export default function AuthoritySidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-[#0d0a1a] px-4 py-6">
      <Link href="/authority/dashboard" className="mb-8 block px-2">
        <span className="text-lg font-extrabold tracking-tight text-white">PRAVAAH</span>
        <span className="ml-2 text-xs font-medium text-white/40">Authority</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-white/10" />
            <Link
              href="/authority/admin"
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                pathname.startsWith("/authority/admin")
                  ? "bg-rose-400/15 text-rose-300"
                  : "text-rose-400/80 hover:bg-rose-400/10 hover:text-rose-300"
              }`}
            >
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        {user && (
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-white/40">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}