import { WRITE_ANEW } from "../../explorer/land-rows.ts";
import { MAP_WORDS } from "../map-words.ts";
import { aria, click, road, roomOf, set, text, type Act, type Ladder } from "./shape.ts";

const AT = "/writing-room/";
const SENTENCE = "a polar archipelago of twenty islands";
const NAME = "Zebediah";
const SHAPE = "an island in the shape of Japan";
const FOUND = "#wr-form button[type=submit]";
const PLATE = "The Vegetation Plate";
const founded = (sentence: string): readonly Act[] => [set("#wr-line", sentence), click(FOUND)];

export const WRITING_ROOM: Ladder = {
  route: "/writing-room/",
  what: "The Writing Room founds a world from a sentence: words on its list steer the world, and every other word makes its chart number.",
  lessons: [
    {
      id: "found",
      title: "A world from a sentence",
      gloss: "the box on The Founding, at the right",
      steps: [
        {
          id: "writing-room-write",
          act: `In {the founding sentence} box, write "${SENTENCE}", then press {Found}.`,
          see: "A world is founded from your words, and the account below says what each word did.",
          at: AT,
          words: [aria("#wr-line", "the founding sentence"), text(FOUND, "Found")],
          do: founded(SENTENCE),
          then: [text("#wr-account .wr-steered .wr-word", "polar")],
        },
        {
          id: "writing-room-your-word",
          act: "Add your own name to the end of the sentence, and press {Found} again.",
          see: "Your name is not on the list, so it changes only the chart number: another polar archipelago of about twenty islands.",
          at: AT,
          first: founded(SENTENCE),
          words: [text(FOUND, "Found")],
          do: founded(`${SENTENCE} ${NAME}`),
          then: [
            text("#wr-account .wr-residual", NAME.toLowerCase(), "contains"),
            text("#folio-coords", `${MAP_WORDS.archipelago}, polar`, "contains"),
          ],
          kind: "play",
        },
        {
          id: "writing-room-shape-of",
          act: `Write "${SHAPE}", and press {Found}.`,
          see: "The land is drawn in Japan's outline.",
          at: AT,
          words: [text(FOUND, "Found")],
          do: founded(SHAPE),
          then: [text("#wr-account .wr-steered", "the shape of Japan", "contains")],
        },
        {
          id: "writing-room-plate",
          act: `Press {Lay on ${PLATE}}.`,
          see: "The plants are laid over the land; the press now reads Lift, to take them off.",
          at: AT,
          first: founded(SENTENCE),
          words: [road("#wr-plate", `Lay on ${PLATE}`)],
          do: [click("#wr-plate")],
          then: [road("#wr-plate", `Lift ${PLATE}`)],
        },
        {
          id: "writing-room-explore-it",
          act: `Press {Explore it in ${roomOf("/explorer/")}}.`,
          see: `Your world opens in the Explorer, its Land and Strand held by your sentence: to change them, ${WRITE_ANEW}.`,
          at: AT,
          first: founded(SENTENCE),
          words: [road("#wr-explorer", `Explore it in ${roomOf("/explorer/")}`)],
        },
        {
          id: "writing-room-commission",
          act: "Your commission: write a sentence for a world you would like to visit, and send its link to a friend.",
          see: "The same sentence founds the same world, forever.",
          at: AT,
          words: [],
          relies: [aria("#wr-line", "the founding sentence")],
          kind: "commission",
        },
      ],
    },
  ],
};
