import { POSTER_PRESETS, type PosterPreset } from "../../print-room/poster-presets.ts";
import { pressesFor, pressVerb, ROAD_CHOICE, ROAD_PRESETS } from "../../print-room/road-press.ts";
import {
  aria,
  choose,
  click,
  countWord,
  option,
  road,
  roomOf,
  set,
  text,
  wait,
  type Act,
  type Ladder,
  type Words,
} from "./shape.ts";

const AT = "/print-room/#seed=42";
const THUMB = "#pr-contents .thumb";
const BOUND: readonly Act[] = [click("#pr-bind"), wait(THUMB)];

const presetOf = (presets: readonly PosterPreset[], key: string): PosterPreset => {
  const p = presets.find((x) => x.key === key);
  if (p === undefined) throw new Error(`no ${key} press`);
  return p;
};
const DESK = presetOf(POSTER_PRESETS, "desk");
const FIRST_ROAD = ROAD_PRESETS[0]!;
const room = (p: PosterPreset): Words => text(`[data-poster="${p.key}"] .room`, p.label);
const press = (p: PosterPreset): Words => road(`[data-poster="${p.key}"]`, `${pressVerb(p)} ${p.label}`);

export const PRINT_ROOM: Ladder = {
  route: "/print-room/",
  what: `The Print Room takes a world home: a proof on the desk, a bound atlas of every plate, and posters at ${countWord(pressesFor("poster").length)} sizes.`,
  lessons: [
    {
      id: "proof",
      title: "A proof on the desk",
      gloss: "the seed, the style and Pull a proof, at the top right",
      steps: [
        {
          id: "print-room-pull",
          act: "Type 42 and press {Pull a proof}.",
          see: "The Isle of Rahai comes onto the desk as a proof.",
          at: "/print-room/",
          words: [text("#pr-draw", "Pull a proof")],
          relies: [aria("#pr-seed", "seed")],
          do: [set("#pr-seed", "42"), click("#pr-draw")],
          then: [text("#folio-title", "The Isle of Rahai", "starts")],
        },
        {
          id: "print-room-style",
          act: "Choose {ink} beside it, and pull again.",
          see: "The proof is pulled again in pen and ink.",
          at: AT,
          words: [option("#pr-style", "ink")],
          relies: [text("#pr-draw", "Pull a proof")],
          do: [choose("#pr-style", "ink"), click("#pr-draw")],
          then: [{ css: "#pr-preview svg", says: "ink", read: "attr", attr: "data-vellum-style" }],
        },
      ],
    },
    {
      id: "atlas",
      title: "The Bound Atlas",
      gloss: "the whole atlas, on the sheet at the right",
      steps: [
        {
          id: "print-room-bind",
          act: "Press {Bind the atlas}.",
          see: "In a few seconds every plate is bound from the proof: the chart in every manner, the thematic surveys, the close-ups, the prospect, the road, the banners, the chronicle and the gazetteer.",
          at: AT,
          words: [text("#pr-bind", "Bind the atlas")],
          do: BOUND,
          then: [text("#pr-bound-status", "The atlas of The Isle of Rahai is bound", "starts")],
        },
        {
          id: "print-room-turn",
          act: "In the Contents, press a thumbnail.",
          see: "The sheet on the desk turns to that plate.",
          at: AT,
          first: BOUND,
          words: [],
          relies: [text(".turn-gloss", "a thumbnail turns the sheet"), { ...aria(THUMB, "Turn to"), match: "starts" }],
        },
        {
          id: "print-room-keep",
          act: "Press {Print} to save the atlas as a PDF, or {Download} for one file that opens offline.",
          see: "Print opens your browser's own Save as PDF, one plate to a page.",
          at: AT,
          first: BOUND,
          words: [text("#pr-print", "Print"), text("#pr-download", "Download")],
        },
      ],
    },
    {
      id: "posters",
      title: "Posters",
      gloss: "the presses under the chart",
      steps: [
        {
          id: "print-room-impression",
          act: `Choose {An impression (PNG)}, then press {${DESK.label}}.`,
          see: `The chart is pressed as a picture ${DESK.width} pixels wide, and saved.`,
          at: AT,
          words: [option("#pr-format", "An impression (PNG)"), room(DESK)],
          relies: [press(DESK)],
        },
        {
          id: "print-room-road",
          act: `Choose {${ROAD_CHOICE}} from the first list; the first press now reads {${FIRST_ROAD.label}}: press it.`,
          see: "The road from Laukuwelua is pressed as a plate of its own.",
          at: AT,
          first: [choose("#pr-pressing", ROAD_CHOICE)],
          words: [option("#pr-pressing", ROAD_CHOICE), room(FIRST_ROAD)],
          relies: [press(FIRST_ROAD)],
          then: [text("#pr-plate-line", "the road from Laukuwelua", "starts")],
        },
        {
          id: "print-room-back",
          act: `Press {Back to ${roomOf("/explorer/")}}.`,
          see: "The Explorer opens on the same world.",
          at: AT,
          words: [road("#pr-explorer", `Back to ${roomOf("/explorer/")}`)],
        },
      ],
    },
  ],
};
