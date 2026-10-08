import type { Rule } from "eslint";

export const SPLIT_FILES: readonly string[] = [
  "src/site/explorer/app.ts",
  "src/site/explorer/chart-drawer-bind.ts",
  "src/site/explorer/controls.ts",
  "src/site/explorer/glass.ts",
  "src/site/explorer/hash-sync.ts",
  "src/site/explorer/sheet-turn.ts",
  "src/site/explorer/worker.ts",
  "src/site/shared/zoom-controller.ts",
  "src/site/home/input.ts",
  "src/site/home/veil.ts",
  "src/site/print-room/app.ts",
  "src/site/reading-frame/dated-log.ts",
  "src/site/reading-frame/index.ts",
  "src/site/reading-room/app.ts",
  "src/site/reading-room/prospect-stage.ts",
  "src/site/seed-of-the-day/app.ts",
  "src/site/seed-of-the-day/app-hunt.ts",
  "src/site/seed-of-the-day/app-dispatch.ts",
];

// Older calls that hand values on under other names, excused as written (Alex, Issue #654 comment 5939656565, decision B).
export const OLDER_CALLS: Readonly<Record<string, readonly string[]>> = {
  "src/site/home/veil.ts": ["startSounding(veil.status, opts.random ?? Math.random)"],
  "src/site/print-room/app.ts": [
    'downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename)',
    "downloadSvg(res.svg, filename)",
    "downloadBlob(png.blob, filename)",
    "orderPoster(b.dataset.poster as string)",
  ],
  "src/site/reading-room/app.ts": [
    "onTold(t)",
    "prospectHrefFor(forSeed, s)",
    "armRoom(lastRes, shownSeed, undefined)",
    "restFor(pendingLive)",
  ],
  "src/site/seed-of-the-day/app.ts": [
    'dryIn($("folio-title"), "120ms")',
    'dryIn($("folio-sub"), "260ms")',
    'dryIn($("folio-coords"), "320ms")',
    'dryIn($("folio-note"), "400ms")',
  ],
  "src/site/seed-of-the-day/app-hunt.ts": [
    'restart(line, "wet")',
    "prevSeed(seed)",
    "writeStore({ solved: seed, streak })",
    'restart(share, "rise")',
    'setHuntStatus(fromClick ? `Found it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}.` : "Already found today. Come back tomorrow for a new world.")',
    'restart($("streak"), "stamp")',
    "setHuntStatus(`${BAND_PROSE[feedback.band]}${marked}${trail}`)",
    'setHuntStatus("Copied your result to the clipboard.")',
  ],
};

const splitArgumentsByName: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          excused: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
        },
        required: ["excused"],
        additionalProperties: false,
      },
    ],
    messages: { found: "stub" },
  },
  create: () => ({}),
};

export default { rules: { "split-arguments-by-name": splitArgumentsByName } };
