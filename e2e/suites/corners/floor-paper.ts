import type { Payload, SuiteContext } from "../../types.ts";
import { rest, size } from "../stage/stage.ts";
import { load } from "./floor.ts";

// 2026-10-31: on paper at 816 every chart room's chart spans 0 to 816 exactly (Issue #1013 plan readings), so half a pixel is rounding alone.
const PAPER_EDGE = 0.5;
const PAPER_ROOMS = ["/explorer/", "/print-room/"];
const CHART: Payload<{ cw: number; face: { left: number; right: number; width: number } | null }> =
  `(() => { const f = [...document.querySelectorAll("#sheet svg[data-vellum-style], #sheet img")].find((e) => e.getBoundingClientRect().width > 0); const b = f ? f.getBoundingClientRect() : null; return { cw: document.documentElement.clientWidth, face: b ? { left: b.left, right: b.right, width: b.width } : null }; })()`;

export async function fl8ChartOnPaper(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const faults: string[] = [];
  const rows: string[] = [];
  for (const room of PAPER_ROOMS) {
    await load(ctx, room, 640, 800);
    await rest(ctx, 640, 800, `FL8 ${room}`);
    const screen = await ctx.evaluate(CHART);
    await size(ctx, 816, 1056);
    await ctx.send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await ctx.evaluate(CHART).finally(() =>
      ctx.send("Emulation.setEmulatedMedia", {
        media: "",
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      }),
    );
    if (screen.face === null || screen.face.width <= 0) faults.push(`${room} drew no chart on screen`);
    else if (paper.face === null || paper.face.left < -PAPER_EDGE || paper.face.right > paper.cw + PAPER_EDGE)
      faults.push(`${room}'s chart lies ${JSON.stringify(paper.face)} on paper ${paper.cw} wide`);
    rows.push(`${room} screen ${JSON.stringify(screen)} paper ${JSON.stringify(paper)}`);
  }
  ctx.check(
    "FL8 on paper the Explorer's chart and the Print Room's lie within the paper's width, each drawn on screen first and read at Letter's 816 in print emulation (Issue #1013)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}
