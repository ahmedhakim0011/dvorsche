import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Brand";

export const metadata: Metadata = {
  title: "The House",
  description: "The House of D’Vorsche: our first chapter, the Woven DV monogram and how to care for your leather.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="page prose-page">
      <header className="page-head">
        <p className="eyebrow">The House of D’Vorsche</p>
        <h1 className="serif">
          Quiet authority. Lasting character. <em>Nothing unnecessary.</em>
        </h1>
      </header>

      <p className="lede">
        D’Vorsche is built around a simple belief: the things you carry should reflect the standards you live by. In a world that constantly demands attention,
        true distinction doesn’t need to announce itself. It lives in considered details, purposeful design, materials chosen with care, and objects made to
        become part of your everyday life.
      </p>

      <nav className="cta-row" aria-label="The House">
        <Link href="/story" className="btn btn-ghost">Our story</Link>
        <Link href="/standard" className="btn btn-ghost">The D’Vorsche Standard</Link>
      </nav>

      <section id="first-chapter">
        <p className="eyebrow">Our First Chapter</p>
        <h2 className="serif">The wallet.</h2>
        <p>Every lasting idea starts somewhere. For D’Vorsche, the first chapter begins with an everyday essential: small enough to carry everywhere, personal enough to use every day, and practical enough that every design decision matters.</p>
        <p>Our ambition is to rethink this familiar object through considered proportions, purposeful organization, distinctive details, and materials selected for their real-world qualities. Not another accessory designed only to look impressive in a photograph. An essential designed to earn its place in your everyday life.</p>
      </section>

      <section id="monogram">
        <h2 className="serif">The monogram</h2>
        <div className="mono-row">
          <div className="mono-plate deco">
            <Logo variant="mark" tone="ivory" alt="The Woven DV monogram" />
          </div>
          <p>
            The Woven DV monogram joins the two initials in a single line. The V rises from the base of the D and passes under its stem on one side and over its
            curve on the other, like thread through cloth. It appears on every piece, and it is the only decoration we use.
          </p>
        </div>
      </section>

      <section id="care">
        <h2 className="serif">Leather care</h2>
        <p>Keep leather away from prolonged moisture and direct heat. Wipe with a soft dry cloth, and condition occasionally with a neutral leather balm. Leather changes with use; that is part of its character.</p>
      </section>

      <Link href="/shop" className="btn btn-dark">Shop the collection</Link>
    </div>
  );
}
