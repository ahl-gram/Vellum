import { ROAD_ON_CARD } from "../living-chart/place-overlay-card.ts";
import { AT as EXPLORER_AT, card } from "./explorer-sheet.ts";
import { aria, choose, click, road, roomOf, text, type Ladder } from "./shape.ts";

const AT = "/ribbon/#seed=42&a=0";
const ANOTHER = "Paukilua";

export const RIBBON: Ladder = {
  route: "/ribbon/",
  what: "The Wayfarer's Ribbon unrolls one road as an itinerary: the way drawn league by league up a strip of paper, with a compass turning to keep north true.",
  entered: `from a town's card in the Explorer (${ROAD_ON_CARD}), from the Prospect, or from a road's row in the Reading Room's Journal`,
  lessons: [
    {
      id: "road",
      title: "A road, unrolled",
      gloss: "the journey at the top right, and The Itinerary below it",
      steps: [
        {
          id: "ribbon-enter",
          act: `In the Explorer, click a town and press {${ROAD_ON_CARD}}.`,
          see: "The road from that town is unrolled strip by strip, each one inked in after the last. With motion turned off, it is all there at once.",
          at: EXPLORER_AT,
          first: [card],
          words: [text("#place-card .pc-ribbon", ROAD_ON_CARD)],
        },
        {
          id: "ribbon-bound-for",
          act: "Choose another town from {bound for}.",
          see: "The road to it is unrolled anew.",
          at: AT,
          words: [aria("#rb-to", "bound for")],
          do: [choose("#rb-to", ANOTHER)],
          then: [text("#folio-title", `Laukuwelua to ${ANOTHER}`, "starts")],
        },
        {
          id: "ribbon-turn-about",
          act: "Press {Turn about}.",
          see: "The road runs the other way: where you were bound, you now set out from.",
          at: AT,
          words: [text("#rb-swap", "Turn about")],
          do: [click("#rb-swap")],
          then: [text("#folio-title", "Homaitani to Laukuwelua", "starts")],
        },
        {
          id: "ribbon-lean",
          act: "Press a row of the itinerary.",
          see: "The Glass leans on that stretch of the road, and the chart comes nearer there.",
          at: AT,
          words: [],
          relies: [
            text("#itinerary .row-gloss", "A row leans the Glass on that stretch of the road."),
            { css: "#rb-itinerary .lean", says: "Lean the Glass on this stretch", read: "title" },
          ],
        },
        {
          id: "ribbon-pill",
          act: "Press {prospect} on a town's row.",
          see: "That town's prospect opens.",
          at: AT,
          words: [text("#rb-itinerary .row-prospect", "prospect")],
        },
        {
          id: "ribbon-end",
          act: `Press {See Homaitani in ${roomOf("/prospect/")}}, the road out to the road's end.`,
          see: "The Prospect of the town the road is bound for.",
          at: AT,
          words: [road("#rb-prospect-link", `See Homaitani in ${roomOf("/prospect/")}`)],
        },
      ],
    },
  ],
};
