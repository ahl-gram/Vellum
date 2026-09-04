import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { SITE_PALETTE } from "../../src/atlas/palette.ts";
import { veilMarkup } from "../../src/site/home/veil.ts";
import {
  buildOgCard,
  fontFaceCss,
  OG_FONT_FACES,
  OG_HEIGHT,
  OG_HOOK_LINES,
  OG_TAGLINE,
  OG_WIDTH,
  OG_WORDMARK,
} from "../../src/render/og-card.ts";

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");

const chart = renderMap(generateWorld(defaultRecipe(42)), { style: "antique", legend: false });
const card = buildOgCard(chart);

const SC_FACE = "'IM Fell English SC'";
const ITALIC_FACE = "'IM Fell English'";

const FEED_WIDTH = 500;
const LEGIBLE_ROWS = 8;
// measured 2026-09-03 (canvas measureText actualBoundingBoxAscent at 100px from the embedded woff2, headless Brave): italic x 0.4453; SC small caps m 0.4512, n 0.4385, z 0.4443; rounded down so the floor errs strict
const FELL_ITALIC_X_HEIGHT = 0.44;
const FELL_SC_SMALL_CAP = 0.44;

const token = (name: string): string => SITE_PALETTE[`--${name}` as keyof typeof SITE_PALETTE];

function attr(tag: string, name: string): string | undefined {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
}

function num(tag: string, name: string): number {
  const v = attr(tag, name);
  assert.ok(v !== undefined, `${name} is set on ${tag.slice(0, 60)}`);
  return Number(v);
}

function textTag(svg: string, content: string): string {
  const escaped = content.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hits = [...svg.matchAll(new RegExp(`<text\\b[^>]*>${escaped}</text>`, "g"))];
  assert.equal(hits.length, 1, `exactly one <text> reads "${content}"`);
  return hits[0][0];
}

function nestedSvgTag(svg: string, marker: string): string {
  const at = svg.indexOf(marker);
  assert.ok(at > -1, `the card carries ${marker}`);
  const open = svg.lastIndexOf("<svg", at);
  return svg.slice(open, svg.indexOf(">", at) + 1);
}

function roseMarkup(svg: string): string {
  const open = nestedSvgTag(svg, 'class="veil-rose"');
  const start = svg.indexOf(open);
  return svg.slice(start, svg.indexOf("</svg>", start) + "</svg>".length);
}

function veilRose(): string {
  const veil = veilMarkup();
  const start = veil.indexOf("<svg");
  return veil.slice(start, veil.indexOf("</svg>", start));
}

function mix(a: string, b: string, wa: number): string {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return "#" + [1, 3, 5].map((i) => Math.round(ch(a, i) * wa + ch(b, i) * (1 - wa)).toString(16).padStart(2, "0")).join("");
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

const lightestStop = (svg: string): string =>
  /<radialGradient\b[^>]*id="veil-deep"[^>]*>\s*<stop offset="0" stop-color="([^"]+)"/.exec(svg)?.[1] ?? "";

const atFeed = (size: number, ratio: number): number => (size * ratio * FEED_WIDTH) / OG_WIDTH;

test("the OG card is a 1200x630 SVG document", () => {
  assert.equal(OG_WIDTH, 1200);
  assert.equal(OG_HEIGHT, 630);
  // The root <svg> must carry integer width/height in that order so the headless rasterizer's svgDimensions() regex can read them.
  const rootTag = /^<svg\b[^>]*\swidth="(\d+)"[^>]*\sheight="(\d+)"/.exec(card);
  assert.ok(rootTag, "card should open with an <svg> carrying width then height");
  assert.equal(rootTag[1], "1200");
  assert.equal(rootTag[2], "630");
  assert.match(card, /viewBox="0 0 1200 630"/);
  assert.ok(card.trimEnd().endsWith("</svg>"));
});

test("the ground is the veil's walnut deep, painted first, its hexes the site palette's", () => {
  const firstRect = /<rect\b[^>]*>/.exec(card)?.[0] ?? "";
  assert.equal(attr(firstRect, "width"), "1200");
  assert.equal(attr(firstRect, "height"), "630");
  assert.equal(attr(firstRect, "fill"), "url(#veil-deep)");
  assert.ok(!card.includes(`<rect width="1200" height="630" fill="${token("parchment")}"`), "the parchment sheet is no longer the ground");
  const gradient = /<radialGradient\b[^>]*id="veil-deep"[^>]*>([\s\S]*?)<\/radialGradient>/.exec(card);
  assert.ok(gradient, "the deep is a radial gradient");
  const stops = [...gradient[1].matchAll(/stop-color="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(stops, [mix(token("ink-dark"), token("parchment"), 0.9), token("ink-dark"), token("chart-ink")]);
});

test("the wordmark is typed Vellum, centred, in IM Fell English SC alone (a failed face load must look wrong, not plausible)", () => {
  assert.equal(OG_WORDMARK, "Vellum");
  assert.ok(veilMarkup().includes(">Vellum<"), "the veil types it the same way");
  assert.ok(!card.includes(">VELLUM<"), "no uppercased wordmark: in an SC face that is full caps");
  const tag = textTag(card, "Vellum");
  assert.equal(attr(tag, "x"), "600");
  assert.equal(attr(tag, "text-anchor"), "middle");
  assert.equal(attr(tag, "font-family"), SC_FACE, "the SC face with no fallback stack behind it");
  assert.equal(attr(tag, "letter-spacing"), (num(tag, "font-size") * 0.14).toFixed(2), "letter-spacing is the veil's 0.14em, two decimals");
});

test("the tagline sits beneath the wordmark in IM Fell English italic alone", () => {
  assert.ok(veilMarkup().includes(OG_TAGLINE), "the tagline is the veil's own line");
  const tag = textTag(card, OG_TAGLINE);
  assert.equal(attr(tag, "x"), "600");
  assert.equal(attr(tag, "text-anchor"), "middle");
  assert.equal(attr(tag, "font-style"), "italic");
  assert.equal(attr(tag, "font-family"), ITALIC_FACE, "the italic face, not the SC one, with no fallback stack");
  assert.ok(num(tag, "y") > num(textTag(card, "Vellum"), "y"), "the tagline is below the wordmark");
});

test("the rose is the veil's own markup, once, settled: rings drawn, rays faded in, needle at 16deg", () => {
  assert.equal((card.match(/class="veil-rose"/g) ?? []).length, 1, "exactly one rose");
  const rose = roseMarkup(card);
  const source = veilRose();
  for (const d of [...source.matchAll(/d="([^"]+)"/g)].map((m) => m[1])) {
    assert.ok(rose.includes(`d="${d}"`), `the card's rose keeps the veil's path ${d}`);
  }
  for (const circle of [...source.matchAll(/cx="60" cy="60" r="[^"]+"/g)].map((m) => m[0])) {
    assert.ok(rose.includes(circle), `the card's rose keeps the veil's circle ${circle}`);
  }
  assert.ok(!rose.includes("stroke-dashoffset") && !rose.includes("stroke-dasharray"), "settled: the rings are fully drawn");
  const needle = /<path\b[^>]*d="M60 18 L66 60 L60 102 L54 60 Z"[^>]*>/.exec(rose)?.[0] ?? "";
  assert.equal(attr(needle, "transform"), "rotate(16 60 60)", "the needle rests where needle-settle ends");
  assert.equal(attr(needle, "fill"), token("parchment"));
  const rays = /<g\b[^>]*opacity="([^"]+)"[^>]*>/.exec(rose);
  assert.equal(rays?.[1], "0.75", "the rays sit at rose-fade's end");
  assert.ok(rose.includes(`stroke="${token("line-tan")}"`), "rings and rays are line-tan");
  const open = nestedSvgTag(card, 'class="veil-rose"');
  assert.equal(attr(open, "viewBox"), "0 0 120 120");
  assert.equal(num(open, "x") + num(open, "width") / 2, 600, "the rose is centred");
  const tagline = textTag(card, OG_TAGLINE);
  const hook = textTag(card, OG_HOOK_LINES[0]);
  assert.ok(num(open, "y") > num(tagline, "y"), "the rose is below the tagline");
  assert.ok(num(open, "y") + num(open, "height") < num(hook, "y"), "the rose is above the hook");
});

test("the seed-42 chart is ghosted full-bleed behind the lettering, once", () => {
  assert.equal((card.match(/data-vellum-seed=/g) ?? []).length, 1, "exactly one chart");
  const ghost = nestedSvgTag(card, 'data-vellum-seed="42"');
  const opacity = num(ghost, "opacity");
  assert.ok(opacity > 0 && opacity < 1, `ghosted: opacity ${opacity} is below 1`);
  assert.ok(num(ghost, "x") <= 0 && num(ghost, "y") <= 0, "the ghost starts at or before the card's corner");
  assert.ok(num(ghost, "x") + num(ghost, "width") >= OG_WIDTH, "the ghost reaches the right edge");
  assert.ok(num(ghost, "y") + num(ghost, "height") >= OG_HEIGHT, "the ghost reaches the bottom edge");
  assert.equal(attr(ghost, "preserveAspectRatio"), "xMidYMid slice");
  const own = /<svg\b[^>]*\swidth="(\d+)"[^>]*\sheight="(\d+)"/.exec(chart)!;
  assert.equal(num(ghost, "width"), Number(own[1]), "the ghost is the chart at its own scale");
  assert.equal(num(ghost, "height"), Number(own[2]));
  assert.equal(num(ghost, "x"), (OG_WIDTH - Number(own[1])) / 2, "centred on the card");
  assert.equal(num(ghost, "y"), (OG_HEIGHT - Number(own[2])) / 2);
  assert.ok(card.indexOf(ghost) < card.indexOf(textTag(card, "Vellum")), "the chart is painted before the lettering");
  assert.ok(card.indexOf(ghost) > card.indexOf("url(#veil-deep)"), "the chart is painted over the deep");
});

test("the foot line is the homepage hook, as written, in spaced small caps, broken where the page breaks it", () => {
  assert.deepEqual(OG_HOOK_LINES, ["Give Vellum a number.", "It gives you back a world."]);
  assert.ok(read("src/pages/index.astro").includes(OG_HOOK_LINES.join("<br>")), "the card breaks the hook where the homepage does, and its words are the page's");
  assert.ok(!card.includes("GIVE VELLUM"), "the hook is not uppercased: the SC face sets the small caps");
  const lines = OG_HOOK_LINES.map((l) => textTag(card, l));
  for (const tag of lines) {
    assert.equal(attr(tag, "x"), "600");
    assert.equal(attr(tag, "text-anchor"), "middle");
    assert.equal(attr(tag, "font-family"), SC_FACE, "the hook wears the SC face alone");
    assert.equal(attr(tag, "letter-spacing"), (num(tag, "font-size") * 0.3).toFixed(2), "spaced: the veil-status 0.3em, two decimals");
  }
  assert.ok(num(lines[1], "y") > num(lines[0], "y"), "the second line sits below the first");
});

test("the ratified sizes and inks (#490 round 2): wordmark 100 parchment-bright, tagline 50 parchment, hook 48 parchment, rose 132", () => {
  const wordmark = textTag(card, OG_WORDMARK);
  assert.equal(attr(wordmark, "font-size"), "100");
  assert.equal(attr(wordmark, "fill"), token("parchment-bright"));
  const tagline = textTag(card, OG_TAGLINE);
  assert.equal(attr(tagline, "font-size"), "50");
  assert.equal(attr(tagline, "fill"), token("parchment"));
  for (const line of OG_HOOK_LINES) {
    const tag = textTag(card, line);
    assert.equal(attr(tag, "font-size"), "48");
    assert.equal(attr(tag, "fill"), token("parchment"));
  }
  assert.equal(attr(nestedSvgTag(card, 'class="veil-rose"'), "width"), "132");
});

test("every line clears WCAG against the deep's lightest stop, with and without the ghost's wash (#490 round 2)", () => {
  const stop = lightestStop(card);
  assert.match(stop, /^#[0-9a-f]{6}$/, "the deep's first stop is a hex");
  const washed = mix(token("chart-paper"), stop, num(nestedSvgTag(card, 'data-vellum-seed="42"'), "opacity"));
  const floors: ReadonlyArray<readonly [string, number]> = [[OG_WORDMARK, 3], [OG_TAGLINE, 4.5], ...OG_HOOK_LINES.map((l) => [l, 4.5] as const)];
  for (const [content, floor] of floors) {
    const ink = attr(textTag(card, content), "fill")!;
    for (const ground of [stop, washed]) {
      const ratio = contrast(ink, ground);
      assert.ok(ratio >= floor, `"${content}" in ${ink} on ${ground}: ${ratio.toFixed(2)}:1, floor ${floor}:1`);
    }
  }
});

test("legible at feed width: the tagline's x-height and the hook's small caps clear 8 rows at 500 wide (#490 round 2)", () => {
  const tagline = atFeed(num(textTag(card, OG_TAGLINE), "font-size"), FELL_ITALIC_X_HEIGHT);
  assert.ok(tagline >= LEGIBLE_ROWS, `tagline x-height at ${FEED_WIDTH} wide: ${tagline.toFixed(2)}px, floor ${LEGIBLE_ROWS}px`);
  for (const line of OG_HOOK_LINES) {
    const caps = atFeed(num(textTag(card, line), "font-size"), FELL_SC_SMALL_CAP);
    assert.ok(caps >= LEGIBLE_ROWS, `hook small caps at ${FEED_WIDTH} wide: ${caps.toFixed(2)}px, floor ${LEGIBLE_ROWS}px`);
  }
});

test("the two Fell faces travel inside the card as data: @font-face rules, no Garamond", () => {
  assert.deepEqual(
    OG_FONT_FACES.map((f) => [f.family, f.style]),
    [["IM Fell English SC", "normal"], ["IM Fell English", "italic"]],
  );
  const declared = read("public/fonts.css");
  const css = OG_FONT_FACES.map((face) => {
    assert.match(declared, new RegExp(`font-family: '${face.family}';\\s*font-style: ${face.style};`), `${face.family} ${face.style} is a face fonts.css serves`);
    const b64 = readFileSync(root(`public/fonts/${face.file}`)).toString("base64");
    const rule = fontFaceCss(face, b64);
    assert.match(rule, /^@font-face\s*\{/);
    assert.match(rule, new RegExp(`font-family:\\s*'${face.family}';`));
    assert.match(rule, new RegExp(`font-style:\\s*${face.style};`));
    assert.match(rule, /font-weight:\s*400;/);
    assert.ok(rule.includes(`url(data:font/woff2;base64,${b64}) format("woff2")`), `${face.file} rides along as a data: url`);
    return rule;
  }).join("\n");
  const embedded = buildOgCard(chart, { fontCss: css });
  const style = /<style>([\s\S]*?)<\/style>/.exec(embedded);
  assert.ok(style, "the font css sits in a <style>");
  assert.equal((style[1].match(/@font-face/g) ?? []).length, 2);
  assert.ok(embedded.indexOf("<style>") < embedded.indexOf("<text"), "the faces are declared before any lettering");
  assert.ok(!card.includes("<style"), "no fontCss, no <style>: the builder stays string in, string out");
});

test("the card copy contains no em-dash (published-copy rule)", () => {
  assert.ok(!card.includes("—"), "OG card copy must not contain em-dashes");
  const custom = buildOgCard(chart, { tagline: "a tagline", footnote: ["a footnote", "a second"] });
  assert.ok(custom.includes(">a tagline<") && custom.includes(">a footnote<") && custom.includes(">a second<"), "the copy options still override");
  assert.ok(!custom.includes("—"));
});
