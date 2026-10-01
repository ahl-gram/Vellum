import { slideRested, foldRested } from "../../support/slide.ts";
import type { Payload, Point } from "../../types.ts";

type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number };
export type Read = { open: boolean; tabText: string | null; tabShown: boolean; count: string | null; cuttings: number; imgs: number; frames: number; titles: string[]; decoded: boolean[]; offs: number; offsReachable: number; offRects: { y: number; h: number }[]; lowestOff: number | null; minOffH: number; drawerAnims: string[]; slideMs: string | null; innerH: number; fullShown: boolean; roadDisabled: boolean; ear: { label: string | null; rect: Rect } | null; insetRect: Rect | null; insetSvgs: number; lastSvgIsSurvey: boolean; status: string; statusFadeMs: string | null; hashTable: string | null; rawHash: string; path: string; scrollW: number; innerW: number };
export type Cam = { x: number; y: number; k: number };
type Ghost = { tag: string; src: string; pos: string; pe: string; translate: string; w: number; rotate: string; z: string; inMap: boolean };
type Carry = { ghost: Ghost | null; drag: boolean; open: boolean; receiving: boolean; folded: boolean; cuttings: number; landing: boolean; landingRuns: number; jolt: boolean; joltRuns: number; sel: number; cursor: string | null; cam: Cam | null; hashTable: string | null; status: string; innerH: number };
type Surfaces = { open: boolean; folded: boolean; tabShown: boolean; lifted: string[]; seats: Record<string, number>; slipX: number; slipW: number; slipAnims: string[]; lowestOff: number | null; minOffH: number; drawerAnims: string[]; innerH: number; leafTabsDisplay: string | null; leafTabBoxes: number };
type Slides = Pick<Read, "lowestOff" | "minOffH" | "drawerAnims" | "innerH">;
type Folds = Pick<Surfaces, "slipX" | "slipW" | "slipAnims">;
type Rested = (d: Surfaces, last: Surfaces | null) => boolean;
export type Edge = { folded: boolean; tabShown: boolean; overlap: number; buttons: number[] };
type Leaf = { tabs: { text: string; selected: string | null; press: string | null }[]; leafTabsDisplay: string | null; leafShown: boolean; formShown: boolean; cuttingsInLeaf: boolean; cuttingsShown: boolean; cuttings: number; columns: number; countText: string | null; roadInSlip: boolean; roadPress: string | null; otherRoads: number };
export type Card = { hits: number; shown: boolean; name: string | null; press: { text: string; dim: boolean; idx?: string; box: { x: number; y: number; w: number; h: number }; hit: string; disabled: boolean } | null; link: { hit: string; inActs: boolean } | null; actsRow: number; pressInActs: boolean; cuttings: number; prospects: number; titles: string[]; subs: string[]; imgs: number; decoded: boolean[]; frames: number; hashTable: string | null; seedBox: string | null; scrollW: number; innerW: number };
type Pp = { state: { year: number } | null; press: { text: string; dim: boolean; shown: boolean; centre: Point | null; hit: string; disabled: boolean } | null; count: string | null; inNote: boolean; roads: number; chartHref: string | null; hashTable: string | null };
export type Stored = { stored: string | null };
export type Back = Read & Stored & { marker: string | null; navType: string | null };

const SEED = 42;
// A camera settled deep enough to commit a band-3 inset, the same descent suite-region-detail drives.
export const DEEP = "cx=0.5625&cy=0.4375&k=8";
export const DRESS = `seed=${SEED}&style=antique&legend=1&arms=0&beasts=0`;

export const READ: Payload<Read> = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const drawer = document.getElementById("chart-drawer");
  const ear = document.querySelector("#map .region-inset .dog-ear");
  const inset = document.querySelector("#map .region-inset");
  return {
    open: !!drawer && drawer.classList.contains("open"),
    tabText: (document.getElementById("chart-drawer-tab") || {}).textContent || null,
    tabShown: (() => { const t = document.getElementById("chart-drawer-tab"); return !!t && getComputedStyle(t).display !== "none"; })(),
    count: (document.getElementById("chart-drawer-count") || {}).textContent || null,
    cuttings: document.querySelectorAll("#cuttings li").length,
    imgs: document.querySelectorAll("#cuttings img").length,
    frames: document.querySelectorAll("#cuttings .awaited").length,
    titles: [...document.querySelectorAll("#cuttings .label b")].map((b) => b.textContent),
    decoded: [...document.querySelectorAll("#cuttings img")].map((i) => i.naturalWidth > 0),
    offs: document.querySelectorAll("#cuttings .off").length,
    offsReachable: [...document.querySelectorAll("#cuttings .off")].filter((b) => { const r = b.getBoundingClientRect(); return document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)) === b; }).length,
    offRects: [...document.querySelectorAll("#cuttings .off")].map((b) => { const r = b.getBoundingClientRect(); return { y: +r.y.toFixed(2), h: +r.height.toFixed(2) }; }),
    lowestOff: (() => { const r = [...document.querySelectorAll("#cuttings .off")].map((b) => b.getBoundingClientRect().y); return r.length ? Math.max(...r) : null; })(),
    minOffH: (() => { const r = [...document.querySelectorAll("#cuttings .off")].map((b) => b.getBoundingClientRect().height); return r.length ? Math.min(...r) : 0; })(),
    drawerAnims: (() => { const d = document.getElementById("chart-drawer"); return d && d.getAnimations ? d.getAnimations().map((a) => a.playState) : []; })(),
    slideMs: (() => { const d = document.getElementById("chart-drawer"); return d ? getComputedStyle(d).animationDuration : null; })(),
    innerH: window.innerHeight,
    fullShown: (() => { const f = document.getElementById("chart-drawer-full"); return !!f && !f.hidden; })(),
    roadDisabled: (() => { const b = document.getElementById("table-road"); return !!b && b.disabled; })(),
    ear: ear ? { label: ear.getAttribute("aria-label"), rect: r("#map .region-inset .dog-ear") } : null,
    insetRect: r("#map .region-inset"),
    // The constraint the handle's markup is decided by: suite-region-detail reads the survey as the LAST svg in the inset.
    insetSvgs: document.querySelectorAll("#map .region-inset svg").length,
    lastSvgIsSurvey: (() => { const s = [...document.querySelectorAll("#map .region-inset svg")].pop(); return !!s && s.hasAttribute("data-vellum-region-u0"); })(),
    status: (document.getElementById("status") || {}).textContent || "",
    statusFadeMs: (() => { const s = document.getElementById("status"); return s ? getComputedStyle(s).transitionDuration : null; })(),
    hashTable: (new URLSearchParams(location.hash.slice(1))).get("table"),
    rawHash: location.hash,
    path: location.pathname,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  };
})()`;

// A settle that waits on a REGION JOB is not waiting on a transition: the worker draws a whole survey, which is real work that scales with the runner. The default 120 tries is 6s, sized on a laptop, and CI ran this lane 2.7x slower than local on the run that timed out. 400 tries is 20s, the same order as TOUR_TIMEOUT_MS, which is itself sized at roughly 10x the slowest matrix measured on CI.
export const DRAWN = 400;
export const atInset = (d: Read) => !!d.ear && d.insetSvgs === 1;
// No buttons at all reports pos at the viewport edge, not 0: 0 is inside the fold and would leave `size` alone rejecting a shut drawer.
const asSlide = (d: Slides | null) => (d ? { pos: d.lowestOff === null ? d.innerH : d.lowestOff, size: d.minOffH, anims: d.drawerAnims, viewportH: d.innerH } : null);
export const drawerUp = (d: Slides, last: Slides | null) => slideRested(asSlide(d)!, asSlide(last));
const asFold = (d: Folds | null) => (d ? { pos: d.slipX, size: d.slipW, anims: d.slipAnims } : null);
export const slipTravelled = (from: Folds) => (d: Folds, last: Folds | null) => foldRested(asFold(d)!, asFold(last),
  asFold(from)!);
export const both = (a: Rested, b: Rested) => (d: Surfaces, last: Surfaces | null) => a(d, last) && b(d, last);

export const CARRY: Payload<Carry> = `(() => {
    const g = document.querySelector(".sheet-ghost");
    const d = document.getElementById("chart-drawer");
    const li = document.querySelector("#cuttings li.landing");
    const cut = document.getElementById("cuttings");
    const cam = window.__vellumZoomState ? window.__vellumZoomState() : null;
    return {
      ghost: g ? { tag: g.tagName, src: g.src.slice(0, 5), pos: getComputedStyle(g).position, pe: getComputedStyle(g).pointerEvents, translate: g.style.translate, w: g.offsetWidth, rotate: getComputedStyle(g).rotate, z: getComputedStyle(g).zIndex, inMap: !!g.closest("#map") } : null,
      drag: document.body.classList.contains("sheet-drag"),
      open: d.classList.contains("open"), receiving: d.classList.contains("receiving"),
      folded: document.querySelector(".slip").classList.contains("folded"),
      cuttings: document.querySelectorAll("#cuttings li").length,
      landing: !!li, landingRuns: li ? li.getAnimations().filter((a) => a.playState === "running").length : 0,
      jolt: cut.classList.contains("jolt"), joltRuns: cut.classList.contains("jolt") ? cut.getAnimations().filter((a) => a.playState === "running").length : 0,
      sel: String(getSelection()).length,
      cursor: (() => { const e = document.elementFromPoint(640, 300); return e ? getComputedStyle(e).cursor : null; })(),
      cam: cam ? { x: +cam.x.toFixed(3), y: +cam.y.toFixed(3), k: cam.k } : null,
      hashTable: new URLSearchParams(location.hash.slice(1)).get("table"),
      status: (document.getElementById("status") || {}).textContent || "",
      innerH: window.innerHeight,
    };
  })()`;
export const sameCam = (a: Cam | null, b: Cam | null) => !!a && !!b && a.k === b.k && Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
export const atRest = (d: Carry, last: Carry | null) => !!last && !d.ghost && !d.landing && sameCam(d.cam, last.cam) && d.cuttings === last.cuttings;
// The settle's declared duration, read the CD23 way: the class is put on a scratch cutting with transitions suppressed, the cascade's answer is read, and the class comes off again.
export const DURATION: Payload<string | null> = `(() => { const li = document.querySelector("#cuttings li"); if (!li) return null; li.classList.add("landing"); const v = getComputedStyle(li).animationDuration; li.classList.remove("landing"); return v; })()`;
// The slip at rest with the drawer shut and the Broadside folded: the fold's own transition has ended and the room layout it schedules has had its 340ms.
export const FOLDREST: Payload<{ folded: boolean; open: boolean; slipX: number; anims: string[] }> = `(() => { const s = document.querySelector(".slip"); return { folded: s.classList.contains("folded"), open: document.getElementById("chart-drawer").classList.contains("open"), slipX: +s.getBoundingClientRect().x.toFixed(2), anims: s.getAnimations().map((a) => a.playState) }; })()`;

export const SURFACES: Payload<Surfaces> = `(() => {
    const slip = document.querySelector(".slip");
    const tab = document.querySelector(".slip-tab");
    const sheet = document.querySelector("#map svg").getBoundingClientRect();
    const onSheet = (b) =>
      Math.max(0, Math.min(b.right, sheet.right) - Math.max(b.left, sheet.left)) *
      Math.max(0, Math.min(b.bottom, sheet.bottom) - Math.max(b.top, sheet.top)) > 0;
    const name = (e) => (e.id ? "#" + e.id : "." + String(e.className || e.tagName).trim().split(/\\s+/).join("."));
    const lifted = [...document.querySelectorAll(".corner.bl.folio, .corner.br.zoomery, .legend:not(.in-slip)")]
      .filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0.5 && b.height > 0.5 && onSheet(b); })
      .map(name);
    // The seat itself, as a distance up from the foot of the window: the lift wrote a bottom offset, and the room's fit follows
    // the furniture, so a lifted piece can end up clear of a chart that shrank to accommodate it. The seat cannot lie.
    const seats = Object.fromEntries([...document.querySelectorAll(".corner.bl.folio, .legend:not(.in-slip)")]
      .map((e) => [name(e), +(window.innerHeight - e.getBoundingClientRect().bottom).toFixed(1)]));
    const drawer = document.getElementById("chart-drawer");
    const sb = slip.getBoundingClientRect();
    const offs = [...document.querySelectorAll("#cuttings .off")].map((b) => b.getBoundingClientRect());
    return {
      open: drawer.classList.contains("open"),
      folded: slip.classList.contains("folded"),
      tabShown: !!tab && getComputedStyle(tab).display !== "none",
      lifted, seats,
      slipX: +sb.x.toFixed(2), slipW: +sb.width.toFixed(2), slipAnims: slip.getAnimations().map((a) => a.playState),
      lowestOff: offs.length ? Math.max(...offs.map((o) => o.y)) : null,
      minOffH: offs.length ? Math.min(...offs.map((o) => o.height)) : 0,
      drawerAnims: drawer.getAnimations().map((a) => a.playState),
      innerH: window.innerHeight,
      // leafTabs*, never tabShown: this payload's tabShown is the Broadside's bookmark tab and READ's is the drawer's edge tab, so a third "tab" would be read as one of those two within the week (#547).
      leafTabsDisplay: (() => { const t = document.querySelector(".slip-head .sheet-tabs"); return t ? getComputedStyle(t).display : null; })(),
      leafTabBoxes: [...document.querySelectorAll(".slip-head .sheet-tabs button")].filter((b) => b.getBoundingClientRect().height > 0.5).length,
    };
  })()`;

export const LEAF: Payload<Leaf> = `(() => {
    const tabs = [...document.querySelectorAll(".slip-head .sheet-tabs button")];
    const name = (e) => (e ? (e.id ? "#" + e.id : "." + String(e.className || e.tagName).trim().split(/\\s+/).join(".")) : null);
    const press = (b) => { const r = b.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return "no-box";
      const h = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
      return h === b || b.contains(h) ? "self" : name(h); };
    const leaf = document.getElementById("table-leaf");
    const cut = document.getElementById("cuttings");
    return {
      tabs: tabs.map((b) => ({ text: (b.textContent || "").replace(/\\s+/g, " ").trim(), selected: b.getAttribute("aria-selected"), press: press(b) })),
      leafTabsDisplay: (() => { const t = document.querySelector(".slip-head .sheet-tabs"); return t ? getComputedStyle(t).display : null; })(),
      leafShown: !!leaf && getComputedStyle(leaf).display !== "none",
      formShown: (() => { const f = document.querySelector(".slip-body .broadside"); return !!f && getComputedStyle(f).display !== "none"; })(),
      cuttingsInLeaf: !!leaf && !!cut && leaf.contains(cut),
      cuttingsShown: !!cut && getComputedStyle(cut).display !== "none",
      cuttings: document.querySelectorAll("#cuttings li").length,
      columns: (() => { const c = document.getElementById("cuttings"); return c ? getComputedStyle(c).gridTemplateColumns.split(" ").filter(Boolean).length : 0; })(),
      countText: (() => { const c = document.getElementById("chart-drawer-count"); return c && c.offsetParent !== null ? c.textContent : null; })(),
      roadInSlip: (() => { const r = document.getElementById("table-road"); const d = document.querySelector(".slip .legend-dock"); return !!r && !!d && d.contains(r); })(),
      // The sheet's body scrolls, so a road below the fold hit-tests to nothing; bring it into view first, or the check
      // measures the viewport rather than the control. And an element inside a display:none parent still computes its OWN
      // display, so "is it shown" has to be read off the rect, not off getComputedStyle.
      roadPress: (() => { const r = document.getElementById("table-road"); if (!r) return null;
        r.scrollIntoView({ block: "center" });
        const b = r.getBoundingClientRect(); if (b.width < 1) return "no-box";
        const h = document.elementFromPoint(Math.round(b.x + b.width / 2), Math.round(b.y + b.height / 2)); return h === r || r.contains(h) ? "self" : (h ? (h.id || String(h.className)) : "none"); })(),
      otherRoads: [...document.querySelectorAll(".slip .legend-dock .legend .legend-btn")].filter((b) => b.getBoundingClientRect().width > 0.5 && b.id !== "table-road").length,
    };
  })()`;

export const CARD: Payload<Card> = `(() => {
    const press = document.querySelector("#place-card .pc-lay");
    const link = document.querySelector("#place-card .pc-prospect");
    const acts = document.querySelector("#place-card .pc-acts");
    const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
    const hit = (e) => { const b = box(e); if (!b || b.w < 1) return "no-box"; const h = document.elementFromPoint(b.x, b.y); return h === e || e.contains(h) ? "self" : (h ? (h.id || String(h.className)) : "none"); };
    return {
      hits: document.querySelectorAll(".place-overlay .place-hit").length,
      shown: !!document.getElementById("place-card") && !document.getElementById("place-card").hidden,
      name: (document.querySelector("#place-card .pc-name") || {}).textContent || null,
      press: press ? { text: press.textContent, dim: press.classList.contains("dim"), idx: press.dataset.idx, box: box(press), hit: hit(press), disabled: press.hasAttribute("disabled") } : null,
      link: link ? { hit: hit(link), inActs: !!acts && acts.contains(link) } : null,
      actsRow: acts ? acts.children.length : 0,
      pressInActs: !!acts && !!press && acts.contains(press),
      cuttings: document.querySelectorAll("#cuttings li").length,
      prospects: document.querySelectorAll("#cuttings li.prospect").length,
      titles: [...document.querySelectorAll("#cuttings .label b")].map((b) => b.textContent),
      subs: [...document.querySelectorAll("#cuttings .label i")].map((i) => i.textContent),
      imgs: document.querySelectorAll("#cuttings img").length,
      decoded: [...document.querySelectorAll("#cuttings img")].map((i) => i.naturalWidth > 0),
      frames: document.querySelectorAll("#cuttings .awaited").length,
      hashTable: new URLSearchParams(location.hash.slice(1)).get("table"),
      seedBox: (document.getElementById("seed") || {}).value || null,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    };
  })()`;

export const PP: Payload<Pp> = `(() => {
      const p = document.getElementById("pp-lay");
      const b = p ? p.getBoundingClientRect() : null;
      const centre = b && b.width > 1 ? { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } : null;
      const h = centre ? document.elementFromPoint(centre.x, centre.y) : null;
      return {
        state: window.__vellumProspectState ? window.__vellumProspectState() : null,
        press: p ? { text: p.textContent, dim: p.classList.contains("dim"), shown: !!b && b.width > 1, centre, hit: h === p || (p.contains(h)) ? "self" : (h ? (h.id || String(h.className)) : "none"), disabled: p.hasAttribute("disabled") } : null,
        count: (document.getElementById("pp-lay-count") || {}).textContent || null,
        inNote: !!document.querySelector("#note #pp-lay"),
        roads: [...document.querySelectorAll("#note .legend-dock .legend-btn, .legend .legend-row .legend-btn")].length,
        chartHref: (document.getElementById("pp-chart-link") || {}).getAttribute("href"),
        hashTable: new URLSearchParams(location.hash.slice(1)).get("table"),
      };
    })()`;

export const ONE = "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13";
