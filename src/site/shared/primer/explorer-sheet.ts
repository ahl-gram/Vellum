import { LAY_ON_CARD } from "../../explorer/chart-drawer.ts";
import { TABLE_CAP } from "../table-address.ts";
import { aria, click, option, road, text, wait, type Act, type Lesson, type Words } from "./shape.ts";

export const AT = "/explorer/#seed=42";
const SURVEYED = "/explorer/#seed=42&cx=0.5000&cy=0.5000&k=1.9600";
const LAID = `${SURVEYED}&table=k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-8.ly-8`;
const DOG_EAR = "#map .region-inset .dog-ear";
const COUNT = ["no", "one", "two", "three", "four", "five", "six"] as const;
const countWord = (n: number): string => COUNT[n] ?? String(n);

export const chart = (attr: string, says: string): Words => ({
  css: "#map > svg[data-vellum-style]",
  says,
  read: "attr",
  attr,
});
const pressed = (css: string): Words => ({ css, says: "true", read: "attr", attr: "aria-pressed" });
const card: Act = click('.place-hit[data-idx="0"]');

export const SHEET_LESSONS: readonly Lesson[] = [
  {
    id: "glass",
    title: "The Surveyor's Glass",
    gloss: "the presses at the chart's bottom right corner",
    steps: [
      {
        id: "explorer-nearer",
        act: "Press {Draw nearer}, the + by the chart.",
        see: "The chart comes closer.",
        at: AT,
        words: [aria("#zoom-in", "Draw nearer")],
        do: [click("#zoom-in")],
      },
      {
        id: "explorer-look-about",
        act: "Drag the chart to look about it. Or click it, and use the arrow keys.",
        see: "The sheet slides under your hand. On the keys, + and − come nearer and stand off, and 0 shows the whole sheet.",
        at: AT,
        words: [],
        relies: [
          aria(
            "#map-viewport",
            "Interactive map. Arrow keys pan, plus and minus keys zoom, 0 resets, hold L for the loupe.",
          ),
        ],
        do: [click("#zoom-in"), { kind: "key", css: "#map-viewport", key: "ArrowRight" }],
      },
      {
        id: "explorer-anew",
        act: "Keep pressing {Draw nearer} until the chart is drafted anew.",
        see: "A finer survey of that ground is drawn over the chart, with one corner turned up at its top right.",
        at: AT,
        words: [aria("#zoom-in", "Draw nearer")],
        do: [{ kind: "repeat", css: "#zoom-in", until: DOG_EAR }],
        then: [aria(DOG_EAR, "lay this survey on the table")],
      },
      {
        id: "explorer-hold",
        act: "Press {Hold the sheet}, the anchor.",
        see: "The Glass drafts no finer survey and takes nothing away while it is lit, so the sheet you have stays put; the caption ends held.",
        at: SURVEYED,
        words: [aria("#zoom-hold", "Hold the sheet")],
        do: [wait("#map .region-inset"), click("#zoom-hold")],
        then: [pressed("#zoom-hold"), text("#caption", "held", "contains")],
      },
      {
        id: "explorer-loupe",
        act: "Press {The loupe}, or hold the L key with the chart in hand.",
        see: "Move the pointer over the chart: a round lens magnifies whatever lies under it.",
        at: SURVEYED,
        words: [aria("#zoom-loupe", "The loupe")],
        do: [wait("#map .region-inset"), click("#zoom-loupe")],
        then: [pressed("#zoom-loupe")],
      },
      {
        id: "explorer-stand-off",
        act: "Press {Stand off} to step back, or {The whole sheet} to see it all again.",
        see: "The chart draws back to the whole sheet.",
        at: SURVEYED,
        words: [aria("#zoom-out", "Stand off"), aria("#zoom-reset", "The whole sheet")],
        do: [click("#zoom-reset")],
      },
      {
        id: "explorer-in-hand",
        act: "On a tablet, press {The chart in hand}, the pointing hand, before you pinch.",
        see: "Until it is lit, a pinch zooms the page; once it is lit, your fingers move the chart.",
        at: AT,
        words: [aria("#zoom-touch", "The chart in hand")],
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
        id: "explorer-card",
        act: "Click {Laukuwelua}, the capital.",
        see: "Its card opens: when it was founded, the name it once had, and a word of its tongue.",
        at: AT,
        words: [{ ...aria('.place-hit[data-idx="0"]', "Laukuwelua"), match: "starts" }],
        do: [card],
        then: [text("#place-card .pc-name", "Laukuwelua")],
      },
      {
        id: "explorer-view-prospect",
        act: "On the card, press {View the prospect}.",
        see: "The Prospect opens: the town engraved side-on, from its own ground.",
        at: AT,
        first: [card],
        words: [text("#place-card .pc-prospect", "View the prospect")],
      },
      {
        id: "explorer-take-road",
        act: "Or press {Take the road}.",
        see: "The Wayfarer's Ribbon unrolls the road from the town.",
        at: AT,
        first: [card],
        words: [text("#place-card .pc-ribbon", "Take the road")],
      },
      {
        id: "explorer-lay-prospect",
        act: `Or press {${LAY_ON_CARD}}.`,
        see: "The town's prospect is laid on the Chart Table, in the Drawer.",
        at: AT,
        first: [card],
        words: [text("#place-card .pc-lay", LAY_ON_CARD)],
      },
    ],
  },
  {
    id: "press",
    title: "The Press",
    gloss: "what the sheet can do next, under the chart",
    steps: [
      {
        id: "explorer-verso",
        act: "Press {Turn The Sheet}.",
        see: "The chart turns over to its back: the docket, the surveyor's attribution and the office stamp. The press now reads Turn Back, to bring it round again.",
        at: AT,
        words: [road("#verso-turn", "Turn The Sheet")],
        do: [click("#verso-turn")],
      },
      {
        id: "explorer-to-print",
        act: "Press {Take to The Print Room} to take this world home.",
        see: "The Print Room opens with your world on its desk.",
        at: AT,
        words: [road("#order-plates", "Take to The Print Room")],
      },
      {
        id: "explorer-to-journal",
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
        id: "explorer-dog-ear",
        act: "Draw nearer until the chart is drafted anew, then press the survey's turned-up corner.",
        see: "The survey is laid on the Chart Table, and the Drawer's tab counts it.",
        at: SURVEYED,
        first: [wait(DOG_EAR)],
        words: [],
        relies: [aria(DOG_EAR, "lay this survey on the table")],
        do: [click(DOG_EAR)],
        then: [text("#chart-drawer-tab", "The Drawer · one sheet", "starts")],
      },
      {
        id: "explorer-drawer",
        act: "Press {The Drawer} at the right edge.",
        see: `The Chart Table slides out with your sheets on it. It holds up to ${countWord(TABLE_CAP)}.`,
        at: LAID,
        words: [text("#chart-drawer-tab", "The Drawer", "starts")],
        do: [click("#chart-drawer-tab")],
        then: [text("#chart-drawer-count", "one sheet laid", "starts")],
      },
      {
        id: "explorer-to-portfolio",
        act: "Press {Take the table to The Portfolio}.",
        see: "The Portfolio opens with every sheet you laid, ready to take home.",
        at: LAID,
        first: [click("#chart-drawer-tab")],
        words: [road("#table-road", "Take the table to The Portfolio")],
      },
      {
        id: "explorer-commission",
        act: "Your commission: a polar archipelago of about forty islands, of every size, in the nautical style with its arms. Lay one survey of it on the table.",
        see: "Then copy the address from the bar. Whoever opens it sees your world, drawn the same, line for line.",
        at: "/explorer/#seed=42&style=nautical&type=archipelago&band=polar&arms=1&islands=40&isleSize=varied",
        words: [],
        relies: [option("#type", "archipelago"), option("#band", "polar"), option("#style", "nautical")],
        then: [
          chart("data-vellum-map-type", "archipelago"),
          chart("data-vellum-band", "polar"),
          chart("data-vellum-style", "nautical"),
          chart("data-vellum-islands", "40"),
        ],
        kind: "commission",
      },
    ],
  },
];
