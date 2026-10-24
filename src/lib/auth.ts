import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { adminClient, sessionClient } from "./supabase/clients";
import { hasSupabase } from "./supabase/config";

export type Role = "customer" | "admin" | "super_admin";
export interface Staff {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Returns the signed-in user with their role, or null. Always verifies with Supabase (getUser), never trusts the cookie alone. */
export async function getStaff(): Promise<Staff | null> {
  await connection();
  if (!hasSupabase()) return null;
  const supabase = await sessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await adminClient().from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email ?? "", name: profile?.full_name || user.email || "", role: (profile?.role as Role) ?? "customer" };
}

/** Gate for admin pages and server actions. `super_admin` is required for team management and destructive operations. */
export async function requireStaff(min: "admin" | "super_admin" = "admin"): Promise<Staff> {
  const s = await getStaff();
  if (!s || s.role === "customer") redirect("/admin/login");
  if (min === "super_admin" && s.role !== "super_admin") redirect("/admin");
  return s;
}
