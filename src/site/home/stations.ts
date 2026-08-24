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

function mooring(name: string): StageDot {
  const dot = homeStage().dots.find((d) => d.name === name);
  if (dot === undefined) throw new Error(`seed 42 no longer places ${name}; re-anchor the station (#458)`);
  return dot;
}

export function homeStations(): ReadonlyArray<Station> {
  const capital = homeStage().capital;
  const lamahai = mooring("Lamahai");
  const weki = mooring("Weki");
  return [
    {
      id: "explorer",
      name: "The Explorer",
      legendName: "The Explorer",
      verb: "Make one",
      where: `at ${capital.name}, the capital`,
      href: "explorer/",
      prose:
        "Draw your own: type a seed, pick a style and climate, and the world is drafted live in your browser. Nothing is uploaded.",
      arms: false,
      sea: false,
      nx: capital.nx,
      ny: capital.ny,
    },
    {
      id: "reading-room",
      name: "The Reading Room",
      legendName: "The Reading Room",
      verb: "Watch one",
      where: `off ${lamahai.name}, on the southern shore`,
      href: "reading-room/",
      prose:
        "Sit with a world and watch it happen: the founding voyage sails its survey, then the years turn and settlements rise, prosper, and fall to ruin.",
      arms: false,
      sea: false,
      nx: lamahai.nx,
      ny: lamahai.ny,
    },
    {
      id: "atlas",
      name: "The Atlas of Rahai",
      legendName: "The Atlas",
      verb: "Read one",
      where: `at ${weki.name}, a seat of the west`,
      href: "atlas/",
      prose:
        "A bound volume: the world chart in three styles, two regional close-up surveys of the same terrain, and a gazetteer of every settlement with travelers' notes.",
      arms: true,
      sea: false,
      nx: weki.nx,
      ny: weki.ny,
    },
    {
      id: "gallery",
      name: "A Gallery of Worlds",
      legendName: "A Gallery of Worlds",
      verb: "Browse many",
      where: "in open water, beyond the survey",
      href: "gallery/",
      prose:
        "Twelve worlds from twelve seeds: archipelagos, islands, and continents, each with its own name, realms, and coastline.",
      arms: false,
      sea: true,
      nx: GALLERY_NX,
      ny: GALLERY_NY,
    },
  ];
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
