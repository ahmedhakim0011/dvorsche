"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { Logo } from "./Brand";

type NavItem = { href: string; label: string };

function NavLinks({ nav, onNavigate, path }: { nav: NavItem[]; onNavigate: () => void; path?: string }) {
  return (
    <>
      {nav.map((n) => (
        <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={path !== undefined && path === n.href ? "page" : undefined}>
          {n.label}
        </Link>
      ))}
    </>
  );
}

/** Reads the pathname for the active-page state. Wrapped in Suspense by the caller so the page shell can prerender. */
function ActiveNavLinks({ nav, onNavigate }: { nav: NavItem[]; onNavigate: () => void }) {
  return <NavLinks nav={nav} onNavigate={onNavigate} path={usePathname()} />;
}

export default function Header({ nav }: { nav: { href: string; label: string }[] }) {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [menu]);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <div className="announce">
        Complimentary shipping over <b>$250</b> · Use code <b>WELCOME10</b> for 10% off your first order
      </div>
      <header className={`header${scrolled ? " is-scrolled" : ""}`}>
        <div className="header-in">
          <button className="icon-btn menu-btn" aria-label="Menu" aria-expanded={menu} aria-controls="primary-nav" onClick={() => setMenu(!menu)}>
            <span className="burger" data-open={menu} />
          </button>
          <nav id="primary-nav" className={`nav${menu ? " open" : ""}`} aria-label="Primary">
            <Suspense fallback={<NavLinks nav={nav} onNavigate={() => setMenu(false)} />}>
              <ActiveNavLinks nav={nav} onNavigate={() => setMenu(false)} />
            </Suspense>
          </nav>
          <Link href="/" className="logo" aria-label="D’Vorsche home" onClick={() => setMenu(false)}>
            <Logo variant="horizontal" priority alt="" />
          </Link>
          <div className="header-actions">
            <Link href="/shop#search" className="icon-btn" aria-label="Search the collection">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
            </Link>
            <button className="icon-btn bag-btn" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
              {count > 0 && <span className="bag-count" aria-hidden="true">{count}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
