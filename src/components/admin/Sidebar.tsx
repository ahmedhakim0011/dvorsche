"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { Logo } from "@/components/Brand";

const ICONS: Record<string, React.ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  orders: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" /><path d="M9 8h6M9 12h6" /></>,
  products: <><path d="M4 8h16v12H4Z" /><path d="M4 8l2-4h12l2 4" /><path d="M10 12h4" /></>,
  inventory: <><path d="M3 7l9-4 9 4-9 4Z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
  customers: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>,
  promos: <><path d="M20 12l-8 8-9-9V3h8Z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  team: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.6 3-6 7-6s7 2.4 7 6" /><path d="M16 5a3.5 3.5 0 0 1 0 6.5M18 14.5c2.4.7 4 2.5 4 5.5" /></>,
};

const ITEMS = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory" },
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/promos", label: "Promotions", icon: "promos" },
];

export default function Sidebar({ name, role }: { name: string; role: string }) {
  const path = usePathname();
  const items = role === "super_admin" ? [...ITEMS, { href: "/admin/team", label: "Team & roles", icon: "team" }] : ITEMS;
  return (
    <aside className="a-side">
      <Link href="/admin" className="a-logo" aria-label="D’Vorsche admin overview"><Logo variant="horizontal" tone="ivory" alt="D’Vorsche" priority /><small>Admin</small></Link>
      <nav aria-label="Admin">
        {items.map((i) => {
          const on = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[i.icon]}</svg>
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="a-user">
        <p>{name}</p>
        <span className="a-role">{role.replace("_", " ")}</span>
        <Link href="/" target="_blank" className="a-link">View storefront ↗</Link>
        <form action={signOut}>
          <button className="a-link">Sign out</button>
        </form>
      </div>
    </aside>
  );
}
