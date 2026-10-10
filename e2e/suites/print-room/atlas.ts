import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { clearMetrics, pressAt } from "./kit.ts";
import type { Matter } from "./reads.ts";

export async function pr20Bind({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await evaluate(
    `(()=>{const s=document.getElementById("pr-seed");s.value="42";document.getElementById("pr-style").value="antique";document.getElementById("pr-draw").click();})()`,
  );
  let bindReady = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try {
      ok = await evaluate<boolean | null>(
        `(()=>{const st=window.__vellumPrintRoomState();const b=document.getElementById("pr-bind");return st.seed===42&&document.getElementById("pr-status").textContent===""&&b&&!b.disabled;})()`,
      );
    } catch {}
    if (ok) {
      bindReady = true;
      break;
    }
    await sleep(50);
  }
  check("PR20a the Bind button enables once a proof is on the desk", bindReady);

  await evaluate(`document.getElementById("pr-bind").click()`);
  let bound = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{
        seed: number;
        title: string;
        figs: number;
        plates: number;
        print: boolean;
        dl: boolean;
        hide: boolean;
        hasAtlas: boolean;
        imgs: number;
        loaded: boolean;
        heroHiddenOnScreen: boolean;
        heads: string[];
        prospectPlate: boolean;
        atlasHidden: boolean;
        turned: boolean;
        proofHidden: boolean;
        thumbs: number;
        inked: string | null;
        plateLine: string;
        stamp: string;
      } | null>(
        `(()=>{const b=window.__vellumBoundAtlas;if(!b)return null;const imgs=[...document.querySelectorAll("#pr-atlas img")];const hero=document.querySelector("#pr-atlas .hero-plate");return{seed:b.seed,title:b.title,figs:b.figures,plates:document.querySelectorAll("#pr-atlas figure:not(.banner)").length,print:!document.getElementById("pr-print").disabled,dl:!document.getElementById("pr-download").disabled,hide:!document.getElementById("pr-hide").disabled,hasAtlas:document.body.classList.contains("has-atlas"),imgs:imgs.length,loaded:imgs.length>0&&imgs.every(im=>im.complete&&im.naturalWidth>0),heroHiddenOnScreen:hero?getComputedStyle(hero).display==="none":false,heads:[...document.querySelectorAll("#pr-atlas h2")].map(h=>h.textContent),prospectPlate:[...document.querySelectorAll("#pr-atlas figcaption")].some(f=>f.textContent.startsWith("The Prospect of ")),atlasHidden:getComputedStyle(document.getElementById("pr-atlas")).display==="none",turned:(()=>{const t=document.getElementById("pr-turned");return !t.hidden&&/^blob:/.test(t.src);})(),proofHidden:document.getElementById("pr-preview").hidden,thumbs:document.querySelectorAll("#pr-contents .plates figure").length,inked:(document.querySelector("#pr-contents li.on .turn.here")||{dataset:{}}).dataset.plate||null,plateLine:document.getElementById("pr-plate-line").textContent,stamp:document.getElementById("pr-stamp").textContent};})()`,
      );
    } catch {}
    if (s && s.loaded) {
      bound = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PR20 Bind composes the atlas into the hidden document (every plate loads, off screen) and turns it onto the sheet: the hero on the sheet, a thumbnail per plate, delivery enabled (the #494 ruling)",
    !!bound &&
      bound.seed === 42 &&
      bound.title === "The Isle of Rahai" &&
      bound.plates >= 8 &&
      bound.print === true &&
      bound.dl === true &&
      bound.hide === true &&
      bound.hasAtlas === true &&
      bound.loaded === true &&
      bound.heroHiddenOnScreen === true &&
      bound.atlasHidden === true &&
      bound.turned === true &&
      bound.proofHidden === true &&
      bound.thumbs === bound.plates &&
      bound.inked === "antique" &&
      /^plate i of the bound atlas/.test(bound.plateLine) &&
      /^bound in \d+s$/.test(bound.stamp),
    JSON.stringify(bound),
  );

  const prospectAt = bound ? bound.heads.indexOf("The Prospect of the Capital") : -1;
  const regionAt = bound ? bound.heads.indexOf("Regional Surveys") : -1;
  check(
    "PR20c the bound preview shelves the capital's prospect between the surveys and the banners (#412)",
    !!bound &&
      bound.prospectPlate === true &&
      regionAt >= 0 &&
      prospectAt > regionAt &&
      prospectAt < bound.heads.indexOf("Banners of the Realms"),
    JSON.stringify(bound && { heads: bound.heads, prospectPlate: bound.prospectPlate }),
  );
}

export async function pr31Turns({ evaluate, check }: SuiteContext): Promise<void> {
  const turned = await evaluate<{
    ratio: number;
    src: string;
    hidden: boolean;
    on: string | undefined;
    here: string | undefined;
    line: string;
    proofHidden: boolean;
  } | null>(
    `(()=>{const b=document.querySelector('#pr-contents .plates figure[data-plate="prospect-capital"] .thumb');if(!b)return null;b.click();const s=document.getElementById("sheet").getBoundingClientRect();const t=document.getElementById("pr-turned");return{ratio:s.width/s.height,src:t.src.slice(0,5),hidden:t.hidden,on:(document.querySelector("#pr-contents li.on .cr-num")||{}).textContent,here:(document.querySelector("#pr-contents .plates figure.here")||{dataset:{}}).dataset.plate,line:document.getElementById("pr-plate-line").textContent,proofHidden:document.getElementById("pr-preview").hidden};})()`,
  );
  check(
    "PR31 a thumbnail turns the sheet: the prospect plate takes it at its own 520x384 aspect, its row and thumbnail inked (the #494 ruling; the fit cannot read an <img>'s viewBox)",
    !!turned &&
      Math.abs(turned.ratio - 520 / 384) < 0.01 &&
      turned.src === "blob:" &&
      turned.hidden === false &&
      turned.proofHidden === true &&
      turned.on === "viii" &&
      turned.here === "prospect-capital" &&
      /^plate viii of the bound atlas · the prospect of /.test(turned.line),
    JSON.stringify(turned),
  );
  const back = await evaluate<{
    ratio: number;
    here: string | undefined;
    line: string;
    zoomed: boolean;
    scrollY: number;
  } | null>(
    `(()=>{const b=document.querySelector('#pr-contents .turn[data-plate="theme-vegetation"]');if(!b)return null;b.click();const s=document.getElementById("sheet").getBoundingClientRect();return{ratio:s.width/s.height,here:(document.querySelector("#pr-contents .turn.here")||{dataset:{}}).dataset.plate,line:document.getElementById("pr-plate-line").textContent,zoomed:document.getElementById("map-viewport").classList.contains("zoomed"),scrollY:window.scrollY};})()`,
  );
  check(
    "PR31b an entry turns too: the vegetation survey at the chart's aspect, the camera at rest, the page unscrolled",
    !!back &&
      Math.abs(back.ratio - 1500 / 1157.931) < 0.01 &&
      back.here === "theme-vegetation" &&
      /^plate iii of the bound atlas · a thematic survey of vegetation$/.test(back.line) &&
      back.zoomed === false &&
      back.scrollY === 0,
    JSON.stringify(back),
  );

  const second = await evaluate<{ on: string | undefined; here: string | undefined; line: string } | null>(
    `(()=>{const b=document.querySelector('#pr-contents .turn[data-plate="theme-climate"]');if(!b)return null;b.click();return{on:(document.querySelector("#pr-contents li.on .cr-num")||{}).textContent,here:(document.querySelector("#pr-contents .turn.here")||{dataset:{}}).dataset.plate,line:document.getElementById("pr-plate-line").textContent};})()`,
  );
  check(
    "PR31c a later survey turns under its OWN numeral (#465 ruling 7): temperature is row iv and the folio's line says so, never the first survey's iii",
    !!second &&
      second.on === "iv" &&
      second.here === "theme-climate" &&
      second.line === "plate iv of the bound atlas · a thematic survey of temperature",
    JSON.stringify(second),
  );
}

export async function pr33BackMatter({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
  const MATTER_STATE: Payload<Matter> = `(()=>{const s=document.getElementById("sheet").getBoundingClientRect();const page=document.getElementById("pr-page");const inner=document.getElementById("pr-page-inner");return{ratio:s.width/s.height,aspect:Number(page.dataset.aspect),pageHidden:page.hidden,turnedHidden:document.getElementById("pr-turned").hidden,proofHidden:document.getElementById("pr-preview").hidden,on:(document.querySelector("#pr-contents li.on .cr-num")||{}).textContent,here:(document.querySelector("#pr-contents .turn.here")||{dataset:{}}).dataset.plate,line:document.getElementById("pr-plate-line").textContent,head:(inner.querySelector(".page-head")||{textContent:""}).textContent,places:inner.querySelectorAll("tbody tr").length,measureEmpty:document.getElementById("pr-page-measure").children.length===0,scrollY:window.scrollY,fits:page.getBoundingClientRect().bottom-inner.getBoundingClientRect().bottom,innerW:Math.abs(inner.getBoundingClientRect().width-page.clientWidth),noX:document.documentElement.scrollWidth<=document.documentElement.clientWidth,label:document.getElementById("map-viewport").getAttribute("aria-label")};})()`;
  await evaluate(
    `(()=>{const b=document.querySelector('#pr-contents .turn[data-plate="gazetteer"]');if(b)b.click();})()`,
  );
  let matter = null;
  for (let i = 0; i < 40; i++) {
    let m = null;
    try {
      m = await evaluate(MATTER_STATE);
    } catch {}
    matter = m;
    if (m && m.fits >= -0.5 && m.fits <= 2) break;
    await sleep(50);
  }

  check(
    "PR33 the gazetteer turns onto the stage as a page of the atlas (#497 seat p): the page face up at its measured portrait aspect, the folio's plate line, row xi inked (#465 ruling 7), the page unscrolled",
    !!matter &&
      matter.pageHidden === false &&
      matter.turnedHidden === true &&
      matter.proofHidden === true &&
      matter.aspect > 0 &&
      matter.aspect <= 0.75 &&
      Math.abs(matter.ratio - matter.aspect) < 0.01 &&
      matter.on === "xi" &&
      matter.here === "gazetteer" &&
      /^plate xi of the bound atlas · the gazetteer$/.test(matter.line) &&
      /^VELLUM · THE BOUND ATLAS OF The Isle of Rahai · CHART № 42$/.test(matter.head) &&
      matter.places > 0 &&
      matter.measureEmpty === true &&
      matter.scrollY === 0 &&
      matter.fits >= -0.5 &&
      matter.fits <= 2 &&
      matter.innerW < 1 &&
      matter.noX === true &&
      /^A page of the bound atlas: The gazetteer\./.test(matter.label!),
    JSON.stringify(matter),
  );

  await shoot("print-room-backmatter.png");

  const banners = await evaluate<{ on: string | undefined; line: string; arms: number; counted: string } | null>(
    `(()=>{const b=document.querySelector('#pr-contents .turn[data-plate="banners"]');if(!b)return null;b.click();const inner=document.getElementById("pr-page-inner");return{on:(document.querySelector("#pr-contents li.on .cr-num")||{}).textContent,line:document.getElementById("pr-plate-line").textContent,arms:inner.querySelectorAll(".banner").length,counted:(document.querySelector('#pr-contents li.on .n')||{textContent:""}).textContent};})()`,
  );
  check(
    "PR33b the banners turn too: the page carries every realm's arms and its row's count agrees",
    !!banners &&
      banners.on === "ix" &&
      /^plate ix of the bound atlas · the banners of every realm$/.test(banners.line) &&
      banners.arms > 0 &&
      banners.counted.includes(banners.arms + " arms"),
    JSON.stringify(banners),
  );
}

export async function pr34Leaned({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await evaluate(`document.getElementById("zoom-in").click()`);
  let leaned = false;
  for (let i = 0; i < 60; i++) {
    if (await evaluate<boolean>(`document.getElementById("map-viewport").classList.contains("zoomed")`)) {
      leaned = true;
      break;
    }
    await sleep(50);
  }
  const unleaned = await evaluate<{
    zoomed: boolean;
    pageHidden: boolean;
    turnedHidden: boolean;
    ratio: number;
    label: string | null;
  } | null>(
    `(()=>{const b=document.querySelector('#pr-contents .plates figure[data-plate="theme-vegetation"] .thumb');if(!b)return null;b.click();const s=document.getElementById("sheet").getBoundingClientRect();return{zoomed:document.getElementById("map-viewport").classList.contains("zoomed"),pageHidden:document.getElementById("pr-page").hidden,turnedHidden:document.getElementById("pr-turned").hidden,ratio:s.width/s.height,label:document.getElementById("map-viewport").getAttribute("aria-label")};})()`,
  );
  check(
    "PR34 a turn while leaned rests the camera and puts the page away: zoom in on the gazetteer, turn to the vegetation survey, the sheet back at the chart's aspect and k=1",
    leaned === true &&
      !!unleaned &&
      unleaned.zoomed === false &&
      unleaned.pageHidden === true &&
      unleaned.turnedHidden === false &&
      Math.abs(unleaned.ratio - 1500 / 1157.931) < 0.01 &&
      /^The proof\./.test(unleaned.label!),
    JSON.stringify({ leaned, unleaned }),
  );
}

export async function pr23Download({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // hasBlobUrl reads the downloaded FILE's own bytes: no blob: URL may be BAKED IN, though since Issue #368 the file's own script creates them at load. The metadata hook is read instead of the ~20MB string.
  await evaluate(
    `(()=>{window.__vellumLastAtlasDownload=undefined;document.getElementById("pr-download").click();})()`,
  );
  let dl = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate<{
        filename: string;
        size: number;
        dataUris: number;
        hasBlobUrl: boolean;
        hasExternalCss: boolean;
        title: string;
      } | null>(`window.__vellumLastAtlasDownload || null`);
    } catch {}
    if (s) {
      dl = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PR23 single-file download is self-contained (data-URI plates, no blob/external refs)",
    !!dl &&
      dl.dataUris >= 8 &&
      dl.hasBlobUrl === false &&
      dl.hasExternalCss === false &&
      dl.size > 1000000 &&
      dl.title === "The Isle of Rahai" &&
      /^vellum-atlas-42\.html$/.test(dl.filename),
    JSON.stringify(dl),
  );
}

export async function pr25Hide({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let reboundForHide = false;
  for (let i = 0; i < 260; i++) {
    let ok = null;
    try {
      ok = await evaluate<boolean>(
        `(()=>{const imgs=[...document.querySelectorAll("#pr-atlas img")];return !!window.__vellumBoundAtlas && imgs.length>0 && imgs.every(im=>im.complete) && !document.getElementById("pr-hide").disabled;})()`,
      );
    } catch {}
    if (ok) {
      reboundForHide = true;
      break;
    }
    await sleep(50);
  }
  const hidden = await evaluate<{
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
  }>(
    `(()=>{document.getElementById("pr-hide").click();return{atlasEmpty:document.getElementById("pr-atlas").children.length===0,hasAtlas:document.body.classList.contains("has-atlas"),bindEnabled:!document.getElementById("pr-bind").disabled,printDisabled:document.getElementById("pr-print").disabled,hideDisabled:document.getElementById("pr-hide").disabled,proofBack:!document.getElementById("pr-preview").hidden&&document.getElementById("pr-turned").hidden,pageAway:document.getElementById("pr-page").hidden,label:document.getElementById("map-viewport").getAttribute("aria-label"),thumbs:document.querySelectorAll("#pr-contents .plates").length,plateLine:document.getElementById("pr-plate-line").textContent};})()`,
  );
  check(
    "PR25 Hide dismisses the bound atlas and re-enables Bind: the proof back on the sheet, the contents unbound, the plate line cleared",
    reboundForHide &&
      hidden.atlasEmpty === true &&
      hidden.hasAtlas === false &&
      hidden.bindEnabled === true &&
      hidden.printDisabled === true &&
      hidden.hideDisabled === true &&
      hidden.proofBack === true &&
      hidden.pageAway === true &&
      /^The proof\./.test(hidden.label!) &&
      hidden.thumbs === 0 &&
      hidden.plateLine === "",
    JSON.stringify({ reboundForHide, hidden }),
  );
}

const TURN = `.slip .contents .turn[data-plate="theme-moisture"]`;
type Steady = { h: number; loaded: boolean };
const STEADY: Payload<Steady> = `(() => { const b = document.querySelector(".slip .slip-body"), imgs = [...document.querySelectorAll("#pr-contents .plates img")];
  return { h: b.scrollHeight, loaded: imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0) }; })()`;
const turnTo = (key: string): Payload<boolean> =>
  `(() => { document.querySelector('#pr-contents .turn[data-plate="${key}"]').click(); return true; })()`;

type Seat = { x: number; y: number; hit: boolean; s0: number; over: number } | null;
// The target's centre is put on the slip body's bottom edge, so a focus allowed to scroll would bring its successor into view; a listener after the page's own reads the scroll the moment the press's handler ends.
const SEAT: Payload<Seat> = `(() => {
  const body = document.querySelector(".slip .slip-body"), t = document.querySelector('${TURN}');
  if (!body || !t) return null;
  const br = body.getBoundingClientRect(), tr0 = t.getBoundingClientRect();
  body.scrollTop += tr0.top + tr0.height / 2 - br.bottom;
  const tr = t.getBoundingClientRect(), x = tr.left + Math.min(20, tr.width / 2), y = br.bottom - tr.height / 4;
  window.__pr31dPressed = t;
  document.getElementById("pr-contents").addEventListener("click", () => { window.__pr31dAtHandler = body.scrollTop; }, { once: true });
  return { x, y, hit: document.elementFromPoint(x, y) === t, s0: body.scrollTop, over: body.scrollHeight - body.clientHeight };
})()`;
type Turned = {
  detached: boolean;
  active: boolean;
  connected: boolean;
  same: boolean;
  atHandler: number;
  scroll: number;
  pageY: number;
  here: string | undefined;
};
const TURNED: Payload<Turned> = `(() => {
  const body = document.querySelector(".slip .slip-body"), a = document.activeElement, was = window.__pr31dPressed;
  return { detached: !!was && !was.isConnected, active: !!a && a.matches('${TURN}'), connected: !!a && a.isConnected, same: a === was, atHandler: window.__pr31dAtHandler,
    scroll: body.scrollTop, pageY: window.scrollY, here: (document.querySelector("#pr-contents .turn.here") || { dataset: {} }).dataset.plate };
})()`;

// Wiring, not the claim: each turn is rendered once before the read, since a list re-rendered before its thumbnails decode collapses and re-grows the slip's scroll (measured 2026-10-10).
async function warmTurns({ evaluate, sleep }: SuiteContext): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  for (const key of ["theme-moisture", "theme-climate"]) {
    await evaluate(turnTo(key));
    await settle(STEADY, (d, last) => d.loaded && !!last && d.h === last.h, "print-room-contents-steady");
  }
}

export async function pr31dFocusKept(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep } = ctx;
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  try {
    await warmTurns(ctx);
    const seat = await evaluate(SEAT);
    if (seat) await pressAt({ send }, seat.x, seat.y);
    const turned = seat
      ? await makeSettle({ evaluate, sleep })(
          TURNED,
          (d, last) => !!last && d.scroll === last.scroll,
          "print-room-turned",
        )
      : null;
    check(
      "PR31d a turn hands the focus to its successor without moving the slip: a real press on a contents row half under the slip body's bottom edge re-renders the list, and the re-rendered turn takes the focus while the slip's scroll and the page's stay where they were",
      !!seat &&
        seat.hit &&
        seat.over > 100 &&
        !!turned &&
        turned.here === "theme-moisture" &&
        turned.detached &&
        turned.active &&
        turned.connected &&
        !turned.same &&
        Math.abs(turned.atHandler - seat.s0) <= 2 &&
        Math.abs(turned.scroll - seat.s0) <= 2 &&
        turned.pageY === 0,
      JSON.stringify({ seat, turned }),
    );
  } finally {
    await clearMetrics(ctx, 1280, 800);
    await evaluate(
      `(() => { const b = document.querySelector(".slip .slip-body"); if (b) b.scrollTop = 0; if (document.activeElement) document.activeElement.blur(); delete window.__pr31dPressed; delete window.__pr31dAtHandler; return true; })()`,
    );
  }
}
