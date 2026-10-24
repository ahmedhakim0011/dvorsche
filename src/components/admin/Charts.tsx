import { money } from "@/lib/products";

/** Server-rendered SVG revenue chart — no client JS required. */
export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const W = 760, H = 220, P = { l: 8, r: 8, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const bw = (W - P.l - P.r) / data.length;
  const y = (v: number) => P.t + (H - P.t - P.b) * (1 - v / max);
  const labelEvery = Math.ceil(data.length / 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="a-chart" role="img" aria-label="Daily revenue">
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1={P.l} x2={W - P.r} y1={y(max * g)} y2={y(max * g)} stroke="var(--a-line)" strokeDasharray={g ? "3 4" : undefined} />
      ))}
      {data.map((d, i) => (
        <g key={d.date}>
          <rect x={P.l + i * bw + bw * 0.16} width={bw * 0.68} y={y(d.revenue)} height={Math.max(d.revenue ? 2 : 0, H - P.b - y(d.revenue))} rx="2" fill="var(--a-bronze)" opacity={d.revenue ? 1 : 0.25}>
            <title>{`${d.date}: ${money(d.revenue)} · ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
          </rect>
          {i % labelEvery === 0 && (
            <text x={P.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--a-muted)">
              {d.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function HBars({ rows, format = money }: { rows: { label: string; value: number; sub?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="a-muted">No sales in this period yet.</p>;
  return (
    <ul className="a-hbars">
      {rows.map((r) => (
        <li key={r.label}>
          <div><span>{r.label}</span><b>{format(r.value)}</b></div>
          <i style={{ width: `${(r.value / max) * 100}%` }} />
          {r.sub && <small>{r.sub}</small>}
        </li>
      ))}
    </ul>
  );
}

export function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev) return <span className="a-delta flat">new</span>;
  const pct = ((cur - prev) / prev) * 100;
  return <span className={`a-delta ${pct >= 0 ? "up" : "down"}`}>{pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}% vs prior</span>;
}
