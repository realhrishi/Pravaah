// app/authority/admin/authorities/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminService, type AdminUser, type CreateAuthorityInput } from "@/services/admin";

export default function AdminAuthoritiesPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CreateAuthorityInput>({ email: "", password: "", name: "", role: "AUTHORITY" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    adminService.listAuthorities().then(setUsers).finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminService.createAuthority(form);
      setForm({ email: "", password: "", name: "", role: "AUTHORITY" });
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white">Authority Accounts</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <input
          required
          type="password"
          placeholder="Password (min 8 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as "AUTHORITY" | "ADMIN" })}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none"
        >
          <option value="AUTHORITY" className="bg-[#12101f]">Authority</option>
          <option value="ADMIN" className="bg-[#12101f]">Admin</option>
        </select>

        {error && <p className="sm:col-span-2 text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a0714] disabled:opacity-40"
        >
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02]">
        {loading && <p className="p-5 text-sm text-white/40">Loading...</p>}
        {!loading &&
          users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-sm last:border-0">
              <div>
                <p className="text-white">{u.name}</p>
                <p className="text-xs text-white/40">{u.email}</p>
              </div>
              <span className={`text-xs font-semibold ${u.role === "ADMIN" ? "text-rose-400" : "text-white/50"}`}>
                {u.role}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}