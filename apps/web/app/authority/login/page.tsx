"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const DEMO_PASSWORD = "demo-password-123";
const DEMO_ACCOUNTS = [
  { role: "Authority", email: "authority@chamoli-pilot.local" },
  { role: "Admin", email: "admin@chamoli-pilot.local" },
];

export default function AuthorityLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.replace("/authority/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0714] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-8"
      >
        <h1 className="text-xl font-bold text-white">Authority Access</h1>
        <p className="mt-1 text-sm text-white/50">
          Sign in with your authority or admin credentials.
        </p>
        
        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0a0714] transition-transform hover:scale-[1.01] disabled:opacity-40"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-5 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Demo credentials
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(DEMO_PASSWORD);
                  setError(null);
                }}
                className="rounded-lg px-2 py-1.5 text-left text-xs text-white/70 transition-colors hover:bg-white/10"
              >
                <span className="font-semibold text-white">{acc.role}</span>
                <span className="block font-mono text-white/50">{acc.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] text-white/40">
            Password: {DEMO_PASSWORD}
          </p>
        </div>
        
      </form>
    </main>
  );
}