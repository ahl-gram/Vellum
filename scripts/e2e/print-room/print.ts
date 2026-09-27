import type { Payload, SuiteContext } from "../types.ts";
import type { PrintRoomKit } from "./kit.ts";
import type { Warning } from "./reads.ts";

export async function pr21BoundPrint({ evaluate, send, check, atlasFitAt }: PrintRoomKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printView = await evaluate<{ stage: string; slip: string; legend: string; folioRoom: string; glass: string; atlas: string; hero: string; breakAfter: string }>(`(()=>{const disp=(sel)=>{const el=document.querySelector(sel);return el?getComputedStyle(el).display:"absent";};const f=document.querySelector("#pr-atlas figure:not(.banner)");return{stage:disp(".stage"),slip:disp(".slip"),legend:disp(".legend"),folioRoom:disp(".corner.folio-room"),glass:disp(".zoomery"),atlas:disp("#pr-atlas"),hero:disp("#pr-atlas .hero-plate"),breakAfter:f?getComputedStyle(f).breakAfter:"absent"};})()`);
  check(
    "PR21 bound, print is the atlas: the stage, the slip, the legend row, the Glass and the room's name print as nothing, the document and its hero print, one plate per page (ruled 2026-08-30)",
    printView.stage === "none" && printView.slip === "none" && printView.legend === "none" && printView.folioRoom === "none" && printView.glass === "none" &&
      printView.atlas !== "none" && printView.hero !== "none" && printView.breakAfter === "page",
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
    !!fitLetter && !!fitNarrow && fitLetter.atlasPadL === "0px" && fitLetter.plates > 0 &&
      fitLetter.clientW === 816 && fitLetter.scrollW === 816 && fitLetter.maxRight === 816 &&
      fitNarrow.clientW === 390 && fitNarrow.scrollW === 390 && fitNarrow.maxRight === 390,
    JSON.stringify({ letter: fitLetter, narrow: fitNarrow }),
  );

  // The 20000-char floor is what separates a real bound atlas from the tiny PDF a blank sheet or a print-blank plate yields; paper fidelity itself stays a manual pass.
  let pdf;
  try { pdf = await send<{ data: string }>("Page.printToPDF", { printBackground: true }); } catch { pdf = null; }
  check(
    "PR22 browser Save-as-PDF yields a well-formed, non-empty bound atlas",
    !!pdf && typeof pdf.data === "string" && pdf.data.length > 20000,
    pdf ? `${pdf.data.length} base64 chars` : "printToPDF failed",
  );
  await send("Emulation.setEmulatedMedia", { media: "" });
}

export async function pr21bUnboundPrint({ evaluate, send, check }: SuiteContext): Promise<void> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printProof = await evaluate<{ stage: string; stagePos: string; map: string; svg: boolean; atlasEmpty: boolean; slip: string }>(`(()=>{const cs=(sel)=>getComputedStyle(document.querySelector(sel));return{stage:cs(".stage").display,stagePos:cs(".stage").position,map:cs("#map").transform,svg:!!document.querySelector("#pr-preview svg"),atlasEmpty:document.getElementById("pr-atlas").children.length===0,slip:cs(".slip").display};})()`);
  check(
    "PR21b unbound, print is the proof: the stage prints in flow, unzoomed, the slip as nothing, the document empty (ruled 2026-08-30)",
    printProof.stage !== "none" && printProof.stagePos === "static" && printProof.map === "none" && printProof.svg === true && printProof.atlasEmpty === true && printProof.slip === "none",
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
    !!warnScreen && warnScreen.hidden === false && warnScreen.disp !== "none" && warnScreen.w > 0 && warnScreen.pos === "absolute" &&
      !!warnPrint && warnPrint.hidden === false && warnPrint.disp === "none" && warnPrint.w === 0,
    JSON.stringify({ screen: warnScreen, print: warnPrint }),
  );
  // Paper lays out under the 900px query (test/site/room.test.ts pins the taking-back).
  await send("Emulation.setDeviceMetricsOverride", { width: 816, height: 1056, deviceScaleFactor: 1, mobile: false });
  const paper = await evaluate<{ w: number; tagline: string; name: string; nameSize: string; folioMax: string; stagePos: string; corner: string }>(`(()=>{const cs=(sel)=>getComputedStyle(document.querySelector(sel));return{w:window.innerWidth,tagline:cs(".folio-room .room-tagline").display,name:cs(".folio-room .room-name").display,nameSize:cs(".folio-room .room-name").fontSize,folioMax:cs(".corner.folio-room").maxWidth,stagePos:cs(".stage").position,corner:cs(".corner.bl").display};})()`);
  check(
    "PR21c at paper width (816px, print media) the room's name and tagline print at their own size and the corner is unclamped; the chart's folio prints as nothing",
    paper.w === 816 && paper.tagline === "block" && paper.name === "block" && paper.nameSize === "21.12px" && paper.folioMax === "none" && paper.stagePos === "static" && paper.corner === "none",
    JSON.stringify(paper),
  );
  await send("Emulation.clearDeviceMetricsOverride");
  await send("Emulation.setEmulatedMedia", { media: "" });
}
