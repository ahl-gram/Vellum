// The Chart Table under the 1024 floor (Issue #762 pull request C; Alex, 2026-10-06, issuecomment-6010814718): below 1024 the Explorer lays out the 1024 page and the window scrolls sideways over it, so the drawer, its tab and the dog-ear's mouse carry work there as at 1024, and touch is a tablet's at 1024.
import type { Payload, Point } from "../../types.ts";
import type { DragKit } from "./kit.ts";
import { CARRY, DEEP, DRAWN, DRESS, ONE, READ, atInset, atRest, drawerUp } from "./reads.ts";
import type { Cam } from "./reads.ts";

type Drawer = {
  tabShown: boolean;
  tab: Point | null;
  open: boolean;
  folded: boolean;
  drawerH: number;
  lowestOff: number | null;
  minOffH: number;
  drawerAnims: string[];
  innerH: number;
  scrollX: number;
  maxX: number;
};
const DRAWER: Payload<Drawer> = `(() => {
  const d = document.getElementById("chart-drawer"), t = document.getElementById("chart-drawer-tab"), root = document.documentElement;
  const tb = t ? t.getBoundingClientRect() : null;
  const offs = [...document.querySelectorAll("#cuttings .off")].map((b) => b.getBoundingClientRect());
  return { tabShown: !!t && getComputedStyle(t).display !== "none", tab: tb && tb.width > 0 && tb.right <= window.innerWidth ? { x: Math.round(tb.x + tb.width / 2), y: Math.round(tb.y + tb.height / 2) } : null,
    open: d.classList.contains("open"), folded: document.querySelector(".slip").classList.contains("folded"), drawerH: +d.getBoundingClientRect().height.toFixed(1),
    lowestOff: offs.length ? Math.max(...offs.map((o) => o.y)) : null, minOffH: offs.length ? Math.min(...offs.map((o) => o.height)) : 0,
    drawerAnims: d.getAnimations().map((a) => a.playState), innerH: window.innerHeight, scrollX: window.scrollX, maxX: root.scrollWidth - root.clientWidth };
})()`;

async function openByTab(kd: DragKit, label: string): Promise<Drawer> {
  const at = await kd.evaluate(DRAWER);
  if (!at.tab) throw new Error(`${label}: the drawer's tab is not in the window to press (${JSON.stringify(at)})`);
  await kd.clickAt(at.tab.x, at.tab.y);
  return kd.settle(DRAWER, (d, last) => d.open && drawerUp(d, last), label);
}

// A carry from the ear to a point on the sheet above the drawer's band at both heights, released there so it snaps back: the ghost is read mid-carry against the pointer, in the window's coordinates, which is what a reader sees.
const ABOVE_BAND = 90;
async function ghostAt(kd: DragKit, to: Point, label: string) {
  const { mid } = await kd.carry(to);
  const scrollX = await kd.evaluate<number>("window.scrollX");
  await kd.release(to.x, to.y);
  await kd.settle(CARRY, atRest, label);
  const g = mid.ghost;
  const off = g ? +(parseFloat(g.translate) - scrollX + g.w - 10 - to.x).toFixed(1) : null;
  return { scrollX, off, ghost: !!g };
}

export async function na2DrawerBelowFloor(kd: DragKit): Promise<void> {
  const { send, setTouch, check, go, settle, evaluate } = kd;
  await setTouch(false);
  const faults: string[] = [];
  const rows: string[] = [];
  for (const h of [800, 400]) {
    await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: h, deviceScaleFactor: 1, mobile: false });
    await go(`${DRESS}&table=${ONE}`);
    const wide = await openByTab(kd, `NA2 the drawer at 1024x${h}`);
    await send("Emulation.setDeviceMetricsOverride", { width: 640, height: h, deviceScaleFactor: 1, mobile: false });
    await go(`${DRESS}&${DEEP}&table=${ONE}`);
    await settle(READ, atInset, `NA2 the inset at 640x${h}`, DRAWN);
    const ear = await kd.earPoint();
    const unscrolled =
      ear && ear.x < 600
        ? await ghostAt(kd, { x: Math.max(40, ear.x - 160), y: ABOVE_BAND }, `NA2 snapped at 640x${h}`)
        : null;
    await evaluate("window.scrollTo(document.documentElement.scrollWidth, 0)");
    const scrolledEar = await kd.earPoint();
    const scrolled =
      scrolledEar && scrolledEar.x > 40 && scrolledEar.x < 640
        ? await ghostAt(kd, { x: Math.max(40, scrolledEar.x - 160), y: ABOVE_BAND }, `NA2 snapped scrolled at 640x${h}`)
        : null;
    const before = await evaluate(DRAWER);
    const narrow = await openByTab(kd, `NA2 the drawer at 640x${h}`);
    const at = `640x${h}`;
    if (!unscrolled || !unscrolled.ghost || unscrolled.off === null || Math.abs(unscrolled.off) > 1)
      faults.push(
        `${at}: the ghost of an unscrolled carry is not under the pointer (${JSON.stringify({ ear, unscrolled })})`,
      );
    if (!scrolled || !scrolled.ghost || scrolled.scrollX < 300 || scrolled.off === null || Math.abs(scrolled.off) > 1)
      faults.push(
        `${at}: the ghost of a carry scrolled sideways is not under the pointer (${JSON.stringify({ scrolledEar, scrolled })})`,
      );
    if (!before.tabShown || before.open || before.folded)
      faults.push(`${at}: before the press the tab is not shown over an open Broadside (${JSON.stringify(before)})`);
    if (!narrow.folded || Math.abs(narrow.drawerH - wide.drawerH) > 0.5)
      faults.push(
        `${at}: the drawer opens ${narrow.drawerH} tall with the Broadside ${narrow.folded ? "folded" : "open"}, against ${wide.drawerH} at 1024x${h}`,
      );
    rows.push(
      `${at}: ghost off ${unscrolled?.off} unscrolled, ${scrolled?.off} at scroll ${scrolled?.scrollX}; drawer ${narrow.drawerH} against ${wide.drawerH}`,
    );
  }
  check(
    "NA2 below 1024 the Explorer's drawer works as at 1024: at 640x800 and 640x400 a real mouse carries the dog-ear with its ghost under the pointer both unscrolled and with the window scrolled sideways to the page's end, and the drawer's tab, shown, opens the drawer at the height it has at 1024 on the same window and folds the Broadside (Alex, 2026-10-06, Issue #762: the 1024 floor, the Chart Table's phone leaf gone)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}

// CD48 (Issue #523 build item 4), moved to a 1024 tablet when the narrow layout went (Issue #762 pull request C): the handle's touch drag first, the pan control LAST, since a pan at DEEP can recommit the inset and rebuild the ear. No tap files a sheet first, as it did at 640, since at 1024 the filing opens the drawer and folds the Broadside, whose refit moves the camera under the read.
export async function cd48TouchHandle({
  evaluate,
  check,
  sleep,
  touch,
  touchPan,
  settle,
  go,
  setNarrowViewport,
  clearMobile,
  send,
}: DragKit): Promise<void> {
  await setNarrowViewport(1024, 844);
  await go(`${DRESS}&${DEEP}`);
  await settle(READ, atInset, "chart-drawer-tablet-inset", DRAWN);
  const ear = `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`;
  const camBefore = await settle<Cam>(
    `window.__vellumZoomState()`,
    (d, last) => !!last && d.x === last.x && d.y === last.y && d.k === last.k,
    "chart-drawer-tablet-camera-rest",
  );
  const earNow = await evaluate<Point | null>(ear);
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
  const afterHandle = await evaluate<{ cam: Cam; ghost: boolean; drag: boolean; cuttings: number }>(
    `({ cam: window.__vellumZoomState(), ghost: !!document.querySelector(".sheet-ghost"), drag: document.body.classList.contains("sheet-drag"), cuttings: document.querySelectorAll("#cuttings li").length })`,
  );
  const panFrom = await evaluate<{
    x: number;
    y: number;
    on: string;
  } | null>(`(() => { const inset = document.querySelector("#map .region-inset"); const b = inset ? inset.getBoundingClientRect() : null; if (!b) return null;
      for (const [fx, fy] of [[0.15, 0.85], [0.3, 0.7], [0.5, 0.5], [0.2, 0.3]]) { const x = Math.round(b.x + b.width * fx), y = Math.round(b.y + b.height * fy); const h = document.elementFromPoint(x, y); if (h && !h.closest(".dog-ear") && !h.closest(".place-hit") && h.closest("#map-viewport")) return { x, y, on: h.tagName }; }
      return null; })()`);
  if (panFrom) await touchPan(panFrom.x, panFrom.y, panFrom.x + 80, panFrom.y + 60);
  await sleep(500);
  const afterPan = await evaluate<Cam>(`window.__vellumZoomState()`);
  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  check(
    "CD48 on a 1024 tablet a touch that begins on the dog-ear and drags neither pans nor zooms the map, never raises a ghost and files nothing (touch never drags, Issue #401 ruling 6), while a touch that begins beside it on the chart still pans, the control that proves the camera was listening: the first is the ear's stopped touchstart, the second is d3 bound under touch emulation that was active BEFORE the navigate (Issue #523 build item 4; at 1024 since Issue #762)",
    !!earNow &&
      camBefore.k === afterHandle.cam.k &&
      camBefore.x === afterHandle.cam.x &&
      camBefore.y === afterHandle.cam.y &&
      !ghostSeen &&
      !afterHandle.ghost &&
      !afterHandle.drag &&
      afterHandle.cuttings === 0 &&
      !!panFrom &&
      (afterPan.x !== camBefore.x || afterPan.y !== camBefore.y),
    JSON.stringify({ ear: earNow, camBefore, afterHandle, ghostSeen, panFrom, afterPan }),
  );
}
