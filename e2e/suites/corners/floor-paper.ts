import type { Payload, SuiteContext } from "../../types.ts";
import { CHART_ROOM_FLOOR, rest } from "../stage/stage.ts";
import { load, size } from "./floor.ts";

// Paper is narrower than 900, so main's narrow blocks dressed it by accident; with them gone each room says what paper drops itself (the step 11 plate read on Issue #762 pull request C, real PDFs at Letter).
const PRINTED: Payload<{ tab: string | null; shadow: string | null; pad: number | null }> =
  `(() => { const t = document.getElementById("chart-drawer-tab"), s = document.querySelector("#sheet"), p = document.querySelector("main .sheet"); return { tab: t ? getComputedStyle(t).display : null, shadow: s ? getComputedStyle(s).boxShadow : null, pad: p ? parseFloat(getComputedStyle(p).paddingLeft) : null }; })()`;

export async function fl6Paper(ctx: SuiteContext): Promise<void> {
  await ctx.setTouch(false);
  const faults: string[] = [];
  const rows: string[] = [];
  for (const page of ["/explorer/", "/explorer/portfolio/", "/faq/", "/glossary/"]) {
    await load(ctx, page, 640, 800);
    const screen = await ctx.evaluate(PRINTED);
    await size(ctx, 816, 1056);
    await ctx.send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await ctx.evaluate(PRINTED).finally(() =>
      ctx.send("Emulation.setEmulatedMedia", {
        media: "",
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      }),
    );
    if (page === "/explorer/" && (paper.tab !== "none" || screen.tab === "none"))
      faults.push(`the Explorer's drawer tab reads ${screen.tab} on screen and ${paper.tab} on paper`);
    if (page === "/explorer/portfolio/" && (paper.shadow !== "none" || screen.shadow === "none"))
      faults.push(`the Portfolio's sheet casts ${screen.shadow} on screen and ${paper.shadow} on paper`);
    if (
      (page === "/faq/" || page === "/glossary/") &&
      (paper.pad === null ||
        Math.abs(paper.pad - 816 * 0.04) > 0.5 ||
        screen.pad === null ||
        Math.abs(screen.pad - 40.96) > 0.5)
    )
      faults.push(`${page} pads its sheet ${screen.pad} on screen at 640 and ${paper.pad} on paper at 816`);
    rows.push(`${page} screen ${JSON.stringify(screen)} paper ${JSON.stringify(paper)}`);
  }
  ctx.check(
    "FL6 on paper a room drops what main's narrow blocks used to drop for it: the Explorer's drawer tab stands down, the Portfolio's sheet casts no shadow, and the Q & A's and the Glossary's sheet pads by paper's own 4vw (32.6 at Letter), while on screen at 640 the tab shows, the shadow casts and the padding keeps its 1024 floor of 40.96, the same-run controls (Issue #762)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}

// 2026-10-31: on paper at 816 every chart room's chart spans 0 to 816 exactly (Issue #1013 plan readings), so half a pixel is rounding alone.
const PAPER_EDGE = 0.5;
const PAPER_ROOMS = CHART_ROOM_FLOOR.filter((room) => room !== "/explorer/portfolio/");
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
    "FL8 on paper every chart room's chart lies within the paper's width, each drawn on screen first and read at Letter's 816 in print emulation: the Explorer, the Print Room, the Prospect, the Reading Room, the Ribbon, Today and the Specimen Book (Issue #1013)",
    faults.length === 0,
    `${rows.join(" | ")}${faults.length ? `; ${faults.join("; ")}` : ""}`,
  );
}
