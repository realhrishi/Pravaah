import { RequireAuth } from "@/components/auth/RequireAuth";
import AuthoritySidebar from "@/components/authority/AuthoritySidebar";

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-screen w-full overflow-hidden bg-[#0a0714]">
        <AuthoritySidebar />
        <main className="min-w-0 flex-1 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}