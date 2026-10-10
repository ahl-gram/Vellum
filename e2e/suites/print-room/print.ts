import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { PrintRoomKit } from "./kit.ts";
import type { Warning } from "./reads.ts";
import { clearMetrics, pressAt } from "./kit.ts";

export type Lens = { k: number; t: string; zoomed: boolean };
export const LENS: Payload<Lens> = `(() => { const t = getComputedStyle(document.getElementById("map")).transform, m = /^matrix\\(([^,]+),/.exec(t);
  return { k: m ? Number(m[1]) : 1, t, zoomed: document.getElementById("map-viewport").classList.contains("zoomed") }; })()`;
// Reads 150ms apart: a glide re-started under a 3s ease moves the matrix's translation visibly in that time from its first frame, where 50ms apart its first frames can serialise alike. "leaned" waits about a second for the camera to leave home and then takes it as it stands, so a press that goes nowhere reads as a fault rather than a stop.
export type Rest = "leaned" | "still";
export const lensRest = async (
  { evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">,
  want: Rest,
  label: string,
): Promise<Lens> => {
  let last = await evaluate(LENS);
  let left = last.zoomed;
  for (let i = 0; i < 60; i++) {
    await sleep(150);
    const d = await evaluate(LENS);
    left ||= d.zoomed;
    if (d.t === last.t && (want === "still" || left || i >= 6)) return d;
    last = d;
  }
  throw new Error(`settle timeout ${label}: ${JSON.stringify(last)}`);
};
export const ZOOM_IN: Payload<{ x: number; y: number; hit: string | null } | null> =
  `(() => { const b = document.getElementById("zoom-in"); if (!b) return null;
  const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, hit: e && e.id }; })()`;
const VIEWPORT: Payload<{ x: number; y: number; hit: string | null; size: number[] }> =
  `(() => { const r = document.getElementById("map-viewport").getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, hit: e && (e.id || e.tagName), size: [innerWidth, innerHeight] }; })()`;

// Wiring, not the claim: home by the Glass's own press, else by a wheel out where a row silenced the Glass, and no throw on a camera left leaned, since a cleanup's stop is no claim's read.
export async function homeCamera(ctx: Pick<SuiteContext, "evaluate" | "sleep" | "wheel" | "send">): Promise<Lens> {
  const { evaluate, send, wheel } = ctx;
  await evaluate(`(() => { const b = document.getElementById("zoom-reset"); if (b) b.click(); return true; })()`);
  let at = await lensRest(ctx, "still", "camera-home");
  if (at.k > 1.001) {
    const c = await evaluate(VIEWPORT);
    await wheel(c.x, c.y, 4000);
    at = await lensRest(ctx, "still", "camera-wheeled-home");
  }
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  return at;
}

export type GlideRead = { press: { x: number; y: number; hit: string | null } | null; mid: Lens | null; landed: Lens };

/** The camera re-seats under a resize with no zoom event, and a glide in flight lands where it was going: a 3s glide caught mid-way, a resize, and the scale it comes to rest at (1.4 when the seat re-starts the glide, the mid-way scale when it stops it). */
export async function midGlideRefit(ctx: SuiteContext): Promise<GlideRead> {
  const { evaluate, send, sleep } = ctx;
  // A reduced motion leaked by a suite that stopped mid-way makes every glide instant (Issue #637's class), so the read clears the features itself.
  await send("Emulation.setEmulatedMedia", { features: [] });
  await evaluate(`document.documentElement.style.setProperty("--glide", "3000ms")`);
  try {
    const press = await evaluate(ZOOM_IN);
    if (press) await pressAt({ send }, press.x, press.y);
    let mid: Lens | null = null;
    for (let i = 0; i < 150 && mid === null; i++) {
      const d = await evaluate(LENS);
      if (d.k > 1.02 && d.k < 1.3) mid = d;
      else await sleep(20);
    }
    await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 760, deviceScaleFactor: 1, mobile: false });
    const landed = await lensRest({ evaluate, sleep }, "still", "glide-landed");
    return { press, mid, landed };
  } finally {
    await evaluate(`document.documentElement.style.removeProperty("--glide")`);
    await clearMetrics({ evaluate, send, sleep }, 1200, 760);
    await homeCamera(ctx);
  }
}

export const glideLanded = (g: GlideRead): boolean =>
  !!g.press && g.press.hit === "zoom-in" && !!g.mid && Math.abs(g.landed.k - 1.4) < 0.005;

export async function pr21BoundPrint({ evaluate, send, check, atlasFitAt }: PrintRoomKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printView = await evaluate<{
    stage: string;
    slip: string;
    legend: string;
    folioRoom: string;
    glass: string;
    atlas: string;
    hero: string;
    breakAfter: string;
  }>(
    `(()=>{const disp=(sel)=>{const el=document.querySelector(sel);return el?getComputedStyle(el).display:"absent";};const f=document.querySelector("#pr-atlas figure:not(.banner)");return{stage:disp(".stage"),slip:disp(".slip"),legend:disp(".legend"),folioRoom:disp(".corner.folio-room"),glass:disp(".zoomery"),atlas:disp("#pr-atlas"),hero:disp("#pr-atlas .hero-plate"),breakAfter:f?getComputedStyle(f).breakAfter:"absent"};})()`,
  );
  check(
    "PR21 bound, print is the atlas: the stage, the slip, the legend row, the Glass and the room's name print as nothing, the document and its hero print, one plate per page (ruled 2026-08-30)",
    printView.stage === "none" &&
      printView.slip === "none" &&
      printView.legend === "none" &&
      printView.folioRoom === "none" &&
      printView.glass === "none" &&
      printView.atlas !== "none" &&
      printView.hero !== "none" &&
      printView.breakAfter === "page",
    JSON.stringify(printView),
  );

  const fitLetter = await (async () => {
    await send("Emulation.setDeviceMetricsOverride", { width: 816, height: 1056, deviceScaleFactor: 1, mobile: false });
    return atlasFitAt(816);
  })();
  const fitNarrow = await (async () => {
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    return atlasFitAt(390);
  })();
  await send("Emulation.clearDeviceMetricsOverride");
  check(
    "PR35 a bound atlas fits the page it prints on, at a Letter box and a phone one (#565: 818 on 816 and 392 on 390 before the plates counted their border inside their width; #pr-atlas takes padding 0 at print, so the sheet IS the page box and the plates' own 2px was the whole overflow)",
    !!fitLetter &&
      !!fitNarrow &&
      fitLetter.atlasPadL === "0px" &&
      fitLetter.plates > 0 &&
      fitLetter.clientW === 816 &&
      fitLetter.scrollW === 816 &&
      fitLetter.maxRight === 816 &&
      fitNarrow.clientW === 390 &&
      fitNarrow.scrollW === 390 &&
      fitNarrow.maxRight === 390,
    JSON.stringify({ letter: fitLetter, narrow: fitNarrow }),
  );

  // The 20000-char floor is what separates a real bound atlas from the tiny PDF a blank sheet or a print-blank plate yields; paper fidelity itself stays a manual pass.
  let pdf;
  try {
    pdf = await send<{ data: string }>("Page.printToPDF", { printBackground: true });
  } catch {
    pdf = null;
  }
  check(
    "PR22 browser Save-as-PDF yields a well-formed, non-empty bound atlas",
    !!pdf && typeof pdf.data === "string" && pdf.data.length > 20000,
    pdf ? `${pdf.data.length} base64 chars` : "printToPDF failed",
  );
  await send("Emulation.setEmulatedMedia", { media: "" });
}

export async function pr21bUnboundPrint({ evaluate, send, check }: SuiteContext): Promise<void> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printProof = await evaluate<{
    stage: string;
    stagePos: string;
    map: string;
    svg: boolean;
    atlasEmpty: boolean;
    slip: string;
  }>(
    `(()=>{const cs=(sel)=>getComputedStyle(document.querySelector(sel));return{stage:cs(".stage").display,stagePos:cs(".stage").position,map:cs("#map").transform,svg:!!document.querySelector("#pr-preview svg"),atlasEmpty:document.getElementById("pr-atlas").children.length===0,slip:cs(".slip").display};})()`,
  );
  check(
    "PR21b unbound, print is the proof: the stage prints in flow, unzoomed, the slip as nothing, the document empty (ruled 2026-08-30)",
    printProof.stage !== "none" &&
      printProof.stagePos === "static" &&
      printProof.map === "none" &&
      printProof.svg === true &&
      printProof.atlasEmpty === true &&
      printProof.slip === "none",
    JSON.stringify(printProof),
  );
  // The warning is hidden until the worker fails, so the check unhides it the way app.ts does (warning.hidden = false) and puts the attribute back; reading it while hidden would assert the attribute's own display: none and prove nothing.
  const warnRead: Payload<Warning | null> = `(()=>{const w=document.getElementById("pr-warning");if(!w)return null;const b=w.getBoundingClientRect();return{disp:getComputedStyle(w).display,pos:getComputedStyle(w).position,w:Math.round(b.width*100)/100,hidden:w.hidden};})()`;
  await evaluate(`(()=>{document.getElementById("pr-warning").hidden=false;return true;})()`);
  await send("Emulation.setEmulatedMedia", { media: "" });
  const warnScreen = await evaluate(warnRead);
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const warnPrint = await evaluate(warnRead);
  await evaluate(`(()=>{document.getElementById("pr-warning").hidden=true;return true;})()`);
  check(
    "PR21d the render-worker warning prints as nothing (#566, ruled 2026-09-11): it stands on the scripts-off notice's own seat, absolute at top calc(50% + 2.8rem), so on paper its box resolved against the page box and landed on the chart exactly as the status pill's did; unhidden the way a failed worker unhides it, it shows on screen in the same run and is gone, box and all, on paper",
    !!warnScreen &&
      warnScreen.hidden === false &&
      warnScreen.disp !== "none" &&
      warnScreen.w > 0 &&
      warnScreen.pos === "absolute" &&
      !!warnPrint &&
      warnPrint.hidden === false &&
      warnPrint.disp === "none" &&
      warnPrint.w === 0,
    JSON.stringify({ screen: warnScreen, print: warnPrint }),
  );
  // Paper lays out under the 900px query (test/site/room.test.ts pins the taking-back).
  await send("Emulation.setDeviceMetricsOverride", { width: 816, height: 1056, deviceScaleFactor: 1, mobile: false });
  const paper = await evaluate<{
    w: number;
    tagline: string;
    name: string;
    nameSize: string;
    folioMax: string;
    stagePos: string;
    corner: string;
  }>(
    `(()=>{const cs=(sel)=>getComputedStyle(document.querySelector(sel));return{w:window.innerWidth,tagline:cs(".folio-room .room-tagline").display,name:cs(".folio-room .room-name").display,nameSize:cs(".folio-room .room-name").fontSize,folioMax:cs(".corner.folio-room").maxWidth,stagePos:cs(".stage").position,corner:cs(".corner.bl").display};})()`,
  );
  check(
    "PR21c at paper width (816px, print media) the room's name and tagline print at their own size and the corner is unclamped; the chart's folio prints as nothing",
    paper.w === 816 &&
      paper.tagline === "block" &&
      paper.name === "block" &&
      paper.nameSize === "21.12px" &&
      paper.folioMax === "none" &&
      paper.stagePos === "static" &&
      paper.corner === "none",
    JSON.stringify(paper),
  );
  await send("Emulation.clearDeviceMetricsOverride");
  await send("Emulation.setEmulatedMedia", { media: "" });
}

type Slip = {
  w: number;
  radii: string[];
  borders: string[];
  lines: number[][];
  ink: number[];
  ground: number[];
  size: string[];
} | null;
const WARNING_SLIP: Payload<Slip> = `(() => { const rgba = ${PAGE_RGBA}, w = document.getElementById("pr-warning"); if (!w) return null;
  const cs = getComputedStyle(w), sides = ["Top", "Right", "Bottom", "Left"];
  return { w: w.getBoundingClientRect().width, radii: ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => cs["border" + c + "Radius"]),
    borders: sides.map((s) => cs["border" + s + "Width"] + " " + cs["border" + s + "Style"]), lines: sides.map((s) => rgba(cs["border" + s + "Color"])),
    ink: rgba(cs.color), ground: rgba(cs.backgroundColor), size: [cs.fontSize, getComputedStyle(w.parentElement).fontSize] }; })()`;

export async function pr21eWarningSlip({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  // PR21c's paper width is still the window's until its clear lands.
  await clearMetrics({ evaluate, send, sleep }, 816, 1056);
  await evaluate(`(() => { document.getElementById("pr-warning").hidden = false; return true; })()`);
  try {
    const s = await evaluate(WARNING_SLIP);
    check(
      "PR21e the render-worker warning wears the house slip: unhidden the way a failed worker unhides it, 6px corners, a 1px solid line-tan rule, ink-brown on the parchment-panel ground, at the size of what it stands in (#324 decision 4)",
      !!s &&
        s.w > 0 &&
        s.radii.every((r) => r === "6px") &&
        s.borders.every((b) => b === "1px solid") &&
        s.lines.every((l) => nearRgba(l, tokenRgba("--line-tan"))) &&
        nearRgba(s.ink, tokenRgba("--ink-brown")) &&
        nearRgba(s.ground, tokenRgba("--parchment-panel")) &&
        s.size[0] === s.size[1],
      JSON.stringify(s),
    );
  } finally {
    await evaluate(`(() => { document.getElementById("pr-warning").hidden = true; return true; })()`);
  }
}

export async function pr21fLeanedPrint({ evaluate, send, check, sleep, wheel }: SuiteContext): Promise<void> {
  const c = await evaluate(VIEWPORT);
  try {
    await wheel(c.x, c.y, -480);
    const screen = await lensRest({ evaluate, sleep }, "leaned", "print-room-leaned");
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await evaluate(LENS);
    check(
      "PR21f a leaned camera still prints unzoomed: a real wheel leans the Glass on the proof (the screen read the control), and on paper the transform target stands untransformed",
      screen.zoomed && screen.k > 1 && paper.t === "none",
      JSON.stringify({ c, screen, paper }),
    );
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
    await homeCamera({ evaluate, send, sleep, wheel });
  }
}

export async function pr39SilentRefit(ctx: SuiteContext): Promise<void> {
  const g = await midGlideRefit(ctx);
  ctx.check(
    "PR39 a re-seat mid-glide still lands the glide: a real press on the Glass's draw-nearer starts a 3s glide, a window resize re-seats the camera mid-way, and the glide comes to rest at the press's 1.4, where a seat that stopped it would hold the mid-way scale",
    glideLanded(g),
    JSON.stringify(g),
  );
}
