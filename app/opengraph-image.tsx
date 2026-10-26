import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { easternTime, raceDay, startDate, startTag } from "@/lib/runner";
import { getSiteData } from "@/lib/siteData";

// Link preview card (iMessage, WhatsApp, Slack…): the flyer taped to the teal wall.
export const alt = "A flyer-style guide to cheering on a runner at the NYC Marathon: where to stand and when.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#16201A";
const tape = { position: "absolute", width: 120, height: 38, background: "rgba(236,232,220,.85)" } as const;

export default async function Image() {
  const { runner: r } = await getSiteData();
  const start = startDate(r);
  const tag = startTag(r);
  const [semi, black] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Outfit-600.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Outfit-900.ttf")),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#EFE8D8", fontFamily: "Outfit", color: INK }}>
        {/* The flyer */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 62,
            width: 660,
            height: 506,
            display: "flex",
            flexDirection: "column",
            background: "#F2B33D",
            transform: "rotate(-2deg)",
            boxShadow: "0 18px 30px rgba(0,0,0,.3)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "46px 30px 0", flexGrow: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 4 }}>{`${raceDay(start)} · ${easternTime(start).toUpperCase()}`}</div>
            {tag ? (
              <div style={{ marginTop: 10, fontSize: 20, fontWeight: 900, letterSpacing: 3, background: INK, color: "#FFFFFF", borderRadius: 999, padding: "5px 16px" }}>
                {tag}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10, fontSize: 106, fontWeight: 900, lineHeight: 0.9, letterSpacing: -3 }}>
              <span>YELL AT</span>
              <span>{`${r.name.toUpperCase()} DAY`}</span>
            </div>
            <div style={{ marginTop: 18, fontSize: 34, fontWeight: 600 }}>(A guide to how to watch.)</div>
          </div>
          {/* Tear-off tabs */}
          <div style={{ display: "flex", height: 92, borderTop: `3px dashed ${INK}` }}>
            {["WHERE", "STAND", "CLAIM", "SPOT", "GUESS", "SIGN", "GIVE"].map((t, i) => (
              <div
                key={t}
                style={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: i < 6 ? `3px dashed ${INK}` : "none",
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: 1,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...tape, left: 40, top: 46, transform: "rotate(-28deg)" }} />
        <div style={{ ...tape, left: 664, top: 34, transform: "rotate(22deg)" }} />

        {/* Sticker */}
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 40,
            width: 190,
            height: 190,
            borderRadius: 95,
            background: "#FFD84A",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 25,
            fontWeight: 900,
            lineHeight: 1.05,
            transform: "rotate(12deg)",
            boxShadow: "0 8px 16px rgba(0,0,0,.2)",
          }}
        >
          <span>26.2 MILES</span>
          <span>5 BOROUGHS</span>
          <span>0 CHILL</span>
        </div>

        {/* The runner, with a bob in their hair colour, in the orange cloud. Same look as the map icon, redrawn with
            thinner outlines so it holds up at this size. */}
        <svg width="250" height="260" viewBox="-24 -30 48 50" style={{ position: "absolute", left: 818, top: 222 }}>
          <ellipse cx="0" cy="-3" rx="23" ry="21" fill="#F7A06F" />
          <path d="M-11 16 Q-11 -6 0 -6.5 Q11 -6 11 16 Z" fill="#F26B2A" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
          <path
            d="M-9.5 -6.5 Q-11 -12 -10 -16 A10 10 0 0 1 10 -16 Q11 -12 9.5 -6.5 Q7.6 -5.2 6.2 -7.2 L-6.2 -7.2 Q-7.6 -5.2 -9.5 -6.5 Z"
            fill={r.hair_color}
            stroke={INK}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-12.6" r="6.4" fill={r.skin_color} />
          <path
            d="M-7.3 -13 Q-6.2 -20.6 0 -20.8 Q6.6 -20.6 7.4 -13.8 Q3 -17.6 -1.2 -16 Q-4.2 -14.8 -7.3 -13 Z"
            fill={r.hair_color}
          />
          <circle cx="-2.3" cy="-11.6" r="0.75" fill={INK} />
          <circle cx="2.3" cy="-11.6" r="0.75" fill={INK} />
          <path d="M-2.2 -9.2 Q0 -7.6 2.2 -9.2" fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
        </svg>

        <div style={{ position: "absolute", right: 56, bottom: 42, display: "flex", flexDirection: "column", alignItems: "flex-end", color: INK }}>
          <span style={{ fontSize: 30, fontWeight: 900 }}>Where to stand, when.</span>
          <span style={{ fontSize: 22, fontWeight: 600, marginTop: 4, whiteSpace: "nowrap" }}>{r.cause ? `Running for ${r.cause}` : "26.2 miles of yelling"}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Outfit", data: semi, weight: 600, style: "normal" },
        { name: "Outfit", data: black, weight: 900, style: "normal" },
      ],
    },
  );
}
