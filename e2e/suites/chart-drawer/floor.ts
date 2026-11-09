// The Chart Table's dog-ear under a finger on a 1024 tablet (Issue #762 pull request C; Alex, 2026-10-06, issuecomment-6010814718), where touch is a tablet's.
import { releaseChartTouch, takeChartTouch } from "../../support/chart-touch.ts";
import type { Payload, Point } from "../../types.ts";
import type { DragKit } from "./kit.ts";
import { DEEP, DRAWN, DRESS, READ, atInset } from "./reads.ts";
import type { Cam } from "./reads.ts";

const ZOOM_STATE: Payload<Cam> = `window.__vellumZoomState()`;

// CD48 (Issue #523 build item 4), moved to a 1024 tablet when the narrow layout went (Issue #762 pull request C): the handle's touch drag first, the pan control LAST, since a pan at DEEP can recommit the inset and rebuild the ear. No tap files a sheet first, as it did at 640, since at 1024 the filing opens the drawer and folds the Broadside, whose refit moves the camera under the read.
export async function cd48TouchHandle(kd: DragKit): Promise<void> {
  const { evaluate, sleep, touch, settle, go, setNarrowViewport } = kd;
  await setNarrowViewport(1024, 844);
  await go(`${DRESS}&${DEEP}`);
  await settle(READ, atInset, "chart-drawer-tablet-inset", DRAWN);
  await takeChartTouch(kd, true);
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
  await sleep(500, "window: the handle's touch must move no camera and lay no ghost in it");
  const afterHandle = await evaluate<{ cam: Cam; ghost: boolean; drag: boolean; cuttings: number }>(
    `({ cam: window.__vellumZoomState(), ghost: !!document.querySelector(".sheet-ghost"), drag: document.body.classList.contains("sheet-drag"), cuttings: document.querySelectorAll("#cuttings li").length })`,
  );
  await cd48Control(kd, { earNow, camBefore, afterHandle, ghostSeen });
}

type Seen = {
  earNow: Point | null;
  camBefore: Cam;
  afterHandle: { cam: Cam; ghost: boolean; drag: boolean; cuttings: number };
  ghostSeen: boolean;
};

export async function cd48Control(kd: DragKit, seen: Seen): Promise<void> {
  const { evaluate, check, stable, touchPan, clearMobile, send } = kd;
  const { earNow, camBefore, afterHandle, ghostSeen } = seen;
  const panFrom = await evaluate<{
    x: number;
    y: number;
    on: string;
  } | null>(`(() => { const inset = document.querySelector("#map .region-inset"); const b = inset ? inset.getBoundingClientRect() : null; if (!b) return null;
      for (const [fx, fy] of [[0.15, 0.85], [0.3, 0.7], [0.5, 0.5], [0.2, 0.3]]) { const x = Math.round(b.x + b.width * fx), y = Math.round(b.y + b.height * fy); const h = document.elementFromPoint(x, y); if (h && !h.closest(".dog-ear") && !h.closest(".place-hit") && h.closest("#map-viewport")) return { x, y, on: h.tagName }; }
      return null; })()`);
  if (panFrom) {
    await touchPan(panFrom.x, panFrom.y, panFrom.x + 80, panFrom.y + 60);
    await stable(ZOOM_STATE, "CD48 the pan beside the ear landed", {
      departed: (d) => d.x !== afterHandle.cam.x || d.y !== afterHandle.cam.y,
    });
  }
  const afterPan = await evaluate(ZOOM_STATE);
  await releaseChartTouch(kd);
  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  check(
    "CD48 on a 1024 tablet a touch that begins on the dog-ear and drags neither pans nor zooms the map, never raises a ghost and files nothing (touch never drags, Issue #401 ruling 6), while a touch that begins beside it on the chart still pans, the control that proves the camera was listening: the first is the ear's stopped touchstart, the second is d3 bound under touch emulation that was active BEFORE the navigate (Issue #523 build item 4; at 1024 since Issue #762; the chart's touch press is given first and taken back after (Issue #778))",
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
