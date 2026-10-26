"use client";

import { useState } from "react";
import { useRunner } from "@/components/RunnerProvider";
import { fill, type Sign as SignText } from "@/lib/runner";


// Corrugated cardboard: flutes, paper grain and a little colour variation.
const CARDBOARD = [
  "repeating-linear-gradient(90deg, rgba(70,44,16,.07) 0 2px, transparent 2px 10px)",
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .2  0 0 0 0 .08  0 0 0 .35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
  "radial-gradient(ellipse at 30% 20%, rgba(255,240,210,.25), transparent 60%)",
  "#C59B6B",
].join(", ");
const DUCT_TAPE = "repeating-linear-gradient(90deg, rgba(255,255,255,.25) 0 1px, transparent 1px 4px), linear-gradient(180deg, #C9CDCF, #A9AEB1)";
const TILTS = [-2, 1.5, -1, 2.2, -1.6, 0.8];

export default function Sign({ signs }: { signs: SignText[] }) {
  const r = useRunner();
  const [i, setI] = useState(0);
  const raw = signs[i % signs.length];
  const s = { top: fill(raw.top, r), bottom: fill(raw.bottom, r) };

  return (
    <>
      <section style={{ padding: "40px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="signwiggle" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div
            className="print-sign"
            aria-live="polite"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 320,
              minHeight: 260,
              background: CARDBOARD,
              boxShadow: "inset 0 0 28px rgba(92,58,24,.38), 0 12px 20px rgba(0,0,0,.25)",
              clipPath: "polygon(1% 2%, 22% 0, 48% 1.5%, 73% 0.3%, 99% 1.8%, 100% 38%, 98.6% 71%, 99.6% 98%, 70% 100%, 41% 98.6%, 14% 100%, 0 97%, 1.4% 64%, 0 31%)",
              transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
              padding: "28px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              gap: 8,
              color: "#1E1D1A",
            }}
          >
            <span style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, whiteSpace: "pre-line", letterSpacing: "-0.01em" }}>{s.top}</span>
            <span style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: "var(--accent)", WebkitTextStroke: "1px #1E1D1A", whiteSpace: "pre-line" }}>{s.bottom}</span>
            {/* Duct tape holding the stick on */}
            <span aria-hidden="true" className="no-print" style={{ position: "absolute", left: "50%", bottom: -6, width: 70, height: 26, marginLeft: -35, background: DUCT_TAPE, transform: "rotate(-4deg)" }} />
          </div>
          <div
            aria-hidden="true"
            style={{
              width: 16,
              height: 96,
              marginTop: -4,
              background: "repeating-linear-gradient(180deg, #D7AE76 0 7px, #CFA36A 7px 9px, #DDB781 9px 15px)",
              boxShadow: "inset -3px 0 0 rgba(0,0,0,.12), 0 6px 10px rgba(0,0,0,.18)",
              borderRadius: "0 0 3px 3px",
            }}
          />
        </div>
      </section>

      <section style={{ padding: "8px 16px 24px", display: "flex", gap: 12 }}>
        <button type="button" className="btn btn-sun" style={{ flex: "1 1 0", minHeight: 52 }} onClick={() => setI((n) => n + 1)}>
          Shuffle
        </button>
        <button type="button" className="btn btn-ink" style={{ flex: "1 1 0", minHeight: 52 }} onClick={() => window.print()}>
          Print
        </button>
      </section>
      <p style={{ margin: "0 16px 32px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "center" }}>
        Sign {(i % signs.length) + 1} of {signs.length}. {r.name} reserves the right to laugh, cry, or both.
      </p>
    </>
  );
}
