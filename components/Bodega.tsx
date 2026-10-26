
const STRIPE = 26; // awning stripe width, in SVG units

/** The donate card as a corner bodega: striped awning, sign board, neon OPEN and a Greek coffee cup. */
export default function Bodega({ name, cause, donateUrl }: { name: string; cause: string | null; donateUrl: string }) {
  const headline = cause ? `Donate to ${cause}` : `Donate to ${name}'s fundraiser`;
  const stripes = Array.from({ length: 16 }, (_, i) => i);
  return (
    <a
      href={donateUrl}
      target="_blank"
      rel="noopener"
      aria-label={headline}
      style={{ display: "block", textDecoration: "none", color: "var(--ink)", filter: "drop-shadow(0 10px 14px rgba(0,0,0,.2))" }}
    >
      {/* Awning: orange and white stripes with a scalloped edge */}
      <svg viewBox="0 0 390 62" width="100%" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
        <defs>
          <clipPath id="scallop">
            <path
              d={
                "M0 0 H390 V44 " +
                stripes
                  .map((i) => {
                    const x = 390 - i * STRIPE;
                    return `Q${x - STRIPE / 2} 62 ${x - STRIPE} 44`;
                  })
                  .join(" ") +
                " Z"
              }
            />
          </clipPath>
        </defs>
        <g clipPath="url(#scallop)">
          {stripes.map((i) => (
            <rect key={i} x={i * STRIPE} y={0} width={STRIPE} height={62} fill={i % 2 ? "#FFFFFF" : "#F26B2A"} />
          ))}
          <rect x={0} y={0} width={390} height={10} fill="rgba(0,0,0,.18)" />
        </g>
      </svg>

      {/* Sign board */}
      <div style={{ background: "var(--ink)", color: "#FFF", textAlign: "center", padding: "8px 10px 7px", margin: "-2px 6px 0" }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: ".06em", lineHeight: 1 }}>{name.toUpperCase()}&apos;S DELI &amp; DONATIONS</div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".18em", color: "#FFD84A", marginTop: 3 }}>
          COLD DRINKS · HOT TAKES · OPEN 24/7
        </div>
      </div>

      {/* Shop window */}
      <div
        style={{
          margin: "0 6px",
          padding: "18px 16px 20px",
          background: "linear-gradient(160deg, #FFF8EA 0%, #F6EBD3 100%)",
          border: "6px solid #2B2E2C",
          borderTop: 0,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              alignSelf: "flex-start",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: ".12em",
              color: "#FF7A3D",
              border: "2px solid #FF7A3D",
              borderRadius: 8,
              padding: "2px 8px",
              textShadow: "0 0 6px rgba(255,122,61,.8)",
              boxShadow: "0 0 10px rgba(255,122,61,.55), inset 0 0 6px rgba(255,122,61,.4)",
            }}
          >
            OPEN
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em" }}>THE ACTUAL POINT</span>
          <span style={{ fontSize: 25, fontWeight: 900, lineHeight: 1.05 }}>{headline}</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{name} runs 26.2 miles. You click one button. Fair trade.</span>
          <span
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              background: "var(--accent)",
              border: "2px solid var(--ink)",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            Step inside →
          </span>
        </div>
        <CoffeeCup />
      </div>
    </a>
  );
}

/** The blue-and-white Greek diner cup, re-lettered. */
function CoffeeCup() {
  return (
    <svg viewBox="0 0 60 84" width="64" height="90" aria-hidden="true" style={{ flex: "0 0 64px", marginTop: 4, transform: "rotate(6deg)" }}>
      <path d="M6 10 H54 L48 80 Q30 84 12 80 Z" fill="#FFFFFF" stroke="#1F4FA0" strokeWidth="2" />
      <rect x="4" y="5" width="52" height="7" rx="2" fill="#E9E9E9" stroke="#1F4FA0" strokeWidth="1.5" />
      {/* Meander band */}
      <path d="M8 18 H52 M8 26 H52" stroke="#1F4FA0" strokeWidth="2" />
      <path d="M9 24 V20 H13 V24 H17 V20 H21 V24 H25 V20 H29 V24 H33 V20 H37 V24 H41 V20 H45 V24 H49 V20" fill="none" stroke="#1F4FA0" strokeWidth="1.3" />
      <path d="M12 64 H48 M12 72 H47" stroke="#1F4FA0" strokeWidth="2" />
      <text x="30" y="38" textAnchor="middle" fontSize="6.4" fontWeight="900" fill="#1F4FA0" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
        WE ARE
      </text>
      <text x="30" y="46" textAnchor="middle" fontSize="6.4" fontWeight="900" fill="#1F4FA0" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
        HAPPY TO
      </text>
      <text x="30" y="54" textAnchor="middle" fontSize="6.4" fontWeight="900" fill="#1F4FA0" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
        CHEER YOU
      </text>
    </svg>
  );
}
