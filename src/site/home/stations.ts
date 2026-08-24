import { homeStage, type StageDot } from "./stage-data.ts";

export type Station = {
  readonly id: string;
  readonly name: string;
  readonly legendName: string;
  readonly verb: string;
  readonly where: string;
  readonly href: string;
  readonly prose: string;
  readonly arms: boolean;
  readonly sea: boolean;
  readonly nx: number;
  readonly ny: number;
};

const GALLERY_NX = 0.79;
const GALLERY_NY = 0.73;

const PROSE: Readonly<Record<string, string>> = {
  explorer:
    "Draw your own: type a seed, pick a style and climate, and the world is drafted live in your browser. Nothing is uploaded.",
  "reading-room":
    "Sit with a world and watch it happen: the founding voyage sails its survey, then the years turn and settlements rise, prosper, and fall to ruin.",
  atlas:
    "A bound volume: the world chart in three styles, two regional close-up surveys of the same terrain, and a gazetteer of every settlement with travelers' notes.",
  gallery:
    "Twelve worlds from twelve seeds: archipelagos, islands, and continents, each with its own name, realms, and coastline.",
};

function mooring(name: string): StageDot {
  const dot = homeStage().dots.find((d) => d.name === name);
  if (dot === undefined) throw new Error(`seed 42 no longer places ${name}; re-anchor the station (#458)`);
  return dot;
}

function station(
  id: string,
  name: string,
  verb: string,
  where: string,
  href: string,
  at: { readonly nx: number; readonly ny: number },
  extra: Partial<Pick<Station, "legendName" | "arms" | "sea">> = {},
): Station {
  return { id, name, legendName: name, verb, where, href, prose: PROSE[id], arms: false, sea: false, nx: at.nx, ny: at.ny, ...extra };
}

export function homeStations(): ReadonlyArray<Station> {
  const capital = homeStage().capital;
  const lamahai = mooring("Lamahai");
  const weki = mooring("Weki");
  return [
    station("explorer", "The Explorer", "Make one", `at ${capital.name}, the capital`, "explorer/", capital),
    station("reading-room", "The Reading Room", "Watch one", `off ${lamahai.name}, on the southern shore`, "reading-room/", lamahai),
    station("atlas", "The Atlas of Rahai", "Read one", `at ${weki.name}, a seat of the west`, "atlas/", weki, { legendName: "The Atlas", arms: true }),
    station("gallery", "A Gallery of Worlds", "Browse many", "in open water, beyond the survey", "gallery/", { nx: GALLERY_NX, ny: GALLERY_NY }, { sea: true }),
  ];
}

export type HowStation = {
  readonly id: "how";
  readonly name: string;
  readonly verb: string;
  readonly where: string;
  readonly nx: number;
  readonly ny: number;
};

export function howStation(): HowStation {
  return { id: "how", name: "How It Works", verb: "See how", where: "at the title cartouche", nx: 0.7847, ny: 0.1779 };
}

const spotKey = (nx: number, ny: number): string => `${nx},${ny}`;

export function stationSpots(stations: ReadonlyArray<Station>): ReadonlySet<string> {
  return new Set(stations.map((s) => spotKey(s.nx, s.ny)));
}

export function unclaimedDots(
  dots: ReadonlyArray<StageDot>,
  stations: ReadonlyArray<Station>,
): ReadonlyArray<StageDot> {
  const spots = stationSpots(stations);
  return dots.filter((d) => !spots.has(spotKey(d.nx, d.ny)));
}
