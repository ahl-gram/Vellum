// The shell every page wears, read on the sweep's one visit to each shelled page (Issue #779 part 2f, the source-text tests moved here): the walnut deep, the faces and their roles, the prefetch, the shell authored once, the sheet order, the nav's own mark, the robots line, the text size and the trail's inks.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { NAV_ITEMS } from "../../../src/layouts/nav.ts";
import { REPO } from "../../support/runner.ts";
import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import type { Rgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { SHELLED } from "./reads.ts";
import type { RunningHeadKit } from "./kit.ts";

export type Shell = {
  body: string;
  deep: {
    body: string;
    position: string;
    stops: [number[], string][];
    band: string | null;
    clip: string | null;
    bandH: number;
  };
  prefetch: string[];
  counts: { titles: number; headers: number; rooms: number; footers: number; metasOutsideHead: number };
  sheets: string[];
  current: { display: string; colour: number[]; line: string } | null;
  robots: string | null;
  textSize: string;
  inks: number[][];
  faces: string[];
};
export type Shells = Record<string, Shell | undefined>;

export const SHELL_READ: Payload<Promise<Shell>> = `document.fonts.ready.then(() => {
  const rgba = ${PAGE_RGBA};
  const band = document.querySelector(".band"), root = getComputedStyle(document.documentElement);
  const current = document.querySelector("header.chrome nav.rooms [aria-current='page']"), cs = current && getComputedStyle(current);
  const shellMeta = [...document.querySelectorAll("meta[property^='og:'], meta[name^='twitter:']")];
  return {
    body: getComputedStyle(document.body).fontFamily,
    deep: { body: getComputedStyle(document.body, "::before").backgroundImage, position: getComputedStyle(document.body, "::before").position,
      stops: (getComputedStyle(document.body, "::before").backgroundImage.match(/(color|rgba?|oklab)\\([^)]*\\) [\\d.]+%/g) ?? []).map((s) => { const m = /^(.*\\)) ([\\d.]+%)$/.exec(s); return [rgba(m[1]), m[2]]; }),
      band: band && getComputedStyle(band, "::before").backgroundImage, clip: band && getComputedStyle(band, "::before").clipPath,
      bandH: parseFloat(root.getPropertyValue("--band-h")) * parseFloat(root.fontSize) },
    prefetch: [...document.querySelectorAll("link[rel='prefetch']")].map((l) => l.getAttribute("href")),
    counts: { titles: [...document.querySelectorAll("title")].filter((t) => !t.closest("svg")).length, headers: document.querySelectorAll("header").length,
      rooms: document.querySelectorAll("nav.rooms").length, footers: document.querySelectorAll("footer").length,
      metasOutsideHead: shellMeta.filter((m) => !document.head.contains(m)).length },
    sheets: [...document.styleSheets].filter((s) => s.href).map((s) => new URL(s.href).pathname),
    current: cs && { display: cs.display, colour: rgba(cs.color), line: cs.textDecorationLine },
    robots: document.querySelector("meta[name='robots']")?.getAttribute("content") ?? null,
    textSize: root.getPropertyValue("text-size-adjust"),
    inks: [...document.querySelectorAll(".trail a, .trail .way, .trail [aria-current='page'], .trail .here, .also, .also a")].map((e) => rgba(getComputedStyle(e).color)),
    faces: performance.getEntriesByType("resource").map((e) => new URL(e.name).pathname).filter((p) => p.endsWith(".woff2")),
  };
})`;

type Check = SuiteContext["check"];
const offenders = (shells: Shells, ok: (s: Shell, route: string) => boolean): string[] =>
  SHELLED.filter((r) => !shells[r] || !ok(shells[r], r));

const INK = tokenRgba("--ink-dark");
const LIT = tokenRgba("--parchment");
// The deep's five stops: the vignette, clear ink-dark at 40% to chart ink at 0.55, then the walnut, the ink-dark lit a tenth by parchment, ink-dark at 55%, chart ink.
const DEEP_STOPS: readonly [Rgba, string][] = [
  [tokenRgba("--ink-dark", 0), "40%"],
  [tokenRgba("--chart-ink", 0.55), "100%"],
  [[0, 1, 2].map((i) => Math.round(0.9 * INK[i]! + 0.1 * LIT[i]!)).concat(255) as unknown as Rgba, "0%"],
  [INK, "55%"],
  [tokenRgba("--chart-ink"), "100%"],
];
const stopOk = ([got, at]: [number[], string], [want, wantAt]: [Rgba, string]) =>
  at === wantAt && (want[3] === 0 ? got[3] === 0 : nearRgba(got, want));
const walnut = (d: Shell["deep"] | undefined) =>
  !!d &&
  d.band === d.body &&
  (d.body.match(/radial-gradient\(/g) ?? []).length === 2 &&
  d.body.startsWith("radial-gradient(120% 90% at 50% 30%") &&
  d.body.includes("radial-gradient(80% 70% at 30% 20%") &&
  d.stops.length === DEEP_STOPS.length &&
  d.stops.every((s, i) => stopOk(s, DEEP_STOPS[i]!)) &&
  d.position === "fixed" &&
  !!d.clip &&
  d.clip.includes(`calc(100% - ${d.bandH}px)`);

export function rh11Deep(check: Check, shells: Shells): void {
  const banded = ["/faq/", "/glossary/"].map((r) => shells[r]?.deep);
  check(
    "RH11 the walnut deep is ONE ground: on each banded room the fixed ground layer and the band paint the same two radials, the darkening vignette over the lit walnut, every stop at its token's colour and place, and the band clips that deep to the band's height (Issue #461 ruling 2)",
    banded.every(walnut),
    JSON.stringify(banded),
  );
}

export function rh15BodyFace(check: Check, shells: Shells): void {
  const off = offenders(shells, (s) => /^"EB Garamond",/.test(s.body));
  check(
    "RH15 the body speaks in the body face on every shelled page (Issue #263)",
    off.length === 0,
    off.map((r) => `${r}: ${shells[r]?.body}`).join(" | ") || `${SHELLED.length} pages`,
  );
}

export function rh16Prefetch(check: Check, shells: Shells): void {
  const want = (route: string) => ["/", ...NAV_ITEMS.map((i) => i.href)].filter((h) => h !== route);
  const off = offenders(shells, (s, r) => JSON.stringify(s.prefetch) === JSON.stringify(want(r)));
  check(
    "RH16 every shelled page prefetches home and every room in the nav but itself, in the nav's order, so a first click commits at once (Issue #329)",
    off.length === 0,
    off.map((r) => `${r}: ${JSON.stringify(shells[r]?.prefetch)}`).join(" | ") || `${SHELLED.length} pages`,
  );
}

export function rh17ShellOnce(check: Check, shells: Shells): void {
  const off = offenders(
    shells,
    ({ counts: c }) => c.titles === 1 && c.headers === 1 && c.rooms === 1 && c.footers <= 1 && c.metasOutsideHead === 0,
  );
  check(
    "RH17 the shell is authored once: every shelled page carries one title, one header, one rooms nav, at most one footer, and its share meta in the head alone",
    off.length === 0,
    off.map((r) => `${r}: ${JSON.stringify(shells[r]?.counts)}`).join(" | ") || `${SHELLED.length} pages`,
  );
}

const SHELL_SHEETS = new Set(["/fonts.css", "/motion.css", "/house.css", "/atelier.css", "/shell.css"]);

export function rh18HouseSheet(check: Check, shells: Shells): void {
  const off = offenders(shells, ({ sheets }) => {
    const own = sheets.flatMap((p, i) => (SHELL_SHEETS.has(p) ? [] : [i]));
    const house = sheets.indexOf("/house.css");
    return (
      sheets.indexOf("/motion.css") >= 0 &&
      sheets.indexOf("/motion.css") < house &&
      own.length > 0 &&
      own.every((i) => i > house)
    );
  });
  check(
    "RH18 every shelled page links the house sheet after motion.css and before any sheet of its own, so a page keeps the last word on layout (Issue #324)",
    off.length === 0,
    off.map((r) => `${r}: ${JSON.stringify(shells[r]?.sheets)}`).join(" | ") || `${SHELLED.length} pages`,
  );
}

export function rh19MarksAndRobots(check: Check, shells: Shells): void {
  const inNav = NAV_ITEMS.map((i) => i.href);
  const off = offenders(shells, (s, r) => {
    const mark =
      !inNav.includes(r) ||
      (!!s.current &&
        s.current.display === "inline-block" &&
        nearRgba(s.current.colour, tokenRgba("--parchment-bright")) &&
        s.current.line.split(" ").includes("underline"));
    return mark && s.robots === (r === "/specimen/" ? "noindex" : null);
  });
  check(
    "RH19 on every room in the nav its own label stands inline-block, brightened AND underlined, never colour alone, and the Specimen alone asks not to be indexed (Issues #461, #268, #487)",
    off.length === 0,
    off.map((r) => `${r}: ${JSON.stringify({ current: shells[r]?.current, robots: shells[r]?.robots })}`).join(" | ") ||
      `${inNav.length} marks, one noindex`,
  );
}

export function rh20TextSize(check: Check, shells: Shells): void {
  const off = offenders(shells, (s) => s.textSize === "100%");
  check(
    "RH20 every shelled page holds a phone's text at 100% inside the 1024 page (Issue #761; either spelling serves, Chromium reads them as one)",
    off.length === 0,
    off.map((r) => `${r}: ${shells[r]?.textSize}`).join(" | ") || `${SHELLED.length} pages`,
  );
}

const QUIET = [tokenRgba("--parchment"), tokenRgba("--parchment-bright")];

export function rh24TrailInks(check: Check, shells: Shells): void {
  const trailed = SHELLED.filter((r) => (shells[r]?.inks.length ?? 0) > 0);
  const off = offenders(shells, (s) => s.inks.every((c) => QUIET.some((q) => nearRgba(c, q))));
  check(
    "RH24 the trail is quiet by size and never by a dimmer ink: on every shelled page each trail link, separator, alias line and the page's own segment wears parchment or parchment-bright, both of which clear the deep (Issue #668)",
    off.length === 0 && trailed.length >= 5,
    off.map((r) => `${r}: ${JSON.stringify(shells[r]?.inks)}`).join(" | ") || `${trailed.length} trails`,
  );
}

type Face = { family: string; style: string; weight: string; display: string; src: string };
type Faces = { faces: Face[]; kit: Face[]; roles: string[]; digests: Record<string, string> };

const FACES_READ = (kitSheet: string, loaded: readonly string[]): Payload<Promise<Faces>> => `(async () => {
  const faceOf = (r) => ({ family: r.style.getPropertyValue("font-family"), style: r.style.getPropertyValue("font-style"), weight: r.style.getPropertyValue("font-weight"), display: r.style.getPropertyValue("font-display"), src: r.style.getPropertyValue("src") });
  const sheet = [...document.styleSheets].find((s) => s.href && new URL(s.href).pathname === "/fonts.css");
  const kit = new CSSStyleSheet();
  kit.replaceSync(${JSON.stringify(kitSheet)});
  const root = getComputedStyle(document.documentElement);
  const digests = {};
  for (const path of ${JSON.stringify(loaded)}) {
    const bytes = await (await fetch(path)).arrayBuffer();
    digests[path] = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return { faces: sheet ? [...sheet.cssRules].filter((r) => r instanceof CSSFontFaceRule).map(faceOf) : [],
    kit: [...kit.cssRules].filter((r) => r instanceof CSSFontFaceRule).map(faceOf),
    roles: ["--font-display", "--font-flourish", "--font-body"].map((v) => root.getPropertyValue(v)), digests };
})()`;

const SERVED = /^url\("\/fonts\/([a-z0-9-]+\.woff2)"\) format\("woff2"\)$/;
const kitDigest = (file: string): string | null => {
  try {
    return createHash("sha256")
      .update(readFileSync(`${REPO}/design/kit/fonts/${file}`))
      .digest("hex");
  } catch {
    return null;
  }
};

export async function rh14Faces({ evaluate, check, visit }: RunningHeadKit, shells: Shells): Promise<void> {
  const loaded = [...new Set(SHELLED.flatMap((r) => shells[r]?.faces ?? []))];
  const thin = offenders(shells, (s, r) => s.faces.length >= (r === "/faq/" ? 3 : 1));
  if (!(await visit("/faq/"))) throw new Error("RH14: the Q & A never loaded");
  const f = await evaluate(FACES_READ(readFileSync(`${REPO}/design/kit/fonts.css`, "utf8"), loaded), true);
  const files = f.faces.map((x) => SERVED.exec(x.src)?.[1] ?? null);
  const asServed = f.kit.map((x) => ({ ...x, src: x.src.replace('url("fonts/', 'url("/fonts/') }));
  const unkit = loaded.filter(
    (p) => f.digests[p] === undefined || f.digests[p] !== kitDigest(p.replace("/fonts/", "")),
  );
  check(
    "RH14 every face a page loads is a file of the kit, byte for byte, and the faces are served as the kit declares them: /fonts.css self-hosts the three families in six faces, each font-display swap from a same-origin /fonts/ file, the kit's own sheet declares the same six, the three role tokens fall back to the old serif stack, and every page loads a face (ruled 6055743231 item 7; Issue #228)",
    thin.length === 0 &&
      loaded.length >= 3 &&
      unkit.length === 0 &&
      f.faces.length === 6 &&
      new Set(f.faces.map((x) => x.family)).size === 3 &&
      f.faces.every((x) => x.display === "swap") &&
      files.every((x) => x !== null) &&
      JSON.stringify(asServed) === JSON.stringify(f.faces) &&
      f.roles.every((v) => v.includes('"Iowan Old Style"')),
    JSON.stringify({ thin, loaded, unkit, faces: f.faces, kit: f.kit, roles: f.roles }),
  );
}

const RING = (selector: string): Payload<{ visible: boolean; colour: number[] } | null> =>
  `(() => { const a = document.querySelector(${JSON.stringify(selector)}); if (!a) return null; a.focus(); const r = { visible: a.matches(":focus-visible"), colour: (${PAGE_RGBA})(getComputedStyle(a).outlineColor) }; a.blur(); return r; })()`;

export async function rh12FocusRing({ evaluate, send, check, visit }: RunningHeadKit): Promise<void> {
  if (!(await visit("/faq/"))) throw new Error("RH12: the Q & A never loaded");
  // A key first, so the browser takes the focus that follows as keyboard focus and :focus-visible applies.
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Shift", code: "ShiftLeft", windowsVirtualKeyCode: 16 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Shift", code: "ShiftLeft", windowsVirtualKeyCode: 16 });
  const chrome = await evaluate(RING("header.chrome a"));
  const paper = await evaluate(RING(".sheet a"));
  check(
    "RH12 the deep's focus ring: a keyboard-focused link in the head cluster rings in parchment-bright on the walnut, while a link on the paper keeps the house's ink-dark, read in the same run (Issue #324 decision 6, re-ratified at Issue #461)",
    !!chrome &&
      !!paper &&
      chrome.visible &&
      paper.visible &&
      nearRgba(chrome.colour, tokenRgba("--parchment-bright")) &&
      nearRgba(paper.colour, tokenRgba("--ink-dark")),
    JSON.stringify({ chrome, paper }),
  );
}

type Wordmark = { x: number; y: number; hovered: boolean; focused: boolean; moving: number; transform: string } | null;
const WORDMARK: Payload<Wordmark> = `(() => { const a = document.querySelector("header.chrome .wordmark a"); if (!a) return null; const b = a.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, hovered: a.matches(":hover"), focused: a.matches(":focus-visible"), moving: a.getAnimations().length, transform: getComputedStyle(a).transform }; })()`;

async function focusWordmark(k: RunningHeadKit): Promise<string> {
  await k.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Shift",
    code: "ShiftLeft",
    windowsVirtualKeyCode: 16,
  });
  await k.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Shift", code: "ShiftLeft", windowsVirtualKeyCode: 16 });
  await k.evaluate(`document.querySelector("header.chrome .wordmark a").focus()`);
  try {
    const rest = await makeSettle(k)(WORDMARK, (d) => d.focused && d.moving === 0, "wordmark-focus", 40);
    return rest.transform;
  } finally {
    await k.evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  }
}

async function hoverWordmark(k: RunningHeadKit): Promise<string> {
  const at = await k.evaluate(WORDMARK);
  if (!at) throw new Error("no wordmark link");
  await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y, button: "none" });
  try {
    const rest = await makeSettle(k)(WORDMARK, (d) => d.hovered && d.moving === 0, "wordmark-hover", 40);
    return rest.transform;
  } finally {
    await k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 700, button: "none" });
  }
}

const tipped = (m: string): boolean => {
  const v = /^matrix\(([^)]+)\)$/.exec(m)?.[1]?.split(", ").map(Number);
  return !!v && Math.abs(v[1]!) > 0.001 && v[5]! < 0;
};

export async function rh13WordmarkTip(k: RunningHeadKit): Promise<void> {
  if (!(await k.visit("/faq/"))) throw new Error("RH13: the Q & A never loaded");
  const room = await hoverWordmark(k);
  const keyed = await focusWordmark(k);
  if (!(await k.visit("/"))) throw new Error("RH13: home never loaded");
  const home = await hoverWordmark(k);
  const homeKeyed = await focusWordmark(k);
  k.check(
    "RH13 the wordmark tips on a room page, turned and lifted, under the hand and under keyboard focus alike, and stays still on home under both, where it names the page (Issue #289)",
    tipped(room) && tipped(keyed) && home === "none" && homeKeyed === "none",
    JSON.stringify({ room, keyed, home, homeKeyed }),
  );
}
