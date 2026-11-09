// Issue #1155 round: the contrast of every ink pair the mocks add, computed from the token values the mock's CSS sets (the WCAG ratio of relative luminances), against the house's 4.5:1 floor for every glyph a reader reads (`handbook/specs/ui-design.md`, colour and contrast). Computed from the declared colours, not sampled from pixels: where a ground is a gradient both stops are read, and the document sheet's own cream gradients only lighten the panel colour under dark ink, so the panel figure is the worse case there. Writes measure/contrast.md.
// node out/1155/mock/contrast.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUT_1155, TREE } from "./paths.ts";

const shell = readFileSync(join(TREE, "src", "styles", "shared", "shell.css"), "utf8");
const token = (name: string): string => {
  const m = new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i").exec(shell);
  if (!m) throw new Error(`no --${name} in shell.css`);
  return m[1]!;
};
const lum = (hex: string): number => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const ratio = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const T = (n: string): string => token(n);
const RAW = { sealLight: "#a2392a", review: "#2f5d8a", lessonLand: "#ead9b4" };
const PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ["the Skip and Next step presses before the step is done (B, C, D), after the second pass", T("ink-dark"), T("parchment-deep")],
  ["the same presses as first drawn, the faded ink, replaced", T("ink-faded"), T("parchment-deep")],
  ["the see-lines, asides and marks on a strip, a lesson or the Primer's sheet", T("ink-brown"), T("parchment-panel")],
  ["a control drawn inside a sentence", T("ink-dark"), T("control-cream")],
  ["a road drawn inside a sentence, Try it, the gold presses", T("ink-dark"), T("control-gold")],
  ["a seal's numeral on the seal's dark stop", T("parchment-bright"), T("iron-red")],
  ["a seal's numeral on the seal's light stop (a raw red, a stand-in)", T("parchment-bright"), RAW.sealLight],
  ["the commission mark and the strip's done mark", T("iron-red"), T("parchment-panel")],
  ["the review mark (for the sitting only, a raw blue)", RAW.review, T("parchment-panel")],
  ["the chart of lessons: place names on its land (a raw fill, a stand-in)", T("ink-dark"), RAW.lessonLand],
  ["the chart of lessons: lean-on-it italics on its land", T("ink-brown"), RAW.lessonLand],
  ["the chart of lessons: you are here, on its land", T("iron-red"), RAW.lessonLand],
  ["the chart of lessons: a waypoint numeral", T("ink-dark"), T("parchment-bright")],
  ["the chart of lessons: a done waypoint's numeral", T("parchment-bright"), T("iron-red")],
];
const rows = PAIRS.map(([what, fg, bg]) => {
  const r = ratio(fg, bg);
  return `| ${what} | ${fg} on ${bg} | ${r.toFixed(2)}:1 | ${r >= 4.5 ? "clears the floor" : "**UNDER the floor**"} |`;
});
writeFileSync(
  join(OUT_1155, "measure", "contrast.md"),
  `# The inks the mocks add, against the 4.5:1 floor\n\nComputed from the colours the mock's CSS declares, the tokens read from \`src/styles/shared/shell.css\` at 089881ad (\`node out/1155/mock/contrast.ts\`); not sampled from pixels. The trail line's "learn this room" press takes the chart of the atelier press's own pairing, parchment on the deep, and was not measured here. The first drawing's dim presses read 3.30:1 and were changed to the house's own refusing dress, full-strength ink on a pressed ground (\`handbook/specs/ui-design.md\`: a refusing press dims by swapping its ground); the stills were shot again after.\n\n| ink | colours | ratio | |\n|---|---|---|---|\n${rows.join("\n")}\n`,
);
console.log(rows.join("\n"));
