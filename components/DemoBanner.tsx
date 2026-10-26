import { DEMO } from "@/lib/env";

/** Shown only until Supabase keys are set, so nobody mistakes local data for shared data. */
export default function DemoBanner() {
  if (!DEMO) return null;
  return <div className="demo-banner">Demo mode: entries are saved in this browser only.</div>;
}
