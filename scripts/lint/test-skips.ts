import type { Rule } from "eslint";

export const SKIPPABLE_TESTS: Readonly<Record<string, string>> = {
  "test/prospect/plate-face.test.ts :: every glyph's outline decodes to its own ink box, so no two numbers in the path data run together":
    'it walks FACES, the committed face tables that "the committed face tables are exactly what npm run plate-face writes" in this file pins, and skips only the space, the one glyph in each face with no outline to decode',
  "test/render/region-scalebar.test.ts :: #249, Issue #954: every region band's scale bar has its ticks inside its claimed box, so its labels stay on their paper":
    "it walks LOD_BANDS, a literal table in src/world/lod.ts, and skips only the world band; the Issue #954 tick test in this file pins its five region bands",
  "test/repo/constant-contracts.test.ts :: every region band obeys lodWindowFor's size <= 0.98 precondition":
    "it walks LOD_BANDS, a literal table in src/world/lod.ts whose five region bands the Issue #954 tick test in test/render/region-scalebar.test.ts pins, and checks only the region bands the precondition names",
  "test/site/astro-scaffold.test.ts :: every stage's notices stand in the kit's one shape, last in the stage: the live status pill, on the words its entry names and never on whitespace alone, the hidden render-worker warning, the scripts-off notice, and no page carries a pill or a warning its entry does not name (Issue #827, Issue #913)":
    "it walks PAGES, this file's literal roster, and checks every page: one NOTICES does not name by the two refusals above the continue, one it names by the shape below it",
  "test/site/astro-scaffold.test.ts :: every internal link and embed on the rendered pages resolves in the built tree":
    "it skips a link only by its kind (another site's, a page's own route, a file the deploy generates) and resolves every other, and every page links /shared/shell.css, which the shell.css test in this file pins, so each page resolves at least that one",
  "test/site/hero-charts.test.ts :: committed src/static/charts heroes match a fresh src/ render (structure exact, numbers ULP-tolerant)":
    "a chart byte-identical to its committed copy is the pass, so its continue skips no comparison it owes, and a render that produced no chart leaves every committed one an orphan, which the orphans test in this file reds on",
};

const testUnskippableCheck: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: { excused: { type: "object", additionalProperties: { type: "string", minLength: 1 } } },
        required: ["excused"],
        additionalProperties: false,
      },
    ],
    messages: {
      found:
        '"{{title}}" can pass with nothing checked: each of its checks sits under an if whose else checks nothing or under a ?:, or after a return or a continue that an if takes first, so a fixture that lacks the case passes it. Assert after the loop that the case was reached (a floor such as checked >= 1), announce the skip with t.skip(), or give the if an else that checks; a deliberate case is an entry in SKIPPABLE_TESTS in scripts/lint/test-skips.ts with its reason (Alex, Issue #1315 comment 6785163784)',
      stale:
        "{{entry}} is in SKIPPABLE_TESTS, but no test of that title in this file can pass with nothing checked, so the excuse lifts nothing: delete it rather than leave it looking like a decision (Issue #1329)",
    },
  },
  create: () => ({}),
};

export default { rules: { "test-unskippable-check": testUnskippableCheck } };
