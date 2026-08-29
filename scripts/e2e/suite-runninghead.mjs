// Running Head e2e (RH0-RH8, #295; reshaped for the Sub 6 head cluster, #461): the shell's
// masthead asserted by RESOLVED computed styles, because a rule that is present but LOSES
// the cascade passes every source-text test (#288); self-contained, restores the Explorer base.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// LITERAL on purpose: home is not a nav item, /ribbon/ and /prospect/ are shelled rooms outside
// the nav, and a page dropping out of the nav must not silently drop out of this guard; /atlas/
// is generated and carries no shell.
const SHELLED = ["/", "/explorer/", "/print-room/", "/reading-room/", "/gallery/", "/faq/", "/glossary/", "/seed-of-the-day/", "/prospect/", "/ribbon/"];

// MEASURED split: /, /explorer/, /gallery/ leave body leading normal, every other page sets 1.6; RH6 needs PROSE and APP to differ in body leading or it proves nothing.
const PROSE = "/faq/";
const APP = "/explorer/";

// Anchored and disjoint on purpose: the flourish face's name is a prefix of the display face's, so an unanchored test for one would match the other.
const DISPLAY_FACE = /^"IM Fell English SC",/;
const FLOURISH_FACE = /^"IM Fell English",/;

// Every constant MEASURED against the built dist/ (out/probe-cluster.mjs, 2026-08-26), never
// derived; tracking null means the browser reported "normal" and is asserted as such. The
// cluster is ONE dress on every page (#461 ruling 1): home differs only in the wordmark's tag
// (h1, #288) and in having no room head to measure.
const ROOM_HEAD = {
  wordmark: { tag: "P", weight: "400", size: 33.6, tracking: 4.032, face: DISPLAY_FACE },
  tagline: { tag: "P", weight: "400", size: 14.72, tracking: null, face: FLOURISH_FACE },
  rooms: { tag: "NAV", weight: "400", size: 11.52, tracking: 1.6128, face: DISPLAY_FACE },
  roomName: { tag: "H1", weight: "400", size: 26.4, tracking: 3.696, face: DISPLAY_FACE },
  roomTagline: { tag: "P", weight: "400", size: 16, tracking: null, face: FLOURISH_FACE },
  footer: { tag: "FOOTER", weight: "400", size: 11.52, tracking: 2.5344, face: DISPLAY_FACE },
};
const HOME_HEAD = {
  ...ROOM_HEAD,
  wordmark: { ...ROOM_HEAD.wordmark, tag: "H1" },
  roomName: null,
  roomTagline: null,
};
// Sub 7 (#462): a converted room stands its name in the RoomFolio corner (1.32rem, the corner's own leading), measured 2026-08-29 against the built dist; a CHART room renders no footer (ruling 9).
const FOLIO = ["/seed-of-the-day/", "/faq/", "/glossary/", "/explorer/"];
const CHART = ["/seed-of-the-day/", "/explorer/"];
const FOLIO_HEAD = {
  ...ROOM_HEAD,
  roomName: { tag: "H1", weight: "400", size: 21.12, tracking: 2.9568, face: DISPLAY_FACE },
  roomTagline: { tag: "P", weight: "400", size: 14.72, tracking: null, face: FLOURISH_FACE },
};
const CHART_HEAD = { ...FOLIO_HEAD, footer: null };
const expectedHead = (route) =>
  route === "/" ? HOME_HEAD : CHART.includes(route) ? CHART_HEAD : FOLIO.includes(route) ? FOLIO_HEAD : ROOM_HEAD;
const MEMBERS = ["wordmark", "tagline", "rooms", "roomName", "roomTagline", "footer"];
// The second addendum on #461: the cluster pins its OWN leading (wordmark 1.15, the rest normal)
// and must never inherit the page's reading 1.6; the room head pins 1.6 and must never inherit
// an app page's normal. Both polarities are asserted per page in RH5.
const CLUSTER_NORMAL = ["tagline", "rooms", "footer"];
const HEAD_LEADED = ["roomName", "roomTagline"];

const HEAD_READ = `(() => {
  const read = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName, weight: cs.fontWeight, size: parseFloat(cs.fontSize),
      family: cs.fontFamily, tracking: cs.letterSpacing, lineHeight: cs.lineHeight,
      ratio: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize),
      position: cs.position, color: cs.color,
    };
  };
  const band = document.querySelector(".band");
  const chrome = document.querySelector("header.chrome");
  return JSON.stringify({
    chromeWash: chrome ? (({ content, backgroundColor, filter }) => ({ content, backgroundColor, filter }))(getComputedStyle(chrome, "::before")) : null,
    wordmark: read("header.chrome .wordmark"), tagline: read("header.chrome .tagline"),
    rooms: read("header.chrome nav.rooms"),
    roomName: read("main .room-name"), roomTagline: read("main .room-tagline"),
    footer: read("body > footer"),
    chromePosition: read("header.chrome")?.position ?? null,
    chromeBottom: document.querySelector("header.chrome")?.getBoundingClientRect().bottom ?? null,
    bandClip: band ? getComputedStyle(band, "::before").clipPath : null,
    h1s: [...document.querySelectorAll("h1")].map((h) => ({ classes: [...h.classList], inHeader: !!h.closest("header"), inMain: !!h.closest("main") })),
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
      if (ok) break;
      await sleep(75);
      if (i === 199) return false;
    }
    if (route !== "/") return true;
    // Home's first arrival raises the ceremony veil (#457); a key before the module arms the skip hits nothing, so press until the veil goes and the cluster shows on the stage.
    for (let i = 0; i < 40; i++) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
      await sleep(150);
      let up = true;
      try { up = await evaluate(`!!document.getElementById("lf-veil")`); } catch {}
      if (!up) break;
    }
    return true;
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

  const manyH1 = bad((h, r) => h.h1s.length === 1 && (r === "/" ? h.h1s[0].inHeader : h.h1s[0].inMain));
  check(
    "RH0 every shelled page delivers exactly one h1: home's in the cluster, a room's standing in the page (#461 ruling 1)",
    unreachable.length === 0 && manyH1.length === 0,
    unreachable.length
      ? `unreachable: ${unreachable.join(", ")}`
      : manyH1.map((r) => `${r}: ${JSON.stringify(heads[r]?.h1s)}`).join(" | ") || `${SHELLED.length}/${SHELLED.length} pages, one h1 each, placed right`,
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
    offenders.join(" | ") || `${SHELLED.length * MEMBERS.length - 2} members pinned across ${SHELLED.length} pages`,
  );

  // The band clips the deep at --band-h (121.6px at desktop); home has no band, nothing scrolls
  // beneath its cluster. The invariant is band >= cluster (ruling 5's "never beneath bare
  // lettering"), not just the literal clip: nav growth that overflows the band must red here.
  const unfixed = bad((h, r) =>
    (r === "/" ? h.chromePosition === "absolute" && h.bandClip === null
               : CHART.includes(r) ? h.chromePosition === "fixed" && h.bandClip === null
               : h.chromePosition === "fixed" &&
                 typeof h.bandClip === "string" && h.bandClip.includes("121.6px") &&
                 typeof h.chromeBottom === "number" && h.chromeBottom <= 121.6));
  check(
    "RH3 the cluster is fixed inside the reserved band on rooms; on home it is bandless and RIDES the page; a chart room is bandless too, the chart running under a fixed cluster (#461 rulings 1+5; #472's ride; #462 ruling 7)",
    unfixed.length === 0,
    unfixed.map((r) => `${r}: chrome=${heads[r]?.chromePosition} bottom=${heads[r]?.chromeBottom} band=${heads[r]?.bandClip}`).join(" | ") ||
      `chrome fixed x${SHELLED.length - 1}, cluster inside the 121.6px band x${SHELLED.length - 1 - CHART.length}, home and the chart room bandless`,
  );

  const home = heads["/"];
  const prose = heads[PROSE];
  check(
    "RH4 the cluster is ONE dress: home's wordmark and footer resolve identical to a room's (the folio's grander-home literals retired, #461)",
    !!home && !!prose &&
      near(home.wordmark?.size, prose.wordmark?.size) && home.wordmark?.tracking === prose.wordmark?.tracking &&
      near(home.footer?.size, prose.footer?.size) && home.footer?.tracking === prose.footer?.tracking &&
      home.wordmark?.tag === "H1" && prose.wordmark?.tag === "P",
    home && prose
      ? `wordmark home=${home.wordmark?.tag}/${home.wordmark?.size} ${PROSE}=${prose.wordmark?.tag}/${prose.wordmark?.size}; footer ${home.footer?.size} vs ${prose.footer?.size}`
      : "a page was unreachable",
  );

  // Both polarities of the leading addendum (#461): the cluster never inherits the page's 1.6, the room head never inherits an app page's normal.
  const misleaded = SHELLED.flatMap((r) => {
    const h = heads[r];
    if (!h) return [`${r}: unreachable`];
    const out = [];
    if (!h.wordmark || Math.abs(h.wordmark.ratio - 1.15) > 0.005) out.push(`${r} wordmark ratio ${h.wordmark?.ratio}`);
    for (const m of CLUSTER_NORMAL) {
      if (expectedHead(r)[m] === null) continue;
      if (h[m]?.lineHeight !== "normal") out.push(`${r} ${m} leading ${h[m]?.lineHeight}`);
    }
    if (FOLIO.includes(r)) {
      // The folio corner is chrome: its name pins the mockup's 1.2 and its tagline the corner's normal, so neither inherits the page's reading leading.
      if (!h.roomName || Math.abs(h.roomName.ratio - 1.2) > 0.005) out.push(`${r} roomName ratio ${h.roomName?.ratio}`);
      if (h.roomTagline?.lineHeight !== "normal") out.push(`${r} roomTagline leading ${h.roomTagline?.lineHeight}`);
    } else if (r !== "/") {
      for (const m of HEAD_LEADED) {
        if (!h[m] || Math.abs(h[m].ratio - 1.6) > 0.005) out.push(`${r} ${m} ratio ${h[m]?.ratio}`);
      }
    }
    return out;
  });
  check(
    "RH5 the cluster pins its own leading (wordmark 1.15, the rest normal) and the room head pins its own: 1.6 on the sheet, the corner's 1.2 and normal in a folio (#461 addendum; #462)",
    misleaded.length === 0,
    misleaded.join(", ") || `cluster + room head leading pinned across ${SHELLED.length} pages`,
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

  // The lightest-adjacent-ground measurements behind both pins are the 2026-08-26 plate read
  // (out/461-plate/contrast-v2.json): line-tan on the deep 4.03 < 4.5, and home's bandless
  // cluster at 1280x800 over the close-in chart as low as 1.17. Alex's calls same day on #461.
  const PARCHMENT = "rgb(239, 230, 207)";
  const dimTaglines = bad((h) => h.tagline?.color === PARCHMENT);
  check(
    "RH9a the tagline resolves parchment sitewide: line-tan measured 4.03 on the deep, under the 4.5 bar (#461, 2026-08-26 call)",
    dimTaglines.length === 0,
    dimTaglines.map((r) => `${r} tagline ${heads[r]?.tagline?.color}`).join(" | ") || `tagline parchment x${SHELLED.length}`,
  );

  const poolAlpha = (color) => Number((String(color).match(/\/\s*([\d.]+)\)/) || String(color).match(/rgba\([^)]*,\s*([\d.]+)\)/) || [])[1] ?? "0");
  const washWrong = bad((h, r) =>
    r === "/" ? !!h.chromeWash && h.chromeWash.content !== "none" && /blur\(/.test(h.chromeWash.filter) && poolAlpha(h.chromeWash.backgroundColor) >= 0.8
              : !!h.chromeWash && h.chromeWash.content === "none");
  check(
    "RH9b home's chrome carries its wash, a blurred pool of the chart ink since #480, and a room's carries none, the band being its ground (#461, 2026-08-26 call)",
    washWrong.length === 0,
    washWrong.map((r) => `${r} wash ${JSON.stringify(heads[r]?.chromeWash)}`).join(" | ") || "wash on home alone",
  );

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  const restored = await waitReady();

  // "AbortError: Transition was skipped" is the cross-document view-transition's expected cancellation when navigations chain fast, not an app error; this suite is the sole visitor to /gallery/, /glossary/, /faq/ and /ribbon/.
  const errDelta = consoleErrors.slice(errBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RH8 the running-head sweep is clean (no console errors, no new 4xx) and the Explorer base is restored",
    errDelta.length === 0 && httpDelta.length === 0 && restored,
    [...errDelta, ...httpDelta].join(" | ") || (restored ? "clean, Explorer restored" : "clean, but the Explorer did not settle"),
  );
}
