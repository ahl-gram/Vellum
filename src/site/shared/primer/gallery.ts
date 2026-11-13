import { text, type Ladder } from "./shape.ts";

const AT = "/gallery/";
const PLATE = ".grid figure";

export const GALLERY: Ladder = {
  route: "/gallery/",
  what: "The Gallery hangs a dozen worlds for viewing, and every plate is a road into its own world.",
  lessons: [
    {
      id: "browse",
      title: "Worlds hung for viewing",
      gloss: "every plate is a road into its own world",
      steps: [
        {
          id: "gallery-look",
          act: "Read the line under a plate.",
          see: "Its name, its seed, its kind of land and its climate.",
          at: AT,
          words: [],
          relies: [text(`${PLATE} figcaption span`, "seed", "starts")],
        },
        {
          id: "gallery-open",
          act: "Press any plate that catches your eye.",
          see: "Its world opens in the Explorer, at its own seed.",
          at: AT,
          words: [],
          relies: [
            text(".legend .legend-head", "every plate is a road into its own world"),
            { css: `${PLATE} a`, says: "/explorer/#seed=", read: "attr", attr: "href", match: "starts" },
          ],
          kind: "play",
        },
      ],
    },
  ],
};
