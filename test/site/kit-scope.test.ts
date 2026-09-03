import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { globSync } from "node:fs";
import { resolve } from "node:path";

// #487's guard, the #302 precedent's inverse (skeptic on PR #491, finding 2): the kit sheet is linked on every page, so a kit rule on a class HOME also authors leaks onto home unless the rule is scoped to a room. The blocking instance was `.stage`: home's landfall stage wears the class, and the kit's unscoped landing scaled it under the camera.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

const classesIn = (astro: string): Set<string> =>
  new Set([...astro.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c && !c.includes("{")));

const rulesIn = (css: string): string[] =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{[^{}]*\}/g)].map((m) => m[1].trim()).filter((s) => !s.startsWith("@") && !/^\d|^from$|^to$/.test(s));

const SCOPED = /(^|\s)body\.(?:chart-room|room)\b/;

const offendersIn = (css: string, home: Set<string>): string[] =>
  rulesIn(css).flatMap((selector) => selector.split(",").map((s) => s.trim())).filter((arm) => {
    const classes = [...arm.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]);
    return classes.length > 0 && classes.every((c) => home.has(c)) && !SCOPED.test(arm);
  });

/** #487 allows the kit to split ("or a few: slip, legend, chrome"): every atelier*.css on disk is a kit sheet and is swept. */
const kitSheets = (): string[] => readdirSync(resolve(REPO, "public")).filter((f) => /^atelier.*\.css$/.test(f)).map((f) => `public/${f}`);

/** The pages that do not wear the kit on purpose: home and every room not yet converted (no chartRoom, no open desk); the kit sheet is linked on all of them. */
const unconvertedPages = (): string[] =>
  globSync("src/pages/**/index.astro", { cwd: REPO }).filter((p) => { const src = read(p); return !/\bchartRoom\b/.test(src) && !src.includes('desk="open"'); });

test("every kit rule on a class an unconverted page wears is scoped to a room (#487, the #302 inverse)", () => {
  const sheets = kitSheets();
  const pages = unconvertedPages();
  assert.ok(sheets.includes("public/atelier.css"), "the kit's sheet is on disk");
  assert.deepEqual(pages, ["src/pages/index.astro"], "since #464 every room wears the kit, so home alone is swept (it wears .stage)");
  for (const page of pages) {
    const worn = classesIn(read(page));
    for (const sheet of sheets) {
      assert.deepEqual(offendersIn(read(sheet), worn), [], `${sheet} reaches a class ${page} wears; scope it to body.chart-room (or body.room)`);
    }
  }
});

test("the guard can see an unscoped collision: the offender loop itself reads a planted .stage rule, and not its scoped twin", () => {
  const home = classesIn(read("src/pages/index.astro"));
  assert.ok(home.has("stage"), "home's landfall stage still wears the class the collision was found on");
  assert.deepEqual(offendersIn(".stage { position: fixed; } body.chart-room .stage { inset: 0; } .folio-controls .control { width: 1px; } .stage .sheet { color: red; }", home), [".stage", ".stage .sheet"], "a bare rule and a compound of home classes both red; a compound with a kit-only class does not");
});

/** The classes a page wears THROUGH the kit components it renders: the components' own literal classes. */
const componentWorn = (astro: string): Set<string> =>
  new Set([...astro.matchAll(/<(Fog|Vignettes|Glass|ChartFolio|ChartStage|LegendButton|Slip|RoomFolio)\b/g)].flatMap((m) => [...classesIn(read(`src/layouts/${m[1]}.astro`))]));

// What a kit arm may set on a class a page wears through a component: dress, which is why the page renders it. A seat, a depth, a ceremony, a pointer policy or a ring must be stood down by the page's own rule for that component, or it is a leak the literal sweep above cannot see (#505, skeptic on PR #508).
const DRESS = new Set(["display", "flex-direction", "gap", "align-items", "transition", "line-height", "width", "height", "font-family", "font-size", "color", "background", "border", "cursor", "text-align"]);

/** Top-level commas only: a comma inside :is() or :where() does not start a new arm. */
const splitArms = (list: string): string[] => {
  const arms: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) { arms.push(list.slice(start, i).trim()); start = i + 1; }
  }
  return [...arms, list.slice(start).trim()];
};

const leaksIn = (css: string, worn: Set<string>, stoodDown: Set<string>): string[] =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((m) =>
    splitArms(m[1]!).flatMap((arm) => {
      if (arm.startsWith("@") || SCOPED.test(arm) || arm.includes("body:has") || /(^|\s)[a-z]+\./.test(arm)) return [];
      const classes = [...arm.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((x) => x[1]!);
      if (classes.length === 0 || !classes.every((c) => worn.has(c))) return [];
      return [...m[2]!.matchAll(/([a-z-]+)\s*:/g)].map((x) => x[1]!).filter((p) => !DRESS.has(p) && !stoodDown.has(p)).map((p) => `${arm} { ${p} }`);
    }));

test("home wears the kit's camera through the component alone (#505), and every non-dress property the kit's arms set on those classes is stood down by home's own seat", () => {
  const src = read("src/pages/index.astro");
  assert.equal((src.match(/<Glass /g) ?? []).length, 1);
  const worn = componentWorn(src);
  const literal = classesIn(src);
  for (const c of ["chrome", "corner", "br", "zoomery", "zoom-btn"]) {
    assert.ok(worn.has(c), `home wears .${c} through the Glass`);
    assert.ok(!literal.has(c), `home does not author .${c} itself (a pasted copy would put the corner's arms into the sweep above)`);
  }
  const home = read("public/index.css");
  const seat = home.match(/#lf-controls\s*\{([^}]*)\}/)?.[1] ?? "";
  const stoodDown = new Set([...seat.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]!));
  if (/#lf-controls button:focus-visible\s*\{[^}]*outline-color:/.test(home)) stoodDown.add("outline-color");
  for (const sheet of kitSheets()) assert.deepEqual(leaksIn(read(sheet), worn, stoodDown), [], `${sheet} reaches home's camera with a property home neither wears as dress nor stands down`);
});

test("the component-worn sweep can see a leak: a planted seat and a planted ring on .corner both red, a dress rule does not", () => {
  const worn = new Set(["corner", "zoomery", "zoom-btn"]);
  assert.deepEqual(leaksIn(".corner { top: 0; } .corner :is(a, button):focus-visible { outline-color: red; } .zoom-btn { color: red; } body.chart-room .corner { top: 1px; } header.chrome { top: 2px; }", worn, new Set(["position"])), [".corner { top }", ".corner :is(a, button):focus-visible { outline-color }"]);
  assert.deepEqual(leaksIn(".corner { position: fixed; }", worn, new Set(["position"])), [], "and a stood-down property passes");
});
