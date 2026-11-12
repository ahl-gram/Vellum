import { PLATE_STEPS, PLATE_TAB, PLATE_VERB } from "../../explorer/portfolio/how-plate.ts";
import { TABLE_CAP } from "../table-address.ts";
import { DOG_EAR, LAID, ONE_SHEET, SURVEYED } from "./explorer-sheet.ts";
import { aria, countWord, road, roomOf, text, wait, type Ladder } from "./shape.ts";

const TO_PORTFOLIO = `${PLATE_VERB} ${roomOf("/explorer/portfolio/")}`;
const TWO_SHEETS = `/explorer/portfolio/#table=${ONE_SHEET}_k-p.seed-42.i-0.style-antique`;
const [FIRST_STEP] = PLATE_STEPS;
const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

export const PORTFOLIO: Ladder = {
  route: "/explorer/portfolio/",
  what: "The Portfolio is where the sheets you laid on the Chart Table are taken home, each drafted again from the number in its margin.",
  entered: `from the Drawer in the Explorer (${TO_PORTFOLIO}), or from the Print Room's note`,
  lessons: [
    {
      id: "gather",
      title: "Gather, then take home",
      gloss: "the Explorer's Drawer, then this room",
      steps: [
        {
          id: "explorer-portfolio-bare",
          act: "Open the Portfolio with nothing gathered.",
          see: `A plate shows the way in ${countWord(PLATE_STEPS.length)} steps: ${PLATE_STEPS.map((s) => lowerFirst(s.head)).join(", ")}.`,
          at: "/explorer/portfolio/",
          words: [],
          relies: [text("#pf-sheet .how-plate .p-head", `${FIRST_STEP.numeral} · ${FIRST_STEP.head}`)],
        },
        {
          id: "explorer-portfolio-turn-down",
          act: "In the Explorer, draw nearer until the chart is drafted anew, and press the survey's turned-up corner.",
          see: `The survey is laid on the Chart Table. Lay up to ${countWord(TABLE_CAP)}; the Drawer says when there is no room for more.`,
          at: SURVEYED,
          first: [wait(DOG_EAR)],
          words: [],
          relies: [
            aria(DOG_EAR, "lay this survey on the table"),
            { ...text("#chart-drawer-full", "no room for more"), state: "hidden" },
          ],
        },
        {
          id: "explorer-portfolio-take",
          act: `Open {${PLATE_TAB}} and press {${TO_PORTFOLIO}}.`,
          see: "Every sheet you laid comes here, drafted again from its number.",
          at: LAID,
          words: [
            text("#chart-drawer-tab", PLATE_TAB, "starts"),
            { ...road("#table-road", TO_PORTFOLIO), state: "hidden" },
          ],
        },
        {
          id: "explorer-portfolio-next",
          act: "Press {Bring up The Next Sheet}.",
          see: "The next sheet comes to the top of the pile.",
          at: TWO_SHEETS,
          words: [road("#pf-next", "Bring up The Next Sheet")],
        },
        {
          id: "explorer-portfolio-download",
          act: "Press {Download The Engraving}.",
          see: "The sheet on top is saved as the engraving, an SVG that is exact at any size.",
          at: TWO_SHEETS,
          words: [road("#pf-download", "Download The Engraving")],
        },
        {
          id: "explorer-portfolio-keep",
          act: "Copy the address from the bar.",
          see: "The table rides in the address, so the link keeps the gathering.",
          at: TWO_SHEETS,
          words: [],
          relies: [road("#pf-explorer", `Back to ${roomOf("/explorer/")}`)],
          kind: "play",
        },
      ],
    },
  ],
};
