// The head cluster (Issue #480 Landfall Sub 6b; Issue #762): on home the cluster on the kit's crisp panel and every line of it read and the stage's lettering opted out of selection, the desk notice, and the trail under the nav on every room; every geometry MEASURED against the rendered page, since the Issue #480 screenshots were all things source-scan tests could not see.
import { makeStage, makeMouse, readCam, atLandfall, landed } from "../support/home.ts";
import { GRADIENT_STOPS, PAGE_RGBA } from "../support/pixel.ts";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { deskKit, dnContinue, dnFramed, dnNarrow, dnPhone, dnRefused, dnTablet } from "./cluster/desk-notice.ts";
import {
  dr11Wide,
  dr12Print,
  dr13Gallery,
  dr14PrintIsPaper,
  dr15TrailHover,
  dr16Dress,
  trailKit,
} from "./cluster/trail.ts";
import type { TrailKit } from "./cluster/trail.ts";
import { at1Press, at2Places, at3Keys, at4ScriptsOff, at5Spacing, at6Dress } from "./cluster/chart.ts";
import { at7Rides, at8Back } from "./cluster/chart-back.ts";
import { GLYPH_LINES } from "./stage/glyphs.ts";
import { FLOOR_PLAIN, grounds, withStyle, worstOf } from "./stage/stage.ts";
import { crisp } from "./stage/zoomed.ts";

type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number };
type Stage = ReturnType<typeof makeStage>;

const REM = 16;
const rectOf = (sel: string): Payload<Rect | null> =>
  `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom }; })()`;

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, clearMobile, waitReady, PORT } = ctx;
  // CL2 is deliberately not stepped: its landfall loop answers with its last read rather than throwing, and CL2 asserts that read stands at its landfall.
  const step = makeStep(ctx);
  const { settleHome } = makeStage(ctx);

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await step("CL1", () => cl1Wash(ctx, settleHome));
  await cl2Selection(ctx);
  const trail = trailKit(ctx);
  await step("CL5", () => cl5Hand(ctx));
  await step("CL4", () => cl4Offsets(trail));

  const desk = deskKit(ctx);
  await step("DN1, DN2, DN3, DN9, DN3r", () => dnPhone(desk));
  await step("DN5", () => dnTablet(desk));
  await step("DN6", () => dnNarrow(desk));
  await step("DN7", () => dnRefused(desk));
  await step("DN4", () => dnContinue(desk));
  await step("DN10", () => dnFramed(desk));

  await clearMobile();
  await step("DR11", () => dr11Wide(trail));
  await step("DR12", () => dr12Print(trail));
  await step("DR13", () => dr13Gallery(trail));
  await step("DR14", () => dr14PrintIsPaper(trail));
  await step("DR15", () => dr15TrailHover(trail));
  await step("DR16", () => dr16Dress(trail));
  await step("AT1", () => at1Press(trail));
  await step("AT2", () => at2Places(trail));
  await step("AT3", () => at3Keys(trail));
  await step("AT4", () => at4ScriptsOff(trail));
  await step("AT5", () => at5Spacing(trail));
  await step("AT6", () => at6Dress(trail));
  await step("AT7", () => at7Rides(trail));
  await step("AT8", () => at8Back(trail));

  await clearMobile();
  await send("Emulation.clearDeviceMetricsOverride");
  // The next suite in the lane starts on whatever page is current: hand it a SETTLED Explorer, since a suite that reads the Explorer without navigating races its boot draw (RD2/RD3 red on PR #482 CI).
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  await waitReady();
}

const CL1_PANEL: Payload<{
  content: string;
  filter: string;
  stops: number[][];
  insets: number[];
  size: number[];
  insetSize: number[];
}> = `(() => {
  const rgba = ${PAGE_RGBA}, stops = ${GRADIENT_STOPS};
  const c = document.querySelector("header.chrome"), r = c.getBoundingClientRect(), cs = getComputedStyle(c, "::before"), px = (v) => parseFloat(v);
  return { content: cs.content, filter: cs.filter, stops: stops(cs.backgroundImage), insets: [px(cs.top), px(cs.right), px(cs.bottom), px(cs.left)], size: [px(cs.width), px(cs.height)], insetSize: [r.width - px(cs.left) - px(cs.right), r.height - px(cs.top) - px(cs.bottom)] };
})()`;

export async function cl1Wash(ctx: SuiteContext, settleHome: Stage["settleHome"]): Promise<void> {
  const { evaluate, check } = ctx;
  const cam = await settleHome();
  landed(cam, "CL1");
  const panel = await evaluate(CL1_PANEL);
  const lines = (await evaluate(GLYPH_LINES)).filter((g) => g.piece === "cluster");
  const read = await grounds(ctx, lines);
  const bare = await withStyle(ctx, "cl1-bare", "header.chrome::before { content: none !important; }", () =>
    grounds(ctx, lines),
  );
  const worst = worstOf(read);
  const want = [-0.7, -0.9, -0.8, -0.9].map((r) => r * REM);
  // 2026-10-26: with the panel taken away the cluster read worst 1.16 on the Mac (1.16 on CI run 40422027544), margins 3.34 and 3.34 under 4.5.
  check(
    "CL1 home's cluster stands on the kit's crisp panel, the one every zoomed room's cluster wears (chart ink 0.85 to 0.72, no blur, 0.7rem above, 0.9rem beside and 0.8rem below the cluster's box, sized by those insets alone and never a fixed box), and at landfall every line of it reads at 4.5:1 or better against the ground under it, where the same lines with the panel taken away read under 4.5:1 over the close-in chart, so the read can see the panel fail (Alex, 2026-10-24 and 2026-10-26, Issue #1052; the soft pool it replaces, and the sizing CL3 held, were Issue #480's)",
    crisp(panel) &&
      panel.insets.every((v, i) => Math.abs(v - want[i]!) < 0.05) &&
      panel.size.every((s, i) => Math.abs(s - panel.insetSize[i]!) < 0.5) &&
      lines.length > 0 &&
      worst >= FLOOR_PLAIN &&
      worstOf(bare) < FLOOR_PLAIN,
    JSON.stringify({
      cam,
      panel,
      lines: lines.length,
      worst: [worst, read.find((g) => g.ratio === worst)?.t],
      bare: worstOf(bare),
    }),
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
