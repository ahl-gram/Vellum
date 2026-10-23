// The Explorer's slide-away, the holds and the arming (Issue #996): a mouse brought to rest on a thin line brings that piece home and keeps it, one standing still over the chart under the head does not, the Chart Table over the folio's thin line does not, keyboard focus and the chart of the atelier hold the head, and a link that opens zoomed keeps both home until the reader's first zoom, pan or key.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { lensRest } from "../print-room/print.ts";
import { LINGER_MS, REST_MS } from "../../../src/site/shared/slide-away-bind.ts";
import { rest } from "./stage.ts";
import {
  aimAt,
  draftsLanded,
  lineAim,
  LINK,
  motionOn,
  mouseTo,
  near,
  openAt,
  PIECES_READ,
  press,
  pressSelector,
  readsFor,
  SEED_42,
  settleTy,
  travelsOf,
} from "./slide-kit.ts";

const EASE_WAIT = 340;
const ROOM_BOX: Payload<number[]> =
  `(() => { const r = document.getElementById("map-viewport").getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`;

async function chartCentre(ctx: SuiteContext): Promise<[number, number]> {
  const [x, y] = await ctx.evaluate(ROOM_BOX);
  return [x!, y!];
}

async function toLine(ctx: SuiteContext, selector: string, dx = 0): Promise<{ x: number; y: number }> {
  const at = await ctx.evaluate(lineAim(selector));
  await mouseTo(ctx, at.x + dx, at.y);
  return at;
}

async function holdAtEdge(
  ctx: SuiteContext,
  piece: "head" | "folio",
  x: number,
  y: number,
  where: string,
): Promise<string[]> {
  await mouseTo(ctx, x, y);
  const reads = await readsFor(ctx, LINGER_MS + EASE_WAIT + 300);
  if (!reads.some((p) => Math.abs(p[piece].ty) > 0.5)) return [];
  return [`a mouse ${where} let the ${piece} go: ${JSON.stringify(reads.map((p) => p[piece].ty.toFixed(1)))}`];
}

export async function es3Rest(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await motionOn(ctx, async () => {
    await openAt(ctx, SEED_42, 1280, 800, "ES3");
    const { up, down } = travelsOf(await ctx.evaluate(PIECES_READ));
    await press(ctx, 2);
    await settleTy(ctx, "head", up, "ES3 head away");
    await settleTy(ctx, "folio", down, "ES3 folio away");
    const headAt = await toLine(ctx, "header.chrome .trail");
    const homeHead = await settleTy(ctx, "head", 0, "ES3 head home");
    if (!(homeHead.head.nav[0] >= 0))
      faults.push(`the nav is not on screen with the head home: ${JSON.stringify(homeHead.head.nav)}`);
    if (!near(homeHead.folio.ty, down, 0.5)) faults.push(`the head's hold moved the folio: ${homeHead.folio.ty}`);
    const stays = await readsFor(ctx, 1500);
    if (stays.some((p) => Math.abs(p.head.ty) > 0.5))
      faults.push(`a resting mouse lost the head: ${JSON.stringify(stays.map((p) => p.head.ty.toFixed(1)))}`);
    faults.push(...(await holdAtEdge(ctx, "head", headAt.x, 1, "at the page's top edge, above the head's home box")));
    const [cx, cy] = await chartCentre(ctx);
    await mouseTo(ctx, cx, cy);
    await settleTy(ctx, "head", up, "ES3 head sent back");
    const folioAt = await toLine(ctx, "#folio-title");
    const homeFolio = await settleTy(ctx, "folio", 0, "ES3 folio home");
    if (!(homeFolio.folio.title[1] <= homeFolio.innerH && homeFolio.folio.rest.every((t) => t < homeFolio.innerH)))
      faults.push(
        `the folio is not whole on screen at home: title foot ${homeFolio.folio.title[1]}, other tops ${JSON.stringify(homeFolio.folio.rest)}`,
      );
    if (!near(homeFolio.head.ty, up, 0.5)) faults.push(`the folio's hold moved the head: ${homeFolio.head.ty}`);
    const folioStays = await readsFor(ctx, 1500);
    if (folioStays.some((p) => Math.abs(p.folio.ty) > 0.5))
      faults.push(`a resting mouse lost the folio: ${JSON.stringify(folioStays.map((p) => p.folio.ty.toFixed(1)))}`);
    faults.push(
      ...(await holdAtEdge(
        ctx,
        "folio",
        folioAt.x,
        homeFolio.innerH - 1,
        "at the page's foot, below the folio's home box",
      )),
    );
    await mouseTo(ctx, cx, cy);
    await settleTy(ctx, "folio", down, "ES3 folio sent back");
  });
  ctx.check(
    "ES3 on the Explorer zoomed past its fill depth, a mouse brought to rest on the thin top line brings the whole head cluster home and keeps it there while it rests, one on the thin bottom line does the same for the whole chart folio, each alone, holding while the mouse stays in the band of page between its home box and the edge it slid toward, and each slides back after the mouse leaves (Alex, 2026-10-22, Issue #989 ruling 3; Alex, 2026-10-23, Issue #996 step 6 ruling 5)",
    faults.length === 0,
    faults.length
      ? faults.join("; ")
      : "each piece came home under a resting mouse, stayed 1.5 s, and went back after the mouse left",
  );
}

const HEAD_BOX: Payload<number[]> =
  `(() => { const r = document.querySelector("header.chrome").getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; })()`;

async function emptySpot(ctx: SuiteContext): Promise<[number, number]> {
  const [, top, right, bottom] = await ctx.evaluate(HEAD_BOX);
  const probe = (x: number, y: number): Payload<boolean> =>
    `(() => { const e = document.elementFromPoint(${x}, ${y}); return !!e && !!e.closest("#map-viewport"); })()`;
  for (let i = 0; top! + 8 + 12 * i < bottom!; i++) {
    const [x, y] = [right! - 8, top! + 8 + 12 * i];
    if (await ctx.evaluate(probe(x, y))) return [x, y];
  }
  throw new Error("no point inside the head's home box lies over the chart");
}

export async function es8StillPointer(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await motionOn(ctx, async () => {
    await openAt(ctx, SEED_42, 1280, 800, "ES8");
    const home = await ctx.evaluate(PIECES_READ);
    const { up } = travelsOf(home);
    await press(ctx, 1);
    const [x, y] = await emptySpot(ctx);
    await mouseTo(ctx, x, y);
    for (let i = 1; i <= 2; i++) {
      await ctx.wheel(x, y, -100);
      await lensRest(ctx, "leaned", `ES8 notch ${i}`);
    }
    const reads = await readsFor(ctx, REST_MS + EASE_WAIT + 300);
    const last = reads[reads.length - 1]!;
    if (!(last.k >= 1.54)) faults.push(`two notches reached only k ${last.k.toFixed(3)}, short of the fill`);
    if (reads.some((p) => !near(p.head.ty, up, 0.5)))
      faults.push(
        `a still mouse over the chart held the head: ${JSON.stringify(reads.map((p) => p.head.ty.toFixed(1)))}`,
      );
    await mouseTo(ctx, x - 2, y);
    const nudged = await readsFor(ctx, REST_MS + EASE_WAIT + 300);
    if (nudged.some((p) => !near(p.head.ty, up, 0.5)))
      faults.push(
        `a mouse moving inside the head's home box over the chart, the head away, held it: ${JSON.stringify(nudged.map((p) => p.head.ty.toFixed(1)))}`,
      );
    const [cx, cy] = await chartCentre(ctx);
    const line = await ctx.evaluate(lineAim("header.chrome .trail"));
    const drag = { button: "left", clickCount: 1 };
    await ctx.send("Input.dispatchMouseEvent", { type: "mousePressed", x: cx, y: cy, buttons: 1, ...drag });
    await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: line.x, y: line.y, buttons: 1, ...drag });
    const dragged = await readsFor(ctx, REST_MS + EASE_WAIT + 300);
    await ctx.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: line.x, y: line.y, buttons: 0, ...drag });
    if (dragged.some((p) => !near(p.head.ty, up, 0.5)))
      faults.push(
        `a pan dragged across the thin line brought the head home: ${JSON.stringify(dragged.map((p) => p.head.ty.toFixed(1)))}`,
      );
    await toLine(ctx, "header.chrome .trail", 2);
    await settleTy(ctx, "head", 0, "ES8 control: a moving mouse on the line");
  });
  ctx.check(
    "ES8 a mouse standing still over the chart under the head cluster while the reader wheels in past the fill depth does not hold the head there: it slides to its thin line and stays, a mouse moving there with no button down, or a pan dragged across the line, does not bring it home, and a mouse then brought onto that line brings it home (Issue #996)",
    faults.length === 0,
    faults.length ? faults.join("; ") : "the head slid away under a still mouse and came home for a moving one",
  );
}

export async function es10Drawer(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await motionOn(ctx, async () => {
    await openAt(ctx, SEED_42, 1280, 800, "ES10");
    const { down } = travelsOf(await ctx.evaluate(PIECES_READ));
    await press(ctx, 2);
    await settleTy(ctx, "folio", down, "ES10 folio away");
    await pressSelector(ctx, "#chart-drawer-tab");
    const opened: Payload<boolean> = `document.getElementById("chart-drawer").classList.contains("open")`;
    await makeSettle(ctx)(opened, (d) => d === true, "ES10 drawer open");
    await rest(ctx, 1280, 800, "ES10 drawer open");
    const at = await ctx.evaluate(lineAim("#folio-title"));
    if (!at.inside) throw new Error(`the open Chart Table does not cover the folio's thin line: ${JSON.stringify(at)}`);
    await mouseTo(ctx, at.x, at.y);
    const reads = await readsFor(ctx, REST_MS + EASE_WAIT + 300);
    if (reads.some((p) => !near(p.folio.ty, down, 0.5)))
      faults.push(
        `a mouse on the drawer brought the folio home: ${JSON.stringify(reads.map((p) => p.folio.ty.toFixed(1)))}`,
      );
    await pressSelector(ctx, "#chart-drawer-shut");
    await rest(ctx, 1280, 800, "ES10 drawer shut");
    await settleTy(ctx, "folio", down, "ES10 folio away again");
    await toLine(ctx, "#folio-title");
    await settleTy(ctx, "folio", 0, "ES10 control: the folio home under a mouse with the drawer shut");
  });
  ctx.check(
    "ES10 with the Chart Table open over the slid chart folio, a mouse resting on the drawer over the folio's thin line does not bring the folio home, and with the drawer shut a mouse on that line does (Issue #996)",
    faults.length === 0,
    faults.length
      ? faults.join("; ")
      : "the open drawer held the folio away and the shut drawer let the mouse bring it home",
  );
}

async function tab(ctx: SuiteContext, shift: boolean): Promise<void> {
  const key = { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, modifiers: shift ? 8 : 0 };
  await ctx.send("Input.dispatchKeyEvent", { type: "keyDown", ...key });
  await ctx.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
}

const FOCUSED_ON_TOP: Payload<boolean> = `(() => { const a = document.activeElement, r = a.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return !!e && (e === a || a.contains(e)) && r.top >= 0 && r.bottom <= innerHeight; })()`;

async function keysInto(ctx: SuiteContext): Promise<string> {
  for (let i = 0; i < 4; i++) {
    await tab(ctx, true);
    const p = await ctx.evaluate(PIECES_READ);
    if (p.active.startsWith("head ")) return p.active;
  }
  throw new Error("Shift+Tab from the chart never landed in the head cluster");
}

export async function es4Keys(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await openAt(ctx, SEED_42, 1280, 800, "ES4", true);
  const { up } = travelsOf(await ctx.evaluate(PIECES_READ));
  await press(ctx, 2);
  await settleTy(ctx, "head", up, "ES4 head away");
  await ctx.evaluate(`document.getElementById("map-viewport").focus()`);
  const landed = await keysInto(ctx);
  await settleTy(ctx, "head", 0, "ES4 head home under focus");
  if (!(await ctx.evaluate(FOCUSED_ON_TOP))) faults.push(`${landed} is not on screen and under its own centre`);
  let left = false;
  for (let i = 0; i < 12 && !left; i++) {
    await tab(ctx, false);
    left = !(await ctx.evaluate(PIECES_READ)).active.startsWith("head ");
  }
  if (!left) faults.push("twelve Tabs never left the head cluster");
  else await settleTy(ctx, "head", up, "ES4 head sent back");
  ctx.check(
    "ES4 keyboard focus moved into the slid head cluster from the chart brings it home with the focused link on screen and under its own centre, and focus leaving it sends it back (Alex, 2026-10-22, Issue #989 ruling 3; Issue #996)",
    faults.length === 0,
    faults.length ? faults.join("; ") : `focus landed on ${landed}, the head came home, and it left again with focus`,
  );
}

const FOLD_RECT: Payload<number[]> =
  `(() => { const r = document.querySelector("header.chrome nav.atelier").getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, innerWidth, innerHeight]; })()`;

export async function es5Atelier(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await openAt(ctx, SEED_42, 1280, 800, "ES5", true);
  const { up } = travelsOf(await ctx.evaluate(PIECES_READ));
  await press(ctx, 2);
  await settleTy(ctx, "head", up, "ES5 head away");
  await pressSelector(ctx, "header.chrome summary");
  await settleTy(ctx, "head", 0, "ES5 head home under the opened fold");
  await pressSelector(ctx, "header.chrome summary");
  const focused = await ctx.evaluate(PIECES_READ);
  if (!focused.active.startsWith("head summary"))
    throw new Error(`the mouse's press left focus outside the head: ${focused.active}`);
  const [cx, cy] = await chartCentre(ctx);
  await mouseTo(ctx, cx, cy);
  await settleTy(ctx, "head", up, "ES5 head sent back with the mouse's focus left on its press");
  const fold = (open: boolean): Payload<boolean> =>
    `(() => { document.activeElement instanceof HTMLElement && document.activeElement.blur(); document.querySelector("header.chrome details.atelier-fold").open = ${open}; return true; })()`;
  await ctx.evaluate(fold(true));
  await settleTy(ctx, "head", 0, "ES5 head home under the opened fold without focus");
  const r = await makeSettle(ctx)(FOLD_RECT, (d) => d[1]! >= 0, "ES5 fold panel on screen");
  if (!(r[0]! >= 0 && r[2]! <= r[4]! && r[3]! <= r[5]!)) faults.push(`the panel is off screen: ${JSON.stringify(r)}`);
  await ctx.evaluate(fold(false));
  await settleTy(ctx, "head", up, "ES5 head sent back by the fold's closing");
  ctx.check(
    "ES5 the chart of the atelier opened from the slid head cluster's thin line holds the head home with its panel on screen, by mouse and without focus alike, and shutting it lets the head go even with the mouse's focus left on its press (Issue #989; Issue #996)",
    faults.length === 0,
    faults.length
      ? faults.join("; ")
      : "the open fold held the head home by mouse and by script, and its closing let it go",
  );
}

export async function es6Link(ctx: SuiteContext): Promise<void> {
  const faults: string[] = [];
  await openAt(ctx, LINK, 1280, 800, "ES6", true);
  await lensRest(ctx, "still", "ES6 link landed");
  await draftsLanded(ctx, "ES6 drafts landed");
  const home = await ctx.evaluate(PIECES_READ);
  if (!(home.k >= 2.7)) faults.push(`the link opened at k ${home.k}`);
  if (home.head.ty !== 0 || home.folio.ty !== 0)
    faults.push(`a piece is away on a link that opens zoomed: ${home.head.ty}, ${home.folio.ty}`);
  const { up, down } = travelsOf(home);
  await pressSelector(ctx, ".slip .card-title");
  const slipPress = await ctx.evaluate(PIECES_READ);
  if (slipPress.head.ty !== 0 || slipPress.folio.ty !== 0) faults.push("a press on the Broadside moved a piece");
  const slip = await ctx.evaluate(aimAt(".slip"));
  await ctx.wheel(slip.x, slip.y, 100);
  await ctx.sleep(300);
  const slipWheel = await ctx.evaluate(PIECES_READ);
  if (slipWheel.head.ty !== 0 || slipWheel.folio.ty !== 0) faults.push("a wheel over the Broadside moved a piece");
  const [cx, cy] = await chartCentre(ctx);
  await ctx.wheel(cx, cy, 100);
  await lensRest(ctx, "leaned", "ES6 wheel out over the chart");
  await settleTy(ctx, "head", up, "ES6 head to its thin line");
  await settleTy(ctx, "folio", down, "ES6 folio to its thin line");
  ctx.check(
    "ES6 a link that opens the Explorer zoomed past its fill depth keeps the head cluster and the chart folio home through a press and a wheel over the Broadside, and the reader's first wheel over the chart sends them to their thin lines (Alex, 2026-10-22, Issue #989 ruling 6; Issue #996)",
    faults.length === 0,
    faults.length
      ? faults.join("; ")
      : `home through a press and a wheel on the Broadside, then ${up} and ${down} after one wheel over the chart`,
  );
}
