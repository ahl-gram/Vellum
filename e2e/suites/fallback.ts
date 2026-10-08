// Inline-fallback e2e (B): the worker bundle is served 404 (faithfully simulating file://, a 404, or a CSP block) and the page must degrade to the inline engine; no working-tree mutation, restored in finally.
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep, waitSettled, serverState } = ctx;
  // B1 and B2 are deliberately not stepped: their own poll returns rather than throwing, and their checks already guard on it.
  const step = makeStep(ctx);
  try {
    await send("Network.clearBrowserCache"); // so the now-404 worker chunk isn't served from cache
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await evaluate(`window.__preReload = true`);
    serverState.blockWorker = true;
    await send("Page.reload", { ignoreCache: true });
    // Wait for the POST-reload document (the sentinel gone), so nothing asserts against the pre-reload page still present during navigation.
    let fresh = false;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate<{ pre: boolean; uw: boolean; map: boolean; status: string | undefined }>(
          `({pre:typeof window.__preReload!=="undefined",uw:typeof window.__vellumUsesWorker==="function",map:!!document.querySelector("#map svg"),status:(document.getElementById("status")||{}).textContent})`,
        );
      } catch {}
      if (s && !s.pre && s.uw && s.map && s.status === "") {
        fresh = true;
        break;
      }
      await sleep(75);
    }
    check("B1 fallback: page still renders without the worker", fresh);
    check(
      "B2 fallback: __vellumUsesWorker()===false (inline path taken)",
      await evaluate<boolean>(`window.__vellumUsesWorker()===false`),
    );
    await step("B2b", () => b2bBackupOrder(ctx));
    await step("B3", async () => {
      await evaluate(
        `(()=>{document.getElementById("seed").value="42";document.getElementById("theme").value="";document.getElementById("draw").click();})()`,
      );
      await waitSettled("fallback-draw");
      // Issue #199 retired the inline Bind button, so the atlas job is driven through runJob, which routes to the inline engine here (the worker is 404'd), exactly the path this suite exists to prove.
      const fb = await evaluate<{
        hero: boolean;
        draughtings: number;
        themes: number;
        gaz: number;
        prospects: number;
        lettered: boolean;
      }>(
        `(async()=>{const a=(await window.__vellumRunJob({kind:"atlas",seed:42,overrides:{},width:1500})).atlas;` +
          `return{hero:!!(a.hero&&a.hero.svg),draughtings:a.draughtings.length,themes:a.themes.length,gaz:a.gazetteerHtml.length,prospects:a.prospects.length,lettered:a.prospects.length>0&&a.prospects[0].svg.includes('href="#pf-')};})()`,
        true,
      );
      check(
        "B3 fallback: inline atlas job composes a full atlas (hero + plates + the lettered prospect + gazetteer)",
        fb.hero && fb.draughtings > 0 && fb.themes > 0 && fb.gaz > 0 && fb.prospects === 1 && fb.lettered,
        JSON.stringify(fb),
      );
    });
  } finally {
    serverState.blockWorker = false;
    try {
      await send("Network.setCacheDisabled", { cacheDisabled: false });
    } catch {}
  }
}

async function b2bBackupOrder({ evaluate, check }: SuiteContext): Promise<void> {
  const fifo = await evaluate<{
    atBoot: number;
    fetched: string[];
    order: string[];
    bootCarries: string[];
    fetchedCarries: string[];
  }>(
    `(async()=>{const chunks=()=>performance.getEntriesByType("resource").map((e)=>new URL(e.name).pathname).filter((p)=>p.startsWith("/explorer/chunks/"));const before=chunks();const order=[];` +
      `const p=window.__vellumRunJob({kind:"prospect",seed:42,overrides:{},index:1,dress:"antique",year:null}).then(()=>order.push("prospect"));` +
      `const d=window.__vellumRunJob({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).then(()=>order.push("draw"));` +
      `await Promise.all([p,d]);const fetched=chunks().filter((c)=>!before.includes(c));` +
      `const {ROMAN}=await import("./engine/prospect/letter/face-roman.js");const outline=Object.values(ROMAN.glyphs).map((g)=>g[5]).reduce((a,b)=>b.length>a.length?b:a);` +
      `const carrying=async(paths)=>(await Promise.all(paths.map(async(c)=>((await (await fetch(c)).text()).includes(outline)?c:"")))).filter(Boolean);` +
      `return{atBoot:before.length,fetched,order,bootCarries:await carrying(before),fetchedCarries:await carrying(fetched)};})()`,
    true,
  );
  check(
    "B2b fallback: a plate job and a draw posted behind it settle in the order posted, the plate's lettering in no file the boot fetched and in one the plate job fetched",
    fifo.order.join() === "prospect,draw" && fifo.bootCarries.length === 0 && fifo.fetchedCarries.length > 0,
    JSON.stringify(fifo),
  );
}
