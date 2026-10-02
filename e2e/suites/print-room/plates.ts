import type { SuiteContext } from "../../types.ts";
import type { PrintRoomKit } from "./kit.ts";

export async function pr10PlatesEnable({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="42";document.getElementById("pr-style").value="antique";document.getElementById("pr-draw").click();})()`);
  let plateReady = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate<{ seed: number; status: string; disabled: boolean }>(`(()=>{const st=window.__vellumPrintRoomState();const g=document.querySelector('[data-poster="grand"]');return{seed:st.seed,status:document.getElementById("pr-status").textContent,disabled:g?g.disabled:true};})()`); } catch {}
    if (s && s.seed === 42 && s.status === "" && s.disabled === false) { plateReady = s; break; }
    await sleep(50);
  }
  check("PR10 plate buttons enable once a proof is on the desk", !!plateReady, JSON.stringify(plateReady));

  const clamp = await evaluate<{ hi: number; lo: number; grand: number }>(`(()=>{const f=window.__vellumClampPosterWidth;return{hi:f(999999),lo:f(1),grand:f(4200)};})()`);
  check("PR11 clampPosterWidth bounds any width to the [2400, 4200] envelope", clamp.hi === 4200 && clamp.lo === 2400 && clamp.grand === 4200, JSON.stringify(clamp));
}

export async function pr12GrandPoster({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  const accepted = await evaluate<{ disabled: boolean; status: string }>(`(()=>{window.__vellumLastPoster=undefined;const g=document.querySelector('[data-poster="grand"]');g.click();return{disabled:g.disabled,status:document.getElementById("pr-poster-status").textContent};})()`);
  check("PR12 ordering a plate disables the counter and rolls the press", accepted.disabled === true && /press is rolling/i.test(accepted.status), JSON.stringify(accepted));

  let poster = null;
  for (let i = 0; i < 220; i++) {
    let s = null;
    try {
      s = await evaluate<{ has: boolean; filename: string | undefined; width: number | undefined; seed: number | undefined; hasWidthAttr: boolean; hasRecipeAttr: boolean; reenabled: boolean; status: string; maxDom: number; preview: boolean }>(`(()=>{const p=window.__vellumLastPoster;const g=document.querySelector('[data-poster="grand"]');const svgs=[...document.querySelectorAll("svg")].map(el=>Number(el.getAttribute("width"))||0);return{has:!!p,filename:p&&p.filename,width:p&&p.width,seed:p&&p.seed,hasWidthAttr:!!(p&&p.svg.includes('width="4200"')),hasRecipeAttr:!!(p&&p.svg.includes('data-vellum-seed="42"')),reenabled:g?!g.disabled:false,status:document.getElementById("pr-poster-status").textContent,maxDom:svgs.length?Math.max(...svgs):0,preview:!!document.querySelector("#pr-preview svg")};})()`);
    } catch {}
    if (s && s.has) { poster = s; break; }
    await sleep(50);
  }
  check(
    "PR13 the Grand plate pulls a well-formed 4200px poster of the proof (counter re-opens, sheet named)",
    !!poster && poster.width === 4200 && poster.seed === 42 &&
      poster.filename === "vellum-poster-42-antique-4200.svg" &&
      poster.hasWidthAttr && poster.hasRecipeAttr &&
      poster.reenabled === true && /vellum-poster-42-antique-4200\.svg/.test(poster.status),
    JSON.stringify(poster && { ...poster }),
  );

  // The 1000px ceiling sits just above `PREVIEW_WIDTH` in `src/site/print-room/app.ts`, so any poster-sized svg reaching the live DOM trips it.
  check(
    "PR14 download-only: the wide poster never enters the DOM (no svg wider than the preview)",
    !!poster && poster.preview === true && poster.maxDom > 0 && poster.maxDom <= 1000,
    poster ? `maxDomSvgWidth=${poster.maxDom}` : "no poster",
  );

  const rt = await evaluate<{ seed: number; style: string } | null>(`(async()=>{const {recipeFromSvg}=await import("/explorer/engine/render/recipe-meta.js");const p=window.__vellumLastPoster;const r=p?recipeFromSvg(p.svg):null;return r?{seed:r.recipe.seed,style:r.style}:null;})()`, true);
  check("PR15 recipeFromSvg round-trips the poster (seed 42, antique)", !!rt && rt.seed === 42 && rt.style === "antique", JSON.stringify(rt));
}

export async function pr16Desk({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{window.__vellumLastPoster=undefined;document.querySelector('[data-poster="desk"]').click();})()`);
  let desk = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate<{ filename: string; width: number; hasWidthAttr: boolean } | null>(`(()=>{const p=window.__vellumLastPoster;return p?{filename:p.filename,width:p.width,hasWidthAttr:p.svg.includes('width="2400"')}:null;})()`); } catch {}
    if (s) { desk = s; break; }
    await sleep(50);
  }
  check(
    "PR16 the Desk plate downloads a well-formed 2400px poster (each preset, not just Grand)",
    !!desk && desk.width === 2400 && desk.filename === "vellum-poster-42-antique-2400.svg" && desk.hasWidthAttr,
    JSON.stringify(desk),
  );
}

export async function pr28ChartPlate({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{window.__vellumLastPoster=undefined;window.__vellumLastPng=undefined;document.getElementById("pr-format").value="png1";document.querySelector('[data-poster="chart"]').click();})()`);
  let chartPull = null;
  for (let i = 0; i < 220; i++) {
    let s = null;
    try {
      s = await evaluate<{ width: number; seed: number; filename: string; hasWidthAttr: boolean; hasRecipeAttr: boolean; pngFired: boolean; status: string } | null>(`(()=>{const p=window.__vellumLastPoster;return p?{width:p.width,seed:p.seed,filename:p.filename,hasWidthAttr:p.svg.includes('width="1500"'),hasRecipeAttr:p.svg.includes('data-vellum-seed="42"'),pngFired:window.__vellumLastPng!==undefined,status:document.getElementById("pr-poster-status").textContent}:null;})()`);
    } catch {}
    if (s) { chartPull = s; break; }
    await sleep(50);
  }
  check(
    "PR28 the Chart plate pulls the 1500px engraving, Explorer-named, ignoring the PNG format",
    !!chartPull && chartPull.width === 1500 && chartPull.seed === 42 &&
      chartPull.filename === "vellum-42-antique-the-isle-of-rahai.svg" &&
      chartPull.hasWidthAttr && chartPull.hasRecipeAttr && chartPull.pngFired === false &&
      /pulled as the engraving: vellum-42-antique-the-isle-of-rahai\.svg/.test(chartPull.status),
    JSON.stringify(chartPull),
  );

  // A dispatched change event is what clears the line: the programmatic value writes in orderPng below fire no change event, so this check cannot disturb them.
  const dismissed = await evaluate<{ before: string; after: string; plateOpen: boolean }>(
    `(()=>{const f=document.getElementById("pr-format");const before=document.getElementById("pr-poster-status").textContent;f.value="svg";f.dispatchEvent(new Event("change"));return{before,after:document.getElementById("pr-poster-status").textContent,plateOpen:!document.querySelector('[data-poster="chart"]').disabled};})()`,
  );
  check(
    "PR29 changing the Pressed-as format dismisses the stale poster status line",
    dismissed.before.length > 0 && dismissed.after === "" && dismissed.plateOpen === true,
    JSON.stringify(dismissed),
  );
}

export async function pr17Png({ check, orderPng }: PrintRoomKit): Promise<void> {
  const png1 = await orderPng("png1", "desk");
  check(
    "PR17 Desk PNG x1 is a well-formed 2400px image/png (nonzero, not clamped)",
    !!png1 && png1.type === "image/png" && png1.size > 0 && png1.width === 2400 &&
      png1.clamped === false && png1.filename === "vellum-poster-42-antique-2400.png",
    JSON.stringify(png1),
  );

  const png2 = await orderPng("png2", "desk");
  check(
    "PR18 Desk PNG x2 is a 4800px image/png, unclamped (scale carries through)",
    !!png2 && png2.type === "image/png" && png2.size > 0 && png2.width === 4800 &&
      png2.clamped === false && png2.filename === "vellum-poster-42-antique-4800.png",
    JSON.stringify(png2),
  );

  const png3 = await orderPng("png2", "grand");
  check(
    "PR19 Grand PNG x2 is budget-clamped with a visible notice (not a silent crash)",
    !!png3 && png3.type === "image/png" && png3.size > 0 && png3.clamped === true &&
      png3.scale < 2 && png3.width < 8400 && /reduced/i.test(png3.status) && /\.png$/.test(png3.filename),
    JSON.stringify(png3),
  );
}
