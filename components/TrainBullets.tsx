// Subway route bullets in MTA line colors. Anything that isn't a single route letter or
// number (commas, "to 3rd Ave–138th") is dropped.
const LINE_COLORS: Record<string, string> = {
  "1": "#EE352E", "2": "#EE352E", "3": "#EE352E",
  "4": "#00933C", "5": "#00933C", "6": "#00933C",
  "7": "#B933AD",
  A: "#0039A6", C: "#0039A6", E: "#0039A6",
  B: "#FF6319", D: "#FF6319", F: "#FF6319", M: "#FF6319",
  G: "#6CBE45",
  J: "#996633", Z: "#996633",
  L: "#A7A9AC",
  N: "#FCCC0A", Q: "#FCCC0A", R: "#FCCC0A", W: "#FCCC0A",
  S: "#808183",
};
const DARK_TEXT = new Set(["N", "Q", "R", "W"]);

export default function TrainBullets({ trains, size = 22 }: { trains: string; size?: number }) {
  const routes = trains.split(/[\s,]+/).filter((t) => LINE_COLORS[t]);
  return (
    <span aria-label={`Trains: ${routes.join(", ")}`} style={{ display: "inline-flex", flexWrap: "wrap", gap: 3 }}>
      {routes.map((r) => (
        <span
          key={r}
          aria-hidden="true"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: LINE_COLORS[r],
            color: DARK_TEXT.has(r) ? "#16201A" : "#FFFFFF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.6,
            fontWeight: 900,
            lineHeight: 1,
            flex: "0 0 auto",
          }}
        >
          {r}
        </span>
      ))}
    </span>
  );
}
