import { listPromos } from "@/lib/admin-data";
import { fmtDate } from "@/lib/format";
import { savePromo, setPromoActive, deletePromo } from "../../actions";
import { requireStaff } from "@/lib/auth";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";

export const instant = false; // session-gated: always rendered per request

export const metadata = { title: "Promotions" };

export default async function Promos() {
  const [promos, staff] = await Promise.all([listPromos(), requireStaff()]);
  return (
    <>
      <header className="a-head"><div><h1>Promotions</h1><p className="a-muted">Discount codes applied at checkout</p></div></header>
      <section className="a-card">
        <h2>Create or update a code</h2>
        <ActionForm action={savePromo} submit="Save code" className="a-form a-inline-grid" btnClass="a-btn a-btn-primary">
          <label>Code<input name="code" placeholder="WELCOME10" required /></label>
          <label>Discount %<input name="pct" type="number" min="1" max="100" step="1" required /></label>
          <label>Max uses<input name="max_uses" type="number" min="1" placeholder="Unlimited" /></label>
          <label>Expires<input name="expires_at" type="date" /></label>
        </ActionForm>
      </section>
      <section className="a-card flush">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Code</th><th className="r">Discount</th><th className="r">Used</th><th>Expires</th><th>Status</th><th /></tr></thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.code}>
                  <td><b>{p.code}</b></td>
                  <td className="r">{Math.round(Number(p.pct) * 100)}%</td>
                  <td className="r">{p.uses}{p.max_uses ? ` / ${p.max_uses}` : ""}</td>
                  <td>{p.expires_at ? fmtDate(p.expires_at) : "Never"}</td>
                  <td>{p.active ? <span className="a-badge s-delivered">Active</span> : <span className="a-badge s-refunded">Paused</span>}</td>
                  <td className="r">
                    <form action={setPromoActive} style={{ display: "inline" }}>
                      <input type="hidden" name="code" value={p.code} /><input type="hidden" name="active" value={String(!p.active)} />
                      <button className="a-link">{p.active ? "Pause" : "Activate"}</button>
                    </form>
                    {staff.role === "super_admin" && (
                      <form action={deletePromo} style={{ display: "inline", marginLeft: 12 }}>
                        <input type="hidden" name="code" value={p.code} />
                        <ConfirmButton className="a-link danger" message={`Delete ${p.code}?`}>Delete</ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {promos.length === 0 && <tr><td colSpan={6} className="a-muted">No codes yet. Run <code>npm run db:seed</code> to add WELCOME10.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
