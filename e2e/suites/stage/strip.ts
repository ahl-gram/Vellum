// The Reading Room's instrument strip (Issue #1052, Alex, 2026-10-24 and 2026-10-26): at rest it carries no panel and keeps its own fade; zoomed it stands on the kit's crisp panel over that fade, and every letter on it reads (EZ4).
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { STRIP_INK } from "./glyphs.ts";
import type { Glyph } from "./glyphs.ts";
import { FLOOR_PLAIN, grounds, open, rest, size, stageFaults, withStyle, worstOf } from "./stage.ts";
import type { Stage } from "./stage.ts";
import { crisp, HELD, PANELS, zoomIn } from "./zoomed.ts";
import type { Panel } from "./zoomed.ts";

const PAGE = "/reading-room/";
const FADE: Payload<string> = `getComputedStyle(document.querySelector(".strip")).backgroundImage`;
const SEAM: Payload<{ folioFoot: number; stripTop: number }> = `(() => {
  const foot = document.querySelector(".corner.bl"), strip = document.querySelector(".strip");
  return { folioFoot: foot.getBoundingClientRect().bottom - parseFloat(getComputedStyle(foot, "::before").bottom), stripTop: strip.getBoundingClientRect().top + parseFloat(getComputedStyle(strip, "::before").top) };
})()`;
const STRIP_BARE = ".strip::before { content: none !important; } .strip { background: none !important; }";

type Ground = Awaited<ReturnType<typeof grounds>>;
type Seam = { folioFoot: number; stripTop: number };
type StripRead = {
  at: Stage | null;
  restPanel: Panel | null;
  restFade: string;
  zoomed: boolean;
  panel: Panel | null;
  fade: string;
  backing: string[];
  seam: Seam;
  lines: Glyph[];
  read: Ground;
  bare: Ground;
};

function stripFaults(r: StripRead): string[] {
  const faults: string[] = [];
  if (!r.at || r.at.under)
    faults.push("the Reading Room is missing or floored at rest, so the zoomed arm is not read alone");
  if (r.restPanel?.content !== "none") faults.push(`at rest the strip carries a panel: ${JSON.stringify(r.restPanel)}`);
  if (!r.restFade.startsWith("linear-gradient(to top")) faults.push(`at rest the strip lost its fade: ${r.restFade}`);
  if (!r.zoomed) faults.push("two presses of the Glass left the chart unzoomed");
  if (!crisp(r.panel)) faults.push(`zoomed, the strip's panel is not the crisp one: ${JSON.stringify(r.panel)}`);
  if (r.fade !== r.restFade) faults.push(`zoomed, the strip's fade is not the one it keeps at rest: ${r.fade}`);
  faults.push(...r.backing);
  if (!(r.seam.stripTop <= r.seam.folioFoot))
    faults.push(`the strip's panel does not meet the chart folio's: ${JSON.stringify(r.seam)}`);
  for (const kind of ["told ", "scale "])
    if (!r.lines.some((g) => g.t.startsWith(kind))) faults.push(`no ${kind.trim()} line was read`);
  for (const g of r.read.filter((x) => x.ratio < FLOOR_PLAIN))
    faults.push(`strip "${g.t}" reads ${g.ratio.toFixed(2)}`);
  if (!(worstOf(r.bare) < FLOOR_PLAIN))
    faults.push(
      `the strip reads ${worstOf(r.bare).toFixed(2)} with the panel and the fade taken away, so the read cannot see them fail`,
    );
  return faults;
}

async function readStrip(ctx: SuiteContext): Promise<StripRead> {
  await ctx.setTouch(false);
  await size(ctx, 1280, 800);
  const at = await open(ctx, `${PAGE}#seed=42`, 1280, 800, { w: 1280, h: 800 }, "EZ4");
  const restPanel = (await ctx.evaluate(PANELS)).strip;
  const restFade = await ctx.evaluate(FADE);
  const zoomed = at !== null && (await zoomIn(ctx, PAGE));
  await rest(ctx, 1280, 800, "EZ4 zoomed");
  return withStyle(ctx, "ez4-held", HELD, async () => {
    const held = await rest(ctx, 1280, 800, "EZ4 held");
    const backing = held
      ? stageFaults({ page: PAGE, size: "1280x800", s: held }).filter((f) => /the strip's backing lies over/.test(f))
      : ["the held room never came to rest"];
    const seam = await ctx.evaluate(SEAM);
    const panel = (await ctx.evaluate(PANELS)).strip;
    const fade = await ctx.evaluate(FADE);
    const lines = await makeSettle(ctx)(
      STRIP_INK,
      (d, last) => !!last && JSON.stringify(d) === JSON.stringify(last),
      "EZ4 the strip's ink",
    );
    const read = await grounds(ctx, lines);
    const bare = await withStyle(ctx, "ez4-bare", STRIP_BARE, () => grounds(ctx, lines));
    return { at, restPanel, restFade, zoomed, panel, fade, backing, seam, lines, read, bare };
  });
}

export async function ez4Strip(ctx: SuiteContext): Promise<void> {
  const r = await readStrip(ctx);
  const faults = stripFaults(r);
  const worst = worstOf(r.read);
  ctx.check(
    "EZ4 in the Reading Room at 1280x800 on seed 42, at rest the instrument strip carries no panel and keeps its own fade, and zoomed by two presses of the Glass it stands on the kit's crisp panel (chart ink 0.85 to 0.72, no blur) drawn over that same fade, meeting the held chart folio's panel and lying over no other piece's lines, and every letter on it, its told line, its year readout and its scale among them, reads at 4.5:1 or better against the ground under it, where the same letters with the panel and the fade taken away read under 4.5:1, so the read can see them fail (Alex, 2026-10-24 and 2026-10-26, Issue #1052, replacing the blurred pool of Issue #988's third call)",
    faults.length === 0,
    `${JSON.stringify(r.panel)}; seam ${JSON.stringify(r.seam)}; ${r.lines.length} lines, worst ${worst.toFixed(2)} on "${r.read.find((g) => g.ratio === worst)?.t}", bare ${worstOf(r.bare).toFixed(2)}` +
      (faults.length ? `; ${faults.length} faults: ${faults.slice(0, 6).join("; ")}` : ""),
  );
}
