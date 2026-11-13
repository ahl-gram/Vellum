import { BAND_PROSE } from "../../seed-of-the-day/app-hunt.ts";
import { click, road, roomOf, text, type Ladder } from "./shape.ts";

const AT = "/seed-of-the-day/";
const bandWord = (line: string): string => line.slice(0, line.indexOf(".")).toLowerCase();
const BANDS = Object.values(BAND_PROSE).map(bandWord);
const INTRO =
  "One forgotten place hides on today's chart. Read the survey notes, then click the map to find it. Everyone hunting today's seed is looking for the same place.";

export const TODAY: Ladder = {
  route: "/seed-of-the-day/",
  what: "Today draws a new world every day, the same world for everyone, with one forgotten place hidden on it to find.",
  lessons: [
    {
      id: "hunt",
      title: "The Daily Hunt",
      gloss: "the notes at the right, and the chart",
      steps: [
        {
          id: "seed-of-the-day-notes",
          act: "Read the survey notes on {The Daily Hunt}.",
          see: "A few lines describe one forgotten place on today's chart. Everyone hunting today looks for the same place.",
          at: AT,
          words: [text("#hunt-title", "The Daily Hunt")],
        },
        {
          id: "seed-of-the-day-sound",
          act: "Click the chart where you think it hides.",
          see: `A miss leaves a sounding where you clicked, and a line tells how near you came: ${BANDS.slice(0, -1).join(", ")} or ${BANDS.at(-1)}.`,
          at: AT,
          words: [],
          relies: [text("#hunt .hunt-intro", INTRO)],
          do: [click("#map svg")],
          then: [text("#hunt-status", BAND_PROSE.cool, "starts")],
        },
        {
          id: "seed-of-the-day-share",
          act: "When you find it, press {Share your find}.",
          see: "A star is stamped on the place and its story unrolls; the press sends your result, or copies it.",
          at: AT,
          words: [{ ...text("#share", "Share your find"), state: "hidden" }],
        },
        {
          id: "seed-of-the-day-dispatch",
          act: "Press {Draft dispatch}.",
          see: "Your hunt, every sounding and the star, drawn onto the chart for you to keep.",
          at: AT,
          words: [{ ...text("#dispatch", "Draft dispatch"), state: "hidden" }],
        },
        {
          id: "seed-of-the-day-to-explorer",
          act: `Press {Open today's seed in ${roomOf("/explorer/")}}.`,
          see: "Today's world, with every control of the Explorer. Come back tomorrow for a new one.",
          at: AT,
          words: [road('[data-road="explorer"]', `Open today's seed in ${roomOf("/explorer/")}`)],
        },
      ],
    },
  ],
};
