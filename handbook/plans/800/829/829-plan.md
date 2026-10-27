# Issue #829: the founding modules read nothing whose answer depends on the locale, the clock or chance

**Planned at**: `origin/main` `88f3762d`, Issue #829 at 2 comments (the delegation, https://github.com/ahl-gram/Vellum/issues/829#issuecomment-6282251471, and the rulings, https://github.com/ahl-gram/Vellum/issues/829#issuecomment-6282680339). Recon and every probe below ran at `b6c540eb`; `git diff --stat b6c540eb 88f3762d -- eslint.config.ts scripts/lint test/repo test-support src/world handbook/specs` prints nothing, so no planned file moved between them.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/829#issuecomment-6282680339, M1: A and M2: A, taken at the planner's recommended options under Alex's delegation (comment 6282251471). The design below is written to them.

**Open decisions**: none.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/check-placement.md`, "The lint": a new house rule lives in `scripts/lint/`, is wired in the block that reaches the same files with the same plugins or in a new block named for what it covers, and is proven by its own test over a fixture it must refuse and one it must pass.
- `handbook/specs/engine-invariants.md`, "Founding a world from a sentence", the paragraph "Founding agrees across platforms or refuses". This plan edits it (Rosters and doctrine).
- `handbook/specs/rulebook.md`, "Durable engineering constraints from shipped work", the "Prospect byte pins" bullet: the sibling rule whose engine this plan shares. That bullet stays true and is not edited.
- `handbook/specs/conventions.md`, "How code is cited" and "How a spec, and the rest of the house's prose, is written", for the spec edit.
- `CLAUDE.md`, Process: "A guard proves it can fail; a scanner proves which way it errs".
- `.claude/skills/vellum-footguns/SKILL.md` Gate 1 before the test, Gate 4 before the block, Gate 5 before the push.

## What the issue asks, and what recon found

A house lint rule over `src/world/founding/**` refusing every call whose answer depends on where or when it runs: the locale members (`toLocaleLowerCase`, `toLocaleUpperCase`, `toLocaleString`, `localeCompare`), anything reached through `Intl`, the clock (`Date`, `performance.now`), and chance (`Math.random`, `crypto`), proven by its own test.

Recon ledger (vellum-spec-recon at `b6c540eb`): every claim CURRENT except the sequencing gate, STALE in the harmless direction (Issue #779 closed 2026-10-13, `gh pr list --state open` returns `[]`, so nothing blocks). Two findings shaped this plan:

- `test/repo/lint-wiring-rules.test.ts`'s per-rule roster is `SHEET_RULES`, the stylesheet rules alone, and `test-support/lint-witnesses.ts` keys one witness per ruled ROOT glob (`src/**/*.ts` already has `src/cli/main.ts`). A new TypeScript block over `src/world/founding/**` owes neither file an entry, so this plan touches neither.
- The issue's "Why a lint rule" holds for the no-argument form only: re-measured here, `env LC_ALL=tr_TR.UTF-8 node -e ...` on Node v26.12.0 (ICU 78.3) prints `"ISLE".toLocaleLowerCase()` as `isle` but `"ISLE".toLocaleLowerCase("tr")` as `ısle`. The rule refuses both forms (row 2 of the table), so nothing changes; the record is in Calls made.

## The design

**One engine, two scopes.** `vellum/prospect-libm-clock-free` (`prospectLibmClockFree` in `scripts/lint/source-shape.ts`, Issue #759) already holds this class for `src/prospect/`: it approves a short list of built-ins and refuses every other global, every locale member however spelled, every `Math` member that is not exact, the `**` operator in both forms, `import.meta`, an ambient declaration, a Node built-in module and a computed `import()`. Its body is lifted, unchanged, into an exported factory `hostFree(approved, messages)` in the same file; the prospect rule becomes `hostFree(PROSPECT_GLOBALS, <its own five messages, moved verbatim>)`, and the new rule is `hostFree(FOUNDING_GLOBALS, <five founding messages>)` in `scripts/lint/import-bounds.ts`, beside `vellum/philology-no-entropy`.

**What it refuses, measured.** At `b6c540eb`, the prospect rule forced on over `src/world/founding/` (`eslint --rule '{"vellum/prospect-libm-clock-free":"error"}' src/world/founding/`) reports nothing, and the same rule over a 63-line plant at `src/world/founding/normalize.ts` (`--stdin --stdin-filename`) refuses each of rows 1 to 39, 41 and 42 of the table below exactly once with the arm shown, and passes row 40 (approved for the prospect, refused for founding) and rows 43 to 63. The plan skeptic then ran a scratch copy of that rule with its approved list swapped for `FOUNDING_GLOBALS` through the real `eslint.config.ts`: all 42 rows and all 149 off-list globals of Node v26.12.0 refused exactly once with the planned arm (191 of 191, row 40 among them), nothing on the passing and on-list rows or the four founding modules, no parse failure. Every item the issue names is refused in at least two spellings: the six locale members by name, by computed key, by backtick key, by destructuring and through a held string; `Intl` bare, through `globalThis` and through `self`; `Date` constructed, called and read; `performance` bare and through `window`; `Math.random` written out, by computed key and destructured; `crypto` bare, through `self`, and as `node:crypto` and `crypto` modules, static and dynamic. Beyond the issue's list it refuses what also varies by machine, browser or moment: `navigator.language`, `Temporal.Now`, `process.hrtime`, `setTimeout`, `eval`, `new Function`, `import.meta`, every libm member (`Math.sin`, `Math.pow`) and `**`. That widening is M1.

**What founding reads, measured.** A scope-manager probe over the four modules at `b6c540eb` (`829-globals-probe.ts` in the scratchpad) found exactly five globals, `Array`, `Map`, `Math`, `Set` and `undefined`, and the `Math` members `max`, `min` and `round`, all three in `EXACT_MATH`. So `FOUNDING_GLOBALS` is exactly those five, and the rule's findings over the real tree are zero.

**What it passes on purpose.** Relative imports, so `hashString` from `src/core/rng.ts` and `defaultRecipe` from `src/world/generate.ts` pass (the reason `vellum/philology-no-entropy` cannot be reused: forced on over the same tree it refuses `found.ts` line 1, the `hashString` import). `toUpperCase`, `toLowerCase`, `normalize` and a `\p{}` class, which read the engine's Unicode data and not the locale: the covenant handles that class by refusing a character the platform does not know, and `handbook/specs/engine-invariants.md` already names what no guard can hold there.

**Blind spots, each with its direction** (written into the test's assertion message, below):

1. A module outside `src/world/founding/` is not read: `hashString` in `src/core/rng.ts` and `defaultRecipe` in `src/world/generate.ts` are held by review alone. Errs toward passing. Measured clean today: `src/core/rng.ts` passes the prospect reading with zero findings, and `defaultRecipe` reads only `createRng` and its fork, `weightedPick`'s float sums, constants, and `stripUndefined`'s `Object.entries`, whose order the language fixes.
2. A built-in that follows the engine's Unicode data (above). Errs toward passing, by design.
3. The Function constructor reached through a value's constructor chain (`[].constructor.constructor`). Errs toward passing (measured: the plant line passes).
4. A host read through a value the rule does not name: a caught error's `stack`, a locale member whose name is assembled from pieces (`"toLocale" + "LowerCase"`), a host value read off a `Date` handed in (`d.getTimezoneOffset()`, `d.toString()`). Errs toward passing (measured: each plant line passes; founding can only come by such a `Date` through the refused global or through blind spot 1).
5. A TypeScript value position read as a type (an instantiation expression). Errs toward passing.
6. An erased binding other than a `declare` line or a type-only import (an import alias, which `npm run check` refuses first, TS1294). Errs toward passing.
7. `Math` behind a cast or a non-null mark (`(Math as M).floor`, `Math!.floor`). Errs toward reporting.
8. Of the test's oracle: a browser or worker global this Node lacks and `BROWSER_SAMPLE` does not name, wrongly approved in `FOUNDING_GLOBALS`. Errs toward passing.

### Alternatives rejected

- **Reuse `vellum/philology-no-entropy`**: it refuses any `rng` import and any identifier named `rng`, so it refuses `found.ts` line 1 (measured).
- **Wire `vellum/prospect-libm-clock-free` itself over founding**: its messages name the prospect layer and its byte pins, and `test/repo/lint-wiring.test.ts` ("no rule is set by two of the house's own blocks") refuses a second block setting it.
- **Put the rule in the existing "the house's rules on world generation" block**: that block also reaches `src/core/**`, `src/terrain/**` and the rest of world generation, and `src/world/generate.ts` alone reads `Float64Array` and `Uint8Array` (three findings under the prospect reading, lines 103, 110, 157), so the rule would red the tree. A new block over exactly `src/world/founding/**` is what `handbook/specs/check-placement.md` asks when no block reaches the same files.
- **A list rule of the issue's names only** (the shape of `vellum/philology-no-entropy`): errs toward passing on every clock, locale source and libm call it does not name. This is M1's option B.
- **Export the walker pieces from `scripts/lint/source-shape.ts` and write a second `create`**: two copies of one 38-line body, two homes for one behavior (`handbook/specs/conventions.md`, "Exactly one home is normative").
- **A new file `scripts/lint/founding.ts`**: costs a new import and an edit to line 31 of `eslint.config.ts` (the one-line `vellum` merge), widening the hunk the parallel lane shares; `scripts/lint/import-bounds.ts` already holds the sibling `vellum/philology-no-entropy` and has room (274 counted lines). M2's option C.
- **Share the test oracle with `test/repo/source-shape-prospect.test.ts` through `test-support/`**: that edits the prospect test, and an UNCHANGED prospect test passing is this plan's proof that lifting the factory kept the prospect rule's behavior.

## Files

### `scripts/lint/source-shape.ts` (edit; 373 counted lines before, about 372 after)

Lines 340 to 389 at `b6c540eb` (`const prospectLibmClockFree: Rule.RuleModule = {` through its closing `};`) become, with the `create` body (lines 352 to 387, from `const report` to the returned object's `};`) moved unchanged except the one line named:

```ts
type HostFreeMessages = Readonly<Record<"power" | "libm" | "host" | "module" | "ambient", string>>;

export const hostFree = (approved: ReadonlySet<string>, messages: HostFreeMessages): Rule.RuleModule => ({
  meta: { type: "problem", messages },
  create(context) {
    // lines 352 to 387 of b6c540eb, unchanged, except line 383:
    //   if (!PROSPECT_GLOBALS.has(ref.identifier.name)) report(id, "host");
    // becomes
    //   if (!approved.has(ref.identifier.name)) report(id, "host");
  },
});

const prospectLibmClockFree = hostFree(PROSPECT_GLOBALS, {
  power: /* line 344's template literal, verbatim */,
  libm: /* line 345's, verbatim */,
  host: /* line 346's, verbatim */,
  module: /* line 347's, verbatim */,
  ambient: /* line 348's, verbatim */,
});
```

(The `//` and `/* */` lines above are this plan's instructions, not code to write: the file gains no comment.) `HostFreeMessages` stays unexported. The `rules` export at the foot of the file is unchanged (`"prospect-libm-clock-free": prospectLibmClockFree`). `PROSPECT_GLOBALS`, `EXACT_MATH`, `LOCALE_MEMBERS` and every helper stay where they are, so the citations of them in `handbook/specs/rulebook.md`, `.claude/agents/vellum-designer.md`, the prospect rule's messages and the comment in `test/repo/source-shape-prospect.test.ts` all still resolve.

### `scripts/lint/import-bounds.ts` (edit; 274 counted lines before, about 286 after)

- Line 3's import gains `hostFree`: `import { hostFree, inTypePosition, isModuleSource, repoPath, sourceBan, stringText } from "./source-shape.ts";`
- After `philologyNoEntropy` (ends line 103 at `b6c540eb`), add:

```ts
const COVENANT =
  "founding agrees across platforms or refuses, so one sentence founds one world in every browser (handbook/specs/engine-invariants.md, Founding a world from a sentence)";
const FOUNDING_GLOBALS: ReadonlySet<string> = new Set(["Array", "Map", "Math", "Set", "undefined"]);
const foundingLocaleClockFree = hostFree(FOUNDING_GLOBALS, {
  power: `founding squares by multiplying: ** and **= are a library power whose last bits differ between platforms, and ${COVENANT}`,
  libm: `founding reads Math only as an exact member written out, one of EXACT_MATH in scripts/lint/source-shape.ts: the rest are libm or chance, and an alias or a computed key hides which member is read, and ${COVENANT}`,
  host: `founding reads no global but a built-in FOUNDING_GLOBALS in scripts/lint/import-bounds.ts approves, no locale member and no import.meta: anything else is the locale, the clock, chance or the host, and ${COVENANT}; a built-in joins that list with its reason`,
  module: `founding imports no Node built-in module and no import() source computed at run time: Node's modules are the host's clock, entropy and files, and ${COVENANT}`,
  ambient: `founding declares no ambient binding: a declare line hides a global from this rule while the erased code still reads it, and ${COVENANT}`,
});
```

- The default export's `rules` gains, after `"philology-no-entropy": philologyNoEntropy,`: `"founding-locale-clock-free": foundingLocaleClockFree,`
- `FOUNDING_GLOBALS` is not exported: the test restates it as an oracle (Tests), and an export with no second reader fails Gate 5 item 1.

### `eslint.config.ts` (edit; one block inserted, nothing else)

After the block named `"Issue #124: the philologist's glass"` (lines 169 to 174 at `b6c540eb`) and before `"the house's rules on home's modules"`:

```ts
  {
    name: "the house's rules on the founding modules",
    files: site("src/world/founding/**"),
    plugins: { vellum },
    rules: { "vellum/founding-locale-clock-free": "error" },
  },
```

No import changes and no edit to line 31: the rule rides in on `...importBounds.rules`, which line 31 already spreads.

### `test/repo/import-bounds-founding.test.ts` (new, about 170 counted lines)

Built on the shape of `test/repo/source-shape-prospect.test.ts` (read it first; copy its `reports`, `offList`, `IDENTIFIER`, `resolvedAt` and `real` helpers and its `BROWSER_SAMPLE` names verbatim). One helper is new: `refusals(lines, path)`, which lints as `reports` does (the same fatal-parse assertion first) and returns `{ line, messageId, message }` for every `RULE` message, for T3; `reports` is written as a map over it to `[line, messageId]`. Constants:

- `ROOT = resolve(import.meta.dirname, "..", "..")`; `eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] })`; `RULE = "vellum/founding-locale-clock-free"`; `AT = "src/world/founding/normalize.ts"`.
- `REFUSED: ReadonlyArray<readonly [string, string]>`, the 42 rows below in this order, each `[arm, plant text]`.
- `PASSED: readonly string[]`, rows 43 to 63 below in this order.
- `APPROVED = ["Array", "Map", "Math", "Set", "undefined"]`, preceded by one comment line in the prospect test's form: `// Restated on purpose, an oracle beside FOUNDING_GLOBALS in scripts/lint/import-bounds.ts rather than read from it, so a name wrongly added to it or dropped from it reds here; every other global this Node holds, and BROWSER_SAMPLE, is planted as refused.`
- `OFF_LIST = offList([...Object.getOwnPropertyNames(globalThis), ...BROWSER_SAMPLE], APPROVED).map((name, i) => ["host", \`export const offGlobal${i} = (): unknown => ${name};\`])`.
- `ON_LIST = APPROVED.filter((name) => name !== "Math").map((name, i) => \`export const onGlobal${i} = (): unknown => ${name};\`)`.
- `BLIND_SPOTS`, one string: `"BLIND SPOTS, declared: a module outside src/world/founding/ is not read, so hashString in src/core/rng.ts and defaultRecipe in src/world/generate.ts, which founding calls, are held by review alone, erring toward passing; a built-in whose answer follows the engine's own Unicode data (normalize, toUpperCase, toLowerCase, a Unicode property class in a regular expression) passes on purpose, since founding refuses a character the platform does not know rather than reading it (handbook/specs/engine-invariants.md), erring toward passing; the Function constructor reached through a value's constructor chain ([].constructor.constructor), erring toward passing; a host read through a value the rule does not name (a caught error's stack, a locale member whose name is assembled from pieces, a host value read off a Date handed in), erring toward passing; a TypeScript value position read as a type (an instantiation expression), erring toward passing; an erased binding other than a declare line or a type-only import (an import alias, which npm run check refuses first, TS1294), erring toward passing; Math behind a cast or a non-null mark ((Math as M).floor, Math!.floor), erring toward reporting; and, of this test's oracle, a browser or worker global this Node lacks and BROWSER_SAMPLE does not name, wrongly approved in FOUNDING_GLOBALS, erring toward passing"`.
- `ARMS`, the five-line plant T3 reads, each `[arm, plant text]` in this order: `["host", "export const stamp = () => new Date();"]`, `["libm", "export const sine = (x: number) => Math.sin(x);"]`, `["power", "export const operator = (x: number) => x ** 2;"]`, `["module", 'import { randomUUID } from "node:crypto";']`, `["ambient", "declare const hidden: { now(): number };"]`.

The plant rows are given as the TEXT ESLint must read; encode each as a TypeScript string the way the prospect test does (a row holding both quote kinds in single quotes with `\'`, and row 48's backslash doubled inside a double-quoted string so the plant reads `/\p{L}+/gu`).

| # | arm | plant text |
|---|---|---|
| 1 | host | `export const lower = (s: string) => s.toLocaleLowerCase();` |
| 2 | host | `export const upper = (s: string) => s.toLocaleUpperCase("tr");` |
| 3 | host | `export const shown = (n: number) => n.toLocaleString();` |
| 4 | host | `export const ordered = (a: string, b: string) => a.localeCompare(b);` |
| 5 | host | `export const day = (d: Date) => d.toLocaleDateString();` |
| 6 | host | `export const hour = (d: Date) => d.toLocaleTimeString();` |
| 7 | host | `export const keyedLocale = (s: string) => s["toLocaleLowerCase"]();` |
| 8 | host | ``export const tickedLocale = (s: string) => s[`toLocaleUpperCase`]();`` |
| 9 | host | `export const destructuredLocale = ({ localeCompare }: string) => localeCompare;` |
| 10 | host | `const LOCALE_KEY = "toLocaleString"; export const heldKey = (n: number) => (n as unknown as Record<string, () => string>)[LOCALE_KEY]!();` |
| 11 | host | `export const collator = () => new Intl.Collator("en");` |
| 12 | host | `export const segments = (s: string) => new Intl.Segmenter().segment(s);` |
| 13 | host | `export const viaGlobalIntl = () => globalThis.Intl;` |
| 14 | host | `export const keyedIntl = () => self["Intl"];` |
| 15 | host | `export const tongue = () => navigator.language;` |
| 16 | host | `export const stamp = () => new Date();` |
| 17 | host | `export const now = () => Date.now();` |
| 18 | host | `export const called = () => Date();` |
| 19 | host | `export const perf = () => performance.now();` |
| 20 | host | `export const viaWindow = () => window.performance;` |
| 21 | host | `export const temporal = () => Temporal.Now;` |
| 22 | host | `export const hr = () => process.hrtime();` |
| 23 | host | `export const timer = (f: () => void) => setTimeout(f, 0);` |
| 24 | libm | `export const dice = () => Math.random();` |
| 25 | libm | `export const keyedDice = () => Math["random"]();` |
| 26 | libm | `const { random } = Math; export const destructuredDice = random;` |
| 27 | host | `export const fill = (buf: Uint32Array) => crypto.getRandomValues(buf);` |
| 28 | host | `export const uuid = () => crypto.randomUUID();` |
| 29 | host | `export const viaSelfCrypto = () => self.crypto;` |
| 30 | module | `import { randomUUID } from "node:crypto";` |
| 31 | module | `export const lazyCrypto = () => import("node:crypto");` |
| 32 | module | `import { randomBytes } from "crypto";` |
| 33 | libm | `export const sine = (x: number) => Math.sin(x);` |
| 34 | libm | `export const power = (x: number, y: number) => Math.pow(x, y);` |
| 35 | power | `export const operator = (x: number) => x ** 2;` |
| 36 | power | `export const assigned = (x: number) => { let y = x; y **= 2; return y; };` |
| 37 | host | `export const where = () => import.meta.url;` |
| 38 | host | `export const evaluated = () => eval("1");` |
| 39 | host | `export const built = () => new Function("");` |
| 40 | host | `export const parsed = (s: string): unknown => JSON.parse(s);` |
| 41 | ambient | `declare const hidden: { now(): number };` |
| 42 | module | ``export const computed = (n: number) => import(`./x${n}.ts`);`` |
| 43 | pass | `// Date.now(), Math.random(), crypto and s.toLocaleLowerCase(), named in a comment` |
| 44 | pass | `export const mention = "Intl, Date.now(), Math.random(), crypto and toLocaleLowerCase, named in a string";` |
| 45 | pass | `export const folded = (s: string) => s.toUpperCase().toLowerCase();` |
| 46 | pass | `export const composed = (s: string) => s.normalize("NFC").normalize("NFKC");` |
| 47 | pass | `export const letters = (s: string) => Array.from(s).length;` |
| 48 | pass | `export const words = (s: string) => Array.from(s.matchAll(/\p{L}+/gu), ([w]) => w);` |
| 49 | pass | `export const bounds = (n: number) => [Math.max(n, 1), Math.min(n, 2), Math.round(n * 1000) / 1000];` |
| 50 | pass | `export const held = new Map<string, number>([["a", 1]]);` |
| 51 | pass | `export const seen = new Set<string>();` |
| 52 | pass | `export const absent = undefined;` |
| 53 | pass | `import { hashString } from "../../core/rng.ts";` |
| 54 | pass | `import { defaultRecipe } from "../generate.ts";` |
| 55 | pass | `export const chartNumber = (s: string): number => hashString(s) + defaultRecipe(1).seed;` |
| 56 | pass | `export const annotated = (d: Date): number => (d === d ? 0 : 1);` |
| 57 | pass | `export type Clock = typeof Date;` |
| 58 | pass | `export type Sine = typeof Math.sin;` |
| 59 | pass | `export const shadowed = (Date: number): number => Date + 1;` |
| 60 | pass | `export const keys = { Date: 1, crypto: 2 }.crypto;` |
| 61 | pass | `export type LocaleKey = "toLocaleString";` |
| 62 | pass | `export const ownMethod = { toLocaleString: (): string => "the founding's own" };` |
| 63 | pass | `export const square = (x: number) => x * x;` |

Row 40 is the threading witness: `PROSPECT_GLOBALS` approves `JSON`, `FOUNDING_GLOBALS` does not, so a factory that ignored its `approved` argument passes it.

## Tests, in the order they are written

All three are written in commit 1, before any rule code, and go red there on their assertions: the test imports no rule module (it reaches the rule by name through ESLint), and a rule name no block configures yields no messages, so the red is the assertion and never a missing module or a config error.

**T1**, `test/repo/import-bounds-founding.test.ts` :: `founding refuses the locale members however spelled, Intl, the clock, chance, libm, the exponent in both forms, every global outside its approved built-ins, import.meta, an ambient declaration, a Node module and a computed import, while its own case folding and normalization, its rng and recipe imports, a type, a key, a shadow, a comment and a string pass (Issue #829)`

- Asserts `OFF_LIST.length > 50` (message: `only ${OFF_LIST.length} off-list globals were found, so the oracle reads almost nothing`).
- `refused = [...REFUSED, ...OFF_LIST]`; `plant = [...refused.map(([, line]) => line), ...PASSED, ...ON_LIST]`; `expected = refused.map(([arm], i) => [i + 1, arm])`; asserts `deepEqual(await reports(plant, AT), expected, BLIND_SPOTS)`, `reports` returning `[line, messageId]` for `RULE` only and failing first on any fatal parse message, as the prospect test's does.
- Red at commit 1: actual `[]`, expected the 42 table rows plus every off-list global.
- Mutations that red it once green: add `"Date"` to `FOUNDING_GLOBALS`; drop `"Map"` from it; in `hostFree` replace `approved.has` with `PROSPECT_GLOBALS.has` (row 40 and the off-list `JSON`, `Number`, `Object`, `String` and the rest pass); delete `"localeCompare"` from `LOCALE_MEMBERS` (rows 4 and 9); add `"normalize"` to `LOCALE_MEMBERS` (row 46 reports, the over-refusal side); make `hostModule` return `text === null` only (rows 30 to 32); delete the founding block from `eslint.config.ts`.

**T2**, same file :: `the founding rule resolves at error on every file under src/world/founding/ and on one nested deeper, and on nothing outside it, the modules founding imports from included (Issue #829)`

- `files = globSync("src/world/founding/**/*.ts", { cwd: ROOT })`, asserted non-empty; every one passed through `real` (exists, not ignored), plus `"src/world/founding/nested/deeper/part.ts"`; asserts every one resolves `JSON.stringify(rule) === "[2]"` (collect the unresolved, `deepEqual([], ...)`).
- Asserts `resolvedAt` is `undefined`, each through `real`, at `src/world/generate.ts`, `src/core/rng.ts`, `src/society/philology.ts`, `src/prospect/compose.ts` and `test/world/founding-covenant.test.ts`.
- Red at commit 1: every founding file unresolved.
- Mutations: delete the founding block; change its `files` to `site("src/world/founding/*.ts")` (the nested file goes unresolved); set the rule to `"warn"` (resolves `[1]`); widen `files` to `site("src/world/**")` (`src/world/generate.ts` resolves).

**T3**, same file :: `every refusal of the founding rule names the founding covenant and never the prospect layer, and the two list refusals name their list and the file that holds it, so a developer it stops can find what to change (Issue #829)`

- Lints `ARMS`' five lines as one plant at `AT`, keeping each `RULE` message whole. Asserts the `[line, messageId]` pairs equal `ARMS.map(([arm], i) => [i + 1, arm])`; then, for every one of the five messages, that its text includes `handbook/specs/engine-invariants.md` and does not match `/prospect/i`; then that the host message's text includes `FOUNDING_GLOBALS in scripts/lint/import-bounds.ts` and the libm message's includes `EXACT_MATH in scripts/lint/source-shape.ts`.
- Red at commit 1: zero messages for `RULE`, so the pairs assertion fails.
- Mutations: replace the founding `power` message with the prospect's (line 344's text at `b6c540eb`); pass `hostFree(FOUNDING_GLOBALS, { ...<the prospect's five messages>, host: <the founding host message> })`; in the founding host message change `FOUNDING_GLOBALS in scripts/lint/import-bounds.ts` to `PROSPECT_GLOBALS in scripts/lint/source-shape.ts`; drop `${COVENANT}` from the founding `ambient` message.

**The regression guard for the lift**: `test/repo/source-shape-prospect.test.ts`, UNCHANGED. It runs green at commit 2 (pasted into the PR body) before any founding code exists; a diff to that file anywhere in the pull request is a stop condition.

**Who proves what**: `vellum-guard-prover` owes T1, T2 and T3, at the head after commit 4, with the mutations listed under each (by line, each alone). The implementer proves only a guard it changes after the prover's round, per workflow step 15.

## Order of commits

1. `handbook/plans/829/829-plan.md` (this plan, copied unchanged) and `test/repo/import-bounds-founding.test.ts` (T1, T2, T3). Run `node --import ./test-support/source-read-guard.ts --test test/repo/import-bounds-founding.test.ts` and paste its three red assertion lines into the PR body. Push (CI is red until commit 3; expected).
2. `scripts/lint/source-shape.ts`: the `hostFree` lift. Run `node --import ./test-support/source-read-guard.ts --test test/repo/source-shape-prospect.test.ts` green, and `npm run lint` green.
3. `scripts/lint/import-bounds.ts` (the founding rule and its registration) and `eslint.config.ts` (the block). T1, T2, T3 green; `npm run lint` green (zero findings over the founding modules).
4. `handbook/specs/engine-invariants.md`: the doctrine edit below.

Then `npm run format`, re-run until `npm run format:check` passes, and commit any layout change as its own commit.

## Rosters and doctrine

- **The `vellum` plugin**: joined automatically, since line 31 of `eslint.config.ts` spreads `...importBounds.rules`.
- **The lint config**: one new block (Files). It is a conjunct pair under the ruled `src/**/*.ts` glob and names no single file, so `test/repo/lint-wiring.test.ts` asks no issue citation of its name; the rule is set by this block alone.
- **`test/repo/lint-wiring-rules.test.ts` and `test-support/lint-witnesses.ts`**: not joined (recon: the first's roster is stylesheet rules only, the second keys root globs). T2 is this rule's witness.
- **`handbook/specs/engine-invariants.md`**, "Founding a world from a sentence", the "Founding agrees across platforms or refuses" paragraph. Its last two sentences at `b6c540eb`:

  > Keep founding free of any locale-sensitive call, the clock and randomness. What no guard can hold is a character whose classification Unicode itself revises.

  become:

  > Keep founding free of any locale-sensitive call, the clock, randomness and any `Math` member that is not exact: `vellum/founding-locale-clock-free` (`foundingLocaleClockFree` in `scripts/lint/import-bounds.ts`) refuses them at lint time, and its approved lists are the list: `FOUNDING_GLOBALS` there, the built-ins founding may read, and `EXACT_MATH` in `scripts/lint/source-shape.ts`, the `Math` members, which the prospect rule shares and which does not grow for founding alone. A built-in joins `FOUNDING_GLOBALS` only with its reason, in the pull request that needs it. The rule reads the founding modules alone, never a module they import, so keep what founding calls from elsewhere (`hashString` in `src/core/rng.ts`, `defaultRecipe` in `src/world/generate.ts`) free of them too. What no guard can hold is a character whose classification Unicode itself revises.

  Rewrap that paragraph alone to the file's width; touch no other line.
- **`handbook/specs/rulebook.md`**: not edited. Its "Prospect byte pins" bullet cites `prospectLibmClockFree` in `scripts/lint/source-shape.ts`, which still holds after the lift, and the founding covenant's one home is `handbook/specs/engine-invariants.md`.
- No spec file is added, so no reading list changes.

## The shared files with the Issue #727 lane, and the merge order

Another lane is building Issue #727 (dropping `vellum/css-comment-no-em-dash`) in its own tree at the same time.

- **`eslint.config.ts`**: the only file both touch. This plan inserts one block after line 174 (between `"Issue #124: the philologist's glass"` and `"the house's rules on home's modules"`); Issue #727 deletes line 108 inside the stylesheet block. The hunks are more than sixty lines apart and merge textually in either order.
- **`test/repo/lint-wiring-rules.test.ts`**: Issue #727 deletes a `SHEET_RULES` entry; this plan does not touch the file.
- **Merge order**: none required, since no line is shared. Whichever pull request is second brings its branch current with `git merge origin/main` (never a rebase) and re-runs `npm run lint` and `node --import ./test-support/source-read-guard.ts --test test/repo/lint-wiring.test.ts test/repo/lint-wiring-rules.test.ts test/repo/import-bounds-founding.test.ts` on the combined state, putting the result in its body (workflow step 10).

## Evidence

- Commit 1's red, pasted: the three assertion failures from `node --import ./test-support/source-read-guard.ts --test test/repo/import-bounds-founding.test.ts`.
- Commit 2's green, pasted: `node --import ./test-support/source-read-guard.ts --test test/repo/source-shape-prospect.test.ts`, with `git diff origin/main -- test/repo/source-shape-prospect.test.ts` empty.
- `npm run lint` green (the new rule over the real tree: zero findings).
- `node --import ./test-support/source-read-guard.ts --test test/repo/import-bounds-founding.test.ts test/repo/source-shape-prospect.test.ts test/repo/import-bounds.test.ts test/repo/lint-wiring.test.ts test/repo/lint-wiring-rules.test.ts test/repo/lint-strict.test.ts test/repo/lint-config.test.ts`.
- `npm test`, then `npm run astro:generate`; `npm run check`; `npm run format:check`.
- The counted sizes: `node node_modules/eslint/bin/eslint.js --flag unstable_native_nodejs_ts_config --rule '{"max-lines":["error",{"max":1,"skipBlankLines":true,"skipComments":true}]}' scripts/lint/source-shape.ts scripts/lint/import-bounds.ts test/repo/import-bounds-founding.test.ts` (each under 400; name the three counts in the body).
- The guard prover's ledger for T1, T2, T3, with the sha it proved.
- No e2e suite: nothing here reaches a page. `vellum-plate-reader` is not owed: no appearance.

## Calls made

Each is a decision the issue did not rule on, taken here with its rule; the implementer copies them into its step 12 comment.

1. **The rule lifts the prospect rule's body into a factory, `hostFree` in `scripts/lint/source-shape.ts`, rather than copying it.** Rule: one home for one behavior (`handbook/specs/conventions.md`); the unchanged prospect test is the proof the lift kept that rule's behavior.
2. **The rule lives in `scripts/lint/import-bounds.ts`, beside `vellum/philology-no-entropy`.** Rule: the sibling's home, room under the cap (274 counted lines), and no import or line 31 edit in `eslint.config.ts`, which keeps the hunk shared with the Issue #727 lane to one inserted block.
3. **`FOUNDING_GLOBALS` is exactly the five globals founding reads today, measured, not the prospect's list, and does not take `Number` or `parseInt` ahead of Issue #856.** Rule: a scanner errs toward refusing where it can, and a built-in joins the list with its reason in the pull request that needs it, the prospect's own discipline (`handbook/specs/rulebook.md`, Prospect byte pins). Issue #856's number rule is the likely first to need one; the dispatcher has left that pointer on Issue #856 (comment 6282681072).
4. **The rule shares `EXACT_MATH` and `LOCALE_MEMBERS` with the prospect rule.** Rule: which `Math` members are exact and which members read the locale are facts of the language, not of a scope.
5. **A new block, "the house's rules on the founding modules", over `site("src/world/founding/**")`, after the Issue #124 block.** Rule: `handbook/specs/check-placement.md`, a new block named for what it covers when none reaches the same files; the world-generation block reaches modules that read typed arrays.
6. **The reach stays the issue's `src/world/founding/**`; the modules founding imports from are a named blind spot, not held.** Rule: the issue's scope, and CLAUDE.md's scanner rule (name the blind spot and its direction). Measured clean today: `src/core/rng.ts` passes the prospect reading with zero findings (it reads only `Math.imul` and `Math.floor`); `defaultRecipe` reads only the seeded rng and its fork, `weightedPick`'s float sums, constants, and `stripUndefined`'s `Object.entries`, whose order the language fixes.
7. **The test restates `FOUNDING_GLOBALS` as an oracle, and enumerates every other global from Node's `globalThis` plus a browser sample.** Rule: the prospect test's precedent; the oracle catches a name added as well as one dropped, which is why Gate 1 item 16's one-sidedness does not apply.
8. **The founding test copies the prospect test's helpers and browser sample rather than sharing them through `test-support/`.** Rule: the prospect test stays byte-unchanged, so its green run proves the lift.
9. **T3 pins all five refusals' text: each names the founding covenant and none the prospect, and the two list refusals name their list and its file.** Rule: the message is the only pointer a stopped developer gets to the list, and Gate 1 item 6 (guard the class): T1 reads only which refusal each line gets, so without T3 any one of the five could carry the prospect's wording and stay green.
10. **No unit test for the explicit-locale form.** Recon measured `"ISLE".toLocaleLowerCase("tr")` diverging in Node itself; the lint refuses both forms (rows 1 and 2), and what the code says is the lint's (`handbook/specs/check-placement.md`).
11. **`handbook/specs/rulebook.md` is not edited.** Rule: the founding covenant's one home is `handbook/specs/engine-invariants.md`, and the rulebook's index is a convenience, not a second home.
12. **No lint wall-clock measurement.** The rule is untyped and reads four files; `handbook/specs/check-placement.md` asks a stricter rule's count of findings over the tree, which `npm run lint` gives as zero.

## The plan skeptic's findings, and what became of each

- **T3 read one message of five (should fix): folded.** T3 now reads all five refusals' text (Tests, Calls made 9).
- **Issue #856 will probably be the first to need `Number` or `parseInt` (should fix): folded** into M1's consequence and Calls made 3; no design change, since a built-in joining with its reason is the mechanism for exactly this.
- **`defaultRecipe` also reads `Object.entries` through `stripUndefined` (nit): folded** into blind spot 1 and Calls made 6.
- **The doctrine sentence named only one of the two lists (nit): folded**; it now names `EXACT_MATH` too, as shared.
- **A host value read off a `Date` handed in passes (nit): folded** into blind spot 4 and the test's `BLIND_SPOTS` message.
- **The header's Rulings line (nit): folded** with the rulings.
- **Stop conditions keyed to line numbers would stop on the Issue #727 lane's harmless shift (refuted attack, kept as a fix): folded**; the first stop condition now keys on names.

## The menu, as ruled

Both items were ruled at option A (https://github.com/ahl-gram/Vellum/issues/829#issuecomment-6282680339, under Alex's delegation, comment 6282251471), and the plan above is written to them. The options as they were put are kept below for the record; none is open.

**M1. How much the rule refuses. Ruled: A.**
- **A (recommended).** Refuse everything founding does not need: founding may read only `Array`, `Map`, `Set`, `undefined` and the exact `Math` members, and everything else from outside is refused. That covers every item the issue names plus the browser's language setting, the new `Temporal` clock, timers, `process`, `eval`, the `Math` functions whose last digits differ between browsers (sine, power) and the `**` operator. It is built on the engine the prospect rule already uses and proves. Today's founding code passes untouched (measured). A future founding change that needs another built-in adds it to the list with its reason. The likely first is Issue #856 (the founding's number rule, "100 islands", "1,000 islands"): turning a run of digits into a number is where `Number` or `parseInt` would come in, and both are refused until that pull request adds one to the list with its reason (both read their argument alone, so the reason is short). The engine-invariants line widens to name the inexact `Math` members.
- **B.** Refuse only the issue's named list, as the philologist's rule does. Anything not named passes, including the browser's language setting, `Temporal`, timers, sine and `**`. It is a new rule of its own, with no shared engine. Measured: the philologist's rule, the shape B would copy, run over the same 63-line plant at `src/society/philology.ts`, passes 29 of the 42 rows A refuses and wrongly refuses four of the lines that should pass (the `rng` import, and `Date` written only as a type or an object key); B would add the issue's locale members and `Intl` to that list, and rows 15 and 21 to 42 would still pass unless each is named.

**M2. The names. Ruled: A.**
- **A (recommended).** Rule `vellum/founding-locale-clock-free` and list `FOUNDING_GLOBALS`, both in `scripts/lint/import-bounds.ts`; the shared engine `hostFree` in `scripts/lint/source-shape.ts`; test `test/repo/import-bounds-founding.test.ts`; config block "the house's rules on the founding modules". These mirror `vellum/prospect-libm-clock-free` and its test `test/repo/source-shape-prospect.test.ts`.
- **B.** The same, with the rule named `vellum/founding-same-everywhere`, which says what the rule protects rather than what it refuses.
- **C.** A file of its own, `scripts/lint/founding.ts`, tested by `test/repo/founding.test.ts`. It costs a new import line in `eslint.config.ts` and an edit to the long plugin line there, which widens what the parallel Issue #727 lane shares.

## Stop conditions

Hand back, through the dispatcher, without adapting, when:

- At `origin/main` when you start, `prospectLibmClockFree` in `scripts/lint/source-shape.ts` is not as quoted (one object literal with `meta.messages` holding exactly `power`, `libm`, `host`, `module` and `ambient`, and a `create` whose one read of `PROSPECT_GLOBALS` is the `.has` call in `"Program:exit"`), or `philologyNoEntropy` is not in `scripts/lint/import-bounds.ts`, or no block named `"Issue #124: the philologist's glass"` is in `eslint.config.ts`. The line numbers this plan quotes are those of `b6c540eb`; a shift (the Issue #727 lane's deletion of line 108 moves the Issue #124 block up by one) is not a stop.
- `test/repo/source-shape-prospect.test.ts` goes red at any commit, or the pull request's diff touches it.
- `npm run lint` reports `vellum/founding-locale-clock-free` in any real file, or any founding module reads a global outside the five or a `Math` member outside `max`, `min` and `round`.
- T1's or T3's actual reports differ from the expected list in any row (a row reporting twice, not at all, or with another arm), or `OFF_LIST.length` is 50 or fewer. Report the actual list; do not edit the table to fit.
- T1, T2 or T3 is green at commit 1, or red at commit 1 on anything but its named assertion (a fatal parse, a config error, a thrown import).
- `npm run check` rejects `hostFree`'s signature. (A scratch probe of exactly that signature and its `meta: { type: "problem", messages }`, run through `tsc --noEmit --strict --target ES2023 --module nodenext --moduleResolution nodenext --types node --noUncheckedIndexedAccess --verbatimModuleSyntax --erasableSyntaxOnly --skipLibCheck` with the main checkout's TypeScript, exited 0 at `b6c540eb`.)
- `scripts/lint/source-shape.ts`, `scripts/lint/import-bounds.ts` or the new test is over 400 counted lines, or `hostFree`'s `create` is over 50.
- `test/repo/lint-wiring.test.ts` reds on the new block, or another block already sets `vellum/founding-locale-clock-free`.
- The Issue #727 lane has merged and the combined state conflicts in any line this plan edits, or reds a test above.
- The guard prover reports a HOLE on any mutation listed under T1, T2 or T3.
