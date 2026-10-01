import type { Point } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";
import { down, stagePoint } from "./reads.ts";

export async function l1jHint({ evaluate, check, sleep, wheelAt, freshGesture, readHint }: LandfallKit): Promise<void> {
  let hintOn = null;
  for (let i = 0; i < 20; i++) {
    hintOn = await readHint();
    if (hintOn !== null && hintOn.op === "1") break;
    await sleep(100);
  }
  await freshGesture();
  await wheelAt(await evaluate(stagePoint), -240);
  let hintOff = null;
  for (let i = 0; i < 20; i++) {
    await sleep(100);
    hintOff = await readHint();
    if (hintOff !== null && hintOff.op === "0") break;
  }
  check(
    "L1j the scroll hint pulses at full pull-back and stands down the moment the camera draws nearer (#472, 2026-08-28 ruling)",
    hintOn !== null && hintOn.op === "1" && hintOn.stood === true
      && hintOff !== null && hintOff.op === "0" && hintOff.stood === false,
    JSON.stringify({ hintOn, hintOff }),
  );
}

export async function l1kSurfaces({ evaluate, check, sleep, pressKey, clickAt, camNow, scrollY, centerOf, scrollToTop, scrollToFloor }: LandfallKit): Promise<void> {
  await scrollToFloor();
  const surfCamBefore = await camNow();
  // centerOf, never buttonPoint: buttonPoint scrollIntoViews the stage first, which un-scrolls the page and dissolves the very trap this arm exists to pin (the instruments' remnant is reachable down there).
  const zoomInPt = await centerOf("#zoom-in");
  if (zoomInPt !== null) await clickAt(zoomInPt.x, zoomInPt.y);
  let surfaced = null;
  for (let i = 0; i < 25; i++) {
    await sleep(100);
    const y = await scrollY();
    const cam = await camNow();
    if (y === 0 && surfCamBefore !== null && cam !== null && cam.scale > surfCamBefore.scale * 1.05) { surfaced = { y, cam }; break; }
  }
  await scrollToFloor();
  const legendPt = await centerOf(String.raw`.lf-legend-btn[data-station="gallery"]`);
  if (legendPt !== null) await clickAt(legendPt.x, legendPt.y);
  let surfacedCard = null;
  for (let i = 0; i < 25; i++) {
    await sleep(100);
    const y = await scrollY();
    const open = await evaluate<boolean | null>(`(() => { const c = document.getElementById("lf-card-gallery"); return c ? !c.hidden : null; })()`);
    if (y === 0 && open === true) { surfacedCard = { y, open }; break; }
  }
  await pressKey("Escape", "Escape", 27);
  await sleep(300);
  check(
    "L1k a map action taken from down the page glides the reader back up to watch it (#472, 2026-08-28 ruling): the zoom control surfaces and zooms, the legend button surfaces and opens its card",
    zoomInPt !== null && legendPt !== null && surfaced !== null && surfacedCard !== null,
    JSON.stringify({ zoomInPt, legendPt, surfCamBefore, surfaced, surfacedCard }),
  );
  await scrollToTop();
}

export async function l1fScrolledPage({ evaluate, check, sleep, lastWheel, camNow, scrollY, wheelAt, scrollToTop, freshGesture }: LandfallKit): Promise<void> {
  await scrollToTop();
  await evaluate(`window.scrollTo(0, 240)`);
  await sleep(200);
  const yMid = await scrollY();
  await evaluate(`window.__lfWheel = []`);
  const midCamBefore = await camNow();
  const ptScrolled = await evaluate(stagePoint);
  await wheelAt(ptScrolled, -120);
  let backUp = null;
  for (let i = 0; i < 20; i++) {
    await sleep(100);
    const y = await scrollY();
    if (y < yMid) { backUp = { prevented: await lastWheel(), cam: await camNow(), y }; break; }
  }
  await freshGesture();
  const topCamBefore = await camNow();
  await wheelAt(await evaluate(stagePoint), -120);
  await sleep(200);
  const topZoom = await camNow();
  check(
    "L1f over the scrolled page a wheel-up scrolls the page and never zooms; back at the top, a fresh wheel-up is the camera's again",
    // Drift-sized stillness (2%, L9a's), not 1%: the idle drift breathes the scale +-1.5% and the reads straddle a wheel-scroll poll of up to 2s, while a wheel step is 21%; lane A's length moved this fixture against the 9s idle delay again at #463 (CI red twice, green locally).
    yMid > 0 && backUp !== null && backUp.prevented === false && midCamBefore !== null
      && Math.abs(backUp.cam!.scale / midCamBefore.scale - 1) < 0.02 && backUp.y < yMid
      && topCamBefore !== null && topZoom !== null && topZoom.scale > topCamBefore.scale * 1.05,
    JSON.stringify({ yMid, backUp, topCamBefore, topZoom }),
  );
}

export async function l1gKeys({ evaluate, check, sleep, camNow, scrollY, scrollToTop, freshGesture, pressNav }: LandfallKit): Promise<void> {
  await freshGesture();
  await evaluate(`document.getElementById("lf-stage")?.focus()`);
  const keyCamBefore = await camNow();
  const keyRuns: { label: string; y0: number; y: number; ok: boolean }[] = [];
  // Every down-key starts from the top or it can find itself already parked on the page floor (End certified nothing from y=610, round 5).
  const keyScroll = async (label: string, setupY: number, fire: () => Promise<void>, moved: (y: number, y0: number) => boolean) => {
    for (let i = 0; i < 20; i++) {
      await evaluate(`window.scrollTo(0, ${setupY})`);
      await sleep(100);
      const s = await scrollY();
      if (setupY === 0 ? s === 0 : s > 0) break;
    }
    const y0 = await scrollY();
    await fire();
    for (let i = 0; i < 20; i++) {
      await sleep(100);
      const y = await scrollY();
      if (moved(y, y0)) { keyRuns.push({ label, y0, y, ok: true }); return; }
    }
    keyRuns.push({ label, y0, y: await scrollY(), ok: false });
  };
  await keyScroll("Space", 0, () => pressNav(" ", "Space", 32, " "), down);
  await keyScroll("PageDown", 0, () => pressNav("PageDown", "PageDown", 34), down);
  await keyScroll("End", 0, () => pressNav("End", "End", 35), down);
  await keyScroll("Home", 300, () => pressNav("Home", "Home", 36), (y, y0) => y < y0 && y === 0);
  await keyScroll("ArrowDown", 0, () => pressNav("ArrowDown", "ArrowDown", 40), down);
  const keyCam = await camNow();
  check(
    "L1g the keyboard CLASS on the focused stage stays native, never intercepted, whatever the camera state: Space, PgDn, End, Home, and ArrowDown all scroll and the camera never moves (#472 contract; #481 skeptic finding 5)",
    keyRuns.every((r) => r.ok) && keyCamBefore !== null && keyCam !== null
      && Math.abs(keyCam.scale / keyCamBefore.scale - 1) < 0.01,
    JSON.stringify({ keyRuns, keyCamBefore, keyCam }),
  );
  await scrollToTop();
}

export async function l1hDrift({ evaluate, check, sleep, lastWheel, camNow, scrollY, wheelAt, scrollToTop }: LandfallKit, pt: Point | null): Promise<void> {
  // L1h's fixture PROVES the drift wandered before flicking, or it certifies nothing (a reduced-motion lane never drifts).
  let floor2 = await camNow();
  for (let i = 0; i < 24 && pt !== null; i++) {
    await wheelAt(pt, 480);
    await sleep(90);
    const next = await camNow();
    if (next !== null && floor2 !== null && Math.abs(next.scale - floor2.scale) < 1e-9) { floor2 = next; break; }
    floor2 = next;
  }
  await scrollToTop();
  // IDLE_DELAY_MS is 9000 (src/site/home/drift.ts); the wander poll allows the tween its slow sine-in start.
  let drifted = null;
  for (let i = 0; i < 56; i++) {
    await sleep(250);
    const c = await camNow();
    if (c !== null && floor2 !== null && Math.abs(c.scale - floor2.scale) > 1e-5) { drifted = c; break; }
  }
  await evaluate(`window.__lfWheel = []`);
  await wheelAt(await evaluate(stagePoint), 240);
  let afterDrift = null;
  for (let i = 0; i < 20; i++) {
    await sleep(100);
    const y = await scrollY();
    if (y > 0) { afterDrift = { prevented: await lastWheel(), y }; break; }
  }
  check(
    "L1h a fresh flick at the stand-off clamp still releases after the idle drift has wandered: the ±1.5% snap-back is ambient, not a consumed zoom (#481 skeptic finding 1)",
    floor2 !== null && drifted !== null && afterDrift !== null && afterDrift.prevented === false && afterDrift.y > 0,
    JSON.stringify({ floor2, drifted, afterDrift }),
  );
}

export async function l1iCluster({ evaluate, check, sleep, scrollToTop }: LandfallKit): Promise<void> {
  await evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
  await sleep(300);
  const cluster = await evaluate<{ pos: string; washPos: string; bottom: number } | null>(`(() => {
    const h = document.querySelector("header.chrome");
    if (!h) return null;
    return { pos: getComputedStyle(h).position, washPos: getComputedStyle(h, "::before").position, bottom: h.getBoundingClientRect().bottom };
  })()`);
  check(
    "L1i on home the cluster rides the page (#472, the 2026-08-28 ruling): scrolled to the shelf, the wordmark has left the viewport with the stage, and the wash is anchored to the cluster, not the viewport",
    cluster !== null && cluster.pos === "absolute" && cluster.washPos === "absolute" && cluster.bottom < 0,
    JSON.stringify({ cluster }),
  );
  await scrollToTop();
}
