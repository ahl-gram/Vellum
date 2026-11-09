import { SHEET_LESSONS } from "./explorer-sheet.ts";
import { click, set, text, type Ladder, type Words } from "./shape.ts";

const title = (says: string): Words => text("#folio-title", says, "starts");

export const EXPLORER: Ladder = {
  route: "/explorer/",
  what: "The Explorer draws a whole world from a number, and every control on it reshapes or redresses that world.",
  lessons: [
    {
      id: "number",
      title: "A world from a number",
      gloss: "the seed box, the dice and Draw, at the top right",
      steps: [
        {
          id: "explorer-draw",
          act: "Type 42 in the seed box and press {Draw}.",
          see: "The Isle of Rahai comes back, line for line. Every chart is reproducible from the number in its margin.",
          at: "/explorer/#seed=7",
          words: [text("#draw", "Draw")],
          do: [set("#seed", "42"), click("#draw")],
          then: [title("The Isle of Rahai")],
        },
        {
          id: "explorer-draw",
          act: "Type 42 in the seed box and press {Draw}.",
          see: "The Isle of Rahai comes back, line for line. Every chart is reproducible from the number in its margin.",
          at: "/explorer/#seed=7",
          words: [text("#draw", "Draw")],
          do: [set("#seed", "42"), click("#draw")],
          then: [title("The Isle of Rahai")],
        },
      ],
    },
    ...SHEET_LESSONS,
  ],
};
