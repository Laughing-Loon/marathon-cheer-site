"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Honeypot, { isBot } from "@/components/Honeypot";
import FrontPage from "./FrontPage";
import { useRunner } from "@/components/RunnerProvider";
import { pronouns } from "@/lib/runner";
import { nowMs } from "@/lib/clock";
import { SEEN_MAX_AGO_MIN, addSighting, listSightings, photoUrl, resizeImage } from "@/lib/db";
import { photoTakenAt } from "@/lib/exif";
import { clock, mileLabel, seenAt, type Sighting } from "@/lib/model";
import { SPOTS } from "@/lib/spots";

const FEED_COLORS = ["var(--pink)", "var(--sky)", "var(--leaf)", "var(--sun)"];
// A sighting snaps the runner to the start of that spot's range: the safe side for friends further up.
const spotMile = (covers: [number, number]) => covers[0];
// "When did they go past you?" choices, in minutes ago. "photo" uses the photo's capture time.
const AGO = [0, 2, 5, 10, 15] as const;
type When = number | "photo";

export default function Spotted() {
  const r = useRunner();
  const pr = pronouns(r);
  const [posts, setPosts] = useState<Sighting[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [when, setWhen] = useState<When>(0);
  const [photoTime, setPhotoTime] = useState<Date | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => listSightings().then(setPosts).catch(() => setMsg({ ok: false, text: "Couldn't load the feed. Refresh to try again." }));
  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setMsg(null);
    setPhotoTime(null);
    if (when === "photo") setWhen(0);
    if (!f) return setPreview(null);
    if (!f.type.startsWith("image/")) {
      e.target.value = "";
      return setMsg({ ok: false, text: `That's not a photo. ${r.name} is a person, not a PDF.` });
    }
    setPreview(URL.createObjectURL(f));
    // Trust the photo's own clock if it says it was taken in the last half hour.
    const taken = await photoTakenAt(f);
    const now = nowMs();
    if (taken && +taken <= now + 60_000 && +taken >= now - SEEN_MAX_AGO_MIN * 60_000) {
      setPhotoTime(taken);
      setWhen("photo");
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const spot = SPOTS.find((s) => s.id === fd.get("spot"));
    const file = fileRef.current?.files?.[0] ?? null;
    if (!name) return setMsg({ ok: false, text: "Add your name so we know who to thank." });
    if (!spot) return setMsg({ ok: false, text: `Pick where you saw ${pr.obj}.` });
    if (isBot(form)) {
      form.reset();
      setPreview(null);
      return setMsg({ ok: true, text: "Posted." });
    }
    setBusy(true);
    setMsg(null);
    try {
      const photo = file ? await resizeImage(file) : null;
      if (photo && photo.size > 5 * 1024 * 1024) throw new Error("too big");
      const seen_at = when === "photo" && photoTime ? photoTime : new Date(nowMs() - (when === "photo" ? 0 : when) * 60_000);
      await addSighting({ name, mile: spotMile(spot.covers), seen_at }, photo);
      form.reset();
      setPreview(null);
      setPhotoTime(null);
      setWhen(0);
      setMsg({ ok: true, text: `Posted. ${pr.Poss} icon just snapped to you.` });
      await load();
    } catch {
      setMsg({ ok: false, text: "That didn't post. Cell signal on race day is rough; try again in a sec." });
    } finally {
      setBusy(false);
    }
  }

  const last = [...posts].sort((a, b) => +seenAt(b) - +seenAt(a))[0];

  return (
    <>
      <section style={{ padding: "20px 16px 8px" }}>
        <FrontPage r={r} last={last} photo={last ? photoUrl(last.photo_path) : null} />
      </section>

      <section style={{ padding: "16px 16px 8px" }}>
        <form className="card" onSubmit={submit} noValidate>
          <label
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minHeight: 120,
              background: "var(--cream)",
              border: "2px dashed var(--ink)",
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 900,
              cursor: "pointer",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={`Your photo of ${r.name}`} style={{ display: "block", width: "100%", maxHeight: 260, objectFit: "cover" }} />
            ) : (
              <>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16201A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
                Snap {r.name}
                <span style={{ fontSize: 13, fontWeight: 600 }}>Tap to take or pick a photo</span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              name="photo"
              accept="image/*"
              capture="environment"
              onChange={pick}
              style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
            />
          </label>
          <label className="field">
            Which mile?
            <select className="input" name="spot" defaultValue="first-90s">
              {SPOTS.map((s) => (
                <option key={s.id} value={s.id}>
                  Mile {s.mile} · {s.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <legend style={{ fontSize: 14, fontWeight: 800, padding: 0, marginBottom: 6 }}>When did {pr.subj} go past you?</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {photoTime && (
                <Chip on={when === "photo"} onClick={() => setWhen("photo")}>
                  {clock(photoTime)} (photo)
                </Chip>
              )}
              {AGO.map((m) => (
                <Chip key={m} on={when === m} onClick={() => setWhen(m)}>
                  {m === 0 ? "Just now" : `${m} min ago`}
                </Chip>
              ))}
            </div>
            <span className="note">
              {photoTime && when === "photo"
                ? "Using when your photo was taken. Change it if that's off."
                : `Be honest. Posting late is fine; saying "just now" when it wasn't sends ${pr.poss} friends to the wrong mile.`}
            </span>
          </fieldset>
          <label className="field">
            Your name
            <input className="input" name="name" type="text" maxLength={40} required placeholder="Eagle-eyed friend" autoComplete="given-name" />
          </label>
          <Honeypot />
          <button type="submit" className="btn btn-accent" disabled={busy}>
            {busy ? "Posting…" : "Post it"}
          </button>
          {msg && (
            <p role="status" className={`msg ${msg.ok ? "" : "msg-err"}`}>
              {msg.text}
            </p>
          )}
          <p className="note">Keep it about {r.name}; strangers didn&apos;t sign up for this. {r.name} can delete anything.</p>
        </form>
      </section>

      <section style={{ padding: "20px 16px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, borderBottom: "3px solid var(--ink)", paddingBottom: 4 }}>More sightings, page 2</h2>
        {posts.length === 0 && <p className="note" style={{ fontSize: 14 }}>No sightings yet. {pr.Subj}&apos;{pr.plural ? "re" : "s"} out there somewhere.</p>}
        {posts.map((p, i) => {
          const url = photoUrl(p.photo_path);
          return (
            <article key={p.id} style={{ background: "#F7F4EC", border: "1.5px solid var(--ink)", padding: 8 }}>
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${r.name} at mile ${mileLabel(Number(p.mile))}, spotted by ${p.name}`} loading="lazy" style={{ display: "block", width: "100%", height: "auto", maxHeight: 420, objectFit: "cover" }} />
              ) : (
                <div style={{ height: 90, background: FEED_COLORS[i % FEED_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                  No photo. Just vibes.
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingTop: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", minWidth: 0, overflowWrap: "anywhere" }}>PHOTO: {p.name.toUpperCase()}</span>
                <span style={{ flex: "0 0 auto", fontSize: 13, fontWeight: 800, background: "var(--ink)", color: "#fff", borderRadius: 999, padding: "4px 10px" }}>
                  Mile {mileLabel(Number(p.mile))} · {clock(seenAt(p))}
                </span>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={{
        minHeight: 44,
        padding: "0 14px",
        border: "2px solid var(--ink)",
        borderRadius: 999,
        background: on ? "var(--ink)" : "var(--white)",
        color: on ? "var(--white)" : "var(--ink)",
        font: "inherit",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
