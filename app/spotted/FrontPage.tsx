import { clock, mileLabel, seenAt, type Sighting } from "@/lib/model";
import { pronouns, type Runner } from "@/lib/runner";

// Tabloid headline for a sighting at each mile (sightings snap to the start of a spot's range).
const HEADLINES: Record<number, string> = {
  4: "{N} STORMS BAY RIDGE!",
  8: "{N} HITS DOWNTOWN BKLYN!",
  11: "{N} TEARS THRU W'BURG!",
  12: "GREENPOINT GOES WILD!",
  13: "HALFWAY HERO IN QUEENS!",
  16: "{N} SURVIVES THE BRIDGE!",
  17: "{N} ROARS UP 1ST AVE!",
  20: "{N} CONQUERS THE BRONX!",
  22: "{N} BATTLES FIFTH AVE!",
  23: "{N} CLIMBS MUSEUM MILE!",
  24: "{N} ENTERS THE PARK!",
  25: "{N} SMELLS THE FINISH!",
};

const TEASERS = [
  ["G TRAIN ON TIME", "City stunned", "P. 3"],
  ["BAGEL SHORTAGE ON 4TH AVE", "Runners blamed", "P. 5"],
  ["MAN LOSES VOICE AT MILE 8", "'Worth it,' he croaks", "P. 7"],
] as const;

const INK = "#1A1A17";
const PAPER = "#ECE5D3";

// Newsprint grain, a centre fold, and a halftone dot screen for photos.
const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;
const fold = "linear-gradient(180deg, transparent 47%, rgba(0,0,0,.07) 49.6%, rgba(255,255,255,.35) 50.4%, transparent 53%)";
const halftone = "radial-gradient(rgba(26,26,23,.55) 28%, transparent 30%) 0 0 / 4px 4px";

/** "Last seen" as the front page of a (fictional) New York tabloid. */
export default function FrontPage({ r, last, photo }: { r: Runner; last: Sighting | undefined; photo: string | null }) {
  const N = r.name.toUpperCase();
  const pr = pronouns(r);
  const mile = last ? Number(last.mile) : null;
  const headline = (mile === null ? "WHERE IS {N}?" : (HEADLINES[mile] ?? `{N} SPOTTED AT MILE ${mileLabel(mile)}!`)).replace("{N}", N);

  return (
    <article
      aria-label="Last seen"
      style={{
        position: "relative",
        background: `${fold}, ${grain}, ${PAPER}`,
        color: INK,
        padding: "10px 12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transform: "rotate(-1deg)",
        boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 10px 22px rgba(0,0,0,.22)",
        clipPath:
          "polygon(0 0.4%, 18% 0, 41% 0.5%, 63% 0.1%, 84% 0.6%, 100% 0, 99.7% 100%, 78% 99.5%, 55% 100%, 30% 99.6%, 0 100%)",
      }}
    >
      {/* Top strip: tagline and price */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, fontWeight: 800, letterSpacing: ".1em" }}>
        <span>NEW YORK&apos;S LOUDEST MARATHON GOSSIP</span>
        <span>★★ 26.2¢</span>
      </div>

      {/* Reversed masthead */}
      <div style={{ background: INK, color: PAPER, padding: "4px 8px 2px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>THE DAILY {N}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 900, letterSpacing: ".1em", textAlign: "right", lineHeight: 1.1 }}>
          <span aria-hidden="true" style={{ position: "relative", width: 10, height: 10, flex: "0 0 10px" }}>
            {last && <span className="ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--accent)" }} />}
            <span style={{ position: "absolute", inset: 1, borderRadius: "50%", background: last ? "var(--accent)" : "#8E8B80" }} />
          </span>
          LAST
          <br />
          SEEN
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 800, letterSpacing: ".08em", borderBottom: `1px solid ${INK}`, paddingBottom: 3 }}>
        <span>SUN., NOV. 1, 2026</span>
        <span>LATE CITY FINAL</span>
        <span>COLD. CHEER LOUDER.</span>
      </div>

      {/* Headline */}
      {last ? null : <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".14em", marginTop: 2 }}>COPS BAFFLED</span>}
      <h2
        style={{
          margin: "2px 0 0",
          fontSize: 54,
          fontWeight: 900,
          lineHeight: 0.84,
          letterSpacing: "-0.055em",
          textTransform: "uppercase",
          overflowWrap: "anywhere",
        }}
      >
        {headline}
      </h2>

      {/* Lead photo: the sighting, or a file photo before there is one */}
      <figure style={{ margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ position: "relative", border: `1px solid ${INK}`, background: "#CFC8B6", overflow: "hidden" }}>
          {last && photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={`${r.name} at mile ${mileLabel(Number(last.mile))}, spotted by ${last.name}`}
              style={{ display: "block", width: "100%", maxHeight: 320, objectFit: "cover", filter: "grayscale(1) contrast(1.45) brightness(1.05) sepia(.15)" }}
            />
          ) : (
            <svg viewBox="-30 -24 60 33" width="100%" height="190" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`File photo of ${r.name}`} style={{ display: "block", filter: "grayscale(1) contrast(1.2)" }}>
              <rect x="-30" y="-24" width="60" height="33" fill="#BDB6A3" />
              <path d="M-11 20 Q-11 -6 0 -6.5 Q11 -6 11 20 Z" fill="#5A5850" />
              <path d="M-9.5 -6.5 Q-11 -12 -10 -16 A10 10 0 0 1 10 -16 Q11 -12 9.5 -6.5 Q7.6 -5.2 6.2 -7.2 L-6.2 -7.2 Q-7.6 -5.2 -9.5 -6.5 Z" fill="#E4DDC9" />
              <circle cx="0" cy="-12.6" r="6.4" fill="#C9C2AE" />
              <path d="M-7.3 -13 Q-6.2 -20.6 0 -20.8 Q6.6 -20.6 7.4 -13.8 Q3 -17.6 -1.2 -16 Q-4.2 -14.8 -7.3 -13 Z" fill="#E4DDC9" />
            </svg>
          )}
          <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: halftone, mixBlendMode: "multiply", opacity: 0.35 }} />
          {last && (
            <span style={{ position: "absolute", left: 6, top: 6, background: INK, color: PAPER, fontSize: 10, fontWeight: 900, letterSpacing: ".12em", padding: "2px 6px" }}>
              EXCLUSIVE
            </span>
          )}
        </div>
        <figcaption style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".08em", overflowWrap: "anywhere" }}>
          {last ? `PHOTO: ${last.name.toUpperCase()} FOR THE DAILY ${N}` : "FILE PHOTO · SUBJECT LAST SEEN RUNNING"}
        </figcaption>
      </figure>

      {/* Story in two columns, then teasers */}
      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, lineHeight: 1.28, columnCount: 2, columnGap: 12, columnRule: `1px solid ${INK}` }}>
        {last ? (
          <>
            <strong style={{ fontWeight: 900 }}>NEW YORK —</strong> {r.name} was seen at mile {mileLabel(Number(last.mile))} at{" "}
            {clock(seenAt(last), true)}, witnesses say. &ldquo;{pr.Subj} looked strong,&rdquo; reported {last.name}, who was there. {pr.Poss} map icon
            has been snapped to the scene. Friends further up the course are urged to get loud.
          </>
        ) : (
          <>
            <strong style={{ fontWeight: 900 }}>NEW YORK —</strong> Authorities have no confirmed sightings of the runner known as {r.name}.
            Anyone who sees {pr.obj} is asked to snap a photo below. Tips make the front page. Do not approach; {pr.subj} will not stop.
          </>
        )}
      </p>
      <div style={{ borderTop: `3px double ${INK}`, paddingTop: 5, display: "flex", flexDirection: "column", gap: 3 }}>
        {TEASERS.map(([head, deck, page]) => (
          <div key={head} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11, lineHeight: 1.2 }}>
            <span>
              <strong style={{ fontWeight: 900 }}>{head}</strong> <span style={{ fontWeight: 600 }}>{deck}</span>
            </span>
            <span style={{ fontWeight: 900, flex: "0 0 auto" }}>{page}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
