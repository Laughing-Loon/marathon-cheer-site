// Runner settings: everything personal about the site. Stored in the Supabase `runner` table;
// DEFAULT_RUNNER is used until that's set up, so a fresh copy of the site works out of the box.

export type Pronouns = "she" | "he" | "they";

export type Runner = {
  name: string;
  pronouns: Pronouns;
  bib: string | null;
  splits_url: string | null;
  start_time: string; // ISO timestamp of the gun for the runner's wave
  wave: string | null;
  start_color: string | null;
  corral: string | null;
  pace_goal_s: number;
  pace_fast_s: number;
  pace_slow_s: number;
  board_from: string; // "3:30"
  board_to: string; // "4:30"
  donate_url: string | null;
  cause: string | null;
  finish_time: string | null; // "3:41:07", set after the race
  hair_color: string;
  skin_color: string;
};

export type Sign = { top: string; bottom: string };

export type PastRun = { id: string; title: string; subtitle: string | null; line: string | null; photo_path: string | null };

export const DEFAULT_RUNNER: Runner = {
  name: "Alex",
  pronouns: "they",
  bib: null,
  splits_url: null,
  start_time: "2026-11-01T09:10:00-05:00",
  wave: "1",
  start_color: "Orange",
  corral: null,
  pace_goal_s: 504,
  pace_fast_s: 500,
  pace_slow_s: 533,
  board_from: "3:30",
  board_to: "4:30",
  donate_url: null,
  cause: null,
  finish_time: null,
  hair_color: "#FFD84A",
  skin_color: "#F9D3B4",
};

export const DEFAULT_SIGNS: Sign[] = [
  { top: "RUN {NAME}\nTHE BAGELS ARE", bottom: "GETTING COLD" },
  { top: "YOU ARE FASTER\nTHAN THE", bottom: "G TRAIN" },
  { top: "TOUCH HERE\nFOR", bottom: "POWER" },
  { top: "THE WALL\nIS", bottom: "A SUGGESTION" },
  { top: "HURRY UP,\nI HAVE A", bottom: "BRUNCH RES" },
];

const PRONOUNS = {
  she: { subj: "she", obj: "her", poss: "her" },
  he: { subj: "he", obj: "him", poss: "his" },
  they: { subj: "they", obj: "them", poss: "their" },
} as const;

/** Pronoun forms, plus capitalised versions for the start of a sentence. */
export function pronouns(r: Runner) {
  const p = PRONOUNS[r.pronouns] ?? PRONOUNS.they;
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  return { ...p, Subj: cap(p.subj), Obj: cap(p.obj), Poss: cap(p.poss), plural: r.pronouns === "they" };
}

/** Replace {name} / {NAME} in a template. */
export const fill = (s: string, r: Runner) => s.replaceAll("{NAME}", r.name.toUpperCase()).replaceAll("{name}", r.name);

export const startDate = (r: Runner) => new Date(r.start_time);

/** Link for the "Real splits" button: explicit URL, else the NYRR results page for the bib. */
export function splitsUrl(r: Runner) {
  if (r.splits_url) return r.splits_url;
  if (r.bib) return `https://results.nyrr.org/event/M${startDate(r).getFullYear()}/result/${encodeURIComponent(r.bib)}`;
  return "https://www.nyrr.org/tcsnycmarathon/spectators/tracking";
}

/** "WAVE 1 · ORANGE · CORRAL E", skipping whatever isn't set. */
export function startTag(r: Runner) {
  return [r.wave && `WAVE ${r.wave}`, r.start_color?.toUpperCase(), r.corral && `CORRAL ${r.corral}`].filter(Boolean).join(" · ");
}

/** Eastern clock time, e.g. "9:10 a.m." */
export function easternTime(d: Date) {
  const s = d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", hour12: true });
  const [hm, mer] = s.split(" ");
  return `${hm} ${mer === "AM" ? "a.m." : "p.m."}`;
}

/** "SUN · NOV 1" in Eastern time. */
export function raceDay(d: Date) {
  const wd = d.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short" });
  const md = d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
  return `${wd} · ${md}`.toUpperCase();
}

export function causeLine(r: Runner) {
  return r.cause ? `Donate to ${r.cause}` : "Donate";
}
