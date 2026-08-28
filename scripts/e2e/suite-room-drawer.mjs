// The drawer on a ROOM (DR1-DR7, #483 Landfall Sub 6c): the cluster suite covers home, whose chrome rides the page; a room's chrome is fixed, which changes what the scrim must be and whether a scroll closes anything. Every geometry is MEASURED and every door HIT-TESTED, since the sticky cap once sat over three doors with every rect green.
import { scopedHealth } from "./room-support.mjs";

const DOCUMENT_ROOM = "/faq/";
const APP_ROOM = "/explorer/";

const READ = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const nav = document.querySelector("header.chrome nav.rooms");
  const cs = getComputedStyle(nav);
  const burger = document.querySelector(".rooms-reveal");
  const b = burger.getBoundingClientRect();
  const scrim = getComputedStyle(document.body, "::after");
  const main = document.querySelector("body > main");
  const footer = document.querySelector("body > footer");
  return { innerW: innerWidth, innerH: innerHeight, scrollW: document.documentElement.scrollWidth, scrollY: window.scrollY,
    bandH: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--band-h")) * parseFloat(getComputedStyle(document.documentElement).fontSize),
    chromePosition: getComputedStyle(document.querySelector("header.chrome")).position,
    chromeZ: getComputedStyle(document.querySelector("header.chrome")).zIndex,
    checked: burger.checked, burger: r(".rooms-reveal"), burgerDisplay: getComputedStyle(burger).display,
    burgerReachable: document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2) === burger,
    cluster: r("header.chrome"),
    nav: { rect: r("header.chrome nav.rooms"), visibility: cs.visibility, position: cs.position },
    scrim: { position: scrim.position, top: scrim.top, z: scrim.zIndex, content: scrim.content, background: scrim.backgroundColor },
    mainInert: main.inert, footerInert: footer.inert, chromeInert: document.querySelector("header.chrome").inert,
    hitMidPage: (() => { const e = document.elementFromPoint(Math.round(innerWidth * 0.8), Math.round(innerHeight * 0.65)); return e ? e.tagName + "." + String(e.className).split(" ")[0] : null; })(),
    doors: [...nav.querySelectorAll("a, [aria-current]")].map((a) => { const d = a.getBoundingClientRect(); const hit = document.elementFromPoint(d.x + 20, d.y + d.height / 2); return { t: a.textContent, x: d.x, y: d.y, h: d.height, bottom: d.bottom, current: a.hasAttribute("aria-current"), display: getComputedStyle(a).display, offset: getComputedStyle(a).textUnderlineOffset, tappable: hit === a }; }) };
})()`;

const stacked = (doors) => doors.length > 1 && doors.every((d, i) => i === 0 || (d.y >= doors[i - 1].bottom - 0.5 && Math.abs(d.x - doors[0].x) < 0.5));
const offLeft = (nav) => nav.visibility === "hidden" && nav.rect !== null && nav.rect.right <= 0.5;

export async function run(ctx) {
  const { evaluate, send, check, sleep, setMobileViewport, clearMobile, touch, waitReady, PORT } = ctx;
  const gate = scopedHealth(ctx);

  const goto = async (path) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${path}` });
    await waitReady();
    await sleep(250);
  };
  // A REAL tap, never burger.click(): the checkbox is the no-JS path and a synthetic click would not prove the target is reachable.
  const tapBurger = async () => {
    const b = await evaluate(`(() => { const r = document.querySelector(".rooms-reveal").getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
    await touch("touchStart", [{ x: b.x, y: b.y }]);
    await touch("touchEnd", []);
    await sleep(450);
  };
  const tapAt = async (x, y) => {
    await touch("touchStart", [{ x, y }]);
    await touch("touchEnd", []);
    await sleep(450);
  };

  await setMobileViewport(390, 844);
  await goto(DOCUMENT_ROOM);
  const closed = await evaluate(READ);
  check(
    "DR1 at 390 a document room's nav is folded into the drawer: it waits invisible off the left edge, the burger stands in the cluster and is reachable, the cluster ends inside the reserved band, and nothing scrolls sideways (#483)",
    offLeft(closed.nav) && closed.burgerDisplay !== "none" && closed.burgerReachable &&
      closed.cluster.bottom <= closed.bandH && closed.scrollW <= closed.innerW,
    `nav ${closed.nav.visibility} right=${closed.nav.rect && closed.nav.rect.right.toFixed(1)}, burger ${closed.burgerDisplay} reachable=${closed.burgerReachable}, cluster bottom ${closed.cluster.bottom.toFixed(1)} vs band ${closed.bandH.toFixed(1)}, scrollW ${closed.scrollW}/${closed.innerW}`,
  );

  await tapBurger();
  const open = await evaluate(READ);
  const current = open.doors.find((d) => d.current);
  check(
    "DR2 a real tap on a room's burger slides the drawer home: every door stacked one per row at 44px or taller and hit-testable, the current room's door among them as a block with its underline clear, main and footer inert while the chrome stays live, and nothing scrolling sideways (#483)",
    open.checked && open.nav.visibility === "visible" && stacked(open.doors) &&
      open.doors.every((d) => d.tappable && d.h >= 44) &&
      !!current && current.display === "block" &&
      open.mainInert && open.footerInert && !open.chromeInert && open.scrollW <= open.innerW,
    `checked=${open.checked} doors ${open.doors.filter((d) => d.tappable).length}/${open.doors.length} tappable, min h ${Math.min(...open.doors.map((d) => d.h)).toFixed(1)}, current=${current ? current.t + " " + current.display + " " + current.offset : "MISSING"}, inert main/footer/chrome ${open.mainInert}/${open.footerInert}/${open.chromeInert}, scrollW ${open.scrollW}/${open.innerW}`,
  );
  check(
    "DR3 the scrim a room's drawer stands on is FIXED below the band, so it can never desynchronise from a chrome that is fixed too, it dims the page rather than the lit cluster, and a page point lands on it and not on the live page (#483; #482 finding 4 is home's, whose chrome rides the page)",
    open.chromePosition === "fixed" && open.scrim.position === "fixed" &&
      Math.abs(parseFloat(open.scrim.top) - open.bandH) < 1 && open.scrim.z === "41" &&
      open.hitMidPage === "BODY.room",
    `chrome ${open.chromePosition}, scrim ${open.scrim.position} top ${open.scrim.top} (band ${open.bandH.toFixed(1)}) z ${open.scrim.z}, a page point hits ${open.hitMidPage}`,
  );

  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await sleep(450);
  const escaped = await evaluate(READ);
  await tapBurger();
  const reopened = await evaluate(READ);
  await tapAt(Math.round(reopened.innerW * 0.8), Math.round(reopened.innerH * 0.65));
  const tappedOut = await evaluate(READ);
  check(
    "DR4 Escape closes a room's drawer and releases the page, the burger reopens it, and a real tap on the scrim closes it again: each close slides the doors back off the left edge and takes main and footer out of inert (#483)",
    !escaped.checked && offLeft(escaped.nav) && !escaped.mainInert && !escaped.footerInert &&
      reopened.checked && reopened.nav.visibility === "visible" &&
      !tappedOut.checked && offLeft(tappedOut.nav) && !tappedOut.mainInert,
    `escape checked=${escaped.checked} inert=${escaped.mainInert}, reopen checked=${reopened.checked}, scrim tap checked=${tappedOut.checked} inert=${tappedOut.mainInert}`,
  );

  await tapBurger();
  const beforeSwipe = await evaluate(READ);
  await touch("touchStart", [{ x: 300, y: 700 }]);
  for (const y of [640, 560, 470, 380, 320]) await touch("touchMove", [{ x: 300, y }]);
  await touch("touchEnd", []);
  await sleep(700);
  const afterSwipe = await evaluate(READ);
  check(
    "DR5 a real swipe with a room's drawer open scrolls the page beneath it while the drawer, its burger and its scrim stay exactly where they were and the drawer stays OPEN: nothing rides away, so a room needs no scroll-to-close the way home does (#483, ruling item 2)",
    beforeSwipe.checked && afterSwipe.checked && afterSwipe.scrollY > beforeSwipe.scrollY &&
      Math.abs(afterSwipe.nav.rect.y - beforeSwipe.nav.rect.y) < 1 &&
      Math.abs(afterSwipe.burger.y - beforeSwipe.burger.y) < 1 &&
      afterSwipe.hitMidPage === "BODY.room" && afterSwipe.mainInert,
    `scrollY ${beforeSwipe.scrollY} to ${afterSwipe.scrollY}, drawer y ${beforeSwipe.nav.rect.y.toFixed(1)} to ${afterSwipe.nav.rect.y.toFixed(1)}, burger y ${beforeSwipe.burger.y.toFixed(1)} to ${afterSwipe.burger.y.toFixed(1)}, still open=${afterSwipe.checked}, page point hits ${afterSwipe.hitMidPage}`,
  );

  await goto(APP_ROOM);
  await tapBurger();
  const app = await evaluate(READ);
  check(
    "DR6 an app room wears the same drawer as a document room: every door hit-testable over a page that paints its own furniture, its main inert beneath the scrim, and nothing scrolling sideways (#483)",
    app.checked && app.doors.every((d) => d.tappable) && app.mainInert && !app.chromeInert &&
      app.scrim.position === "fixed" && app.scrollW <= app.innerW,
    `doors ${app.doors.filter((d) => d.tappable).length}/${app.doors.length} tappable, main inert ${app.mainInert}, scrim ${app.scrim.position} z ${app.scrim.z}, scrollW ${app.scrollW}/${app.innerW}`,
  );

  await setMobileViewport(844, 390);
  await goto(DOCUMENT_ROOM);
  await tapBurger();
  const land = await evaluate(READ);
  const scrolledDoor = await evaluate(`(() => {
    const nav = document.querySelector("header.chrome nav.rooms");
    nav.scrollTop = nav.scrollHeight;
    const doors = [...nav.querySelectorAll("a, [aria-current]")];
    const last = doors[doors.length - 1].getBoundingClientRect();
    const hit = document.elementFromPoint(last.x + 20, last.y + last.height / 2);
    return { pageScrollY: window.scrollY, lastReached: hit === doors[doors.length - 1], navScrolled: nav.scrollTop > 0 };
  })()`);
  check(
    "DR7 at landscape 844x390 a room's drawer overflows its own box and scrolls to the last door with the PAGE unmoved, that door still hit-testable under the sticky cap (#483; the cap once sat over three doors with every rect green)",
    land.checked && scrolledDoor.navScrolled && scrolledDoor.lastReached && scrolledDoor.pageScrollY === 0 && land.scrollW <= land.innerW,
    `nav scrolled=${scrolledDoor.navScrolled}, last door reached=${scrolledDoor.lastReached}, page scrollY=${scrolledDoor.pageScrollY}, scrollW ${land.scrollW}/${land.innerW}`,
  );

  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const wide = await evaluate(READ);
  check(
    "DR8 back at desktop width the burger is gone and the nav is the dot-separated cluster row again, with no drawer state left behind (#483)",
    wide.burgerDisplay === "none" && wide.nav.visibility === "visible" && !wide.mainInert && !wide.footerInert,
    `burger ${wide.burgerDisplay}, nav ${wide.nav.visibility}, inert main/footer ${wide.mainInert}/${wide.footerInert}`,
  );

  gate.check("DR9 the room drawer suite drove the shell with no console error and no 4xx");
  // A suite's LAST navigation must waitReady: the next suite in the lane starts on whatever page is current.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  await waitReady();
}
