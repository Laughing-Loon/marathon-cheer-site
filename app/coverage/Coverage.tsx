"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Honeypot, { isBot } from "@/components/Honeypot";
import TrainBullets from "@/components/TrainBullets";
import { addClaim, listClaims, type Claim } from "@/lib/db";
import { SPOTS, SPOT_OPTIONS, type Spot } from "@/lib/spots";
import { pronouns } from "@/lib/runner";
import { useRunner } from "@/components/RunnerProvider";

const LINE_W = 10; // width of the subway line
const RAIL_X = 22; // center of the line in the left column

export default function Coverage() {
  const r = useRunner();
  const p = pronouns(r);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [spotId, setSpotId] = useState("bronx");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const load = () => listClaims().then(setClaims).catch(() => setMsg({ ok: false, text: "Couldn't load the map. Refresh to try again." }));
  useEffect(() => {
    load();
  }, []);

  const bySpot = (id: string) => claims.filter((c) => c.spot_id === id);
  const empty = SPOTS.filter((s) => bySpot(s.id).length === 0);
  // The banner names the emptiest stop that hurts most: the Bronx, else the last empty one.
  const worst = empty.find((s) => s.id === "bronx") ?? empty[empty.length - 1];

  function claim(s: Spot) {
    setSpotId(s.id);
    setMsg(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => (formRef.current?.elements.namedItem("name") as HTMLInputElement | null)?.focus({ preventScroll: true }), 400);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const wearing = String(fd.get("wearing") ?? "").trim() || null;
    if (!name) return setMsg({ ok: false, text: `Put a name in. Any name. ${p.Subj} just ${p.plural ? "need" : "needs"} to know who to thank.` });
    if (isBot(form)) {
      form.reset();
      return setMsg({ ok: true, text: `Done. ${r.name} won't cry.` });
    }
    setBusy(true);
    setMsg(null);
    try {
      await addClaim({ name, spot_id: spotId, wearing });
      form.reset();
      setMsg({ ok: true, text: `You're on the map. ${r.name} won't cry.` });
      await load();
    } catch {
      setMsg({ ok: false, text: "That didn't save. Check your signal and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="section">
        <div style={{ background: "var(--ink)", color: "#fff", borderRadius: 10, padding: "14px 16px", fontSize: 22, fontWeight: 900, lineHeight: 1.05 }}>
          {worst ? (
            <>
              Nobody at mile {worst.mile}.
              <br />
              <span style={{ color: "var(--accent)" }}>{r.name.toUpperCase()} WILL CRY.</span>
            </>
          ) : (
            <>
              Every stop has a friend.
              <br />
              <span style={{ color: "var(--leaf)" }}>{r.name} might cry anyway.</span>
            </>
          )}
        </div>
      </section>

      {/* The runner's own subway line: a strip map with one stop per viewing spot */}
      <section className="section" aria-label={`The ${r.name} Line: viewing spots and who's at each`}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            {r.name[0].toUpperCase()}
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>The {r.name} Line</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Local · all stops · tap one to claim it</span>
          </div>
        </div>

        <ol style={{ listStyle: "none", margin: "8px 0 0", padding: 0, position: "relative" }}>
          <Terminal label="Staten Island" note="Start · bridges closed to fans" first />
          {SPOTS.map((s) => {
            const here = bySpot(s.id);
            const covered = here.length > 0;
            return (
              <li key={s.id} style={{ position: "relative", display: "flex", gap: 12, padding: "10px 0" }}>
                <Rail />
                <div style={{ flex: `0 0 ${RAIL_X * 2}px`, display: "flex", justifyContent: "center", paddingTop: 4, position: "relative" }}>
                  <span
                    className={covered ? undefined : "pulse"}
                    aria-hidden="true"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: covered ? "var(--grass)" : "#fff",
                      border: `4px solid ${covered ? "#fff" : "var(--accent)"}`,
                      boxShadow: `0 0 0 2px var(--ink)`,
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                </div>
                <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "var(--muted)" }}>MILE {s.mile}</span>
                  <span style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.1 }}>{s.name}</span>
                  <TrainBullets trains={s.train} size={18} />
                  {covered ? (
                    <ul style={{ listStyle: "none", margin: "2px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      {here.map((c) => (
                        <li key={c.id} style={{ fontSize: 14, fontWeight: 600, overflowWrap: "anywhere" }}>
                          <strong style={{ fontWeight: 800 }}>{c.name}</strong>
                          {c.wearing ? <span style={{ color: "var(--muted)" }}> · {c.wearing}</span> : null}
                        </li>
                      ))}
                      <li>
                        <button type="button" onClick={() => claim(s)} style={linkBtn}>
                          + Join them
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#B4471A" }}>Nobody yet</span>
                      <button
                        type="button"
                        onClick={() => claim(s)}
                        style={{
                          minHeight: 40,
                          padding: "0 14px",
                          border: "2px solid var(--ink)",
                          borderRadius: 999,
                          background: "#fff",
                          color: "var(--ink)",
                          font: "inherit",
                          fontSize: 14,
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Claim this stop →
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          <Terminal label="Finish" note="West Drive, Central Park" />
        </ol>
      </section>

      <section className="section">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--cream)", border: "2px solid var(--ink)", borderRadius: 10, padding: "12px 14px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16201A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "0 0 22px", marginTop: 2 }}>
            <path d="M12 3l10 18H2z" />
            <path d="M12 10v5M12 18v.5" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 900 }}>Miles 1–8 are hard mode</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
              Miles 0–2 are on the bridge: no fans allowed. Miles 3–8 on Fourth Ave are open, but the start colours run in separate lanes until they
              merge by mile 8, so stand on the {r.start_color ? r.start_color.toLowerCase() : `${r.name}'s colour`} side or {p.subj}&apos;ll be a blur behind a barrier. Easiest to start cheering from mile 8 on.
            </span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 32 }}>
        <form ref={formRef} className="card" onSubmit={submit} noValidate style={{ scrollMarginTop: 12 }}>
          <h2>Claim a stop</h2>
          <label className="field">
            Your name
            <input className="input" name="name" type="text" maxLength={40} required placeholder="e.g. The loud one" autoComplete="given-name" />
          </label>
          <label className="field">
            Where you&apos;ll be
            <select className="input" name="spot" value={spotId} onChange={(e) => setSpotId(e.target.value)}>
              {SPOT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  Mile {s.mile} · {s.name}
                  {s.id === "bronx" ? " (please)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            What you&apos;re wearing
            <input className="input" name="wearing" type="text" maxLength={60} placeholder={`So ${p.subj} can spot you from 50 feet`} />
          </label>
          <Honeypot />
          <button type="submit" className="btn btn-accent" disabled={busy}>
            {busy ? "Saving…" : `I'm there. ${r.name} won't cry.`}
          </button>
          {msg && (
            <p role="status" className={`msg ${msg.ok ? "" : "msg-err"}`}>
              {msg.text}
            </p>
          )}
        </form>
      </section>
    </>
  );
}

const linkBtn = {
  minHeight: 32,
  padding: 0,
  border: 0,
  background: "none",
  font: "inherit",
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "underline",
  color: "var(--ink)",
  cursor: "pointer",
} as const;

/** The vertical line running through every stop. */
function Rail() {
  return (
    <span
      aria-hidden="true"
      style={{ position: "absolute", left: RAIL_X - LINE_W / 2, top: 0, bottom: 0, width: LINE_W, background: "var(--ink)" }}
    />
  );
}

/** Start and finish: square terminal markers that end the line. */
function Terminal({ label, note, first }: { label: string; note: string; first?: boolean }) {
  return (
    <li style={{ position: "relative", display: "flex", gap: 12, alignItems: "center", padding: first ? "4px 0 10px" : "10px 0 4px" }}>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: RAIL_X - LINE_W / 2,
          width: LINE_W,
          background: "var(--ink)",
          ...(first ? { top: "50%", bottom: 0 } : { top: 0, bottom: "50%" }),
        }}
      />
      <div style={{ flex: `0 0 ${RAIL_X * 2}px`, display: "flex", justifyContent: "center" }}>
        <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 4, background: "var(--ink)", position: "relative", zIndex: 1 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 15, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{note}</span>
      </div>
    </li>
  );
}
