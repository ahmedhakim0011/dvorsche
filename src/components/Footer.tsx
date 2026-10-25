import Link from "next/link";
import { Logo } from "./Brand";
import ConsentLink from "./ConsentLink";

export default function Footer({ nav }: { nav: { href: string; label: string }[] }) {
  return (
    <footer className="footer on-dark">
      <div className="footer-grid">
        <div>
          <Logo variant="stacked" tone="ivory" className="footer-logo" />
          <p className="small">A standard of your own. Understated leather goods, marked by the Woven DV monogram.</p>
        </div>
        <div>
          <p className="eyebrow">Shop</p>
          <ul>
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">The House</p>
          <ul>
            <li><Link href="/about">Philosophy</Link></li>
            <li><Link href="/story">Our story</Link></li>
            <li><Link href="/standard">The Standard</Link></li>
            <li><Link href="/about#monogram">The monogram</Link></li>
            <li><Link href="/about#care">Leather care</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Service</p>
          <ul>
            <li>Complimentary shipping over $250</li>
            <li>30-day returns</li>
            <li>Gift wrapping on every order</li>
          </ul>
        </div>
      </div>
      <div className="footer-base">
        <span>© D’Vorsche. All rights reserved.</span>
        <span>Demo storefront — no payments are processed.</span>
        {process.env.NEXT_PUBLIC_GA_ID ? <ConsentLink /> : null}
      </div>
    </footer>
  );
}
