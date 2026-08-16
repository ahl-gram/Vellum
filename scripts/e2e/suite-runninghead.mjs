// Running Head e2e (RH0-RH8, #295): the shell's masthead asserted by RESOLVED computed styles, because a rule that is present but LOSES the cascade passes every source-text test (#288); self-contained, restores the Explorer base.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// LITERAL on purpose: home is not a nav item, and a page dropping out of the nav must not silently drop out of this guard; /atlas/ is generated and carries no shell.
const SHELLED = ["/", "/explorer/", "/print-room/", "/reading-room/", "/gallery/", "/faq/", "/glossary/", "/seed-of-the-day/", "/prospect/"];

// MEASURED split: /, /explorer/, /gallery/ leave body leading normal, every other page sets 1.6; RH6 needs PROSE and APP to differ in body leading or it proves nothing.
const PROSE = "/faq/";
const APP = "/explorer/";

// Anchored and disjoint on purpose: the flourish face's name is a prefix of the display face's, so an unanchored test for one would match the other.
const DISPLAY_FACE = /^"IM Fell English SC",/;
const FLOURISH_FACE = /^"IM Fell English",/;

// Every constant MEASURED against the built dist/ (out/probe-runninghead.mjs), never derived; tracking null means the browser reported "normal" and is asserted as such.
const ROOM_HEAD = {
  wordmark: { tag: "P", weight: "700", size: 28, tracking: 8.4, face: DISPLAY_FACE },
  roomName: { tag: "H1", weight: "400", size: 16, tracking: 1.12, face: DISPLAY_FACE },
  tagline: { tag: "P", weight: "400", size: 16, tracking: null, face: FLOURISH_FACE },
  topnav: { tag: "NAV", weight: "400", size: 13.12, tracking: 1.5744, face: DISPLAY_FACE },
  footer: { tag: "FOOTER", weight: "400", size: 11.52, tracking: 2.5344, face: DISPLAY_FACE },
};
const HOME_HEAD = {
  ...ROOM_HEAD,
  wordmark: { tag: "H1", weight: "700", size: 43.2, tracking: 12.96, face: DISPLAY_FACE },
  roomName: null,
  footer: { tag: "FOOTER", weight: "400", size: 12, tracking: 3, face: DISPLAY_FACE },
};
const expectedHead = (route) => (route === "/" ? HOME_HEAD : ROOM_HEAD);
const MEMBERS = ["wordmark", "roomName", "tagline", "topnav", "footer"];
// The footer is a shell member but not a head member: it does not pin 1.6, so it is deliberately absent from the leading guard.
const HEAD_MEMBERS = ["wordmark", "roomName", "tagline", "topnav"];

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

const near = (got, want) => Math.abs(got - want) < 0.01;
const matches = (m, want) => {
  if (want === null) return m === null;
  if (!m) return false;
  return m.tag === want.tag && m.weight === want.weight && near(m.size, want.size) &&
    want.face.test(m.family) &&
    (want.tracking === null ? m.tracking === "normal" : near(parseFloat(m.tracking), want.tracking));
};
const leaded = (m) => !!m && Math.abs(m.ratio - 1.6) < 0.005;

// Reading the producer's own template couples the injected twin to it: rename the class or demote the heading in renderBoundAtlas and RH7 reds instead of drifting.
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

  const heads = {};
  const unreachable = [];
  for (const route of SHELLED) {
    if (!(await visit(route))) { unreachable.push(route); continue; }
    heads[route] = JSON.parse(await evaluate(HEAD_READ));
    if (route === "/") await shoot("running-head-home.png");
    if (route === PROSE) await shoot("running-head-room.png");
  }

  const bad = (pred) => SHELLED.filter((r) => !heads[r] || !pred(heads[r], r));

  const manyH1 = bad((h) => h.h1s.length === 1 && h.h1s[0].inHeader);
  check(
    "RH0 every shelled page delivers exactly one h1, inside the running head",
    unreachable.length === 0 && manyH1.length === 0,
    unreachable.length
      ? `unreachable: ${unreachable.join(", ")}`
      : manyH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || `${SHELLED.length}/${SHELLED.length} pages, one h1 each`,
  );

  const wrongH1 = bad((h, r) => h.h1s.length === 1 && h.h1s[0].classes.includes(r === "/" ? "wordmark" : "room-name"));
  check(
    "RH1 the h1 names the page: the wordmark on home, the room name on every room page",
    wrongH1.length === 0,
    wrongH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || `home=wordmark, ${SHELLED.length - 1} rooms=room-name`,
  );

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

  check(
    "RH4 home's footer stays grander than a room page's (12px/0.25em against 11.52px/0.22em)",
    matches(home?.footer, HOME_HEAD.footer) && matches(prose?.footer, ROOM_HEAD.footer) &&
      home?.footer.size > prose?.footer.size,
    home && prose ? `home=${home.footer?.size}px/${home.footer?.tracking} ${PROSE}=${prose.footer?.size}px/${prose.footer?.tracking}` : "a page was unreachable",
  );

  const unleaded = SHELLED.flatMap((r) =>
    HEAD_MEMBERS
      .filter((m) => (r === "/" && m === "roomName" ? false : !leaded(heads[r]?.[m])))
      .map((m) => `${r} ${m}`));
  check(
    "RH5 every head member resolves line-height 1.6 on every shelled page",
    unleaded.length === 0,
    unleaded.join(", ") || `${SHELLED.length * HEAD_MEMBERS.length - 1}/${SHELLED.length * HEAD_MEMBERS.length - 1} members at 1.6`,
  );

  const app = heads[APP];
  check(
    `RH6 the pages really do differ underneath: ${APP} leaves body leading unset where ${PROSE} sets it`,
    !!app && !!prose && app.bodyLineHeight === "normal" && app.bodyLineHeight !== prose.bodyLineHeight,
    app && prose ? `body leading ${APP}=${app.bodyLineHeight} vs ${PROSE}=${prose.bodyLineHeight}` : "a page was unreachable",
  );

  // .print-only is display:none on screen so no screenshot can reach this, but computed style resolves through display:none; a probe showed a bare h1 in the same container resolves to the BODY face, so the assertion discriminates.
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

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  const restored = await waitReady();

  // "AbortError: Transition was skipped" is the cross-document view-transition's expected cancellation when navigations chain fast, not an app error; this suite is the sole visitor to /gallery/, /glossary/ and /faq/.
  const errDelta = consoleErrors.slice(errBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RH8 the running-head sweep is clean (no console errors, no new 4xx) and the Explorer base is restored",
    errDelta.length === 0 && httpDelta.length === 0 && restored,
    [...errDelta, ...httpDelta].join(" | ") || (restored ? "clean, Explorer restored" : "clean, but the Explorer did not settle"),
  );
}
