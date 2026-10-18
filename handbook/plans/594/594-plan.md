# Issue #594 plan: the Glass's stop loop goes, with the dependency only it read

**Status**: finished and ruled, ready for `vellum-implementer`.
**Planned at**: `origin/main` `ed41e29b7abe5a49cd2cece779553f5463a8c3f6`, Issue #594 comment count 2 (2026-10-18).
**Rulings**: Alex, 2026-10-18, option 1 "Remove the unused code", https://github.com/ahl-gram/Vellum/issues/594#issuecomment-6253441029. The planner's seven Calls made stand.
**Open decisions**: none.

## Specs

- `handbook/specs/explorer-doctrine.md`: the bullet "The zoom control is seated as a SIBLING of the stage" and the bullet "Any interactive control placed inside the zoom-bound gesture box stops propagation of the gesture events on its container" (its live instance is `makeDogEar` in `src/site/explorer/chart-drawer.ts`). Neither is edited; the deletion makes the code agree with both.
- `handbook/specs/development-workflow.md` step 8 (the archived plan, the failing test first) and step 10 (name every check that ran).
- `handbook/specs/conventions.md`, "How code is cited": no comment is written.
- `handbook/specs/settle-doctrine.md` and `vellum-footguns` Gate 2 bind the probe in the appendix, which is run, not committed.

## The design

`glassPresses` in `src/site/explorer/glass.ts` stops `mousedown`, `dblclick`, `wheel` and `touchstart` at `#zoom-controls`, on the stated ground that the cluster sits inside `#map-viewport`, the box the camera's gesture listeners are bound to. It does not: the cluster is a child of `<main>`, outside the stage, and `stopPropagation` at the cluster can only affect a listener for those four types, bubble phase, on an ANCESTOR of the cluster (a capture listener above it has already run, and the cluster's own descendants are reached first).

Measured 2026-10-18 at `ed41e29b`, by the probe in the appendix on two builds of this tree (`npm run build`, then `node 594-probe.ts <tree>`):

| build | ancestors of `#zoom-controls` (MAIN, BODY, HTML, document, window): listeners of the four types | the cluster's own | `#map-viewport` (the census's control) | Z10b's own gesture (synthetic `dblclick`, and `wheel`, on `#zoom-in`) as seated | the same after the cluster is moved inside `#map-viewport` |
|---|---|---|---|---|---|
| as on main (loop present) | none, on all five | the loop's four, bubble | `mousedown`, `dblclick` (capture and bubble), `wheel` | k stays 1, both | k stays 1, both, over a 2 s poll (the loop catches it) |
| loop deleted | none, on all five | none | the same | k stays 1, both | read as Z10b reads it, 350 ms after: `{"x":0,"y":0,"k":2}` after the `dblclick`, k 1.52 after the `wheel`, so Z10b's assertion fails on both |

`grep -o stopPropagation dist/explorer/app.bundle.js | wc -l` read 1 with the loop and 0 with it deleted, so the deletion reached the bundle the probe drove. `contains` read `false` on both builds.

So the loop stops nothing where the Glass sits: no check, Z10b included, can tell it is there. The one case it would ever act on is a Glass re-seated inside the gesture box. There, kept, it prevents the lurch outright (for `wheel` and `mousedown` too, which Z10b never replays); deleted, Z10b (`z10bNoDblclickLeak` in `e2e/suites/zoom/controls.ts`, unchanged) goes red on that re-seat, measured in Z10b's own form. Deleting the loop therefore makes Z10b an outcome guard of the seat, beside BR9 (`br9Authored` in `e2e/suites/broadside/room.ts`), which reads the seat itself.

The deletion is: the loop and its false comment, and `buttons.cluster`, the dependency whose only reader is the loop (`grep -rn cluster src/site/explorer/` shows the type at `glass.ts` 28, the loop at 163 and the call site at `app.ts` 275, nothing else). `$` in `src/site/explorer/elements.ts` is a cast over `getElementById` and throws nothing, so dropping `cluster: $("zoom-controls")` from the call site removes no boot-time presence check.

One consequence is UNVERIFIABLE from here: the deletion also removes the only `touchstart` listener on or above the Glass's buttons, and Safari on iPhone has been documented to show a button's pressed look (the `button:active` dip in `src/styles/shared/motion.css`) only when some touch listener sits on it or above it. If that still holds, the Glass's buttons on an iPhone would stop showing the dip and behave like every other button outside the chart, none of which has a touch listener above it (the census: none on MAIN, BODY, HTML, document or window), and like the Glass in every other room: the same `src/layouts/Glass.astro` is seated by the other chart rooms and bound by `bindGlassKeys` in `src/site/shared/glass-keys.ts`, which listens for `click` and `keydown` only, with no stop loop (read from source, no census run on those pages). No desktop browser reproduces it, so it is a phone check, like Issue #778's (offered to Alex before the ruling; he ruled without reporting a result): after the merge, on the live Explorer, by pressing a zoom button and then the Draw button (`<button id="draw" class="primary">` in `src/pages/explorer/index.astro`, which wears the same `button:active` rule, no override found by `grep -rn '#draw\b\|\.primary' src/styles`, and has no touch listener on or above it). If Draw dips too, the quirk does not hold; if only the zoom button dipped before the merge and neither does after, the deletion made it behave like Draw.

**Rejected:**
- Keep the loop with a corrected comment: ruled against by Alex (Rulings, above). It would have left no regression unguarded (kept, a re-seat simply does not lurch), but it is code no check can see today, defended by a comment, and Z10b stays green whether it is there or not.
- Keep `buttons.cluster` while deleting the loop: a field with no reader (`vellum-footguns` Gate 5 item 1).
- Strengthen Z10b to also replay `wheel`, `mousedown` and `touchstart`: the probe shows none reaches the camera as seated, and widening the e2e check is not what the issue asks.
- A new unit or e2e test: the deletion changes no behaviour (measured above), so no failing test exists to write; the existing Z10b is the record, and the type checker supplies this change's red (below).

## Files

1. `src/site/explorer/glass.ts` (216 lines, 212 after):
   - `interface GlassDeps`, the `buttons` member becomes `buttons: { touch: HTMLElement; zoomIn: HTMLElement; zoomOut: HTMLElement; reset: HTMLElement };` (drop `cluster: HTMLElement`).
   - `function glassPresses(buttons: GlassDeps["buttons"], zoomController: ZoomController, goHomeVoiced: () => void): void`, signature unchanged: delete the comment line beginning `// The cluster sits INSIDE the element d3-zoom binds` and the three-line `for (const type of ["mousedown", "dblclick", "wheel", "touchstart"]) { ... }` loop below it. The three `addEventListener("click", ...)` lines above and the `bindChartTouch(...)` line below stay exactly as they are.
2. `src/site/explorer/app.ts` (516 lines, 515 after): in the `createGlass({...})` call's `buttons` object, delete the line `cluster: $("zoom-controls"),`. Nothing else.
3. `handbook/plans/594/594-plan.md`: new, this plan copied unchanged.

No other file. `e2e/suites/zoom/controls.ts`, `e2e/suites/chart-drawer/desk.ts`, `handbook/specs/explorer-doctrine.md` and `handbook/plans/673/673-pr5-plan.md` are named under Calls made as deliberately untouched.

## Tests, in the order they are written

No test is written. The red step this change does have comes from the type checker, and it is the proof that `cluster` had exactly the readers named above:

1. Make the `GlassDeps` type edit ALONE, then run `npm run check`. Measured 2026-10-18: it reds with `src/site/explorer/app.ts(275,5): error TS2353` (`'cluster' does not exist in type`) and `src/site/explorer/glass.ts(163,13): error TS2339` (`Property 'cluster' does not exist`), plus a TS7006 on the loop's `e`. Any other site in that red is a stop condition.
2. Delete the loop and the `app.ts` line; `npm run check` is green.

The guard on the outcome is Z10b, unchanged. `vellum-guard-prover` is NOT owed: no guard is new or strengthened (workflow step 11). Z10b's bite on the one regression it now carries alone (a Glass re-seated inside the box) is the probe's re-seat column, measured by this plan and re-run by the implementer; the PR body names it as measured by the planner's probe and re-run by the implementing session. `vellum-plate-reader` is NOT owed: nothing a desktop browser renders changes (the census and the as-seated column).

## Order of commits

One commit: `handbook/plans/594/594-plan.md` with the `glass.ts` and `app.ts` edits. Subject: `#594 The Glass stops no gesture: it sits outside the gesture box, and the loop and its dependency go`. The workflow's first-failing-test commit has nothing to hold here, for the reason under Tests; say so in the PR body.

## Rosters and doctrine

- No roster is joined. `src/site/explorer/glass.ts` stays in `SPLIT_FILES` in `scripts/lint/split-arguments.ts` (the lint is green over the planted change, measured).
- `eslint-suppressions.json` holds `src/site/explorer/app.ts` at `max-lines` 1 and `max-lines-per-function` 1; `npm run lint` over the planted change exits 0 with no suppression to prune (measured), so the file is not touched.
- No spec, gate or agent line is contradicted. The doctrine already seats the Glass as a sibling of the stage and confines the stop rule to controls inside the box.

## Evidence (the implementer runs each, in this order, and names each in the PR body)

1. `npm run check`, `npm run lint`, `npm run format:check`: exit 0.
2. `npm test -- test/site/chart-drawer.test.ts test/site/app-bundles.test.ts test/repo/split-arguments.test.ts` (the unit files that read or bundle `app.ts` or name `glass.ts`), then `npm run astro:generate`. CI runs the full unit suite.
3. `npm run build`, then `grep -o stopPropagation dist/explorer/app.bundle.js | wc -l`: prints 0 (1 at `ed41e29b`).
4. The probe in the appendix, written to the scratchpad as `594-probe.ts` and run as `node <scratchpad>/594-probe.ts <absolute path of the implementer's tree>`: every ancestor list `[]`, `own` `[]`, the `#map-viewport` control listing the camera's listeners, both AS SEATED lines `"k":1` with x and y 0, both RESEATED lines ending `Z10b's assertion FAILS`.
5. `VELLUM_E2E_SUITES=zoom,zoom-gestures VELLUM_E2E_PORT=8795 VELLUM_E2E_DPORT=9252 npm run test:e2e`: both suites green, `Z10b` PASS, and `zg5bGlassPress` in `e2e/suites/zoom-gestures/touch.ts` (the one check that sends a real tap through the Glass, the path the stopped `touchstart` sat on) PASS. No other suite is run locally: BR9 reads the page with scripts off, which no edit here can reach; CI runs every suite.

## Calls made (the implementer copies these into its step 12 comment)

1. `buttons.cluster` goes with the loop, type and call site: a field with no reader is dead code (`vellum-footguns` Gate 5 item 1).
2. No new test; Z10b stays as written and becomes the record, because the deletion changes no behaviour (measured) and Z10b reds on the re-seat once the loop is gone (measured).
3. CD2c's message in `e2e/suites/chart-drawer/desk.ts` ("the same rule Z10b pins for the zoom cluster") stays: it names the outcome, a double click that does not become the double-click zoom, which Z10b still pins for the cluster, and claims no mechanism or containment.
4. `handbook/specs/explorer-doctrine.md` is not edited: both bullets it carries on this already say what the code will do.
5. `src/site/explorer/app.ts` stays over 400 lines and unsplit: this change shrinks it by one line, it already carries a `max-lines` suppression, and Issue #814 owns emptying those suppressions.
6. `handbook/plans/673/673-pr5-plan.md`, which names Z10b, is a frozen archive and is not touched.
7. The planner's probe is run, not committed: it is an instrument for this plan's premise, and its source is archived in this plan's appendix.

## Stop conditions (hand back, do not adapt)

1. `git diff --stat ed41e29b origin/main -- src/site/explorer/glass.ts src/site/explorer/app.ts e2e/suites/zoom/controls.ts` prints anything.
2. The loop, its comment or `cluster` is not where Files says, or the type-only `npm run check` reds at any site other than the three named.
3. The probe reports `"inViewport": true`, any of the four types on any ancestor, or a RESEATED line ending `Z10b's assertion PASSES` on the deletion build. Any of these means the premise (the Glass sits outside the box and nothing above it listens) is false, and the loop may not be dead. Issue #827 runs beside this one and may move the Glass's seat in `src/pages/explorer/index.astro` or `src/layouts/Glass.astro`; if it has merged first, this is where that shows.
4. Z10b is red, or any other zoom-suite check is red, after the deletion.
5. `npm run lint` asks for a suppression to be pruned or added, or step 3's grep prints anything but 0.
6. `gh api repos/ahl-gram/Vellum/issues/594/comments --jq length` prints more than 2, and a comment past the second is neither the dispatcher's plan archive (by `ahl-gram`, first line beginning `Plan archive, not a ruling:`) nor the implementer's own step 12 post.

## The ruling

Alex ruled option 1, "Remove the unused code", on 2026-10-18 (https://github.com/ahl-gram/Vellum/issues/594#issuecomment-6253441029): this plan as written. Option 2, keeping the loop with a corrected comment, was ruled against.

## Appendix: the probe (scratchpad, never committed)

```ts
// Issue #594 probe: on a build with the Glass stop loop deleted, census every bubble listener above #zoom-controls for the four types the loop stopped, replay Z10b, then re-seat the cluster inside the gesture box as the control arm.
// Usage: node 594-probe.ts <absolute path of a tree whose dist/ is built>
const TREE = process.argv[2];
if (!TREE) throw new Error("pass the tree's absolute path");
const { start, cleanup } = await import(`${TREE}/e2e/harness.ts`);
const { findBrowser } = await import(`${TREE}/src/cli/raster.ts`);
const PORT = 8794;
const DPORT = 9251;
const browser = findBrowser();
if (!browser) throw new Error("no browser");

const ctx = await start({
  browser,
  SITE: `${TREE}/dist`,
  OUT: `${TREE}/out/594-probe`,
  PORT,
  DPORT,
  PAGE: `http://127.0.0.1:${PORT}/explorer/`,
  results: [],
  consoleErrors: [],
  http4xx: [],
  skippedGroups: [],
  skippedChecks: [],
});

type R = { result: { value: unknown } };
const cli = async (expression: string): Promise<unknown> =>
  (await ctx.send<R>("Runtime.evaluate", { expression, includeCommandLineAPI: true, returnByValue: true, awaitPromise: true })).result.value;

try {
  const ready = await ctx.waitReady();
  console.log("ready", ready);
  const census = await cli(`(() => {
    const TYPES = ["mousedown", "dblclick", "wheel", "touchstart"];
    const name = (n) => n === window ? "window" : n === document ? "document" : n.tagName + (n.id ? "#" + n.id : "") + (n.className && typeof n.className === "string" ? "." + n.className.split(" ").join(".") : "");
    const read = (n) => { const all = getEventListeners(n); const out = []; for (const t of TYPES) for (const l of all[t] || []) out.push(t + (l.useCapture ? "(capture)" : "(bubble)")); return out; };
    const cluster = document.getElementById("zoom-controls");
    const chain = [];
    for (let n = cluster.parentElement; n; n = n.parentElement) chain.push(n);
    chain.push(document, window);
    const ancestors = chain.map((n) => [name(n), read(n)]);
    const own = [name(cluster), read(cluster)];
    const kids = [...cluster.querySelectorAll("*")].map((n) => [name(n), read(n)]).filter(([, l]) => l.length);
    const vp = document.getElementById("map-viewport");
    return { inViewport: vp.contains(cluster), ancestors, own, kids, viewportControl: [name(vp), read(vp)] };
  })()`);
  console.log(JSON.stringify(census, null, 1));

  const fire = (type: string) =>
    type === "wheel"
      ? `document.getElementById("zoom-in").dispatchEvent(new WheelEvent("wheel",{bubbles:true,cancelable:true,view:window,deltaY:-300}))`
      : `document.getElementById("zoom-in").dispatchEvent(new MouseEvent("${type}",{bubbles:true,cancelable:true,view:window}))`;

  for (const type of ["dblclick", "wheel"]) {
    await cli(`window.__vellumZoomTo({k:1,x:0,y:0})`);
    await cli(fire(type));
    await ctx.sleep(350);
    const seated = await cli(`window.__vellumZoomState()`);
    console.log(`AS SEATED ${type} on #zoom-in ->`, JSON.stringify(seated));
  }

  await cli(`document.getElementById("map-viewport").appendChild(document.getElementById("zoom-controls")), document.getElementById("map-viewport").contains(document.getElementById("zoom-controls"))`);
  for (const type of ["dblclick", "wheel"]) {
    await cli(`window.__vellumZoomTo({k:1,x:0,y:0})`);
    await cli(fire(type));
    await ctx.sleep(350);
    const s = (await cli(`window.__vellumZoomState()`)) as { k: number; x: number; y: number };
    console.log(`RESEATED INSIDE #map-viewport ${type} on #zoom-in, read as Z10b reads it ->`, JSON.stringify(s), s.k === 1 && s.x === 0 && s.y === 0 ? "Z10b's assertion PASSES" : "Z10b's assertion FAILS");
  }
  console.log("console errors", JSON.stringify(ctx.consoleErrors));
} finally {
  cleanup();
}
```

Every read waits a fixed 350 ms after its event because that is Z10b's own form, replayed verbatim; the 2 s poll the control build was first read with is gone, and its re-seat read k 1 throughout it.
