"use client";

import { useEffect, useState, type FormEvent } from "react";
import Honeypot, { isBot } from "@/components/Honeypot";
import { nowMs, useNow } from "@/lib/clock";
import { useRunner } from "@/components/RunnerProvider";
import { easternTime, pronouns, startDate } from "@/lib/runner";
import { addGuess, listGuesses, type Guess } from "@/lib/db";
import { formatHms, parseHms } from "@/lib/model";

const DOT_COLORS = ["var(--sky)", "var(--sun)", "var(--leaf)", "var(--pink)"];

/** Phone number pads have no colon, so take digits and add the colons: "34107" -> "3:41:07". */
function formatTime(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 5);
  if (d.length <= 1) return d;
  if (d.length <= 3) return `${d[0]}:${d.slice(1)}`;
  return `${d[0]}:${d.slice(1, 3)}:${d.slice(3)}`;
}

export default function Pool() {
  const r = useRunner();
  const pr = pronouns(r);
  const start = startDate(r);
  const startClock = easternTime(start);
  const finishS = r.finish_time ? parseHms(r.finish_time) : null;
  // Board range from the runner settings, e.g. 3:30 to 4:30.
  const minS = (parseHms(`${r.board_from}:00`) ?? 12600);
  const maxS = Math.max(parseHms(`${r.board_to}:00`) ?? 16200, minS + 600);
  const midLabel = formatHms((minS + maxS) / 2).slice(0, -3);
  const pct = (s: number) => `${(((Math.min(Math.max(s, minS), maxS) - minS) / (maxS - minS)) * 100).toFixed(1)}%`;
  const now = useNow(1000);
  const locked = now ? now.getTime() >= start.getTime() : false;
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; readout?: string } | null>(null);
  const [swiped, setSwiped] = useState(false);
  const [time, setTime] = useState("");

  const load = () => listGuesses().then(setGuesses).catch(() => setMsg({ ok: false, text: "Couldn't load the board. Refresh to try again." }));
  useEffect(() => {
    load();
  }, []);

  const sorted = [...guesses].sort((a, b) => a.finish_s - b.finish_s);
  let glory: Guess | null = null;
  let shame: Guess | null = null;
  if (finishS !== null && guesses.length) {
    const byErr = [...guesses].sort((a, b) => Math.abs(a.finish_s - finishS) - Math.abs(b.finish_s - finishS));
    glory = byErr[0];
    shame = byErr[byErr.length - 1];
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const finish_s = parseHms(String(fd.get("time") ?? ""));
    if (!name) return setMsg({ ok: false, readout: "CARD UNREADABLE", text: "Name, please. Glory needs a name." });
    if (finish_s === null)
      return setMsg({
        ok: false,
        readout: "INSUFFICIENT FARE",
        text: time.replace(/\D/g, "").length < 5 ? "Type 5 numbers, like 34107 for 3:41:07." : "Minutes and seconds only go up to 59.",
      });
    if (finish_s < 9000 || finish_s > 21600) return setMsg({ ok: false, readout: "INSUFFICIENT FARE", text: "Keep it between 2:30:00 and 6:00:00. Be realistic, or at least plausible." });
    if (isBot(form)) {
      form.reset();
      setTime("");
      return setMsg({ ok: true, readout: "GO", text: "Locked in." });
    }
    setBusy(true);
    setMsg(null);
    try {
      await addGuess({ name, finish_s }, start);
      form.reset();
      setTime("");
      setMsg({ ok: true, readout: "GO", text: `Locked in: ${formatHms(finish_s)}. No take-backs.` });
      setSwiped(true);
      window.setTimeout(() => setSwiped(false), 900);
      await load();
    } catch {
      const late = nowMs() >= start.getTime();
      setMsg({
        ok: false,
        readout: late ? "JUST USED" : "SWIPE AGAIN AT THIS TURNSTILE",
        text: late ? `Too late: guesses locked at ${startClock}. Nice try.` : "That didn't save. Try again in a sec.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="section" style={{ paddingTop: 24 }}>
        <h2>The board</h2>
        <div style={{ position: "relative", height: 92, margin: "0 18px" }} role="img" aria-label={`${guesses.length} guesses between ${r.board_from} and ${r.board_to} shown on a timeline.`}>
          <div style={{ position: "absolute", left: -18, right: -18, top: 54, height: 6, background: "var(--ink)", borderRadius: 3 }} />
          {finishS !== null && (
            <div style={{ position: "absolute", left: pct(finishS), top: 40, width: 4, height: 34, marginLeft: -2, background: "var(--accent)", borderRadius: 2 }} title={`${r.name}: ${formatHms(finishS)}`} />
          )}
          {sorted.map((g, i) => {
            const high = i % 2 === 0;
            return (
              <div
                key={g.id}
                style={{ position: "absolute", left: pct(g.finish_s), top: high ? 0 : 20, display: "flex", flexDirection: "column", alignItems: "center", transform: "translateX(-50%)", zIndex: high ? 1 : 2 }}
              >
                <span
                  style={{ fontSize: 12, fontWeight: 800, background: "#fff", border: "2px solid var(--ink)", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {g.name.split(" ")[0]} {formatHms(g.finish_s).slice(0, 4)}
                </span>
                <span style={{ width: 2, height: high ? 28 : 8, background: "var(--ink)" }} />
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: DOT_COLORS[i % DOT_COLORS.length], border: "2px solid var(--ink)" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800 }}>
          <span>{r.board_from}</span>
          <span>{midLabel}</span>
          <span>{r.board_to}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 8 }}>
          <div style={{ background: "var(--sun)", border: "2px solid var(--ink)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em" }}>HALL OF GLORY</span>
            <span style={{ fontSize: 17, fontWeight: 900, overflowWrap: "anywhere" }}>{glory ? `${glory.name} · ${formatHms(glory.finish_s)}` : "TBD"}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Bragging rights, forever</span>
          </div>
          <div style={{ background: "var(--ink)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em", color: "var(--accent)" }}>WALL OF SHAME</span>
            <span style={{ fontSize: 17, fontWeight: 900, overflowWrap: "anywhere" }}>{shame ? `${shame.name} · ${formatHms(shame.finish_s)}` : "TBD"}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Clearly doubted {pr.obj}</span>
          </div>
        </div>
        {finishS !== null && (
          <p className="msg" style={{ fontSize: 15 }}>
            {r.name} finished in {formatHms(finishS)}.
          </p>
        )}
        {guesses.length > 0 && (
          <details style={{ fontSize: 14, fontWeight: 600 }}>
            <summary style={{ cursor: "pointer", fontWeight: 800, minHeight: 44, display: "flex", alignItems: "center" }}>All {guesses.length} guesses</summary>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {sorted.map((g) => (
                <li key={g.id} className="row">
                  <span style={{ fontWeight: 800, overflowWrap: "anywhere" }}>{g.name}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatHms(g.finish_s)}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section style={{ padding: "24px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{locked ? "Guesses are locked" : "Place your guess"}</h2>
        <Readout text={locked ? "JUST USED" : (msg?.readout ?? "SWIPE CARD")} ok={locked ? false : (msg?.ok ?? true)} />
        <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className={swiped ? "card-swipe" : undefined} style={{ ...metroCard, opacity: locked ? 0.65 : 1 }}>
            <span aria-hidden="true" style={sheen} />
            <div aria-hidden="true" style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 27, fontWeight: 900, color: CARD_BLUE, letterSpacing: "-0.03em", transform: "skewX(-10deg)", lineHeight: 1 }}>
                {r.name}Card
              </span>
              <span style={{ fontSize: 8, fontWeight: 700, color: CARD_BLUE, textAlign: "right", lineHeight: 1.25, letterSpacing: ".04em" }}>
                INSERT THIS WAY ➜
                <br />
                THIS SIDE FACING YOU
              </span>
            </div>
            {locked ? (
              <p style={{ position: "relative", margin: "6px 0 26px", fontSize: 15, fontWeight: 700, color: CARD_BLUE }}>
                The gun went at {startClock}. No insider trading. Watch the board.
              </p>
            ) : (
              <>
                <label className="field" style={{ position: "relative", color: CARD_BLUE }}>
                  Your name
                  <input className="input" style={cardInput} name="name" type="text" maxLength={40} required placeholder="Future legend" autoComplete="given-name" />
                </label>
                <label className="field" style={{ position: "relative", color: CARD_BLUE }}>
                  {pr.Poss} finish time (h:mm:ss)
                  <input
                    className="input"
                    style={cardInput}
                    name="time"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    placeholder="3:41:07"
                    value={time}
                    onChange={(e) => setTime(formatTime(e.target.value))}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Just type the numbers. 34107 becomes 3:41:07.</span>
                </label>
                <Honeypot />
              </>
            )}
            <div aria-hidden="true" style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 2 }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: CARD_BLUE, lineHeight: 1.3, maxWidth: "70%" }}>
                Valid for one (1) guess. No take-backs. Not valid for insider trading. Subject to {r.name}&apos;s tariff.
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: CARD_BLUE, letterSpacing: ".1em", fontVariantNumeric: "tabular-nums" }}>0026 2000 0042</span>
            </div>
          </div>
          {!locked && (
            <button type="submit" className="btn" disabled={busy} style={swipeBtn}>
              {busy ? "Reading card…" : "Swipe to lock it in"}
            </button>
          )}
        </form>
        {msg && !locked && (
          <p role="status" className={`msg ${msg.ok ? "" : "msg-err"}`}>
            {msg.text}
          </p>
        )}
      </section>
    </>
  );
}

const CARD_BLUE = "#0F3D8C";

// A real MetroCard: gold plastic with a soft gradient, rounded corners, a glossy sheen and a soft shadow.
const metroCard = {
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: "14px 16px 12px",
  background: "linear-gradient(135deg, #FFD84D 0%, #F9C624 42%, #EDB414 100%)",
  borderRadius: 14,
  boxShadow: "0 1px 1px rgba(0,0,0,.18), 0 3px 6px rgba(0,0,0,.12), 0 14px 26px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(0,0,0,.12)",
} as const;

const sheen = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "linear-gradient(115deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.12) 22%, transparent 34%, transparent 70%, rgba(255,255,255,.12) 85%, transparent 100%)",
} as const;

const cardInput = {
  background: "rgba(255,255,255,.88)",
  border: "1px solid rgba(15,61,140,.45)",
  borderRadius: 7,
  boxShadow: "inset 0 1px 2px rgba(0,0,0,.12)",
} as const;

const swipeBtn = {
  background: "linear-gradient(180deg, #2A2E31, #16191B)",
  color: "#FFFFFF",
  border: "1px solid #0B0D0E",
  boxShadow: "0 1px 0 rgba(255,255,255,.15) inset, 0 4px 10px rgba(0,0,0,.2)",
} as const;

/** The turnstile reader: brushed-steel housing around a small green-on-black display. */
function Readout({ text, ok }: { text: string; ok: boolean }) {
  const glow = ok ? "#86F5A2" : "#FFC266";
  return (
    <div
      style={{
        padding: 8,
        borderRadius: 12,
        background: "linear-gradient(180deg, #E3E6E8 0%, #B9BEC2 48%, #CDD1D4 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 2px 6px rgba(0,0,0,.18)",
      }}
    >
      <div
        aria-live="polite"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 5,
          padding: "10px 12px",
          background: "radial-gradient(ellipse at 50% 40%, #1E2A22 0%, #0C110E 100%)",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,.8)",
          color: glow,
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: ".14em",
          textAlign: "center",
          textShadow: `0 0 6px ${glow}99`,
        }}
      >
        {text}
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(255,255,255,.1), transparent 45%)" }} />
      </div>
    </div>
  );
}
