import type { Point, SuiteContext } from "../../types.ts";
import type { DrawerKit } from "./kit.ts";
import { DEEP, DRAWN, DRESS, LEAF, READ, atInset } from "./reads.ts";
import type { Cam } from "./reads.ts";

export async function cd6PhoneDoor({ evaluate, check, sleep, touch, touchPan, settle, go }: DrawerKit): Promise<void> {
  await go(`${DRESS}&${DEEP}`);
  const phoneArmed = await settle(READ, atInset, "chart-drawer-phone-inset", DRAWN);
  const phoneEar = await evaluate<Point | null>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
  if (phoneEar) { await touch("touchStart", [{ x: phoneEar.x, y: phoneEar.y, id: 0 }]); await touch("touchEnd", []); }
  await sleep(1600);
  const phone = await evaluate(READ);
  const phoneDrawer = await evaluate<string>(`getComputedStyle(document.getElementById("chart-drawer")).display`);
  const phoneShut = await evaluate<string>(`(() => { const b = document.getElementById("chart-drawer-shut"); const r = b.getBoundingClientRect(); if (r.width < 1) return "no-box"; const h = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)); return h === b || b.contains(h) ? "reachable" : "eclipsed"; })()`);
  check(
    "CD6 at 390 the desktop drawer never paints, not even after a real tap on the dog-ear, and the tap FILES the sheet: the handle is the phone's own door into the table and it opens the drawer with no width term, so the stand-down has to cover the OPEN state and not just the resting one (#540; the filing half strengthened at Issue #523, whose drag must leave the tap the door it is)",
    !!phoneEar && !phoneArmed.open && phoneDrawer === "none" && phone.scrollW === phone.innerW && !phone.tabShown && phoneArmed.cuttings === 0 && phone.cuttings === 1,
    JSON.stringify({ tapped: phoneEar, drawerDisplay: phoneDrawer, open: phone.open, shutPress: phoneShut, scrollW: phone.scrollW, innerW: phone.innerW, cuttings: [phoneArmed.cuttings, phone.cuttings] }),
  );

  // CD48 (Issue #523 build item 4), in this order: the handle's touch drag first, the pan control LAST, since a pan at DEEP can recommit the inset and rebuild the ear, and nothing after it here reads the ear.
  const earNow = await evaluate<Point | null>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
  const camBefore = await evaluate<Cam>(`window.__vellumZoomState()`);
  let ghostSeen = false;
  if (earNow) {
    await touch("touchStart", [{ x: earNow.x, y: earNow.y, id: 0 }]);
    for (let i = 1; i <= 4; i++) {
      await touch("touchMove", [{ x: earNow.x - 30 * i, y: earNow.y + 40 * i, id: 0 }]);
      if (await evaluate<boolean>(`!!document.querySelector(".sheet-ghost")`)) ghostSeen = true;
    }
    await touch("touchEnd", []);
  }
  await sleep(500);
  const afterHandle = await evaluate<{ cam: Cam; ghost: boolean; drag: boolean; cuttings: number }>(`({ cam: window.__vellumZoomState(), ghost: !!document.querySelector(".sheet-ghost"), drag: document.body.classList.contains("sheet-drag"), cuttings: document.querySelectorAll("#cuttings li").length })`);
  const panFrom = await evaluate<{ x: number; y: number; on: string } | null>(`(() => { const inset = document.querySelector("#map .region-inset"); const b = inset ? inset.getBoundingClientRect() : null; if (!b) return null;
      for (const [fx, fy] of [[0.15, 0.85], [0.3, 0.7], [0.5, 0.5], [0.2, 0.3]]) { const x = Math.round(b.x + b.width * fx), y = Math.round(b.y + b.height * fy); const h = document.elementFromPoint(x, y); if (h && !h.closest(".dog-ear") && !h.closest(".place-hit") && h.closest("#map-viewport")) return { x, y, on: h.tagName }; }
      return null; })()`);
  if (panFrom) await touchPan(panFrom.x, panFrom.y, panFrom.x + 80, panFrom.y + 60);
  await sleep(500);
  const afterPan = await evaluate<Cam>(`window.__vellumZoomState()`);
  check(
    "CD48 at 390 a touch that begins on the handle neither pans nor zooms the map and never raises a ghost (touch never drags, Issue #401 ruling 6), while a touch that begins beside it on the chart still pans, the control that proves the camera was listening: the first is the ear's stopped touchstart, the second is d3 bound under touch emulation that was active BEFORE the navigate (Issue #523 build item 4)",
    !!earNow && !!camBefore && camBefore.k === afterHandle.cam.k && camBefore.x === afterHandle.cam.x && camBefore.y === afterHandle.cam.y && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      !ghostSeen && !afterHandle.ghost && !afterHandle.drag && afterHandle.cuttings === 1 &&
      !!panFrom && (afterPan.x !== camBefore.x || afterPan.y !== camBefore.y),
    JSON.stringify({ ear: earNow, camBefore, afterHandle, ghostSeen, panFrom, afterPan }),
  );
}

export async function cd14LeafTabs({ evaluate, check, sleep, touch, go }: DrawerKit, SIX: string): Promise<void> {
  await go(`${DRESS}&table=${SIX}`);
  await evaluate(`document.querySelector(".slip-handle").click()`);
  await sleep(500);
  const leafShut = await evaluate(LEAF);
  const tableTab = await evaluate<Point | null>(`(() => { const b = [...document.querySelectorAll(".slip-head .sheet-tabs button")].find((x) => /table/i.test(x.textContent || "")); if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
  if (tableTab) { await touch("touchStart", [{ x: tableTab.x, y: tableTab.y, id: 0 }]); await touch("touchEnd", []); }
  check(
    "CD14 the sheet's head carries the two leaf tabs and BOTH answer a real thumb: at narrow .slip-handle is inset:0 over the whole head, so a tab authored there is dead unless it takes its own layer (mock.css 230), and a tab nobody can press is the #520 dog-ear again. The row DRESSED as a row (#547): CD22 reads display none at 1280, and a stand-down written after the phone block would win everywhere and red here",
    leafShut.tabs.length === 2 && leafShut.tabs.every((t) => t.press === "self") &&
      /broadside/i.test(leafShut.tabs[0]!.text) && /^the table( · \d+)?$/i.test(leafShut.tabs[1]!.text) &&
      leafShut.leafTabsDisplay === "flex",
    JSON.stringify({ tabs: leafShut.tabs, display: leafShut.leafTabsDisplay }),
  );
}

// Was a hand-rolled loop that returned its last read BECAUSE a settle that gives up killed the lane. The step is what that comment was waiting for (#534), so the wait is a settle again and its timeout is CD15 and CD17 going red by name.
export async function cd15TableLeaf({ check, settle }: DrawerKit): Promise<void> {
  const leafOpen = await settle(LEAF, (d) => d.leafShown && d.cuttings === 6, "chart-drawer-leaf", DRAWN);
  check(
    "CD15 pressing The Table turns the sheet to its second leaf: the Broadside's form goes, the gathered sheets come up two across on the sheet's own parchment, and the count comes with them (#518 ruling 4)",
    leafOpen.leafShown && !leafOpen.formShown && leafOpen.cuttingsInLeaf && leafOpen.cuttings === 6 && leafOpen.columns === 2 && !!leafOpen.countText,
    JSON.stringify({ leaf: leafOpen.leafShown, form: leafOpen.formShown, inLeaf: leafOpen.cuttingsInLeaf, cuttings: leafOpen.cuttings, columns: leafOpen.columns, count: leafOpen.countText }),
  );
  check(
    "CD17 with the table leaf up the road out is the TABLE's road, docked in the sheet's legend where every other road out lives, and it answers a real thumb (#518 ruling 4)",
    leafOpen.roadInSlip && leafOpen.roadPress === "self" && leafOpen.otherRoads === 0,
    JSON.stringify({ inSlip: leafOpen.roadInSlip, press: leafOpen.roadPress, others: leafOpen.otherRoads }),
  );
}

export async function cd16LeafTurnsBack({ evaluate, check, sleep, touch }: SuiteContext): Promise<void> {
  const broadsideTab = await evaluate<Point | null>(`(() => { const b = [...document.querySelectorAll(".slip-head .sheet-tabs button")].find((x) => /broadside/i.test(x.textContent || "")); if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
  if (broadsideTab) { await touch("touchStart", [{ x: broadsideTab.x, y: broadsideTab.y, id: 0 }]); await touch("touchEnd", []); }
  await sleep(700);
  const backToForm = await evaluate(LEAF);
  check(
    "CD16 the leaf turns back: pressing The Broadside returns the form and puts the table away, so the reader is never one-way into either leaf",
    backToForm.tabs.length === 2 && backToForm.formShown && !backToForm.leafShown && backToForm.tabs[0]!.selected === "true" && backToForm.tabs[1]!.selected === "false",
    JSON.stringify({ form: backToForm.formShown, leaf: backToForm.leafShown, selected: backToForm.tabs.map((t) => t.selected) }),
  );
}
