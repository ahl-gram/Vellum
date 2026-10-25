// The Portfolio as written and as it loads (Issue #779 part 2g): its two pill lines over a real hold, its where-line as authored, and a load whose worker never starts.
import { SAY_FADE_MS, SAY_HOLD_MS } from "../../../src/site/shared/announce.ts";
import { makeSettle } from "../../support/settle.ts";
import { withScriptsOff } from "../../support/scripts-off.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { DrawerKit } from "./kit.ts";
import { DRAWN, DRESS, ONE } from "./reads.ts";

const TWO = [
  "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-4.ly-4",
  "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-3.ly-3",
].join("_");
// The second draft is held at the worker's door, since drafting runs faster than the hold and the count line must stand past it to be read standing.
const HOLD = `(() => { const post = Worker.prototype.postMessage; window.__cd54 = { regions: 0, held: [] };
  Worker.prototype.postMessage = function (msg, ...rest) { if (msg && msg.kind === "region" && ++window.__cd54.regions === 2) { window.__cd54.held.push([this, msg, rest]); return; } return post.call(this, msg, ...rest); };
  window.__cd54.release = () => { for (const [w, m, r] of window.__cd54.held.splice(0)) post.call(w, m, ...r); }; })();`;

type Pill = { line: string; fading: boolean; drawn: number; held: number };
const PILL: Payload<Pill> = `(() => { const s = document.getElementById("pf-status"), p = window.__vellumPortfolio ? window.__vellumPortfolio() : null;
  return { line: s ? s.textContent : "", fading: !!s && s.classList.contains("fading"), drawn: p ? p.drawn : -1, held: window.__cd54 ? window.__cd54.held.length : -1 }; })()`;
const NEXT: Payload<{ x: number; y: number; hit: boolean } | null> =
  `(() => { const b = document.getElementById("pf-next"); if (!b) return null; const r = b.getBoundingClientRect(); if (r.width < 1) return null;
  const x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, hit: !!e && b.contains(e) }; })()`;
const WINDOW = SAY_HOLD_MS + SAY_FADE_MS + 500;

async function dwell({ evaluate, sleep }: SuiteContext, ms: number, until?: (d: Pill) => boolean): Promise<Pill[]> {
  const reads: Pill[] = [];
  for (let i = 0; i < Math.ceil(ms / 250); i++) {
    reads.push(await evaluate(PILL));
    if (until?.(reads.at(-1)!)) break;
    await sleep(250);
  }
  return reads;
}

async function pillLines(k: DrawerKit): Promise<{ counted: Pill[]; next: { hit: boolean } | null; said: Pill[] }> {
  const { evaluate, send, sleep, PORT, clickAt, forget } = k;
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/#table=${TWO}` });
  await makeSettle({ evaluate, sleep, tolerant: true })(
    PILL,
    (d) => d.drawn === 1 && d.line !== "",
    "portfolio-one-drafted",
    DRAWN,
  );
  const counted = await dwell(k, WINDOW);
  const next = await evaluate(NEXT);
  if (next) await clickAt(next.x, next.y);
  const said = await dwell(k, WINDOW + 1500, (d) => d.line === "");
  return { counted, next, said };
}

export async function cd54PortfolioLines(k: DrawerKit): Promise<void> {
  const { evaluate, send, check } = k;
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: HOLD });
  try {
    const { counted, next, said } = await pillLines(k);
    const line = counted[0]?.line ?? "";
    check(
      "CD54 the Portfolio's two pill lines go two ways in real time: the drafting count, written bare, stands unfaded past the hold while a sheet is still drafting, and the sheet a real press brings up is announced, fades and clears after the hold (#547 ruling 4)",
      counted[0]?.held === 1 &&
        /^one of two drafted/.test(line) &&
        counted.length > 1 &&
        counted.every((d) => d.line === line && !d.fading) &&
        !!next?.hit &&
        /is on top$/.test(said[0]?.line ?? "") &&
        said.some((d) => d.fading) &&
        said.at(-1)?.line === "",
      JSON.stringify({
        counted: [counted[0], counted.at(-1), counted.length],
        next,
        said: [said[0], said.at(-1), said.length],
      }),
    );
  } finally {
    await evaluate<boolean>(`(() => { if (window.__cd54) window.__cd54.release(); return true; })()`).catch(
      () => false,
    );
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}

const WHERE: Payload<{ where: string | null; app: boolean; ready: string }> =
  `(() => ({ where: (document.querySelector("#portfolio .card-where") || {}).textContent || null, app: typeof window.__vellumPortfolio === "function", ready: document.readyState }))()`;

export async function cd55WhereAuthored({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  const control = await evaluate(WHERE);
  try {
    const off = await withScriptsOff(send, async () => {
      await send("Page.navigate", { url: "about:blank" });
      await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/` });
      return makeSettle({ evaluate, sleep, tolerant: true })(
        WHERE,
        (d) => d.ready === "complete",
        "portfolio-scripts-off",
      );
    });
    check(
      "CD55 the Portfolio's where-line ships promising the sheets gathered at the Explorer, and the script writes the bare voice over it when nothing was gathered (scripts on the control)",
      control.app &&
        control.where === "no sheets gathered at the Explorer" &&
        !off.app &&
        off.where === "the sheets gathered at the Explorer",
      JSON.stringify({ control, off }),
    );
  } finally {
    await send("Page.navigate", { url: "about:blank" });
  }
}

// The pill's first written line is read off the mutation itself, since the drafting writes it and clears it in one task.
const FIRST = `(() => { window.__cd56 = null; const W = window.Worker; window.Worker = class extends W { constructor(...a) { super(...a); this.addEventListener("error", () => { window.__cd56Failed = true; }); } };
  new MutationObserver((records) => { const s = document.getElementById("pf-status"), w = document.getElementById("pf-warning");
  for (const r of records) { const line = r.type === "characterData" ? r.target.data : [...r.addedNodes].map((n) => n.textContent).join("");
    if (window.__cd56 === null && s && (r.target === s || s.contains(r.target)) && line) window.__cd56 = { line, warned: !!w && !w.hidden }; } }).observe(document, { childList: true, subtree: true, characterData: true }); })();`;
type Fallback = {
  blocked: boolean;
  drawn: number;
  warning: (string | number | boolean)[] | null;
  offCentre: number;
  presses: number[];
  first: { line: string; warned: boolean } | null;
};
const FALLBACK: Payload<Fallback> = `(() => { const w = document.getElementById("pf-warning"), stage = document.querySelector(".stage"), s = getComputedStyle(stage), st = stage.getBoundingClientRect(), sh = document.getElementById("sheet").getBoundingClientRect();
  const width = (id) => { const e = document.getElementById(id); return e ? e.getBoundingClientRect().width : 0; }, p = window.__vellumPortfolio ? window.__vellumPortfolio() : null;
  return { blocked: window.__cd56Failed === true, drawn: p ? p.drawn : -1, warning: w && [w.hidden, w.getBoundingClientRect().width, w.parentElement === stage, getComputedStyle(w).position],
    offCentre: Math.abs(sh.left + sh.width / 2 - (st.left + parseFloat(s.paddingLeft) + (st.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)) / 2)),
    presses: [width("pf-next"), width("pf-download")], first: window.__cd56 }; })()`;

export async function cd56WorkerBlocked(k: DrawerKit): Promise<void> {
  const { evaluate, send, check, sleep, PORT, serverState, forget } = k;
  const { identifier } = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: FIRST });
  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
    await forget();
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/#${DRESS}&table=${ONE}` });
    const settle = makeSettle({ evaluate, sleep, tolerant: true });
    const read = await settle(FALLBACK, (d) => d.drawn === 1, "portfolio-drafted-inline", DRAWN);
    check(
      "CD56 a Portfolio whose worker never starts says so in its stage, seated over the sheet so the sheet stays centred, and raises the notice before the first drafting line, and a one-sheet folio keeps both its presses (the worker's own load error the witness)",
      read.blocked &&
        JSON.stringify(read.warning?.slice(2)) === JSON.stringify([true, "absolute"]) &&
        read.warning?.[0] === false &&
        (read.warning[1] as number) > 0 &&
        read.offCentre < 1 &&
        read.presses.every((w) => w > 0) &&
        read.first?.warned === true,
      JSON.stringify(read),
    );
  } finally {
    serverState.blockWorker = false;
    await send("Network.setCacheDisabled", { cacheDisabled: false }).catch(() => undefined);
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}
