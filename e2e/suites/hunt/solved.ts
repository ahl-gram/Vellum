import type { SuiteContext } from "../../types.ts";
import type { Quarry } from "../hunt.ts";

export async function hd1Dispatch({ evaluate, check, shoot }: SuiteContext, tgt: Quarry): Promise<void> {
  // The dispatch is read through the window hook rather than clicking the button, so no real file download happens under CDP.
  const disp = await evaluate<{ exists: boolean; hidden: boolean; hasFn: boolean; svg: string }>(`(()=>{
    const btn=document.getElementById("dispatch");
    const fn=window.__vellumDispatchSvg;
    const svg=(typeof fn==="function")?fn():"";
    return{exists:!!btn,hidden:btn?btn.hidden:true,hasFn:typeof fn==="function",svg};
  })()`);
  check(
    "HD1 a live win offers the Draft dispatch button (#123)",
    disp.exists && disp.hidden === false,
    JSON.stringify({ exists: disp.exists, hidden: disp.hidden }),
  );

  // The 5px station tolerance covers the synthesized click's integer clientX/Y quantization amplified by the sheet-to-screen scale (~2-3px measured), yet stays 20x below any grid-vs-pixel coord-space mismatch.
  const d = disp.svg || "";
  const g = d.slice(d.indexOf("data-vellum-dispatch"));
  const stations = (d.match(/data-dispatch-station/g) || []).length;
  const st1 = g.match(/data-dispatch-station[^>]*?cx="([-\d.]+)"[^>]*?cy="([-\d.]+)"/);
  const cx = st1 ? parseFloat(st1[1]!) : NaN;
  const cy = st1 ? parseFloat(st1[2]!) : NaN;
  const gridOk = Math.abs(cx - tgt.miss.fx * tgt.wpx) < 5 && Math.abs(cy - tgt.miss.fy * tgt.hpx) < 5;
  check(
    "HD2 the dispatch clones the chart, plots the grid-projected route + star, captions the tally, inline-styled (#123)",
    disp.hasFn &&
      d.includes(`data-vellum-seed="${tgt.seed}"`) &&
      stations === 3 &&
      /<polyline[^>]*stroke:/.test(g) &&
      /data-dispatch-star/.test(g) &&
      g.includes("Quarry taken in 4 soundings") &&
      g.includes(`CHART № ${tgt.seed}`) &&
      gridOk &&
      g.includes("style=") &&
      !g.includes("class="),
    JSON.stringify({
      hasFn: disp.hasFn,
      seedKept: d.includes(`data-vellum-seed="${tgt.seed}"`),
      stations,
      poly: /<polyline[^>]*stroke:/.test(g),
      star: /data-dispatch-star/.test(g),
      caption: g.includes("Quarry taken in 4 soundings"),
      chartNo: g.includes(`CHART № ${tgt.seed}`),
      gridOk,
      cx,
      cy,
      expX: tgt.miss.fx * tgt.wpx,
      expY: tgt.miss.fy * tgt.hpx,
      inline: g.includes("style=") && !g.includes("class="),
    }),
  );
  await shoot("hunt-seed-of-the-day.png");
}

export async function h8Reload({ evaluate, send, check, sleep }: SuiteContext, HUNT_PAGE: string): Promise<void> {
  await send("Page.navigate", { url: HUNT_PAGE });
  let huntRestored = false;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate<{ star: boolean; solved: boolean; ls: string | null }>(
        `(()=>{const star=document.querySelector("#map .hunt-star");const solved=document.getElementById("map").classList.contains("solved");return{star:!!star,solved,ls:localStorage.getItem("vellum.hunt.v1")};})()`,
      );
    } catch {}
    if (s && s.star && s.solved) {
      huntRestored = /"streak":1/.test(s.ls || "");
      break;
    }
    await sleep(75);
  }
  check("H8 reload restores the solved state without inflating the streak", huntRestored);

  const still = await evaluate<{
    star: boolean;
    stamp: boolean;
    starAnim: string | null;
    revShown: boolean;
    unfurl: boolean;
    revAnim: string | null;
  }>(
    `(()=>{const s=document.querySelector("#map .hunt-star");const rev=document.getElementById("reveal");return{star:!!s,stamp:!!(s&&s.classList.contains("stamp")),starAnim:s?getComputedStyle(s).animationName:null,revShown:!!(rev&&!rev.hidden),unfurl:!!(rev&&rev.classList.contains("unfurl")),revAnim:rev?getComputedStyle(rev).animationName:null};})()`,
  );
  check(
    "H8b a solved-day reload is still: star + reveal restored without replaying the win ceremony",
    still.star &&
      !still.stamp &&
      still.starAnim === "none" &&
      still.revShown &&
      !still.unfurl &&
      still.revAnim === "none",
    JSON.stringify(still),
  );

  const dispRestored = await evaluate<{ exists: boolean; hidden: boolean }>(
    `(()=>{const b=document.getElementById("dispatch");return{exists:!!b,hidden:b?b.hidden:false};})()`,
  );
  check(
    "HD3 a restored solve never offers the dispatch: button present but hidden (#123)",
    dispRestored.exists && dispRestored.hidden === true,
    JSON.stringify(dispRestored),
  );
}
