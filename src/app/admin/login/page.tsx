import { hasSupabase } from "@/lib/supabase/config";
import { Logo } from "@/components/Brand";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="a-login">
      <div className="a-login-card">
        <div className="a-logo big"><Logo variant="horizontal" tone="color" alt="D’Vorsche" priority /><small>Admin</small></div>
        <h1>Sign in</h1>
        {hasSupabase() ? <LoginForm /> : <p className="a-err">Supabase isn&apos;t configured yet. Add your keys to <code>.env.local</code> — see the README.</p>}
      </div>
    </div>
  );
}
