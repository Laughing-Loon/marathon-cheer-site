"use client";

import { useEffect, useState } from "react";

/**
 * Current time, ticking. For testing, add ?now=2026-11-01T11:00:00-05:00 to any URL:
 * the clock starts there and keeps running. The offset sticks for the browser tab.
 */
function offsetMs(): number {
  if (typeof window === "undefined") return 0;
  const q = new URLSearchParams(window.location.search).get("now");
  if (q !== null) {
    const t = Date.parse(q);
    const off = Number.isNaN(t) ? 0 : t - Date.now();
    try {
      if (q) sessionStorage.setItem("yald:now-offset", String(off));
      else sessionStorage.removeItem("yald:now-offset");
    } catch {}
    return off;
  }
  try {
    return Number(sessionStorage.getItem("yald:now-offset") ?? 0);
  } catch {
    return 0;
  }
}

/** Now, honouring the ?now= test offset. */
export const nowMs = () => Date.now() + offsetMs();

export function useNow(tickMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const off = offsetMs();
    const tick = () => setNow(new Date(Date.now() + off));
    tick();
    const id = setInterval(tick, tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return now;
}
