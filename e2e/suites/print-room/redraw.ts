import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";

type RoadAt = { disabled: boolean; text: string } | null;
type MidDraw = { bind: boolean; print: boolean; atlasEmpty: boolean; hasAtlas: boolean; road: RoadAt[] };

export async function pr24Redraw({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // Wiring, not the claim: Draw is clicked as PR24 has always pressed it; PR51's claim is the road option read before and after that click, in the same task.
  const midDraw = await evaluate<MidDraw>(
    `(()=>{const o=document.querySelector('#pr-pressing option[value="road"]'),road=()=>o?{disabled:o.disabled,text:o.textContent}:null,before=road();const s=document.getElementById("pr-seed");s.value="2024";document.getElementById("pr-draw").click();return{bind:document.getElementById("pr-bind").disabled,print:document.getElementById("pr-print").disabled,atlasEmpty:document.getElementById("pr-atlas").children.length===0,hasAtlas:document.body.classList.contains("has-atlas"),road:[before,road()]};})()`,
  );
  let reenabled = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; status: string; bind: boolean }>(
        `(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,status:document.getElementById("pr-status").textContent,bind:document.getElementById("pr-bind").disabled};})()`,
      );
    } catch {}
    if (s && s.seed === 2024 && s.status === "" && s.bind === false) {
      reenabled = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PR24 a redraw disables Bind mid-flight (no stale-world bind), re-enabled on the new proof",
    midDraw.bind === true &&
      midDraw.print === true &&
      midDraw.atlasEmpty === true &&
      midDraw.hasAtlas === false &&
      !!reenabled,
    JSON.stringify({ midDraw, reenabled }),
  );
  const [before, after] = midDraw.road;
  check(
    "PR51 a redraw closes the road the old world offered the moment Draw is pressed (no stale-world road): with seed 42's road drawn, the road option is open before the click and closed after it, until the new world answers (Issue #433)",
    !!before &&
      !before.disabled &&
      before.text === "The road from the capital" &&
      !!after &&
      after.disabled &&
      after.text === "The road from the capital",
    JSON.stringify(midDraw.road),
  );
}

export async function pr24bInFlight({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // The interleaving here is deterministic, not lucky: the Print Room shares ONE FIFO render worker with no job cancellation, so the bind posted first always settles first, ahead of the redraw queued behind it. PR27 rests on the same property.
  const btd = await evaluate<{ bindDisabled: boolean; atlasEmpty: boolean }>(
    `(()=>{document.getElementById("pr-bind").click();const s=document.getElementById("pr-seed");s.value="909";document.getElementById("pr-draw").click();return{bindDisabled:document.getElementById("pr-bind").disabled,atlasEmpty:document.getElementById("pr-atlas").children.length===0};})()`,
  );
  let btdSettled = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; status: string; bind: boolean }>(
        `(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,status:document.getElementById("pr-status").textContent,bind:document.getElementById("pr-bind").disabled};})()`,
      );
    } catch {}
    if (s && s.seed === 909 && s.status === "" && s.bind === false) {
      btdSettled = s;
      break;
    }
    await sleep(50);
  }
  await sleep(250, "window: a stale bind must not inject in it");
  const btdAtlas = await evaluate<{ figs: number; hasAtlas: boolean }>(
    `(()=>({figs:document.querySelectorAll("#pr-atlas figure").length,hasAtlas:document.body.classList.contains("has-atlas")}))()`,
  );
  check(
    "PR24b an in-flight bind is dropped when a redraw supersedes it (no stale-world atlas)",
    btd.bindDisabled === true &&
      btd.atlasEmpty === true &&
      !!btdSettled &&
      btdAtlas.figs === 0 &&
      btdAtlas.hasAtlas === false,
    JSON.stringify({ btd, btdSettled, btdAtlas }),
  );
}

export async function pr26Redraw({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let orderReady = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try {
      ok = await evaluate<boolean>(
        `(()=>{const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return !!document.querySelector("#pr-preview svg")&&document.getElementById("pr-status").textContent===""&&!!g&&!g.disabled&&!!f&&!f.disabled;})()`,
      );
    } catch {}
    if (ok) {
      orderReady = true;
      break;
    }
    await sleep(50);
  }
  const midPoster = await evaluate<{ platesDisabled: boolean; format: boolean | null; status: string }>(
    `(()=>{const s=document.getElementById("pr-seed");s.value="777";document.getElementById("pr-draw").click();const plates=[...document.querySelectorAll("[data-poster]")];const f=document.getElementById("pr-format");return{platesDisabled:plates.length>0&&plates.every((b)=>b.disabled),format:f?f.disabled:null,status:document.getElementById("pr-status").textContent};})()`,
  );
  let orderReenabled = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; status: string; plate: boolean; format: boolean }>(
        `(()=>{const st=window.__vellumPrintRoomState();const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return{seed:st.seed,status:document.getElementById("pr-status").textContent,plate:g?g.disabled:true,format:f?f.disabled:true};})()`,
      );
    } catch {}
    if (s && s.seed === 777 && s.status === "" && s.plate === false && s.format === false) {
      orderReenabled = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PR26 a redraw disables the plate controls mid-flight (no stale-world poster), re-enabled on the new proof",
    orderReady && midPoster.platesDisabled === true && midPoster.format === true && !!orderReenabled,
    JSON.stringify({ orderReady, midPoster, orderReenabled }),
  );
}

export async function pr27OrderDuring({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let pr27Ready = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try {
      ok = await evaluate<boolean>(
        `(()=>{const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return !!document.querySelector("#pr-preview svg")&&document.getElementById("pr-status").textContent===""&&!!g&&!g.disabled&&!!f&&!f.disabled;})()`,
      );
    } catch {}
    if (ok) {
      pr27Ready = true;
      break;
    }
    await sleep(50);
  }
  const pr27Start = await evaluate<{ platesDisabled: boolean; status: string }>(
    `(()=>{document.getElementById("pr-format").value="svg";window.__vellumLastPoster=undefined;document.querySelector('[data-poster="desk"]').click();const s=document.getElementById("pr-seed");s.value="888";document.getElementById("pr-draw").click();const plates=[...document.querySelectorAll("[data-poster]")];return{platesDisabled:plates.every((b)=>b.disabled),status:document.getElementById("pr-status").textContent};})()`,
  );
  let pr27Violated = false;
  let pr27OrderInDraw = false;
  let pr27Settled = null;
  for (let i = 0; i < 400; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; status: string; anyEnabled: boolean; orderDone: boolean }>(
        `(()=>{const st=window.__vellumPrintRoomState();const plates=[...document.querySelectorAll("[data-poster]")];return{seed:st.seed,status:document.getElementById("pr-status").textContent,anyEnabled:plates.some((b)=>!b.disabled),orderDone:!!window.__vellumLastPoster};})()`,
      );
    } catch {}
    if (s) {
      const drawing = s.status === "Pulling a proof…";
      if (drawing && s.orderDone) pr27OrderInDraw = true;
      if (drawing && s.anyEnabled) pr27Violated = true;
      if (s.seed === 888 && s.status === "" && s.anyEnabled) {
        pr27Settled = s;
        break;
      }
    }
    await sleep(30);
  }
  check(
    "PR27 an order finishing during a redraw keeps the counter closed until the new proof settles (reverse guard)",
    pr27Ready &&
      pr27Start.platesDisabled === true &&
      pr27OrderInDraw === true &&
      pr27Violated === false &&
      !!pr27Settled,
    JSON.stringify({ pr27Ready, pr27Start, pr27OrderInDraw, pr27Violated, pr27Settled }),
  );
}

const BOUND: Payload<boolean> = `(() => { const imgs = [...document.querySelectorAll("#pr-contents .plates img")];
  return !!window.__vellumBoundAtlas && document.body.classList.contains("has-atlas") && imgs.length > 0 && imgs.every((im) => im.complete && im.naturalWidth > 0) && !document.getElementById("pr-bind").disabled && !document.getElementById("pr-hide").disabled; })()`;
const bound = ({ evaluate, sleep }: SuiteContext, label: string): Promise<boolean> =>
  makeSettle({ evaluate, sleep })(BOUND, (d) => d, label, 400);

type MidBind = { target: string | null; binding: boolean; src: string } | null;
// Wiring, not the claim: Bind and the old thumbnail are pressed in one read so the turn lands while the re-bind is in flight; the claim is the blob drawing.
const TURN_OLD: Payload<MidBind> = `(() => { const img = document.querySelector('#pr-contents .plates figure[data-plate="theme-moisture"] img'), thumb = img && img.closest(".thumb");
  if (!thumb) return null; const target = img.src; document.getElementById("pr-bind").click(); thumb.click();
  return { target, binding: document.getElementById("pr-bind").disabled, src: document.getElementById("pr-turned").src }; })()`;
type Drawn = { src: string; complete: boolean; natural: number };
const TURNED: Payload<Drawn> = `(() => { const t = document.getElementById("pr-turned"); return { src: t.src, complete: t.complete, natural: t.naturalWidth }; })()`;

export async function pr24dLivePlate(ctx: SuiteContext): Promise<void> {
  const { evaluate, check, sleep } = ctx;
  const mid = await evaluate(TURN_OLD);
  try {
    const drawn = mid
      ? await makeSettle({ evaluate, sleep })(TURNED, (d) => d.complete || d.src !== mid.target, "print-room-old-plate")
      : null;
    check(
      "PR24d a plate turned while a re-bind is in flight is a live plate: the previous binding's thumbnail, pressed after Bind, turns its own blob onto the sheet and it draws, so no blob is revoked before the new binding lands",
      !!mid &&
        mid.binding &&
        mid.src === mid.target &&
        !!drawn &&
        drawn.src === mid.target &&
        drawn.complete &&
        drawn.natural > 0,
      JSON.stringify({ mid, drawn }),
    );
  } finally {
    await bound(ctx, "print-room-rebound");
  }
}

type Hidden = {
  atlasEmpty: boolean;
  hasAtlas: boolean;
  bindEnabled: boolean;
  printDisabled: boolean;
  hideDisabled: boolean;
  proofBack: boolean;
  pageAway: boolean;
  label: string | null;
  thumbs: number;
  plateLine: string;
};
// Wiring, not the claim: the gazetteer is turned with the element's own click and Hide pressed in the read that measures it, so a turn that fails reads as a fault and not a stop.
const GAZETTEER_UP: Payload<{ up: boolean; label: string | null } | null> =
  `(() => { const t = document.querySelector('#pr-contents .turn[data-plate="gazetteer"]'); if (!t) return null; t.click();
  return { up: !document.getElementById("pr-page").hidden, label: document.getElementById("map-viewport").getAttribute("aria-label") }; })()`;
const HIDE: Payload<Hidden> = `(() => { document.getElementById("pr-hide").click(); const el = (id) => document.getElementById(id);
  return { atlasEmpty: el("pr-atlas").children.length === 0, hasAtlas: document.body.classList.contains("has-atlas"), bindEnabled: !el("pr-bind").disabled, printDisabled: el("pr-print").disabled,
    hideDisabled: el("pr-hide").disabled, proofBack: !el("pr-preview").hidden && el("pr-turned").hidden, pageAway: el("pr-page").hidden, label: el("map-viewport").getAttribute("aria-label"),
    thumbs: document.querySelectorAll("#pr-contents .plates").length, plateLine: el("pr-plate-line").textContent }; })()`;

export async function pr25Hide(ctx: SuiteContext): Promise<void> {
  const { evaluate, check } = ctx;
  await evaluate(`document.getElementById("pr-bind").click()`);
  const ready = await bound(ctx, "print-room-bound-for-hide");
  const turned = ready ? await evaluate(GAZETTEER_UP) : null;
  const hidden = await evaluate(HIDE);
  check(
    "PR25 Hide dismisses the bound atlas and re-enables Bind: with the gazetteer turned up (its label the page's, the control), Hide puts the page face away and gives the gesture box back the proof's label, the proof back on the sheet, the contents unbound, the plate line cleared",
    !!turned &&
      turned.up &&
      !/^The proof\./.test(turned.label ?? "") &&
      hidden.atlasEmpty &&
      !hidden.hasAtlas &&
      hidden.bindEnabled &&
      hidden.printDisabled &&
      hidden.hideDisabled &&
      hidden.proofBack &&
      hidden.pageAway &&
      /^The proof\./.test(hidden.label ?? "") &&
      hidden.thumbs === 0 &&
      hidden.plateLine === "",
    JSON.stringify({ turned, hidden }),
  );
}
