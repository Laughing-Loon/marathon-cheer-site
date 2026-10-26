"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { nowMs } from "./clock";
import type { Sighting } from "./model";

export type Claim = { id: string; name: string; spot_id: string; wearing: string | null; created_at: string };
export type Guess = { id: string; name: string; finish_s: number; created_at: string };

import { DEMO, SUPABASE_KEY as KEY, SUPABASE_URL as URL } from "./env";

let client: SupabaseClient | null = null;
function sb() {
  if (!URL || !KEY) return null;
  client ??= createClient(URL, KEY, { auth: { persistSession: false } });
  return client;
}

export { DEMO };

// ---- demo store (localStorage), so the site runs before Supabase is wired up ----
function demoRead<T>(table: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(`yald:${table}`) ?? "[]");
  } catch {
    return [];
  }
}
function demoInsert<T extends object>(table: string, row: T) {
  const full = { id: crypto.randomUUID(), created_at: new Date(nowMs()).toISOString(), ...row };
  try {
    localStorage.setItem(`yald:${table}`, JSON.stringify([full, ...demoRead(table)]));
  } catch {
    throw new Error("Couldn't save in this browser.");
  }
  return full;
}

async function list<T>(table: string): Promise<T[]> {
  const c = sb();
  if (!c) return demoRead<T>(table);
  const { data, error } = await c.from(table).select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []) as T[];
}

async function insert(table: string, row: object) {
  const c = sb();
  if (!c) {
    demoInsert(table, row);
    return;
  }
  const { error } = await c.from(table).insert(row);
  if (error) throw error;
}

export const listClaims = () => list<Claim>("claims");
export const listGuesses = () => list<Guess>("guesses");
export const listSightings = () => list<Sighting>("sightings");

export const addClaim = (row: { name: string; spot_id: string; wearing: string | null }) => insert("claims", row);

export async function addGuess(row: { name: string; finish_s: number }, start: Date) {
  // Demo mode mimics the RLS lock so the UI behaves the same.
  if (DEMO && nowMs() >= start.getTime()) throw new Error("new row violates row-level security policy");
  return insert("guesses", row);
}

/** Seen-at may be up to 30 min before posting, never in the future (the database enforces the same). */
export const SEEN_MAX_AGO_MIN = 30;

export async function addSighting(row: { name: string; mile: number; seen_at: Date }, photo: Blob | null) {
  const c = sb();
  let photo_path: string | null = null;
  if (photo) {
    if (c) {
      photo_path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.jpg`;
      const { error } = await c.storage.from("sightings").upload(photo_path, photo, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (error) throw error;
    } else {
      photo_path = await blobToDataUrl(photo);
    }
  }
  const now = nowMs();
  const seen = Math.max(Math.min(row.seen_at.getTime(), now), now - SEEN_MAX_AGO_MIN * 60_000);
  return insert("sightings", { ...row, seen_at: new Date(seen).toISOString(), photo_path });
}

export function photoUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("data:")) return path;
  const c = sb();
  return c ? c.storage.from("sightings").getPublicUrl(path).data.publicUrl : null;
}

function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}

/** Resize to ~maxPx on the long edge and re-encode as JPEG before upload. */
export async function resizeImage(file: File, maxPx = DEMO ? 700 : 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(() => null);
  const src: CanvasImageSource & { width: number; height: number } =
    bmp ?? (await loadImg(file));
  const scale = Math.min(1, maxPx / Math.max(src.width, src.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(src.width * scale);
  canvas.height = Math.round(src.height * scale);
  canvas.getContext("2d")!.drawImage(src, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Couldn't read that photo."))), "image/jpeg", 0.82),
  );
}

function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Couldn't read that photo."));
    img.src = window.URL.createObjectURL(file);
  });
}
