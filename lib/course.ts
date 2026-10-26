import { DISTANCE } from "./config";

// Same projection as cheer-site/make-map.py, so points land on map-base.svg (360x659).
const LON0 = -74.075;
const LON1 = -73.905;
const LAT1 = 40.83;
const K = Math.cos((40.71 * Math.PI) / 180);
export const MAP_W = 360;
const SX = MAP_W / ((LON1 - LON0) * K);
export const MAP_H = 659;

// cheer-site/course.csv, (lat, lon), seq 0..55
const COURSE: [number, number][] = [
  [40.6023, -74.0605], [40.604, -74.056], [40.6066, -74.0447], [40.6097, -74.035],
  [40.6145, -74.0315], [40.617, -74.0297], [40.6268, -74.025], [40.6365, -74.02],
  [40.649, -74.01], [40.6615, -73.9965], [40.6705, -73.9888], [40.6773, -73.9832],
  [40.6837, -73.9783], [40.6868, -73.9751], [40.6885, -73.9597], [40.689, -73.9545],
  [40.6996, -73.957], [40.7065, -73.9615], [40.714, -73.961], [40.718, -73.9578],
  [40.7225, -73.952], [40.7232, -73.9508], [40.7302, -73.9542], [40.731, -73.948],
  [40.735, -73.95], [40.7385, -73.952], [40.743, -73.953], [40.7448, -73.952],
  [40.744, -73.9545], [40.749, -73.951], [40.7473, -73.942], [40.751, -73.94],
  [40.753, -73.9435], [40.757, -73.953], [40.76, -73.9595], [40.784, -73.944],
  [40.8015, -73.9318], [40.807, -73.9275], [40.807, -73.93], [40.8095, -73.9283],
  [40.8115, -73.9265], [40.8125, -73.9295], [40.81, -73.9305], [40.8134, -73.933],
  [40.813, -73.937], [40.8128, -73.9385], [40.8055, -73.9435], [40.8025, -73.9455],
  [40.7965, -73.9495], [40.784, -73.9585], [40.7843, -73.96], [40.774, -73.9675],
  [40.7655, -73.973], [40.7645, -73.9735], [40.7681, -73.9819], [40.7718, -73.9775],
];

type Pt = [number, number];

const project = (lat: number, lon: number): Pt => [(lon - LON0) * K * SX, (LAT1 - lat) * SX];

const CP: Pt[] = COURSE.map(([lat, lon]) => project(lat, lon));
const SEG = CP.slice(1).map((p, i) => Math.hypot(p[0] - CP[i][0], p[1] - CP[i][1]));
const TOTAL = SEG.reduce((a, b) => a + b, 0);

const clampMile = (m: number) => Math.min(Math.max(m, 0), DISTANCE);

/** Mile on the course -> map point, like make-map.py's at(). */
export function at(mile: number): Pt {
  const t = (clampMile(mile) / DISTANCE) * TOTAL;
  let acc = 0;
  for (let i = 0; i < SEG.length; i++) {
    if (acc + SEG[i] >= t) {
      const r = SEG[i] ? (t - acc) / SEG[i] : 0;
      return [CP[i][0] + r * (CP[i + 1][0] - CP[i][0]), CP[i][1] + r * (CP[i + 1][1] - CP[i][1])];
    }
    acc += SEG[i];
  }
  return CP[CP.length - 1];
}

/** SVG path along the course from mile a to mile b. */
export function pathBetween(a: number, b: number): string {
  const lo = clampMile(Math.min(a, b));
  const hi = clampMile(Math.max(a, b));
  const pts: Pt[] = [at(lo)];
  const tLo = (lo / DISTANCE) * TOTAL;
  const tHi = (hi / DISTANCE) * TOTAL;
  let acc = 0;
  for (let i = 0; i < SEG.length; i++) {
    acc += SEG[i];
    if (acc > tLo && acc < tHi) pts.push(CP[i + 1]);
  }
  pts.push(at(hi));
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
}
