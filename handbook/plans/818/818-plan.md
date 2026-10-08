# Issue #818: every delivery in out/ gets a page, and out/ gets a list of deliveries

Phase one, written 2026-10-08 at main `896c60ee` by the Issue #818 lane (branch `chore/818-delivery-pages`).
Finalized for phase two on Alex's rulings of 2026-10-08 (comment 6061246505), which settle every
choice the phase one draft marked for the menu; each is marked [RULED n] below.

## What binds

- **Body rulings 1 to 4 (Alex, 2026-10-08).** One shared generator writes `<folder>/index.html`
  showing as much inline as it can, notes at the top; no tests for it, but it passes `npm run check`,
  `npm run lint` and `npm run format:check`; a page per folder plus `out/index.html` listing every
  delivery newest first; nothing opens a browser.
- **The rule's homes (body):** `CLAUDE.md` "Write visual samples to out/", workflow step 6,
  `handbook/specs/conventions.md` (a round's stills), `.claude/agents/vellum-plate-reader.md`,
  `.claude/agents/vellum-implementer.md`; recon found three more lines that describe a copy into the
  main checkout's `out/` (workflow step 14, and `handbook/specs/orchestration.md`'s retiring copy).
  "A lane whose `out/` the dispatcher copies across runs the generator after the copy, in the main
  checkout": the dispatcher runs it, since a lane may run nothing in the main checkout.
- **Done when (body):** the generator exists with an npm script, the rule is in each home, and
  `out/779-census/` has a generated page as the sample. The comment of 2026-10-08 (6059756910) makes
  the sample the orchestrating session's, in the main checkout, after the merge; this lane proves
  the page on a copy of that folder in its own tree and reports the command.
- **Merge clearance (6059756910):** the orchestrating session merges once the review round is done
  and CI is green. Main has moved under this tree (PR #817, `7e5971c3`): `git merge origin/main`
  before the first commit, and again before reporting ready if it moves again, with check, lint,
  format:check and test re-run on the combined state.

## Design

### The command

- `npm run delivery -- out/<folder> [out/<folder> ...]` [RULED 1] writes each
  folder's page, then rebuilds `out/index.html`. With no folder it rebuilds only the list.
- A relative folder resolves from where the command was typed (`INIT_CWD`, which npm sets); an
  absolute one stands as given. The list goes into the folder's own parent, which must be a
  directory named `out` beside a `package.json` (the root of some checkout). So a worktree's run
  writes its own list, a design round's agent in a detached tree can give a folder it wrote straight
  into the main checkout's `out/<issue>/` its page by that folder's absolute path, and neither
  touches the other's list (plan skeptic finding 1). With no folder named, the command rebuilds the
  list of the checkout the script sits in.
- **Refusals:** the folder is missing or not a folder; its parent is not such an `out`; its
  `index.html` exists and was not written by the generator (no
  `<meta name="generator" content="vellum delivery page">` in its first kilobyte). A refused folder
  is named on stderr, the other folders still get their pages, the list is still rebuilt, and the
  command exits 1. `out/index.html` existing without the mark refuses the list alone. Three old
  folders hold a hand-built `index.html` today (`atelier-map`, `ribbon-limner`, and the test build
  `test-astro-build`), and overwriting one would destroy it.
- **A symbolic link is never followed** (the main checkout's `out/` holds 22, 15 pointing at nothing,
  some into worktrees long gone): it is listed by name among the other files as a link, with no
  address to follow, so nothing on a page reaches outside its folder through one.
- A folder that disappears while the list is being built (a unit suite deletes its `out/test-*`
  trees mid-run) is skipped, not fatal.
- It prints the absolute path of every page it wrote, which is what a reply names.
- A folder with no notes file still gets its page, with a banner where the notes go, and a warning
  on stderr; that alone does not fail the run.

### What a delivery page shows, in order

1. A heading: the notes' first line as the title (the folder's name when there are no notes), the
   folder's name, when it was delivered, and a count by kind ("6 tables, 2 texts, 4 scripts").
   Delivered means the newest modification time among the folder's files, the page itself left
   out and the notes in; the folder's own time is not used, since writing the page moves it.
2. The notes, from a file named notes.md in the folder [RULED 2: formatted (headings, lists, tables,
   bold, code) by a small formatter written here], with every file name it mentions linked to that file's
   place on the page.
3. A contents list of every file, linked, open when the folder holds 24 files or fewer and folded
   shut above that.
4. The folder's own files, then each subfolder as its own section headed by its path, in name order
   with numbers compared as numbers (`a-2` before `a-10`). Within a section, by kind: pictures, then
   pages in frames, tables, texts, scripts, then other files as a list of links.
   - **Pictures** (png, jpg, jpeg, gif, webp, avif, svg) [RULED 3: one per row, full width],
     each through an `<img>`, never pasted in as markup (chart SVGs share fixed ids such as
     `map-clip`, and two in one document cross their references), each linked to the file at full
     size, its width and height read from the file's header (PNG, GIF, JPEG, SVG) so the page reserves
     the space before it loads, and each loaded only as it nears the screen.
   - **Pages** (html, htm) in a frame the reader can drag taller, the file's name linking to it alone,
     at most 12 frames a page and the rest as links, since frames load at once from disk whatever
     the page asks (plate read: all 7 frames on the `762` page loaded at load, the deepest 592,000 px
     down). A subfolder holding its own `index.html` (a built site, a hand-built page) is ONE LINK to
     that page, neither framed nor walked: the plate read found 6 of the 7 such frames on `762` stuck
     at the site's splash from disk, their root-absolute styles and module scripts refused. This
     reverses the spike, which framed them. A candidate page that links its files from the root
     (`src="/..."`, 6 of the 34 under `out/*/` today) shows broken in a frame opened from disk, exactly
     as it does when opened alone; the generator does not repair it.
   - **Tables:** TSV and CSV as tables of plain rows (no header row is guessed, since the census
     files have none). In a box that scrolls inside itself, at most 500 rows, 40 columns and 4,000
     characters a cell, with a line saying how many rows the file holds beyond that, and a cell's
     text wraps inside its cell (the plate read found 1,350 cells on the `762` page painting over the
     next column).
   - **JSON** is its own kind and counts under its own noun ("50 JSON files"; the spike counted them
     as tables and drew none, plate read): a table when it is a list of records (keys as the header),
     a list of rows, a list of values or a flat record, shown open; indented text otherwise, folded
     shut under its name, so a folder of ledgers does not push its pictures 40 screens down (the
     `633-sitting` page, plate read).
   - **Texts:** markdown [RULED 2: formatted the same way as the notes]; txt as written,
     open. Logs, and files of an unknown extension shown as text, folded shut. At most the first
     256 KB, in a box that scrolls inside itself, with a line saying the rest is in the file.
   - **Scripts** (ts, mts, mjs, js, cjs, sh, py, css, scss, astro, yml, yaml, xml, diff, patch) as
     text, folded shut under their name.
   - The space a box takes before it is drawn is estimated near its real height (a picture reserves
     its exact size from its header and is not deferred; a capped box reserves its cap), since the
     spike's flat 420 px estimate left the scroll bar 34 to 39% short until the page was scrolled
     through (plate read).
   - **Anything else** as a link with its size. A file with an extension the generator does not know
     is shown as text when it is under 256 KB and holds no zero byte in its first 8 KB (`.names`,
     `.err`, `.stdout` today); PDFs, fonts and archives are always links.
   - Skipped: names starting with `.` (`.DS_Store`), `node_modules`, the page itself and the notes.
5. [RULED 4: every picture, with texts, tables,
   JSON and scripts shown until the page holds 4 MB of them and the rest listed by name], with a line
   at the top saying how many files are listed rather than shown when a limit bites. An uncapped page
   reaches 47 MB of HTML on the largest folders (measured below), so the 4 MB limit on inlined text
   stands in every option.
6. No script runs on either page, which the page itself enforces with a
   `<meta http-equiv="Content-Security-Policy" content="script-src 'none'">` (a `javascript:` link
   written in a notes file would otherwise run when clicked; a framed candidate keeps its own
   scripts), nothing loads from outside the folder, and the dress is one inline style block (no tracked stylesheet, which `test/repo/format.test.ts` would read): the house's
   walnut ground and parchment panels, in the serif stack the hand-built sample pages already use
   ("Iowan Old Style", Palatino, Georgia).

### The list of deliveries, `out/index.html`

- [RULED 5: every folder directly in `out/` whose page the
  generator wrote, new deliveries only, with no run over the older folders], newest first by the same delivered
  time; each row a thumbnail of its first picture (a folder with none shows its counts in the
  thumbnail's place rather than an empty box, which the spike drew), the notes' title, the folder's
  name, the time and the count by kind, all linking to the folder's page.
- Below them, folded shut, the folders with no generated page, newest first by the folder's own
  time, each linking to the folder, or to its own `index.html` where it holds a hand-built one. Loose
  files at the top of `out/` (the chart command writes there) are not deliveries and are not listed.

### Files

- `scripts/delivery/` [RULED 1], one module per job so each stays inside the lint's caps
  (400 lines a file, 50 lines a function; no file may join `eslint-suppressions.json`): `main.ts`
  (the command and its refusals), `walk.ts` (the folder walk and the kinds), `dims.ts` (picture
  sizes from headers), `markdown.ts` (the formatter and the file-name links), `tables.ts`,
  `render-item.ts` (one file's block), `page.ts` (a delivery's page), `index-page.ts` (the list),
  `style.ts` (the one style block).
- `package.json`: one line in `scripts`, `"delivery": "node scripts/delivery/main.ts"`, inserted
  without touching any other line.
- [RULED 6] Phase two ports the spike's code (in the scratchpad, `818-spike/`), since
  the line that discards a spike exists to keep the failing test first and ruling 2 rules this
  generator has none. What changes on the way across (plan skeptic finding 3): a refused folder no
  longer stops the batch, and the list is still rebuilt; the list's `out/` comes from the folder's
  parent, not from a flag; the walk returns its sections instead of filling an array it was handed;
  links are listed, a vanishing folder skipped, the script-forbidding policy line added; the video
  kind and the spike's arm switches (the row cap, the text budget, the layout, the page's file name,
  the out folder) go, replaced by the ruled constants; and the code is brought inside the lint.

## Measured on the spike (2026-10-08, this tree, clones of the main checkout's `out/`)

- One run per folder over clones of all 106 folders: 103 pages written, 3 refused (`atelier-map`,
  `ribbon-limner`, `test-astro-build`, the three hand-built pages), 30 seconds in all, each run
  rebuilding the list; the list alone over 103 pages builds in 211 ms and weighs 36 KB.
- With nothing capped, the largest pages are 47.4 MB (`scratch-2026-09-27`, 1,002 files at its
  top), 21.6 MB (`638`), 19.3 MB (`scratch-2026-09-28`) and 14.9 MB (`762`, 4,036 files walked);
  `762` with the first 300 files in full is 3.6 MB. `633-sitting` (196 files, 52 of them JSON shown
  as text) is 2.1 MB.
- With a 4 MB limit on inlined text, six of the largest folders (`scratch-2026-09-27`, `638`, `762`,
  `750`, `743`, `668`) give pages of 4.0 to 7.9 MB (`762` 6.7 MB), down from 11.6 to 47.4 MB
  uncapped. Not load-measured.
- The step 6 plate read, on `file://` at 1280x800, three loads an arm (its report has every table):
  - `762`, every file in full: 14.5 MB, ready (DOMContentLoaded) in 305 ms, 88,941 elements, 2,025
    screens long, about 2 GB held by the browser after scrolling through, long tasks up to 470 ms.
  - `762`, the first 300 in full (its own neighbour's frame failed on purpose): 3.6 MB, ready in
    87 ms, 26,637 elements, 160 screens, about 1.1 GB after scrolling through; 3,339 of its 3,608
    pictures are names only.
  - Grid against one per row on `518-mock` at 1280: 32 screens against 70; a 1280-wide shot shown at
    0.457 of its size against 0.939 on a plain screen, 0.914 device pixels a picture pixel against
    1.878 on a sharp one. At 1024 and below the two are the same page, to the pixel.
  - Every picture loaded on every page (3,608 of 3,608 on the largest), the `461-mockups` frame
    loaded its document from disk, no page scrolls sideways at 1280 or 1024, and no page logged an
    error outside the `762` frames.

## Tests

None for the generator: ruling 2. No guard is written, so no `vellum-guard-prover` round. Recon item 1
found nothing in the repo that forces a test, a roster entry or a reference for a new file under
`scripts/` or a new npm script (every reader of `package.json`'s scripts pins a named script; four
existing scripts are named nowhere under `test/`). The content scans that reach any new file are
kept: no test-shaped file name, no parameter named like an excused element (`noteEl`, `targetEl`),
no single-escaped `\s`, `\d`, `\w`, `\b` or `\.` in a template string.

## Evidence

- `npm run check`, `npm run lint` (the size caps included), `npm run format:check`.
- `npm test`, then `npm run astro:generate`. Before it runs, the phase one probe folder
  `out/818-backfill-probe/` (a clone of every main checkout folder, which holds
  `scratch-2026-10-06/754/754-main-dress-test.ts`, a name `node --test` runs) is moved out of this
  tree, and a `find` over this tree's `out/` for the test-shaped names `vellum-footguns` Gate 1
  item 8 lists must come back empty, since `test/repo/test-collection.test.ts` and `node --test` both
  read inside the gitignored `out/` (plan skeptic finding 2).
- The evidence run: the generator over clones (`cp -cRp`) of the main checkout's `out/779-census`,
  `461-mockups`, `518-mock`, `633-sitting` and `762` (the largest, 5,412 files and 2.6 GB), with a
  sample notes file in two of them; then `vellum-plate-reader` at step 11, one round, over the built
  pages: overflow at 1280 and 1024, every picture loading, the frame loading on `file://`, and load
  time and memory on the largest folder.
- The refusals, each by its exit code and a `shasum` of the untouched file before and after: a clone
  of `ribbon-limner` (a hand-built `index.html`) named FIRST in a batch with a good folder after it,
  where the good one must still get its page and `out/index.html`'s modification time must move
  (plan skeptic finding 4); a folder whose parent is not an `out` beside a `package.json`; a missing
  folder; and the same good folder given by its absolute path from another directory.
- Links: a clone of `763` (its `plate/763-plate-site/` holds links into a worktree that is gone) and
  of `49-former-measure` (`site-root/` links into `../../../dist`) get pages with every link listed
  by name and none followed (plan skeptic finding 5).
- The command for the orchestrating session's sample run, reported with the PR: after the merge,
  `git -C <main checkout> pull --ff-only`, then write `out/779-census/notes.md`, then
  `npm run delivery -- out/779-census` at the main checkout's root.

## Doctrine and rosters this drags

One normative home, the others pointing at it by name (`handbook/specs/conventions.md`, Where a rule
lives):

- `handbook/specs/development-workflow.md` step 6, the normative paragraph, beside "`out/` inside a
  worktree is not where Alex looks": a delivery is one folder directly in `out/`, named for its issue
  (`out/<issue>/` as today, or `out/<issue>-<what>/` when one issue delivers more than once, the
  form `out/` already shows); whoever fills it writes its notes file there, saying what to look at and
  which menu option each file belongs to; the delivery ends with the command over the folder; the
  reply names the folder's page and the list by absolute path beside the files; a dispatcher copying
  a lane's folder across copies it with its files' times kept (`cp -Rp`, since the page dates a
  delivery by its newest file) and runs the command again in the main checkout after the copy,
  which is what puts it in the main checkout's list; nothing opens a browser. In the same step's
  bullet on an agent that "writes straight to the main checkout's `out/<issue>/`", that agent ends by
  running the command over the folder by its absolute path from its own tree. File names written in it are
  `out/<folder>/index.html`, `out/<folder>/notes.md` and `out/index.html`, never a bare backticked
  `index.html` or `notes.md`, which `test/repo/prose-paths.test.ts` reds.
- `CLAUDE.md` "Write visual samples to out/": one sentence pointing at step 6. The heading keeps its
  words, which `vellum-plate-reader.md` and the footguns `references/scars.md` cite by name.
- `handbook/specs/conventions.md`, the bullet on a round's stills in `out/<issue>/`: the folder ends
  with its page, pointing at step 6.
- `handbook/specs/development-workflow.md` step 14, "whoever dispatched the lane copies the samples
  across": and runs the command after the copy, pointing at step 6.
- `handbook/specs/orchestration.md`, "Retire a lane's tree ... Copy its `out/` first": and run the
  command over each folder copied, pointing at step 6.
- `.claude/agents/vellum-plate-reader.md`: its files go in one folder named for the issue (replacing
  "under a name that carries the issue's number"), it writes that folder's notes and runs the command
  over it, and its report names the folder's page.
- `.claude/agents/vellum-implementer.md`: the phase one report names the stills folder's page beside
  the stills, and the dispatcher re-runs the command after copying.
- Not edited: step 10's measured-table line (a table still goes into a PR comment, whatever page shows
  it); orchestration's `out/scratch-<date>/` (a session's scratch, not a delivery, which the list
  shows only among the folders with no page).
- The PR body names which version of the two agent definitions wrote the change and which reviewed it
  (workflow step 14).
- No roster: the npm script and the folder join nothing that checks itself (recon item 1).

## Found on the way, relayed rather than fixed here

- The plate reader's five environment facts for `handbook/specs/settle-doctrine.md`, The environment
  (a blocked-URL list does not stop a frame's document; a second CDP socket taps what the harness
  drops; lazy frames do not defer from disk; a beyond-viewport capture of a `content-visibility` page
  paints only its first items; a killed driver leaves its browser holding the debug port): searched
  for in the open issues and `handbook/errata/` in phase two and filed as one issue, since the
  Issue #779 part 2 lane may be editing the specs.
- The main checkout's `out/scratch-2026-10-06/754/754-main-dress-test.ts` is a name `node --test`
  collects, against `handbook/specs/orchestration.md`'s "under no name `node --test` collects"
  (plan skeptic); that checkout is the dispatcher's.

## Calls made without a ruling (posted on the issue before the PR opens)

1. Step 6 is the one normative home; the other homes point at it. The CLAUDE.md heading keeps its
   words.
2. A delivery folder is named `out/<issue>/` or `out/<issue>-<what>/`, the second already the practice
   (`518-mock`, `518-plate-read`).
3. A subfolder holding its own `index.html` is one link to that page, neither framed nor walked
   (reversed from the spike after the plate read found 6 of 7 such frames broken from disk); at most
   12 frames a page.
4. The refusals above: a hand-built `index.html` is never overwritten; a batch carries on past a
   refused folder and exits 1; missing notes warn and do not fail.
5. The delivered time is the newest file's modification time, the page left out and the notes in.
6. (Moved to the menu on plan skeptic finding 6: whether markdown is shown formatted.)
7. Scripts are text, folded shut, rather than links; PDFs, fonts and archives are links.
8. JSON is its own kind: a table when table-shaped, else indented text folded shut; logs and
   unknown text folded shut too; TSV and CSV have no guessed header row; a table cell wraps.
9. The per-file limits: 256 KB of text, 500 rows.
10. A candidate page that links from the root shows broken in its frame from disk; not repaired.
11. The page's dress: walnut and parchment, the serif stack, no script, nothing loaded from outside
    the folder.
12. `vellum-plate-reader` runs at step 11 over the built pages, one round, since step 6 was ruled
    from stills (workflow step 11), whatever ruling 2 waives for tests.
13. Ruling 1's "pictures and SVGs inline" is read as shown on the page through `<img>`, never as
    markup pasted into it, since chart SVGs share fixed ids (`map-clip`, `parchment`, `vignette`)
    and two in one document cross their references.
14. A symbolic link is listed, never followed; the list's `out/` is the folder's own parent; a folder
    vanishing mid-run is skipped; the page forbids scripts by its own policy line.
15. The copy across keeps the files' times (`cp -Rp`).
16. Presentation fixes from the step 6 plate read, each a deviation from the stills Alex rules
    from and named so in the PR body: the subfolder-page link (call 3), the frame cap, the JSON
    noun and folding, the wrapped cells, the near-true space estimate, and the list's thumbnail
    placeholder. The step 11 plate read measures them built.
