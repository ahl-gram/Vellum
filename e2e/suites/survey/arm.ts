import type { SurveyKit } from "./kit.ts";

export async function sv1Boots({ evaluate, check, goto }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique", "survey-base");
  const sv1 = await evaluate<{
    gone: boolean;
    checked: boolean;
    track: boolean;
    journalShown: boolean;
    journalHref: string | null;
    hash: string;
    label: string;
    status: string;
  }>(`(()=>{
      const ids=["scrubber","scrub-play","scrub-range","scrub-year","scrub-sig","chronicle-strip","journal-line"];
      const j=document.getElementById("journal-link");
      return{gone:ids.every((id)=>!document.getElementById(id)),
        checked:document.getElementById("ages").checked,
        track:!!document.querySelector("#map .voyage-overlay"),
        journalShown:!!j&&j.getClientRects().length>0,
        journalHref:j?j.getAttribute("href"):"",hash:location.hash,
        label:(document.getElementById("ages").closest("label")||{}).textContent||"",
        status:document.getElementById("status").textContent};
    })()`);
  check(
    "SV1 the scrubber panel and journal strip are gone from the DOM, the box boots unticked, the sheet bare, the journal button standing",
    sv1.gone &&
      !sv1.checked &&
      !sv1.track &&
      sv1.journalShown &&
      sv1.journalHref === "/reading-room/" + sv1.hash &&
      sv1.label.trim().startsWith("survey") &&
      sv1.status === "",
    JSON.stringify(sv1),
  );
}

export async function sv2FirstArm({ evaluate, check, shoot, waitInked, tick }: SurveyKit) {
  // Issue #373: the frame clock runs across the FIRST arm, the only uncached one; every later arm takes the held order and would pass this blind.
  await evaluate(`(()=>{window.__gap=0;window.__gapStop=false;let last=performance.now();
      const step=(now)=>{window.__gap=Math.max(window.__gap,now-last);last=now;
        if(!window.__gapStop)requestAnimationFrame(step);};requestAnimationFrame(step);})()`);
  const inkT0 = Date.now();
  const sv2 = await tick(true, "__armMs");
  const sv2Vertices = await waitInked("survey-first-arm");
  const firstInkMs = Date.now() - inkT0;
  const sv2q = await evaluate<{ gap: number }>(`(()=>{window.__gapStop=true;return{gap:window.__gap};})()`);
  const sv2After = await evaluate<{
    status: string;
    hash: string;
    overlays: number;
    href: string | null;
    ms: number | null;
  }>(`({status:document.getElementById("status").textContent,
      hash:location.hash,overlays:document.querySelectorAll("#map .voyage-overlay").length,
      href:document.getElementById("journal-link").getAttribute("href"),ms:window.__armMs})`);
  check(
    "SV2 ticking survey acknowledges on the click's own frame and inks the completed track a beat later (#300)",
    sv2.checked &&
      !sv2.inked &&
      sv2.handlerMs < 50 &&
      /(^|&)survey(&|$)/.test(sv2.hash.slice(1)) &&
      !/year=/.test(sv2.hash) &&
      sv2.status === "" &&
      sv2.href === "/reading-room/" + sv2.hash &&
      sv2Vertices > 10 &&
      sv2After.overlays === 1 &&
      sv2After.status === "" &&
      sv2After.hash === sv2.hash &&
      sv2After.href === sv2.href,
    JSON.stringify({ ...sv2, vertices: sv2Vertices, after: sv2After }),
  );
  check(
    "SV2q the main thread keeps painting right through the arm: the travel matrix is off it (#373)",
    // RATIO, not a wall clock: the arm's own cold routing is real main-thread work that scales with the runner, and a fixed cap sized here read 383.4 against 400 on a loaded CI runner, which is a coin flip. A BLOCKED thread makes the largest gap essentially the whole tick-to-ink, so a third of it separates the two populations at any speed: measured 141.7/1148 and 383.4/3149 healthy, against 1074.7/1089 with the matrix put back.
    sv2q.gap > 0 && sv2q.gap < firstInkMs / 3,
    JSON.stringify({ ...sv2q, firstInkMs, share: +(sv2q.gap / firstInkMs).toFixed(3) }),
  );
  await shoot("explorer-survey-inked.png");
  return firstInkMs;
}

export async function sv2cReArm({ evaluate, check, waitInked, tick }: SurveyKit, firstInkMs: number): Promise<void> {
  // Issue #373 rewrote what these two measure: the matrix runs in the render worker now, so __armMs (a rAF-then-task hop) collapses to one frame whether the order is cached or not, and the ratio it used to carry moved to the wall clock from tick to ink. Issue #529 dropped the 800ms absolute cap that rode beside the ratio, because it measured runner tail rather than the cache and is what failed CI at 810ms while the ratio passed at 810/3097; mutation-checked 2026-09-07 by deleting prime()'s cache-hit test in tour-order.ts, which reads 1187/1171 (ratio 1.01) against 157/1189 (0.13) healthy, so the ratio alone separates the two populations at any runner speed.
  await evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  const reInkT0 = Date.now();
  await tick(true, "__armMs2");
  await waitInked("survey-rearm");
  const reInkMs = Date.now() - reInkT0;
  const sv2c = await evaluate<{ first: number | null; again: number | null }>(
    `({first:window.__armMs,again:window.__armMs2})`,
  );
  check(
    "SV2c re-arming the same world is effectively instant: the travel matrix cache still holds (#300/#373)",
    reInkMs < firstInkMs / 2,
    JSON.stringify({ ...sv2c, firstInkMs, reInkMs }),
  );
}
