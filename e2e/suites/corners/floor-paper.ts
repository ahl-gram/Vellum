import type { Payload, SuiteContext } from "../../types.ts";
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
