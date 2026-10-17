// The chart of the atelier's drawing (Issue #671): a place for every route in the tree and an isle for the atlas, which `test/site/atelier-chart.test.ts` holds; the coordinates, the roads and the coast are drawn, lifted from `atelierChart` in `design/nav-wayfinding/directions.mjs`.
export type PlaceRank = "landing" | "capital" | "town" | "isle" | "village";

export interface Place {
  readonly x: number;
  readonly y: number;
  readonly rank: PlaceRank;
  readonly name: string;
}

export const PLACES: Readonly<Record<string, Place>> = {
  "/": { x: 62, y: 286, rank: "landing", name: "Vellum" },
  "/explorer/": { x: 300, y: 196, rank: "capital", name: "The Explorer" },
  "/prospect/": { x: 214, y: 148, rank: "town", name: "The Prospect" },
  "/ribbon/": { x: 126, y: 236, rank: "town", name: "The Ribbon" },
  "/explorer/portfolio/": { x: 368, y: 136, rank: "town", name: "The Portfolio" },
  "/reading-room/": { x: 272, y: 274, rank: "town", name: "The Reading Room" },
  "/print-room/": { x: 418, y: 232, rank: "town", name: "The Print Room" },
  "/seed-of-the-day/": { x: 486, y: 96, rank: "isle", name: "Today" },
  "/gallery/": { x: 500, y: 320, rank: "isle", name: "The Gallery" },
  "/faq/": { x: 158, y: 330, rank: "village", name: "Q & A" },
  "/glossary/": { x: 352, y: 336, rank: "village", name: "The Glossary" },
  "/atlas/": { x: 44, y: 128, rank: "isle", name: "The Atlas" },
};

export const ROADS: readonly (readonly [string, string])[] = [
  ["/", "/explorer/"],
  ["/explorer/", "/prospect/"],
  ["/prospect/", "/ribbon/"],
  ["/explorer/", "/explorer/portfolio/"],
  ["/explorer/", "/print-room/"],
  ["/explorer/", "/reading-room/"],
  ["/print-room/", "/glossary/"],
  ["/reading-room/", "/faq/"],
  ["/", "/atlas/"],
];

export const TRACKS: readonly (readonly [string, string])[] = [["/reading-room/", "/prospect/"]];

export const COAST =
  "M74 196 C 70 150 108 108 156 96 C 196 86 222 104 256 92 C 296 78 330 86 356 74 " +
  "C 392 58 430 78 438 112 C 444 140 424 158 436 180 C 452 208 470 218 466 248 C 462 284 430 300 396 300 " +
  "C 366 300 356 320 330 342 C 300 368 250 372 214 356 C 178 340 170 316 140 304 C 100 288 78 244 74 196 Z";

export const PIP_R: Readonly<Record<PlaceRank, number>> = { capital: 5.5, landing: 5, town: 4, isle: 4, village: 3 };

export function roadPath(pair: readonly [string, string]): string {
  const [p, q] = pair.map((route) => {
    const place = PLACES[route];
    if (place === undefined) throw new Error(`no place on the chart of the atelier for ${route}`);
    return place;
  }) as [Place, Place];
  return `M${p.x} ${p.y} Q ${(p.x + q.x) / 2 + 12} ${(p.y + q.y) / 2 - 10} ${q.x} ${q.y}`;
}
