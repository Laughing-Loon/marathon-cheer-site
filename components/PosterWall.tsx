"use client";

import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import type { PastRun } from "@/lib/runner";
import PosterPhoto from "./PosterPhoto";

// Six slots in a loose, slightly overlapping cluster (left/top as % of the square wall, tilt in degrees).
const SLOTS = [
  { left: 0, top: 0, rotate: -4 },
  { left: 31, top: 3, rotate: 3 },
  { left: 63, top: 0, rotate: -2.5 },
  { left: 5, top: 47, rotate: 3 },
  { left: 35, top: 50, rotate: -3 },
  { left: 64, top: 46, rotate: 4 },
];
const POSTER_WIDTH = "36%";

const INK = "#1A1A17";

// Paste wrinkles and a ragged bottom edge, so posters read as paper glued to the wall.
const wrinkles =
  "linear-gradient(97deg, transparent 20%, rgba(0,0,0,.06) 21%, transparent 23%), linear-gradient(83deg, transparent 62%, rgba(255,255,255,.35) 63%, transparent 66%), linear-gradient(180deg, rgba(255,255,255,.15), rgba(0,0,0,.06))";
const ragged = "polygon(0 0, 100% 0, 100% 93%, 88% 97%, 74% 94%, 60% 99%, 44% 95%, 28% 98%, 13% 94%, 0 97%)";

function Paper({ bg, color = INK, children, style }: { bg: string; color?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        minHeight: 150,
        padding: "10px 9px 14px",
        background: `${wrinkles}, ${bg}`,
        color,
        clipPath: ragged,
        boxShadow: "0 2px 3px rgba(0,0,0,.2)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// New York filler posters for any slots the runner's own posters don't fill.
const JOKES: ReactNode[] = [
  <Paper key="lost" bg="#F4F1E8">
    <span style={{ fontSize: 30, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.03em" }}>LOST</span>
    <span style={{ fontSize: 12, fontWeight: 900, lineHeight: 1.05 }}>MY WILL TO RUN</span>
    <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.2 }}>Last seen near mile 20. Reward: 1 everything bagel.</span>
    <span aria-hidden="true" style={{ display: "flex", gap: 2, marginTop: "auto" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} style={{ flex: 1, height: 22, borderLeft: `1px dashed ${INK}`, fontSize: 5, writingMode: "vertical-rl" }} />
      ))}
    </span>
  </Paper>,
  <Paper key="apt" bg="#F7C9D5">
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".12em" }}>FOR RENT</span>
    <span style={{ fontSize: 24, fontWeight: 900, lineHeight: 0.92 }}>1BR NO WINDOWS</span>
    <span style={{ fontSize: 18, fontWeight: 900 }}>$4,800</span>
    <span style={{ fontSize: 9, fontWeight: 600 }}>Steps from the course! Broker fee: yes.</span>
  </Paper>,
  <Paper key="band" bg="#1E1F1C" color="#FFD84A">
    <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: ".14em", color: "#F7B6C8" }}>LIVE · ONE NIGHT ONLY</span>
    <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 0.9 }}>THE NEGATIVE SPLITS</span>
    <span style={{ fontSize: 10, fontWeight: 800, color: "#FFFFFF" }}>w/ special guest THE WALL</span>
    <span style={{ fontSize: 9, fontWeight: 600, color: "#A9D4EE" }}>Mile 18 · No cover</span>
  </Paper>,
  <Paper key="couch" bg="#D6E9B4">
    <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 0.9 }}>FREE COUCH</span>
    <span style={{ fontSize: 10, fontWeight: 800 }}>On the stoop, 4th Ave</span>
    <span style={{ fontSize: 9, fontWeight: 600 }}>Smells fine. Mostly. Great for post-marathon lying down.</span>
  </Paper>,
];

function RunPoster({ run, wallUrl }: { run: PastRun; wallUrl: string | null }) {
  const photo = run.photo_path && wallUrl ? wallUrl + run.photo_path : null;
  return (
    <Paper bg="#F4F1E8" style={{ minHeight: 0, padding: "6px 6px 12px", gap: 3 }}>
      {photo ? <PosterPhoto src={photo} /> : null}
      <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase" }}>{run.title}</span>
      {run.subtitle ? <span style={{ fontSize: 11, fontWeight: 900 }}>{run.subtitle}</span> : null}
      {run.line ? <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.15 }}>{run.line}</span> : null}
    </Paper>
  );
}

/**
 * Wheatpasted posters on the wall behind the flyer: the runner's own photos first, then filler.
 * Posters overlap a little; drag one (finger or mouse) to move it, and it comes to the front.
 */
export default function PosterWall({ pastRuns, wallUrl }: { pastRuns: PastRun[]; wallUrl: string | null }) {
  const posters = [...pastRuns.map((r) => <RunPoster key={r.id} run={r} wallUrl={wallUrl} />), ...JOKES].slice(0, SLOTS.length);
  const [offsets, setOffsets] = useState(() => SLOTS.map(() => ({ x: 0, y: 0 })));
  // Stacking order: later in the list is on top. The first row starts on top so its captions show.
  const [order, setOrder] = useState(() => [5, 4, 3, 2, 1, 0]);
  const [dragging, setDragging] = useState<number | null>(null);
  const drag = useRef<{ i: number; startX: number; startY: number; ox: number; oy: number } | null>(null);
  const wall = useRef<HTMLDivElement>(null);

  function down(i: number, e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, startX: e.clientX, startY: e.clientY, ox: offsets[i].x, oy: offsets[i].y };
    setDragging(i);
    setOrder((o) => [...o.filter((n) => n !== i), i]);
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || !wall.current) return;
    const max = wall.current.clientWidth * 0.4; // keep posters mostly on the wall
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    const x = clamp(d.ox + e.clientX - d.startX);
    const y = clamp(d.oy + e.clientY - d.startY);
    setOffsets((o) => o.map((p, n) => (n === d.i ? { x, y } : p)));
  }

  function up() {
    drag.current = null;
    setDragging(null);
  }

  return (
    <div ref={wall} style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
      {posters.map((p, i) => (
        <div
          key={i}
          aria-hidden="true"
          onPointerDown={(e) => down(i, e)}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{
            position: "absolute",
            left: `${SLOTS[i].left}%`,
            top: `${SLOTS[i].top}%`,
            width: POSTER_WIDTH,
            zIndex: order.indexOf(i) + 1,
            transform: `translate(${offsets[i].x}px, ${offsets[i].y}px) rotate(${SLOTS[i].rotate}deg) scale(${dragging === i ? 1.05 : 1})`,
            filter: dragging === i ? "drop-shadow(0 10px 12px rgba(0,0,0,.25))" : undefined,
            touchAction: "none", // lets a finger drag the poster instead of scrolling the page
            cursor: dragging === i ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          {p}
        </div>
      ))}
    </div>
  );
}
