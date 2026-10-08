import { luminance, sampleRow } from "../../support/pixel.ts";
import type { Payload, Point } from "../../types.ts";
import type { RunningHeadKit } from "./kit.ts";

export async function rh10GalleryScrolled({ evaluate, send, check, sleep, visit }: RunningHeadKit): Promise<void> {
  // The harness window is tall, so this check pins its own viewport; the Gallery is the one chart room that scrolls and this suite its sole visitor.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "about:blank" });
  const galleryUp = await visit("/gallery/");
  type GalleryRead = { sh: number; y: number; plate: Point | null; loaded: boolean };
  let scrolled: GalleryRead | null = null;
  for (let i = 0; i < 100 && galleryUp; i++) {
    scrolled = JSON.parse(
      await evaluate<string>(
        `(() => { const sh = document.documentElement.scrollHeight; window.scrollTo(0, Math.min(1200, sh - innerHeight)); const imgs = [...document.querySelectorAll(".grid img")]; const b = imgs.map((el) => el.getBoundingClientRect()).find((r) => r.top > 100 && r.bottom < innerHeight - 20 && r.width > 100); return JSON.stringify({ sh, y: scrollY, plate: b ? { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } : null, loaded: imgs.length > 0 && imgs.every((el) => el.complete && el.naturalWidth > 0) }); })()`,
      ),
    ) as GalleryRead;
    if (scrolled.plate && scrolled.loaded) break;
    await sleep(100);
  }
  await sleep(300);
  const plateRow = scrolled && scrolled.plate ? await sampleRow(send, scrolled.plate.x, scrolled.plate.y, 8) : [];
  const cornerRow = scrolled ? await sampleRow(send, 8, 8, 8) : [];
  const plateLum = plateRow.length ? Math.round(Math.max(...plateRow.map(luminance))) : -1;
  const cornerLum = cornerRow.length ? Math.round(Math.max(...cornerRow.map(luminance))) : -1;
  check(
    "RH10 the pixel helper reads the Gallery scrolled past a screen: a plate's centre bright (49 on the unfixed clip, 210 fixed) and the corner dark (the pool or the deep, either far from a plate) at one scroll state, which no blank frame is (the sitting's ruling 6, 2026-09-03)",
    !!scrolled && scrolled.y >= 800 && plateLum > 120 && cornerLum > 15 && cornerLum < 90,
    JSON.stringify({
      y: scrolled && scrolled.y,
      sh: scrolled && scrolled.sh,
      plate: scrolled && scrolled.plate,
      plateLum,
      cornerLum,
    }),
  );
}

export async function rh10cPrinted(
  { evaluate, send, check, sleep }: RunningHeadKit,
  galleryNarrow: boolean,
): Promise<void> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const gPrint = galleryNarrow
    ? await evaluate<{
        content: string;
        folioPos: string;
        armed: boolean;
      } | null>(`(()=>{const e=document.querySelector(".corner.tr");if(!e)return null;const c=getComputedStyle(e,"::before");
    return{content:c.content,folioPos:getComputedStyle(e).position,armed:document.body.classList.contains("chart-room")&&!document.querySelector(".stage")};})()`)
    : null;
  type Fit = { scrollW: number; clientW: number; plates: number; maxRight: number; mainPadL: string };
  const FIT_READ: Payload<Fit> = `(()=>{const d=document.documentElement;const m=document.querySelector("main");const imgs=[...document.querySelectorAll(".grid img")];
    return{scrollW:d.scrollWidth,clientW:d.clientWidth,plates:imgs.length,maxRight:imgs.length?Math.round(Math.max(...imgs.map((el)=>el.getBoundingClientRect().right))):-1,mainPadL:m?getComputedStyle(m).paddingLeft:"absent"};})()`;
  // The poll breaks on the resize landing, never on the geometry the check asserts, and on exhaustion hands its last read to the check so a viewport that never resized reds RH10e by name instead of taking the suite.
  const fitAt = async (want: number): Promise<Fit | null> => {
    if (!galleryNarrow) return null;
    let read: Fit | null = null;
    for (let i = 0; i < 40; i++) {
      read = await evaluate(FIT_READ);
      if (read.clientW === want) return read;
      await sleep(50);
    }
    return read;
  };
  const gFit = await fitAt(390);
  await send("Emulation.setDeviceMetricsOverride", { width: 816, height: 1056, deviceScaleFactor: 1, mobile: false });
  const gFitLetter = await fitAt(816);
  await send("Emulation.setEmulatedMedia", { media: "" });
  check(
    "RH10c printed at 390, the Gallery's room folio stands in flow with NO panel (#538): the corner goes static on paper and the panel's absolute box resolved against the whole page (401 wide on the unfixed tree); the stage-less arm still matches under print, read in the same payload, so the none is the stand-down and not a lapsed arm. The page's own width moved to RH10d, which is where the plates' 2px lives (#565)",
    !!gPrint && gPrint.armed && gPrint.folioPos === "static" && gPrint.content === "none",
    JSON.stringify(gPrint),
  );
  check(
    "RH10d printed at 390x844 the Gallery fits its page: the widest plate's right edge lands ON the page's right edge and the document scrolls nowhere sideways (#565, 392 on 390 unfixed, a content-box plate at width 100% plus its 1px border). main's resolved side padding is the control, 16px on screen and 0 under the print block, and the plate reaching the edge is what keeps the fit from passing on a collapsed grid",
    !!gFit &&
      gFit.mainPadL === "0px" &&
      gFit.clientW === 390 &&
      gFit.plates > 0 &&
      gFit.scrollW === gFit.clientW &&
      gFit.maxRight === gFit.clientW,
    JSON.stringify(gFit),
  );
  check(
    "RH10e printed at 816x1056, a Letter page at 96dpi, the same holds across the two-column grid (818 on 816 unfixed: the defect is not width-specific, #565's 2026-09-11 comment). clientW 816 says the resize landed, so this cannot pass at the narrow width",
    !!gFitLetter &&
      gFitLetter.mainPadL === "0px" &&
      gFitLetter.clientW === 816 &&
      gFitLetter.plates > 0 &&
      gFitLetter.scrollW === gFitLetter.clientW &&
      gFitLetter.maxRight === gFitLetter.clientW,
    JSON.stringify(gFitLetter),
  );
}
