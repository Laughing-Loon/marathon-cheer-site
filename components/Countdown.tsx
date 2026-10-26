"use client";

import { DISTANCE } from "@/lib/config";
import { useRunner } from "./RunnerProvider";
import { useNow } from "@/lib/clock";
import { pronouns } from "@/lib/runner";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown() {
  const now = useNow(1000);
  const r = useRunner();
  const start = new Date(r.start_time).getTime();
  let text = "Gun in …";
  if (now) {
    const ms = start - now.getTime();
    const doneBy = start + DISTANCE * r.pace_slow_s * 1000 + 30 * 60_000;
    if (ms > 0) {
      const m = Math.floor(ms / 60_000);
      const d = Math.floor(m / 1440);
      const h = Math.floor((m % 1440) / 60);
      text = d > 0 ? `Gun in ${d}d ${h}h ${pad(m % 60)}m` : `Gun in ${h}h ${pad(m % 60)}m ${pad(Math.floor(ms / 1000) % 60)}s`;
    } else if (now.getTime() < doneBy) {
      const m = Math.floor(-ms / 60_000);
      text = `Running for ${Math.floor(m / 60)}h ${pad(m % 60)}m`;
    } else {
      text = `${r.name} is done. Feed ${pronouns(r).obj}.`;
    }
  }
  return (
    <span
      role="timer"
      aria-live="off"
      style={{
        marginTop: 6,
        fontSize: 14,
        fontWeight: 800,
        border: "2px solid var(--ink)",
        borderRadius: 999,
        padding: "4px 12px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {text}
    </span>
  );
}
