import type { CSSProperties, ReactNode } from "react";
import type { PastRun } from "@/lib/runner";
import PosterPhoto from "./PosterPhoto";

// Where posters sit on the wall above the flyer (left as % of width, top in px).
const SLOTS: { left: string; top: number; width: number; rotate: number }[] = [
  { left: "-3%", top: 58, width: 118, rotate: -4 },
  { left: "31%", top: 50, width: 116, rotate: 3 },
  { left: "66%", top: 62, width: 118, rotate: -2.5 },
  { left: "13%", top: 150, width: 116, rotate: 2.5 },
  { left: "47%", top: 142, width: 116, rotate: -3.5 },
  { left: "79%", top: 156, width: 118, rotate: 4 },
]

const INK = "#1A1A17";

// Paste wrinkles and a ragged bottom edge, so posters read as paper glued to the wall.
const wrinkles =
  "linear-gradient(97deg, transparent 20%, rgba(0,0,0,.06) 21%, transparent 23%), linear-gradient(83deg, transparent 62%, rgba(255,255,255,.35) 63%, transparent 66%), linear-gradient(180deg, rgba(255,255,255,.15), rgba(0,0,0,.06))";
const ragged = "polygon(0 0, 100% 0, 100% 93%, 88% 97%, 74% 94%, 60% 99%, 44% 95%, 28% 98%, 13% 94%, 0 97%)";

function Paper({ bg, color = INK, children, style }: { bg: string; color?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        height: 170,
        padding: "10px 9px",
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
    <Paper bg="#F4F1E8" style={{ padding: 6, gap: 3 }}>
      {photo ? <PosterPhoto src={photo} /> : null}
      <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase" }}>{run.title}</span>
      {run.subtitle ? <span style={{ fontSize: 11, fontWeight: 900 }}>{run.subtitle}</span> : null}
      {run.line ? <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.15 }}>{run.line}</span> : null}
    </Paper>
  );
}

/** Wheatpasted posters on the wall behind the flyer: the runner's past runs first, then filler. */
export default function PosterWall({ pastRuns, wallUrl }: { pastRuns: PastRun[]; wallUrl: string | null }) {
  const posters = [...pastRuns.map((r) => <RunPoster key={r.id} run={r} wallUrl={wallUrl} />), ...JOKES].slice(0, SLOTS.length);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Scraps of older, torn-off posters */}
      <span style={{ position: "absolute", left: "18%", top: 40, width: 60, height: 40, background: "rgba(244,241,232,.55)", transform: "rotate(8deg)", clipPath: "polygon(0 10%, 100% 0, 85% 100%, 10% 80%)" }} />
      <span style={{ position: "absolute", left: "68%", top: 150, width: 70, height: 50, background: "rgba(247,201,213,.45)", transform: "rotate(-6deg)", clipPath: "polygon(5% 0, 100% 20%, 90% 90%, 0 100%)" }} />
      {posters.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: SLOTS[i].left,
            top: SLOTS[i].top,
            width: SLOTS[i].width,
            transform: `rotate(${SLOTS[i].rotate}deg)`,
          }}
        >
          {p}
        </div>
      ))}
    </div>
  );
}
