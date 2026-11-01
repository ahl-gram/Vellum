// The kit's shapes across the shelled rooms (Issue #779 part 2h): the sweep gathers one KIT_READ per route, and RH25 and RH32 judge it.
import { PAGE_RGBA } from "../../support/pixel.ts";
import type { makeStep } from "../../support/step.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { SHELLED } from "./reads.ts";
import type { RunningHeadKit } from "./kit.ts";
import { rh26Pill, rh27Roles, rh28Idiom } from "./dress.ts";
import { PORTFOLIO, PRINTED_READ, rh29Printed, rh30Ring, rh31Raise } from "./gestures.ts";

export type Skeleton = { kids: string[] | null; leaf: boolean; face: number | null };
export type Pill = { prop: string; ms: number; rest: string; faded: string; was: boolean; back: string } | null;
export type Role = {
  family: string;
  style: string;
  size: number;
  caps: string;
  spacing: number | null;
  weight: string;
  transform: string;
  color: number[];
  bg: number[];
  bw: string;
  bs: string;
  bc: number[];
  radius: string;
  width: number;
};
export type Kit = {
  fog: { items: (string | null | number)[][]; adjacent: boolean };
  vignettes: { items: (string | null | number)[][]; adjacent: boolean };
  glass: {
    classes: string[];
    id: string;
    role: string | null;
    label: string | null;
    presses: (string | null | number)[][];
  } | null;
  folio: { classes: string[]; lines: string[][] } | null;
  gesture: (string | null)[] | null;
  noscript: boolean;
  roads: (string | null | (string | null)[][])[][];
};
export type Printed = {
  dom: { offenders: string[][] } | null;
  walk: { sheets: number; unreadable: number; kitArms: number; offenders: string[][] };
};
export type KitSample = {
  skeleton: Skeleton;
  pill: Pill;
  roles: Record<string, Role>;
  rem: number;
  before: string | null;
  kit: Kit;
  printed: Printed | null;
};

const ROLE_SELECTORS = [
  "#seed-form button[type=submit]",
  "#seed-input",
  ".hunt-intro",
  "#dateline",
  ".folio-room .dateline",
  "#grp-land",
  "#grp-hand",
  ".find input[type=search]",
  "#type",
  "#sb-report",
];

export const KIT_READ: Payload<string> = `(() => { const rgba = ${PAGE_RGBA}, cs = (e) => getComputedStyle(e);
  const stage = document.querySelector(".stage"), map = document.querySelector(".stage > #sheet.sheet > #map-viewport > #map");
  const pillEl = document.querySelector(".stage > p.status"); let pill = null;
  if (pillEl) { const st = cs(pillEl), prop = st.transitionProperty, ms = parseFloat(st.transitionDuration) * 1000, was = pillEl.classList.contains("fading");
    pillEl.style.transition = "none"; const rest = cs(pillEl).opacity; pillEl.classList.add("fading"); const faded = cs(pillEl).opacity;
    pillEl.classList.toggle("fading", was); const back = cs(pillEl).opacity; pillEl.style.transition = ""; pill = { prop, ms, rest, faded, was, back }; }
  const roles = {};
  for (const sel of ${JSON.stringify(ROLE_SELECTORS)}) { const el = document.querySelector(sel); if (!el) continue; const st = cs(el);
    roles[sel] = { family: st.fontFamily, style: st.fontStyle, size: parseFloat(st.fontSize), caps: st.fontVariantCaps,
      spacing: st.letterSpacing === "normal" ? null : parseFloat(st.letterSpacing), weight: st.fontWeight, transform: st.textTransform,
      color: rgba(st.color), bg: rgba(st.backgroundColor), bw: st.borderTopWidth, bs: st.borderTopStyle, bc: rgba(st.borderTopColor),
      radius: st.borderTopLeftRadius, width: parseFloat(st.width) }; }
  const list = (sel) => [...document.querySelectorAll(sel)];
  const pair = (sel) => { const els = list(sel); return { items: els.map((e) => [e.tagName, e.className, e.getAttribute("aria-hidden"), e.childNodes.length]),
    adjacent: els.length === 2 && els[0].nextElementSibling === els[1] }; };
  const glassEl = document.querySelector(".zoomery"), folioEl = document.querySelector(".corner.bl"), corner = document.querySelector(".corner.tr");
  const vp = document.querySelector(".stage > #sheet.sheet > #map-viewport");
  return JSON.stringify({
    skeleton: stage ? { kids: [...stage.children].map((c) => c.tagName + (c.id ? "#" + c.id : "")),
      leaf: !!stage.querySelector("#sheet.sheet > #sheet-inner.sheet-inner > #map-viewport > #map"), face: map ? map.childElementCount : null }
      : { kids: null, leaf: false, face: null },
    pill, roles, rem: parseFloat(cs(document.documentElement).fontSize), before: corner ? getComputedStyle(corner, "::before").content : null,
    kit: { fog: pair(".fog"), vignettes: pair(".vignette"),
      glass: glassEl ? { classes: [...glassEl.classList], id: glassEl.id, role: glassEl.getAttribute("role"), label: glassEl.getAttribute("aria-label"),
        presses: [...glassEl.children].map((b) => [b.tagName, b.id, b.className, b.getAttribute("type"), b.getAttribute("data-zoom"),
          b.getAttribute("aria-label"), b.textContent.trim(), b.getAttribute("title"), b.querySelectorAll("svg").length]) } : null,
      folio: folioEl ? { classes: [...folioEl.classList],
        lines: [...folioEl.children].map((p) => [p.tagName, p.getAttributeNames().filter((n) => n !== "style").sort().join(","), p.id, p.classList[0] || ""]) } : null,
      gesture: vp ? [vp.getAttribute("tabindex"), vp.getAttribute("role"), vp.getAttribute("aria-label")] : null,
      noscript: !!document.querySelector(".stage > noscript"),
      roads: [...document.querySelectorAll("a.legend-btn")].map((a) => [a.id, [...a.classList], a.getAttribute("data-road"),
        new URL(a.getAttribute("href") || "", location.href).pathname, [...a.children].map((s) => [s.tagName, s.className, s.id])]) } });
})()`;

export async function kitRead(k: RunningHeadKit, route: string): Promise<KitSample> {
  const { send, evaluate } = k;
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  const screen = JSON.parse(await evaluate(KIT_READ)) as KitSample;
  let printed: Printed | null = null;
  if (route !== "/") {
    await send("Emulation.setEmulatedMedia", { media: "print" });
    try {
      printed = JSON.parse(await evaluate(PRINTED_READ)) as Printed;
    } finally {
      await send("Emulation.setEmulatedMedia", { media: "" });
    }
  }
  return { ...screen, printed };
}

export async function kitChecks(
  ctx: SuiteContext,
  step: ReturnType<typeof makeStep>,
  k: RunningHeadKit,
  kits: Record<string, KitSample | undefined>,
): Promise<void> {
  const { check } = ctx;
  const samples = { ...kits };
  samples[PORTFOLIO] = (await k.visit(PORTFOLIO)) ? await kitRead(k, PORTFOLIO) : undefined;
  const judge = (read: (c: SuiteContext["check"]) => void) => () => Promise.resolve(check).then(read);
  await step(
    "RH25",
    judge((c) => rh25Skeleton(c, samples)),
  );
  await step(
    "RH26",
    judge((c) => rh26Pill(c, samples)),
  );
  await step(
    "RH27",
    judge((c) => rh27Roles(c, samples)),
  );
  await step(
    "RH28",
    judge((c) => rh28Idiom(c, samples)),
  );
  await step(
    "RH29",
    judge((c) => rh29Printed(c, samples)),
  );
  await step("RH30", () => rh30Ring(k));
  await step("RH31", () => rh31Raise(k));
  await step(
    "RH32",
    judge((c) => rh32Kit(c, samples)),
  );
}

const PILLS: Record<string, string> = {
  "/print-room/": "P#pr-status",
  "/prospect/": "P#pp-status",
  "/ribbon/": "P#rb-status",
  "/specimen/": "P#sb-status",
  "/writing-room/": "P#status",
  [PORTFOLIO]: "P#pf-status",
};

export function rh25Skeleton(check: SuiteContext["check"], kits: Record<string, KitSample | undefined>): void {
  const wrong: string[] = [];
  const ex = kits["/explorer/"];
  if (!ex) wrong.push("/explorer/: unreachable");
  else if (!ex.skeleton.leaf) wrong.push("/explorer/: the sheet's leaf is gone");
  for (const [route, pill] of Object.entries(PILLS)) {
    const s = kits[route];
    if (!s) {
      wrong.push(`${route}: unreachable`);
      continue;
    }
    if (s.skeleton.face === null || s.skeleton.face < 1) wrong.push(`${route}: face ${s.skeleton.face}`);
    if (s.skeleton.kids?.[0] !== "DIV#sheet") wrong.push(`${route}: first child ${s.skeleton.kids?.[0]}`);
    if (s.skeleton.kids?.[1] !== pill) wrong.push(`${route}: second child ${s.skeleton.kids?.[1]}, want ${pill}`);
  }
  check(
    "RH25 the kit's stage stands one shape where a room takes it, and the Explorer's sheet keeps its leaf",
    wrong.length === 0,
    JSON.stringify(wrong),
  );
}

export const FOG_ROOMS = [...SHELLED.filter((r) => r !== "/"), PORTFOLIO];
export const CHART_ROOMS = [
  "/explorer/",
  "/print-room/",
  "/reading-room/",
  "/seed-of-the-day/",
  "/prospect/",
  "/ribbon/",
  "/specimen/",
  "/writing-room/",
  PORTFOLIO,
];
export const STAGED: Record<string, string> = {
  "/print-room/": "The proof. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.",
  "/prospect/": "The plate. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.",
  "/ribbon/": "The scroll. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.",
  "/specimen/": "The specimen sheet. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.",
  "/writing-room/": "The founded chart. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.",
  [PORTFOLIO]: "The sheet on top. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet.",
};
export type RoadWant = readonly [id: string, gold: boolean, path: string, road: string | null, verb: string];
export const KIT_ROADS: Record<string, ReadonlyArray<RoadWant>> = {
  "/explorer/": [
    ["order-plates", true, "/print-room/", null, ""],
    ["journal-link", true, "/reading-room/", null, ""],
  ],
  "/print-room/": [["pr-explorer", true, "/explorer/", null, ""]],
  [PORTFOLIO]: [["pf-explorer", true, "/explorer/", null, ""]],
  "/prospect/": [
    ["pp-chart-link", true, "/explorer/", null, ""],
    ["pp-ribbon-link", false, "/ribbon/", null, "pp-ribbon-verb"],
  ],
  "/ribbon/": [
    ["rb-chart-link", true, "/explorer/", null, ""],
    ["rb-prospect-link", false, "/prospect/", null, "rb-prospect-verb"],
  ],
  "/seed-of-the-day/": [
    ["", false, "/explorer/", "explorer", ""],
    ["", false, "/reading-room/", "reading-room", ""],
  ],
  "/gallery/": [["", true, "/explorer/", null, ""]],
  "/specimen/": [
    ["", false, "/explorer/", null, ""],
    ["", true, "/gallery/", null, ""],
  ],
};

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);
const GLASS_PRESSES = [
  ["BUTTON", "zoom-touch", "zoom-btn touch-btn", "button", null, "The chart in hand", "☞", null, 0],
  ["BUTTON", "zoom-in", "zoom-btn", "button", "in", "Draw nearer", "+", null, 0],
  ["BUTTON", "zoom-out", "zoom-btn", "button", "out", "Stand off", "−", null, 0],
  ["BUTTON", "zoom-reset", "zoom-btn", "button", "fit", "The whole sheet", "⌂", null, 0],
];
const HOLD_PRESS = ["BUTTON", "zoom-hold", "zoom-btn hold-btn", "button", null, "Hold the sheet", "⚓︎", null, 0];
const LOUPE_PRESS = ["BUTTON", "zoom-loupe", "zoom-btn loupe-btn", "button", null, "The loupe", "", null, 0];

function fogFaults(route: string, s: KitSample | undefined): string[] {
  if (!s) return [`${route}: unreachable`];
  if (route === "/") return s.kit.fog.items.length === 0 ? [] : [`/: fog ${JSON.stringify(s.kit.fog.items)}`];
  return faults([
    same(s.kit.fog.items, [
      ["DIV", "fog a", "true", 0],
      ["DIV", "fog b", "true", 0],
    ]) || `${route}: fog ${JSON.stringify(s.kit.fog.items)}`,
    s.kit.fog.adjacent || `${route}: the fog pair is not adjacent`,
  ]);
}

function vignetteFaults(route: string, s: KitSample | undefined): string[] {
  if (!s) return [`${route}: unreachable`];
  return faults([
    same(s.kit.vignettes.items, [
      ["DIV", "vignette top", "true", 0],
      ["DIV", "vignette bottom", "true", 0],
    ]) || `${route}: vignettes ${JSON.stringify(s.kit.vignettes.items)}`,
    s.kit.vignettes.adjacent || `${route}: the vignette pair is not adjacent`,
  ]);
}

function glassFaults(route: string, s: KitSample | undefined): string[] {
  if (!s) return [`${route}: unreachable`];
  const g = s.kit.glass;
  if (!g) return [`${route}: no Glass`];
  const wantId = route === "/explorer/" ? "zoom-controls" : route === "/" ? "lf-controls" : "";
  return faults([
    same(g.classes.slice(0, 4), ["chrome", "corner", "br", "zoomery"]) ||
      `${route}: classes ${JSON.stringify(g.classes)}`,
    g.id === wantId || `${route}: id ${g.id}, want ${wantId || "(none)"}`,
    g.role === "group" || `${route}: role ${g.role}`,
    g.label === "Camera" || `${route}: label ${g.label}`,
    same(
      g.presses,
      route === "/explorer/" ? [GLASS_PRESSES[0], HOLD_PRESS, LOUPE_PRESS, ...GLASS_PRESSES.slice(1)] : GLASS_PRESSES,
    ) || `${route}: presses ${JSON.stringify(g.presses)}`,
  ]);
}

function folioFaults(route: string, s: KitSample | undefined): string[] {
  if (!s) return [`${route}: unreachable`];
  const f = s.kit.folio;
  if (!f) return [`${route}: no chart folio`];
  const bad = f.lines.filter((l) => l[0] !== "P" || l[1] !== "class,id" || !l[2] || !l[3]);
  return faults([
    same(f.classes.slice(0, 4), ["chrome", "corner", "bl", "folio"]) ||
      `${route}: classes ${JSON.stringify(f.classes)}`,
    f.lines.length >= 1 || `${route}: no lines`,
    bad.length === 0 || `${route}: lines ${JSON.stringify(bad)}`,
    same(f.lines[0]?.slice(2, 4), ["folio-title", "folio-title"]) ||
      `${route}: first line ${JSON.stringify(f.lines[0])}`,
  ]);
}

function stageFaults(route: string, label: string, s: KitSample | undefined): string[] {
  if (!s) return [`${route}: unreachable`];
  return faults([
    same(s.kit.gesture, ["0", "application", label]) || `${route}: gesture ${JSON.stringify(s.kit.gesture)}`,
    s.kit.noscript || `${route}: no noscript in the stage`,
  ]);
}

function roadFaults(route: string, s: KitSample | undefined): string[] {
  if (!s) return [`${route}: unreachable`];
  const want = KIT_ROADS[route] ?? [];
  const got = s.kit.roads;
  if (got.length !== want.length) return [`${route}: ${got.length} roads, want ${want.length}`];
  const wrong: string[] = [];
  got.forEach((r, i) => {
    const w = want[i]!;
    const [id, classes, road, path, kids] = r as [string, string[], string | null, string, string[][]];
    if (id !== w[0]) wrong.push(`${route} road ${i}: id ${JSON.stringify(id)}`);
    if (classes[0] !== "legend-btn") wrong.push(`${route} road ${i}: classes ${JSON.stringify(classes)}`);
    if (classes.includes("gold") !== w[1]) wrong.push(`${route} road ${i}: gold ${classes.includes("gold")}`);
    if (road !== w[3]) wrong.push(`${route} road ${i}: data-road ${JSON.stringify(road)}`);
    if (path !== w[2]) wrong.push(`${route} road ${i}: path ${path}`);
    if (
      !same(kids, [
        ["SPAN", "verb", w[4]],
        ["SPAN", "room", ""],
      ])
    )
      wrong.push(`${route} road ${i}: children ${JSON.stringify(kids)}`);
  });
  return wrong;
}

export function rh32Kit(check: SuiteContext["check"], kits: Record<string, KitSample | undefined>): void {
  const wrong: string[] = [];
  for (const route of ["/", ...FOG_ROOMS]) wrong.push(...fogFaults(route, kits[route]));
  for (const route of CHART_ROOMS)
    wrong.push(...vignetteFaults(route, kits[route]), ...folioFaults(route, kits[route]));
  for (const route of [...CHART_ROOMS, "/"]) wrong.push(...glassFaults(route, kits[route]));
  for (const [route, label] of Object.entries(STAGED)) wrong.push(...stageFaults(route, label, kits[route]));
  for (const route of [...SHELLED, PORTFOLIO]) wrong.push(...roadFaults(route, kits[route]));
  const gal = kits["/gallery/"];
  if (!gal) wrong.push("/gallery/: unreachable");
  else {
    if (gal.kit.vignettes.items.length !== 0)
      wrong.push(`/gallery/: vignettes ${JSON.stringify(gal.kit.vignettes.items)}`);
    if (gal.kit.glass) wrong.push(`/gallery/: Glass ${JSON.stringify(gal.kit.glass)}`);
  }
  check(
    "RH32 the kit's lifted shapes render one shape in every room that wears them: the fog, the vignettes, the Glass, the chart folio's lines, the stage, every road out (a planted style attribute on a folio line is its blind spot: it reads the pages with their scripts on)",
    wrong.length === 0,
    JSON.stringify({ wrong }),
  );
}
