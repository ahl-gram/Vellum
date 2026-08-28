// The head cluster on home (CL1-CL7, #480 Landfall Sub 6b): the wash sized to the cluster, the stage's lettering opted out of selection, and the phone drawer; every geometry MEASURED against the rendered page, since the #480 screenshots were all things source-scan tests could not see.
import { makeStage } from "./home-support.mjs";
import { sampleRow, luminance } from "./pixel-support.mjs";

const REM = 16;
const rectOf = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom }; })()`;

const DRAWER_READ = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const nav = document.querySelector("header.chrome nav.rooms");
  const cs = getComputedStyle(nav);
  const seed = document.querySelector(".lf-seed");
  const burger = document.querySelector(".rooms-reveal");
  const b = burger.getBoundingClientRect();
  const atBurger = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
  const scrim = getComputedStyle(document.body, "::after");
  return { innerW: innerWidth, scrollW: document.documentElement.scrollWidth,
    checked: burger.checked, burger: r(".rooms-reveal"), burgerReachable: atBurger === burger,
    cluster: r("header.chrome"), tagline: r("header.chrome .tagline"), seed: r(".lf-seed"),
    seedOpacity: getComputedStyle(seed).opacity, seedPointer: getComputedStyle(seed).pointerEvents,
    input: r("#seed-input"), inputWidth: parseFloat(getComputedStyle(document.getElementById("seed-input")).width),
    nav: { rect: r("header.chrome nav.rooms"), visibility: cs.visibility, transform: cs.transform, position: cs.position, transition: cs.transitionProperty, pointer: cs.pointerEvents },
    scrim: { position: scrim.position, pointer: scrim.pointerEvents, z: scrim.zIndex, content: scrim.content },
    doors: [...nav.querySelectorAll("a, [aria-current]")].map((a) => { const d = a.getBoundingClientRect(); const hit = document.elementFromPoint(d.x + 20, d.y + d.height / 2); return { t: a.textContent, x: d.x, y: d.y, h: d.height, right: d.right, bottom: d.bottom, tappable: hit === a }; }) };
})()`;

const stacked = (doors) => doors.length === 7 && doors.every((d, i) => i === 0 || (d.y >= doors[i - 1].bottom - 0.5 && Math.abs(d.x - doors[0].x) < 0.5));
const offLeft = (nav) => nav.visibility === "hidden" && nav.rect !== null && nav.rect.right <= 0.5;
const clear = (s) => s.cluster !== null && s.seed !== null && s.cluster.right + 4 <= s.seed.x;
// The glyph run of one door, by its label: a strip through its middle reads parchment when the door shows and chart ink when the cap covers it.
const glyphRun = (label) => `(() => { const a = [...document.querySelectorAll("header.chrome nav.rooms a, header.chrome nav.rooms [aria-current]")].find((e) => e.textContent === ${JSON.stringify(label)}); if (!a) return null; const r = new Range(); r.selectNodeContents(a); const b = r.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; })()`;
const brightest = (strip) => Math.max(...strip.map(luminance));

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, waitReady, PORT } = ctx;
  const { pressKey, clickAt, settleHome } = makeStage(ctx);

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const cam = await settleHome();

  const wash = await evaluate(`(() => {
    const chrome = document.querySelector("header.chrome");
    const cs = getComputedStyle(chrome, "::before");
    const c = chrome.getBoundingClientRect();
    const nav = document.querySelector("header.chrome nav.rooms").getBoundingClientRect();
    const px = (v) => parseFloat(v);
    return { filter: cs.filter, bg: cs.backgroundColor, image: cs.backgroundImage,
      box: { left: c.left + px(cs.left), top: c.top + px(cs.top), right: c.right - px(cs.right), bottom: c.bottom - px(cs.bottom) },
      nav: { right: nav.right, bottom: nav.bottom }, cluster: { right: c.right, bottom: c.bottom, left: c.left, top: c.top } };
  })()`);
  const alpha = wash ? parseFloat((wash.bg.match(/\/\s*([\d.]+)\)/) || wash.bg.match(/rgba\([^)]*,\s*([\d.]+)\)/) || [])[1] ?? "1") : 0;
  check(
    "CL1 the cluster's wash is a soft pool sized by the cluster: it ends 1.5 to 3rem past the nav's right and bottom, blurred, at 0.8 ink or deeper, no gradient box (#480 screenshot 3; the slab measured 736x272 against a nav ending at 510x102)",
    !!cam && !!wash && wash.image === "none" && /blur\(/.test(wash.filter) && alpha >= 0.8
      && wash.box.right - wash.nav.right >= 1.5 * REM && wash.box.right - wash.nav.right <= 3 * REM
      && wash.box.bottom - wash.nav.bottom >= 1.5 * REM && wash.box.bottom - wash.nav.bottom <= 3 * REM
      && wash.box.left <= -2 * REM && wash.box.top <= -2 * REM,
    JSON.stringify({ cam: !!cam, wash, alpha }),
  );
  await shoot("cluster-wash-1280.png");

  const dragAcross = async (from, dx, dy) => {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: from.x, y: from.y, button: "left", buttons: 1, clickCount: 1 });
    for (let i = 1; i <= 8; i++) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: from.x + (dx * i) / 8, y: from.y + (dy * i) / 8, button: "left", buttons: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: from.x + dx, y: from.y + dy, button: "left", clickCount: 1 });
    await sleep(150);
  };
  await evaluate(`getSelection().removeAllRanges()`);
  const slip = await evaluate(rectOf('.lf-station[data-station="explorer"] .lf-station-name'));
  if (slip) await dragAcross({ x: slip.x + 4, y: slip.y + slip.h / 2 }, 200, 160);
  const pipSelection = await evaluate(`getSelection().toString()`);
  await evaluate(`getSelection().removeAllRanges(); document.querySelector(".lf-shelf-grid figcaption").scrollIntoView({ block: "center" })`);
  await sleep(200);
  const caption = await evaluate(rectOf(".lf-shelf-grid figcaption"));
  if (caption) await dragAcross({ x: caption.x + 2, y: caption.y + caption.h / 2 }, caption.w - 4, 0);
  const controlSelection = await evaluate(`getSelection().toString()`);
  check(
    "CL2 a mouse drag that begins on a station name selects nothing, while the SAME drag across a shelf caption still selects its text, so the probe can select and the stage alone opts out (#480 screenshot 4; the baseline drag selected every place name)",
    slip !== null && caption !== null && pipSelection === "" && controlSelection.length > 0,
    JSON.stringify({ slip: !!slip, caption: !!caption, pipSelection: pipSelection.slice(0, 60), controlSelection }),
  );

  await setMobileViewport(390, 844);
  const phoneCam = await settleHome();
  const closed = await evaluate(DRAWER_READ);
  check(
    "CL3 at 390 closed: the cluster ends clear of the seed panel (the tagline wraps, the input is the mockup's 4.6rem), the drawer waits invisible off the left edge, nothing scrolls sideways (#480 screenshot 1; the baseline tagline ran 19px onto the panel)",
    !!phoneCam && !!closed && closed.scrollW === 390 && clear(closed) && !closed.checked && offLeft(closed.nav)
      && closed.nav.position === "absolute" && Math.abs(closed.inputWidth - 4.6 * REM) < 0.05
      && closed.seedOpacity === "1" && closed.scrim.content === "none",
    JSON.stringify({ phoneCam: !!phoneCam, closed }),
  );

  const burger = closed?.burger ?? null;
  if (burger) await clickAt(burger.x + burger.w / 2, burger.y + burger.h / 2);
  await sleep(600);
  const open = await evaluate(DRAWER_READ);
  const firstDoor = open?.doors[0] ?? null;
  check(
    "CL4 a real tap on the burger slides the drawer home: anchored to the viewport corner, full height, seven doors stacked one per row at 44px or taller below the cluster and each one hit-testable (the first sticky cap sat over three of them), the burger still on top, the seed panel faded and untappable, the scrim fixed beneath the chrome, nothing scrolling sideways (#480 screenshot 2)",
    !!open && open.checked && open.scrollW === 390 && open.nav.visibility === "visible" && open.nav.transform === "none" && open.nav.pointer === "auto"
      && open.nav.rect.x === 0 && open.nav.rect.y === 0 && open.nav.rect.h >= 800 && open.nav.rect.w <= 16 * REM + 0.5
      && stacked(open.doors) && open.doors.every((d) => d.h >= 44 && d.tappable) && firstDoor !== null && open.burger !== null && firstDoor.y >= open.burger.bottom + 8
      && open.burgerReachable && open.seedOpacity === "0" && open.seedPointer === "none"
      && open.scrim.position === "fixed" && open.scrim.pointer === "auto" && Number(open.scrim.z) < 10 && /transform/.test(open.nav.transition),
    JSON.stringify({ open }),
  );
  await shoot("cluster-drawer-open-390.png");

  await pressKey("Escape", "Escape", 27);
  await sleep(600);
  const afterEscape = await evaluate(DRAWER_READ);
  if (burger) await clickAt(burger.x + burger.w / 2, burger.y + burger.h / 2);
  await sleep(600);
  const reopened = await evaluate(DRAWER_READ);
  await clickAt(370, 500);
  await sleep(600);
  const afterScrim = await evaluate(DRAWER_READ);
  check(
    "CL5 Escape closes the drawer, the burger reopens it, and a real tap on the scrim closes it again: each close is a slide back off the left edge, doors hidden (#480)",
    !!afterEscape && !afterEscape.checked && offLeft(afterEscape.nav) && afterEscape.seedOpacity === "1"
      && !!reopened && reopened.checked && reopened.nav.visibility === "visible"
      && !!afterScrim && !afterScrim.checked && offLeft(afterScrim.nav),
    JSON.stringify({ afterEscape: afterEscape && { checked: afterEscape.checked, nav: afterEscape.nav }, reopened: reopened && reopened.checked, afterScrim: afterScrim && { checked: afterScrim.checked, nav: afterScrim.nav } }),
  );

  await setMobileViewport(360, 780);
  const cam360 = await settleHome();
  const narrow = await evaluate(DRAWER_READ);
  check(
    "CL6 at 360 (the common Android width) the cluster still ends clear of the seed panel and nothing scrolls sideways (#480 screenshot 1)",
    !!cam360 && !!narrow && narrow.scrollW === 360 && clear(narrow),
    JSON.stringify({ cam360: !!cam360, cluster: narrow?.cluster, seed: narrow?.seed, scrollW: narrow?.scrollW }),
  );

  await setMobileViewport(844, 390);
  const camWide = await settleHome();
  const wideClosed = await evaluate(DRAWER_READ);
  if (wideClosed?.burger) await clickAt(wideClosed.burger.x + wideClosed.burger.w / 2, wideClosed.burger.y + wideClosed.burger.h / 2);
  await sleep(600);
  const shownRun = await evaluate(glyphRun("Explorer"));
  const shownStrip = shownRun ? await sampleRow(send, Math.round(shownRun.x + shownRun.w / 2), Math.round(shownRun.y + shownRun.h / 2), 12) : [];
  const scrollBefore = await evaluate(`window.scrollY`);
  for (let i = 0; i < 8; i++) await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 120, y: 250, deltaX: 0, deltaY: 200 });
  await sleep(400);
  const cappedRun = await evaluate(glyphRun("Explorer"));
  const cappedStrip = cappedRun ? await sampleRow(send, Math.round(cappedRun.x + cappedRun.w / 2), Math.round(cappedRun.y + cappedRun.h / 2), 12) : [];
  const landscape = await evaluate(`(() => {
    const nav = document.querySelector("header.chrome nav.rooms");
    const cluster = document.querySelector("header.chrome").getBoundingClientRect();
    const doors = [...nav.querySelectorAll("a, [aria-current]")].map((a) => a.getBoundingClientRect());
    const last = doors[doors.length - 1];
    const probe = document.elementFromPoint(cluster.left + 20, cluster.bottom + 12);
    return { overflow: nav.scrollHeight - nav.clientHeight, scrollTop: nav.scrollTop, lastBottom: last.bottom, clientH: nav.clientHeight,
      firstTop: doors[0].top, clusterBottom: cluster.bottom, pageScrollY: window.scrollY,
      capHit: probe === nav, hitTag: probe ? probe.tagName : null };
  })()`);
  check(
    "CL7 landscape 844x390: the drawer overflows its box, a real wheel scrolls it to the last door with the page unmoved, and the doors scrolled up under the cluster are hidden beneath the sticky cap, never showing through the lettering: the cap wins the hit-test AND a pixel strip through a scrolled door's glyphs reads chart ink where the same strip read parchment unscrolled (plate finding G on PR #482; the pixel half closes prover round 2's A4, a transparent cap that still won the hit-test)",
    !!camWide && !!landscape && landscape.overflow > 0 && landscape.scrollTop > 0 && landscape.lastBottom <= landscape.clientH + 0.5
      && landscape.pageScrollY === scrollBefore && landscape.firstTop < landscape.clusterBottom && landscape.capHit
      && shownStrip.length === 12 && brightest(shownStrip) > 150 && cappedStrip.length === 12 && brightest(cappedStrip) < 100,
    JSON.stringify({ camWide: !!camWide, scrollBefore, landscape, shownRun, shownBrightest: shownStrip.length ? brightest(shownStrip) : null, cappedRun, cappedBrightest: cappedStrip.length ? brightest(cappedStrip) : null }),
  );
  await shoot("cluster-drawer-landscape-scrolled.png");

  await clearMobile();
  await send("Emulation.clearDeviceMetricsOverride");
  // The next suite in the lane starts on whatever page is current: hand it a SETTLED Explorer, or region-detail's stepped descent races the boot draw (RD2/RD3 red on PR #482 CI).
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  await waitReady();
}
