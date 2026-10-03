// The trail under the nav (Issue #668), read at 1280, 901, 768 and 390: its links answer a hit-test and one takes a real press, it clears a thumb's 24px round each of its links, it rides the phone drawer's cap above the doors, it stands aside while a chart room's phone sheet is up, and the band and the Gallery give it ground. Every target is HIT-TESTED, never clicked through element.click().
import type { Payload, SuiteContext } from "../../types.ts";
import type { makeSettle } from "../../support/settle.ts";
import { sampleRow } from "../../support/pixel.ts";

type Box = { x: number; y: number; w: number; h: number; right: number; bottom: number };
type Target = Box & { t: string; hit: boolean };
type Trail = {
  path: string; innerW: number; innerH: number; scrollW: number; bandH: number; checked: boolean; cluster: Box; where: Box | null; whereVisibility: string | null;
  trailInk: Box | null; alsoInk: Box | null; links: Target[]; navLinks: Target[]; crumbs: number[]; crumbWrap: string[]; burger: Box | null; drawer: Box | null; capBottom: number; doors: Target[];
  firstDoorInk: Box | null; linkColor: string | null; hereColor: string | null; hereLine: string | null;
};
export type TrailKit = SuiteContext & { settle: ReturnType<typeof makeSettle>; goto: (path: string) => Promise<void> };

const PARCHMENT = "rgb(239, 230, 207)";
const PARCHMENT_BRIGHT = "rgb(255, 247, 228)";

type Rgb = readonly [number, number, number];
const channel = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a: Rgb, b: Rgb) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const median = (xs: number[]) => [...xs].sort((p, q) => p - q)[Math.floor(xs.length / 2)] ?? NaN;
const parseColour = (css: string): { rgb: Rgb; alpha: number } => {
  const srgb = css.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
  if (srgb) return { rgb: [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255], alpha: Number(srgb[4] ?? 1) };
  const rgba = css.match(/^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/);
  if (rgba) return { rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])], alpha: Number(rgba[4] ?? 1) };
  return { rgb: [NaN, NaN, NaN], alpha: NaN };
};

async function underlineContrast(k: TrailKit): Promise<number> {
  const u = await k.evaluate<{ colour: string; x: number; w: number; bottom: number } | null>(`(() => { const a = document.querySelector("header.chrome .also a"); if (!a) return null; const b = a.getBoundingClientRect(); return { colour: getComputedStyle(a).textDecorationColor, x: b.x, w: b.width, bottom: b.bottom }; })()`);
  if (!u) return NaN;
  const row = await sampleRow(k.send, Math.round(u.x), Math.round(u.bottom + 3), Math.max(1, Math.round(u.w)));
  const ground: Rgb = [median(row.map((p) => p[0])), median(row.map((p) => p[1])), median(row.map((p) => p[2]))];
  const { rgb, alpha } = parseColour(u.colour);
  const ink: Rgb = [rgb[0] * alpha + ground[0] * (1 - alpha), rgb[1] * alpha + ground[1] * (1 - alpha), rgb[2] * alpha + ground[2] * (1 - alpha)];
  return contrast(ink, ground);
}

const READ: Payload<Trail> = `(() => {
  const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const ink = (e) => { if (!e) return null; const rg = new Range(); rg.selectNodeContents(e); return box(rg); };
  const target = (e) => { const b = box(e); const hit = document.elementFromPoint(b.x + b.w / 2, b.y + b.h / 2); return { ...b, t: e.textContent, hit: !!hit && (hit === e || e.contains(hit)) }; };
  const root = document.documentElement, where = document.querySelector("header.chrome .where"), nav = document.querySelector("header.chrome nav.rooms");
  const here = document.querySelector("header.chrome .trail [aria-current], header.chrome .trail .here"), link = document.querySelector("header.chrome .trail a");
  return { path: location.pathname, innerW: innerWidth, innerH: innerHeight, scrollW: root.scrollWidth, firstDoorInk: nav ? ink(nav.querySelector("a, [aria-current]")) : null,
    bandH: parseFloat(getComputedStyle(root).getPropertyValue("--band-h")) * parseFloat(getComputedStyle(root).fontSize),
    checked: !!document.querySelector(".rooms-reveal")?.checked, cluster: box(document.querySelector("header.chrome")), where: box(where),
    whereVisibility: where ? getComputedStyle(where).visibility : null, trailInk: ink(document.querySelector("header.chrome .trail")), alsoInk: ink(document.querySelector("header.chrome .also")),
    links: [...document.querySelectorAll("header.chrome .where a")].map(target), navLinks: [...document.querySelectorAll("header.chrome nav.rooms a")].map(target), crumbs: [...document.querySelectorAll("header.chrome .trail > :is(a, span):not(.way)")].map((c) => c.getClientRects().length),
    crumbWrap: [...document.querySelectorAll("header.chrome .trail > :is(a, span):not(.way)")].map((c) => getComputedStyle(c).whiteSpace),
    burger: box(document.querySelector(".rooms-reveal")), drawer: box(nav), capBottom: nav ? box(nav).y + parseFloat(getComputedStyle(nav, "::before").height) : 0,
    doors: nav ? [...nav.querySelectorAll("a, [aria-current]")].map(target) : [],
    linkColor: link ? getComputedStyle(link).color : null, hereColor: here ? getComputedStyle(here).color : null, hereLine: here ? getComputedStyle(here).textDecorationLine : null };
})()`;

const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const toBox = (p: { x: number; y: number }, b: Box) => Math.hypot(Math.max(b.x - p.x, 0, p.x - b.right), Math.max(b.y - p.y, 0, p.y - b.bottom));
const spacing = (ts: readonly Box[]): number[] => ts.map((a, i) => Math.min(...ts.filter((_, j) => j !== i).map((b) => {
  const small = b.w < 24 || b.h < 24;
  return small ? Math.hypot(centre(a).x - centre(b).x, centre(a).y - centre(b).y) - 24 : toBox(centre(a), b) - 12;
})));

async function tapAt({ touch }: TrailKit, x: number, y: number): Promise<void> {
  await touch("touchStart", [{ x: Math.round(x), y: Math.round(y) }]);
  await touch("touchEnd", []);
}

async function openDrawer(k: TrailKit, page: string): Promise<Trail> {
  await k.goto(page);
  const shut = await k.evaluate(READ);
  if (shut.burger) await tapAt(k, shut.burger.x + shut.burger.w / 2, shut.burger.y + shut.burger.h / 2);
  return k.settle(READ, (d, last) => d.checked && d.drawer !== null && d.drawer.x === 0 && last !== null && last.drawer?.x === 0, `drawer open on ${page}`);
}

export async function dr11Wide(k: TrailKit): Promise<void> {
  const { send, evaluate, check } = k;
  const rows: string[] = [];
  let ok = true;
  for (const width of [1280, 901]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 800, deviceScaleFactor: 1, mobile: false });
    for (const page of ["/prospect/", "/faq/"]) {
      await k.goto(page);
      const d = await evaluate(READ);
      const margins = spacing([...d.links, ...d.navLinks]);
      const good = d.links.length > 0 && d.navLinks.length > 0 && d.links.every((l) => l.hit) && margins.every((m) => m >= 0)
        && d.linkColor === PARCHMENT && d.hereColor === PARCHMENT_BRIGHT && d.hereLine === "underline";
      ok &&= good;
      rows.push(`${width} ${page}: ${d.links.map((l) => `${l.t}=${l.hit}`).join(",")} spacing ${margins.map((m) => m.toFixed(2)).join(",")} link ${d.linkColor} here ${d.hereColor} ${d.hereLine}`);
    }
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await k.goto("/prospect/");
  const underline = await underlineContrast(k);
  const explorer = (await evaluate(READ)).links.find((l) => l.t === "The Explorer");
  if (explorer) {
    const at = centre(explorer);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
  }
  const landed = await arrived(k, "/explorer/");
  check(
    "DR11 at 1280 and 901 every trail link on the Prospect and the FAQ takes the hand at its centre, a thumb's 24px clears round every trail, alias and nav link (Alex, 2026-10-03, on Issue #668), the links resolve parchment and the page's own segment parchment-bright AND underlined, the alias link's underline, its only cue, reads at least 3:1 over its ground at 1280 (ruling 6), and a REAL press on the Prospect's \"The Explorer\" lands on the Explorer (Issue #668)",
    ok && underline >= 3 && !!explorer && landed,
    `${rows.join(" | ")}; alias underline ${underline.toFixed(2)}:1; press on The Explorer ${explorer ? "sent" : "MISSING"}, landed ${landed}`,
  );
}

async function arrived({ evaluate, sleep }: TrailKit, path: string): Promise<boolean> {
  for (let i = 0; i < 200; i++) {
    const at = await evaluate<string | null>(`document.readyState === "complete" ? location.pathname : null`).catch(() => null);
    if (at === path) return true;
    await sleep(50);
  }
  throw new Error(`never arrived at ${path}`);
}

export async function dr12Print(k: TrailKit): Promise<void> {
  const { send, evaluate, check, setMobileViewport, clearMobile } = k;
  const read = `parseFloat(getComputedStyle(document.body).paddingTop)` as Payload<number>;
  const rows: { width: number; screen: number; print: number }[] = [];
  try {
    for (const width of [1280, 390]) {
      if (width === 390) await setMobileViewport(390, 844);
      await k.goto("/faq/");
      const screen = await evaluate(read);
      await send("Emulation.setEmulatedMedia", { media: "print" });
      rows.push({ width, screen, print: await evaluate(read) });
      await send("Emulation.setEmulatedMedia", { media: "" });
    }
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" }).catch(() => undefined);
    await clearMobile();
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  }
  check(
    "DR12 on paper the FAQ's sheet starts at the top of the page: the padding that buys the trail its band is the screen's alone, at 1280 and at 390, with the screen read in the same run as the control (Issue #668)",
    rows.length === 2 && rows.every((r) => r.print === 0 && r.screen > 100),
    JSON.stringify(rows),
  );
}

export async function dr13Gallery(k: TrailKit): Promise<void> {
  const { evaluate, check, setMobileViewport, clearMobile, send } = k;
  const rows: { width: number; gap: number }[] = [];
  for (const width of [1280, 390] as const) {
    if (width === 390) await setMobileViewport(390, 844);
    await k.goto("/gallery/");
    await k.settle(`(() => { const a = document.querySelector(".grid")?.getAnimations() ?? []; return a.length > 0 && a.every((x) => x.playState === "finished"); })()`, (done) => done === true, "the Gallery's grid has landed");
    const gap = await evaluate<number>(`document.querySelector(".grid figure").getBoundingClientRect().top - document.querySelector("header.chrome").getBoundingClientRect().bottom`);
    rows.push({ width, gap });
  }
  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  check(
    "DR13 the Gallery's first row stands clear of the head cluster with the trail in it, at 1280 and at 390 (Issue #668; the size of the gap is ruling 3's, provisional until Issue #736)",
    rows.length === 2 && rows.every((r) => r.gap >= 4),
    JSON.stringify(rows),
  );
}

export async function dr14PhoneShut(k: TrailKit): Promise<void> {
  const { evaluate, check } = k;
  await k.goto("/prospect/");
  const prospect = await evaluate(READ);
  const underline = await underlineContrast(k);
  await k.goto("/faq/");
  const faq = await evaluate(READ);
  const margins = (d: Trail) => spacing([...d.links, ...(d.burger ? [d.burger] : [])]);
  check(
    "DR14 at 390 with the drawer shut the trail and its alias line stand in the cluster below the burger, every link takes the hand at its centre, a thumb's 24px clears round every link and the burger, the alias link's underline reads at least 3:1 over its ground (ruling 6), and nothing scrolls sideways; DR1 holds the FAQ's band over the cluster (Issue #668; Alex's 2026-10-03 rulings)",
    [prospect, faq].every((d) => d.links.length > 0 && d.links.every((l) => l.hit) && margins(d).every((m) => m >= 0) && d.scrollW <= d.innerW && !!d.burger && d.trailInk !== null && d.trailInk.y >= d.burger.bottom)
      && prospect.links.length === 3 && underline >= 3,
    `${[prospect, faq].map((d) => `${d.path}: links ${d.links.map((l) => `${l.t}=${l.hit}`).join(",")}, spacing ${margins(d).map((m) => m.toFixed(2)).join(",")}, scrollW ${d.scrollW}/${d.innerW}`).join(" | ")}; alias underline ${underline.toFixed(2)}:1`,
  );
}

const ridesTheCap = (d: Trail): boolean => {
  if (!d.where || !d.drawer || !d.trailInk || !d.firstDoorInk) return false;
  const inkBottom = Math.max(d.trailInk.bottom, d.alsoInk?.bottom ?? 0);
  return d.where.y >= d.bandH && d.where.x >= d.drawer.x && d.where.right <= d.drawer.right && inkBottom <= d.firstDoorInk.y
    && d.trailInk.y - d.where.y <= 1 && (d.alsoInk === null || d.alsoInk.y >= d.trailInk.bottom)
    && d.crumbs.length > 1 && d.crumbs.every((n) => n === 1) && d.crumbWrap.every((w) => w === "nowrap") && d.links.every((l) => l.hit)
    && d.doors.length === 7 && d.doors.filter((x) => x.bottom <= d.innerH).every((x) => x.hit);
};

export async function dr15Drawer(k: TrailKit): Promise<void> {
  const { check, setMobileViewport } = k;
  const rows: string[] = [];
  let ok = true;
  for (const [w, h, pages] of [[390, 844, ["/faq/", "/explorer/", "/prospect/", "/ribbon/"]], [768, 1024, ["/prospect/", "/ribbon/"]]] as const) {
    await setMobileViewport(w, h);
    for (const page of pages) {
      const d = await openDrawer(k, page);
      ok &&= ridesTheCap(d);
      rows.push(`${w} ${page}: where ${JSON.stringify(d.where)} trail top ${d.trailInk?.y.toFixed(1)} band ${d.bandH.toFixed(1)} crumbs ${d.crumbs.join("")} ${d.crumbWrap.join("/")} links ${d.links.map((l) => l.hit).join(",")} doors ${d.doors.filter((x) => x.hit).length}/${d.doors.length}`);
    }
  }
  const under = await underTheBlock(k);
  await setMobileViewport(390, 844);
  check(
    "DR15 with the drawer open by a real tap, at 390 on the FAQ, the Explorer, the Prospect and the Ribbon and at 768 on the Prospect and the Ribbon, the trail block rides in the cap at or below the band, inside the drawer, its alias line clear of the trail, each crumb whole on one line, every trail link and every door in view taking the hand; and at 844x390, with the alias line lengthened until the block reaches past the cap, a door lying under the block does not answer through it (Issue #668)",
    ok && under.reaches && !under.doorAnswers,
    `${rows.join(" | ")}; under the block at 844x390: ${JSON.stringify(under)}`,
  );
}

async function underTheBlock(k: TrailKit): Promise<{ reaches: boolean; doorAnswers: boolean; at: { x: number; y: number } | null }> {
  await k.setMobileViewport(844, 390);
  await openDrawer(k, "/prospect/");
  await k.evaluate(`document.querySelector("header.chrome .also a").textContent += " by the long road round the coast and back over the hills"`);
  const d = await k.evaluate(READ);
  if (!d.where || d.where.bottom <= d.capBottom) return { reaches: false, doorAnswers: false, at: null };
  const at = { x: Math.round(d.where.x + 20), y: Math.round((d.capBottom + d.where.bottom) / 2) };
  const doorAnswers = await k.evaluate<boolean>(`(() => { const e = document.elementFromPoint(${at.x}, ${at.y}); return !!e && !!e.closest("header.chrome nav.rooms"); })()`);
  return { reaches: true, doorAnswers, at };
}

export async function dr16SheetUp(k: TrailKit): Promise<void> {
  const { evaluate, check, waitReady } = k;
  await k.goto("/explorer/");
  await waitReady();
  const before = await evaluate(READ);
  const handle = await evaluate<Box | null>(`(() => { const e = document.querySelector(".slip-handle"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; })()`);
  if (handle) await tapAt(k, handle.x + handle.w / 2, handle.y + handle.h / 2);
  const up = await k.settle(READ, (d) => d.whereVisibility === "hidden", "the trail stands aside under the open sheet");
  const sheetOpen = await evaluate<boolean>(`!!document.querySelector(".slip.open")`);
  if (up.burger) await tapAt(k, up.burger.x + up.burger.w / 2, up.burger.y + up.burger.h / 2);
  const drawer = await k.settle(READ, (d) => d.checked && d.whereVisibility === "visible", "the trail rides the drawer though the sheet is up");
  check(
    "DR16 on a chart room at 390 the trail stands aside while the phone sheet is up, its links no longer answering, and comes back in the drawer's cap when the nav is opened over the sheet; before the sheet it is there, which is the same-run control (Alex, 2026-10-03, on Issue #668)",
    before.whereVisibility === "visible" && before.links.every((l) => l.hit) && !!handle && sheetOpen && up.links.every((l) => !l.hit) && drawer.links.every((l) => l.hit) && drawer.links.length > 0,
    `before ${before.whereVisibility} ${before.links.map((l) => l.hit).join(",")}; handle ${handle ? "found" : "MISSING"}, sheet open ${sheetOpen}, trail ${up.whereVisibility} ${up.links.map((l) => l.hit).join(",")}; drawer over the sheet ${drawer.whereVisibility} ${drawer.links.map((l) => l.hit).join(",")}`,
  );
}

type Fit = { top: number; w: number; h: number; checked: boolean; innerW: number };
const FIT: Payload<Fit> = `(() => { const s = document.getElementById("sheet").getBoundingClientRect(); return { top: s.top, w: s.width, h: s.height, checked: !!document.querySelector(".rooms-reveal")?.checked, innerW: innerWidth }; })()`;
const restingFit = (k: TrailKit, label: string, checked: boolean, innerW: number) => k.settle(FIT, (d, last) => d.checked === checked && d.innerW === innerW && d.w > 0 && last !== null && d.top === last.top && d.w === last.w && d.h === last.h, label);

export async function dr17Refit(k: TrailKit): Promise<void> {
  const { check, setMobileViewport, send } = k;
  await setMobileViewport(430, 844);
  await k.goto("/prospect/");
  const fresh = await restingFit(k, "a fresh Prospect at 430", false, 430);
  await setMobileViewport(390, 844);
  await k.goto("/prospect/");
  const shut = await restingFit(k, "the Prospect at 390", false, 390);
  const burger = (await k.evaluate(READ)).burger;
  if (burger) await tapAt(k, burger.x + burger.w / 2, burger.y + burger.h / 2);
  const open = await restingFit(k, "the drawer open at 390", true, 390);
  await setMobileViewport(430, 844);
  await restingFit(k, "the drawer still open at 430", true, 430);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  const closed = await restingFit(k, "the drawer closed at 430", false, 430);
  await setMobileViewport(390, 844);
  const near = (a: Fit, b: Fit) => Math.abs(a.top - b.top) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5;
  check(
    "DR17 the open drawer lifts the trail out of the cluster, so the chart does not refit while it is open, and a resize made while it was open is fitted when it closes: the Prospect opened at 390, resized to 430 and closed sits where a fresh 430 load puts it (Issue #668, the cold review's round 2)",
    near(open, shut) && near(closed, fresh) && !near(fresh, shut),
    JSON.stringify({ shut, open, fresh, closed }),
  );
}
