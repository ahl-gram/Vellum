import type { SuiteContext } from "../types.ts";

export async function pr32Phone({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  const phone390 = await evaluate<{ shown: boolean; glassClosed: string; glassOpen: string; hitOk: boolean; glassBack: string }>(`(()=>{const cs=(s)=>getComputedStyle(document.querySelector(s));const style=document.getElementById("pr-style");const shown=cs("#pr-style").display!=="none";const glassClosed=cs(".zoomery").display;document.querySelector(".slip-handle").click();const glassOpen=cs(".zoomery").display;const r=style.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);const hitOk=hit===style||style.contains(hit);document.querySelector(".slip-handle").click();return{shown,glassClosed,glassOpen,hitOk,glassBack:cs(".zoomery").display};})()`);
  check(
    "PR32 at 390 the style picker shows and takes its own tap; the Glass stands down while the sheet is open and returns when it folds (ruled 2026-08-30; skeptic round 2's stolen-tap collision)",
    !!phone390 && phone390.shown === true && phone390.glassClosed === "flex" && phone390.glassOpen === "none" && phone390.hitOk === true && phone390.glassBack === "flex", // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    JSON.stringify(phone390),
  );

  await evaluate(`document.getElementById("pr-bind").click()`);
  let phoneBound = false;
  for (let i = 0; i < 300; i++) {
    if (await evaluate<boolean>(`document.body.classList.contains("has-atlas")`)) { phoneBound = true; break; }
    await sleep(50);
  }
  await evaluate(`(()=>{const b=document.querySelector('#pr-contents .turn[data-plate="gazetteer"]');if(b)b.click();})()`);
  let phonePage = null;
  for (let i = 0; i < 40; i++) {
    let m = null;
    try { m = await evaluate<{ ratio: number; aspect: number; w: number; top: number; bottom: number; headBottom: number; slipTop: number; pageUp: boolean; fits: number; innerW: number; noX: boolean }>(`(()=>{const s=document.getElementById("sheet").getBoundingClientRect();const head=document.querySelector("header.chrome").getBoundingClientRect();const slip=document.querySelector(".slip").getBoundingClientRect();const page=document.getElementById("pr-page");const inner=document.getElementById("pr-page-inner");return{ratio:s.width/s.height,aspect:Number(page.dataset.aspect),w:s.width,top:s.top,bottom:s.bottom,headBottom:head.bottom,slipTop:slip.top,pageUp:!page.hidden,fits:page.getBoundingClientRect().bottom-inner.getBoundingClientRect().bottom,innerW:Math.abs(inner.getBoundingClientRect().width-page.clientWidth),noX:document.documentElement.scrollWidth<=document.documentElement.clientWidth};})()`); } catch {}
    phonePage = m;
    if (m && m.fits >= -0.5 && m.fits <= 2) break;
    await sleep(50);
  }
  check(
    "PR33c at 390 the gazetteer page fits the phone stage: clear of the fixed header above and the bottom sheet below, narrower than the viewport at its own aspect",
    phoneBound && !!phonePage && phonePage.pageUp === true && Math.abs(phonePage.ratio - phonePage.aspect) < 0.01 &&
      phonePage.w < 390 && phonePage.w > 200 && phonePage.top >= phonePage.headBottom - 0.5 && phonePage.bottom <= phonePage.slipTop + 0.5 &&
      phonePage.fits >= -0.5 && phonePage.fits <= 2 && phonePage.innerW < 1 && phonePage.noX === true,
    JSON.stringify(phonePage),
  );
  await evaluate(`document.getElementById("pr-hide").click()`);
  await send("Emulation.clearDeviceMetricsOverride");
}
