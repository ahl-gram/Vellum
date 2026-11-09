import type { Payload, SuiteContext } from "../../types.ts";
import type { PrintRoomKit } from "./kit.ts";
import { clearMetrics, pressAt } from "./kit.ts";
import { mouseMove } from "../../support/input.ts";

export type Lens = { k: number; t: string; zoomed: boolean };
export const LENS: Payload<Lens> = `(() => { const t = getComputedStyle(document.getElementById("map")).transform, m = /^matrix\\(([^,]+),/.exec(t);
  return { k: m ? Number(m[1]) : 1, t, zoomed: document.getElementById("map-viewport").classList.contains("zoomed") }; })()`;
// Reads 150ms apart: a glide re-started under a 3s ease moves the matrix's translation visibly in that time from its first frame, where 50ms apart its first frames can serialise alike. "leaned" waits about a second for the camera to leave home and then takes it as it stands, so a press that goes nowhere reads as a fault rather than a stop.
export type Rest = "leaned" | "still";
export const lensRest = async (
  { evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">,
  want: Rest,
  label: string,
  lens: Payload<Lens> = LENS,
): Promise<Lens> => {
  let last = await evaluate(lens);
  let left = last.zoomed;
  for (let i = 0; i < 60; i++) {
    await sleep(150);
    const d = await evaluate(lens);
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
export async function homeCamera(
  ctx: Pick<SuiteContext, "evaluate" | "sleep" | "wheel" | "send">,
  lens: Payload<Lens> = LENS,
): Promise<Lens> {
  const { evaluate, send, wheel } = ctx;
  await evaluate(`(() => { const b = document.getElementById("zoom-reset"); if (b) b.click(); return true; })()`);
  let at = await lensRest(ctx, "still", "camera-home", lens);
  if (at.k > 1.001) {
    const c = await evaluate(VIEWPORT);
    await wheel(c.x, c.y, 4000);
    at = await lensRest(ctx, "still", "camera-wheeled-home", lens);
  }
  await mouseMove(send, 1, 1);
  return at;
}

type Seated = { size: number[]; w: string; k: number };
const seatedOf = (lens: Payload<Lens>): Payload<Seated> =>
  `({ size: [innerWidth, innerHeight], w: document.getElementById("sheet").style.width, k: ${lens}.k })`;
export type GlideRead = {
  press: { x: number; y: number; hit: string | null } | null;
  mid: Lens | null;
  from: string;
  seated: Seated | null;
  landed: Lens;
};
const REST_K = 1.4;
const REST_TOLERANCE = 0.005;

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
    const seatRead = seatedOf(LENS);
    const { w: from } = await evaluate(seatRead);
    await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 760, deviceScaleFactor: 1, mobile: false });
    let seated: Seated | null = null;
    for (let i = 0; i < 100 && seated === null; i++) {
      const d = await evaluate(seatRead);
      if (d.size[0] === 1200 && d.size[1] === 760 && d.w !== from) seated = d;
      else await sleep(20);
    }
    const landed = await lensRest({ evaluate, sleep }, "still", "glide-landed", LENS);
    return { press, mid, from, seated, landed };
  } finally {
    await evaluate(`document.documentElement.style.removeProperty("--glide")`);
    await clearMetrics({ evaluate, send, sleep }, 1200, 760);
    await homeCamera(ctx, LENS);
  }
}

export const glideLanded = (g: GlideRead): boolean =>
  !!g.press &&
  g.press.hit === "zoom-in" &&
  !!g.mid &&
  !!g.seated &&
  g.seated.k < REST_K - REST_TOLERANCE &&
  Math.abs(g.landed.k - REST_K) < REST_TOLERANCE;

async function pr21PrintView({ evaluate, check }: Pick<PrintRoomKit, "evaluate" | "check">): Promise<void> {
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
}

export async function pr21BoundPrint({ evaluate, send, check, atlasFitAt }: PrintRoomKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  await pr21PrintView({ evaluate, check });

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

  await pr22FirstPage({ evaluate, send, check });
  await send("Emulation.setEmulatedMedia", { media: "" });
}

// 2026-11-08: the bound atlas's first page printed 6586752 base64 characters with its plate and 262220 with the plates hidden (25.1 to 1) on the Mac harness browser; with the plates' images unpainted in print both read 262220.
const PAINTED_OVER_BARE = 2;
const PLATES_HIDDEN = "@media print { body.has-atlas #pr-atlas img { visibility: hidden !important; } }";
const PDF_MAGIC = "JVBERi0";

async function pr22FirstPage({
  evaluate,
  send,
  check,
}: Pick<PrintRoomKit, "evaluate" | "send" | "check">): Promise<void> {
  const firstPage = async (): Promise<string | null> => {
    try {
      return (await send<{ data: string }>("Page.printToPDF", { printBackground: true, pageRanges: "1" })).data;
    } catch {
      return null;
    }
  };
  const painted = await firstPage();
  await evaluate(
    `(() => { const s = document.createElement("style"); s.id = "pr22-bare"; s.textContent = ${JSON.stringify(PLATES_HIDDEN)}; document.head.append(s); return true; })()`,
  );
  let bare: string | null;
  try {
    bare = await firstPage();
  } finally {
    await evaluate(`(() => { document.getElementById("pr22-bare")?.remove(); return true; })()`);
  }
  check(
    "PR22 Chrome paints the bound atlas into a PDF: the first page Save-as-PDF yields is a PDF, and with its plate it weighs more than twice the same page printed with the plates hidden in the same run (the control)",
    !!painted &&
      !!bare &&
      painted.startsWith(PDF_MAGIC) &&
      bare.startsWith(PDF_MAGIC) &&
      painted.length > PAINTED_OVER_BARE * bare.length,
    JSON.stringify({
      painted: painted?.length ?? null,
      bare: bare?.length ?? null,
      ratio: painted && bare ? Number((painted.length / bare.length).toFixed(2)) : null,
    }),
  );
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
  await send("Emulation.setEmulatedMedia", { media: "" });
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
