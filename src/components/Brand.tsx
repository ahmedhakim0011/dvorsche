import Image from "next/image";
import { WOVEN_MARK as M } from "@/lib/brand-mark";

const FILES = {
  horizontal: { w: 719, h: 130 },
  stacked: { w: 551, h: 320 },
  mark: { w: 114, h: 131 },
  "heritage-plaque": { w: 900, h: 560 },
  wordmark: { w: 600, h: 60 },
} as const;

export type LogoVariant = keyof typeof FILES;

/** The finalized Woven DV artwork, served unmodified from /public/brand. Use `ivory` on oxblood grounds. */
export function Logo({ variant = "horizontal", tone = "color", className, alt = "D’Vorsche", priority }: { variant?: LogoVariant; tone?: "color" | "ivory"; className?: string; alt?: string; priority?: boolean }) {
  const f = FILES[variant];
  return <Image src={`/brand/woven-${variant}-${tone}.svg`} width={f.w} height={f.h} alt={alt} className={className} unoptimized priority={priority} />;
}

/** Single-colour Woven DV mark that follows `currentColor`. For emblems, empty states and product artwork. */
export function WovenMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox={`0 0 ${M.width} ${M.height}`} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} fill="none" stroke="currentColor" strokeWidth={M.strokeWidth}>
      <g transform={`translate(${M.translate})`}>
        {M.paths.map((d, i) => (
          <path key={i} d={d} strokeLinejoin="miter" />
        ))}
      </g>
    </svg>
  );
}
