// Creates (or promotes) the first super admin:  npm run admin:create -- you@example.com "a-strong-password" "Your Name"
import { db } from "./_env.mjs";

const [email, password, name = ""] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error('Usage: npm run admin:create -- <email> <password (10+ chars)> ["Full name"]');
  process.exit(1);
}

let id;
const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
if (error) {
  if (!/already|registered|exists/i.test(error.message)) throw error;
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  id = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  if (!id) throw error;
  await db.auth.admin.updateUserById(id, { password });
} else id = data.user.id;

const { error: e2 } = await db.from("profiles").upsert({ id, email, full_name: name || null, role: "super_admin" });
if (e2) throw e2;
console.log(`${email} is now a super admin. Sign in at /admin/login.`);
