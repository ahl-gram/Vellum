// The Prospect as the browser built it (Issue #779 part 2g): the markup on the capital's plate, the page as authored with scripts off, what the boot does before and after the first plate, and the table's two homes.
import { countLine, LAY_ON_PAGE } from "../../../src/site/explorer/chart-drawer.ts";
import { parseTableValue } from "../../../src/site/shared/table-address.ts";
import { makeSettle } from "../../support/settle.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import type { Payload } from "../../types.ts";
import { axName, STORE, type ProspectKit } from "./kit.ts";

const TEXT = `((e) => e ? e.textContent.replace(/\\s+/g, " ").trim() : null)`;
const KIDS = `((e) => e ? [...e.children].map((c) => c.tagName + (c.id ? "#" + c.id : "") + (c.classList.length ? "." + [...c.classList].join(".") : "")) : null)`;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);

type Corner = {
  h1s: string[];
  tagline: string | null;
  retired: number;
  form: unknown[] | null;
  label: unknown[] | null;
  year: unknown[] | null;
  engrave: unknown[] | null;
  kids: string[] | null;
  gloss: string | null;
};
const CORNER: Payload<Corner> = `(() => { const text = ${TEXT}, kids = ${KIDS};
  const corner = document.querySelector(".corner.tr.folio-room"), form = document.getElementById("pp-year-form"), label = document.querySelector("label.year-label"), y = document.getElementById("pp-year"), e = document.getElementById("pp-engrave");
  return { h1s: [...document.querySelectorAll("h1")].map((h) => (corner && corner.contains(h) ? "corner " : "") + h.className + ": " + text(h)),
    tagline: text(corner && corner.querySelector(":scope > .room-tagline")), retired: document.querySelectorAll(".intro, .plate-figure, .actions, #pp-caption").length,
    form: form && [form.tagName, form.className, form.getAttribute("aria-label"), form.parentElement === corner],
    label: label && [label.htmlFor, text(label)],
    year: y && [y.getAttribute("type"), y.getAttribute("inputmode"), y.getAttribute("autocomplete"), y.hasAttribute("aria-label"), y.className],
    engrave: e && [e.getAttribute("type"), e.className, text(e), e.form === form], kids: kids(form), gloss: text(corner && corner.querySelector(":scope > .gloss")) };
})()`;

const cornerFaults = (c: Corner, name: string | null): string[] =>
  faults([
    same(c.h1s, ["corner room-name: The Prospect"]) || "one h1, the folio's name",
    c.tagline === "the second camera" || "the tagline",
    c.retired === 0 || "no retired furniture",
    same(c.form, ["FORM", "folio-controls", "The year viewed", true]) || "the year control a form in the corner",
    same(c.label, ["pp-year", "viewed in the year"]) || "the year's label",
    same(c.year, ["text", "numeric", "off", false, "control"]) || "the year's own attributes",
    name === "viewed in the year" || "the year announced by its label",
    same(c.engrave, ["submit", "primary", "Engrave", true]) || "Engrave the form's submit",
    same(c.kids, ["LABEL.year-label", "INPUT#pp-year.control", "BUTTON#pp-engrave.primary"]) ||
      "label, year, Engrave in order",
    c.gloss === "turn the year back, even to the ground before it rose" || "the gloss",
  ]);

type Note = {
  slip: string | null;
  head: (string | null)[];
  body: string[] | null;
  texts: (string | null)[];
  file: string[] | null;
  layType: string | null;
  beforeFolio: boolean;
};
const NOTE: Payload<Note> = `(() => { const text = ${TEXT}, kids = ${KIDS}, slip = document.getElementById("note"), q = (s) => slip && slip.querySelector(s), folio = document.querySelector(".corner.bl.folio");
  return { slip: slip && slip.tagName + "." + slip.className, head: [text(q(".card-verb")), text(document.querySelector(".slip-tab[aria-controls=note]")), q(".slip-fold") && q(".slip-fold").getAttribute("aria-label")],
    body: kids(q(".slip-body")), texts: [text(q("#pp-key-head")), text(q(".era-gloss"))], file: kids(q(".pp-file")), layType: q("#pp-lay") && q("#pp-lay").getAttribute("type"),
    beforeFolio: !!slip && !!folio && !!(slip.compareDocumentPosition(folio) & Node.DOCUMENT_POSITION_FOLLOWING) };
})()`;

const ERA_GLOSS =
  "The same place, chart and year always press the same plate. Open another settlement's prospect from its card in the Explorer.";
const noteFaults = (n: Note): string[] =>
  faults([
    n.slip === "ASIDE.slip" || "the note an aside slip",
    same(n.head, ["The engraver's note", "The Engraver's Note", "Fold the engraver's note away"]) || "the slip's head",
    same(n.body, [
      "P#pp-note.note-prose",
      "P#pp-key-head.key-head",
      "OL#pp-key.contents.plate-key",
      "P#pp-era.era",
      "P.era-gloss",
      "DIV.pp-file",
    ]) || "the slip's body in order",
    same(n.texts, ["The key to the plate", ERA_GLOSS]) || "the key's head and the era gloss",
    (same(n.file, ["BUTTON#pp-lay.pp-lay", "P#pp-lay-count.pp-lay-count"]) && n.layType === "button") ||
      "the filing press on the note",
    n.beforeFolio || "the slip before the chart folio",
  ]);

type Roads = { nav: (string | null)[]; row: string[] | null; roads: (string | null)[][]; verbId: boolean; lay: number };
const ROADS: Payload<Roads> = `(() => { const text = ${TEXT}, kids = ${KIDS}, nav = document.querySelector("nav.legend"), row = nav && nav.querySelector(".legend-row");
  return { nav: [nav && nav.getAttribute("aria-label"), text(nav && nav.querySelector(".legend-head"))], row: kids(row),
    roads: row ? [...row.children].map((a) => [text(a.querySelector(".verb")), text(a.querySelector(".room"))]) : [], verbId: !!document.querySelector("#pp-ribbon-link #pp-ribbon-verb"),
    lay: document.querySelectorAll(".legend .pp-lay").length };
})()`;

const roadFaults = (r: Roads, name: string): string[] =>
  faults([
    same(r.nav, ["The roads out", "The roads out"]) || "the legend's label and head",
    same(r.row, ["A#pp-chart-link.legend-btn.gold", "A#pp-ribbon-link.legend-btn"]) ||
      "the gold road back first, the Ribbon road after",
    same(r.roads, [
      ["Return to", "The Explorer"],
      [`Take the road from ${name} in`, "The Wayfarer's Ribbon"],
    ]) || "the roads' verbs and rooms",
    r.verbId || "the Ribbon road's verb the script rewrites",
    r.lay === 0 || "no filing press among the roads",
  ]);

type Stage = {
  label: string | null;
  map: string[] | null;
  svg: number;
  after: string[] | null;
  pill: (string | null)[] | null;
  warning: boolean | null;
  folio: string[][];
};
const STAGE: Payload<Stage> = `(() => { const kids = ${KIDS}, id = (s) => document.getElementById(s), pill = id("pp-status");
  return { label: id("map-viewport") && id("map-viewport").getAttribute("aria-label"), map: kids(id("map")), svg: document.querySelectorAll("#sheet svg").length,
    after: kids(document.querySelector(".stage")), pill: pill && [pill.getAttribute("role"), pill.getAttribute("aria-live")], warning: id("pp-warning") && id("pp-warning").hidden,
    folio: [...document.querySelectorAll(".corner.bl.folio > p")].map((p) => [p.className, p.id]) };
})()`;

const stageFaults = (s: Stage): string[] =>
  faults([
    !!s.label?.startsWith("The plate. ") || "the gesture box's label",
    (same(s.map, ["IMG#pp-plate.plate"]) && s.svg === 0) || "the plate the transform target's one face, no inline svg",
    same(s.after, ["DIV#sheet.sheet", "P#pp-status.status", "P#pp-warning.warning", "NOSCRIPT"]) ||
      "the pill, the warning and the notice in the stage",
    same(s.pill, ["status", "polite"]) || "the pill a live status",
    s.warning === true || "the warning hidden",
    same(s.folio, [
      ["folio-title", "folio-title"],
      ["folio-sub", "folio-sub"],
      ["folio-coords", "pp-pressed"],
    ]) || "the folio's three lines",
  ]);

export async function pb12Markup(k: ProspectKit): Promise<void> {
  const { evaluate, check, opened, parkMouse } = k;
  const st = await opened("the capital, for its markup");
  await parkMouse();
  const corner = await evaluate(CORNER);
  const name = await axName(k, "#pp-year");
  const note = await evaluate(NOTE);
  const roads = await evaluate(ROADS);
  const stage = await evaluate(STAGE);
  const wrong = [
    ...cornerFaults(corner, name),
    ...noteFaults(note),
    ...roadFaults(roads, st.name),
    ...stageFaults(stage),
  ];
  check(
    "PB12 the Prospect's markup on the capital's plate: the folio's one h1 and tagline with no retired furniture, the year control a form (its label announcing the year, the year a numeric text field, Engrave the submit), the engraver's note slip in order with its filing press before the chart folio, the roads out (the gold road back first, the Ribbon road after, no press among them), the plate the transform target's one face, the pill, the warning and the notice in the stage, the folio's lines",
    wrong.length === 0,
    JSON.stringify({ wrong, name, corner, note, roads, stage }),
  );
}

type Off = {
  app: boolean;
  lay: string | null;
  where: string | null;
  hrefs: (string | null)[];
  plate: (boolean | string | null)[] | null;
  notice: (boolean | string | null)[] | null;
};
const OFF: Payload<Off> = `(() => { const text = ${TEXT}, id = (s) => document.getElementById(s), p = id("pp-plate"), n = document.querySelector(".stage noscript .status"), stage = document.querySelector(".stage");
  const inside = (a, b) => { const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); return r.width > 0 && r.left >= s.left && r.right <= s.right && r.top >= s.top && r.bottom <= s.bottom; };
  return { app: typeof window.__vellumProspectState === "function", lay: text(id("pp-lay")), where: text(document.querySelector("#note .card-where")),
    hrefs: ["pp-chart-link", "pp-ribbon-link"].map((s) => id(s) && id(s).getAttribute("href")),
    plate: p && [p.hidden, p.getAttribute("alt"), getComputedStyle(p).display], notice: n && [inside(n, stage), text(n)] };
})()`;

export async function pb16ScriptsOff(k: ProspectKit): Promise<void> {
  const { evaluate, send, check, sleep, page } = k;
  const control = await evaluate(OFF);
  type Loaded = { ready: string; lay: boolean };
  const settle = makeSettle({ evaluate: (e: string) => evaluate<Loaded | null>(e).catch(() => null), sleep });
  const off = await withScriptsOff(send, async () => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: page("#seed=42&i=0") });
    await settle<Loaded>(
      `({ ready: document.readyState, lay: !!document.getElementById("pp-lay") })`,
      (d) => d.ready === "complete" && d.lay,
      "prospect-scripts-off",
    );
    return evaluate(OFF);
  });
  check(
    "PB16 the Prospect as authored, scripts off: no script ran (the scripts-on page the control), the filing press faced with the one constant the script paints with, the note's where line, the roads' authored hrefs, the plate hidden with an empty alt, and the scripts-off notice inside the stage",
    control.app &&
      control.notice === null &&
      !off.app &&
      off.lay === LAY_ON_PAGE &&
      !!off.where &&
      same(off.hrefs, ["/explorer/", "/ribbon/"]) &&
      same(off.plate, [true, "", "none"]) &&
      !!off.notice &&
      off.notice[0] === true &&
      String(off.notice[1]).includes("the Prospect needs JavaScript"),
    JSON.stringify({ control, off }),
  );
}

// Installed before the page: the roads' and the press's display at the first plate's blob, and every blob the page revokes.
const WATCH = `(() => { const make = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL); window.__pb17 = { first: null, revoked: [] };
  URL.createObjectURL = (b) => { if (!window.__pb17.first) { const r = document.getElementById("pp-ribbon-link"), l = document.getElementById("pp-lay"); window.__pb17.first = [r && r.style.display, l && l.style.display]; } return make(b); };
  URL.revokeObjectURL = (u) => { window.__pb17.revoked.push(u); return revoke(u); }; })();`;
type Seat = string[];
const SEAT = `(() => { const s = document.getElementById("sheet").style; return [document.querySelector(".legend").style.left, document.querySelector(".stage").style.getPropertyValue("--reserve-bottom"), s.width, s.height]; })()`;
const RESEAT: Payload<{ before: Seat; after: Seat }> =
  `(() => { const before = ${SEAT}; window.dispatchEvent(new Event("resize")); return { before, after: ${SEAT} }; })()`;

export async function pb17Boot(k: ProspectKit): Promise<void> {
  const { evaluate, send, check, sleep, goto, opened } = k;
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: WATCH });
  try {
    await goto("#seed=42&i=0");
    const st = await opened("the capital, watched from boot");
    const first = await evaluate<{ first: string[] | null; src: string }>(
      `({ first: window.__pb17.first, src: document.getElementById("pp-plate").src })`,
    );
    const seat = await evaluate(RESEAT);
    await evaluate(
      `(() => { document.getElementById("pp-year").value = "${st.presentYear - 300}"; document.getElementById("pp-year-form").requestSubmit(); return true; })()`,
    );
    const after = await makeSettle({ evaluate, sleep })<{
      src: string;
      year: number | null;
      status: string;
      revoked: string[];
    }>(
      `({ src: document.getElementById("pp-plate").src, year: window.__vellumProspectState() && window.__vellumProspectState().year, status: document.getElementById("pp-status").textContent, revoked: window.__pb17.revoked })`,
      (d) => d.year === st.presentYear - 300 && d.status === "",
      "prospect-year-engraved",
      200,
    );
    check(
      "PB17 the boot: until the first plate the Ribbon road and the filing press stand down, the refit runs after the folio is written so a fresh refit leaves the legend, the reserve and the sheet where it put them, and engraving another year revokes the first plate's blob",
      same(first.first, ["none", "none"]) &&
        same(seat.before, seat.after) &&
        after.src !== first.src &&
        after.revoked.includes(first.src),
      JSON.stringify({ first, seat, after }),
    );
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}

const S = (seat: string) => `k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.${seat}`;
const CAP = "k-p.seed-42.style-antique.i-0.year-1059";
const S1 = S("rung-2.lx-17.ly-13");
const S2 = S("rung-1.lx-4.ly-4");
const S3 = S("rung-2.lx-5.ly-5");
const counted = (table: string): string => countLine(parseTableValue(table));
type Home = {
  path: string;
  marker: string | null;
  nav: string | undefined;
  table: string | null;
  count: string | null;
  dim: boolean;
  drawn: boolean;
};
const HOME: Payload<Home> = `(() => { const p = document.getElementById("pp-lay"), st = window.__vellumProspectState && window.__vellumProspectState();
  return { path: location.pathname, marker: window.__pb18 ?? null, nav: performance.getEntriesByType("navigation")[0] && performance.getEntriesByType("navigation")[0].type,
    table: new URLSearchParams(location.hash.slice(1)).get("table"), count: (document.getElementById("pp-lay-count") || {}).textContent ?? null, dim: !!p && p.classList.contains("dim"), drawn: !!st }; })()`;

async function backHome(k: ProspectKit, marker: string, unload: boolean): Promise<Home> {
  const { evaluate, sleep } = k;
  await evaluate(
    `(() => { window.__pb18 = "${marker}"; ${unload ? `window.addEventListener("unload", () => {});` : ""} location.href = "/faq/"; return true; })()`,
  );
  type Away = { path: string; ready: string };
  const away = makeSettle({ evaluate: (e: string) => evaluate<Away | null>(e).catch(() => null), sleep });
  const home = makeSettle({ evaluate: (e: string) => evaluate<Home | null>(e).catch(() => null), sleep });
  await away<Away>(
    `({ path: location.pathname, ready: document.readyState })`,
    (d) => d.path === "/faq/" && d.ready === "complete",
    "prospect-to-faq",
  );
  await evaluate(`(() => { history.back(); return true; })()`);
  return home(
    HOME,
    (d, last) => d.path === "/prospect/" && d.drawn && !!last && JSON.stringify(d) === JSON.stringify(last),
    "prospect-back",
    200,
  );
}

export async function pb18TableHomes(k: ProspectKit): Promise<void> {
  const { evaluate, send, check, opened, page } = k;
  try {
    await evaluate(`localStorage.setItem(${STORE}, ${JSON.stringify(`${S1}_${S1}_${S2}`)})`);
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: page(`#seed=42&i=0&table=${CAP}_${CAP}`) });
    await opened("the capital, handed a table");
    const linked = await evaluate(HOME);
    const cached = await backHome(k, "warm", false);
    await evaluate(`localStorage.setItem(${STORE}, ${JSON.stringify(`${S1}_${S2}_${S3}`)})`);
    const cold = await backHome(k, "cold", true);
    check(
      "PB18 the table's two homes on the Prospect: a link beats the device and the boot seats it through the gate (two copies arrive as one, already on the table); a cached Back re-seats the device's table (the page restored, not reloaded); a cold Back reads the device at boot (#634, ruled 2026-09-19)",
      linked.count === counted(CAP) &&
        linked.dim &&
        cached.marker === "warm" &&
        cached.table === `${S1}_${S2}` &&
        cached.count === counted(`${S1}_${S2}`) &&
        !cached.dim &&
        cold.marker === null &&
        cold.nav === "back_forward" &&
        cold.count === counted(`${S1}_${S2}_${S3}`),
      JSON.stringify({
        linked,
        cached,
        cold,
        want: [counted(CAP), counted(`${S1}_${S2}`), counted(`${S1}_${S2}_${S3}`)],
      }),
    );
  } finally {
    await k.forget();
  }
}
