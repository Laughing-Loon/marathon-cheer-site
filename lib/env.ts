// Plain module (no "use client") so server and client components both read real values.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when no Supabase keys are set: data lives in this browser only. */
export const DEMO = !SUPABASE_URL || !SUPABASE_KEY;
