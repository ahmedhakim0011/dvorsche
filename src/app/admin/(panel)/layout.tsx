import { Suspense } from "react";
import { Logo } from "@/components/Brand";
import Sidebar from "@/components/admin/Sidebar";
import { requireStaff } from "@/lib/auth";
import { hasSupabase } from "@/lib/supabase/config";

// Every admin route reads the session, so it always renders per request. Opt out of instant-navigation validation.
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="a-loading">Loading dashboard…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  if (!hasSupabase()) {
    return (
      <div className="a-login">
        <div className="a-login-card wide">
          <div className="a-logo big"><Logo variant="horizontal" tone="color" alt="D’Vorsche" priority /><small>Admin</small></div>
          <h1>Connect Supabase</h1>
          <ol className="a-steps">
            <li>Create a project at supabase.com and run <code>supabase/migrations/001_init.sql</code> in the SQL editor.</li>
            <li>Copy <code>.env.local.example</code> to <code>.env.local</code> and fill in the three keys.</li>
            <li>Run <code>npm run db:seed</code> and <code>npm run admin:create -- you@email.com &quot;a-strong-password&quot;</code>.</li>
            <li>Restart the dev server and sign in.</li>
          </ol>
        </div>
      </div>
    );
  }
  const staff = await requireStaff();
  return (
    <div className="a-shell">
      <Sidebar name={staff.name} role={staff.role} />
      <main className="a-main">{children}</main>
    </div>
  );
}
