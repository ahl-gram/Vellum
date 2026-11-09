// Issue #1155 round: every other room's ladder, the subrooms (the Prospect, the Ribbon, the Portfolio) included, each word quoted as the built page shows it at 089881ad (measure/inventory.md).
import type { Act } from "../drive.ts";
import type { Ladder, Words } from "./shape.ts";

const road = (css: string, says: string, from: "markup" | "script" = "markup"): Words => ({ css, says, read: "road", from });
const text = (css: string, says: string, from: "markup" | "script" = "markup"): Words => ({ css, says, read: "text", from });
const aria = (css: string, says: string, from: "markup" | "script" = "markup"): Words => ({ css, says, read: "aria", from });
const write = (sentence: string): Act => ({
  kind: "eval",
  js: `{const t=document.getElementById("wr-line");t.value=${JSON.stringify(sentence)};t.dispatchEvent(new Event("input",{bubbles:true}));document.querySelector("#wr-form button[type=submit]").click();for(let j=0;j<8;j++)await tick();await until("founded",settled);for(let j=0;j<6;j++)await tick();}`,
});
const forget: Act = { kind: "eval", js: `{localStorage.clear();sessionStorage.clear();}` };

export const SENTENCE = "a polar archipelago of twenty islands";
const TWO_SHEETS = "table=k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-8.ly-8_k-p.seed-42.i-0.style-antique";

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
          id: "write",
          act: `In {the founding sentence} box, write "${SENTENCE}", then press {Found}.`,
          see: "A world is founded from your words, and the account below says what each word did.",
          at: "/writing-room/",
          words: [aria("#wr-line", "the founding sentence"), text("#wr-form button[type=submit]", "Found")],
        },
        {
          id: "your-word",
          act: "Add your own name to the end of the sentence, and press {Found} again.",
          see: "Your name is not on the list, so it changes only the chart number: another polar archipelago of about twenty islands.",
          at: "/writing-room/",
          first: [write(SENTENCE)],
          words: [text("#wr-form button[type=submit]", "Found")],
          kind: "play",
        },
        {
          id: "shape-of",
          act: 'Write "an island in the shape of Japan", and press {Found}.',
          see: "The land is drawn in Japan's outline.",
          at: "/writing-room/",
          words: [text("#wr-form button[type=submit]", "Found")],
        },
        {
          id: "plate",
          act: "Press {Lay on The Vegetation Plate}.",
          see: "The plants are laid over the land; the press now reads Lift, to take them off.",
          at: "/writing-room/",
          first: [write(SENTENCE)],
          words: [road("#wr-plate", "Lay on The Vegetation Plate")],
        },
        {
          id: "explore-it",
          act: "Press {Explore it in The Explorer}.",
          see: "Your world opens in the Explorer, its Land and Strand held by your sentence: to change them, write it anew in the Writing Room.",
          at: "/writing-room/",
          first: [write(SENTENCE)],
          words: [road("#wr-explorer", "Explore it in The Explorer")],
        },
        {
          id: "commission",
          act: "Your commission: write a sentence for a world you would like to visit, and send its link to a friend.",
          see: "The same sentence founds the same world, forever.",
          at: "/writing-room/",
          words: [aria("#wr-line", "the founding sentence")],
          kind: "commission",
        },
      ],
    },
  ],
};

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
          id: "play",
          act: "Press {Play}.",
          see: "The survey ship sails first, day by day; then the years turn, and towns rise and fall. With motion turned off on your computer, Play goes straight to the last year.",
          at: "/reading-room/#seed=42",
          words: [text(".rf-play", "Play", "script")],
        },
        {
          id: "pace",
          act: "Press {2×} or {4×} to hurry it.",
          see: "The voyage and the years run twice or four times as fast. With motion turned off there is no pace to choose, since Play is a still frame.",
          at: "/reading-room/#seed=42",
          only: "motion",
          words: [text(".rf-pace button:nth-child(2)", "2×", "script"), text(".rf-pace button:nth-child(3)", "4×", "script")],
        },
        {
          id: "ages",
          act: "Drag {The ages} to any year.",
          see: "The chart shows the world as it stood that year, and the line under it tells what happened then.",
          at: "/reading-room/#seed=42",
          words: [aria(".rf-range", "The ages", "script")],
        },
        {
          id: "journal",
          act: "Read {The Journal} at the right.",
          see: "Each line is a day of the survey, or a year of the ages.",
          at: "/reading-room/#seed=42",
          words: [text("#journal-title", "The Journal")],
        },
        {
          id: "this-road",
          act: "On a road leg's row in the Journal, press {Take this road} once the voyage has reached it.",
          see: "It asks Leave the voyage? first; then the Wayfarer's Ribbon unrolls that road.",
          at: "/reading-room/#seed=42",
          words: [{ css: ".journal-dock .cr-road .cr-road-label", says: "Take this road", read: "text", from: "script", constant: "ROAD_TAKE in src/site/shared/living-chart/voyage-log-panel.ts" }],
          provisional: "the journal press's gold dress, its line, its pale wait and its spoken note (handbook/specs/ui-design.md, The voice)",
        },
        {
          id: "read",
          act: "Type a seed and press {Read}, or press {⚄}.",
          see: "Another world sits down to be read.",
          at: "/reading-room/#seed=42",
          words: [text(".rr-read", "Read"), text(".rr-dice", "⚄")],
          kind: "play",
        },
      ],
    },
  ],
};

export const PRINT_ROOM: Ladder = {
  route: "/print-room/",
  what: "The Print Room takes a world home: a proof on the desk, a bound atlas of every plate, and posters at four sizes.",
  lessons: [
    {
      id: "proof",
      title: "A proof on the desk",
      gloss: "the seed, the style and Pull a proof, at the top right",
      steps: [
        {
          id: "pull",
          act: "Type 42 and press {Pull a proof}.",
          see: "The Isle of Rahai comes onto the desk as a proof.",
          at: "/print-room/",
          words: [text("#pr-draw", "Pull a proof")],
        },
        {
          id: "style",
          act: "Choose {ink} beside it, and pull again.",
          see: "The proof is pulled again in pen and ink.",
          at: "/print-room/#seed=42",
          words: [{ css: "#pr-style", says: "ink", read: "option", from: "markup" }],
        },
      ],
    },
    {
      id: "atlas",
      title: "The Bound Atlas",
      gloss: "the whole atlas, on the sheet at the right",
      steps: [
        {
          id: "bind",
          act: "Press {Bind the atlas}.",
          see: "In a few seconds every plate is bound from the proof: the chart in every manner, the thematic surveys, the close-ups, the prospect, the road, the banners, the chronicle and the gazetteer.",
          at: "/print-room/#seed=42",
          words: [text("#pr-bind", "Bind the atlas")],
        },
        {
          id: "turn",
          act: "In the Contents, press a thumbnail.",
          see: "The sheet on the desk turns to that plate.",
          at: "/print-room/#seed=42",
          first: [{ kind: "click", css: "#pr-bind" }, { kind: "ticks", n: 40 }],
          words: [text(".turn-gloss", "a thumbnail turns the sheet")],
        },
        {
          id: "keep",
          act: "Press {Print} to save the atlas as a PDF, or {Download} for one file that opens offline.",
          see: "Print opens your browser's own Save as PDF, one plate to a page.",
          at: "/print-room/#seed=42",
          first: [{ kind: "click", css: "#pr-bind" }, { kind: "ticks", n: 40 }],
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
          id: "impression",
          act: "Choose {An impression (PNG)}, then press {Desk}.",
          see: "The chart is pressed as a picture 2400 pixels wide, and saved.",
          at: "/print-room/#seed=42",
          words: [{ css: "#pr-format", says: "An impression (PNG)", read: "option", from: "markup" }, text('[data-poster="desk"] .room', "Desk")],
        },
        {
          id: "road-plate",
          act: "Choose {The road from the capital} from the first list; the first press now reads {Ribbon}: press it.",
          see: "The road from Laukuwelua is pressed as a plate of its own.",
          at: "/print-room/#seed=42",
          first: [{ kind: "set", css: "#pr-pressing", value: "road" }, { kind: "ticks", n: 20 }],
          words: [{ css: "#pr-pressing", says: "The road from the capital", read: "option", from: "markup" }, text('[data-poster="ribbon"] .room', "Ribbon", "script")],
        },
        {
          id: "back",
          act: "Press {Back to The Explorer}.",
          see: "The Explorer opens on the same world.",
          at: "/print-room/#seed=42",
          words: [road("#pr-explorer", "Back to The Explorer")],
        },
      ],
    },
  ],
};

export const PROSPECT: Ladder = {
  route: "/prospect/",
  what: "The Prospect is the second camera: one town engraved side-on from its own ground, the way the old printers drew a city.",
  entered: "from a town's card in the Explorer (View the prospect), from a town's row on the Ribbon, or from the Reading Room",
  lessons: [
    {
      id: "plate",
      title: "A town, engraved",
      gloss: "the plate, and The Engraver's Note at the right",
      steps: [
        {
          id: "enter",
          act: "In the Explorer, click a town and press {View the prospect}.",
          see: "The Prospect opens on that town.",
          at: "/explorer/#seed=42",
          first: [{ kind: "eval", js: `{const h=document.querySelector('.place-hit[data-idx="0"]');h.focus();h.click();for(let j=0;j<8;j++)await tick();}` }],
          words: [text("#place-card .pc-prospect", "View the prospect", "script")],
        },
        {
          id: "note",
          act: "Read {The engraver's note}.",
          see: "What the town is, a line of its story, and the key to the numbers on the plate.",
          at: "/prospect/#seed=42&i=0",
          words: [text("#note .card-verb", "The engraver's note")],
        },
        {
          id: "year",
          act: "Type an earlier year, 300, in {viewed in the year}, and press {Engrave}.",
          see: "Laukuwelua was founded in 451, so the plate shows its ground before the town rose.",
          at: "/prospect/#seed=42&i=0",
          words: [text(".year-label", "viewed in the year"), text("#pp-engrave", "Engrave")],
        },
        {
          id: "lay",
          act: "Press {Lay this prospect on the table}.",
          see: "It joins the Chart Table, to be taken home in the Portfolio.",
          at: "/prospect/#seed=42&i=0",
          first: [forget],
          words: [text("#pp-lay", "Lay this prospect on the table")],
        },
        {
          id: "road",
          act: "Press {Take the road from Laukuwelua in The Wayfarer's Ribbon}.",
          see: "The Ribbon unrolls the road setting out from this town.",
          at: "/prospect/#seed=42&i=0",
          words: [road("#pp-ribbon-link", "Take the road from Laukuwelua in The Wayfarer's Ribbon")],
        },
      ],
    },
  ],
};

export const RIBBON: Ladder = {
  route: "/ribbon/",
  what: "The Wayfarer's Ribbon unrolls one road as an itinerary: the way drawn league by league up a strip of paper, with a compass turning to keep north true.",
  entered: "from a town's card in the Explorer (Take the road), from the Prospect, or from a road's row in the Reading Room's Journal",
  lessons: [
    {
      id: "road",
      title: "A road, unrolled",
      gloss: "the journey at the top right, and The Itinerary below it",
      steps: [
        {
          id: "enter",
          act: "In the Explorer, click a town and press {Take the road}.",
          see: "The road from that town is unrolled strip by strip, each one inked in after the last. With motion turned off, it is all there at once.",
          at: "/explorer/#seed=42",
          first: [{ kind: "eval", js: `{const h=document.querySelector('.place-hit[data-idx="0"]');h.focus();h.click();for(let j=0;j<8;j++)await tick();}` }],
          words: [text("#place-card .pc-ribbon", "Take the road", "script")],
          provisional: "the ink-in's pace and the height of each strip's soft edge (Issue #1229)",
        },
        {
          id: "bound-for",
          act: "Choose another town from {bound for}.",
          see: "The road to it is unrolled anew.",
          at: "/ribbon/#seed=42&a=0",
          words: [aria("#rb-to", "bound for")],
        },
        {
          id: "turn-about",
          act: "Press {Turn about}.",
          see: "The road runs the other way: where you were bound, you now set out from.",
          at: "/ribbon/#seed=42&a=0",
          words: [text("#rb-swap", "Turn about")],
        },
        {
          id: "lean",
          act: "Press a row of the itinerary.",
          see: "The Glass leans on that stretch of the road, and the chart comes nearer there.",
          at: "/ribbon/#seed=42&a=0",
          words: [text("#itinerary .row-gloss", "A row leans the Glass on that stretch of the road."), { css: "#rb-itinerary .lean", says: "Lean the Glass on this stretch", read: "title", from: "script" }],
        },
        {
          id: "pill",
          act: "Press {prospect} on a town's row.",
          see: "That town's prospect opens.",
          at: "/ribbon/#seed=42&a=0",
          words: [text("#rb-itinerary .row-prospect", "prospect", "script")],
        },
        {
          id: "end",
          act: "Press {See Homaitani in The Prospect}, the road out to the road's end.",
          see: "The Prospect of the town the road is bound for.",
          at: "/ribbon/#seed=42&a=0",
          words: [road("#rb-prospect-link", "See Homaitani in The Prospect", "script")],
        },
      ],
    },
  ],
};

export const PORTFOLIO: Ladder = {
  route: "/explorer/portfolio/",
  what: "The Portfolio is where the sheets you laid on the Chart Table are taken home, each drafted again from the number in its margin.",
  entered: "from the Drawer in the Explorer (Take the table to The Portfolio), or from the Print Room's note",
  lessons: [
    {
      id: "gather",
      title: "Gather, then take home",
      gloss: "the Explorer's Drawer, then this room",
      steps: [
        {
          id: "bare",
          act: "Open the Portfolio with nothing gathered.",
          see: "A plate shows the way in three steps: at the Explorer, on the Table, in the Portfolio.",
          at: "/explorer/portfolio/",
          first: [forget, { kind: "eval", js: `location.reload();` }],
          words: [text("#pf-sheet .how-plate .p-head, #pf-sheet .p-head", "i · At the Explorer", "script")],
        },
        {
          id: "turn-down",
          act: "In the Explorer, draw nearer until the chart is drafted anew, and press the survey's turned-up corner.",
          see: "The survey is laid on the Chart Table. Lay up to six; the Drawer says when there is no room for more.",
          at: "/explorer/#seed=42&cx=0.5000&cy=0.5000&k=1.9600",
          first: [{ kind: "wait", css: "#map .region-inset .dog-ear" }],
          words: [aria("#map .region-inset .dog-ear", "lay this survey on the table", "script")],
        },
        {
          id: "take",
          act: "Open {The Drawer} and press {Take the table to The Portfolio}.",
          see: "Every sheet you laid comes here, drafted again from its number.",
          at: "/explorer/#seed=42&cx=0.5000&cy=0.5000&k=1.9600&table=k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-8.ly-8",
          first: [{ kind: "click", css: "#chart-drawer-tab" }],
          words: [road("#table-road", "Take the table to The Portfolio")],
        },
        {
          id: "next",
          act: "Press {Bring up The Next Sheet}.",
          see: "The next sheet comes to the top of the pile.",
          at: `/explorer/portfolio/#${TWO_SHEETS}`,
          words: [road("#pf-next", "Bring up The Next Sheet")],
        },
        {
          id: "download",
          act: "Press {Download The Engraving}.",
          see: "The sheet on top is saved as the engraving, an SVG that is exact at any size.",
          at: `/explorer/portfolio/#${TWO_SHEETS}`,
          words: [road("#pf-download", "Download The Engraving")],
        },
        {
          id: "keep",
          act: "Copy the address from the bar.",
          see: "The table rides in the address, so the link keeps the gathering.",
          at: `/explorer/portfolio/#${TWO_SHEETS}`,
          words: [road("#pf-explorer", "Back to The Explorer")],
          kind: "play",
        },
      ],
    },
  ],
};

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
          id: "notes",
          act: "Read the survey notes on {The Daily Hunt}.",
          see: "A few lines describe one forgotten place on today's chart. Everyone hunting today looks for the same place.",
          at: "/seed-of-the-day/",
          words: [text("#hunt-title", "The Daily Hunt")],
        },
        {
          id: "sound",
          act: "Click the chart where you think it hides.",
          see: "A miss leaves a sounding where you clicked, and a line tells how near you came: hot, warmer, cool or cold.",
          at: "/seed-of-the-day/",
          words: [text("#hunt .hunt-intro", "One forgotten place hides on today's chart. Read the survey notes, then click the map to find it. Everyone hunting today's seed is looking for the same place.")],
        },
        {
          id: "share",
          act: "When you find it, press {Share your find}.",
          see: "A star is stamped on the place and its story unrolls; the press sends your result, or copies it.",
          at: "/seed-of-the-day/",
          words: [{ css: "#share", says: "Share your find", read: "text", from: "markup", state: "hidden" }],
        },
        {
          id: "dispatch",
          act: "Press {Draft dispatch}.",
          see: "Your hunt, every sounding and the star, drawn onto the chart for you to keep.",
          at: "/seed-of-the-day/",
          words: [{ css: "#dispatch", says: "Draft dispatch", read: "text", from: "markup", state: "hidden" }],
        },
        {
          id: "to-explorer",
          act: "Press {Open today's seed in The Explorer}.",
          see: "Today's world, with every control of the Explorer. Come back tomorrow for a new one.",
          at: "/seed-of-the-day/",
          words: [road('[data-road="explorer"], .legend-btn[href*="explorer"]', "Open today's seed in The Explorer")],
        },
      ],
    },
  ],
};

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
          id: "look",
          act: "Read the line under a plate.",
          see: "Its name, its seed, its kind of land and its climate.",
          at: "/gallery/",
          words: [{ css: ".grid figure figcaption span", says: "seed 100", read: "text", from: "markup", match: "starts" }],
        },
        {
          id: "open",
          act: "Press any plate that catches your eye.",
          see: "Its world opens in the Explorer, at its own seed.",
          at: "/gallery/",
          words: [{ css: ".legend .legend-head, .legend-head", says: "every plate is a road into its own world", read: "text", from: "markup" }],
          kind: "play",
        },
      ],
    },
  ],
};
