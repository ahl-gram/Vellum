// Issue #1155 round: every step of every ladder as plain text, for reading the grain on real sentences, with each step's Try it address on the live site, its drift check reading and the outcome its sentence promises. Written from the same data the mocks render, so the two cannot disagree.
// node out/1155/mock/ladder-md.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DONE } from "./ladder/done.ts";
import { everyStep, seated } from "./ladder/guide.ts";
import { OUT_1155 } from "./paths.ts";

const LIVE = "https://www.vellumworlds.com";
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

type R = { reads: Array<{ ok?: boolean; fits: boolean; inMarkup: boolean }> };
const read = (file: string): R[] | null => {
  const p = join(OUT_1155, "measure", file);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Array<{ probe: string }>).map((r) => JSON.parse(r.probe) as R) : null;
};
const checks = read("check-results.json");
const all = everyStep();
const verdict = new Map(all.map(({ ladder, step }, i) => [`${ladder.route}#${step.id}`, checks?.[i] ? (checks[i]!.reads.every((x) => x.ok === true && x.fits) ? "the check passes" : "the check is RED") : "not checked"]));
const landingsRaw = read("landings-results.json") as unknown as Array<{ then: R }> | null;
const withDone = all.filter(({ ladder, step }) => DONE[`${ladder.route}#${step.id}`] !== undefined);
const outcome = new Map(withDone.map(({ ladder, step }, i) => {
  const t = landingsRaw?.[i]?.then.reads ?? [];
  return [`${ladder.route}#${step.id}`, t.length === 0 ? "done on the built site, no outcome written" : t.every((x) => x.ok === true) ? "its outcome holds" : "its outcome MISSED"];
}));

const lines: string[] = [
  "# The ladders, every step",
  "",
  "Every step the round drew, in the guide's own order, from the same data the mock pages render (`mock/ladder/`). Words in **bold** are a control's own words as the built page shows them at 089881ad; the step quotes them exactly, and the drift check holds the two together. Each step's Try it address is given on the live site, so any step can be tried today: the address carries everything the step needs, which is direction A's whole premise. \"Waits on a review\" marks a step whose control `handbook/specs/ui-design.md` lists as provisional until its post-use review; that mark is for the sitting and the builder, never for the reader.",
  "",
];
let total = 0;
for (const s of seated()) {
  for (const { ladder, name, sub } of [{ ladder: s.ladder, name: s.name, sub: false }, ...s.under.map((u) => ({ ladder: u.ladder, name: u.name, sub: true }))]) {
    lines.push(`## ${name}${sub ? " (a room of the Explorer)" : ""}`, "", ladder.what + (ladder.entered ? ` You come to it ${ladder.entered}.` : ""), "");
    let n = 0;
    ladder.lessons.forEach((lesson, li) => {
      lines.push(`### ${ROMAN[li]} · ${lesson.title}, *${lesson.gloss}*`, "");
      if (lesson.aside) lines.push(`*${lesson.aside}*`, "");
      for (const step of lesson.steps) {
        n++;
        total++;
        const key = `${ladder.route}#${step.id}`;
        const marks = [step.kind === "commission" ? "a commission" : step.kind === "play" ? "play, no wrong answer" : "", step.only === "touch" ? "on a tablet only" : step.only === "motion" ? "with motion on only" : "", step.provisional ? `waits on a review: ${step.provisional}` : ""].filter(Boolean);
        lines.push(`${n}. ${step.act.replace(/\{([^}]+)\}/g, "**$1**")}`, `   *${step.see}*`, `   [Try it](${LIVE}${step.at}) · ${verdict.get(key)}${outcome.has(key) ? ` · ${outcome.get(key)}` : ""}${marks.length ? ` · ${marks.join(" · ")}` : ""}`, "");
      }
    });
  }
}
lines.push("## When the steps are done", "", "*Lean on these, for a quicker answer, any time.* You may take these steps again whenever you like, from the first: **Begin again** clears the marks of the steps you have done from this browser, and touches nothing else. For a quicker answer than a whole ladder, Questions & Answers says how the worlds are made, and the Glossary says what every word on a chart means.", "", `${total} steps in all.`, "");
writeFileSync(join(OUT_1155, "ladder.md"), lines.join("\n"));
console.log(`${total} steps written to ladder.md`);
