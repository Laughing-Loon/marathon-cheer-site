import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import Bodega from "@/components/Bodega";
import Countdown from "@/components/Countdown";
import DemoBanner from "@/components/DemoBanner";
import LiveMap from "@/components/LiveMap";
import PosterWall from "@/components/PosterWall";
import { easternTime, pronouns, raceDay, splitsUrl, startDate, startTag, type Runner } from "@/lib/runner";
import { getSiteData } from "@/lib/siteData";

// Base map without its outer <svg>, so the live overlay can share its coordinates.
const baseSvg = readFileSync(path.join(process.cwd(), "public/map-base.svg"), "utf8")
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/font-family="[^"]*"/g, 'style="font-family: var(--font-outfit), sans-serif"');

const FLYER_EDGE =
  "polygon(0.0% 0.36%, 3.8% 0.17%, 7.7% 0.72%, 11.5% 0.08%, 15.4% 0.59%, 19.2% 0.40%, 23.1% 0.06%, 26.9% 0.56%, 30.8% 0.04%, 34.6% 0.48%, 38.5% 0.08%, 42.3% 0.10%, 46.2% 0.47%, 50.0% 0.91%, 53.8% 0.14%, 57.7% 0.25%, 61.5% 0.69%, 65.4% 1.04%, 69.2% 0.63%, 73.1% 0.44%, 76.9% 1.07%, 80.8% 0.05%, 84.6% 0.94%, 88.5% 0.32%, 92.3% 0.16%, 96.2% 0.13%, 100.0% 0.34%, 99.74% 4.0%, 98.85% 8.0%, 99.41% 12.0%, 99.49% 16.0%, 99.12% 20.0%, 99.37% 24.0%, 98.69% 28.0%, 98.68% 32.0%, 98.89% 36.0%, 99.55% 40.0%, 99.20% 44.0%, 99.04% 48.0%, 99.42% 52.0%, 99.23% 56.0%, 99.02% 60.0%, 99.71% 64.0%, 99.58% 68.0%, 98.94% 72.0%, 99.40% 76.0%, 99.34% 80.0%, 99.83% 84.0%, 99.62% 88.0%, 99.00% 92.0%, 99.97% 96.0%, 100% 100%, 0% 100%, 0.17% 96.0%, 0.59% 92.0%, 1.06% 88.0%, 0.21% 84.0%, 0.68% 80.0%, 0.05% 76.0%, 0.94% 72.0%, 1.07% 68.0%, 0.80% 64.0%, 1.23% 60.0%, 0.44% 56.0%, 0.97% 52.0%, 0.83% 48.0%, 0.81% 44.0%, 0.64% 40.0%, 1.18% 36.0%, 1.32% 32.0%, 0.66% 28.0%, 0.93% 24.0%, 0.08% 20.0%, 0.98% 16.0%, 0.91% 12.0%, 1.39% 8.0%, 1.15% 4.0%)";

type Tab = { label: string; href: string; clip: string; external?: boolean };
const tabs = (r: Runner): Tab[] => [
  { label: `WHERE'S ${r.name.toUpperCase()}`, href: "#map", clip: "polygon(0 0,100% 0,100% 96%,72% 99%,38% 97%,0 100%)" },
  { label: "WHERE TO STAND", href: "/stand", clip: "polygon(0 0,100% 0,100% 99%,60% 96.5%,25% 99.5%,0 97%)" },
  { label: "CLAIM A MILE", href: "/coverage", clip: "polygon(0 0,100% 0,100% 97%,80% 100%,45% 96%,0 98.5%)" },
  { label: `SPOTTED ${r.name.toUpperCase()}`, href: "/spotted", clip: "polygon(0 0,100% 0,100% 100%,65% 97%,30% 99%,0 96%)" },
  { label: `GUESS ${pronouns(r).poss.toUpperCase()} TIME`, href: "/pool", clip: "polygon(0 0,100% 0,100% 96.5%,55% 99.5%,20% 97%,0 99%)" },
  { label: "MAKE A SIGN", href: "/sign", clip: "polygon(0 0,100% 0,100% 98.5%,75% 96%,35% 100%,0 97.5%)" },
  ...(r.donate_url
    ? [{ label: "DONATE", href: r.donate_url, clip: "polygon(0 0,100% 0,100% 97%,50% 99%,0 96.5%)", external: true }]
    : []),
];

const tape = {
  position: "absolute",
  width: 74,
  height: 26,
  background: "rgba(236,232,220,.82)",
  zIndex: 2,
} as const;

export default async function Home() {
  const { runner: r, pastRuns, wallUrl } = await getSiteData();
  const start = startDate(r);
  const TABS = tabs(r);
  const tag = startTag(r);
  return (
    <main className="page">
      <DemoBanner />
      <header
        style={{ position: "relative", height: 450, background: "var(--wall)", padding: "20px 16px", overflow: "hidden" }}
      >
        <PosterWall pastRuns={pastRuns} wallUrl={wallUrl} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <span style={{ color: "#fff", background: "var(--ink)", padding: "6px 10px", fontSize: 15, fontWeight: 900, letterSpacing: ".04em" }}>{r.name.toUpperCase()} RUNS NYC</span>
          {r.donate_url && (
          <a
            href={r.donate_url}
            target="_blank"
            rel="noopener"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              padding: "0 14px",
              background: "#fff",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Donate
          </a>
          )}
        </div>
        <div
          className="spin"
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 4,
            right: 104, // just left of the Donate pill, as in the mockup
            width: 104,
            height: 104,
            borderRadius: "50%",
            background: "var(--sun)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 900,
            lineHeight: 1.05,
            boxShadow: "0 6px 14px rgba(0,0,0,.18)",
            zIndex: 2,
          }}
        >
          26.2 MILES
          <br />5 BOROUGHS
          <br />0 CHILL
        </div>
      </header>

      <section style={{ position: "relative", marginTop: -190, padding: "0 22px", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "100%", transform: "rotate(-1.2deg)", filter: "drop-shadow(0 12px 14px rgba(0,0,0,.28))" }}>
          <div style={{ ...tape, left: -14, top: -10, transform: "rotate(-28deg)" }} />
          <div style={{ ...tape, right: -14, top: -8, transform: "rotate(24deg)" }} />
          <div style={{ position: "relative", background: "var(--flyer)", clipPath: FLYER_EDGE, display: "flex", flexDirection: "column" }}>
            <svg
              aria-hidden="true"
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "multiply", opacity: 0.22, zIndex: 1 }}
            >
              <filter id="paper">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} />
                <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.05  0 0 0 0.9 0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#paper)" />
            </svg>
            <div style={{ padding: "34px 18px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".14em" }}>{raceDay(start)} · {easternTime(start).toUpperCase()}</span>
              {tag && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: ".12em",
                  background: "var(--ink)",
                  color: "var(--white)",
                  borderRadius: 999,
                  padding: "3px 10px",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
              )}
              <h1 style={{ margin: 0, fontSize: 50, lineHeight: 0.9, fontWeight: 900, letterSpacing: "-0.02em" }}>
                YELL AT
                <br />
                {r.name.toUpperCase()} DAY
              </h1>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, fontStyle: "italic" }}>(A guide to how to watch.)</p>
              <Countdown />
              <span style={{ marginTop: 4, fontSize: 13, fontWeight: 600 }}>Take what you need ↓</span>
            </div>
            <nav
              aria-label="Menu"
              style={{ display: "grid", gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`, borderTop: "2px dashed var(--ink)" }}
            >
              {TABS.map((t, i) => {
                const style = {
                  height: 150,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: i < TABS.length - 1 ? "2px dashed var(--ink)" : undefined,
                  background: "var(--flyer)",
                  textDecoration: "none",
                  position: "relative",
                  zIndex: 2,
                  clipPath: t.clip,
                } as const;
                const label = (
                  <span
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      fontSize: 13,
                      fontWeight: 900,
                      letterSpacing: ".06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.label}
                  </span>
                );
                if (t.external)
                  return (
                    <a key={t.label} className="tab" href={t.href} target="_blank" rel="noopener" style={style}>
                      {label}
                    </a>
                  );
                if (t.href.startsWith("#"))
                  return (
                    <a key={t.label} className="tab" href={t.href} style={style}>
                      {label}
                    </a>
                  );
                return (
                  <Link key={t.label} className="tab" href={t.href} style={style}>
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      <section id="map" style={{ padding: "40px 16px 8px", display: "flex", flexDirection: "column", gap: 12, scrollMarginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, lineHeight: 1 }}>Where&apos;s {r.name}?</h2>
          <span className="wiggle" style={{ background: "var(--pink)", padding: "6px 10px", borderRadius: 4, fontSize: 13, fontWeight: 800 }}>
            live-ish
          </span>
        </div>
        <LiveMap baseSvg={baseSvg} />
        <a href={splitsUrl(r)} target="_blank" rel="noopener" className="btn btn-ink" style={{ alignSelf: "flex-start", minHeight: 44, fontSize: 15, fontWeight: 800 }}>
          Real splits on NYRR →
        </a>
        <p className="note" style={{ fontSize: 13 }}>
          For the truth: download the NYRR app and add {r.name}{r.bib ? <> (bib <strong>{r.bib}</strong>)</> : null} before race day. It updates at the
          timing mats, every mile from mile 3. The NYRR results page stays empty until race day.
        </p>
      </section>

      <section style={{ padding: "32px 16px 36px" }}>
        {r.donate_url && <Bodega name={r.name} cause={r.cause} donateUrl={r.donate_url} />}
      </section>
    </main>
  );
}
