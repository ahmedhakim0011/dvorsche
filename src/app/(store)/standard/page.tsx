import type { Metadata } from "next";
import Link from "next/link";
import { PILLARS, STANDARD, TAGLINE } from "@/lib/brand-story";

export const metadata: Metadata = {
  title: "The D’Vorsche Standard",
  description: "Three questions every D’Vorsche product must answer, and the four principles we stand for: purpose, character, detail and confidence without noise.",
  alternates: { canonical: "/standard" },
};

export default function Standard() {
  return (
    <div className="page prose-page">
      <header className="page-head">
        <p className="eyebrow">The D’Vorsche Standard</p>
        <h1 className="serif">Three questions. <em>Every product.</em></h1>
      </header>

      <ol className="standard-list standard-page-list">
        {STANDARD.map((q, i) => (
          <li key={q}><span className="numeral serif">{["I", "II", "III"][i]}</span><span className="serif">{q}</span></li>
        ))}
      </ol>
      <p className="muted">
        These are the principles we intend to carry into every product we create. D’Vorsche is at the beginning of its journey. The standard is the ambition;
        earning the trust to live up to it is the work ahead.
      </p>

      <section id="stand-for">
        <p className="eyebrow">What We Stand For</p>
        <div className="pillars">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="pillar">
              <span className="numeral serif">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="serif">{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="sign serif">{TAGLINE}</p>
      <div className="cta-row">
        <Link href="/story" className="btn btn-ghost">Our story</Link>
        <Link href="/collections/wallets" className="btn btn-dark">The luxury wallets</Link>
      </div>
    </div>
  );
}
