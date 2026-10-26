import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";
import { DEFAULT_RUNNER, DEFAULT_SIGNS, type PastRun, type Runner, type Sign } from "./runner";

export type SiteData = { runner: Runner; signs: Sign[]; pastRuns: PastRun[]; wallUrl: string | null };

/**
 * Runner settings, sign puns and wall posters from Supabase, cached and refreshed about once a minute,
 * so an edit in the dashboard shows up without a redeploy. Falls back to defaults without Supabase;
 * a failed fetch is only cached for seconds, so a blip never sticks.
 */
export async function getSiteData(): Promise<SiteData> {
  "use cache";

  const fallback: SiteData = { runner: DEFAULT_RUNNER, signs: DEFAULT_SIGNS, pastRuns: [], wallUrl: null };
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    cacheLife("max");
    return fallback;
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  try {
    const [runner, signs, pastRuns] = await Promise.all([
      sb.from("runner").select("*").maybeSingle(),
      sb.from("signs").select("top, bottom").order("sort"),
      sb.from("past_runs").select("id, title, subtitle, line, photo_path").order("sort"),
    ]);
    if (runner.error || signs.error || pastRuns.error) throw runner.error ?? signs.error ?? pastRuns.error;
    cacheLife("minutes");
    return {
      runner: { ...DEFAULT_RUNNER, ...stripNulls(runner.data ?? {}) },
      signs: signs.data?.length ? signs.data : DEFAULT_SIGNS,
      pastRuns: pastRuns.data ?? [],
      wallUrl: sb.storage.from("wall").getPublicUrl("").data.publicUrl,
    };
  } catch {
    cacheLife("seconds");
    return fallback;
  }
}

// Keep defaults for required fields the database left empty, but keep explicit nulls for optional ones.
function stripNulls(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== null || (k in DEFAULT_RUNNER && DEFAULT_RUNNER[k as keyof Runner] === null)) out[k] = v;
  }
  return out as Partial<Runner>;
}
