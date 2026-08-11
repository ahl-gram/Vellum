// Shared helpers for the Reading-Room-hosted suites (#320).
//
// suite-reading-room.mjs carries its own copies of boot() and settled() and is left
// untouched by this sub (its checks stay green exactly as written, the double-coverage
// premise). New room suites import these instead of copying them a third and fourth
// time.
//
// The room's settle is NOT the shared waitSettled: that keys on the Explorer's
// #verso-turn, which this page does not have. It is the engine's settle-signal
// contract read off the frame itself, the chart svg landed in the mount and .rf-status
// back to "" (an overlay writing there mid-draw hangs the redraw, the standing rule).

/** The chart svg, never the voyage overlay that shares the mount. */
export const CHART_SVG = ".rf-chart svg:not(.voyage-overlay)";

export const makeRoom = (ctx) => {
  const { evaluate, send, sleep, PORT } = ctx;

  const boot = async () => {
    for (let i = 0; i < 200; i++) {
      let ok = null;
      try { ok = await evaluate(`typeof window.__vellumReadingRoomUsesWorker === "function"`); } catch {}
      if (ok) return true;
      await sleep(75);
    }
    return false;
  };

  const settled = async () => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try { s = await evaluate(`({svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent})`); } catch {}
      if (s && s.svg && s.status === "") return true;
      await sleep(50);
    }
    return false;
  };

  // Every room check re-bootstraps through about:blank: a navigate differing only in
  // the hash is a same-document change and never re-runs the boot (the suite-zoom Z13
  // idiom the address and reading-room suites both follow), and the room reads its hash
  // once at boot with no hashchange listener.
  const goto = async (hash) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/${hash}` });
    const booted = await boot();
    return booted && (await settled());
  };

  return { boot, settled, goto };
};

// The room's bar helpers, against .rf-* selectors. Same #220 domain as the Explorer's
// ([0, 2*span] with the seam at the midpoint, so a year lands at barMax/2 + (year - min)).
// The earliest year is the ONE bar position the seam already owns, so setYear clamps to
// min+1 exactly as the S-suite's helper does.
export const makeBar = (ctx) => {
  const { evaluate } = ctx;
  return {
    setYear: (y) =>
      evaluate(`(()=>{const s=document.querySelector(".rf-range");const a=window.__vellumAgesState();const yy=Math.max(${y},a.min+1);s.value=String(Number(s.max)/2+(yy-a.min));s.dispatchEvent(new Event("input",{bubbles:true}));return window.__vellumAgesState().year;})()`),
    yearNow: () => evaluate(`window.__vellumAgesState().year`),
    groupVis: (idx) =>
      evaluate(`(()=>{const g=document.querySelector('.rf-chart #layer-settlements g.settlement[data-idx="${idx}"]');return g?(getComputedStyle(g).display==="none"?"hidden":"shown"):"(no-el)";})()`),
    roadsDisp: () =>
      evaluate(`(()=>{const r=document.querySelector('.rf-chart #layer-roads');return r?getComputedStyle(r).display:"(no-el)";})()`),
    visibleGroups: () =>
      evaluate(`[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length`),
    playLabel: () => evaluate(`document.querySelector(".rf-play").textContent`),
    clickPlay: () => evaluate(`document.querySelector(".rf-play").click()`),
  };
};

/**
 * The manifest facts a scrubber check needs, read from the page's OWN engine through the
 * shared oracle: the range, the present year, the earliest and a later LIVING founding
 * (so their glyph groups reveal cleanly), and the ruin's founding + fall year.
 */
export const scrubFacts = (evaluate, seed) =>
  evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:${seed},overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places,events=r.manifest.events,present=r.manifest.presentYear;
    const minFounded=Math.min(...places.map((p)=>p.founded));
    const living=places.filter((p)=>!p.ruined).slice().sort((a,b)=>a.founded-b.founded);
    const early=living[0];
    const later=living.find((p)=>p.founded>early.founded);
    const ruin=places.find((p)=>p.ruined);
    const ruinEv=ruin?events.find((e)=>e.settlement===ruin.idx&&e.kind==="ruin"):null;
    return{count:places.length,present,minFounded,
      earlyIdx:early.idx,earlyFounded:early.founded,
      lateIdx:later?later.idx:-1,lateFounded:later?later.founded:-1,
      lateNx:later?later.nx:-1,lateNy:later?later.ny:-1,
      ruinIdx:ruin?ruin.idx:-1,ruinYear:ruin?(ruinEv?ruinEv.year:present):null,
      ruinFounded:ruin?ruin.founded:null};
  })()`);

/**
 * A suite-scoped console-error + 4xx delta, the convention EVERY suite after the health
 * checkpoint (N1/N2) follows: hunt's H9, the Print Room's, home's, the address suite's
 * A10, the room's RR12/RR13. runHealth asserts the accumulated state of everything
 * BEFORE it, so a suite that runs after it and carries no delta of its own drives the
 * page with nothing watching for a thrown exception.
 *
 * Call at the top of a suite, then `await gate.check(label)` at the bottom.
 */
export const scopedHealth = (ctx) => {
  const { check, consoleErrors, http4xx } = ctx;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;
  return {
    check: (label) => {
      // motion.css opts the site into cross-document view transitions and these suites
      // chain navigations fast enough to skip some, so the stock AbortError is excused
      // exactly as suite-home and the address suite excuse it.
      const errDelta = consoleErrors
        .slice(errBase)
        .filter((e) => !e.includes("AbortError: Transition was skipped"));
      const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
      check(
        label,
        errDelta.length === 0 && httpDelta.length === 0,
        [...errDelta, ...httpDelta].join(" | ") || "clean",
      );
    },
  };
};
