// Issue #849: the shape, count and size words Sub 5 (Issue #856) would propose, as a list beside the stills (not drawn
// as a page), each with the kept-sample rows it would move, read through the founding's own cleanup; and what the
// ruled rules (D5, D6) would found for the epic's two sentences, through `foundWorld`'s own seed derivation.
// Every word here is a proposal for the sitting to name; none is ruled.
// Run from the tree: node out/844/measure/words.ts
import { readFileSync, writeFileSync } from "node:fs";
import { displayForm, foundingWords } from "../../../src/world/founding/normalize.ts";
import { foundWorld } from "../../../src/world/founding/found.ts";
import { hashString } from "../../../src/core/rng.ts";
import { SMALL_WORDS, CLIMATE_TRADITION } from "../../../src/world/founding/lexicon.ts";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const SAMPLE = new URL("../../../test/world/founding-sample.json", import.meta.url).pathname;
const rows = JSON.parse(readFileSync(SAMPLE, "utf8")) as Array<{ sentence: string }>;
const wordsOf = (s: string): string[] => {
  const d = displayForm(s);
  return d.ok ? foundingWords(d.sentence) : [];
};
const sample = rows.map((r) => ({ sentence: r.sentence, words: wordsOf(r.sentence) }));
const hasPhrase = (words: ReadonlyArray<string>, phrase: string): boolean => {
  const p = phrase.split(" ");
  for (let i = 0; i + p.length <= words.length; i++) if (p.every((w, k) => words[i + k] === w)) return true;
  return false;
};

type Proposal = { readonly phrase: string; readonly sets: string; readonly rule: string };
const PROPOSALS: ReadonlyArray<Proposal> = [
  { phrase: "in the shape of texas", sets: "outline: Texas", rule: "D5, a shape phrase" },
  { phrase: "shaped like texas", sets: "outline: Texas", rule: "D5, a shape phrase" },
  { phrase: "the shape of texas", sets: "outline: Texas", rule: "D5, a shape phrase" },
  { phrase: "in the shape of japan", sets: "outline: Japan", rule: "D5; bare \"japan\" keeps only its naming tradition" },
  { phrase: "shaped like japan", sets: "outline: Japan", rule: "D5" },
  { phrase: "crescent shaped", sets: "outline: the crescent", rule: "D5 (a hyphen reads as a space, so \"crescent-shaped\" matches)" },
  { phrase: "shaped like a crescent", sets: "outline: the crescent", rule: "D5" },
  { phrase: "in the shape of a crescent", sets: "outline: the crescent", rule: "D5" },
  { phrase: "crescent", sets: "nothing alone (only a shape phrase sets an outline, D5)", rule: "listed here to count what a bare form word would move if the sitting lets one" },
  { phrase: "shaped", sets: "nothing alone", rule: "the breakdown's note: \"shaped a bit like a horseshoe\" fires only if \"shaped\" alone is listed" },
  { phrase: "equal sized", sets: "sizes: alike", rule: "D6, a listed size word" },
  { phrase: "even sized", sets: "sizes: alike", rule: "D6" },
  { phrase: "varied", sets: "sizes: of every size", rule: "D6" },
  { phrase: "of every size", sets: "sizes: of every size", rule: "D6" },
  { phrase: "round", sets: "nothing (the lobes are round already); may stand between a number and an island word", rule: "D6, a listed shape word" },
  { phrase: "small", sets: "nothing; may stand between a number and an island word", rule: "D6 (the breakdown counted \"a thousand small isles\")" },
  { phrase: "few", sets: "islands: about 5", rule: "D6, a band word" },
  { phrase: "scattered", sets: "islands: about 20", rule: "D6, a band word" },
  { phrase: "countless", sets: "islands: the ceiling (about 150, pending Sub 3)", rule: "D6, a band word" },
];

const NUMBER_WORDS = new Set(["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "twenty", "thirty", "forty", "fifty", "hundred", "thousand", "dozen"]);
const ISLAND_WORDS = new Set(["island", "isle", "islet", "isles", "islands", "islets", "archipelago", "archipelagos"]);
const BETWEEN = new Set(["equal", "sized", "even", "round", "small", "varied", "tiny", "great"]);
const isNumber = (w: string): boolean => /^[0-9]+$/.test(w) || NUMBER_WORDS.has(w);
function numberBeforeIsland(words: ReadonlyArray<string>): string | null {
  for (let i = 0; i < words.length; i++) {
    if (!isNumber(words[i] as string)) continue;
    let j = i + 1;
    while (j < words.length && BETWEEN.has(words[j] as string)) j++;
    if (j < words.length && ISLAND_WORDS.has(words[j] as string)) return words.slice(i, j + 1).join(" ");
  }
  return null;
}

const lines = ["# The words Sub 5 would propose, and the kept-sample rows each would move (at 581a6de3)", ""];
lines.push(`Read through the founding's own cleanup (\`displayForm\` then \`foundingWords\`, src/world/founding/normalize.ts) over the ${sample.length} kept rows in test/world/founding-sample.json. A row is counted when it holds the phrase as consecutive words; a phrase that sets nothing alone ("round", "small", the bare forms) moves a row only through a rule that uses it, as its own line says. Every phrase is a proposal; the sitting names the words.`);
lines.push("");
lines.push("| phrase | would set | rule | rows holding it | the rows |");
lines.push("|---|---|---|---|---|");
for (const p of PROPOSALS) {
  const hits = sample.filter((r) => hasPhrase(r.words, p.phrase));
  lines.push(`| ${p.phrase} | ${p.sets} | ${p.rule} | ${hits.length} | ${hits.map((h) => `"${h.sentence}"`).join("; ") || "none"} |`);
}
const numberRows = sample.map((r) => ({ r, hit: numberBeforeIsland(r.words) })).filter((x) => x.hit !== null);
lines.push("");
lines.push(`**D6's number rule** (a number directly before an island word, listed size and shape words allowed between; number words through "thousand" and plain digits): ${numberRows.length} kept row${numberRows.length === 1 ? "" : "s"} would move: ${numberRows.map((x) => `"${x.r.sentence}" (${x.hit})`).join("; ") || "none"}.`);
lines.push("");
lines.push("## The epic's two sentences");
lines.push("");
for (const [sentence, rule] of [
  ["tropical island in the shape of Texas", { residualDrops: ["in", "shape", "texas", "the", "of"], adds: "outline: Texas (D5's phrase \"in the shape of texas\")" }],
  ["exactly 100 equal sized round islands", { residualDrops: ["100", "equal", "sized", "round"], adds: "islands: about 100, sizes alike (D6's number rule; \"islands\" still sets the archipelago)" }],
] as const) {
  const today = foundWorld(sentence);
  if (!today.ok) throw new Error(sentence);
  const words = foundingWords(sentence);
  const ruleResidual = words.filter((w) => !SMALL_WORDS.has(w) && !rule.residualDrops.includes(w as never) && !today.steered.some((s) => s.phrase.split(" ").includes(w))).join(" ");
  lines.push(`- **"${sentence}"**. Today: residual "${today.residual}", chart number ${today.seed}, overrides ${JSON.stringify(today.overrides)}. Under the ruled rules: residual "${ruleResidual}", chart number ${hashString(ruleResidual)} (\`hashString\` of the residual, as \`foundWorld\` derives it), the same overrides, and ${rule.adds}.`);
}
lines.push("");
lines.push(`The tropical band's naming tradition is \`${CLIMATE_TRADITION.tropical}\` (\`CLIMATE_TRADITION\` in src/world/founding/lexicon.ts), which is why both of today's and the rule's Texas worlds take it.`);
lines.push("");
lines.push("Command: `node out/844/measure/words.ts` from the design-844 worktree at 581a6de3.");
writeFileSync(`${OUT}/words.md`, lines.join("\n") + "\n");
console.log(lines.join("\n"));
