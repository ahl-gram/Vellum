// Issue #1248 round, item 7: every lesson's under-line (its gloss), every comfort line (its aside) and every commission's target, read from the Issue #1155 round's ladder data (the copy in ladder/), each with its room, so the sitting rules each distinct line (Alex, 2026-11-09, Issue #1249 comment 6752893639, "B1: at the seats round"). Writes measure/7-lines.json.
// node out/1248/mock/seats-lines.ts
import { writeFileSync } from "node:fs";
import { seated } from "./ladder/guide.ts";
import { measureFile } from "./seats-paths.ts";

const out: Array<{ room: string; route: string; lesson: string; lessonId: string; gloss: string; aside: string | null; commissions: Array<{ id: string; act: string; see: string }> }> = [];
for (const s of seated()) for (const x of [s, ...s.under]) for (const l of x.ladder.lessons) out.push({ room: x.name, route: x.ladder.route, lesson: l.title, lessonId: l.id, gloss: l.gloss, aside: l.aside ?? null, commissions: l.steps.filter((st) => st.kind === "commission").map((st) => ({ id: st.id, act: st.act, see: st.see })) });
writeFileSync(measureFile("7-lines.json"), JSON.stringify(out, null, 1));
for (const o of out) console.log(`${o.room} | ${o.lesson} | gloss: ${o.gloss} | aside: ${o.aside ?? "-"}${o.commissions.length ? ` | COMMISSION ${o.commissions.map((c) => c.act).join(" / ")}` : ""}`);
console.log(`${out.length} lessons, ${out.filter((o) => o.aside).length} asides, ${out.reduce((n, o) => n + o.commissions.length, 0)} commissions`);
