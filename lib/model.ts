import { DISTANCE } from "./config";
import type { Runner } from "./runner";

const clamp = (m: number) => Math.min(Math.max(m, 0), DISTANCE);

export type Sighting = {
  id: string;
  name: string;
  mile: number;
  photo_path: string | null;
  seen_at?: string | null;
  created_at: string;
};

/** When the runner was actually at that mile (falls back to post time for old rows). */
export const seenAt = (s: Sighting) => new Date(s.seen_at ?? s.created_at);

export type Position = {
  mile: number; // icon
  lo: number; // cloud, slow edge
  hi: number; // cloud, fast edge
  anchor: Sighting | null;
};

/** Pace model, re-anchored on the latest sighting after the start. */
export function runnerPosition(now: Date, sightings: Sighting[], r: Runner): Position {
  const t = now.getTime();
  const start = new Date(r.start_time).getTime();
  // Latest by when they were seen, not when it was posted: a late post of an early sighting
  // must not drag her backwards.
  const anchor =
    sightings
      .filter((s) => {
        const c = seenAt(s).getTime();
        return c > start && c <= t;
      })
      .sort((a, b) => +seenAt(b) - +seenAt(a))[0] ?? null;

  const base = anchor ? Number(anchor.mile) : 0;
  const from = anchor ? seenAt(anchor).getTime() : start;
  const dt = Math.max(0, (t - from) / 1000);
  return {
    mile: clamp(base + dt / r.pace_goal_s),
    lo: clamp(base + dt / r.pace_slow_s),
    hi: clamp(base + dt / r.pace_fast_s),
    anchor,
  };
}

/** Pass-by window at a mile: fast edge to slow edge. */
export function etaWindow(r: Runner, fastMile: number, slowMile = fastMile): [Date, Date] {
  const start = new Date(r.start_time).getTime();
  return [new Date(start + fastMile * r.pace_fast_s * 1000), new Date(start + slowMile * r.pace_slow_s * 1000)];
}

/** "3:41:07" -> seconds, or null. */
export function parseHms(v: string): number | null {
  const m = v.trim().match(/^(\d):([0-5]\d):([0-5]\d)$/);
  if (!m) return null;
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}

export function formatHms(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Eastern clock time, e.g. "11:44" or "11:44 a.m." */
export function clock(d: Date, ampm = false) {
  const s = d.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const [hm, mer] = s.split(" ");
  return ampm ? `${hm} ${mer === "AM" ? "a.m." : "p.m."}` : hm;
}

export function mileLabel(mile: number) {
  return Number.isInteger(mile) ? String(mile) : mile.toFixed(1);
}
