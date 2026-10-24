import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Brand";

export const metadata: Metadata = {
  title: "The House",
  description: "The thinking behind D’Vorsche and the Woven DV monogram: leather wallets designed with restraint.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="page prose-page">
      <header className="page-head">
        <p className="eyebrow">The House of D’Vorsche</p>
        <h1 className="serif">
          We make fewer things, <em>quietly.</em>
        </h1>
      </header>

      <p className="lede">
        D’Vorsche designs leather wallets for people who prefer to be recognised by their taste, not their logo. We begin with wallets, and every piece is held to
        the same standard: restraint in form, care in detail, and nothing that will look dated next season.
      </p>

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
