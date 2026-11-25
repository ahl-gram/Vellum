// Issue #1248 round, item 7: the alternatives offered for every line Sub 3's data carries that nobody has ruled (Alex, 2026-11-09, Issue #1249 comment 6752893639, "B1: at the seats round"): each lesson's under-line, each comfort line, each commission's target. (a) is always the line as the Issue #1155 round wrote it. A line marked `quoted` is a room's own words, already on its page (`grep -rlF` over `src/` finds it there). Every alternative names only controls and outcomes the room has; none is a fact for flavour.
export type GlossRow = { readonly key: string; readonly room: string; readonly lesson: string; readonly a: string; readonly quoted: boolean; readonly b: string; readonly c: string };
export const GLOSSES: readonly GlossRow[] = [
  { key: "explorer-number", room: "The Explorer", lesson: "A world from a number", a: "the seed box, the dice and Draw, at the top right", quoted: false, b: "the seed box, the dice and Draw, at the top right", c: "a whole world from a single number" },
  { key: "explorer-land", room: "The Explorer", lesson: "The Land", a: "these shape the world itself", quoted: true, b: "the Broadside's first group, at the right", c: "these shape the world itself" },
  { key: "explorer-strand", room: "The Explorer", lesson: "The Strand", a: "these set the water's edge", quoted: true, b: "the Broadside's second group", c: "these set the water's edge" },
  { key: "explorer-hand", room: "The Explorer", lesson: "The Hand", a: "these dress the same world", quoted: true, b: "the Broadside's last group", c: "these dress the same world" },
  { key: "explorer-glass", room: "The Explorer", lesson: "The Surveyor's Glass", a: "the presses at the chart's bottom right corner", quoted: false, b: "the presses at the chart's bottom right corner", c: "go nearer, and the chart is drafted anew" },
  { key: "explorer-places", room: "The Explorer", lesson: "Places on the chart", a: "every town opens a card", quoted: false, b: "the towns on the chart itself", c: "every town opens a card" },
  { key: "explorer-press", room: "The Explorer", lesson: "The Press", a: "what the sheet can do next, under the chart", quoted: false, b: "the presses under the chart", c: "take the sheet on to another room" },
  { key: "explorer-table", room: "The Explorer", lesson: "The Chart Table", a: "the sheets you gather, in the Drawer at the right edge", quoted: false, b: "the Drawer at the right edge", c: "gather sheets to take home" },
  { key: "prospect-plate", room: "The Prospect", lesson: "A town, engraved", a: "the plate, and The Engraver's Note at the right", quoted: false, b: "the plate, and The Engraver's Note at the right", c: "a town drawn as an engraving" },
  { key: "ribbon-road", room: "The Wayfarer's Ribbon", lesson: "A road, unrolled", a: "the journey at the top right, and The Itinerary below it", quoted: false, b: "the journey at the top right, and The Itinerary below it", c: "a road drawn as one long strip" },
  { key: "explorer-portfolio-gather", room: "The Portfolio", lesson: "Gather, then take home", a: "the Explorer's Drawer, then this room", quoted: false, b: "the Explorer's Drawer, then this room", c: "the sheets you gathered, to take home" },
  { key: "writing-room-found", room: "The Writing Room", lesson: "A world from a sentence", a: "the box on The Founding, at the right", quoted: false, b: "the box on The Founding, at the right", c: "a world founded from your own words" },
  { key: "reading-room-watch", room: "The Reading Room", lesson: "Watch a world live", a: "the instrument under the chart, and the Journal at the right", quoted: false, b: "the instrument under the chart, and the Journal at the right", c: "the survey sails, then the years turn" },
  { key: "print-room-proof", room: "The Print Room", lesson: "A proof on the desk", a: "the seed, the style and Pull a proof, at the top right", quoted: false, b: "the seed, the style and Pull a proof, at the top right", c: "any chart, pulled as a proof" },
  { key: "print-room-atlas", room: "The Print Room", lesson: "The Bound Atlas", a: "the whole atlas, on the sheet at the right", quoted: false, b: "the whole atlas, on the sheet at the right", c: "the whole world bound as one atlas" },
  { key: "print-room-posters", room: "The Print Room", lesson: "Posters", a: "the presses under the chart", quoted: false, b: "the presses under the chart", c: "a chart at a poster's size" },
  { key: "seed-of-the-day-hunt", room: "The Seed of the Day", lesson: "The Daily Hunt", a: "the notes at the right, and the chart", quoted: false, b: "the notes at the right, and the chart", c: "one world a day, and a place to find in it" },
  { key: "gallery-browse", room: "The Gallery", lesson: "Worlds hung for viewing", a: "every plate is a road into its own world", quoted: true, b: "the plates, and the road out at the foot", c: "every plate is a road into its own world" },
];

export type AsideRow = { readonly key: string; readonly room: string; readonly lesson: string; readonly a: string; readonly b: string };
export const ASIDES: readonly AsideRow[] = [
  { key: "explorer-land", room: "The Explorer", lesson: "The Land", a: "Every list starts at seed's choice: choose it again to hand the row back to the seed.", b: "Choose seed's choice again on any row to give it back to the seed." },
  { key: "explorer-strand", room: "The Explorer", lesson: "The Strand", a: "A row that cannot act on the world on screen waits in a held box, and the note under it says what holds it.", b: "A row that cannot change this world waits behind a dashed rule; the note under it says why." },
  { key: "explorer-hand", room: "The Explorer", lesson: "The Hand", a: "Nothing in the Hand changes the land: the same world, dressed another way.", b: "The Hand only dresses: the land stays exactly as it was." },
];

export type CommissionRow = { readonly key: string; readonly room: string; readonly a: string; readonly b: string; readonly c: string };
export const COMMISSIONS: readonly CommissionRow[] = [
  {
    key: "explorer-commission",
    room: "The Explorer",
    a: "Your commission: a polar archipelago of about forty islands, of every size, in the nautical style with its arms. Lay one survey of it on the table.",
    b: "Your commission: a tropical island with a lobed coast, in the topographic style, its sea beasts drawn. Lay one survey of it on the table.",
    c: "Your commission: a temperate continent with more land than sea, in the ink style with its arms. Lay one survey of it on the table.",
  },
  {
    key: "writing-room-commission",
    room: "The Writing Room",
    a: "Your commission: write a sentence for a world you would like to visit, and send its link to a friend.",
    b: "Your commission: write a sentence for an island from a story you love, and send its link to a friend.",
    c: "Your commission: write the shortest sentence you can that still founds an archipelago, and send its link to a friend.",
  },
];
