import { listTeam } from "@/lib/admin-data";
import { fmtDate } from "@/lib/format";
import { createStaff, setRole } from "../../actions";
import { requireStaff } from "@/lib/auth";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Team & roles" };

export default async function Team() {
  const me = await requireStaff("super_admin");
  const team = await listTeam();
  return (
    <>
      <header className="a-head"><div><h1>Team &amp; roles</h1><p className="a-muted">Super admins manage staff, delete products and codes. Admins run day-to-day operations.</p></div></header>
      <section className="a-card">
        <h2>Add a team member</h2>
        <ActionForm action={createStaff} submit="Create account" className="a-form a-inline-grid" btnClass="a-btn a-btn-primary">
          <label>Name<input name="name" /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Temporary password<input name="password" type="password" minLength={10} autoComplete="new-password" required /></label>
          <label>Role<select name="role" defaultValue="admin"><option value="admin">Admin</option><option value="super_admin">Super admin</option></select></label>
        </ActionForm>
      </section>
      <section className="a-card flush">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Member</th><th>Role</th><th>Since</th><th /></tr></thead>
            <tbody>
              {team.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.full_name || t.email}</b>{t.id === me.id && <span className="a-muted"> (you)</span>}<br /><span className="a-muted">{t.email}</span></td>
                  <td><span className={`a-badge ${t.role === "super_admin" ? "s-shipped" : "s-paid"}`}>{t.role.replace("_", " ")}</span></td>
                  <td>{fmtDate(t.created_at)}</td>
                  <td className="r">
                    {t.id !== me.id && (
                      <>
                        <form action={setRole} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={t.id} /><input type="hidden" name="role" value={t.role === "admin" ? "super_admin" : "admin"} />
                          <button className="a-link">{t.role === "admin" ? "Make super admin" : "Make admin"}</button>
                        </form>
                        <form action={setRole} style={{ display: "inline", marginLeft: 12 }}>
                          <input type="hidden" name="id" value={t.id} /><input type="hidden" name="role" value="customer" />
                          <ConfirmButton className="a-link danger" message={`Remove admin access for ${t.email}?`}>Revoke access</ConfirmButton>
                        </form>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
