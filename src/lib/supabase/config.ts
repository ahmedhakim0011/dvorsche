export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** True when all three Supabase env vars are present. Otherwise the app runs on the built-in demo catalog. */
export const hasSupabase = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SERVICE_KEY);
export const getServiceKey = () => SERVICE_KEY;
