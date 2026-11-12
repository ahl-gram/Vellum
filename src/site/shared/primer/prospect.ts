import { countLine, LAY_ON_PAGE, layPressFace } from "../../explorer/chart-drawer.ts";
import { eraLine } from "../../prospect/note-lines.ts";
import { parseTableValue } from "../table-address.ts";
import { card } from "./explorer-sheet.ts";
import { click, labelled, road, roomOf, set, text, type Ladder } from "./shape.ts";

const AT = "/prospect/#seed=42&i=0";
const EARLIER = 300;
const LAID = parseTableValue("k-p.seed-42.style-antique.i-0.year-1059");

export const PROSPECT: Ladder = {
  route: "/prospect/",
  what: "The Prospect is the second camera: one town engraved side-on from its own ground, the way the old printers drew a city.",
  entered:
    "from a town's card in the Explorer (View the prospect), from a town's row on the Ribbon, or from the Reading Room",
  lessons: [
    {
      id: "plate",
      title: "A town, engraved",
      gloss: "the plate, and The Engraver's Note at the right",
      steps: [
        {
          id: "prospect-enter",
          act: "In the Explorer, click a town and press {View the prospect}.",
          see: "The Prospect opens on that town.",
          at: "/explorer/#seed=42",
          first: [card],
          words: [text("#place-card .pc-prospect", "View the prospect")],
        },
        {
          id: "prospect-note",
          act: "Read {The engraver's note}.",
          see: "What the town is, a line of its story, and the key to the numbers on the plate.",
          at: AT,
          words: [text("#note .card-verb", "The engraver's note")],
        },
        {
          id: "prospect-year",
          act: `Type an earlier year, ${EARLIER}, in {viewed in the year}, and press {Engrave}.`,
          see: "Laukuwelua was founded in 451, so the plate shows its ground before the town rose.",
          at: AT,
          words: [labelled("#pp-year", "viewed in the year"), text("#pp-engrave", "Engrave")],
          do: [set("#pp-year", String(EARLIER)), click("#pp-engrave")],
          then: [
            text("#pp-era", eraLine({ era: "before-founding", year: EARLIER })),
            text("#note-title", "Laukuwelua"),
            text("#pp-note", "the year 451", "contains"),
          ],
        },
        {
          id: "prospect-lay",
          act: `Press {${LAY_ON_PAGE}}.`,
          see: "It joins the Chart Table, to be taken home in the Portfolio.",
          at: AT,
          words: [text("#pp-lay", LAY_ON_PAGE)],
          do: [click("#pp-lay")],
          then: [
            text("#pp-lay", layPressFace({ holds: true, full: false }, LAY_ON_PAGE).label),
            text("#pp-lay-count", countLine(LAID)),
          ],
        },
        {
          id: "prospect-road",
          act: `Press {Take the road from Laukuwelua in ${roomOf("/ribbon/")}}.`,
          see: "The Ribbon unrolls the road setting out from this town.",
          at: AT,
          words: [road("#pp-ribbon-link", `Take the road from Laukuwelua in ${roomOf("/ribbon/")}`)],
        },
      ],
    },
  ],
};
