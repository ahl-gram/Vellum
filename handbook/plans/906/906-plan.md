# Issue #906 plan: pin the ratified trail dressing, and the Gallery reads the trail's line box

- **Planned at**: `origin/main` 61d2b8033f7e06b00cb17f3b98b83e684e36f2da; Issue #906 comment count 1 (re-read 2026-10-17, after the rulings). Ratification read: Issue #736 comment 6241132108.
- **Rulings**: https://github.com/ahl-gram/Vellum/issues/906#issuecomment-6241432945 (Alex, D1 option (a), "Change the wording (Recommended)"): the first acceptance box is superseded; DR13, the Gallery check, fails first, and DR16, which locks the ratified spacing, type size and underline, is proven by the guard prover's mutations c to g.
- **Specs**: `handbook/specs/check-placement.md` (The browser lanes and a plate read: every pin here is what the page computes); `handbook/specs/cascade-traps.md` (in full, before the two CSS edits); `handbook/specs/settle-doctrine.md` (before the two e2e checks); `handbook/specs/ui-design.md` (The head cluster paragraph, the one edited below); `handbook/specs/conventions.md` (Comments, and editing a spec); `handbook/errata/README.md` (How a row leaves: Fixed).
- **Plan skeptic** (one pass): finding 1 (the first acceptance box is Alex's) became D1; finding 2 (the contrast pin was a Mac figure) became C1, the alpha pin; finding 3 (who closes Issue #736 and Issue #667) is the Closing line under Evidence. None rejected.
- **Size**: small. Two CSS lines, one CSS read, two e2e checks, one spec sentence, one errata row deleted.

## The design

1. `public/shell.css` gets one new token beside `--trail-gap`: `--trail-line: 1rem`, the height of the trail's line box.
2. The trail's own rule supplies that height: `.trail .way { line-height: var(--trail-line); }`. The arrow (`.way`, 0.78rem, the tallest glyph on the line) is what sets the trail's line box today: its `normal` line height at 12.48px is exactly 16px, so the line box is 16px (measured: `.trail` and `.way` both 111.406 to 127.406 at 1280 and 1024). Making that height explicit on the arrow keeps every pixel.
3. The Gallery reads the token instead of the copy: `body:has(.trail) main { padding-top: calc(var(--band-h) + 1.2rem + var(--trail-line) + var(--trail-gap)); }`.
4. The ratified values are pinned in the browser (the cluster suite), never by a text search of `shell.css` (`check-placement.md`: a unit test does not search CSS text, and a declaration can be present and lose).

**Measured on the live site (serving 61d2b803), 2026-10-17, by injecting the candidate CSS through `scripts/design/shoot.ts`, probe lists `906-probe*.json` in the scratchpad:**

| arm | trail box (1280 and 1024, Gallery and Prospect) | alias line (Prospect) | Gallery first row | Gallery clearance | head crop 520x200 vs control |
|---|---|---|---|---|---|
| control (today) | 111.406 to 127.406, 16px | 136.203 to 149.203 | 166.391 | 38.985 | (control) |
| this design | 111.406 to 127.406, 16px | 136.203 to 149.203 | 166.391 | 38.985 | AE 0 on all four (2 pages x 2 widths) |
| rejected: `.trail { line-height: var(--trail-line) }` | 111.406 to 127.922, 16.516px | 136.719 to 149.719 | 166.391 | 38.469 | AE 83 to 1643 |

Whole-window diffs of this design against the control were 0, 24.5, 65 and 101 pixels, against 0, 15.9 and 24.4 for a second unchanged control; the head crop, where the trail lives, was 0 everywhere. The no-moved-pixel claim is scoped to the head crop and the measured boxes.

**What the read covers, and what it does not (measured):** with the design in place, a change to the arrow's size or to `--trail-line` itself cannot move the Gallery's first row relative to the trail (injected `--trail-line: 2rem` plus `.trail .way { font-size: 1rem }`: trail 32px, padding 182.4px, clearance 38.985). A change to `.trail`'s own font size still can, once it passes about 0.72rem (0.7rem: 16px, clearance 38.985; 0.75rem: 16.484px, 38.500; 0.8rem: 17.484px, 37.500), because the trail's own strut then outgrows the line. DR16's type-size pin (9.92px) is the rule that catches that. The PR body says so; do not claim "cannot drift" without that qualifier.

**Alternatives rejected:**
- `.trail { line-height: var(--trail-line) }`: moves the trail's foot and the alias line down 0.516px (table above). The arrow's `vertical-align: -0.04em` pushes it past the strut.
- `.trail { height: var(--trail-line) }`: keeps pixels, but a larger trail then overflows its box into the alias line instead of growing, hiding the defect the pin should catch.
- A unit test reading `shell.css` values (the palette-token precedent in `test/site/shell-css.test.ts`): `check-placement.md` sends what the page computes to the browser, and a new stylesheet read would need a `SOURCE_READS` entry.
- Pinning the Gallery clearance at 38.98px absolutely: the nav's line box above the trail comes from font metrics (`line-height: normal`), the shape that passes on a Mac and flakes on linux CI. DR13 pins the clearance relationally instead (unchanged when the trail's line grows), and 38.98 is the before and after evidence.

## Files

| file | change |
|---|---|
| `handbook/plans/906/906-plan.md` | new: this plan, archived as step 8 says (it is already in the planner's tree as an untracked file; copy the scratchpad version over it if they differ) |
| `public/shell.css` | in the `:root` block, the line after `  --trail-gap: 0.6rem;` add `  --trail-line: 1rem;`. In the `.trail .way` rule, after `  vertical-align: -0.04em;` add `  line-height: var(--trail-line);`. No comment: DR13 pins it. |
| `src/cli/gallery.ts` | in `GALLERY_PAGE_CSS`, `body:has(.trail) main { padding-top: calc(var(--band-h) + 1.2rem + 1rem + var(--trail-gap)); }` becomes `body:has(.trail) main { padding-top: calc(var(--band-h) + 1.2rem + var(--trail-line) + var(--trail-gap)); }`. Nothing else in the file. |
| `e2e/suites/cluster/trail.ts` | DR13 strengthened, DR16 added (below). 254 lines today, about 295 after; no function over 50 lines. |
| `e2e/suites/cluster.ts` | import `dr16Dress` from `./cluster/trail.ts` beside `dr15TrailHover`, and add `await step("DR16", () => dr16Dress(trail));` on the line after `await step("DR15", () => dr15TrailHover(trail));`. |
| `handbook/errata/site.md` | delete the whole row that begins `- PR #737 (2026-10-03, low): the Gallery's restored gap in \`src/cli/gallery.ts\` adds \`1rem\`` (line 54 at the planned sha). Fixed, per `handbook/errata/README.md`. |
| `handbook/specs/ui-design.md` | the sentence in the head-cluster paragraph that begins `**Provisional until the post-use review:** the trail's size step under the nav` (lines 195 to 198 at the planned sha) is replaced, wording below. |

### `e2e/suites/cluster/trail.ts`, exactly

One constant near the top, after `const PARCHMENT_BRIGHT = ...`:

```ts
// Blink lays a box out in 1/64px units, so a gap read between two edges errs by at most two of them.
const LAYOUT_SLACK = 1 / 32;
```

One constant only; the comment is the bound's provenance line, the form `CLAUDE.md` allows at a derived bound.

**DR13** (`dr13Gallery`): inside the width loop, after `gap` is read, read the clearance again with the trail's line grown and the arrow enlarged, in ONE evaluate so the style never outlives the read:

```ts
const GROWN: Payload<number> = `(() => { const s = document.createElement("style"); s.textContent = ":root { --trail-line: 2rem; } .trail .way { font-size: 1rem; }"; document.head.append(s); const g = document.querySelector(".grid figure").getBoundingClientRect().top - document.querySelector("header.chrome").getBoundingClientRect().bottom; s.remove(); return g; })()`;
```

Rows become `{ width, gap, grown }`. The check's condition becomes `rows.length === 2 && rows.every((r) => r.gap >= 4 && Math.abs(r.grown - r.gap) <= LAYOUT_SLACK)`, and its title becomes:

`"DR13 the Gallery's first row stands clear of the head cluster with the trail in it, at 1280 and at 640, which lays out the 1024 page, and keeps that clearance when the trail's line and its arrow grow, since the Gallery reserves the trail's own line rather than a copy of it (Issue #762; Issue #668; the gap ratified on Issue #736; Issue #906)"`

**DR16** (new `export async function dr16Dress(k: TrailKit): Promise<void>`), placed after `dr15TrailHover`:

```ts
type TrailDress = { navBottom: number; trailTop: number; trailBottom: number; trailHeight: number; alsoTop: number; trailFont: string; underline: string } | null;
const DRESS: Payload<TrailDress> = `(() => { const q = (s) => document.querySelector(s); const nav = q("header.chrome nav.rooms"), trail = q("header.chrome .trail"), also = q("header.chrome .also"), alias = q("header.chrome .also a"); if (!nav || !trail || !also || !alias) return null; const n = nav.getBoundingClientRect(), t = trail.getBoundingClientRect(), a = also.getBoundingClientRect(); return { navBottom: n.bottom, trailTop: t.top, trailBottom: t.bottom, trailHeight: t.height, alsoTop: a.top, trailFont: getComputedStyle(trail).fontSize, underline: getComputedStyle(alias).textDecorationColor }; })()`;
```

The function: `await k.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });`, `await k.goto("/prospect/");`, `const d = await k.evaluate(DRESS);`, `const alpha = d ? parseColour(d.underline).alpha : NaN;`, then `k.check(title, condition, detail)` with:

- condition: `!!d && Math.abs(d.trailTop - d.navBottom - 9.6) <= LAYOUT_SLACK && Math.abs(d.alsoTop - d.trailBottom - 8.8) <= LAYOUT_SLACK && Math.abs(d.trailHeight - 16) <= LAYOUT_SLACK && d.trailFont === "9.92px" && alpha === 0.55`
- detail: `JSON.stringify(d)`
- title: `"DR16 the trail's dressing stands as Issue #736 ratified it, on the Prospect at 1280: 0.6rem from the nav to the trail, 0.55rem from the trail to the alias line, the trail's type at 0.62rem on a 1rem line, and the alias underline drawn at 55% of its ink, which reads 3.70:1 over the band (DR11 holds its 3:1 floor) (Issue #906)"`

The underline is pinned by its computed alpha, not by its contrast: the ground under the band is a gradient sampled from a screenshot, so a contrast bound would be a Mac figure on a linux lane. The computed colour on main reads `color(srgb 0.937255 0.901961 0.811765 / 0.55)` (planning probe, 2026-10-17), and `parseColour`, already in the file, returns `alpha: 0.55` for it.

### `handbook/specs/ui-design.md`, the replacement wording

Replace the sentence starting `**Provisional until the post-use review:** the trail's size step under the nav` and ending `strengthened underline.` with:

`**Ratified at the post-use review (Issue #736):** the trail's size step under the nav, its separator glyph, the margins that clear the targets' spacing, the Gallery's first row given back its gap, and the alias link's strengthened underline; the cluster suite's DR13 and DR16 hold them. **Still provisional:** the alias line's wording and whether it earns its place. The trail and the nav sharing one ink stays as \`handbook/errata/site.md\` records it.`

## Tests, in the order they are written

| # | where | asserts | red on today's tree because | mutation that reds it once green | proved by |
|---|---|---|---|---|---|
| 1 | DR13, `e2e/suites/cluster/trail.ts` | the clearance under the trail is unchanged (within 1/32px) when `--trail-line` doubles and the arrow grows to 1rem, and stays at least 4px | today the arrow's `normal` line grows the trail to 20px while the Gallery's copied `1rem` stays put: measured 38.985 to 34.985 (a 4px drop) | (a) delete `line-height: var(--trail-line)` from `.trail .way`: measured 50.985 against 38.985; (b) put `1rem` back in the Gallery's calc: predicted 22.985 | `vellum-guard-prover`, both mutations |
| 2 | DR16, same file | the four ratified values and the underline's alpha (above) | not red: it pins values that already ship, and the ruling (Rulings line) has it proven by mutation instead | (c) `--trail-gap: 0.7rem`; (d) `.also` margin `0.65rem 0 0`; (e) `.trail` font-size `0.7rem`; (f) the `.also a` alpha `0.5`; (g) `--trail-line: 1.25rem` (reds the 16px height) | `vellum-guard-prover`, all five |

No unit test is added or changed. `test/site/gallery-room.test.ts`'s existing match on `main { padding: ...var(--band-h)` is untouched by the edit.

## Order of commits

1. `#906 The Gallery's first row keeps its clearance when the trail's line grows (failing)`: `handbook/plans/906/906-plan.md` plus the DR13 change. Build and run the cluster suite: DR13 must be red with its detail showing `grown` about 4px under `gap` at both widths. Push.
2. `#906 The trail's line box is the arrow's, and the Gallery reads it`: `public/shell.css` and `src/cli/gallery.ts`. DR13 green.
3. `#906 Pin the trail dressing Issue #736 ratified`: DR16 and its step line in `e2e/suites/cluster.ts`.
4. `#906 The trail's dress is ratified; the Gallery's copied line leaves the errata`: `handbook/specs/ui-design.md` and `handbook/errata/site.md`.

## Rosters and doctrine

- `--trail-line` joins no list: the `vellum/css-token-by-name` lint resolves a `var()` against the sheets' declarations, and `--trail-gap` is read by `GALLERY_PAGE_CSS` the same way today. `npm run lint` confirms.
- `handbook/specs/ui-design.md`: the Provisional sentence, replaced above.
- `handbook/errata/site.md`: the PR #737 row, deleted.
- DR13's title: the "provisional until Issue #736" clause, replaced above.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`.
- `npm run build`, then `VELLUM_E2E_SUITES=cluster npm run test:e2e` (DR11 to DR16), and `VELLUM_E2E_SUITES=runninghead npm run test:e2e` (its Gallery dress read checks `padTop >= bandH`, and `shell.ts` reads the trail's inks). Never the full lanes.
- **Before and after**: build at commit 1 (no CSS change yet) and at commit 2, and run each time `node scripts/design/shoot.ts <list> --site dist`, the list being the scratchpad's `906-probe.json` control rows with the `url` made relative (`/gallery/`, `/prospect/`) and `out` under `out/906-evidence/before/` and `out/906-evidence/after/`. The probe rows must match to the third decimal (trail 111.406 to 127.406, alias 136.203 to 149.203, Gallery first row 166.391, clearance 38.985 at 1280 and 1024), and `compare -metric AE -extract 520x200+0+0 <before> <after> null:` must print 0 for all four. The underline's contrast before and after is DR11's printed `alias underline` figure at commit 1 and at commit 3, and must not differ. Put the table in a PR comment with the list that produced it.
  The probe each row carries (from the planning probe, unchanged):

  ```js
  (() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { top: +b.top.toFixed(3), bottom: +b.bottom.toFixed(3), h: +b.height.toFixed(3), lh: cs.lineHeight, fs: cs.fontSize, mt: cs.marginTop, deco: cs.textDecorationColor }; }; const m = document.querySelector("main"); return { trail: r("header.chrome .trail"), way: r("header.chrome .trail .way"), also: r("header.chrome .also"), alsoA: r("header.chrome .also a"), nav: r("header.chrome nav.rooms"), header: r("header.chrome"), fig: r(".grid figure"), mainPad: m ? getComputedStyle(m).paddingTop : null }; })()
  ```

  Rows: `/gallery/` and `/prospect/`, each at 1280x800 and 1024x768, `mobile: false`, no `script`.

- **Closing**: the PR body's closing line closes Issue #906 only. Issue #736 and epic Issue #667 (whose open Issue #905 does not block it, per Issue #906) are closed by the dispatching session after the merge, as Issue #906's last acceptance box says; the PR body names that, and the implementer closes nothing.
- `vellum-plate-reader` is not owed: nothing about the appearance changes, and the before and after above is the measurement. `vellum-guard-prover` is owed for DR13 and DR16, mutations (a) to (g).

## Calls made

- **C1, the underline is pinned by its computed alpha (0.55), not by its contrast.** Rule: `CLAUDE.md`'s bound rule; the contrast reads a gradient ground from a screenshot, a Mac figure on a linux lane (plan skeptic finding 2). Ratified A5 was "keep 55%", a value the page computes.
- **C2, the arrow carries the line height.** Rule: the issue's "must not move a pixel"; the `.trail` alternative moved 0.516px (measured).
- **C3, the type size pinned is `.trail`'s 0.62rem only**, the value the sitting named (A1, 9.92px). The arrow's 0.78rem no longer moves anything once its line height is explicit, and the alias line's own size was not named. Rule: pin what was ratified, not new values.
- **C4, every pin lives in the cluster suite**, in the browser. Rule: `check-placement.md`, what the page computes.
- **C5, the Gallery's clearance is pinned relationally, not at 38.98.** Rule: `CLAUDE.md`'s bound rule (no Mac-measured figure as a CI bound); 38.98 is the before and after evidence.
- **C6, DR13's injection names `--trail-line`.** The token is the contract the issue asks the Gallery to read, and only a check that changes it catches the copied `1rem` coming back (mutation b). Rule: the guard must be able to bite on the regression the issue names.
- **C7, the `ui-design.md` Provisional sentence is rewritten in this pull request.** The pins would otherwise contradict a spec that calls these values provisional. Rule: workflow step 8, "Doctrine and rosters move with the code". The alias line's wording and whether it earns its place stay provisional, since the ratification does not name them; the shared ink stays with the errata, as the ratification says.

## Open decisions

none (D1, the first acceptance box, ruled (a): see the Rulings line)

## Stop conditions

Hand back, do not adapt, if:
- `public/shell.css` has no `--trail-gap: 0.6rem;` in `:root`, or the `.trail .way` rule lacks `vertical-align: -0.04em;`, or `src/cli/gallery.ts` lacks the exact `calc(var(--band-h) + 1.2rem + 1rem + var(--trail-gap))`.
- At commit 1, DR13 is green, or `grown` is not about 4px under `gap`.
- After commit 2, any before and after probe value differs at the third decimal, or any head crop AE is not 0.
- DR16's first run reads an underline alpha other than exactly 0.55, a trail height other than 16, or a font other than `9.92px`.
- `npm run lint` refuses `var(--trail-line)` in `GALLERY_PAGE_CSS`.
- Any other test or check reds on the CSS change.
