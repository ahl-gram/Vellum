import { parseTableValue } from "../../src/site/shared/table-address.ts";
import { faults, same, text } from "../built-dom.ts";

// Every control sits in its wiring-truth group (from e2e BR1).
export function br1Faults(doc: Document): string[] {
  const groupOf = (id: string): string | null => {
    const g = doc.getElementById(id)?.closest('[role="group"]');
    return g ? (g.getAttribute("aria-labelledby") ?? g.getAttribute("aria-label")) : null;
  };
  const want: Record<string, string> = {
    seed: "The seed",
    random: "The seed",
    draw: "The seed",
    type: "grp-land",
    band: "grp-land",
    land: "grp-strand",
    coast: "grp-strand",
    style: "grp-hand",
    theme: "grp-hand",
    legend: "grp-hand",
    arms: "grp-hand",
    ages: "grp-hand",
    "verso-turn": "grp-press",
    "order-plates": "grp-press",
    "journal-link": "grp-press",
  };
  const wrong = Object.entries(want)
    .filter(([id, g]) => groupOf(id) !== g)
    .map(([id]) => `${id}: ${groupOf(id)}`);
  const heads = ["grp-land", "grp-strand", "grp-hand", "grp-press"].map(
    (id) => doc.getElementById(id)?.textContent ?? null,
  );
  return faults([
    wrong.length === 0 || `controls outside their group: ${wrong.join(", ")}`,
    heads[0] === "The Land" || "the Land's head",
    heads[1] === "The Strand" || "the Strand's head",
    heads[2] === "The Hand" || "the Hand's head",
    /^The Press\b/.test(heads[3] ?? "") || "the Press's head",
  ]);
}

const SEALS = [
  ["check seal", "alike", "isle-equal", "radio"],
  ["check seal", "of every size", "isle-varied", "radio"],
  ["check seal", "legend", "legend", "checkbox"],
  ["check seal", "arms", "arms", "checkbox"],
  ["check seal", "beasts", "beasts", "checkbox"],
  ["check seal", "survey", "ages", "checkbox"],
];
const NOTES = ["broadside", "seeds-choice", "shape", "islands", "coast-warp", "survey", "verso"];
const NOTE_HEADS = [
  "of the broadside",
  "of the seed's choice",
  "of the shape",
  "of the islands",
  "of the coast warp",
  "of the survey",
  "of the verso",
];

// The Explorer as authored (from e2e BR9, which read it with scripts off), the groups in reading order included. Dropped with what only a running browser has: the Broadside slip's accessible name (its aria-labelledby stays asserted).
export function br9Faults(doc: Document): string[] {
  const id = (s: string) => doc.getElementById(s);
  const corner = doc.querySelector(".corner.tr.folio-room");
  const group = corner?.querySelector(":scope > .folio-controls") ?? null;
  const h1s = [...doc.querySelectorAll("h1")].map(
    (h) => (corner?.contains(h) ? "corner " : "") + h.className + ": " + text(h),
  );
  const groups = [...doc.querySelectorAll('[role="group"]')].map(
    (g) => g.getAttribute("aria-label") ?? g.getAttribute("aria-labelledby"),
  );
  const slip = doc.querySelector("aside.slip#broadside");
  const panels = slip ? [...slip.querySelectorAll(".slip-body > .broadside > .panel[role=group]")] : [];
  const ids = (p: Element | undefined) =>
    p ? [...p.querySelectorAll("input, select, button")].map((e) => e.id) : null;
  const nav = doc.querySelector("nav.legend");
  const head = nav?.querySelector(":scope > #grp-press") ?? null;
  const row = nav?.querySelector(":scope > .legend-row") ?? null;
  const turn = id("verso-turn");
  const road = (rid: string) => {
    const a = id(rid);
    return a ? [a.getAttribute("href"), text(a.querySelector(".verb")), text(a.querySelector(".room"))] : null;
  };
  const verso = id("verso");
  const glass = id("zoom-controls");
  const status = id("status");
  const vp = id("map-viewport");
  const map = id("map");
  return faults([
    same(h1s, ["corner room-name: The Explorer"]) || "the folio's one h1",
    text(corner?.querySelector(":scope > .room-tagline") ?? null) === "every seed is a world, draw one" ||
      "the tagline",
    same(group && [group.getAttribute("role"), group.getAttribute("aria-label")], ["group", "The seed"]) ||
      "the seed row's role and label",
    same(
      group
        ? [...group.children].map((e) => [e.tagName + "#" + e.id + "." + e.className, e.getAttribute("type")])
        : null,
      [
        ["INPUT#seed.control", "number"],
        ["BUTTON#random.dice", "button"],
        ["BUTTON#draw.primary", null],
      ],
    ) || "the seed, the dice and Draw, each its own kind",
    same(groups, ["The seed", "grp-land", "held", "grp-strand", "held", "grp-hand", "grp-press", "Camera"]) ||
      "the groups in reading order",
    slip?.id === "broadside" || "the slip is #broadside",
    same(
      panels.map((p) => p.getAttribute("aria-labelledby")),
      ["grp-land", "grp-strand", "grp-hand"],
    ) || "The Land, The Strand and The Hand ride the slip",
    same(ids(panels[0]), ["type", "band", "place", "islands", "isle-equal", "isle-varied"]) ||
      "The Land's controls in order",
    same(ids(panels[1]), ["land", "coast", "ragged", "looseness"]) || "The Strand's controls in order",
    same(ids(panels[2]), ["style", "theme", "legend", "arms", "beasts", "ages"]) || "The Hand's controls in order",
    same(
      slip
        ? [...slip.querySelectorAll(".seals > label")].map((l) => {
            const i = l.querySelector("input");
            return [
              l.className,
              (l.childNodes[0]?.textContent ?? "").trim(),
              i ? i.id : null,
              i ? i.getAttribute("type") : null,
            ];
          })
        : [],
      SEALS,
    ) || "the six seals, each wrapping its input",
    same(
      [...doc.querySelectorAll("a.fn")].map((a) => [
        a.getAttribute("href"),
        a.getAttribute("data-note"),
        a.getAttribute("title"),
      ]),
      NOTES.map((n) => [`/glossary/#${n}`, `note-${n}`, null]),
    ) || "the seven marks, the title's first",
    same(
      [...doc.querySelectorAll(".fn-note")].map((n) => {
        const a = n.querySelector("a");
        return [n.id, text(n.querySelector(".fn-head")), a ? a.getAttribute("href") : null];
      }),
      NOTES.map((n, i) => [`note-${n}`, NOTE_HEADS[i], `/glossary/#${n}`]),
    ) || "the seven notes, each head and its link",
    text(slip?.querySelector(".imprint") ?? null) === "Printed at the atelier, for Chart №" || "the printer's line",
    (head ? head.tagName + "." + head.className : null) === "P.legend-head" || "the Press's head",
    same(row && [row.getAttribute("role"), row.getAttribute("aria-labelledby")], ["group", "grp-press"]) ||
      "the legend row's role and label",
    same(
      row
        ? [...row.children].map(
            (e) => e.tagName + (e.id ? "#" + e.id : "") + (e.classList.length ? "." + [...e.classList].join(".") : ""),
          )
        : null,
      ["BUTTON#verso-turn.legend-btn", "A.fn", "A#order-plates.legend-btn.gold", "A#journal-link.legend-btn.gold"],
    ) || "Turn the sheet first, then the two gold roads",
    (turn ? turn.getAttribute("type") : null) === "button" || "Turn the sheet's type",
    same(["order-plates", "journal-link"].map(road), [
      ["../print-room/", "Take to", "The Print Room"],
      ["/reading-room/", "Read the journal in", "The Reading Room"],
    ]) || "the roads at their authored hrefs, verbs and rooms",
    doc.querySelectorAll(".action-link").length === 0 || "no retired action link",
    !!doc.querySelector(".stage > #sheet.sheet > #sheet-inner.sheet-inner > #map-viewport > #map.living-chart") ||
      "the stage's leaf, the gesture box inside it",
    (map ? map.childElementCount : null) === 0 || "the gesture box's empty map",
    same(
      verso && [
        verso.parentElement?.id ?? null,
        verso.previousElementSibling?.id ?? null,
        verso.getAttribute("aria-hidden"),
        verso.childElementCount,
      ],
      ["sheet-inner", "map-viewport", "true", 0],
    ) || "the hidden verso beside it",
    same(
      glass && [
        glass.className,
        glass.getAttribute("role"),
        !!vp?.contains(glass),
        [...glass.children].map((b) => [b.id, b.getAttribute("data-zoom")]),
      ],
      [
        "chrome corner br zoomery",
        "group",
        false,
        [
          ["zoom-touch", null],
          ["zoom-hold", null],
          ["zoom-loupe", null],
          ["zoom-in", "in"],
          ["zoom-out", "out"],
          ["zoom-reset", "fit"],
        ],
      ],
    ) || "the Glass outside the gesture box",
    same(
      status && [
        status.tagName + "." + status.className,
        status.getAttribute("role"),
        status.getAttribute("aria-live"),
        text(status),
        !!status.parentElement?.classList.contains("stage"),
      ],
      ["P.status", "status", "polite", "", true],
    ) || "the status pill, a live status in the stage",
    same(
      [...doc.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id, text(p)]),
      [
        ["folio-title", "folio-title", ""],
        ["folio-sub", "folio-sub", ""],
        ["folio-coords", "caption", ""],
      ],
    ) || "the chart folio's three empty lines",
  ]);
}

const SAMPLES: Record<string, string> = {
  style: "k-s.seed-42.style-VALUE.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
  type: "k-s.seed-42.type-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
  band: "k-s.seed-42.band-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
  theme: "k-s.seed-42.theme-VALUE.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-1.ly-1",
};

// Every value the style, type, climate and theme pickers offer is one the Chart Table's grammar files (from e2e BR11).
export function br11Faults(doc: Document): string[] {
  const out: string[] = [];
  for (const id of ["style", "type", "band", "theme"]) {
    const values = [...(doc.getElementById(id)?.querySelectorAll("option") ?? [])]
      .map((o) => o.getAttribute("value") ?? "")
      .filter((v) => v !== "");
    if (values.length === 0) out.push(`${id}: no options`);
    for (const v of values)
      if (parseTableValue(SAMPLES[id]!.replace("VALUE", v)).length !== 1) out.push(`${id}: ${v} refused`);
  }
  return out;
}

// The Portfolio's where-line ships promising the sheets gathered at the Explorer (from e2e CD55). Dropped with what only a running browser has: the script's bare voice written over it when nothing was gathered.
export function cd55Faults(doc: Document): string[] {
  const where = doc.querySelector("#portfolio .card-where")?.textContent ?? null;
  return where === "the sheets gathered at the Explorer" ? [] : [`the where-line reads ${JSON.stringify(where)}`];
}
