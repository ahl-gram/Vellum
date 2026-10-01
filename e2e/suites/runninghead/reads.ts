import type { Payload } from "../../types.ts";

// LITERAL on purpose: home is not a nav item, /ribbon/ and /prospect/ are shelled rooms outside the nav, /atlas/ is generated and carries no shell, and a page dropping out of the nav must not silently drop out of this guard.
export const SHELLED = ["/", "/explorer/", "/print-room/", "/reading-room/", "/gallery/", "/faq/", "/glossary/", "/seed-of-the-day/", "/prospect/", "/ribbon/", "/specimen/"];

// MEASURED split: /, /explorer/, /gallery/ leave body leading normal, every other page sets 1.6; RH6 needs PROSE and APP to differ in body leading or it proves nothing.
export const PROSE = "/faq/";
export const APP = "/explorer/";

// Anchored and disjoint on purpose: the flourish face's name is a prefix of the display face's, so an unanchored test for one would match the other.
export const DISPLAY_FACE = /^"IM Fell English SC",/;
const FLOURISH_FACE = /^"IM Fell English",/;

// Every constant MEASURED against the built dist/ (out/probe-cluster.mjs, 2026-08-26), never derived; tracking null means the browser reported "normal" and is asserted as such. The cluster is ONE dress on every page (#461 ruling 1): home differs only in the wordmark's tag (h1, #288) and in having no room head to measure.
const ROOM_HEAD = {
  wordmark: { tag: "P", weight: "400", size: 33.6, tracking: 4.032, face: DISPLAY_FACE },
  tagline: { tag: "P", weight: "400", size: 14.72, tracking: null, face: FLOURISH_FACE },
  rooms: { tag: "NAV", weight: "400", size: 11.52, tracking: 1.6128, face: DISPLAY_FACE },
  roomName: { tag: "H1", weight: "400", size: 26.4, tracking: 3.696, face: DISPLAY_FACE },
  roomTagline: { tag: "P", weight: "400", size: 16, tracking: null, face: FLOURISH_FACE },
  footer: { tag: "FOOTER", weight: "400", size: 11.52, tracking: 2.5344, face: DISPLAY_FACE },
};
const HOME_HEAD = {
  ...ROOM_HEAD,
  wordmark: { ...ROOM_HEAD.wordmark, tag: "H1" },
  roomName: null,
  roomTagline: null,
};
// Sub 7 (#462): a converted room stands its name in the RoomFolio corner (1.32rem, the corner's own leading), measured 2026-08-29 against the built dist; a CHART room renders no footer (ruling 9).
export const FOLIO = ["/seed-of-the-day/", "/faq/", "/glossary/", "/explorer/", "/reading-room/", "/print-room/", "/prospect/", "/ribbon/", "/gallery/", "/specimen/"];
export const CHART = ["/seed-of-the-day/", "/explorer/", "/reading-room/", "/print-room/", "/prospect/", "/ribbon/", "/gallery/", "/specimen/"];
const FOLIO_HEAD = {
  ...ROOM_HEAD,
  roomName: { tag: "H1", weight: "400", size: 21.12, tracking: 2.9568, face: DISPLAY_FACE },
  roomTagline: { tag: "P", weight: "400", size: 14.72, tracking: null, face: FLOURISH_FACE },
};
const CHART_HEAD = { ...FOLIO_HEAD, footer: null };
export const expectedHead = (route: string) =>
  route === "/" ? HOME_HEAD : CHART.includes(route) ? CHART_HEAD : FOLIO.includes(route) ? FOLIO_HEAD : ROOM_HEAD;
export const MEMBERS = ["wordmark", "tagline", "rooms", "roomName", "roomTagline", "footer"] as const;
// The second addendum on #461: the cluster pins its OWN leading (wordmark 1.15, the rest normal) and never inherits the page's reading 1.6; the room head pins 1.6 and never inherits an app page's normal. Both polarities are asserted per page in RH5.
export const CLUSTER_NORMAL = ["tagline", "rooms", "footer"] as const;
export const HEAD_LEADED = ["roomName", "roomTagline"] as const;
type Member = { tag: string; weight: string; size: number; family: string; tracking: string; lineHeight: string; ratio: number; position: string; color: string } | null;
export type Head = { chromeWash: { content: string; backgroundColor: string; filter: string } | null; chromePosition: string | null; chromeBottom: number | null; bandClip: string | null; h1s: { classes: string[]; inHeader: boolean; inMain: boolean }[]; bodyLineHeight: string } & Record<(typeof MEMBERS)[number], Member>;
type Want = { tag: string; weight: string; size: number; tracking: number | null; face: RegExp } | null;
export type Heads = Record<string, Head | undefined>;
export type Bad = (pred: (h: Head, r: string) => boolean) => string[];

export const HEAD_READ: Payload<string> = `(() => {
  const read = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName, weight: cs.fontWeight, size: parseFloat(cs.fontSize),
      family: cs.fontFamily, tracking: cs.letterSpacing, lineHeight: cs.lineHeight,
      ratio: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize),
      position: cs.position, color: cs.color,
    };
  };
  const band = document.querySelector(".band");
  const chrome = document.querySelector("header.chrome");
  return JSON.stringify({
    chromeWash: chrome ? (({ content, backgroundColor, filter }) => ({ content, backgroundColor, filter }))(getComputedStyle(chrome, "::before")) : null,
    wordmark: read("header.chrome .wordmark"), tagline: read("header.chrome .tagline"),
    rooms: read("header.chrome nav.rooms"),
    roomName: read("main .room-name"), roomTagline: read("main .room-tagline"),
    footer: read("body > footer"),
    chromePosition: read("header.chrome")?.position ?? null,
    chromeBottom: document.querySelector("header.chrome")?.getBoundingClientRect().bottom ?? null,
    bandClip: band ? getComputedStyle(band, "::before").clipPath : null,
    h1s: [...document.querySelectorAll("h1")].map((h) => ({ classes: [...h.classList], inHeader: !!h.closest("header"), inMain: !!h.closest("main") })),
    bodyLineHeight: getComputedStyle(document.body).lineHeight,
  });
})()`;

export const near = (got: number | undefined, want: number | undefined): boolean => Math.abs(got! -
  want!) < 0.01;
export const matches = (m: Member | undefined, want: Want): boolean => {
  if (want === null) return m === null;
  if (!m) return false;
  return m.tag === want.tag && m.weight === want.weight && near(m.size, want.size) &&
    want.face.test(m.family) &&
    (want.tracking === null ? m.tracking === "normal" : near(parseFloat(m.tracking), want.tracking));
};
