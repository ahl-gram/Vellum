// The head cluster (Issue #480 Landfall Sub 6b; Issue #762): on home the wash sized to the cluster and the stage's lettering opted out of selection, the desk notice, and the trail under the nav on every room; every geometry MEASURED against the rendered page, since the Issue #480 screenshots were all things source-scan tests could not see.
import { makeStage, makeMouse, readCam, atLandfall } from "../support/home.ts";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { deskKit, dnContinue, dnNarrow, dnPhone, dnRefused, dnTablet } from "./cluster/desk-notice.ts";
import { dr11Wide, dr12Print, dr13Gallery, dr14PrintIsPaper, dr15TrailHover, trailKit } from "./cluster/trail.ts";
import type { TrailKit } from "./cluster/trail.ts";

type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number };
type Stage = ReturnType<typeof makeStage>;

const REM = 16;
const rectOf = (sel: string): Payload<Rect | null> =>
  `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom }; })()`;

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, clearMobile, waitReady, PORT } = ctx;
  // CL1 and CL2 are deliberately not stepped: settleHome returns null rather than throwing, and their checks already guard on it.
  const step = makeStep(ctx);
  const { settleHome } = makeStage(ctx);

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cl1Wash(ctx, settleHome);
  await cl2Selection(ctx);
  const trail = trailKit(ctx);
  await step("CL3", () => cl3Blur(ctx));
  await step("CL5", () => cl5Hand(ctx));
  await step("CL4", () => cl4Offsets(trail));

  const desk = deskKit(ctx);
  await step("DN1, DN2, DN3, DN9, DN3r", () => dnPhone(desk));
  await step("DN5", () => dnTablet(desk));
  await step("DN6", () => dnNarrow(desk));
  await step("DN7", () => dnRefused(desk));
  await step("DN4", () => dnContinue(desk));

  await clearMobile();
  await step("DR11", () => dr11Wide(trail));
  await step("DR12", () => dr12Print(trail));
  await step("DR13", () => dr13Gallery(trail));
  await step("DR14", () => dr14PrintIsPaper(trail));
  await step("DR15", () => dr15TrailHover(trail));

  await clearMobile();
  await send("Emulation.clearDeviceMetricsOverride");
  // The next suite in the lane starts on whatever page is current: hand it a SETTLED Explorer, since a suite that reads the Explorer without navigating races its boot draw (RD2/RD3 red on PR #482 CI).
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  await waitReady();
}

async function cl1Wash({ evaluate, check }: SuiteContext, settleHome: Stage["settleHome"]): Promise<void> {
  const cam = await settleHome();

  const wash = await evaluate<{
    filter: string;
    bg: string;
    image: string;
    box: { left: number; top: number; right: number; bottom: number };
    nav: { right: number; bottom: number };
    cluster: { right: number; bottom: number; left: number; top: number };
  }>(`(() => {
    const chrome = document.querySelector("header.chrome");
    const cs = getComputedStyle(chrome, "::before");
    const c = chrome.getBoundingClientRect();
    const nav = document.querySelector("header.chrome nav.rooms").getBoundingClientRect();
    const px = (v) => parseFloat(v);
    return { filter: cs.filter, bg: cs.backgroundColor, image: cs.backgroundImage,
      box: { left: c.left + px(cs.left), top: c.top + px(cs.top), right: c.right - px(cs.right), bottom: c.bottom - px(cs.bottom) },
      nav: { right: nav.right, bottom: nav.bottom }, cluster: { right: c.right, bottom: c.bottom, left: c.left, top: c.top } };
  })()`);
  const alpha = parseFloat(
    (wash.bg.match(/\/\s*([\d.]+)\)/) || wash.bg.match(/rgba\([^)]*,\s*([\d.]+)\)/) || [])[1] ?? "1",
  );
  check(
    "CL1 the cluster's wash is a soft pool sized by the cluster: it ends 1.5 to 3rem past the nav's right and bottom, blurred, at 0.8 ink or deeper, no gradient box (#480 screenshot 3; the slab measured 736x272 against a nav ending at 510x102)",
    !!cam &&
      wash.image === "none" &&
      /blur\(/.test(wash.filter) &&
      alpha >= 0.8 &&
      wash.box.right - wash.nav.right >= 1.5 * REM &&
      wash.box.right - wash.nav.right <= 3 * REM &&
      wash.box.bottom - wash.nav.bottom >= 1.5 * REM &&
      wash.box.bottom - wash.nav.bottom <= 3 * REM &&
      wash.box.left <= -2 * REM &&
      wash.box.top <= -2 * REM,
    JSON.stringify({ cam: !!cam, wash, alpha }),
  );
}

async function cl2Selection(ctx: SuiteContext): Promise<void> {
  const { evaluate, check, shoot, sleep } = ctx;
  const { dragAcross } = makeMouse(ctx);
  // The rect is read only once the camera is at landfall (CI once pressed on the wordmark from a stale rect), and the press point must hit-test into the stage (the name slip itself is pointer-events: none, so the press lands on the sheet beneath it, which is the baseline's own path): a drag that begins outside the stage proves nothing about it.
  let settled = null;
  for (let i = 0; i < 80 && !atLandfall(settled); i++) {
    settled = await evaluate(readCam);
    if (!atLandfall(settled)) await sleep(75);
  }
  await evaluate(`getSelection().removeAllRanges()`);
  const slip = await evaluate(rectOf('.lf-station[data-station="explorer"] .lf-station-name'));
  const pressAt = slip ? { x: slip.x + 4, y: slip.y + slip.h / 2 } : null;
  const startsOnStage = pressAt
    ? await evaluate<boolean>(
        `(() => { const e = document.elementFromPoint(${pressAt.x}, ${pressAt.y}); return !!e && !!e.closest("#lf-stage"); })()`,
      )
    : false;
  if (pressAt) await dragAcross(pressAt, 200, 160);
  const pipSelection = await evaluate<string>(`getSelection().toString()`);
  await evaluate(
    `getSelection().removeAllRanges(); document.querySelector(".lf-shelf-grid figcaption").scrollIntoView({ block: "center" })`,
  );
  await sleep(200);
  const caption = await evaluate(rectOf(".lf-shelf-grid figcaption"));
  if (caption) await dragAcross({ x: caption.x + 2, y: caption.y + caption.h / 2 }, caption.w - 4, 0);
  const controlSelection = await evaluate<string>(`getSelection().toString()`);
  check(
    "CL2 a mouse drag that begins on a station name selects nothing, while the SAME drag across a shelf caption still selects its text, so the probe can select and the stage alone opts out (#480 screenshot 4; the baseline drag selected every place name)",
    atLandfall(settled) && startsOnStage && caption !== null && pipSelection === "" && controlSelection.length > 0,
    JSON.stringify({
      settled: atLandfall(settled),
      startsOnStage,
      slip,
      caption: !!caption,
      pipSelection: pipSelection.slice(0, 60),
      controlSelection,
    }),
  );
  await shoot("cluster-wash-1280.png");
}

// The wash's drawn size against the size its insets give it around the cluster: a fixed width or height is the retired slab.
const POOL: Payload<{ filter: string; size: number[]; insetSize: number[] }> = `(() => {
  const c = document.querySelector("header.chrome"), r = c.getBoundingClientRect(), cs = getComputedStyle(c, "::before"), px = (v) => parseFloat(v);
  return { filter: cs.filter, size: [px(cs.width), px(cs.height)], insetSize: [r.width - px(cs.left) - px(cs.right), r.height - px(cs.top) - px(cs.bottom)] };
})()`;

async function cl3Blur({ evaluate, check }: SuiteContext): Promise<void> {
  const pool = await evaluate(POOL);
  const px = Number(/^blur\(([\d.]+)px\)$/.exec(pool.filter)?.[1] ?? NaN);
  check(
    "CL3 the cluster's wash fades at a 16 to 28px blur and is sized by its insets around the cluster alone, no fixed box, so its edge never shows (#480, screenshot 3)",
    px >= 16 && px <= 28 && pool.size.every((s, i) => Math.abs(s - pool.insetSize[i]!) < 0.5),
    JSON.stringify(pool),
  );
}

// The cluster rides home's page and stands fixed on a room's, so its corner is read in the document's coordinates.
const CHROME: Payload<{ x: number; y: number; tokens: [number, number] }> = `(() => {
  const root = getComputedStyle(document.documentElement), rem = parseFloat(root.fontSize), r = document.querySelector("header.chrome").getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, tokens: [parseFloat(root.getPropertyValue("--chrome-x")) * rem, parseFloat(root.getPropertyValue("--chrome-y")) * rem] };
})()`;

const atTokens = (c: { x: number; y: number; tokens: [number, number] }) =>
  Math.abs(c.tokens[0] - 1.6 * REM) < 0.01 &&
  Math.abs(c.tokens[1] - 1.4 * REM) < 0.01 &&
  Math.abs(c.x - c.tokens[0]) < 0.5 &&
  Math.abs(c.y - c.tokens[1]) < 0.5;

async function cl4Offsets(k: TrailKit): Promise<void> {
  const home = await k.evaluate(CHROME);
  await k.goto("/gallery/");
  const room = await k.evaluate(CHROME);
  k.check(
    "CL4 the cluster stands at the chrome's corner tokens, 1.6rem in and 1.4rem down, on home and on a chart room alike, so the wash and the atelier's corners follow one pair (#480)",
    atTokens(home) && atTokens(room),
    JSON.stringify({ home, room }),
  );
}

// Off its links, the first point inside the cluster's own box that no link covers.
const HAND: Payload<{ through: boolean; point: number[] | null; link: boolean }> = `(() => {
  scrollTo({ top: 0, left: 0, behavior: "instant" });
  const c = document.querySelector("header.chrome"), b = c.getBoundingClientRect(), a = c.querySelector("nav.rooms a"), ar = a.getBoundingClientRect();
  let point = null, through = false;
  for (let y = b.top + 4; y < b.bottom - 2 && !point; y += 6) for (let x = b.left + 4; x < b.right - 4 && !point; x += 12) {
    const e = document.elementFromPoint(x, y);
    if (e && !e.closest("header.chrome a")) { point = [x, y]; through = !!e.closest("#lf-stage"); }
  }
  const at = document.elementFromPoint(ar.left + ar.width / 2, ar.top + ar.height / 2);
  return { through, point, link: !!at && (at === a || a.contains(at)) };
})()`;

async function cl5Hand({ evaluate, check }: SuiteContext): Promise<void> {
  const h = await evaluate(HAND);
  check(
    "CL5 the cluster passes the hand through: off its links a point inside its box reaches the chart beneath, while its links take the hand back (#461, skeptic finding 2)",
    !!h.point && h.through && h.link,
    JSON.stringify(h),
  );
}
