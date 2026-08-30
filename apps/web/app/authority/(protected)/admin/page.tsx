
import Link from "next/link";

const SECTIONS = [
  { href: "/authority/admin/authorities", title: "Authority Accounts", desc: "Create and view authority/admin logins." },
  { href: "/authority/admin/sensors", title: "Sensors", desc: "Register IoT sensors to a village." },
  { href: "/authority/admin/shelters", title: "Shelters", desc: "Register evacuation shelters to a watershed." },
];

export default function AdminIndexPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      <p className="mt-1 text-sm text-white/50">Infrastructure setup — not for day-to-day monitoring.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.05]"
          >
            <h2 className="font-semibold text-white">{s.title}</h2>
            <p className="mt-1 text-sm text-white/50">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}