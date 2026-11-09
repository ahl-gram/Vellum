// Issue #1155 round: the Explorer's ladder, every word of every control quoted as the built page shows it at 089881ad (measure/inventory.md), every address driven on the built site before its sentence was written (measure/explore-results.json).
import type { Ladder, Words } from "./shape.ts";

export const ICELAND = "ne-1159320917";
const AT = "/explorer/#seed=42";
const SURVEYED = "/explorer/#seed=42&cx=0.5000&cy=0.5000&k=1.9600";
const LAID = `${SURVEYED}&table=k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-8.ly-8`;

const label = (id: string, says: string): Words => ({ css: `label[for=${id}]`, says, read: "text", from: "markup" });
const end = (row: string, side: "min" | "max", says: string): Words => ({ css: `[data-row=${row}] .land-end-${side}`, says, read: "text", from: "markup" });
const option = (id: string, says: string): Words => ({ css: `#${id}`, says, read: "option", from: "markup" });
const aria = (css: string, says: string, from: "markup" | "script" = "markup"): Words => ({ css, says, read: "aria", from });
const road = (css: string, says: string): Words => ({ css, says, read: "road", from: "markup" });
const card = { kind: "eval", js: `{const h=document.querySelector('.place-hit[data-idx="0"]');h.focus();h.click();for(let j=0;j<8;j++)await tick();}` } as const;

const BROADSIDE = "the Broadside's rows and every word on them (handbook/specs/ui-design.md, the Broadside's provisional list)";

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
          id: "dice",
          act: "Press {⚄}, the dice beside the seed box.",
          see: "A whole new world is drawn, and its number fills the seed box.",
          at: AT,
          words: [{ css: "#random", says: "⚄", read: "text", from: "markup" }],
          kind: "play",
        },
        {
          id: "draw",
          act: "Type 42 in the seed box and press {Draw}.",
          see: "The Isle of Rahai comes back, line for line. Every chart is reproducible from the number in its margin.",
          at: "/explorer/#seed=7",
          words: [{ css: "#draw", says: "Draw", read: "text", from: "markup" }],
        },
        {
          id: "enter",
          act: "Type any number you like in the {seed} box and press Enter.",
          see: "Every number is a world, and the same number is the same world for anyone who types it.",
          at: AT,
          words: [aria("#seed", "seed")],
          kind: "play",
        },
      ],
    },
    {
      id: "land",
      title: "The Land",
      gloss: "these shape the world itself",
      aside: "Every list starts at seed's choice: choose it again to hand the row back to the seed.",
      steps: [
        {
          id: "archipelago",
          act: "On the Broadside, open {type} and choose {archipelago}.",
          see: "The isle breaks into a scatter of isles, and the chart is renamed The Rahai Archipelago.",
          at: AT,
          words: [label("type", "type"), option("type", "archipelago")],
          provisional: BROADSIDE,
        },
        {
          id: "islands",
          act: "A new row has come: drag {islands} from {few} toward {many}, then let go.",
          see: "The sea fills with isles, and the readout says about how many. A few may touch or sink, so the count is never exact.",
          at: "/explorer/#seed=42&type=archipelago",
          words: [label("islands", "islands"), end("islands", "min", "few"), end("islands", "max", "many")],
          provisional: BROADSIDE,
        },
        {
          id: "sizes",
          act: "Now {sizes} has come too: choose {of every size}.",
          see: "Some isles swell and others stay small.",
          at: "/explorer/#seed=42&type=archipelago&islands=20",
          words: [{ css: "#sizes-label", says: "sizes", read: "text", from: "markup" }, { css: "#isle-varied", says: "of every size", read: "label", from: "markup" }],
          provisional: BROADSIDE,
        },
        {
          id: "climate",
          act: "Open {climate} and choose {polar}.",
          see: "Pine woods and open tundra, and the snow line comes down the hills. The coast stays exactly where it was.",
          at: AT,
          words: [label("band", "climate"), option("band", "polar")],
          provisional: BROADSIDE,
        },
        {
          id: "shape",
          act: "Type Iceland in the {shape} box, and choose it from the list.",
          see: "The land is drawn inside Iceland's outline, north up, nearly edge to edge.",
          at: AT,
          words: [label("place", "shape"), { css: "#place", says: "seed's choice", read: "placeholder", from: "markup" }],
          provisional: BROADSIDE,
        },
        {
          id: "held",
          act: "With Iceland still in the box, choose {archipelago} from {type}.",
          see: "The islands row steps into the held box at the foot of the Land, which says why: the outline holds the count; clear the place to free the islands.",
          at: `/explorer/#seed=42&outline=${ICELAND}`,
          first: [{ kind: "set", css: "#type", value: "archipelago" }],
          words: [option("type", "archipelago"), label("type", "type"), { css: "label[for=islands]", says: "islands", read: "text", from: "markup", state: "held" }, { css: "#land-held-note", says: "the outline holds the count; clear the place to free the islands", read: "text", from: "script", state: "held", constant: "HELD_NOTES.count in src/site/explorer/land-rows.ts" }],
          provisional: BROADSIDE,
        },
      ],
    },
    {
      id: "strand",
      title: "The Strand",
      gloss: "these set the water's edge",
      aside: "A row that cannot act on the world on screen waits in a held box, and the note under it says what holds it.",
      steps: [
        {
          id: "sea-level",
          act: "Drag {sea level} slowly toward {more sea}.",
          see: "The sea rises as you drag, and the readout says how much of the sheet is land.",
          at: AT,
          words: [label("land", "sea level"), end("land", "min", "more sea")],
          provisional: BROADSIDE,
        },
        {
          id: "coast",
          act: "Drag the {coast} from {calm} toward {lobed}, then let go.",
          see: "Nothing moves until you let go; then a new coast is drawn. Each step of the coast is a different world.",
          at: AT,
          words: [label("coast", "coast"), end("coast", "min", "calm"), end("coast", "max", "lobed")],
          provisional: BROADSIDE,
        },
        {
          id: "ragged",
          act: "On a counted archipelago the coast row runs {round} to {ragged}: drag it toward {ragged}, and let go.",
          see: "Every island's shore frays.",
          at: "/explorer/#seed=42&type=archipelago&islands=20",
          words: [end("ragged", "min", "round"), end("ragged", "max", "ragged"), label("ragged", "coast")],
          provisional: BROADSIDE,
        },
        {
          id: "looseness",
          act: "With Iceland's shape on the chart, drag {looseness} from {exact} toward {loose}.",
          see: "The land slips its outline toward the seed's own island, and the coast row comes free.",
          at: `/explorer/#seed=42&outline=${ICELAND}`,
          words: [label("looseness", "looseness"), end("looseness", "min", "exact"), end("looseness", "max", "loose")],
          provisional: BROADSIDE,
        },
      ],
    },
    {
      id: "hand",
      title: "The Hand",
      gloss: "these dress the same world",
      aside: "Nothing in the Hand changes the land: the same world, dressed another way.",
      steps: [
        {
          id: "style",
          act: "Open {style} and choose {ink}.",
          see: "The same world, drawn again in pen and ink.",
          at: AT,
          words: [label("style", "style"), option("style", "ink")],
        },
        {
          id: "theme",
          act: "Open {theme} and choose {rainfall}.",
          see: "The land is washed with how much rain falls where.",
          at: AT,
          words: [label("theme", "theme"), option("theme", "rainfall")],
        },
        {
          id: "arms",
          act: "Tick {arms}.",
          see: "Each realm's coat of arms is set on the chart.",
          at: AT,
          words: [{ css: "#arms", says: "arms", read: "label", from: "markup" }],
        },
        {
          id: "beasts",
          act: "Tick {beasts}.",
          see: "A sea beast is drawn in the deep water with its name beside it: on this chart, Rauhoahai.",
          at: AT,
          words: [{ css: "#beasts", says: "beasts", read: "label", from: "markup" }],
        },
        {
          id: "survey",
          act: "Tick {survey}.",
          see: "The expedition's track is inked onto the sheet, with the ship's daily stations.",
          at: AT,
          words: [{ css: "#ages", says: "survey", read: "label", from: "markup" }],
        },
        {
          id: "legend",
          act: "Untick {legend}, then tick it again.",
          see: "The key in the corner is taken off, and put back.",
          at: AT,
          words: [{ css: "#legend", says: "legend", read: "label", from: "markup" }],
        },
      ],
    },
    {
      id: "glass",
      title: "The Surveyor's Glass",
      gloss: "the presses at the chart's bottom right corner",
      steps: [
        {
          id: "nearer",
          act: "Press {Draw nearer}, the + by the chart.",
          see: "The chart comes closer.",
          at: AT,
          words: [aria("#zoom-in", "Draw nearer")],
        },
        {
          id: "look-about",
          act: "Drag the chart to look about it. Or click it, and use the arrow keys.",
          see: "The sheet slides under your hand. On the keys, + and − come nearer and stand off, and 0 shows the whole sheet.",
          at: AT,
          words: [aria("#map-viewport", "Interactive map. Arrow keys pan, plus and minus keys zoom, 0 resets, hold L for the loupe.")],
        },
        {
          id: "anew",
          act: "Keep pressing {Draw nearer} until the chart is drafted anew.",
          see: "A finer survey of that ground is drawn over the chart, with one corner turned up at its top right.",
          at: AT,
          words: [aria("#zoom-in", "Draw nearer")],
        },
        {
          id: "hold",
          act: "Press {Hold the sheet}, the anchor.",
          see: "The Glass drafts no finer survey and takes nothing away while it is lit, so the sheet you have stays put; the caption ends held.",
          at: SURVEYED,
          words: [aria("#zoom-hold", "Hold the sheet")],
          provisional: "the hold's glyph, seat, name, caption mark and ceiling (handbook/specs/ui-design.md, the Surveyor's Glass)",
        },
        {
          id: "loupe",
          act: "Press {The loupe}, or hold the L key with the chart in hand.",
          see: "Move the pointer over the chart: a round lens magnifies whatever lies under it.",
          at: SURVEYED,
          words: [aria("#zoom-loupe", "The loupe")],
          provisional: "the loupe's glyph, seat, name, key, size, power, rings and touch form (handbook/specs/ui-design.md, the Surveyor's Glass)",
        },
        {
          id: "stand-off",
          act: "Press {Stand off} to step back, or {The whole sheet} to see it all again.",
          see: "The chart draws back to the whole sheet.",
          at: SURVEYED,
          words: [aria("#zoom-out", "Stand off"), aria("#zoom-reset", "The whole sheet")],
        },
        {
          id: "in-hand",
          act: "On a tablet, press {The chart in hand}, the pointing hand, before you pinch.",
          see: "Until it is lit, a pinch zooms the page; once it is lit, your fingers move the chart.",
          at: AT,
          words: [{ ...aria("#zoom-touch", "The chart in hand"), state: "hidden" }],
          provisional: "the manicule's glyph, seat, lit dress and name (handbook/specs/ui-design.md, the Surveyor's Glass)",
          only: "touch",
        },
      ],
    },
    {
      id: "places",
      title: "Places on the chart",
      gloss: "every town opens a card",
      steps: [
        {
          id: "card",
          act: "Click {Laukuwelua}, the capital.",
          see: "Its card opens: when it was founded, the name it once had, and a word of its tongue.",
          at: AT,
          words: [{ css: '.place-hit[data-idx="0"]', says: "Laukuwelua", read: "aria", from: "script", match: "starts" }],
        },
        {
          id: "view-prospect",
          act: "On the card, press {View the prospect}.",
          see: "The Prospect opens: the town engraved side-on, from its own ground.",
          at: AT,
          first: [card],
          words: [{ css: "#place-card .pc-prospect", says: "View the prospect", read: "text", from: "script" }],
        },
        {
          id: "take-road",
          act: "Or press {Take the road}.",
          see: "The Wayfarer's Ribbon unrolls the road from the town.",
          at: AT,
          first: [card],
          words: [{ css: "#place-card .pc-ribbon", says: "Take the road", read: "text", from: "script" }],
        },
        {
          id: "lay-prospect",
          act: "Or press {Lay the prospect on the table}.",
          see: "The town's prospect is laid on the Chart Table, in the Drawer.",
          at: AT,
          first: [card],
          words: [{ css: "#place-card .pc-lay", says: "Lay the prospect on the table", read: "text", from: "script", constant: "LAY_ON_CARD in src/site/shared/living-chart/place-overlay-card.ts" }],
        },
      ],
    },
    {
      id: "press",
      title: "The Press",
      gloss: "what the sheet can do next, under the chart",
      steps: [
        {
          id: "verso",
          act: "Press {Turn The Sheet}.",
          see: "The chart turns over to its back: the docket, the surveyor's attribution and the office stamp. The press now reads Turn Back, to bring it round again.",
          at: AT,
          words: [road("#verso-turn", "Turn The Sheet")],
        },
        {
          id: "to-print",
          act: "Press {Take to The Print Room} to take this world home.",
          see: "The Print Room opens with your world on its desk.",
          at: AT,
          words: [road("#order-plates", "Take to The Print Room")],
        },
        {
          id: "to-journal",
          act: "Press {Read the journal in The Reading Room} to watch it live.",
          see: "The Reading Room opens on the same world.",
          at: AT,
          words: [road("#journal-link", "Read the journal in The Reading Room")],
        },
      ],
    },
    {
      id: "table",
      title: "The Chart Table",
      gloss: "the sheets you gather, in the Drawer at the right edge",
      steps: [
        {
          id: "dog-ear",
          act: "Draw nearer until the chart is drafted anew, then press the survey's turned-up corner.",
          see: "The survey is laid on the Chart Table, and the Drawer's tab counts it.",
          at: SURVEYED,
          first: [{ kind: "wait", css: "#map .region-inset .dog-ear" }],
          words: [aria("#map .region-inset .dog-ear", "lay this survey on the table", "script")],
        },
        {
          id: "drawer",
          act: "Press {The Drawer} at the right edge.",
          see: "The Chart Table slides out with your sheets on it. It holds up to six.",
          at: LAID,
          words: [{ css: "#chart-drawer-tab", says: "The Drawer", read: "text", from: "markup", match: "starts" }],
        },
        {
          id: "to-portfolio",
          act: "Press {Take the table to The Portfolio}.",
          see: "The Portfolio opens with every sheet you laid, ready to take home.",
          at: LAID,
          first: [{ kind: "click", css: "#chart-drawer-tab" }],
          words: [road("#table-road", "Take the table to The Portfolio")],
        },
        {
          id: "commission",
          act: "Your commission: a polar archipelago of about forty islands, of every size, in the nautical style with its arms. Lay one survey of it on the table.",
          see: "Then copy the address from the bar. Whoever opens it sees your world, drawn the same, line for line.",
          at: "/explorer/#seed=42&style=nautical&type=archipelago&band=polar&arms=1&islands=40&isleSize=varied",
          words: [option("type", "archipelago"), option("band", "polar"), option("style", "nautical")],
          kind: "commission",
        },
      ],
    },
  ],
};
