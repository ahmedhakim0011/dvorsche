import { useId } from "react";
import type { Product } from "@/lib/products";
import { WOVEN_MARK as M } from "@/lib/brand-mark";

/** Procedural studio-style product illustrations — a stand-in until campaign photography is supplied. */
export default function ProductArt({ art, label }: { art: Product["art"]; label: string }) {
  const id = useId().replace(/:/g, "");
  const { type, bg, c1, c2 } = art;
  const g = (n: string) => `url(#${n}${id})`;

  return (
    <svg viewBox="0 0 400 500" role="img" aria-label={label} className="art" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </linearGradient>
        <linearGradient id={`body${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c1} />
          <stop offset="0.35" stopColor={c1} stopOpacity="0.88" />
          <stop offset="1" stopColor={c2} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`leather${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
        <linearGradient id={`sheen${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`shine${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`glow${id}`} cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`blur${id}`}>
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <rect width="400" height="500" fill={g("bg")} />
      <rect width="400" height="500" fill={g("glow")} />
      <rect y="395" width="400" height="105" fill="#000" opacity="0.06" />
      <ellipse cx="200" cy="398" rx="110" ry="12" fill="#000" opacity="0.28" filter={g("blur")} />

      {type === "bottle" && (
        <g>
          <rect x="170" y="120" width="60" height="46" rx="4" fill={c2} />
          <rect x="170" y="120" width="60" height="46" rx="4" fill={g("shine")} />
          <rect x="164" y="160" width="72" height="12" rx="2" fill="#b98a4e" />
          <rect x="130" y="172" width="140" height="226" rx="14" fill={g("body")} />
          <rect x="130" y="172" width="140" height="226" rx="14" fill={g("shine")} />
          <rect x="146" y="238" width="108" height="86" rx="3" fill="#f4eee2" opacity="0.92" />
          <text x="200" y="274" textAnchor="middle" fontSize="13" letterSpacing="5" fill="#1a1512" fontFamily="serif">D’VORSCHE</text>
          <line x1="170" y1="286" x2="230" y2="286" stroke="#a07c4a" strokeWidth="0.8" />
          <text x="200" y="305" textAnchor="middle" fontSize="7" letterSpacing="2.5" fill="#6b645b" fontFamily="sans-serif"></text>
        </g>
      )}

      {type === "candle" && (
        <g>
          <line x1="200" y1="170" x2="200" y2="196" stroke="#222" strokeWidth="2.5" />
          <ellipse cx="200" cy="164" rx="4" ry="9" fill="#e8a951" opacity="0.9" />
          <rect x="116" y="196" width="168" height="200" rx="18" fill={g("body")} />
          <rect x="116" y="196" width="168" height="200" rx="18" fill={g("shine")} />
          <ellipse cx="200" cy="198" rx="80" ry="10" fill={c1} />
          <ellipse cx="200" cy="198" rx="80" ry="10" fill="#fff" opacity="0.25" />
          <rect x="140" y="270" width="120" height="70" rx="2" fill="#f4eee2" opacity="0.9" />
          <text x="200" y="300" textAnchor="middle" fontSize="12" letterSpacing="5" fill="#1a1512" fontFamily="serif">D’VORSCHE</text>
          <text x="200" y="320" textAnchor="middle" fontSize="6.5" letterSpacing="2.5" fill="#6b645b" fontFamily="sans-serif">SCENTED CANDLE</text>
        </g>
      )}

      {type === "tote" && (
        <g>
          <path d="M140 190 C140 80 260 80 260 190" fill="none" stroke={c2} strokeWidth="9" strokeLinecap="round" />
          <path d="M96 190 H304 L322 396 H78 Z" fill={g("body")} />
          <path d="M96 190 H304 L322 396 H78 Z" fill={g("shine")} />
          <path d="M96 190 H304" stroke="#000" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M100 206 H300" stroke={c2} strokeOpacity="0.6" strokeWidth="1" strokeDasharray="4 4" />
          <rect x="188" y="226" width="24" height="24" rx="12" fill="#b98a4e" />
          <text x="200" y="243" textAnchor="middle" fontSize="10" fill="#3a2a14" fontFamily="serif">A</text>
        </g>
      )}

      {type === "clutch" && (
        <g>
          <rect x="70" y="210" width="260" height="170" rx="14" fill={g("body")} />
          <rect x="70" y="210" width="260" height="170" rx="14" fill={g("shine")} />
          <path d="M70 224 Q70 210 84 210 H316 Q330 210 330 224 V268 Q200 330 70 268 Z" fill={c1} />
          <path d="M70 224 Q70 210 84 210 H316 Q330 210 330 224 V268 Q200 330 70 268 Z" fill="#fff" opacity="0.07" />
          <circle cx="200" cy="296" r="9" fill={c2} />
          <circle cx="200" cy="296" r="4" fill="#fff" opacity="0.35" />
        </g>
      )}

      {type === "wallet" && (
        <g>
          <rect x="66" y="176" width="268" height="196" rx="12" fill="#000" opacity="0.28" filter={g("blur")} transform="translate(0 10)" />
          <rect x="70" y="182" width="260" height="190" rx="11" fill="#000" opacity="0.45" />
          <rect x="70" y="170" width="260" height="190" rx="11" fill={g("leather")} />
          <rect x="70" y="170" width="260" height="190" rx="11" fill={g("sheen")} />
          <path d="M70 181 Q70 170 81 170 H319 Q330 170 330 181" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.2" />
          <rect x="82" y="182" width="236" height="166" rx="6" fill="none" stroke={c2} strokeOpacity="0.75" strokeWidth="1" strokeDasharray="3.5 3" />
          <g transform="translate(200 265) scale(0.56) translate(-57.1 -65.5)" fill="none" strokeLinejoin="miter" strokeWidth={M.strokeWidth * 1.5}>
            <g transform={`translate(${M.translate})`}>
              {M.paths.map((d, i) => <path key={"l" + i} d={d} stroke="#fff" strokeOpacity="0.2" transform="translate(0 1.6)" />)}
              {M.paths.map((d, i) => <path key={"d" + i} d={d} stroke="#000" strokeOpacity="0.5" />)}
            </g>
          </g>
        </g>
      )}

      {type === "throw" && (
        <g>
          <rect x="70" y="330" width="260" height="66" rx="6" fill={c2} />
          <rect x="62" y="286" width="276" height="60" rx="6" fill={c1} />
          <rect x="74" y="242" width="252" height="58" rx="6" fill={c2} opacity="0.88" />
          <rect x="66" y="198" width="268" height="58" rx="6" fill={c1} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="62" y={198 + i * 44 + 40} width="276" height="3" fill="#fff" opacity="0.18" />
          ))}
          {Array.from({ length: 19 }).map((_, i) => (
            <line key={i} x1={74 + i * 13.5} y1="396" x2={74 + i * 13.5} y2="412" stroke={c2} strokeWidth="2" />
          ))}
          <rect x="62" y="198" width="276" height="200" rx="6" fill={g("shine")} />
        </g>
      )}

      {type === "vase" && (
        <g>
          <path d="M170 150 H230 C228 190 262 220 262 292 C262 350 238 396 200 396 C162 396 138 350 138 292 C138 220 172 190 170 150 Z" fill={g("body")} />
          <path d="M170 150 H230 C228 190 262 220 262 292 C262 350 238 396 200 396 C162 396 138 350 138 292 C138 220 172 190 170 150 Z" fill={g("shine")} />
          <ellipse cx="200" cy="150" rx="30" ry="6" fill={c2} />
          <ellipse cx="200" cy="150" rx="22" ry="3.5" fill="#000" opacity="0.4" />
          <path d="M214 140 C228 100 250 90 270 70" stroke="#6a7a58" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="272" cy="68" rx="9" ry="16" fill="#7d8f68" transform="rotate(28 272 68)" />
        </g>
      )}
    </svg>
  );
}
