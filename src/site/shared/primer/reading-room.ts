import { DEFAULT_PACE, PACES } from "../living-chart/pace.ts";
import { ROAD_ASK, ROAD_TAKE } from "../living-chart/voyage-log-panel.ts";
import { aria, click, countWord, set, text, type Ladder } from "./shape.ts";

const AT = "/reading-room/#seed=42";
const HURRIED = PACES.filter((k) => k !== DEFAULT_PACE);
const times = (k: number): string => (k === 2 ? "twice" : `${countWord(k)} times`);

export const READING_ROOM: Ladder = {
  route: "/reading-room/",
  what: "The Reading Room lets you watch a world live: its founding survey sails first, then its years turn and its towns rise and fall.",
  lessons: [
    {
      id: "watch",
      title: "Watch a world live",
      gloss: "the instrument under the chart, and the Journal at the right",
      steps: [
        {
          id: "reading-room-play",
          act: "Press {Play}.",
          see: "The survey ship sails first, day by day; then the years turn, and towns rise and fall. With motion turned off on your computer, Play goes straight to the last year.",
          at: AT,
          words: [text(".rf-play", "Play")],
          do: [click(".rf-play")],
        },
        {
          id: "reading-room-pace",
          act: `Press ${HURRIED.map((k) => `{${k}×}`).join(" or ")} to hurry it.`,
          see: `The voyage and the years run ${HURRIED.map(times).join(" or ")} as fast. With motion turned off there is no pace to choose, since Play is a still frame.`,
          at: AT,
          words: HURRIED.map((k) => text(`.rf-pace [data-pace="${k}"]`, `${k}×`)),
          do: HURRIED.map((k) => click(`.rf-pace [data-pace="${k}"]`)),
          only: "motion",
        },
        {
          id: "reading-room-ages",
          act: "Drag {The ages} to any year.",
          see: "The chart shows the world as it stood that year, and the line under it tells what happened then.",
          at: AT,
          words: [aria(".rf-range", "The ages")],
          do: [set(".rf-range", "912")],
        },
        {
          id: "reading-room-journal",
          act: "Read {The Journal} at the right.",
          see: "Each line is a day of the survey, or a year of the ages.",
          at: AT,
          words: [text("#journal-title", "The Journal")],
        },
        {
          id: "reading-room-road",
          act: `On a road leg's row in the Journal, press {${ROAD_TAKE}} once the voyage has reached it.`,
          see: `It asks ${ROAD_ASK} first; then the Wayfarer's Ribbon unrolls that road.`,
          at: AT,
          words: [text(".journal-dock .cr-road .cr-road-label", ROAD_TAKE)],
          relies: [{ css: ".journal-dock .cr-road", says: "false", read: "attr", attr: "aria-disabled" }],
        },
        {
          id: "reading-room-read",
          act: "Type a seed and press {Read}, or press {⚄}.",
          see: "Another world sits down to be read.",
          at: AT,
          words: [text(".rr-read", "Read"), text(".rr-dice", "⚄")],
          relies: [aria(".rr-colophon input", "seed")],
          do: [
            click(".rr-dice"),
            { kind: "set", css: ".rr-colophon input", value: "1155", release: false },
            { kind: "key", css: ".rr-colophon input", key: "Enter" },
            click(".rr-read"),
          ],
          kind: "play",
        },
      ],
    },
  ],
};
