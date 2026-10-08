import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const REPO = resolve(import.meta.dirname, "..", "..");
const SPLIT_FILES = [
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
const OLDER_CALLS: Readonly<Record<string, readonly string[]>> = {
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

const collapse = (text: string): string => text.replace(/\s+/g, " ").trim();

// Blind spots, each erring toward passing: a module-level const arrow (each in these files takes one parameter, or several of different types, but `starNode` in `src/site/seed-of-the-day/app-dispatch.ts`, whose two numbers its one call hands as written), an exported function (five calls in src/site/shared/zoom-controller.ts, moved unchanged, hand values under other names; `huntDispatch`'s one call from src/site/seed-of-the-day/app-hunt.ts hands five values of five types), a function declared inside another (`plateFor` in `src/site/reading-room/prospect-stage.ts` is handed `world` for `w`, as at the base), a call of a method rather than a bare name, a call through an alias, a shadowing local, and any file off the list (50 older calls in 13 other files under src/site hand values on under other names).
function handOffs(file: string): { site: string; call: string; args: string[]; params: string[] }[] {
  const sf = ts.createSourceFile(file, readFileSync(resolve(REPO, file), "utf8"), ts.ScriptTarget.Latest, true);
  const local = new Map<string, string[]>();
  for (const st of sf.statements) {
    if (!ts.isFunctionDeclaration(st) || !st.name || st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
      continue;
    local.set(
      st.name.text,
      st.parameters.map((p) => p.name.getText(sf)),
    );
  }
  const found: { site: string; call: string; args: string[]; params: string[] }[] = [];
  const visit = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      local.has(n.expression.text) &&
      n.arguments.length > 0
    ) {
      const args = n.arguments.map((a) => a.getText(sf));
      found.push({
        site: `${file}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1} ${n.expression.text}`,
        call: `${n.expression.text}(${args.map(collapse).join(", ")})`,
        args,
        params: local.get(n.expression.text)!,
      });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

test("every part and helper the site's split builders were cut into is handed each value under the name of the parameter it lands in, so two values of one type cannot trade places with the type check green; the older calls that do not are excused by their exact text", () => {
  for (const file of Object.keys(OLDER_CALLS))
    assert.ok(SPLIT_FILES.includes(file), `${file} has excused calls but is not on the list this guard reads`);
  for (const file of SPLIT_FILES) {
    const calls = handOffs(file);
    assert.ok(
      calls.length > 0,
      `${file} hands nothing to a function of its own, so this guard reads nothing there and the list above is stale`,
    );
    const excused = [...(OLDER_CALLS[file] ?? [])];
    for (const { site, call, args, params } of calls) {
      const at = excused.indexOf(call);
      if (at !== -1) {
        excused.splice(at, 1);
        continue;
      }
      assert.deepEqual(
        args,
        params,
        `${site} is handed (${args.join(", ")}) for its parameters (${params.join(", ")}); a value under another name, or a literal, is how a swapped element or timer passes the type check`,
      );
    }
    assert.deepEqual(
      excused,
      [],
      `${file}: these excused calls are no longer found as written, so the excuse list is stale or an excused call was edited`,
    );
  }
});
