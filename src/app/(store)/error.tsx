"use client";

import Link from "next/link";
import { WovenMark } from "@/components/Brand";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page empty" role="alert">
      <WovenMark className="mark-sm" />
      <h1 className="serif">Something went wrong.</h1>
      <p className="muted">Please try again. If the problem continues, return to the collection.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="btn btn-dark" onClick={() => reset()}>Try again</button>
        <Link href="/shop" className="btn btn-ghost">Return to the collection</Link>
      </div>
    </div>
  );
}
