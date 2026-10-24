import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, getServiceKey } from "./config";

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

/** Service-role client. Bypasses RLS — only ever use it after authorising the caller on the server. */
export const adminClient = () => createClient(SUPABASE_URL, getServiceKey(), noSession);

/** Anonymous client for public, cacheable reads (RLS applies). */
export const publicClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, noSession);

/** Cookie-bound client acting as the signed-in user (used for admin login / session checks). */
export async function sessionClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: the proxy refreshes the session instead
        }
      },
    },
  });
}
