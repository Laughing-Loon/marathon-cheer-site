import { COLORS } from "./config";

const BK = COLORS.leaf;
const QN = COLORS.sun;
const MN = COLORS.pink;
const BX = COLORS.sky;

export type Spot = {
  id: string;
  mile: string; // badge label
  name: string;
  train: string;
  joke: string;
  color: string;
  // integer miles this spot covers on the coverage strip
  covers: [number, number];
  // miles used for the pass-by window (fast edge, slow edge), tuned to the spec table
  eta: [number, number];
};

export const SPOTS: Spot[] = [
  { id: "bay-ridge", mile: "4–6", name: "Fourth Ave, Bay Ridge", train: "R", joke: "still smiling", color: BK, covers: [4, 6], eta: [4, 6] },
  { id: "atlantic", mile: "8", name: "Fourth Ave & Atlantic", train: "B D N Q R 2 3 4 5", joke: "the big stage", color: BK, covers: [8, 8], eta: [8, 8] },
  { id: "fort-greene", mile: "8–9", name: "Lafayette Ave, Fort Greene", train: "C, G", joke: "stoop champagne zone", color: BK, covers: [8, 9], eta: [9, 9] },
  { id: "williamsburg", mile: "11", name: "Bedford Ave, Williamsburg", train: "G L M J", joke: "loud and narrow", color: BK, covers: [11, 11], eta: [11, 11] },
  { id: "greenpoint", mile: "12", name: "Greenpoint, near Nassau", train: "G", joke: "cheer zone", color: BK, covers: [12, 12], eta: [12, 12] },
  { id: "lic", mile: "13–14", name: "Long Island City", train: "7 G E", joke: "halfway, half alive", color: QN, covers: [13, 14], eta: [13.1, 14] },
  { id: "first-60s", mile: "16", name: "First Ave, 59th–70th", train: "Q 4 5 6", joke: "wall of noise", color: MN, covers: [16, 16], eta: [16, 16] },
  { id: "first-90s", mile: "17–18", name: "First Ave, 90s–110s", train: "Q, 6", joke: "she can actually see you", color: MN, covers: [17, 18], eta: [18, 18] },
  { id: "bronx", mile: "20–21", name: "The Bronx (new route)", train: "6", joke: "be the door in the wall", color: BX, covers: [20, 21], eta: [20.4, 20.5] },
  { id: "fifth-110s", mile: "22", name: "Fifth Ave, 110th–120th", train: "2 3, 6", joke: "the hard bit", color: MN, covers: [22, 22], eta: [22, 22] },
  { id: "museum-mile", mile: "23–24", name: "Museum Mile", train: "4 5 6", joke: "uphill, sorry", color: MN, covers: [23, 24], eta: [23.4, 23.5] },
  { id: "park-east", mile: "24–25", name: "Central Park, east side", train: "4 5 6, Q", joke: "almost there", color: MN, covers: [24, 25], eta: [24.5, 24.5] },
  { id: "cps", mile: "26", name: "Central Park South", train: "A B C D 1, N R", joke: "arrive very early", color: MN, covers: [25, 26], eta: [25.5, 25.5] },
];

export const spotById = (id: string) => SPOTS.find((s) => s.id === id);

/** Options for the claim and sighting pickers, Bronx first because nobody goes. */
export const SPOT_OPTIONS = [
  ...SPOTS.filter((s) => s.id === "bronx"),
  ...SPOTS.filter((s) => s.id !== "bronx"),
];
