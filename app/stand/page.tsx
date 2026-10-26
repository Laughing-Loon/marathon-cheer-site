import type { Metadata } from "next";
import SubHeader from "@/components/SubHeader";
import TrainBullets from "@/components/TrainBullets";
import { SPOTS } from "@/lib/spots";
import { clock, etaWindow } from "@/lib/model";
import { easternTime, startDate } from "@/lib/runner";
import { getSiteData } from "@/lib/siteData";

export const metadata: Metadata = { title: "Where to stand" };

const pace = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export default async function Stand() {
  const { runner: r } = await getSiteData();
  return (
    <main className="page">
      <SubHeader bg="var(--sky)" title={<>Where should<br />I stand?</>}>
        Get there early! Tracking is not perfect and {r.name} can&apos;t wait!!
      </SubHeader>
      <ul style={{ listStyle: "none", margin: 0, padding: "8px 16px 24px", display: "flex", flexDirection: "column" }}>
        {SPOTS.map((s) => {
          const [early, late] = etaWindow(r, s.eta[0], s.eta[1]);
          return (
            <li key={s.id} style={{ padding: "14px 0", borderBottom: "1.5px solid var(--rule)", display: "flex", flexDirection: "column", gap: 8 }}>
              {/* NYC street-sign blade */}
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "100%",
                  background: "#006B3F",
                  color: "#FFFFFF",
                  borderRadius: 5,
                  padding: 2,
                  boxShadow: "0 2px 0 rgba(0,0,0,.25)",
                }}
              >
                <div
                  style={{
                    border: "1.5px solid #FFFFFF",
                    borderRadius: 3,
                    padding: "4px 10px",
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    lineHeight: 1.15,
                  }}
                >
                  {s.name}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  aria-label={`Mile ${s.mile}`}
                  style={{
                    flex: "0 0 auto",
                    minWidth: 48,
                    padding: "5px 6px",
                    borderRadius: 6,
                    background: s.color,
                    border: "2px solid var(--ink)",
                    textAlign: "center",
                    lineHeight: 1,
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".1em" }}>MILE</div>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>{s.mile}</div>
                </div>
                <div style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <TrainBullets trains={s.train} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{s.joke}</span>
                </div>
                <div
                  style={{
                    flex: "0 0 auto",
                    fontSize: 16,
                    fontWeight: 900,
                    textAlign: "right",
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {clock(early, true)}
                  <br />–{clock(late, true)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="note" style={{ padding: "0 16px 32px", fontSize: 13 }}>
        Times count from the {easternTime(startDate(r))} {r.wave ? `Wave ${r.wave} ` : ""}gun at {pace(r.pace_fast_s)}–{pace(r.pace_slow_s)}{" "}
        per mile.{" "}
        {r.corral
          ? `Corral ${r.corral} crosses the start line a few minutes after the gun, so expect ${r.name} a little after these times, never before. `
          : ""}
        Clocks fall back at 2 a.m. race morning; your 9:20 is the new 9:20. Bronx train tip comes from a guide for the old route, so
        double-check it.
      </p>
    </main>
  );
}
