"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/map", label: "Live Map" },
  {href:"/alerts", label: "Alerts"},
  { href: "/DosDonts", label: "Do's & Don'ts" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  if (pathname.startsWith("/authority")) return null; // authority section has its own sidebar nav

  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-white">PRAVAAH</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === link.href ? "text-white" : "text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Role-aware links — only render once actually logged in */}
          {user && (
            <Link
              href="/authority/dashboard"
              className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/authority/admin"
              className="text-sm font-medium text-rose-400 transition-colors hover:text-rose-300"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Same pill, label + destination swap based on auth state —
            never a filled/primary button, so citizens don't mistake
            this for something meant for them */}
        <Link
          href={user ? "/authority/dashboard" : "/authority/login"}
          className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
        >
          {user ? `${user.name.split(" ")[0]} →` : "Authority Access"}
        </Link>
      </nav>
    </header>
  );
}