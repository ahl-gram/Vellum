// The Running Head checks (RH0-RH7, #295): the shell's masthead asserted by its
// RESOLVED computed styles in a real browser, not by the presence of a rule in
// the stylesheet source.
//
// Why this suite exists. `test/site/astro-scaffold.test.ts` reads the emitted CSS
// as TEXT and asserts the head's declarations are present. That catches a deleted
// rule. It cannot catch a rule that is present and LOSES. #288 produced exactly
// that: the shell's sizing moved from `h1` to `.wordmark`, and home's grander
// wordmark was still pinned as `header h1` (specificity 0,0,2), which a class
// (0,1,0) beats, so home would silently have dropped from 2.7rem to the room-page
// 1.75rem. Every unit test stayed green and all 243 e2e checks passed. Only
// reasoning about specificity by hand caught it. RH2 is that guard.
//
// Every constant below was MEASURED, not derived: they come from a probe run
// against the built dist/ (out/probe-runninghead.mjs, gitignored), so a wrong
// stylesheet cannot also supply the expected value.
//
// Explicitly not here: committed screenshot goldens. PNGs are outside the
// determinism covenant and are never byte-compared, and CI rasterizes with
// Chrome on Ubuntu while local runs use Brave on macOS, so a locally shot golden
// would red on CI immediately. Every suite on this harness shoots and none
// compares the result: screenshots here are artifacts for a human to look at,
// and computed styles are what gets asserted. This suite keeps that line.
//
// Self-contained like the hunt, Print Room and home suites: runs after the health
// checkpoint, navigates to its own pages, and carries its own scoped no-4xx +
// console-error delta.

// The seven shelled pages, LITERAL on purpose. Deriving this from `NAV_ITEMS` in
// `src/layouts/nav.ts` would be wrong twice over: home is deliberately not a nav
// item, and a page dropping out of the nav must not silently drop out of this
// guard. `/atlas/` stays out, it is generated and carries no shell.
const SHELLED = ["/", "/explorer/", "/print-room/", "/gallery/", "/faq/", "/glossary/", "/seed-of-the-day/"];
const PROSE = "/faq/";   // body line-height 1.6 (25.6px)
const APP = "/explorer/"; // body line-height normal: the variance the head pins against

// Read the head as the browser resolved it. `size` and `ratio` are numbers so the
// assertions can carry a tolerance; `ratio` is line-height over font-size, which
// is the promise the head actually makes (1.6) and is font-size agnostic, so the
// tagline, which sets no size of its own, is covered by the same predicate.
const HEAD_READ = `(() => {
  const read = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName, weight: cs.fontWeight, size: parseFloat(cs.fontSize),
      family: cs.fontFamily, tracking: cs.letterSpacing,
      ratio: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize),
    };
  };
  return JSON.stringify({
    wordmark: read(".wordmark"), roomName: read(".room-name"),
    tagline: read(".tagline"), topnav: read(".topnav"),
    h1s: [...document.querySelectorAll("h1")].map((h) => ({ classes: [...h.classList], inHeader: !!h.closest("header") })),
    bodyLineHeight: getComputedStyle(document.body).lineHeight,
  });
})()`;

// A missing element must FAIL, never pass vacuously: home has three head members,
// not four (it is roomless), so a predicate that shrugs at null would report the
// room-name checks green on the one page that has no room name.
const DISPLAY_FACE = /^"IM Fell English SC"/;
const isDisplay = (m) => !!m && DISPLAY_FACE.test(m.family);
const sized = (m, want) => !!m && Math.abs(m.size - want) < 0.01;
const weighs = (m, want) => !!m && m.weight === want;
const tagged = (m, want) => !!m && m.tag === want;
const leaded = (m) => !!m && Math.abs(m.ratio - 1.6) < 0.005;
// Tracking compared as a NUMBER, never as the string the browser formatted: the
// value is a product (0.3em of 43.2px), and pinning its decimal rendering would
// make this suite hostage to one engine's float formatting across two platforms.
const tracked = (m, want) => !!m && Math.abs(parseFloat(m.tracking) - want) < 0.01;

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, consoleErrors, http4xx, PORT } = ctx;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  const visit = async (route) => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${route}` });
    for (let i = 0; i < 200; i++) {
      let ok = null;
      try { ok = await evaluate(`document.readyState === "complete" && !!document.querySelector(".wordmark")`); } catch {}
      if (ok) return true;
      await sleep(75);
    }
    return false;
  };

  // One sweep of all seven pages; every later check reads from this map.
  const heads = {};
  const unreachable = [];
  for (const route of SHELLED) {
    if (!(await visit(route))) { unreachable.push(route); continue; }
    heads[route] = JSON.parse(await evaluate(HEAD_READ));
    if (route === "/") await shoot("running-head-home.png");
    if (route === PROSE) await shoot("running-head-room.png");
  }

  const bad = (pred) => SHELLED.filter((r) => !heads[r] || !pred(heads[r], r));

  // RH0: exactly one h1 per DELIVERED page, and it sits in the running head.
  // Delivered is the operative word: after a bind the Print Room's live DOM
  // holds two h1s (the room name plus the injected atlas title), which is known
  // and accepted, so this asserts the page as served.
  const manyH1 = bad((h) => h.h1s.length === 1 && h.h1s[0].inHeader);
  check(
    "RH0 every shelled page delivers exactly one h1, inside the running head",
    unreachable.length === 0 && manyH1.length === 0,
    unreachable.length
      ? `unreachable: ${unreachable.join(", ")}`
      : manyH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || "7/7 pages, one h1 each",
  );

  // RH1: the #288 tag swap, on every page rather than a sample. Home is roomless
  // so its h1 is the wordmark; every room page's h1 is the room name.
  const wrongH1 = bad((h, r) => h.h1s.length === 1 && h.h1s[0].classes.includes(r === "/" ? "wordmark" : "room-name"));
  check(
    "RH1 the h1 names the page: the wordmark on home, the room name on the six rooms",
    wrongH1.length === 0,
    wrongH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || "home=wordmark, 6 rooms=room-name",
  );

  // RH2: THE specificity guard, the regression this issue exists for. Home's
  // grander wordmark is `header .wordmark` in `public/index.css`; reverting it to
  // `header h1` leaves the declaration present and passing the source-text test
  // while the wordmark silently drops to the room-page 28px. Home also carries no
  // room name at all, which is what makes its h1 the wordmark.
  const home = heads["/"];
  check(
    "RH2 home's wordmark resolves grander (h1, 700, 43.2px, display face, tracked out) and home has no room name",
    tagged(home?.wordmark, "H1") && weighs(home?.wordmark, "700") && sized(home?.wordmark, 43.2) &&
      isDisplay(home?.wordmark) && tracked(home?.wordmark, 12.96) && home?.roomName === null,
    home ? `${home.wordmark?.tag} ${home.wordmark?.weight} ${home.wordmark?.size}px ${home.wordmark?.tracking}, roomName=${JSON.stringify(home.roomName)}` : "home unreachable",
  );

  // RH3: a prose room page resolves the swapped tags AND both UA-default
  // overrides at once. h1 defaults bold and p defaults normal, so unpinned the
  // #288 swap would have lightened the wordmark and emboldened the room name,
  // arriving as synthetic bold because the display face has no bold cut.
  const prose = heads[PROSE];
  check(
    `RH3 ${PROSE} swaps the tags and pins both weights (wordmark p/700/28px, room name h1/400/16px, both display face)`,
    tagged(prose?.wordmark, "P") && weighs(prose?.wordmark, "700") && sized(prose?.wordmark, 28) && isDisplay(prose?.wordmark) &&
      tagged(prose?.roomName, "H1") && weighs(prose?.roomName, "400") && sized(prose?.roomName, 16) && isDisplay(prose?.roomName),
    prose ? JSON.stringify({ wordmark: prose.wordmark, roomName: prose.roomName }) : `${PROSE} unreachable`,
  );

  // RH4: the same head on an app surface, whose own stylesheet is the heaviest on
  // the site. The two pages' bodies must DIFFER in line-height for this to mean
  // anything (prose sets 1.6, the app surfaces leave it normal): that difference
  // is asserted here so the check cannot pass by comparing two identical pages.
  const app = heads[APP];
  const sameHead = (a, b, key) =>
    !!a?.[key] && !!b?.[key] && a[key].tag === b[key].tag && a[key].weight === b[key].weight &&
    Math.abs(a[key].size - b[key].size) < 0.01 && a[key].family === b[key].family;
  check(
    `RH4 ${APP} resolves the identical head although its body leading differs from ${PROSE}`,
    sameHead(app, prose, "wordmark") && sameHead(app, prose, "roomName") && sameHead(app, prose, "topnav") &&
      !!app && !!prose && app.bodyLineHeight !== prose.bodyLineHeight,
    app && prose ? `body leading ${APP}=${app.bodyLineHeight} vs ${PROSE}=${prose.bodyLineHeight}` : "a page was unreachable",
  );

  // RH5: the head's real promise. Page css sets body line-height per page, and
  // the head must not inherit that variance, so all four members pin 1.6. Asserted
  // as a RATIO, which is font-size agnostic and therefore also covers the tagline,
  // the one member that sets no size of its own.
  const members = ["wordmark", "roomName", "tagline", "topnav"];
  const unleaded = [PROSE, APP].flatMap((r) => members.filter((m) => !leaded(heads[r]?.[m])).map((m) => `${r} ${m}`));
  check(
    "RH5 every head member resolves line-height 1.6 on a prose page and on an app surface",
    unleaded.length === 0,
    unleaded.join(", ") || "8/8 members at 1.6",
  );

  // RH6: the highest-value one. The bound atlas's title header is .print-only, so
  // it is display:none on screen and NO screenshot can ever reach it; it rode the
  // shell's global h1 family binding until #288 pinned it explicitly, and losing
  // that face would surface only in a printed or downloaded atlas. Computed style
  // resolves through display:none, which is exactly why this is assertable.
  // Injecting the markup `renderBoundAtlas` in `src/site/print-room/bound-atlas.ts`
  // writes is enough: what is under test is the cascade, not the bind, and a real
  // bind is slow.
  let atlas = null;
  if (await visit("/print-room/")) {
    atlas = JSON.parse(await evaluate(`(() => {
      const d = document.getElementById("pr-atlas");
      if (!d) return JSON.stringify(null);
      d.innerHTML = '<header class="atlas-head print-only">' +
        '<h1>The Isle of Rahai</h1><p class="subtitle">An atlas</p><p class="chartno">VELLUM \\u00b7 CHART \\u2116 42</p></header>';
      const h1 = d.querySelector(".atlas-head h1");
      const cs = getComputedStyle(h1);
      return JSON.stringify({ family: cs.fontFamily, size: parseFloat(cs.fontSize),
        hidden: getComputedStyle(h1.parentElement).display === "none" });
    })()`));
  }
  check(
    "RH6 the Print Room's injected bound-atlas title resolves to the display face (unreachable by any screenshot)",
    !!atlas && DISPLAY_FACE.test(atlas.family) && Math.abs(atlas.size - 35.2) < 0.01 && atlas.hidden,
    JSON.stringify(atlas),
  );
  // Leave no mutated DOM behind for whatever suite is appended after this one.
  await visit("/print-room/");

  // RH7: eight page loads added no console errors and no new 4xx. One stock
  // Chromium message is excused for the same reason `run` in
  // `scripts/e2e/suite-home.mjs` excuses it: motion.css opts the site into
  // cross-document view transitions, and a navigation landing while a prior one
  // is still settling surfaces this abort. It is the folio ceremony's expected
  // cancellation, not an app error, and this suite chains navigations fast.
  const errDelta = consoleErrors.slice(errBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RH7 the running-head sweep is clean (no console errors, no new 4xx)",
    errDelta.length === 0 && httpDelta.length === 0,
    [...errDelta, ...httpDelta].join(" | ") || "clean",
  );
}
