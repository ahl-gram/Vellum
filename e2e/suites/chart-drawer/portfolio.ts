import type { Payload, SuiteContext } from "../../types.ts";
import type { DrawerKit, TableKit } from "./kit.ts";
import { DRAWN, DRESS, ONE } from "./reads.ts";

type Arrival = { path: string; ready: string; table: string | null; seed: string | null; items: number | null; room: string | null };
const ARRIVAL: Payload<Arrival> = `(() => { const p = new URLSearchParams(location.hash.slice(1)); return { path: location.pathname, ready: document.readyState, table: p.get("table"), seed: p.get("seed"), items: window.__vellumPortfolio ? window.__vellumPortfolio().items : null, room: (document.querySelector(".room-name") || {}).textContent || null }; })()`;

/** A measurement poll, not a readiness wait (handbook/specs/settle-doctrine.md clause 4): it reads until the page has LEFT `from` and finished loading, wherever it went, and hands back its last read for the caller to assert on, so a road to a missing page reds by naming where it landed. */
async function arrivalFrom(evaluate: TableKit["evaluate"], sleep: TableKit["sleep"], from: string): Promise<Arrival | null> {
  let last: Arrival | null = null;
  for (let i = 0; i < DRAWN; i++) {
    await sleep(50);
    last = await evaluate(ARRIVAL).catch(() => last);
    if (last && last.path !== from && last.ready === "complete") return last;
  }
  return last;
}

export async function cd49PrintRoomRoad({ evaluate, send, check, sleep, settle, PORT, forget, pressById }: TableKit): Promise<void> {
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#${DRESS}&table=${ONE}` });
  // The road carries this page's address only once the proof has drawn (`writeHash` in `src/site/print-room/app.ts`), so the press waits for that; where it lands is the claim.
  const written = await settle<{ href: string | null } | null>(`(() => { const a = document.getElementById("pr-portfolio"); return a ? { href: a.getAttribute("href") } : null; })()`, (d) => typeof d.href === "string" && d.href.indexOf("#") !== -1, "chart-drawer-print-room-road-written", DRAWN);
  // Wiring, not a gesture claim: the Bound Atlas slip may stand folded, and the road is in its foot.
  await evaluate(`(() => { const s = document.getElementById("atlas"); const t = document.querySelector('.slip-tab[aria-controls="atlas"]'); if (s && t && s.classList.contains("folded")) t.click(); return true; })()`);
  await sleep(400);
  const press = await pressById("pr-portfolio");
  const arrived = await arrivalFrom(evaluate, sleep, "/print-room/");
  check(
    "CD49 the Print Room's road to the Portfolio answers a REAL press and lands at the Portfolio's address under the Explorer, carrying the Print Room's own address with it: the table it was handed and the world it shows (Issue #669)",
    press.hit && !!arrived && arrived.path === "/explorer/portfolio/" && arrived.table === ONE && arrived.seed === "42" && arrived.items === 1,
    JSON.stringify({ written: written.href, press, arrived }),
  );
}

export async function cd50ScriptsOffHome({ evaluate, send, check, sleep, settle, PORT, clickAt }: TableKit): Promise<void> {
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/` });
  // At rest means the document complete and the road still across two reads: read while the page is still interactive, the road sits unstyled at the top right (measured 2026-10-04: 1038,27 at interactive, 809,455 from 100ms on), and a press there lands nowhere.
  const road = await settle<{ x: number; y: number; hit: boolean; href: string | null; ready: string } | null>(`(() => { const a = document.querySelector(".stage noscript a"); if (!a) return null; a.scrollIntoView({ block: "center" }); const b = a.getBoundingClientRect(); if (b.width < 1) return null; const x = Math.round(b.x + b.width / 2), y = Math.round(b.y + b.height / 2); const h = document.elementFromPoint(x, y); return { x, y, hit: h === a || a.contains(h), href: a.getAttribute("href"), ready: document.readyState }; })()`, (d, last) => d.ready === "complete" && !!last && last.x === d.x && last.y === d.y, "chart-drawer-scripts-off-road", DRAWN);
  await clickAt(road.x, road.y);
  const arrived = await arrivalFrom(evaluate, sleep, "/explorer/portfolio/");
  check(
    "CD50 with scripts off, the Portfolio's notice still has a road home that answers a REAL press and lands on the Explorer, the parent the page now sits under (Issue #669)",
    road.hit && !!arrived && arrived.path === "/explorer/" && arrived.room === "The Explorer",
    JSON.stringify({ road, arrived }),
  );
}

export async function cd18bRoadCarries({ evaluate, check, sleep, clickAt }: DrawerKit, SIX: string): Promise<void> {
  const roadBefore = await evaluate<boolean>(`document.getElementById("table-road").disabled`);
  const roadAt = await evaluate<{ x: number; y: number; reachable: boolean; room: string | null }>(`(() => { const b = document.getElementById("table-road"); const r = b.getBoundingClientRect();
    const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2);
    const h = document.elementFromPoint(x, y);
    return { x, y, reachable: h === b || b.contains(h), room: (b.querySelector(".room") || {}).textContent || null }; })()`);
  await clickAt(roadAt.x, roadAt.y);
  for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate<boolean>(`location.pathname.indexOf("/portfolio/") !== -1 && !!document.querySelector(".room-name")`)) break; }
  const arrived = await evaluate<{ path: string; table: string | null; room: string | null }>(`({ path: location.pathname, table: new URLSearchParams(location.hash.slice(1)).get("table"), room: (document.querySelector(".room-name") || {}).textContent || null })`);
  check(
    "CD18b the road answers a REAL press and carries the WHOLE gathering to the Portfolio's own address under the Explorer, which is the epic's core insight: the folio is a link, so the page it lands on can draft the same six sheets for anyone; and the road names the room it lands in (Issue #669, ruled 2026-10-04)",
    arrived.path === "/explorer/portfolio/" && arrived.table === SIX && roadAt.reachable &&
      roadAt.room !== null && roadAt.room === arrived.room,
    JSON.stringify({ ...arrived, roadBefore, roadAt }),
  );
}

export async function cd19PortfolioDrafts({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  const PF: Payload<{ items: number; drawn: number; rows: number; groups: number; heads: string[]; onStage: boolean; folio: string | null; bound: string | null; warned: boolean } | null> = `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return s ? { ...s,
    warned: !document.getElementById("pf-warning").hidden,
    rows: document.querySelectorAll("#pf-contents .row").length,
    groups: document.querySelectorAll("#pf-contents .group-head").length,
    heads: [...document.querySelectorAll("#pf-contents .group-head span:first-child")].map((e) => e.textContent),
    onStage: !!document.querySelector("#pf-sheet svg"),
    folio: (document.getElementById("folio-title") || {}).textContent || null,
    bound: (document.getElementById("pf-bound") || {}).textContent || null } : null; })()`;
  let pf = await evaluate(PF);
  for (let i = 0; i < DRAWN && (!pf || pf.drawn < 6); i++) { await sleep(50); pf = await evaluate(PF); }
  check(
    "CD19 the Portfolio drafts every gathered sheet from its own number, groups the index by world under the parent world's NAME, and stands one sheet on the stage (#518 ruling 5), on the render worker, whose address a moved page resolves for itself and whose loss would only look slow (Issue #669)",
    // The warning is unhidden right after initWorker() when the worker did not start, and drafting starts after that, so with sheets drawn its state is final.
    !!pf && pf.items === 6 && pf.drawn === 6 && pf.rows === 6 && pf.groups >= 1 && pf.onStage && !pf.warned &&
      // The LITERAL world, not a shape: seed 42's parent is deterministic (measured 2026-09-08), and a shape check passes on
      // the "this world" fallback the page uses before worldTitle arrives, which is the whole thing this pins.
      pf.heads.length === 1 && pf.heads[0] === "From The Isle of Rahai · chart № 42",
    JSON.stringify(pf),
  );
}

export async function cd24PortfolioSays({ evaluate, check, sleep, clickAt }: DrawerKit): Promise<void> {
  // CD24 (Issue #547 ruling 4, Alex 2026-09-13): the Portfolio's "is on top" was the Explorer's defect on a second page, so one shared announcer and ONE kit rule take both lines away. Named blind spot, with its direction: this does not wait the hold out, so it does not watch THIS line go. The going is the shared module (test/site/announce.test.ts) and CD23's resolved read; a second eight-second wait is what the lane's measured budget cannot buy, and the PR body carries it as residue.
  const pfNext = await evaluate<{ x: number; y: number; reachable: boolean } | null>(`(() => { const b = document.getElementById("pf-next"); if (!b) return null; b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); if (r.width < 1) return null; const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2); const h = document.elementFromPoint(x, y); return { x, y, reachable: h === b || b.contains(h) }; })()`);
  if (pfNext) await clickAt(pfNext.x, pfNext.y);
  const PF_SAID: Payload<{ line: string; fadeMs: string; rest: string; faded: string } | null> = `(() => { const s = document.getElementById("pf-status"); if (!s) return null; const was = s.style.transition; s.style.transition = "none"; const rest = getComputedStyle(s).opacity; s.classList.add("fading"); const faded = getComputedStyle(s).opacity; s.classList.remove("fading"); s.style.transition = was; return { line: s.textContent || "", fadeMs: getComputedStyle(s).transitionDuration, rest, faded }; })()`;
  // A bounded poll and not a settle, so a Portfolio that never announces fails CD24 by name rather than throwing outside every step the way its four siblings here already run unstepped. 40 tries is 2s: bringUp says synchronously inside the click handler's own task, so the first or second read has it (measured 2026-09-13, every local run read it on the first).
  let pfSaid = await evaluate(PF_SAID);
  for (let i = 0; i < 40 && (!pfSaid || pfSaid.line === ""); i++) { await sleep(50); pfSaid = await evaluate(PF_SAID); }
  check(
    "CD24 the Portfolio announces the sheet it brought up on a pill that wears the SAME fade the Explorer's does, read as the declared duration AND as the opacity the cascade resolves under the class: a rule keyed to #status alone, or a later arm re-raising THIS page's opacity, would leave this announcement standing over the chart forever and every other guard green (#547 ruling 4)",
    !!pfNext && pfNext.reachable && !!pfSaid && /is on top/.test(pfSaid.line) &&
      pfSaid.fadeMs === "0.45s" && pfSaid.rest === "1" && pfSaid.faded === "0",
    JSON.stringify({ press: pfNext, said: pfSaid }),
  );
}

export async function cd20BarePortfolio({ evaluate, send, check, sleep, PORT, forget }: DrawerKit): Promise<void> {
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/` });
  for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate<boolean>(`!!window.__vellumPortfolio`)) break; }
  await sleep(400);
  const empty = await evaluate<{ bound: string | null; where: string | null; explorer: boolean; next: boolean; download: boolean }>(`(() => ({ bound: (document.getElementById("pf-bound") || {}).textContent || null,
    where: (document.querySelector("#portfolio .card-where") || {}).textContent || null,
    // The RECT of all three, never .hidden: atelier.css sets an author display on .legend-btn, which beats the UA [hidden] rule, so el.hidden = true silently no-ops and a check on that property is a check on its own input (#270's guard-prover find).
    // The road takes the same measure as the two presses because it is the same script decision: its mere presence is an Astro literal the page script never touches, and could not go red however the stand-down was written.
    explorer: (() => { const a = document.getElementById("pf-explorer"); return !!a && a.getBoundingClientRect().width > 0.5; })(),
    next: (() => { const b = document.getElementById("pf-next"); return !!b && b.getBoundingClientRect().width > 0.5; })(),
    download: (() => { const b = document.getElementById("pf-download"); return !!b && b.getBoundingClientRect().width > 0.5; })() }))()`);
  check(
    "CD20 a Portfolio reached with nothing gathered says so in the room's own voice, in the slip's where-line as well as the bound line, and keeps only the road that has somewhere to go (ruled 2026-09-08): the two sheet presses have nothing to act on and stand down, and the road is measured by its rect the way they are",
    !!empty.bound && /table is laid at the Explorer/.test(empty.bound) &&
      /no sheets gathered at the Explorer/.test(empty.where || "") && empty.explorer && !empty.next && !empty.download,
    JSON.stringify(empty),
  );
}

export async function cd21PortfolioGlass({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // CD21 (Issue #521): the Portfolio is a chart room, so the kit renders its Glass and the stage's label promises the keys.
  // Both halves are the claim. d3-zoom does NOT set touch-action, so a bound controller with no `touch-action: none`
  // is still dead to a real thumb: the browser's native pan takes the gesture first (Issue #164).
  const glass = await evaluate<{ zoomable: boolean; touch: string; before: string }>(`(() => {
    const v = document.getElementById("map-viewport");
    const before = document.getElementById("map").style.transform;
    document.querySelector('[data-zoom="in"]').click();
    return { zoomable: v.classList.contains("zoomable"), touch: getComputedStyle(v).touchAction, before };
  })()`);
  await sleep(700);
  const glassAfter = await evaluate<string>(`document.getElementById("map").style.transform`);
  check(
    "CD21 the Portfolio's Glass is bound AND reachable by a thumb: a zoom press moves the camera, and the viewport takes touch-action none, without which d3 never sees the gesture and three corner presses are decoration (#164, #521)",
    glass.zoomable && glass.touch === "none" && glassAfter !== glass.before && glassAfter !== "",
    JSON.stringify({ ...glass, after: glassAfter }),
  );
}
