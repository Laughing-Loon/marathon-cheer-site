// Race facts and design tokens: the same for every runner. Anything personal lives in the
// Supabase `runner` table (see lib/runner.ts).

export const DISTANCE = 26.2; // mi

export const COLORS = {
  ink: "#16201A",
  white: "#FFFFFF",
  wall: "#EFE8D8",
  flyer: "#F2B33D",
  sky: "#A9D4EE",
  sun: "#FFD84A",
  pink: "#F7B6C8",
  leaf: "#B9DE8F",
  grass: "#3F7A34",
  accent: "#F26B2A", // reserved for the runner, empty miles and donating
  muted: "#3C4A40",
} as const;
