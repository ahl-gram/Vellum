# Issue #393 plan: the Writing Room, where a sentence founds a world and its link carries it

**Planned at:** `origin/main` `d9565ee328cf793783ce383d1802cb74c81bb454` (d9565ee3, `git fetch origin main` then `git rev-parse FETCH_HEAD`, read when the rulings were folded in), Issue #393 read with 12 comments (`gh api repos/ahl-gram/Vellum/issues/393/comments --paginate | jq length` printed 12; the newest is 6550899486, the follow-up rulings). First planned at 3feaa3af with 10 comments; the one commit between, d9565ee3 (PR #1158, Issue #1020), touches no file this plan creates, edits or imports (`git diff --stat 3feaa3af FETCH_HEAD`, 48 files, listed under "Lanes beside this one"), so the measurements taken at 3feaa3af stand. Also read: Epic #278 (body and 7 comments), Epic #844 (body and comments, the newest 6545165577), Issues #390, #391, #392, #851, #854, #856 (newest 6548688836), #1107, #1142, #1146, #1154, #857.

**Rulings:** https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6550522707 (Alex, 2026-10-31), his picks quoted by option label:
1. Does the room wait for the typed "north like Italy, south like Florida" request: "A: don't wait (Recommended)". This reverses his 2026-10-20 ruling that the room waits for it.
2. How a visitor reaches the room: "A: the eighth item on the top menu, after Explorer (Recommended)".
3. The room's name: "A: The Writing Room, at /writing-room/ (Recommended)".
4. Where the writing line stands: "A: a three-line box at the top of the right-hand panel (Recommended)".
5. Does the room teach the word list: "A: no, only the account of the visitor's own words". (Not the recommended option.)
6. Which worlds open on the vegetation plate: "B: only when climate words and naming-language words are all that steered: 42 (Recommended)".
7. A sentence whose recognised words all cancel: "A: lettered on the chart, and the room says no word steered (Recommended)".
8. Where a written world can go from the room: "B: a second pull request adds "explore it in the Explorer"". (Not the recommended option.)
9. The glossary entry for "grapheme": "C: a new glossary section for the room's own words". (Not the recommended option.)

https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6550899486 (Alex, 2026-10-31), the follow-up menu's three, his picks quoted by option label:
10. The new glossary section's name: "C: "The founding words"".
11. Which words it explains: "A: four entries, alphabetical (Recommended)". Chart number, Founding, Grapheme and Steer.
12. The Print Room's top-right corner with the eighth menu item: "A: accept it and leave the fix to Issue #741 (Recommended)".

**Open decisions:** none.

---

## Recon

`vellum-spec-recon` ran on 2026-10-31 at 3feaa3af. Its ledger: 9 STALE (5 blocking), 11 CURRENT, 1 UNVERIFIABLE. The STALE claims that changed this plan:

- **`scripts/e2e/*.mjs` is gone**: e2e is TypeScript, one entry per suite at the top of `e2e/suites/` with its parts in a folder beside it (`handbook/specs/site-architecture.md`). The suite here is `e2e/suites/writing-room.ts`.
- **`public/charts/*` and `public/og.png` are now `src/static/charts/*` and `src/static/og.png`.** Neither moves here.
- **The 360px nav measurement is replaced by one at 1024, at the browser's default text size** (Issue #393 comment 6041138856; `handbook/specs/rulebook.md`, Retired rules, the nav-tax bullet). Measured (M1).
- **Epic #278 is closed; this issue is a sub of Epic #844.**
- **The identity keys are more than `seed`, `type`, `band`, `land`, `coast`**: Issue #854 added `outline`, `looseness`, `islands`, `isleSize`, `raggedness` (`SHAPE_KEYS` in `src/site/shared/shape-address.ts`), and no site reader knows `culture` or `foundingText` yet (`grep -rn culture src/site` finds only `cultureId` in `src/site/shared/living-chart/place-overlay.ts`, a different thing). Ruling 8 sends that to this issue's second pull request.
- **The body's hold** (comment 6281801417) is lifted by ruling 1.

UNVERIFIABLE in the ledger: "founding on the main thread pulls the generator into the page bundle". Measured instead (M4).

## Two pull requests

Ruling 8 makes this issue two pull requests (workflow step 8):
- **This plan, `393-plan.md`, is pull request 1**: the room, its link, and the lock. Its body's reference line reads `Issue: #393, stays open because its second pull request carries a written world into the Explorer and the other rooms (ruling 8, https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6550522707)`, with no closing keyword anywhere beside #393 in the body or in any commit message, and `gh pr view <N> --json closingIssuesReferences` is read to print `[]` (`.github/PULL_REQUEST_TEMPLATE.md`, the note on the closing line; `vellum-footguns` Gate 5 item 5).
- **Pull request 2, `393-pr2-plan.md`**, is planned by a fresh `vellum-planner` after pull request 1 merges: a road "Explore it in / The Explorer" from the room, the Explorer reading a written world, and the other rooms' readers learning the naming tongue (`culture`) and, where they draw a world chart, the founding text. Its body carries `Closes #393`.

**What pull request 1 leaves ready for pull request 2:**
- `src/site/writing-room/address.ts`, `founding.ts`, `names.ts` and `account.ts` are DOM-free and import nothing from the room's DOM modules (`app.ts`, `view.ts`), so pull request 2 lifts the ones the Explorer needs into `src/site/shared/` as a pure move, the house's lift at second use (`handbook/specs/ui-design.md`, "The kit is lifted at second use, never at first", the same rule for code a second bundle needs).
- `recipeOverrides` is the one place `foundingText` joins a recipe, and `createFounder` takes its name source as a parameter, so the Explorer founds through the same check.
- The legend row keeps the label "The Press" and one button, so pull request 2 seats its road beside the press (`ROADS` and `KIT_ROADS` gain it then).

**The lock holds across pull request 2, and these guards say so:** pull request 2 changes site address grammars, never the founding.
- The room's link: T1 and T2 pin `readWritten` and `writtenHash` (a missing `v` is version 1). Pull request 2 reads a `found` and `v` pair anywhere through that same `readWritten`, lifted, so no second reading of `v` exists.
- Version 1 itself: the four covenant files (`test/world/founding-covenant.test.ts`, `founding-count-covenant.test.ts`, `founding-shape-covenant.test.ts`, `founding-sample.test.ts`) and T3's `NAMES_CHECKSUM` pin.
- Every existing link in another room: an address with no `culture` key draws the world it drew, since an absent `culture` is the seed's own draw (engine-invariants, "An absent `culture` is the seed's own draw"; `test/world/culture-pin.test.ts`).

## The lock, and what a second word list means

Ruling 1 reverses Alex's ruling of 2026-10-20 (Issue #844 comment 6281800234, "Version 1, hold 393 back"). Merging pull request 1 makes the written-world link public, and from that moment version 1 of the founding is locked (Issue #391 ruling 2): its cleanup, small words, clash rule, strengths, climate traditions, word list, number rule, band words, shape phrases and the place-name index (`src/world/outline-place-names.json`, pinned by `NAMES_CHECKSUM`) never change again. Every later change lands as version 2, added beside version 1 rather than over it: `FOUNDING_VERSION` becomes 2, `foundWorld(sentence, 1)` keeps founding version 1's world forever, the room writes `v=2` on the links it writes from then on, and a link with `v=1` or no `v` keeps founding version 1. Version 2 is where these now land: the typed, combined place request's words (unfiled), Issue #848's candidates, and any rename, removal or addition in the place list, Issue #1142's "Valmiera" rows among them. Where version 2 changes the place list, version 1 keeps founding from its own list; how both lists are served is version 2's plan to settle.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes:

- `handbook/specs/engine-invariants.md`: "Founding a world from a sentence", every paragraph; this plan edits two of them (Rosters and doctrine). "World identity is entry-point independent" (the room draws through `runJob`).
- `handbook/specs/site-architecture.md`: "How a page is authored", the bullets on the four kinds of reach, "A reading page is cheap and a working page is not", "The rosters are found by grepping" and "The rosters a page or a sheet joins"; "The two contractual forms" (copy the Print Room's bundle-twin script tag whole); "Build, check and deploy", the bullet "A real place's outline is served one file to a place" (this plan edits it).
- `handbook/specs/ui-design.md`: "The room and its furniture" (a chart room with a stage, the room folio, the slip, the legend row, the zoom room's follow), "The voice" (a slip introduces itself as verb, title, where; a press acting on the sheet wears a button's dress; a glossed section runs to a small band of terms, alphabetical, one headword each; do not invent a fact for flavour; a count in prose is derived, never written), "Colour, contrast and legibility".
- `handbook/specs/conventions.md`: "The fidelity rule" (build to the stills of this sitting, `out/393/` in the main checkout), "Do not state a provisional ruling in the same voice as a ratified one" (the pull request body names the feel rulings awaiting the post-use review: the room's layout and copy, the account's words, the plate press, the Glossary section's name and wording), "A sitting held at the workflow's STOP is not a round" (no `design/` archive), "How code is cited", "The comment sweep".
- `handbook/specs/settle-doctrine.md`: the clauses on waiting for a page-reported state, and "The environment" (the harness serves the BUILT site; one fixed day).
- `handbook/specs/check-placement.md`: "The unit suite" and "The browser lanes and a plate read".
- `handbook/specs/rulebook.md`: "Golden and committed-chart discipline" (nothing here moves a chart, a seed or the golden), the Issue #844 slot line and the nav-tax bullet, both of which this plan rewrites.
- `handbook/specs/cascade-traps.md`, before the page sheet.
- `handbook/specs/explorer-doctrine.md`: "The camera, the gesture and the fit", the bullets that name every chart room (the room takes its camera pair from `framingCamera` and its keys from `bindGlassKeys`, both through `bindZoomRoom`). The room mounts no living chart, so "The engine boundary and the host contract" and "Overlay lifecycle" do not bind it.
- `handbook/specs/development-workflow.md` steps 8 to 15.

## The design

**One new chart room, a working page with its own bundle, built from the Atelier Kit like the Specimen Book and Today.** The writing line stands at the head of the room's slip (ruling 4); the founded chart stands on the stage; the slip under the line accounts for every word and teaches no list (ruling 5); the chart folio carries the chart number; the legend row carries one press that lays the vegetation plate on or lifts it. The room is "The Writing Room" at `/writing-room/` (ruling 3), the eighth item on the nav's top line, after the Explorer (ruling 2). The Glossary gains a section for the room's own words, "The founding words" (rulings 9, 10 and 11).

**The founding runs on the page's main thread; the chart is drawn by the shared render worker.**
1. The room reads its address (below). A bare visit founds the house's example sentence, `"a cold archipelago of black pines, iron harbors, and a drowned kingdom"` (the epic's own), shows it in the line, and leaves the hash bare.
2. `foundWorld(sentence, version)` (`src/world/founding/found.ts`). On the refusal `places-not-loaded` the room fetches the name index through the Explorer's own loader (`createNameLoader` in `src/site/explorer/place-names.ts` over `namesUrl` in `src/site/explorer/place-fetch.ts`, Issue #856 ruling 8), checks it (below), installs it with `setFoundingGazetteer` (`src/world/founding/shapes.ts`) and founds again. A sentence with no shape phrase never fetches it. A fetch that fails, or a list that fails the check, is the room's own refusal `names-unread`; `places-not-loaded` is never shown (engine-invariants, "A refusal is a value").
3. Any other refusal is shown under the line in the refusal ink and nothing else changes: the chart, the folio, the account and the address stay those of the last world founded. The address is written only for a founded sentence.
4. The recipe overrides are the founding's own `overrides`, plus `foundingText: f.sentence` when at least one word was recognised, meaning `steered` or `contested` is non-empty (Issue #390 ruling 8; "a recognised word is in exactly one of the two", engine-invariants). So a sentence whose recognised words all cancelled is lettered and given the quiet line (ruling 7).
5. `runJob({ kind: "draw", seed: f.seed, overrides, render: { style: "antique", legend: true, theme } })` (`src/site/explorer/worker-client.ts`), after `initWorker()`. `runJob` loads a real place's outline before it sends the job (`placeOfJob`, `createPlaceGate`), so a shaped sentence draws its place. `theme` is `"vegetation"` when the world opens on the vegetation plate (below), else absent.
6. The SVG goes into `#map`; the chart folio's title and survey line are the result's `title` and `subtitle`; its third line is `Chart № <seed> · <a/an> <map type>, <band>`, Today's form. The account is written into the slip.

**The vegetation plate** (ruling 6). A world opens on it when at least one climate word still sets the climate after the clash and every word that steered set only the climate or the naming tongue (42 of the 200 kept sentences, M2). Every founded world carries the press in the legend row: "Lay on / The Vegetation Plate" while the plain chart stands, "Lift / The Vegetation Plate" while the plate is on; a press redraws the same founding with the other theme. The plate's state is not written into the address (C7).

**The address.** `#found=<sentence>&v=<version>`, written by `URLSearchParams` (spaces as `+`) through `history.replaceState`, the sentence being the founding's display form `f.sentence`, which founds itself again unchanged (engine-invariants, "What a surface may read"). A link with no `v` means version 1, forever. A `v` that is not a whole number above zero reads as version 0, which `foundWorld` refuses as `unknown-version`. Every other key in the hash is ignored, identity and dress alike, since the room has no control for any of them; this amends the body's acceptance line "dress keys still apply" (ruling 8 sends the Explorer's vocabulary to pull request 2). The room founds again on `hashchange`, so a link pasted into the same tab opens its world.

**The account (in the slip, under the line), read from the founding's real output** (the brief's point c):
- "The words that steered": one line per entry of `f.steered`, `<phrase> set <what>`, the what being each kept steer in words (`steerWords`, Files). A count that gave way to a shape stays here with only its land kind, exactly as `steered` holds it (`"100 islands shaped like Texas"`: "100 islands set an archipelago", "shaped like texas set the shape of Texas"); the account never invents the count it lost.
- "The words that disagreed", only when `f.contested` is non-empty: one line, the phrases joined by ", ", then ": each cancelled the other, so they count toward the chart number".
- "The chart number": `№ <seed>, from “<residual>”`, or `№ <seed>, from no words at all` when the residual is empty.
- When `f.steered` is empty, the quiet line takes the place of the first heading: "None of these words steered the world; its chart number alone drew it." (Issue #390 ruling 7).

**No list is taught** (ruling 5): the slip holds the line, the refusal line, the account and the foot note, and nothing renders `FOUNDING_RULES` or the word list. The still `teach-none-1024.png` shows it.

**The name index check** (the brief's point b). `NAMES_CHECKSUM = 2151669449` is `hashString(JSON.stringify(rows))` over the committed `src/world/outline-place-names.json` (M3); T3 pins it to the committed file with a message that a change is version 2's. Before installing a fetched list the room computes the same hash and installs only on a match. With the existing pins (the place-name founding checksum 3158117445 in `test/world/founding-shape-covenant.test.ts`; `test/site/place-files.test.ts`, which holds the served copy byte-equal to the committed one) this turns a stale or foreign list, which would otherwise found different worlds under version 1 with no refusal, into the refusal `names-unread`. It also keeps `setFoundingGazetteer`'s one throw (`placeId` on an unknown ID) unreachable from the page.

**The Glossary section for the room's words** (rulings 9, 10 and 11). A new `h2`, "The founding words", directly after "At the drafting table" and before "Soundings & sea marks" in `src/pages/glossary/index.astro`, with its intro and four terms in alphabetical order (Files). Nothing on the room links to it: the stills show no glossary mark, and a footnote mark like the Broadside's is not ruled.

**Rejected alternatives**, so none is rediscovered mid-build:
- *The sentence in the Explorer*: reverses the ratified destinations rule (`handbook/specs/rulebook.md`, "New interactive surfaces are DESTINATIONS"); ruling 2 seats the room on the nav.
- *Rendering inline on the main thread as Today does*: a shaped sentence needs its place's rings loaded first, which `runJob` already does through `loadPlace`; drawing inline would need a second place loader.
- *Writing the hash before founding*: a refused sentence would leave a link that founds nothing.
- *Honouring the Explorer's dress keys (`style`, `theme`, `legend`, `arms`, `beasts`, `cx`, `cy`, `k`) and live keys (`year`, `survey`) in the room*: the room has no control that writes them and no instrument that reads the live ones.
- *Bundling the name index into the room*: Issue #856 ruling 8 chose the list the shape box fetches.
- *A live character count of the raw input*: it disagrees with the cap on whitespace and invisible characters; the count is taken from the same cleanup `displayForm` uses (`displayText`).
- *Putting the room's words in "At the drafting table"*: ruling 9 asks for a new section.

## Files

### Created

**`src/site/writing-room/address.ts`** (DOM-free):
```ts
const FOUND_KEY = "found";
const VERSION_KEY = "v";
const UNVERSIONED = 1;
export type Written = { readonly sentence: string; readonly version: number };
export function readWritten(hash: string): Written | null;
export function writtenHash(sentence: string, version: number): string;
```
The three constants stay module-local: nothing outside the file reads them (Issue #1020's rule, an export has a caller outside its file). `readWritten`: `new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash)`; no `found` key: `null`; `v` absent: `UNVERSIONED`; `v` matching `/^[1-9][0-9]{0,8}$/`: `Number(v)`; any other `v`: `0`. Never throws. `writtenHash`: `"#" + new URLSearchParams([[FOUND_KEY, sentence], [VERSION_KEY, String(version)]]).toString()`.

**`src/site/writing-room/names.ts`** (DOM-free):
```ts
import type { GazetteerRow } from "../../world/founding/shapes.ts";
export const NAMES_CHECKSUM = 2151669449;
export function installNames(rows: ReadonlyArray<GazetteerRow>): boolean;
```
`installNames`: `hashString(JSON.stringify(rows)) !== NAMES_CHECKSUM` returns `false` and installs nothing; otherwise `setFoundingGazetteer(rows)` and `true`. One comment line above the constant: `// hashString of JSON.stringify(rows) over src/world/outline-place-names.json, measured 2026-10-31 (Issue #393); the list is version 1's, so a new value is version 2's.`

**`src/site/writing-room/founding.ts`** (DOM-free):
```ts
import type { Founding } from "../../world/founding/found.ts";
import type { RefusalReason } from "../../world/founding/normalize.ts";
import type { WorldRecipe } from "../../world/types.ts";
import type { GazetteerRow } from "../../world/founding/shapes.ts";
export type RoomReason = Exclude<RefusalReason, "places-not-loaded"> | "names-unread";
export type RoomRefusal = { readonly ok: false; readonly reason: RoomReason };
export type NameSource = () => Promise<ReadonlyArray<GazetteerRow>>;
export type Founder = {
  readonly found: (sentence: string, version: number) => Promise<Founding | RoomRefusal>;
  readonly installed: () => ReadonlyArray<GazetteerRow> | null;
};
export const lettered = (f: Founding): boolean;
export function opensOnPlate(f: Founding): boolean;
export function recipeOverrides(f: Founding): Partial<WorldRecipe>;
export function createFounder(names: NameSource): Founder;
```
- `lettered`: `f.steered.length + f.contested.length > 0`.
- `opensOnPlate`: `f.steered.some((r) => r.steers.some((s) => s.subject === "band")) && f.steered.every((r) => r.steers.every((s) => s.subject === "band" || s.subject === "culture"))`.
- `recipeOverrides`: `{ ...f.overrides, ...(lettered(f) ? { foundingText: f.sentence } : {}) }`.
- `createFounder(names)` holds `let rows: ReadonlyArray<GazetteerRow> | null = null` in its closure and returns `{ found, installed: () => rows }`. `found(sentence, version)`: `foundWorld(sentence, version)`; on `places-not-loaded` with `rows === null`: `await names()` (a rejection is `names-unread`), then `installNames(fetched)` (`false` is `names-unread`, and `rows` stays `null` so the next shaped sentence tries again; `createNameLoader` already drops a failed load), else `rows = fetched` and `foundWorld` again; any other refusal is returned as it is (its reason is a `RoomReason`). A founding whose outline is a real place always comes after an install, so `installed()` is never `null` when the account needs a place's name.

**`src/site/writing-room/account.ts`** (DOM-free):
```ts
import type { Founding } from "../../world/founding/found.ts";
import type { Steer } from "../../world/founding/lexicon.ts";
import type { OutlineId } from "../../world/outline-ids.ts";
import type { RoomReason } from "./founding.ts";
export type AccountLine = { readonly phrase: string; readonly set: string };
export type Account = {
  readonly steered: ReadonlyArray<AccountLine>;
  readonly contested: ReadonlyArray<string>;
  readonly quiet: boolean;
  readonly seed: number;
  readonly residual: string;
};
export const QUIET_LINE = "None of these words steered the world; its chart number alone drew it.";
export function refusalWords(reason: RoomReason, length: number): string;
function steerWords(steer: Steer, placeName: (id: OutlineId) => string): string;
export function accountOf(f: Founding, placeName: (id: OutlineId) => string): Account;
export function chartNumberLine(account: Account): string;
```
- `steerWords`: `mapType` island "an island", archipelago "an archipelago", continent "a continent", citystate "a city-state"; `band` polar "a cold climate", tropical "a warm climate", temperate "a temperate climate"; `land` more "more land", less "less land"; `coast` ragged "a ragged coast", smooth "a smooth coast"; `culture` `names in the ${Capitalised id} tongue` (the id with its first letter upper-cased, "Norden"); `outline` `the shape of ${placeName(value)}`; `islands` `about ${value} islands`; `isleSize` varied "islands of every size", equal "islands alike". An exhaustive `switch` on `steer.subject`, so a new subject is a type error.
- `accountOf`: `steered` maps `f.steered` to `{ phrase: r.phrase, set: r.steers.map((s) => steerWords(s, placeName)).join(" and ") }`; `contested` is `f.contested.map((r) => r.phrase)`; `quiet` is `f.steered.length === 0`; `seed` and `residual` copied.
- `chartNumberLine`: `№ ${seed}, from “${residual}”`, or `№ ${seed}, from no words at all` for an empty residual.
- `refusalWords(reason, length)`, `length` being `Array.from(displayText(input)).length` for the refused input (the count the slip's counter shows): `empty` "Write a sentence first."; `too-long` `A founding sentence is at most ${MAX_SENTENCE_CODE_POINTS} characters; this one has ${length}.` (as `refusal-1024.png` shows it); `control-character` "The sentence holds a control character; write it as plain text."; `unknown-character` "The sentence holds a character this browser does not know; write it without that character."; `unknown-version` "This link was written with founding words this page does not have."; `names-unread` "The names of the world's places could not be read, so this shape cannot be drawn; try again."
- The page's `placeName` (in `app.ts`): a form ID (`isFormId` in `src/world/outline-ids.ts`) reads `a ${id}`; a place ID reads its name from `founder.installed()` through `nameOf` in `src/site/explorer/place-match.ts` (the rows cast to `ReadonlyArray<NameRow>`), else the ID itself.

**`src/site/writing-room/view.ts`** (DOM): `renderAccount(box: HTMLElement, account: Account): void`, building the markup the spike builds (`wr-head`, `wr-steered`, `wr-word`, `wr-contested`, `wr-quiet`, `wr-residual`), text only through `textContent`.

**`src/site/writing-room/app.ts`** (the conductor, the bundle entry, under 200 lines, every function under 50): binds the room with `bindZoomRoom` (`src/site/shared/zoom-room.ts`) over `.stage`, `#sheet`, `#map-viewport`, `#map`; `const founder = createFounder(createNameLoader((url) => fetch(url)) as NameSource)`; reads `readWritten(location.hash)` (null founds `EXAMPLE` and leaves the hash bare); founds, draws and accounts as "The design" says, a refusal writing `refusalWords(reason, Array.from(displayText(input)).length)` into `#wr-refusal`; on submit of `#wr-form` (and Enter without Shift in `#wr-line`) founds the line's value and, on success, `history.replaceState(null, "", writtenHash(f.sentence, f.version))`; listens for `hashchange`; the press `#wr-plate` redraws the held founding with the other theme; the counter `#wr-count` reads `${Array.from(displayText(line.value)).length} of ${MAX_SENTENCE_CODE_POINTS}` on every `input`. The e2e hook:
```ts
declare global { interface Window { __vellumWritingRoom?: () => RoomState } }
type RoomState = { readonly n: number; readonly seed: number | null; readonly refusal: RoomReason | null; readonly plate: boolean; readonly lettered: boolean };
```
`n` counts settled attempts (each founding drawn, each refusal shown, each redraw by the plate press), so a suite waits for it to advance; a refusal keeps `seed`, `plate` and `lettered` of the world still standing. `const EXAMPLE = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";`.

**`src/pages/writing-room/index.astro`**: the spike's page (read in the main checkout's `out/393-dry-run/spike/index.astro`) without the corner form, with these exact pieces in this order: `BaseLayout` (`room="The Writing Room"`, `description="Write a sentence and Vellum founds a world from it, in your browser. The same sentence founds the same world, forever."`, `path="/writing-room/"`, `chartRoom`, `extraCss={["/shared/slide-away.css", "/shared/chart-stage.css"]}`); `Fog`; `ChartStage label="The founded chart. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet."` with `StageNotices slot="after" pillId="status"`, pill "Founding the world&hellip;", noscript "A world is founded from its sentence in your browser, so this room needs JavaScript. You can still <a href="../explorer/">draw any seed in the Explorer</a>."; `Vignettes`; `RoomFolio room tagline="every sentence is a world, write one"` holding only `<p class="gloss">the same sentence founds the same world, forever</p>`; `Slip id="founding" verb="Write one" title="The Founding" where="the sentence, and what each word did" fold="Fold the founding away"` holding `<form id="wr-form" class="wr-form" aria-label="The founding sentence">` (`<textarea id="wr-line" class="wr-line" rows="3" spellcheck="false" aria-label="the founding sentence"></textarea>`, `<div class="wr-actions"><span class="wr-count" id="wr-count"></span><button class="primary" type="submit">Found</button></div>`), `<p class="wr-refusal" id="wr-refusal" role="status" aria-live="polite"></p>`, `<div class="wr-account" id="wr-account"></div>`, and the foot note "Words on the founding list steer the world; every other word makes its chart number. Nothing leaves your browser."; `ChartFolio lines={[["folio-sub", "folio-sub"], ["folio-coords", "folio-coords"]]}`; `LegendRow label="The Press"` with head "The Press &middot; what the sheet can do next" and `<button id="wr-plate" class="legend-btn" type="button"><span class="verb" id="wr-plate-verb">Lay on</span><span class="room">The Vegetation Plate</span></button>`; `Glass`; the Print Room's script tag `<script type="module" src="./app.bundle.js" is:inline></script>`.

**`src/styles/writing-room/index.css`**: the spike's sheet (`out/393-dry-run/spike/index.css`) with the `.folio-room.tr`, `.wr-corner .wr-line` and both `body[data-line]` rules removed, the rules naming `.wr-rules` or `.wr-words` removed (ruling 5), the selectors `.wr-area` and `.wr-area:focus-visible` renamed `.wr-line` and `.wr-line:focus-visible`, and every other rule as the stills show it. Read `handbook/specs/cascade-traps.md` first; colours only by token.

**Test files** (Tests, below): `test/site/writing-room-address.test.ts`, `test/site/writing-room-names.test.ts`, `test/site/writing-room-founding.test.ts`, `test/site/writing-room-account.test.ts`, `e2e/suites/writing-room.ts`, `e2e/suites/writing-room/kit.ts`, `e2e/suites/writing-room/checks.ts`.

**`handbook/plans/300/393/393-plan.md`**: this file, copied unchanged.

### Edited

- **`src/world/founding/normalize.ts`**: `displayForm`'s cleanup becomes `export function displayText(input: string): string` (the `INVISIBLE` removal, the zero-width space to a space, `normalize("NFC")`, the whitespace collapse, `trim()`), and `displayForm` calls it after its two character checks. Behaviour unchanged: every pin in the four covenant test files stays green, which is the evidence.
- **`src/layouts/nav.ts`**: `NAV_ITEMS` gains `{ label: "Writing Room", href: "/writing-room/", kind: "room" }` directly after the Explorer's entry; `ROUTE_NAMES` gains `"/writing-room/": "The Writing Room"`.
- **`src/pages/glossary/index.astro`**: directly after the "Survey" entry's `<p class="def">` and before `<h2 id="soundings">`, the section below, as rulings 10 and 11 set it (nothing else in the page moves):
```html
<h2 id="founding-words">The founding words</h2>
<p class="intro">The words of the Writing Room, where a sentence founds a world.</p>

<p class="term" id="chart-number">Chart number</p>
<p class="def">The number in a chart's corner. A chart drawn from a seed with
nothing else set is drawn again from that number alone. A world founded from a
sentence takes its number from the words the founding list does not know, the
small joining words left out, and is drawn again from its sentence.</p>

<p class="term" id="founding">Founding</p>
<p class="def">Writing a world into being. In the Writing Room a sentence
founds a world: the words on the founding list steer its land, its climate and
the tongue its places are named in, and the rest make its chart number. The
same sentence founds the same world, forever.</p>

<p class="term" id="grapheme">Grapheme</p>
<p class="def">One letter as a reader sees it, however many characters it is
stored as: a letter with its accent, a flag, a face with its skin tone. A
founded chart wraps its sentence between graphemes, so each of those stays
whole on its line, though the Writing Room's count counts the stored
characters, so a flag counts as two.</p>

<p class="term" id="steer">Steer</p>
<p class="def">What a word on the founding list does to a founded world: it
sets the kind of land, the climate, how much land there is, the coast, a shape,
a count of islands and their sizes, or the tongue its places are named in. Two words that
disagree about one of these both stop steering it.</p>
```
- Every roster in "Rosters and doctrine".

## Tests, in the order they are written

Unit tests first (commit 1, red on their stubs), then the browser suite (commit 3).

**T1. `test/site/writing-room-address.test.ts`, "a written link carries the display sentence and its version, and founds the same world when read back".** `useCommittedGazetteer()` (`test-support/founding-gazetteer.ts`); for every sentence of `test/world/founding-sample.json` plus `["an isle where 2+2=5 & the tide is 100% #1", "Fire & Ice: a cold isle", "  spaced   out  words  "]`: `f = foundWorld(s)`; skip a refusal; `const back = readWritten(writtenHash(f.sentence, f.version))`; `assert.deepEqual(back, { sentence: f.sentence, version: f.version })`; `assert.deepEqual(foundWorld(back!.sentence, back!.version), f)`. Stub (commit 1): `readWritten` returns `null`, `writtenHash` returns `"#"`; red on the first `deepEqual`. Mutation: `writtenHash` builds the string by hand as `` `#found=${encodeURI(sentence)}&v=${version}` `` (red on the `&`, `+`, `#` and `%` rows).

**T2. same file, "a link with no version means version 1, a version that is not a whole number founds nothing, and no hash throws".** `readWritten("#found=a+cold+island")` deep-equals `{ sentence: "a cold island", version: 1 }`; `readWritten("found=a+cold+island&v=2")?.version === 2`; `readWritten("#found=x&v=abc")?.version === 0` and `foundWorld("x", 0)` deep-equals `{ ok: false, reason: "unknown-version" }`; `readWritten("#seed=42&type=island") === null`; `readWritten("") === null`; `readWritten("#found=%E0%A4%A&v=1")` returns a `Written` (no throw); `readWritten("#found=&v=1")` deep-equals `{ sentence: "", version: 1 }`. Stub: as T1. Mutation: an absent `v` reads `2` (red on the first assertion).

**T3. `test/site/writing-room-names.test.ts`, "the room installs only the name index version 1 was pinned with".** `setFoundingGazetteer(null)`; `rows = committedGazetteer()`; `assert.equal(hashString(JSON.stringify(rows)), NAMES_CHECKSUM, "the name index is part of version 1 (engine-invariants, Founding a world from a sentence): a change to it is version 2's")`; `assert.equal(installNames([...rows, ["ne-1159315211", "Xland", "state", "US"]]), false)`; `foundWorld("shaped like texas")` deep-equals `{ ok: false, reason: "places-not-loaded" }` (nothing was installed); `assert.equal(installNames(rows), true)`; `foundWorld("shaped like texas")` founds with `overrides.outline === "ne-1159315211"`. Stub: `installNames` calls `setFoundingGazetteer(rows)` and returns `true` with no check; red on the `false` assertion. Mutation: the comparison removed (red); a row added to the committed file (red on the pin, measured `1249456964` with one row added, M3).

**T4. `test/site/writing-room-founding.test.ts`, "a sentence is lettered only when a word was recognised, and is drawn from the founding's own overrides".** With the committed gazetteer: the flagship `"a cold archipelago of black pines, iron harbors, and a drowned kingdom"` gives `recipeOverrides(f)` deep-equal to `{ ...f.overrides, foundingText: f.sentence }`; `"make a world that sdfhs fhsdfhsdf dsfhds"` gives `f.overrides` exactly (no `foundingText` key); `"a tropical polar waste"` (every recognised word cancelled, ruling 7) gives `{ foundingText: "a tropical polar waste" }`. Stub: `recipeOverrides` returns `f.overrides`; red on the flagship. Mutation: `lettered` reads `f.steered.length > 0` (red on the all-cancel row).

**T5. same file, "a world opens on the vegetation plate only when the words that steered set its climate and nothing but the climate and the naming tongue".** `opensOnPlate` true for `"Upon the frozen roof of the world the herdsmen of Vael keep their reindeer and their grudges."` and `"Merchant republics squabble over a warm inland sea dotted with harbors, banks, galleys, and very expensive pirates."`; false for the flagship, `"make a world that sdfhs fhsdfhsdf dsfhds"`, `"a tropical polar waste"`, `"tropical island in the shape of Texas"`; and over the 200 kept rows of `test/world/founding-sample.json` exactly 42 open on it (`assert.equal(count, 42, "the vegetation plate's rule moved: Issue #393 ruling 6 (comment 6550522707) set which worlds open on it")`). Stub: `opensOnPlate` returns `false`; red on the first row. Mutation: the `culture` allowance dropped (red on "Merchant republics" and on the count, 32).

**T6. same file, "a sentence asking for a real place's shape fetches the name index once and founds again; a failed fetch is the room's own refusal; a plain sentence fetches nothing".** `setFoundingGazetteer(null)`; a counting source `ok = async () => { calls++; return committedGazetteer(); }`; `const founder = createFounder(ok)`; `founder.installed() === null`; `await founder.found("tropical island in the shape of Texas", 1)` has `overrides.outline === "ne-1159315211"` and `founder.installed()?.length === committedGazetteer().length`; a second shaped sentence (`"a land shaped like japan"`) leaves `calls === 1`; with `setFoundingGazetteer(null)` first, a fresh `createFounder(ok).found("a cold island", 1)` leaves `calls` unchanged; with `setFoundingGazetteer(null)` first, `createFounder(async () => { throw new Error("offline"); }).found` gives `{ ok: false, reason: "names-unread" }` for the Texas sentence, and so does `createFounder(async () => [...committedGazetteer(), ["ne-1159315211", "Xland", "state", "US"]]).found`, whose `installed()` stays `null`. Stub: `createFounder` returns `{ found: async (s, v) => foundWorld(s, v) as never, installed: () => null }`; red on the first outline assertion (`places-not-loaded`). Mutation: the second `foundWorld` call removed (red).

**T7. `test/site/writing-room-account.test.ts`, "the account says exactly what the founding steered, cancelled and hashed".** With the committed gazetteer and `placeName = (id) => isFormId(id) ? "a " + id : nameOf(committedGazetteer() as never, id as never) ?? id`:
- the flagship: `accountOf(f, placeName).steered` deep-equals `[{ phrase: "cold", set: "a cold climate" }, { phrase: "archipelago", set: "an archipelago" }, { phrase: "black pines", set: "names in the Norden tongue" }, { phrase: "drowned", set: "less land" }]`, `contested` `[]`, `quiet` false, and `chartNumberLine` is `№ 1858074817, from “iron harbors kingdom”`;
- `"100 islands shaped like Texas"`: `steered` deep-equals `[{ phrase: "100 islands", set: "an archipelago" }, { phrase: "shaped like texas", set: "the shape of Texas" }]` (the count it lost is not shown, Issue #856 plan call 27);
- `"a tropical polar waste"`: `steered` `[]`, `contested` `["tropical", "polar"]`, `quiet` true;
- `"make a world that sdfhs fhsdfhsdf dsfhds"`: `quiet` true, `contested` `[]`.
Stub: `accountOf` returns `{ steered: [], contested: [], quiet: true, seed: f.seed, residual: f.residual }`; red on the flagship. Mutation: `steered` built from each entry's full meanings (`r.steers` replaced by the lexicon entry's own steers, `LEXICON.find((e) => e.phrase === r.phrase)?.steers ?? r.steers`; red on "100 islands", which then reads "an archipelago and about 100 islands"); `quiet` from `f.steered.length + f.contested.length === 0` (red on the all-cancel row).

The prover owes T1 to T7, and the browser checks WR1 to WR5 below. IX12 is an existing check the Glossary section joins; its readings are M9, and the implementer proves nothing new there.

**The browser suite, `e2e/suites/writing-room.ts`** (entry), its kit `e2e/suites/writing-room/kit.ts` (`goto(hash)`: bounce through `about:blank`, navigate to `/writing-room/<hash>`, wait until `document.readyState === "complete"`, then until `window.__vellumWritingRoom?.().n` is at least 1, at 1024x768; `settledAfter(n0)`: wait until `n > n0`; both throw on 200 polls of 50 ms; `read()`: the READ payload below; `pressAt(selector)`: `Input.dispatchMouseEvent` pressed and released at the centre of the element's `getBoundingClientRect()`, after asserting `document.elementFromPoint` there is the element or inside it, `vellum-footguns` Gate 2) and its checks in `e2e/suites/writing-room/checks.ts`. Each check is one `step` (`makeStep`), and the suite ends with `scopedHealth(ctx).check("WR0 the Writing Room logged no console error and fetched nothing that answered 4xx")`. READ: `{ n, seed, refusal, plate, lettered }` from the hook, plus from `#map svg` the attributes `data-vellum-seed`, `data-vellum-culture`, `data-vellum-founding-text`, `data-vellum-outline`, `!!svg.querySelector("#layer-field")`, `#wr-refusal`'s text, `.wr-quiet` present, `#wr-plate-verb`'s text, `location.hash`. The expected founding is computed in Node by `foundWorld` (integers and strings only, nothing a browser can drift).

**WR1 "a written link founds its world, and the same world again after a reload".** `goto(writtenHash(FLAGSHIP, 1))`; read; `Page.reload`; wait for `n >= 1`; read again. Assert both reads: `data-vellum-seed === String(f.seed)`, `data-vellum-culture === f.overrides.culture`, `data-vellum-founding-text === f.sentence`. Readings in M5.

**WR2 "a sentence asking for a real place's shape fetches the place names and draws the place".** `goto(writtenHash("tropical island in the shape of Texas", 1))`; assert `data-vellum-outline === "ne-1159315211"` and `#wr-refusal` empty. Readings in M5 (mutation: the names file blocked through `Network.setBlockedURLs(["*/outlines/names.json"])`, what a host that never installs the list shows).

**WR3 "a refused sentence leaves the last world, its account and its link standing, and says why".** `goto(writtenHash(FLAGSHIP, 1))`; set `#wr-line`'s value to 121 `x`; `pressAt("#wr-form button[type=submit]")`; `settledAfter(n)`; assert `refusal === "too-long"`, `#wr-refusal` non-empty, `data-vellum-seed === "1858074817"` and `location.hash === writtenHash(FLAGSHIP, 1)`. Readings in M5 (mutation: the hash rewritten to the refused sentence's own link before the read, staged by `history.replaceState`, what a room writing the hash before founding leaves).

**WR4 "a world founded on its climate opens on the vegetation plate, any other on the plain chart, and the press lifts and lays it".** `goto` the climate sentence `"Upon the frozen roof of the world the herdsmen of Vael keep their reindeer and their grudges."`: `#layer-field` present and `plate` true; `pressAt("#wr-plate")`, `settledAfter`: `#layer-field` absent and `#wr-plate-verb` reads "Lay on"; `goto` the flagship: `#layer-field` absent. Readings in M5 (mutation one: pressed before the first read; mutation two: the press replaced by its own clone, which drops its listener).

**WR5 "a sentence is lettered only when a word was recognised, and the quiet line shows when none steered".** `goto` `"make a world that sdfhs fhsdfhsdf dsfhds"`: `data-vellum-founding-text` absent and `.wr-quiet` present; `goto` `"a tropical polar waste"`: `data-vellum-founding-text === "a tropical polar waste"` and `.wr-quiet` present; `goto` the flagship: `.wr-quiet` absent. Readings in M5 (mutation: the engine route's chart of seed 2679030198 mounted with `foundingText` set).

## Order of commits

1. `#393 The Writing Room's plan, and the room's unit tests red on their shape`: `handbook/plans/300/393/393-plan.md`; `address.ts`, `names.ts`, `founding.ts`, `account.ts` with every export real except the stubs T1 to T7 name; `displayText` in `normalize.ts`; T1 to T7. Red: T1 to T7, on the assertions named. Every other test green.
2. `#393 The founding host: the link, the name index, the lettering, the plate rule and the account`: the stubs replaced. T1 to T7 green; `npm test` green.
3. `#393 The Writing Room: the page, its bundle, its sheet, its suite and every roster it joins`: `app.ts`, `view.ts`, the page, the sheet, the suite, the rosters. `npm run check`, `npm run lint`, `npm run format:check`, `npm test` green; `VELLUM_E2E_SUITES=writing-room npm run test:e2e` green after `npm run build`.
4. `#393 The Glossary's section for the Writing Room's words`: the `src/pages/glossary/index.astro` edit. `VELLUM_E2E_SUITES=document-rooms npm run test:e2e` green after `npm run build`.
5. `#393 Version 1 is locked: the doctrine and the lock messages say so`: the edits under "Rosters and doctrine", doctrine half.

No commit message carries a closing keyword beside #393. Push at commit 1.

## Rosters and doctrine

**Rosters** (each found by grepping `specimen`, `ribbon` and `/print-room/`; join each with the entry given):
- `src/layouts/nav.ts`: `NAV_ITEMS` and `ROUTE_NAMES` (Files).
- `src/layouts/atelier-chart.ts`: `PLACES` gains `"/writing-room/": { x: 400, y: 160, rank: "town", name: "The Writing Room" }` (M7; not the stills' seat, whose caption runs into the Reading Room's label); `ROADS` gains `["/explorer/", "/writing-room/"]`.
- `scripts/build-app-bundles.ts`: `BUNDLE_ENTRIES` gains `{ entry: "src/site/writing-room/app.ts", twin: "writing-room/app.bundle.js" }` after the Specimen's.
- `scripts/generate-discovery.ts`: `ROUTE_ENTRIES` gains `"/writing-room/": { title: "The Writing Room", blurb: "Write a sentence and found a world from it: the words on the founding list steer its land, climate and names, and the rest make its chart number." }` (the route itself joins `DISCOVERY_ROUTES` through `NAV_ITEMS`).
- `scripts/lint/shared-bindings.ts` and `test/repo/shared-bindings.test.ts`: `"src/site/writing-room/app.ts": [ZOOM_ROOM]`.
- `eslint.config.ts`: the `vellum/room-no-scroll` block's `files` gains `"src/site/writing-room/**"`; `test/repo/site-shape.test.ts`'s room list gains `"src/site/writing-room/app.ts"`.
- `test/site/astro-scaffold.test.ts`: `PAGES` gains `{ route: "writing-room/index.html", dir: "/writing-room/", current: "Writing Room", trail: [["Vellum", "/"], ["The Writing Room", "/writing-room/"]], room: "The Writing Room", title: "The Writing Room · Vellum", ogTitle: "The Writing Room · Vellum", description: "Write a sentence and Vellum founds a world from it, in your browser. The same sentence founds the same world, forever.", tagline: "every sentence is a world, write one", scriptSrc: "./app.bundle.js", chartRoom: true }`; `SHARED_ROOM_SHEETS`' chart-stage list gains `"writing-room/index.html"`; `STAGES` gains `["writing-room/index.html", "The founded chart. Arrow keys pan, plus and minus keys zoom, 0 shows the full sheet."]`; `LEGENDS` gains `"writing-room/index.html": { label: "The Press" }`; `NOTICES` gains `"writing-room/index.html": { pill: "status", opens: "Founding the world&hellip;", noscript: true }`; the generated list in "every internal link and embed on the rendered pages resolves" gains `"/writing-room/app.bundle.js"`. `ROADS` gains nothing (the press is a button).
- `test/site/app-bundles.test.ts`: the bundle list gains the entry. `test/site/astro-app-surfaces.test.ts`: the dev list gains `["/writing-room/", "app.bundle.js"]`.
- `test/site/route-tree.test.ts`: `TRAILS` gains `"/writing-room/": { crumbs: [["Vellum", "/"], ["The Writing Room", "/writing-room/"]], current: false, also: [] }`.
- `test/site/discovery.test.ts`: the message "seven nav items plus home, ..." reads "eight nav items plus home, ...".
- `test/repo/design-kit.test.ts`: the archive map gains `"/writing-room/": "head"` (`modeOf` derives it from `BUNDLE_ENTRIES`; no edit to `scripts/design/oracle.ts`).
- `test/repo/e2e-tiers.test.ts`: `covers` gains `"writing-room": ["writing-room"]`.
- `e2e/support/suites.ts`: `E2E_SUITE_ORDER` gains `"writing-room"` after `"specimen"`; `SMOKE_SUITES` gains it after `"specimen"`. Not in `NEEDS_PREDECESSOR` or `OPENS_ON_HOME` (it navigates itself).
- `e2e/support/suite-map.ts`: `import { run as runWritingRoom } from "../suites/writing-room.ts";` and `"writing-room": runWritingRoom`.
- `e2e/support/lanes.ts`: lane C's `suites` gains `"writing-room"` after `"specimen"` (lane C is the lightest: 461.0 s of 1950.2 s measured).
- `test/e2e/lane-timings.test.ts`: `MEASURED_SECONDS` gains `"writing-room": 15.0` in commit 3; after the pull request's first CI run, the value is replaced by the seconds the `per-suite wall clock` lines of lane C's job log give for the suite (`handbook/specs/site-architecture.md`, "`MEASURED_SECONDS` is read from CI's own lane logs"), and the body names the job.
- `e2e/suites/corners.ts` (the route list), `e2e/suites/stage/stage.ts` (`CHART_ROOM_FLOOR`), `e2e/suites/runninghead/reads.ts` (`SHELLED`, `FOLIO`, `CHART`), `e2e/suites/runninghead/dress.ts` (`PILL_ROOMS`), `e2e/suites/runninghead/room.ts` (`PILLS` gains `"/writing-room/": "P#status"`, `CHART_ROOMS`, `STAGED` gains the stage label): each gains `"/writing-room/"` in path order.
- `e2e/suites/slide-away/kit.ts`: `ROOMS` gains `{ id: "Writing Room", path: "/writing-room/", lens: LENS, fill: "sheet" }` after the Specimen Book; SW1's label in `e2e/suites/slide-away/rooms.ts` reads "each of the eight other zoom rooms ... the Seed of the Day, the Specimen Book and the Writing Room".
- `e2e/suites/corners/top-row.ts`, CO5 (`co5Yields`): the eighth item makes the top row write the Print Room's corner from 1024 down (`max-width: 358.228px`, M10), so the held list's `["/print-room/", [1280, 1024, 1023, 960, 901]]` reds as written (measured: CO5 FAIL with the item staged, PASS today). The list becomes `["/print-room/", [1280]]`, `["/specimen/", [1023, 960, 901]]` and `["/explorer/", [1024, 1023, 960, 901]]` (the Explorer's corner stays unwritten at every one of those widths with the item, M10), and the label's clause "Issue #741's two corners are never written" reads "the Specimen Book's corner, the Print Room's at 1280 and the Explorer's below it are never written". Readings (M10): with the item, every held read on the new list has `cornerInline` `""`; under the staged mutation of a top row that writes every corner (`max-width` set inline on the Explorer's corner after the load), `cornerInline` reads `300px` and the clause fails.
- The Glossary: the index slip reads its sections from the page (`roomSections`), so the new section joins it by existing; IX11 (intro voice), IX12 (the #353 shape) and IX14 (plain, unique anchors) in `e2e/suites/document-rooms/sheets.ts` read it on the served page. No constant changes: the section has no floor (it is not in `ADDED`) and sits under the cap (M9). "At the drafting table" is untouched, so BR7 and BR10 in the broadside suite keep their seven terms.

**Doctrine** (commit 5; the replacement wording):
- `handbook/specs/engine-invariants.md`, "A published founding version never changes": "Until the written-world link goes public (Issue #393), version 1 may still change, and the pins in ... move with it. Once it is public, version 1 is locked: a change is a new version added beside it, and every old version stays foundable, so an old sentence keeps its world." becomes "Version 1 is locked: Issue #393 made the written-world link public. A change is a new version added beside it, and every old version stays foundable, so an old sentence keeps its world; the pins in `test/world/founding-covenant.test.ts`, `test/world/founding-count-covenant.test.ts`, `test/world/founding-shape-covenant.test.ts` and `test/world/founding-sample.test.ts` hold version 1 and never move." In "A refusal is a value, never a throw", after "the host installs the name index the shape box fetches and founds the sentence again." add: "The Writing Room checks the fetched index against `NAMES_CHECKSUM` (`src/site/writing-room/names.ts`) before it installs it, and refuses the sentence when the index cannot be read or does not match, so a stale or foreign list never founds a world."
- The four `LOCK` constants (`test/world/founding-covenant.test.ts`, `founding-count-covenant.test.ts`, `founding-shape-covenant.test.ts`, `founding-sample.test.ts`): "version 1 is locked since Issue #393 made the written-world link public: a change is version 2, with version 1 kept (Alex, 2026-10-09)".
- `handbook/specs/rulebook.md`, the Issue #844 slot bullet: "they land before Issue #393 makes the written-world link public and locks that version, and Issue #393 stays held until they have." becomes "they landed before Issue #393 made the written-world link public and locked that version. The typed, combined place request is version 2's (Alex, 2026-10-31, Issue #393 comment 6550522707 ruling 1, reversing Issue #844 comment 6281800234)."
- `handbook/specs/site-architecture.md`, "A real place's outline is served one file to a place": "fetched the first time the picker needs a name, never bundled and never sent to the worker." becomes "fetched the first time the picker needs a name, or the first time the Writing Room founds a sentence asking for a real place's shape, never bundled and never sent to the worker."
- `handbook/specs/rulebook.md`, the nav bullet under Retired rules: "Revisit the top line only on a named trigger: an eighth surface scheduled for it, or the nav no longer fitting beside the room's corner on its one line at 1024, at the browser's default text size (Alex, 2026-10-07, Issue #764)." becomes "Revisit the top line only on a named trigger: a ninth surface scheduled for it, or the nav no longer fitting beside the room's corner on its one line at 1024, at the browser's default text size (Alex, 2026-10-07, Issue #764). The eighth, the Writing Room, joined the flat line after the Explorer (Alex, 2026-10-31, Issue #393 comment 6550522707 ruling 2): the nav keeps its one line at 1024, the Print Room's corner giving way to it."

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `npm run build`, then, one at a time, `VELLUM_E2E_SUITES=<suite> npm run test:e2e` for `writing-room` and for each suite whose roster the room or the Glossary section joins: `document-rooms`, `corners`, `stage`, `runninghead`, `slide-away`, `cluster`. Never the full local lanes.
- `vellum-plate-reader` at step 11 over the built room, at 1024x768 and 1440x900, on the five sentences of WR1 to WR5 and the refusal, against the stills of this sitting (`out/393/` in the main checkout), the nav at 1024 on every room, and the Glossary's new section.
- The golden and every committed chart unmoved: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`.
- `gh pr view <N> --json closingIssuesReferences` prints `[]`.

## Calls made

- **C1. The founding runs on the page; the chart is drawn by the shared worker** (`runJob`). Rule: engine-invariants, "There is one way to build a world" (a new surface joins `runJob`), and `runJob` already loads a place's rings.
- **C2. The name index is fetched only after a `places-not-loaded` refusal, through the shape box's own loader, and installed only after its checksum matches.** Rule: Issue #856 ruling 8; engine-invariants, "Founding agrees across platforms or refuses" (a world is founded identically or refused, never founded differently).
- **C3. The room's address keys are `found` and `v`; no `v` means 1 forever; the hash is written only for a founded sentence, by `replaceState`; `hashchange` founds again.** Rule: Issue #390 ruling 9 and Issue #391 ruling 2; `writeHash` in `src/site/explorer/hash-sync.ts` (the house writes an address by `replaceState`). Shown as `#found=...&v=1` in ruling 3's option.
- **C4. A bare visit founds the epic's own sentence.** Rule: a chart room is never empty on arrival (the Explorer and Today draw on arrival).
- **C5. The account reads `steered` and `contested` as the founding returns them and adds nothing.** Rule: engine-invariants, "What a surface may read from a founding".
- **C6. A refusal leaves the last world standing** with the refusal line under the writing line. Rule: Issue #393's acceptance, "no error path leaves a half-rendered state".
- **C7. Every founded world carries the vegetation press; its state does not enter the address.** Rule: Issue #390 ruling 2 as corrected, "opens on the vegetation plate ... the antique chart still drawn as usual"; the address carries identity only (C3).
- **C8. The counter and the too-long refusal count the display form, through `displayText`, which `displayForm` now shares.** Rule: one cleanup, read twice, so the two never disagree.
- **C10. The room draws in the antique style with the legend on, like Today, and offers no style control.** Rule: the body's "this sub ships the door"; Sub 0 ruling 2 names the antique chart.
- **C11. The cartouche's provisional rulings (Issue #392, PR #1106, Issue #1107) are left to Issue #857**, as Issue #844 comment 6545165577 proposes. Rule: the brief.
- **C12. The sentence reaches the page only as text** (`textContent`) and inside the renderer's SVG, whose `renderSvg` escapes every string (`src/render/svg.ts`; `test/render/recipe-meta.test.ts` "tricky" row). Measured (M6).
- **C14. Two pull requests**, by ruling 8; the reference line and the hand-over are under "Two pull requests".
- **C15. The writing line carries no placeholder**: the stills' placeholder measured 4.37:1, under the 4.5:1 floor (M8), and the line always opens holding a sentence (C4).
- **C16. The chart of the atelier seats the room at (400, 160), reached by a road from the Explorer**, not where the spike drew it (M7). Rule: a label or caption that runs into another's is a defect the plate read found.
- **C17. The Glossary section stands directly after "At the drafting table"**, the room's words beside the Explorer's control words, and nothing on the room links to it. Rule: the house groups the site's own words together; the stills show no glossary mark on the room.
- **C19. CO5's held list trades the Print Room below 1280 for the Explorer** (Rosters). Rule: ruling 2 seats an eighth item that makes the top row give the Print Room's corner way at 1024, which Alex was shown ("on the Print Room the top-right corner narrows"); the clause keeps a nav room's corner below 1280 as its witness of a corner the top row leaves alone.
- **C20. The nav's revisit trigger moves to a ninth surface.** Rule: Issue #764's trigger names the surface after the line's last one; ruling 2 spent the eighth. For Alex to overrule.
- **C18. The Glossary's definitions copy no number or listed word from the founding modules** (no cap, no small word, no list entry), and each states only what the code does: the chart number from the residual (`foundWorld`), the clash rule (`FOUNDING_RULES`), the grapheme wrap (`characters` in `src/render/layers/cartouche-founding.ts`, `Intl.Segmenter` at grapheme granularity, Issue #1107) and the counter's stored characters (C8). Rule: engine-invariants, "Do not copy a number or a word from them into a spec or into a page's prose"; `handbook/specs/ui-design.md`, "Do not invent a fact for flavour".

## Open decisions

None. The follow-up menu's three are ruled (comment 6550899486):
- **10**: the section is "The founding words", with the anchor `founding-words`, directly after "At the drafting table" (C17).
- **11**: its four entries are the ones drafted in Files, alphabetical, worded as written there. Alex was told before ruling that "Steer" states the clash rule and "Founding" names what the list steers, a little of what ruling 5 keeps off the room.
- **12**: the Print Room's corner gives way at 1024 with the eighth item and its controls squeeze further (M10: the dice button from 34.2 to 21.3 px wide, the seed box from 105.0 to 86.9, the style picker from 109.1 to 80.2). This pull request leaves that to Issue #741 and changes nothing on the Print Room. The pull request body names it, with M10's numbers and ruling 12, as what this change does to another room, and names Issue #741 as where it is fixed.

**Where the stills and this plan differ** (each stated so the build is held to the right picture): the stills' head cluster is door 2's (a trail through the Explorer, seven nav items), and ruling 2's door is shown only in the `door-1-*` stills, with the eighth item at the end of the line where this plan puts it after the Explorer (M1); the chart of the atelier seat moves to (400, 160) (C16); the writing line's placeholder is dropped (C15); the corner line and the two teaching arms are not built.

## Lanes beside this one

Issue #1020 has landed: PR #1158 merged as d9565ee3, the sha this plan is planned at. Its 48 files (`git diff --stat 3feaa3af FETCH_HEAD`) are none of the files this plan creates or edits. It dropped `export` from names this plan does not import (among them `ISLE_SIZES` in `src/terrain/lobes.ts`, `HEAD_CLEAR` and `FOOT_CLEAR` in `src/site/shared/slide-away.ts`, `textRight` in `src/site/shared/room-seats.ts`, `TOLERANCE` in `src/site/shared/shell/top-row.ts`) and changed `parkCoastDefault`'s signature in `src/site/explorer/coast-warp.ts`, which nothing here calls. Every module this plan imports (`place-names.ts`, `place-fetch.ts`, `place-match.ts`, `worker-client.ts`, `zoom-room.ts`, `error-text.ts`, `by-id.ts`, `src/core/rng.ts`, `src/world/outline-ids.ts`, the founding modules) is outside its diff, so every name imported here is still exported. No merge order is left to keep. Its rule stands for this build: an export nobody outside its file reads stays unexported, and each new export here has a caller (`app.ts`, `view.ts` or a test) by commit 3.

## Stop conditions

Hand back, with the command and its output, when:
- any value this plan prints differs from the built one: `NAMES_CHECKSUM` 2151669449, the mutated list's 1249456964, the flagship's seed 1858074817 and culture `norden`, Texas's ID `ne-1159315211`, the plate count 42 of 200 (32 under T5's mutation), any account line in T7, or a WR reading in M5;
- `src/world/outline-place-names.json` on main no longer hashes to 2151669449, or `test/world/founding-shape-covenant.test.ts` no longer pins 3158117445 (the lock moved under the plan);
- `git diff --stat d9565ee3 origin/main` touches `src/world/founding/`, `src/site/explorer/place-names.ts`, `src/site/explorer/place-fetch.ts`, `src/site/explorer/worker-client.ts`, `src/site/shared/zoom-room.ts`, `src/layouts/nav.ts`, `src/layouts/atelier-chart.ts` or `src/pages/glossary/index.astro`;
- a roster the grep finds is not in "Rosters and doctrine", or a roster named there does not exist;
- a joined sweep (`document-rooms`, `corners`, `stage`, `runninghead`, `slide-away`, `cluster`) reds on the Writing Room, on the Glossary, or, with the eighth nav item, on another room, once CO5's held list is edited as Rosters says (FL1 holds the nav to one line on every page at the 1024 layout; the Print Room's corner gives way to 358.2 px, M1 and M10);
- `displayText` cannot be lifted out of `displayForm` without a founding pin moving;
- the room's first e2e run puts any WR check on the wrong side of its assertion where M5 gives a reading, or WR4's press does not redraw within the kit's wait;
- `app.ts` would pass 200 lines or a function 50;
- the Print Room's corner at 1024 reads narrower than M10's 358.2 px, or any control in it narrower than M10's widths with "Writing Room" on the nav (ruling 12 accepted exactly those).

## Measurements

The dry run is in the planner's tree's `out/393-dry-run/`, copied to the main checkout's `out/393-dry-run/`, built at 3feaa3af plus the uncommitted spike; d9565ee3 changes none of the files they read (Planned at).

- **M1. The nav at 1024 with an eighth item.** At the end of the line (`node out/393-dry-run/393-probe.ts dist nav`, log `393-probe-nav.log`): one line on every page for each candidate name. After the Explorer, as ruling 2 seats it (`node out/393-dry-run/393-fold.ts dist`, log `393-fold.log`): one line on every nav room; the nav ends at 614.6 px (510.2 today); the gap between its right edge and the room corner's left edge, less the `--chrome-x` gap of 25.6 px, is 0 on the Print Room, whose corner gives way from 400 to 358.2 px wide, and 89.1 px or more on every other room (Today's 89.1, the Explorer's 95.6, the Reading Room's 97.6, the Q & A's 109.5, the Glossary's 182.2, the Gallery's 185.4).
- **M2. Which worlds open on the vegetation plate** (`out/393-dry-run/climate-kept.log`, over the 200 kept rows of `test/world/founding-sample.json`): any climate word still steering, 73; only climate and naming-tongue words steered, 42 (ruled); only climate words, 32; climate words more than half of those that steered, 36. A sentence whose recognised words all cancelled: 3 of 200; no word steered at all: 62 of 200.
- **M3. The name index checksum**: `hashString(JSON.stringify(rows))` is 2151669449 in Node over `committedGazetteer()` and in the browser over the fetched list (`393-probe.log`, the shape case); 1249456964 with one row added.
- **M4. The bundle**: `dist/writing-room/app.bundle.js` 40,431 bytes beside Today's 29,008 and the Print Room's 36,477; it imports the shared chunks `generate.js`, `place-names.js`, `worker-client.js`, `zoom-room.js`, `room.js`, `realms.js`, `heraldry.js`, `error-text.js`.
- **M5. The browser checks' readings** (`node out/393-dry-run/393-checks.ts dist`, log `out/393-dry-run/393-checks-final.log`, the same readings as the first run's `393-checks.log`; built at 3feaa3af plus the spike as `out/393-dry-run/spike-checks/` holds it, at 1024x768, presses dispatched at each element's own rect with `elementFromPoint` confirming the hit):
  - WR1 fixture: first read and after the reload both `{"seed":"1858074817","culture":"norden","text":"a cold archipelago of black pines, iron harbors, and a drowned kingdom"}`, equal to Node's `foundWorld`. Mutation (the chart of seed 1858074817 drawn without the overrides, mounted from the engine route): `{"seed":"1858074817","culture":null,"text":null}`, failing on `culture` and `text`.
  - WR2 fixture: outline `ne-1159315211`, refusal line empty. Mutation (the names file blocked): outline `null`, the refusal line set, the room's state `refusal` set; fails on the outline.
  - WR3 fixture: `refusal` `too-long`, the refusal line set, seed `1858074817`, the hash still the flagship's. Mutation (the hash rewritten to the refused sentence's): seed `1858074817`, hash not the flagship's; fails on the hash clause.
  - WR4 fixture: the climate sentence `#layer-field` present and `plate` true; after the press `#layer-field` absent and the verb "Lay on"; the flagship `#layer-field` absent. Mutation one (pressed before the first read): `#layer-field` absent, `plate` false; fails on the first clause. Mutation two (the press's listener dropped by a clone): the count of settled attempts stays 1 and `#layer-field` stays present, verb "Lift"; the wait for the redraw times out and the field clause fails.
  - WR5 fixture: the no-steer sentence carries no founding text and shows the quiet line; "a tropical polar waste" carries its text and shows the quiet line; the flagship shows no quiet line. Mutation (the no-steer world mounted with `foundingText` set): the text `make a world that sdfhs fhsdfhsdf dsfhds` is present; fails on the first clause.
  - No console error and no 4xx in the whole run; no label overlap on the chart of the atelier on the Writing Room, the Reading Room, the Explorer, the Print Room or the Glossary at the (400, 160) seat.
- **M6. Escaping**: `renderMap(generateWorld(defaultRecipe(5, { foundingText: '<img src=x onerror=alert(1)> & "q"' })), { style: "antique" })` holds no `<img`.
- **M7. The chart of the atelier** (`node out/393-dry-run/393-atelier.ts dist`, log `393-atelier.log`): the spike's seat (236, 226) puts the room's own "you are here" caption 6.7 px into "The Reading Room"'s label (the plate reader's `atelier-chart.png` shows it); at (400, 160) every gap between the room's label and every other label and every page's caption, and between its own caption and every label, is at least 4.5 px (nearest: its caption to "The Print Room", 4.5).
- **M8. The plate read of the stills** (`out/393/notes.md` and `measurements.jsonl`, copied to the main checkout's `out/393/`): no overlap between the open slip and the sheet, the legend row, the Glass, the chart folio or the corner on any still at 1024 or 1440; nothing scrolls sideways; every account and refusal line at 5.64:1 or better; the textarea's placeholder at 4.37:1, under the floor (C15); with no list taught (`teach-none`), 352 px of slip content in a 352 px body, no scroll.
- **M10. The corners suite's top row with the eighth item** (`node out/393-dry-run/393-corners.ts dist`, log `393-corners.log`, the item staged after "Explorer" on every new document by `Page.addScriptToEvaluateOnNewDocument`, under reduced motion, windows 800 tall; `393-corners-writing.log` the same with the label "Writing"): CO5 itself (`co5Yields`) PASS today and FAIL with the item. The held read (the room corner's and the cluster's inline `max-width`): today every page and width unwritten; with the item the Print Room unwritten at 1280 and written `358.228px` at 1024, 1023, 960 and 901, the Specimen Book unwritten at 1023, 960 and 901, the Explorer, Today and the Reading Room unwritten at 1024, 1023, 960 and 901; under the staged mutation (the Explorer's corner given `max-width: 300px` inline) the read gives `300px`. The Print Room corner's controls at 1024, width against natural width: today seed 105.0 / 110.8, dice 34.2 / 38.4, style 109.1 / 118.4, press 121.9 / 121.9; with "Writing Room" 86.9, 21.3, 80.2, 121.9; with "Writing" (corner `397.728px`) 104.0, 33.5, 107.5, 121.9; at 1280 unchanged by the item.
- **M9. The Glossary section and IX12** (`node out/393-dry-run/393-fold.ts dist`, log `393-fold-r2.log` under the ruled heading "The founding words" with the anchor `founding-words`; `393-fold.log` was the same read under the earlier draft heading; the section mounted directly before `<h2 id="soundings">`, so right after "At the drafting table"'s last entry, on the served Glossary at 1280x800, and read by IX12's own `ix12GlossaryShape` over the page's sections; the probe's definitions are one-line stand-ins, since IX12 reads the terms, their order and the count of definitions, never a definition's words): fixture, IX12 passes ("26 headings"), the section reading `["Chart number","Founding","Grapheme","Steer"]` with 4 definitions, "At the drafting table" still 7 terms; mutation (its terms out of order), IX12 fails with `"The founding words" out of order`. No console error and no 4xx. The section's four terms sit under IX12's cap of 8; it is not in `ADDED`, so no floor applies; the heading shares no headword with a term (IX12 reads terms only), and `founding-words`, `chart-number`, `founding`, `grapheme` and `steer` are anchors no other entry on the page carries (IX14).
