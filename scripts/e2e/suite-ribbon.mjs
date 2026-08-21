// Ribbon e2e (RB1-RB10): the strip-chart page boots from the shared worker, defaults to
// the capital's farthest road, a picked journey redraws in place and writes the address,
// and the same address presses byte-identical scrolls; self-contained like its sibling
// suites (navigates itself, carries scoped no-4xx and console-error deltas).
export async function run(ctx) {
  const { evaluate, send, check, sleep, consoleErrors, http4xx, PORT } = ctx;
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
  const opened = async (label) => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try {
        s = await evaluate(`(()=>{const st=window.__vellumRibbonState&&window.__vellumRibbonState();const img=document.getElementById("rb-plate");return st?{seed:st.seed,from:st.from,to:st.to,leagues:st.leagues,dress:st.dress,blob:!!(img&&img.src&&img.src.startsWith("blob:")),shown:!!img&&!img.hidden,status:document.getElementById("rb-status").textContent,caption:document.getElementById("rb-caption").textContent,hash:location.hash}:null;})()`);
      } catch {}
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
    "RB3 the caption names the journey, its length, and its world",
    /The road from Laukuwelua/.test(first.caption) && /leagues/.test(first.caption) && /The Isle of Rahai/.test(first.caption) && /seed 42/.test(first.caption),
    first.caption,
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

  const picked = await evaluate(`(()=>{const sel=document.getElementById("rb-to");const cur=sel.value;const opt=[...sel.options].find(o=>o.value!==cur);if(!opt)return null;sel.value=opt.value;sel.dispatchEvent(new Event("change"));return Number(opt.value);})()`);
  let redrawn = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumRibbonState();return st?{to:st.to,status:document.getElementById("rb-status").textContent,hash:location.hash}:null;})()`); } catch {}
    if (s && s.to === picked && s.status === "") { redrawn = s; break; }
    await sleep(75);
  }
  check(
    "RB6 a picked destination redraws in place and writes the address",
    redrawn !== null && new RegExp(`(^|&)b=${picked}(&|$)`).test(String(redrawn && redrawn.hash).slice(1)),
    JSON.stringify({ picked, redrawn }),
  );

  await goto("#seed=42");
  await opened("the same address, fresh visit");
  const svg2 = await svgOf();
  check("RB7 the same address presses a byte-identical scroll", svg1 === svg2, `first ${String(svg1).length}b, second ${String(svg2).length}b`);

  await goto("#seed=42&style=ink");
  const inked = await opened("the ink dress");
  check("RB8 an ink chart unrolls an ink scroll (the two-dress fallback)", inked.dress === "ink", inked.dress);

  check("RB9 no console errors across the ribbon checks", consoleErrors.length === errBase, consoleErrors.slice(errBase).join(" | "));
  check("RB10 no HTTP 4xx across the ribbon checks", http4xx.length === httpBase, http4xx.slice(httpBase).join(" | "));
}
