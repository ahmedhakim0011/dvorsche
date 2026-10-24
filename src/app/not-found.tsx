import Link from "next/link";
import { WovenMark } from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="page empty">
      <WovenMark className="mark-sm" />
      <p className="eyebrow">404</p>
      <h1 className="serif">This page cannot be found.</h1>
      <p className="muted">It may have moved, or the address may be mistyped.</p>
      <Link href="/shop" className="btn btn-dark">Return to the collection</Link>
    </div>
  );
}
