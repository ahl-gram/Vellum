// Issue #1248 round, item 6: the seal in tokens. The Issue #1155 round lit its seal with a raw red (`#a2392a`) beside `--iron-red`; each option dresses the seal on the Primer page (three steps sealed) and in the step's slip once done, and the numeral's contrast is read off the computed colours against the 4.5:1 floor at both sizes it is shown. Writes shots/6-seal/ and measure/6-seal.md.
// node out/1248/mock/seats-seal.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { primerJs, ringJs, styleJs, type StripOpts } from "./inject.ts";
import { EXPLORER } from "./ladder/explorer.ts";
import { shootWithCrops } from "./seats-crop.ts";
import { measureFile, pictureUrl, SHA, shotDir } from "./seats-paths.ts";

const islands = EXPLORER.lessons.find((l) => l.id === "land")!.steps[1]!;
const SEALED = new Set(["/explorer/#dice", "/explorer/#draw", "/explorer/#enter"]);
type Opt = { key: string; caption: string; ground: string; tokenCss: string };
const OPTS: Opt[] = [
  { key: "a-raw-red-as-drawn", caption: "A, as the Issue #1155 round drew it: a raw red for the light (#a2392a)", ground: "radial-gradient(circle at 35% 30%,#a2392a,var(--iron-red) 70%)", tokenCss: "" },
  { key: "b-a-named-token", caption: "B, the same light named as a token, --iron-red-lit, beside --control-gold-lit", ground: "radial-gradient(circle at 35% 30%,var(--iron-red-lit),var(--iron-red) 70%)", tokenCss: ":root{--iron-red-lit:#a2392a}" },
  { key: "c-mixed-from-the-token", caption: "C, the light mixed from the token and the lit cream, the deep's own form (color-mix)", ground: "radial-gradient(circle at 35% 30%,color-mix(in oklab,var(--iron-red) 80%,var(--parchment-bright)),var(--iron-red) 70%)", tokenCss: "" },
  { key: "d-one-red-and-a-sheen", caption: "D, one red, the sheen a translucent cream over it", ground: "radial-gradient(circle at 35% 30%,rgb(from var(--parchment-bright) r g b / .22),rgb(from var(--parchment-bright) r g b / 0) 62%),var(--iron-red)", tokenCss: "" },
  { key: "e-flat", caption: "E, flat: the token alone", ground: "var(--iron-red)", tokenCss: "" },
];
const CONTRAST = `(()=>{const lum=(c)=>{const m=c.match(/[\\d.]+/g).map(Number);const [r,g,b]=(c.startsWith("color(srgb")?m.map((v)=>v*255):m).slice(0,3).map((v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*r+0.7152*g+0.0722*b;};
const probe=(bg)=>{const d=document.createElement("div");d.style.color="color-mix(in srgb, "+bg+" 100%, black 0%)";document.body.appendChild(d);const c=getComputedStyle(d).color;d.remove();return c;};
const ink=getComputedStyle(document.querySelector(".primer li.step .seal")).color;const L=lum(ink);
const stops=window.__stops1248.map((s)=>{const c=probe(s);const l=lum(c);return{stop:s,computed:c,ratio:Math.round(100*(Math.max(L,l)+0.05)/(Math.min(L,l)+0.05))/100};});return{ink,stops};})()`;
const stopsOf = (o: Opt): string[] => {
  if (o.key.startsWith("a")) return ["#a2392a", "var(--iron-red)"];
  if (o.key.startsWith("b")) return ["var(--iron-red-lit)", "var(--iron-red)"];
  if (o.key.startsWith("c")) return ["color-mix(in oklab,var(--iron-red) 80%,var(--parchment-bright))", "var(--iron-red)"];
  if (o.key.startsWith("d")) return ["color-mix(in srgb,var(--iron-red) 78%,var(--parchment-bright))", "var(--iron-red)"];
  return ["var(--iron-red)"];
};
const done: StripOpts = { verb: "From The Primer", head: "The Explorer · the Land, step 2 of 6", step: islands, dots: { total: 6, done: 1 }, left: [`<a href="/primer/#explorer-land">Back to The Primer</a>`], right: [], done: { next: "Next, sizes ›" }, seat: { x: 360, y: 220 } };
const css = (o: Opt): string => `${o.tokenCss}.primer li.step .seal{background:${o.ground}}.strip1155 .s-done b{background:${o.ground}}`;
const items = OPTS.flatMap((o) => {
  const set = `window.__stops1248=${JSON.stringify(stopsOf(o))};`;
  const page = primerJs({ seat: "ninth", label: "Primer", pictures: pictureUrl, sealed: SEALED, nextRoads: true, only: ["/explorer/"] }) + ringJs(null, done) + styleJs("seal1248", css(o)) + set;
  return [
    { url: "/faq/", w: 1280, h: 800, js: page, target: "li.step.done", pad: 18, minW: 760, full: join(shotDir("6-seal"), `${o.key}-page.png`), crop: join(shotDir("6-seal"), `${o.key}-page-2x.png`), probe: CONTRAST },
    { url: "/faq/", w: 1280, h: 800, js: page, target: ".strip1155 .s-done", pad: 14, minW: 220, full: join(shotDir("6-seal"), `${o.key}-slip.png`), crop: join(shotDir("6-seal"), `${o.key}-slip-2x.png`), probe: CONTRAST },
  ];
});
const out = shootWithCrops("6-seal", items);
type C = { ink: string; stops: Array<{ stop: string; computed: string; ratio: number }> };
const lines = OPTS.map((o, i) => {
  const c = out[i * 2]!.extra as C;
  return `| ${o.key} | ${o.caption} | \`${o.ground}\` | ${c.stops.map((s) => `${s.computed}: **${s.ratio}:1**`).join("; ")} | \`shots/6-seal/${o.key}-page-2x.png\`, \`shots/6-seal/${o.key}-slip-2x.png\` |`;
});
writeFileSync(
  measureFile("6-seal.md"),
  `# Item 6: the seal in tokens, measured\n\nThe Issue #1155 round's Primer page (the Explorer's ladder, its first three steps sealed) and its step slip once done, laid over the built Questions & Answers page at ${SHA.slice(0, 8)}, 1280 by 800, reduced motion (\`node out/1248/mock/seats-seal.ts\` from the design tree). The seal is shown at two sizes, 1.9rem on the page and 1.5rem in the slip, the numeral in \`--parchment-bright\` (${"computed below"}). Each ratio is the numeral against a stop of the seal's ground, computed from the colour the browser resolves; the lit stop is the worst case, since it lies under the numeral's upper left. For D the lit stop is the cream sheen composited over the red at its peak, written as the equivalent mix. The floor is 4.5:1 (\`handbook/specs/ui-design.md\`). Every result came back with no 4xx and no console error.\n\n| option | what it is | the seal's ground | numeral against each stop | stills |\n|---|---|---|---|---|\n${lines.join("\n")}\n\nThe numeral's ink, as computed: ${(out[0]!.extra as C).ink}.\n`,
);
console.log(lines.join("\n"));
