import type { Metadata } from "next";
import Link from "next/link";
import { TAGLINE } from "@/lib/brand-story";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Not made to follow. Made to endure. The story behind D’Vorsche: why an everyday essential deserves the same care as the things we save for special occasions.",
  alternates: { canonical: "/story" },
};

export default function Story() {
  return (
    <div className="page prose-page">
      <header className="page-head">
        <p className="eyebrow">Our Story</p>
        <h1 className="serif">Not made to follow. <em>Made to endure.</em></h1>
      </header>

      <p className="lede">
        D’Vorsche is built around a simple belief: the things you carry should reflect the standards you live by. In a world that constantly demands attention,
        true distinction doesn’t need to announce itself. It lives in considered details, purposeful design, materials chosen with care, and objects made to
        become part of your everyday life.
      </p>
      <p className="lede">
        D’Vorsche exists for those who appreciate the difference between owning something expensive and owning something exceptional. We don’t believe in excess
        for the sake of appearance. We believe in character, restraint, and the confidence to choose well.
      </p>

      <section className="story-prose">
        <p>Some things are purchased for a moment. Others become part of your life.</p>
        <p>
          A wallet is one of the few objects you carry almost every day. It holds the things that matter, travels with you through different chapters of your life,
          and quietly becomes part of your routine. Yet something so personal is often treated as an afterthought.
        </p>
        <p>
          D’Vorsche begins with a different perspective: everyday essentials deserve the same thought, intention and attention to detail as the things we reserve
          for special occasions. Our approach is guided by restraint rather than excess, character rather than trends, and thoughtful design rather than
          unnecessary decoration.
        </p>
        <p>Every detail should have a reason to exist. Every material should earn its place. Every design should feel considered, not compromised by the need to follow what is popular.</p>
        <blockquote className="pull serif">
          Distinction isn’t always about being noticed by everyone. Sometimes, it’s about knowing exactly why you chose what you carry.
        </blockquote>
        <p className="sign serif">D’Vorsche. {TAGLINE}</p>
      </section>

      <div className="cta-row">
        <Link href="/standard" className="btn btn-ghost">The D’Vorsche Standard</Link>
        <Link href="/collections/wallets" className="btn btn-dark">The luxury wallets</Link>
      </div>
    </div>
  );
}
