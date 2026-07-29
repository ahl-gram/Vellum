// The Running Head checks (RH0-RH8, #295): the shell's masthead asserted by its
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
// reasoning about specificity by hand caught it. RH3 is that guard by name.
//
// The trap generalizes two ways, and both are guarded here rather than sampled:
//   - ACROSS MEMBERS. The display face is bound ONCE for four members at a time
//     (`.wordmark, .room-name, .topnav, footer` in `src/layouts/BaseLayout.astro`),
//     so a rule that unbinds one of them leaves the other three green. Asserting
//     one member relative to a sibling page cannot see it either, because the
//     regression lands on both pages. Every value here is pinned against a
//     measured constant, never against another page.
//   - ACROSS PAGES. Each shelled page loads its own stylesheet, and any of
//     them can outrank a shell rule the way `public/index.css` deliberately does
//     twice. Sampling two pages would leave the other five able to carry the same
//     defect silently, so RH2 sweeps the whole head on every page.
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
// Self-contained like the hunt, Print Room and home suites: navigates to its own
// pages, carries its own scoped no-4xx + console-error delta, and restores the
// settled Explorer base it found before handing back.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// The eight shelled pages, LITERAL on purpose. Deriving this from `NAV_ITEMS` in
// `src/layouts/nav.ts` would be wrong twice over: home is deliberately not a nav
// item, and a page dropping out of the nav must not silently drop out of this
// guard. `/atlas/` stays out, it is generated and carries no shell.
const SHELLED = ["/", "/explorer/", "/print-room/", "/reading-room/", "/gallery/", "/faq/", "/glossary/", "/seed-of-the-day/"];

// The two sample pages for the checks that need a contrast rather than a pin.
// They are NOT interchangeable with their siblings: body line-height is set per
// page css, and MEASUREMENT (not the prose/app split it is tempting to assume)
// says the pages divide as
//   line-height 1.6:     /faq/  /glossary/  /print-room/  /reading-room/  /seed-of-the-day/
//   line-height normal:  /  /explorer/  /gallery/
// so /print-room/, /reading-room/ and /seed-of-the-day/ are app surfaces that DO set 1.6.
// RH6 needs its two pages to differ in body leading or it proves nothing, which
// is why APP is /explorer/ specifically. Swapping in another app surface would
// silently gut that check.
const PROSE = "/faq/";
const APP = "/explorer/";

// The two type roles the head draws on, as the browser reports them. The regexes
// are deliberately anchored and disjoint: the flourish face is a prefix of the
// display face's name, so an unanchored test for one would match the other.
const DISPLAY_FACE = /^"IM Fell English SC",/;
const FLOURISH_FACE = /^"IM Fell English",/;

// The measured head. Every number was read out of a browser against the built
// dist/ before it was written here. `tracking: null` means the browser reported
// "normal", which is a distinct state from any numeric value and is asserted as
// such rather than skipped.
const ROOM_HEAD = {
  wordmark: { tag: "P", weight: "700", size: 28, tracking: 8.4, face: DISPLAY_FACE },
  roomName: { tag: "H1", weight: "400", size: 16, tracking: 1.12, face: DISPLAY_FACE },
  tagline: { tag: "P", weight: "400", size: 16, tracking: null, face: FLOURISH_FACE },
  topnav: { tag: "NAV", weight: "400", size: 13.12, tracking: 1.5744, face: DISPLAY_FACE },
  footer: { tag: "FOOTER", weight: "400", size: 11.52, tracking: 2.5344, face: DISPLAY_FACE },
};
// Home's head is the room head with the two deviations `public/index.css` pins on
// purpose, plus no room name at all (the atelier is not a room, so there is
// nothing else its h1 could be). Both deviations sit at a HIGHER specificity than
// the shell rule they beat, which is the whole hazard: see RH3 and RH4.
const HOME_HEAD = {
  ...ROOM_HEAD,
  wordmark: { tag: "H1", weight: "700", size: 43.2, tracking: 12.96, face: DISPLAY_FACE },
  roomName: null,
  footer: { tag: "FOOTER", weight: "400", size: 12, tracking: 3, face: DISPLAY_FACE },
};
const expectedHead = (route) => (route === "/" ? HOME_HEAD : ROOM_HEAD);
const MEMBERS = ["wordmark", "roomName", "tagline", "topnav", "footer"];
// The head members proper, the four that pin their own leading. The footer is a
// shell member but not a head member and does NOT pin 1.6, so it is deliberately
// absent from the leading guard.
const HEAD_MEMBERS = ["wordmark", "roomName", "tagline", "topnav"];

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
    tagline: read(".tagline"), topnav: read(".topnav"), footer: read("footer"),
    h1s: [...document.querySelectorAll("h1")].map((h) => ({ classes: [...h.classList], inHeader: !!h.closest("header") })),
    bodyLineHeight: getComputedStyle(document.body).lineHeight,
  });
})()`;

// A missing element must FAIL, never pass vacuously: home has four of the five
// members, not five, so a predicate that shrugged at null would report the
// room-name checks green on the one page that has no room name. `matches` treats
// an expected null and a present element as mutually disqualifying in both
// directions, so neither a missing member nor an unexpected one slips through.
const near = (got, want) => Math.abs(got - want) < 0.01;
const matches = (m, want) => {
  if (want === null) return m === null;
  if (!m) return false;
  return m.tag === want.tag && m.weight === want.weight && near(m.size, want.size) &&
    want.face.test(m.family) &&
    (want.tracking === null ? m.tracking === "normal" : near(parseFloat(m.tracking), want.tracking));
};
const leaded = (m) => !!m && Math.abs(m.ratio - 1.6) < 0.005;

// The bound atlas's title is asserted against markup this suite injects, so the
// producer and the twin can drift apart without either side noticing. Reading the
// producer's own template and pinning the two structural tokens the injection
// depends on couples them: rename the class or demote the heading in
// `renderBoundAtlas` and this reds instead of going quietly green.
const REPO = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const boundAtlasEmitsAtlasHead = () => {
  const src = readFileSync(resolve(REPO, "src/site/print-room/bound-atlas.ts"), "utf8");
  const header = src.match(/<header class="atlas-head[^]*?<\/header>/);
  return !!header && /<h1>/.test(header[0]);
};

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitReady, consoleErrors, http4xx, PORT } = ctx;
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

  // One sweep of all the shelled pages; every check below reads from this map rather
  // than navigating again.
  const heads = {};
  const unreachable = [];
  for (const route of SHELLED) {
    if (!(await visit(route))) { unreachable.push(route); continue; }
    heads[route] = JSON.parse(await evaluate(HEAD_READ));
    if (route === "/") await shoot("running-head-home.png");
    if (route === PROSE) await shoot("running-head-room.png");
  }

  // An unreachable page fails every sweep check: `heads[r]` is undefined, so the
  // predicate is never consulted and the route lands in the offender list.
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
      : manyH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || `${SHELLED.length}/${SHELLED.length} pages, one h1 each`,
  );

  // RH1: the #288 tag swap, on every page rather than a sample. Home is roomless
  // so its h1 is the wordmark; every room page's h1 is the room name.
  const wrongH1 = bad((h, r) => h.h1s.length === 1 && h.h1s[0].classes.includes(r === "/" ? "wordmark" : "room-name"));
  check(
    "RH1 the h1 names the page: the wordmark on home, the room name on every room page",
    wrongH1.length === 0,
    wrongH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || `home=wordmark, ${SHELLED.length - 1} rooms=room-name`,
  );

  // RH2: the whole head, every member, every page, against the measured table.
  // This is the comprehensive guard, and it is a sweep rather than a sample
  // because the hazard is a PAGE stylesheet outranking a shell rule: pinning two
  // pages would leave the other five free to carry the same defect. It covers the
  // two UA-default weight overrides at once, which are load-bearing: h1 defaults
  // bold and p defaults normal, so unpinned the #288 tag swap would have lightened
  // the wordmark and emboldened the room name, arriving as SYNTHETIC bold because
  // the display face has no bold cut.
  const offenders = [];
  for (const route of SHELLED) {
    const h = heads[route];
    if (!h) { offenders.push(`${route}: unreachable`); continue; }
    for (const m of MEMBERS) {
      const want = expectedHead(route)[m];
      if (!matches(h[m], want)) offenders.push(`${route} ${m}: ${JSON.stringify(h[m])}`);
    }
  }
  check(
    "RH2 every head member resolves its measured tag, weight, size, tracking and face, on every shelled page",
    offenders.length === 0,
    offenders.join(" | ") || `${SHELLED.length * MEMBERS.length - 1} members pinned across ${SHELLED.length} pages`,
  );

  // RH3: THE specificity guard, the regression this issue exists for, stated as
  // the DIFFERENCE it protects. Home's grander wordmark is `header .wordmark` in
  // `public/index.css`; reverting it to `header h1` leaves the declaration present
  // and passing the source-text test while the wordmark silently collapses to the
  // room-page size. Asserted as home-against-a-room-page so the failure line reads
  // as the collapse rather than as a bare number.
  const home = heads["/"];
  const prose = heads[PROSE];
  check(
    "RH3 home's wordmark stays grander than a room page's (43.2px/0.3em against 28px/0.3em), and home has no room name",
    matches(home?.wordmark, HOME_HEAD.wordmark) && matches(prose?.wordmark, ROOM_HEAD.wordmark) &&
      home?.wordmark.size > prose?.wordmark.size && home?.roomName === null,
    home && prose
      ? `home=${home.wordmark?.tag}/${home.wordmark?.size}px/${home.wordmark?.tracking} ${PROSE}=${prose.wordmark?.tag}/${prose.wordmark?.size}px/${prose.wordmark?.tracking}, roomName=${JSON.stringify(home.roomName)}`
      : "a page was unreachable",
  );

  // RH4: home's OTHER page-level deviation, the grander footer. Same shape as the
  // wordmark and named in the same breath by the issue: `main footer` in
  // `public/index.css` is (0,0,2) and beats the shell's bare `footer` at (0,0,1),
  // so a selector edit on either side silently collapses the two into one size.
  check(
    "RH4 home's footer stays grander than a room page's (12px/0.25em against 11.52px/0.22em)",
    matches(home?.footer, HOME_HEAD.footer) && matches(prose?.footer, ROOM_HEAD.footer) &&
      home?.footer.size > prose?.footer.size,
    home && prose ? `home=${home.footer?.size}px/${home.footer?.tracking} ${PROSE}=${prose.footer?.size}px/${prose.footer?.tracking}` : "a page was unreachable",
  );

  // RH5: the head's real promise, on every page rather than two. Page css sets
  // body line-height per page, and the head must not inherit that variance, so all
  // four head members pin 1.6. Asserted as a RATIO, which is font-size agnostic
  // and therefore also covers the tagline, the one member that sets no size of its
  // own. Home is included deliberately: it is the page that carries a
  // page-specific head override, so it is the last page that should be sampled out.
  const unleaded = SHELLED.flatMap((r) =>
    HEAD_MEMBERS
      .filter((m) => (r === "/" && m === "roomName" ? false : !leaded(heads[r]?.[m])))
      .map((m) => `${r} ${m}`));
  check(
    "RH5 every head member resolves line-height 1.6 on every shelled page",
    unleaded.length === 0,
    unleaded.join(", ") || `${SHELLED.length * HEAD_MEMBERS.length - 1}/${SHELLED.length * HEAD_MEMBERS.length - 1} members at 1.6`,
  );

  // RH6: the premise RH2 and RH5 rest on. Their uniformity is only interesting
  // because the pages underneath genuinely differ, so pin that difference: the
  // prose page sets a body leading and the Explorer leaves it unset. If these two
  // ever converge, the sweeps above keep passing while quietly proving less, and
  // this check is what says so.
  const app = heads[APP];
  check(
    `RH6 the pages really do differ underneath: ${APP} leaves body leading unset where ${PROSE} sets it`,
    !!app && !!prose && app.bodyLineHeight === "normal" && app.bodyLineHeight !== prose.bodyLineHeight,
    app && prose ? `body leading ${APP}=${app.bodyLineHeight} vs ${PROSE}=${prose.bodyLineHeight}` : "a page was unreachable",
  );

  // RH7: the highest-value one. The bound atlas's title header is .print-only, so
  // it is display:none on screen and NO screenshot can ever reach it; it rode the
  // shell's global h1 family binding until #288 pinned it explicitly, and losing
  // that face would surface only in a printed or downloaded atlas. Computed style
  // resolves through display:none, which is exactly why this is assertable.
  // Injecting the markup `renderBoundAtlas` in `src/site/print-room/bound-atlas.ts`
  // writes is enough: what is under test is the cascade, not the bind, and a real
  // bind is slow. A probe confirmed the assertion discriminates: a bare h1 injected
  // into the same container resolves to the BODY face, so the display face here
  // comes from that rule and nothing else in the cascade. The twin is checked
  // against the producer's own template first, so the two cannot drift apart.
  const producerShape = boundAtlasEmitsAtlasHead();
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
    "RH7 the Print Room's bound-atlas title resolves to the display face (unreachable by any screenshot), and the producer still emits that markup",
    producerShape && !!atlas && DISPLAY_FACE.test(atlas.family) && near(atlas.size, 35.2) && atlas.hidden,
    `producer emits header.atlas-head > h1: ${producerShape}; injected twin: ${JSON.stringify(atlas)}`,
  );

  // Restore the settled Explorer base this suite was handed, the same contract the
  // zoom and ceremony suites keep. Two things make it necessary rather than
  // decorative: the sweep navigates the shared page away from the Explorer, and
  // the RH7 injection leaves a mutated #pr-atlas behind. Without this, ordering
  // this suite anywhere but last would break whatever follows.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  const restored = await waitReady();

  // RH8: ten page loads (the eight-page sweep, the Print Room again for RH7, and
  // the Explorer restore) added no console errors and no new 4xx. This suite is
  // also the only visitor to /gallery/, /glossary/ and /faq/, so it is their sole
  // health check. One stock Chromium message is excused for the same reason `run`
  // in `scripts/e2e/suite-home.mjs` excuses it: motion.css opts the site into
  // cross-document view transitions, and a navigation landing while a prior one is
  // still settling surfaces this abort. It is the folio ceremony's expected
  // cancellation, not an app error, and this suite chains navigations fast.
  const errDelta = consoleErrors.slice(errBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RH8 the running-head sweep is clean (no console errors, no new 4xx) and the Explorer base is restored",
    errDelta.length === 0 && httpDelta.length === 0 && restored,
    [...errDelta, ...httpDelta].join(" | ") || (restored ? "clean, Explorer restored" : "clean, but the Explorer did not settle"),
  );
}
