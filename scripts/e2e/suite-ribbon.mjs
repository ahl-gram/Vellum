// Ribbon e2e (the RB checks; the chart room since #463 part 4/4): the strip-chart page boots from the shared worker, defaults to the capital's farthest road, the itinerary fills the slip and a row leans the Glass, a picked journey redraws in place and writes the address and the roads out, the phone docks the journey into the sheet, and the same address presses byte-identical scrolls; self-contained like its sibling suites (navigates itself, carries scoped no-4xx and console-error deltas).
export async function run(ctx) {
  const { evaluate, send, check, sleep, setMobileViewport, clearMobile, consoleErrors, http4xx, PORT } = ctx;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  const page = (hash) => `http://127.0.0.1:${PORT}/ribbon/${hash}`;
  // A hash-to-hash Page.navigate on one path is a SAME-DOCUMENT navigation that never
  // re-boots the page, so every fresh address arrives through a real cross-path hop
  // (the prospect suite's precedent).
  const goto = async (hash) => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/faq/` });
    for (let i = 0; i < 100; i++) {
      let away = null;
      try { away = await evaluate(`!document.getElementById("rb-plate")`); } catch {}
      if (away) break;
      await sleep(50);
    }
    await send("Page.navigate", { url: page(hash) });
  };
  const STATE = `(()=>{const st=window.__vellumRibbonState&&window.__vellumRibbonState();const img=document.getElementById("rb-plate");if(!st)return null;const q=(sel)=>{const el=document.querySelector(sel);return el?el.textContent:null;};const a=(id)=>document.getElementById(id).getAttribute("href");const to=document.getElementById("rb-to");return{seed:st.seed,from:st.from,to:st.to,leagues:st.leagues,dress:st.dress,stRows:st.rows,blob:!!(img&&img.src&&img.src.startsWith("blob:")),shown:!!img&&!img.hidden,status:q("#rb-status"),title:q("#folio-title"),sub:q("#folio-sub"),unrolled:q("#rb-unrolled"),chart:a("rb-chart-link"),prospect:a("rb-prospect-link"),prospectVerb:q("#rb-prospect-verb"),slipTitle:q("#itinerary-title"),where:q("#itinerary .card-where"),rows:document.querySelectorAll("#rb-itinerary li").length,toName:to.selectedOptions[0]?to.selectedOptions[0].textContent:null,fromOptions:[...document.getElementById("rb-from").options].map((o)=>Number(o.value)),prospectShown:getComputedStyle(document.getElementById("rb-prospect-link")).display!=="none",hash:location.hash};})()`;
  const state = () => evaluate(STATE);
  const opened = async (label) => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try { s = await state(); } catch {}
      if (s && s.blob && s.status === "") return s;
      await sleep(75);
    }
    throw new Error("ribbon page never drew: " + label);
  };
  const svgOf = () => evaluate(`fetch(document.getElementById("rb-plate").src).then(r=>r.text())`, true);

  await send("Page.navigate", { url: page("#seed=42") });
  const first = await opened("seed 42");
  check(
    "RB1 seed 42 sets out from the capital for its farthest road",
    first.seed === 42 && first.from === 0 && first.leagues > 0 && first.shown,
    JSON.stringify({ from: first.from, to: first.to, leagues: first.leagues }),
  );
  check("RB2 the render worker serves the page (no silent inline fallback)", await evaluate(`window.__vellumRibbonUsesWorker() === true`));
  check(
    "RB3 the chart's folio names the journey, its world, its length and its dress",
    /^Laukuwelua to .+ · Chart № 42$/.test(first.title) && /^The Isle of Rahai · the road as the wayfarers' chain measured it, An\. \d+$/.test(first.sub) && /^unrolled in \d+ms · \d+ leagues · antique$/.test(first.unrolled),
    JSON.stringify({ title: first.title, sub: first.sub, unrolled: first.unrolled }),
  );
  check(
    "RB4 the address gains the journey keys once drawn",
    /(^|&)a=0(&|$)/.test(first.hash.slice(1)) && /(^|&)b=\d+/.test(first.hash.slice(1)),
    first.hash,
  );
  const svg1 = await svgOf();
  check(
    "RB5 the plate is an itinerary strip chart of this road",
    typeof svg1 === "string" && svg1.includes("An itinerary strip chart of the road from Laukuwelua"),
    String(svg1).slice(0, 120),
  );
  const rows = await evaluate(`(()=>{const lis=[...document.querySelectorAll("#rb-itinerary li")];const read=(li)=>({cls:li.className,num:(li.querySelector(".cr-num")||{}).textContent,strong:(li.querySelector("strong")||{}).textContent||null,em:(li.querySelector("em")||{}).textContent||null,button:!!li.querySelector("button.lean")});return{first:lis.length?read(lis[0]):null,last:lis.length?read(lis[lis.length-1]):null,buttons:lis.every((li)=>!!li.querySelector("button.lean"))};})()`);
  check(
    "RB5b the itinerary fills the slip: one row per event, the departure first as the capital at 0 leagues, the arrival last, every row a lean button; the slip's head names the journey",
    first.rows === first.stRows && first.rows >= 4 && rows.first && rows.first.cls === "waypoint" && rows.first.num === "0" && rows.first.strong === "Laukuwelua" && rows.first.em === "the capital" && rows.last && rows.last.cls === "waypoint" && rows.last.strong === first.toName && rows.buttons && first.slipTitle === `Laukuwelua to ${first.toName}` && /^\d+ leagues · in .+ · An\. \d+$/.test(first.where),
    JSON.stringify({ rows: first.rows, stRows: first.stRows, first: rows.first, last: rows.last, slipTitle: first.slipTitle, where: first.where, toName: first.toName }),
  );
  check(
    "RB5e setting out from offers only places a road leaves: seed 42's orphan Tewetulua (24) is not among them (#494)",
    first.fromOptions.length === 25 && !first.fromOptions.includes(24) && first.fromOptions.includes(0),
    JSON.stringify({ count: first.fromOptions.length, has24: first.fromOptions.includes(24) }),
  );
  await evaluate(`document.querySelectorAll("#rb-itinerary li .lean")[2].click()`);
  let leaned = null;
  for (let i = 0; i < 60; i++) {
    try { leaned = await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;const t=getComputedStyle(document.getElementById("map")).transform;const m=/matrix\\(([^,]+),[^,]+,[^,]+,[^,]+,([^,]+),([^)]+)\\)/.exec(t);const k=m?Number(m[1]):1,x=m?Number(m[2]):0,y=m?Number(m[3]):0;const lis=[...document.querySelectorAll("#rb-itinerary li")];const on=lis.findIndex((li)=>li.classList.contains("on"));const row=lis[2];return{zoomed:vp.classList.contains("zoomed"),k,on,cx:(W/2-x)/(k*W),cy:(H/2-y)/(k*H),nx:Number(row.dataset.nx),ny:Number(row.dataset.ny)};})()`); } catch {}
    if (leaned && leaned.zoomed && Math.abs(leaned.k - 2.6) < 0.02) break;
    await sleep(50);
  }
  check(
    "RB5c a row leans the Glass on its stretch: the sheet magnifies to the mockup's 2.6x, centred on the row's own seat, and the row is marked",
    !!leaned && leaned.zoomed && Math.abs(leaned.k - 2.6) < 0.02 && leaned.on === 2 && Math.abs(leaned.cx - leaned.nx) < 1e-3 && Math.abs(leaned.cy - leaned.ny) < 1e-3,
    JSON.stringify(leaned),
  );
  await evaluate(`document.getElementById("map-viewport").dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}))`);
  for (let i = 0; i < 60; i++) {
    let home = null;
    try { home = await evaluate(`!document.getElementById("map-viewport").classList.contains("zoomed")`); } catch {}
    if (home) break;
    await sleep(50);
  }
  check(
    "RB5d the roads out: the Explorer sheds the journey's keys, the Prospect takes the same world with the road's end as its town (#494 ruling 3)",
    first.chart === "/explorer/#seed=42" && first.prospect === `/prospect/#seed=42&i=${first.to}` && first.prospectVerb === `See ${first.toName} in` && first.prospectShown,
    JSON.stringify({ chart: first.chart, prospect: first.prospect, verb: first.prospectVerb, shown: first.prospectShown }),
  );

  const picked = await evaluate(`(()=>{const sel=document.getElementById("rb-to");const cur=sel.value;const opt=[...sel.options].find(o=>o.value!==cur);if(!opt)return null;sel.value=opt.value;sel.dispatchEvent(new Event("change"));return Number(opt.value);})()`);
  let redrawn = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await state(); } catch {}
    if (s && s.to === picked && s.status === "") { redrawn = s; break; }
    await sleep(75);
  }
  check(
    "RB6 a picked destination redraws in place and writes the address",
    redrawn !== null && new RegExp(`(^|&)b=${picked}(&|$)`).test(String(redrawn && redrawn.hash).slice(1)),
    JSON.stringify({ picked, redrawn: redrawn && { to: redrawn.to, hash: redrawn.hash } }),
  );
  check(
    "RB6b the redraw refills the slip and re-aims the prospect road at the new destination",
    redrawn !== null && redrawn.rows === redrawn.stRows && redrawn.rows >= 2 && redrawn.prospect === `/prospect/#seed=42&i=${picked}` && redrawn.slipTitle === `Laukuwelua to ${redrawn.toName}`,
    JSON.stringify(redrawn && { rows: redrawn.rows, prospect: redrawn.prospect, slipTitle: redrawn.slipTitle }),
  );

  await goto("#seed=42");
  await opened("the same address, fresh visit");
  const svg2 = await svgOf();
  check("RB7 the same address presses a byte-identical scroll", svg1 === svg2, `first ${String(svg1).length}b, second ${String(svg2).length}b`);

  await goto("#seed=42&style=ink");
  const inked = await opened("the ink dress");
  check("RB8 an ink chart unrolls an ink scroll (the two-dress fallback)", inked.dress === "ink", inked.dress);

  await setMobileViewport(390, 844);
  await goto("#seed=42");
  await opened("the phone");
  const phone = await evaluate(`(()=>{const j=document.getElementById("rb-journey");const swap=document.getElementById("rb-swap");return{journeyIn:j.parentElement.className,inSlip:j.classList.contains("in-slip"),swapIn:swap.parentElement.className,froms:document.querySelectorAll("#rb-from").length,tos:document.querySelectorAll("#rb-to").length,legendIn:document.querySelector(".legend").parentElement.className,sheetW:document.getElementById("sheet").getBoundingClientRect().width,vw:window.innerWidth};})()`);
  check(
    "RB8b on a phone the journey docks into the sheet as one group (its ids single), Turn about stays in the corner, the legend docks too, and the landscape scroll takes the viewport's width",
    phone.journeyIn === "journey-dock" && phone.inSlip && /folio-controls/.test(phone.swapIn) && phone.froms === 1 && phone.tos === 1 && phone.legendIn === "legend-dock" && Math.abs(phone.sheetW - phone.vw) < 1,
    JSON.stringify(phone),
  );
  await clearMobile();
  await goto("#seed=42");
  await opened("the wide sheet again");
  const wide = await evaluate(`(()=>{const j=document.getElementById("rb-journey");return{journeyIn:j.parentElement.className,inSlip:j.classList.contains("in-slip")};})()`);
  check("RB8c back on a wide sheet the journey stands in the corner again", /folio-controls/.test(wide.journeyIn) && !wide.inSlip, JSON.stringify(wide));

  check("RB9 no console errors across the ribbon checks", consoleErrors.length === errBase, consoleErrors.slice(errBase).join(" | "));
  check("RB10 no HTTP 4xx across the ribbon checks", http4xx.length === httpBase, http4xx.slice(httpBase).join(" | "));
}
