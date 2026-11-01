// Broadside e2e (BR1-BR23, Issue #270): the regrouped controls, seals, journal button and footnote apparatus on the built running page, and since Issue #779 part 2h the Explorer as authored and as dressed (BR9 to BR14), self-contained with scoped deltas.
import { dropExpectedCancellations } from "../support/console.ts";
import type { Payload, Point, SuiteContext } from "../types.ts";
import { makeSettle, makeStable, type Settle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import { br9Authored, br10Terms, br11Allowlist } from "./broadside/room.ts";
import { br12Dress, br21Fields, br22Bill, br23Imprint } from "./broadside/dress.ts";
import { br13Tip, br14Paper } from "./broadside/gestures.ts";
import { br15TabClear } from "./broadside/tab.ts";
import { br16To19, br17Holds, br20Twins } from "./broadside/shape.ts";
import { broadsideKit, type BroadsideKit } from "./broadside/kit.ts";

type Box = { l: number; r: number; t: number; b: number; w: number } | null;
type Room = {
  lg: Box;
  bl: Box;
  sl: Box;
  gl: Box;
  sh: Box;
  folioText: number;
  w: number;
  h: number;
  fonts: string;
  moving: boolean;
};

export const LEGEND_ROOM: Payload<Room> = `(()=>{const r=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const b=el.getBoundingClientRect();return{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)};};
      const lg=r(".legend"),bl=r(".corner.bl"),sl=r("#broadside"),gl=r(".corner.br"),sh=r("#sheet");
      const range=document.createRange();let text=0;for(const p of document.querySelectorAll(".corner.bl p")){if(!p.textContent)continue;range.selectNodeContents(p);text=Math.max(text,range.getBoundingClientRect().right);}
      const row=document.querySelector(".legend");const moving=!!row&&row.getAnimations().some((a)=>a.playState==="running");
      return{lg,bl,sl,gl,sh,folioText:Math.round(text),w:innerWidth,h:innerHeight,fonts:document.fonts.status,moving};})()`;
const legendClear = (m: Room): boolean =>
  !!m.lg &&
  m.lg.l >= m.folioText + 16 &&
  m.lg.r <= m.sl!.l - 8 &&
  m.lg.r <= m.gl!.l - 8 &&
  m.sh!.r <= m.gl!.l - 8 &&
  m.sh!.b <= Math.min(m.bl!.t, m.lg.t) - 8;
const sameBox = (a: Box, b: Box): boolean => JSON.stringify(a) === JSON.stringify(b);
const laidOutAt =
  (w: number, h: number, from: Room) =>
  (d: Room): boolean =>
    d.w === w && d.h === h && !sameBox(d.sh, from.sh) && !d.moving;

type Narrow = { iw: number; ih: number; sheet: Box };
export const NARROW: Payload<Narrow> = `(()=>{const e=document.getElementById("sheet");const b=e?e.getBoundingClientRect():null;return{iw:innerWidth,ih:innerHeight,sheet:b&&{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)}};})()`;
// Counted on the window, after the mark's own handler has run, so a count that rose means the page has handled the tap's click.
const COUNT_CLICKS = `(()=>{if(window.__br6Clicks===undefined){window.__br6Clicks=0;addEventListener("click",()=>{window.__br6Clicks++;});}return true;})()`;
export const CLICKS: Payload<{ n: number }> = `({ n: window.__br6Clicks })`;
type Tapped = { stayed: boolean; open: boolean; hasLink: boolean };
export const TAPPED: Payload<Tapped> = `(()=>{const n=document.getElementById("note-survey");
    return{stayed:location.pathname==="/explorer/",open:!!n&&n.matches(":popover-open"),
      hasLink:!!document.querySelector('#note-survey a[href="/glossary/#survey"]')};})()`;
export const MARK: Payload<Point | null> = `(()=>{const m=document.querySelector('a.fn[data-note="note-survey"]');
      if(!m)return null;
      m.scrollIntoView({block:"center"});const r=m.getBoundingClientRect();
      return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`;

export async function run(ctx: SuiteContext): Promise<void> {
  const { consoleErrors, http4xx } = ctx;
  // BR3, BR4, BR5 and BR8 are deliberately not stepped: the reads and gestures in them return rather than throwing, and their checks already guard on it.
  const step = makeStep(ctx);
  const k = broadsideKit(ctx);
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  await step("BR1 to BR1c", async () => {
    await br1Groups(k);
    await br1cLegendClears(k);
  });
  await step("BR12", () => br12Dress(k));
  await step("BR21", () => br21Fields(k));
  await step("BR11", () => br11Allowlist(k));
  await step("BR2", () => br2JournalPeer(k));
  await br3Seal(k);
  await br4Notes(k);
  await br5Hover(k);
  await step("BR13", () => br13Tip(k));
  await step("BR14", () => br14Paper(k));
  await step("BR6", () => br6Tap(k));
  await step("BR7", () => br7Glossary(k));
  await step("BR10", () => br10Terms(k));
  await step("BR9", () => br9Authored(k));
  await step("BR15", () => br15TabClear(k));
  await step("BR16 to BR19", () => br16To19(k));
  await step("BR17", () => br17Holds(k));
  await step("BR20", () => br20Twins(k));
  await step("BR22", () => br22Bill(k));
  await step("BR23", () => br23Imprint(k));
  br8Clean(ctx, errBase, httpBase);
}

async function br1Groups({ evaluate, check, goto, EXP }: BroadsideKit): Promise<void> {
  await goto(EXP + "#seed=42&style=antique", "broadside-base");
  const br1 = await evaluate<{ wrong: string[]; heads: (string | null)[] }>(`(()=>{
      const groupOf=(id)=>{const el=document.getElementById(id);const g=el&&el.closest('[role="group"]');
        return g?(g.getAttribute("aria-labelledby")||g.getAttribute("aria-label")):null;};
      const want={seed:"The seed",random:"The seed",draw:"The seed",type:"grp-land",band:"grp-land",land:"grp-strand",coast:"grp-strand",
        style:"grp-hand",theme:"grp-hand",legend:"grp-hand",arms:"grp-hand",ages:"grp-hand",
        "verso-turn":"grp-press","order-plates":"grp-press","journal-link":"grp-press"};
      const wrong=Object.entries(want).filter(([id,g])=>groupOf(id)!==g).map(([id])=>id+":"+groupOf(id));
      const heads=["grp-land","grp-strand","grp-hand","grp-press"].map((id)=>(document.getElementById(id)||{}).textContent);
      return{wrong,heads};
    })()`);
  check(
    "BR1 every control sits in its wiring-truth group: the seed row in the folio, the Land, the Strand and the Hand on the slip, the Press as the legend row",
    br1.wrong.length === 0 &&
      br1.heads[0] === "The Land" &&
      br1.heads[1] === "The Strand" &&
      br1.heads[2] === "The Hand" &&
      /^The Press\b/.test(br1.heads[3] || ""),
    JSON.stringify(br1),
  );

  const br1b = await evaluate<{ lLeft: number; cLeft: number; lRight: number; cRight: number }>(`(()=>{
      const l=document.getElementById("land").getBoundingClientRect();
      const c=document.getElementById("coast").getBoundingClientRect();
      return{lLeft:Math.round(l.left*10)/10,cLeft:Math.round(c.left*10)/10,
        lRight:Math.round(l.right*10)/10,cRight:Math.round(c.right*10)/10};
    })()`);
  check(
    "BR1b the sea-level and coast tracks share both edges (equal length, one column)",
    Math.abs(br1b.lLeft - br1b.cLeft) <= 1 && Math.abs(br1b.lRight - br1b.cRight) <= 1,
    JSON.stringify(br1b),
  );
}

export async function br1cLegendClears({ evaluate, send, check, sleep }: BroadsideKit): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  const at1280 = await stable(LEGEND_ROOM, "BR1c the legend row at rest at 1280", {
    departed: (d) => d.fonts === "loaded" && !d.moving,
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 1680, height: 900, deviceScaleFactor: 1, mobile: false });
  let at1680: Room;
  let back: Room;
  try {
    at1680 = await stable(LEGEND_ROOM, "BR1c the room laid out at 1680x900", {
      departed: laidOutAt(1680, 900, at1280),
    });
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    back = await stable(LEGEND_ROOM, "BR1c the room laid out at 1280x800", { departed: laidOutAt(1280, 800, at1680) });
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
  await stable(LEGEND_ROOM, "BR1c the room laid out again after the override", {
    departed: (d) => d.h !== 800 && !sameBox(d.sh, back.sh) && !d.moving,
  });
  check(
    "BR1c the legend row and the sheet clear the chart folio, the Glass and the open slip at 1280, at 1680 after a resize, and back again (#463)",
    legendClear(at1280) && legendClear(at1680) && legendClear(back),
    JSON.stringify({ at1280, at1680, back }),
  );
}

async function br2JournalPeer({ evaluate, check, waitInked }: BroadsideKit): Promise<void> {
  // Tick, wait-for-ink, and untick are three separate turns (Issue #300): inside ONE evaluate the yield cancels the arm before it builds, so `during` would be measured on a never-armed sheet.
  const at = `((el)=>({shown:el.getClientRects().length>0,top:Math.round(el.getBoundingClientRect().top)}))`;
  const before = await evaluate<{
    j: { shown: boolean; top: number };
    o: { shown: boolean; top: number };
    cls: boolean;
    tops: number[];
  }>(`(()=>{
      const j=document.getElementById("journal-link"),o=document.getElementById("order-plates");const at=${at};
      const tops=[...document.querySelectorAll(".legend .legend-row > .legend-btn")].filter((b)=>b.getClientRects().length>0).map((b)=>Math.round(b.getBoundingClientRect().top));
      return{j:at(j),o:at(o),cls:j.className===o.className&&j.classList.contains("legend-btn"),tops};
    })()`);
  await evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  await waitInked("br2-survey-ink");
  const during = await evaluate<{ shown: boolean; top: number }>(
    `(()=>{const at=${at};return at(document.getElementById("journal-link"));})()`,
  );
  await evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  const after = await evaluate<{ shown: boolean; top: number }>(
    `(()=>{const at=${at};return at(document.getElementById("journal-link"));})()`,
  );
  const br2 = { before, during, after, sameRow: before.j.top === before.o.top };
  check(
    "BR2 the Press keeps one row on seed 42 at the harness's window, every press on it, and the journal button is the print link's steady gold peer: same row, standing through tick and untick",
    br2.before.cls &&
      br2.sameRow &&
      br2.before.tops.length === 3 &&
      new Set(br2.before.tops).size === 1 &&
      br2.before.j.shown &&
      br2.during.shown &&
      br2.after.shown &&
      br2.before.j.top === br2.during.top &&
      br2.during.top === br2.after.top,
    JSON.stringify(br2),
  );
}

async function br3Seal({ evaluate, check }: BroadsideKit): Promise<void> {
  const br3 = await evaluate<{
    off: { mark: string; bg: string };
    on: { mark: string; bg: string; checked: boolean; hash: string };
    back: { mark: string; bg: string; checked: boolean };
    isSeal: boolean;
    type: string;
  }>(`(()=>{
    const box=document.getElementById("ages");const lbl=box.closest("label");
    const face=()=>({mark:getComputedStyle(lbl,"::before").content,bg:getComputedStyle(lbl).backgroundColor});
    const off=face();
    lbl.click();
    const on={...face(),checked:box.checked,hash:location.hash};
    lbl.click();
    const back={...face(),checked:box.checked};
    return{off,on,back,isSeal:lbl.classList.contains("seal"),type:box.type};
  })()`);
  check(
    "BR3 a seal label click toggles its real checkbox and the countersign (check mark + fill) follows",
    br3.isSeal &&
      br3.type === "checkbox" &&
      br3.on.checked === true &&
      br3.back.checked === false &&
      !br3.off.mark.includes("✓") &&
      br3.on.mark.includes("✓") &&
      !br3.back.mark.includes("✓") &&
      br3.off.bg !== br3.on.bg &&
      /(^|&)survey(&|$)/.test(br3.on.hash.slice(1)),
    JSON.stringify(br3),
  );
}

async function br4Notes({ evaluate, send, check }: BroadsideKit): Promise<void> {
  const br4a = await evaluate<{ wired: boolean; open: boolean; closed: boolean; reopened: boolean }>(`(()=>{
    const mark=document.querySelector('a.fn[data-note="note-seeds-choice"]');
    const note=document.getElementById("note-seeds-choice");
    const wired=mark.getAttribute("aria-describedby")==="note-seeds-choice"&&note.getAttribute("role")==="tooltip";
    mark.focus();
    const open=note.matches(":popover-open")&&note.getClientRects().length>0;
    mark.blur();
    const closed=!note.matches(":popover-open");
    mark.focus();
    return{wired,open,closed,reopened:note.matches(":popover-open")};
  })()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  const br4b = await evaluate<{ escClosed: boolean; focusHeld: boolean }>(`(()=>{
    const note=document.getElementById("note-seeds-choice");
    return{escClosed:!note.matches(":popover-open"),focusHeld:document.activeElement===document.querySelector('a.fn[data-note="note-seeds-choice"]')};
  })()`);
  check(
    "BR4 a mark's note opens on focus, closes on blur, and Escape dismisses it with focus held",
    br4a.wired && br4a.open && br4a.closed && br4a.reopened && br4b.escClosed && br4b.focusHeld,
    JSON.stringify({ br4a, br4b }),
  );
}

export async function br5Hover({ evaluate, send, check }: BroadsideKit): Promise<void> {
  const rect = await evaluate<Point>(`(()=>{const m=document.querySelector('a.fn[data-note="note-coast-warp"]');
    const r=m.getBoundingClientRect();return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
  const overOpen = await evaluate<boolean>(`document.getElementById("note-coast-warp").matches(":popover-open")`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 4, y: 4 });
  const awayClosed = await evaluate<boolean>(`!document.getElementById("note-coast-warp").matches(":popover-open")`);
  check(
    "BR5 the note shows under a real hover and hides when the pointer leaves",
    overOpen && awayClosed,
    JSON.stringify({ overOpen, awayClosed }),
  );
}

// The post-tap sleep lets a pending anchor navigation COMMIT before a fresh evaluate reads the path: a same-evaluate read cannot see it (the guard-prover proved a dropped preventDefault survived that shape).
async function tapAt({ evaluate, sleep, touch }: BroadsideKit, settle: Settle): Promise<boolean> {
  const p = await evaluate(MARK);
  if (!p) return false;
  const { n } = await evaluate(CLICKS);
  await touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
  await touch("touchEnd", []);
  await settle(CLICKS, (d) => d.n > n, "BR6 the tap's click");
  await sleep(500, "window: a wrongful anchor navigation would commit in it");
  return true;
}

async function narrowTaps(k: BroadsideKit, before: Narrow) {
  const { evaluate, sleep } = k;
  const settle = makeSettle({ evaluate, sleep });
  const emulated = await evaluate<boolean>(`window.matchMedia("(hover: none)").matches`);
  await makeStable(settle)(NARROW, "BR6 the room laid out at 1024x700", {
    departed: (d) => d.iw === 1024 && d.ih === 700 && !sameBox(d.sheet, before.sheet),
  });
  await evaluate(COUNT_CLICKS);
  const tapped1 = await tapAt(k, settle);
  const afterTap1 = await evaluate(TAPPED);
  const tapped2 = await tapAt(k, settle);
  const afterTap2 = await evaluate(TAPPED);
  return { emulated, tapped1, tapped2, afterTap1, afterTap2 };
}

export async function br6Tap(k: BroadsideKit): Promise<void> {
  const { evaluate, check, setNarrowViewport, clearMobile } = k;
  // REAL CDP taps fire the full compat sequence a synthetic .click() skips (which once hid an off-by-one here); device metrics + touch emulation is what actually flips the hover/pointer media in this browser, setEmulatedMedia's feature overrides are a no-op.
  const before = await evaluate(NARROW);
  await setNarrowViewport(1024, 700);
  const taps = await narrowTaps(k, before).finally(() => clearMobile());
  const { emulated, tapped1, tapped2, afterTap1, afterTap2 } = taps;
  check(
    "BR6 under hover:none, on a 1024 tablet since the narrow layout went (Issue #762), a real tap opens the note without navigating and a second tap closes it",
    emulated &&
      tapped1 &&
      tapped2 &&
      afterTap1.open &&
      afterTap1.stayed &&
      afterTap1.hasLink &&
      !afterTap2.open &&
      afterTap2.stayed,
    JSON.stringify(taps),
  );
}

async function br7Glossary({ evaluate, check, gotoPlain, PORT }: BroadsideKit): Promise<void> {
  await gotoPlain(`http://127.0.0.1:${PORT}/glossary/`, "broadside-glossary");
  const br7 = await evaluate<{ missing: string[]; head: string | null; indexed: boolean }>(`(()=>{
      const ids=["broadside","seeds-choice","shape","islands","coast-warp","survey","verso"].map((id)=>[id,!!document.getElementById(id)]);
      const section=document.getElementById("drafting-table");
      const indexed=!!document.querySelector('#index .index a.sec[href="#drafting-table"]');
      return{missing:ids.filter(([,ok])=>!ok).map(([id])=>id),
        head:section?section.textContent:null,indexed};
    })()`);
  check(
    "BR7 every mark's glossary anchor exists, the drafting-table section presides over the control terms, and the index slip lists it (the TOC's successor, #462)",
    br7.missing.length === 0 && br7.head === "At the drafting table" && br7.indexed,
    JSON.stringify(br7),
  );
}

function br8Clean(ctx: SuiteContext, errBase: number, httpBase: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  // This suite chains Page.navigate hops from its first goto, which is the condition the shared drop exists for.
  const errDelta = dropExpectedCancellations(consoleErrors.slice(errBase));
  check(
    "BR8 the broadside flow is clean (no console errors, no 4xx)",
    errDelta.length === 0 && http4xx.length === httpBase,
    JSON.stringify({ errs: errDelta, http: http4xx.slice(httpBase) }),
  );
}
