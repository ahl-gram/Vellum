# The Primer

The design round for Epic Issue #1155, the Primer: a guide page that teaches every room one small step at a time, and a pointing hand in the room a step opens. Archived by Issue #1247 (Sub 1).

- **Drawn:** by `vellum-designer` on 2026-11-05, in the design tree .claude/worktrees/designer-1155 at `089881ad`, the commit the live site deployed that morning. Every still is the real built site at that commit with the round's mock laid over it by its shot's script; no source file was edited.
- **Ruled:** by Alex the same day, on three menus, each taken in the main session: rulings 1 to 16 (Issue #1155 comment 6663627921), N1 to N10 (comment 6664332669) and M1 to M4 (comment 6664735683), after the go (comment 6659755467), the principle (comment 6659816287) and the scope (comments 6660161948, 6660218955 and 6660242398). Every decision of the round is ruled except the words, which N10 sends to the seats round, and the chart of lessons, which gets a round of its own.
- **Built to by:** Issue #1248 (Sub 2, the seats round, which draws what this round left to it) to Issue #1257 (Sub 11). The post-use re-review is Issue #1258 (Sub 12).

Everything here is the round as it ran. Nothing is edited to match the site or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`), and the round's words are the designer's stand-ins until a ruling says otherwise.

## What is in the archive

- **`notes.md`**: the designer's notes as they stood after the last ruling. They hold what to look at first, the three menus with the still each option was shown with and each item marked ruled, what the rulings produce read together, what was measured and with which command, what is NOT ruled ("For whoever builds it"), and the defects the round found. They name files this archive leaves out (below); those names dangle here, as the round's own page did. Their summary of the first menu reads "every option the round recommended"; rulings 2, 12 and 13 took options its menu did not recommend, as comment 6663627921 records, and the comment is the ruling.
- **`ladder.md`**: every step's words, all 81 across the nine rooms' ladders, each with its Try it address on the live site and what the round's drift check found.
- **`links.md` and `links.html`**: the longer link list ruling 13 asked for, every step's link grouped by ladder with what to look for, made after that ruling. `links.html` opens on its own and wears the house faces from `design/kit/fonts.css`.
- **`shots/stills/`**: the 85 stills the round shot for its menus, each at full scale, and many also cropped at twice the size (`*-2x.png`):

  | stills | what they show |
  |---|---|
  | `control-*.png` | today, the control: the Portfolio's three-step plate, the Questions & Answers entry nearest to a step, and a footnote's help in place |
  | `a-*.png` | direction A, the Primer page: its top, a step with its picture, a subroom, the road to the next room, the closing note, a step plain, a step as the sitting saw it with its review marks, the page at 1024, a Try it landing in its room, and the whole page with one room open (`a-folded-full.png`) |
  | `b-*.png` | direction B, the Schoolroom, a working room whose slip is the lesson (not chosen) |
  | `c-*.png` | direction C, a tour inside each room (not chosen); `c-entry-2x.png` is also the trail press of ruling 2 |
  | `d-*.png` | direction D, the pointing hand (chosen): the Explorer, the Prospect and the Ribbon, before and after the step is done, at 1280 and 1024, and over the ink, nautical and topographic dresses |
  | `e-*.png` | direction E, the chart of lessons, held for its own round |
  | `p-*.png` | the ways in: the road from home, the child seat under Questions & Answers, a road out from a room's press row, and the nav with a ninth item, Primer, in every room at 1024 (`p-ninth-*-1024.png`) |
  | `home-pip-*.png` | the Primer's pip on home (N7, M1, M2) at three moorings, Poalo, the chart's key and Nailo, with its card and with a fifth press on the legend row, at 1024 and 1280 |

- **`sheets/`**: the contact sheets the round's notes put first, eight PNGs, and the nine HTML pages that drew them with the shooter's list and results (`sheets/sheet-shots.json`, `sheets/sheet-results.json`). The pages link their images by the delivery's own paths from the root of the checkout (/out/1155/...), so served from this repository's root they show their layout, captions and house faces without their pictures, as in the earlier archives.

  | sheet | what it shows | menu items |
  |---|---|---|
  | `sheets/sheet-1-what-it-is.png` | today, then the five kinds of thing the guide could be | 1 |
  | `sheets/sheet-2-at-twice-the-size.png` | the same, cropped at twice the size, where the words are read | 1 |
  | `sheets/sheet-3-the-primer.png` | direction A, the Primer page | 5 to 9 |
  | `sheets/sheet-4-in-the-rooms.png` | B, C and D inside the rooms, D and C at 1024, and D over every dress | 1 and 12 |
  | `sheets/sheet-5-where-it-lives.png` | the ways in, the nav measured with a ninth item, and the home pip | 2, N7, M1 and M2 |
  | `sheets/sheet-6-the-name.html` (its PNG is left out) | the name, in the house's own forms | 3 |
  | `sheets/sheet-7-the-grain.png` | the Land at three grains | 4 |
  | `sheets/sheet-8-how-it-grows.png` | what a contributor writes to add a step, a room or a subroom, and the check that fails when a room changes | 10 and 11 |
  | `sheets/sheet-9-every-step.png` | every step with its picture, and the room once it is done | none of its own |

- **`measure/`**: every measured table (`measure/*.md`) with the raw results and shot lists beside them (`*-results.json`, `*-shots.json`), the sweep of seeds 1 to 100 (`measure/sweep-seeds-1-100.tsv`), where each picture was cut from its landing (`measure/pictures.tsv`), the files a new reading page joins, from the grep of the FAQ and of the Writing Room (`measure/gate4-faq-files.txt`, `measure/gate4-writing-room-files.txt`), an early probe of the page's height (`measure/primer-tops.json`) and every still's caption (`measure/stills-meta.json`). The later subs cite these as `design/the-primer/measure/`.
- **`mock/`**: the round's code as it ran. `mock/README.md` lists every script, and `notes.md` ("How this was made") the order they ran in. It ran from the design tree at `089881ad` against that tree's built site, and wrote to the main checkout's out/1155/ through `OUT_1155` in `mock/paths.ts`, so its paths name that layout, and replaying it as committed would write over that folder. It is neither type-checked nor linted: `design/` is outside `tsconfig.json`'s include and the lint's roots. The absolute paths into the checkout that it and the shot lists carry are kept as they ran, as the earlier archives keep theirs.
- **`refs/refs.json`**: the four references the round read, each with its source page, its URL and its licence field.

## What the archive leaves out, on purpose

- **refs/images/**, the four reference scans (14 MB): a hornbook of perhaps 1700 to 1750, a brass hornbook of 1729, a page of the New England Primer of 1773, and a manicule. A round's references are cited by link and never committed (`handbook/specs/conventions.md`), and `refs/refs.json` keeps the links.
- **sheets/sheet-6-the-name.png** (1 MB), the name sheet as shot, since it shows three of those scans: the Primer page of 1773, the hornbook of the 1700s and the manicule. Its HTML page is kept, and the sheet was not shot again without them, since a sheet shot again would be a still no sitting saw. Ruling 3 rests on that page, on menu item 3 in `notes.md` and on the nav measured in `measure/top-row.md`.
- **shots/landings/** (50 stills, 38 MB) and **shots/pictures/** (81 pictures, 11 MB): the room after each step done for real on the built site, and the picture beside each step, cut from those stills. Nobody ruled on them one by one. The pictures are the round's stand-ins, since the build draws its own with the engine (N8), and `sheets/sheet-9-every-step.png` shows every step with its picture. `mock/landings.ts` and `mock/pictures.ts` made them. `notes.md` and `measure/landings.md` name them; those names dangle here.
- **The probe captures under measure/**: check/, check-motion/, check-mutate/, explore/, extra/, inventory/, pip-sweep/, top-row/ and tops/, about 170 MB. Their numbers are kept in the tables and results beside them. `sheets/sheet-5-where-it-lives.html` shows six of the top-row captures, which are not here.
- **The round's page**, the delivery's generated index.html (3.6 MB), which links every file of the delivery, the scans included. This README replaces it.
- **subs/**, the drafts of the twelve subs and of the out-of-date FAQ answer the round found. They were filed as Issue #1247 to Issue #1258 and Issue #1259, and the issues are the record.
- **No file here carries a personal contact detail or a credential**, scanned before staging.

## The brief, in Alex's words

Each quoted from the comment that records it.

- **The go**, comment 6659755467:

  > "Let's get a vellum-designer going on issue 1155. For this issue (the guide page), I want maxmium surprise and delight. There are no bad ideas. Tell the designer to take as much time and tokens as necessary. Use the guidance and sources that are already spelled out in the issue body (and comments). Come to me for any open decisions. The main principles are: delightful, fun, EASY, teaches the user how to use all the rooms, and EXTENSIBLE. Extensible means, the guide page can easily be added to in the future for future rooms and/or features. Vellum will continue to grow and get more complex. The guide has to grow with it and avoid getting stale. But still remain so easy to use that a child could learn it."

- **The principle**, comment 6659816287:

  > "Another principle to send to the designer: question all existing constraints: if the nav needs to change, if a page needs to move, if wording needs to change, if a test needs to be removed, then don't let that stop you."

- **The scope**, comments 6660161948, 6660218955 and 6660242398:

  > "One update for the designer: this work includes guides/ladders for \"subrooms\" as well: The portfolio, the ribbon, and the prospect. I want tutorials for those as well."

  > "The guide teaches today and the gallery. For FAQ and the glossary, those should be mentioned as something for the learner to lean on after the tutorial. \"Remember, user: you can always start this tutorial again, or for quicker reference, use the FAQ page of the Glossary\"."

  > "Your interpretation was correct. I mistyped earlier."

  The last confirms that the FAQ and the Glossary are two pages, which the closing note names.

## The rulings, as ruled

Each in Alex's words, quoted from the comment that records it, beside the stills and tables it was ruled from. The menus they answer, with every option and what it cost, are in `notes.md`.

**How the stills stand to the rulings**, by the delivery folder's file times (Eastern time, read when it was archived), against the times the three rulings were posted (11:42, 12:13 and 12:31 on 2026-11-05):

- The stills of today and of the directions and the ways in (`control-*.png`, `a-*.png` to `e-*.png`, `p-*.png`) were last shot between 10:43 and 10:46, before the first menu was ruled, and are what it was ruled from.
- The home pip's stills were first shot from 12:16, after N7, and every one of them was shot again at 12:47, after M1 and M2 had been ruled from the earlier shots. The earlier shots are not kept, and whether they differ in pixels from these is UNVERIFIABLE.
- The nine contact sheets were last shot at 12:48 and 12:49, after every ruling, so `sheets/sheet-5-where-it-lives.png` carries home pip stills that did not exist when ruling 2 was made. The shots the first menu was ruled from are not kept.
- `notes.md` was last written at 12:48, after the last ruling. `ladder.md` was last written at 10:32, before the first.

### The first menu: rulings 1 to 16 (comment 6663627921)

| ruling | Alex's words | ruled from |
|---|---|---|
| 1, the kind | "A page, plus a pointing hand (Recommended)" | direction D: `shots/stills/d-explorer.png`, `shots/stills/d-explorer-done.png` and `shots/stills/d-explorer-1024.png`, beside today (`control-*.png`), A (`shots/stills/a-top.png`, `shots/stills/a-try-it-lands.png`), B (`shots/stills/b-before.png`, `shots/stills/b-after.png`) and C (`shots/stills/c-explorer.png`); `sheets/sheet-1-what-it-is.png` and `sheets/sheet-4-in-the-rooms.png` |
| 2, the ways in, all four | "A nav item (Recommended), A road from the home page (Recommended with the nav item), A child seat under Q & A, A press on each room's trail line" | the nav item: `sheets/sheet-5-where-it-lives.png`, the ten `p-ninth-*-1024.png` stills and `measure/top-row.md`; the road from home: `shots/stills/p-home.png`; the child seat: `shots/stills/p-child-2x.png`; the trail press: `shots/stills/c-entry-2x.png` and `measure/slip-and-press.md`. The comment records what the build owes for two of them: a seat for the press, which as drawn stands 3.1 px under the nav, and the Print Room's widening, since a ninth item cuts its style list's "antique" at 1024 |
| 3, the name | "The Primer (Recommended)" | `sheets/sheet-6-the-name.html` (its PNG is left out, above) and `measure/top-row.md`, where the name fits the nav with 23 px to spare in the tightest rooms. The comment calls the name a stand-in |
| 4, step size | "One action (Recommended)" | `sheets/sheet-7-the-grain.png` and `ladder.md`: 81 steps across nine ladders |
| 5, page shape | "One room open at a time (Recommended)" | `shots/stills/a-folded-full.png` and `measure/tops-results.json` |
| 6, skipping | "Open, with seals (Recommended)" | `sheets/sheet-3-the-primer.png`, and `measure/check.md`, where every step's address works on its own |
| 7, next roads | "Yes (Recommended)" | `shots/stills/a-next.png` |
| 8, pictures | "Drawn by the engine at each deploy (Recommended)" | `shots/stills/a-land.png`, beside a step with none (`shots/stills/a-plain-land.png`) |
| 9, delights | "All but the chart of lessons (Recommended)" | `shots/stills/e-chart.png`, the chart of lessons, held for its own round (Issue #1256) |
| 10, the drift check | "A browser check, plus the words each room already exports (Recommended)" | `sheets/sheet-8-how-it-grows.png`, `measure/check.md`, `measure/check-motion.md` and `measure/check-mutate.md` |
| 11, the index | "From the guide's data, rewording the site spec's index line (Recommended)" | `sheets/sheet-8-how-it-grows.png` |
| 12, how the pointing hand learns which control to ring | asked "How disruptive would using the hash be?", and then chose "A key after a question mark" | no still of its own: `sheets/sheet-4-in-the-rooms.png` shows the hand, and `measure/query-key-results.json` measured the key in all nine rooms after the ruling |
| 13, the sitting's link list | "No, a longer list" | `links.md` and `links.html`, made after the ruling |
| 14, provisional controls | "Teach now (Recommended)" | `shots/stills/a-sitting-land.png`, whose blue review marks are for the sitting only |
| 15, device steps | "Show all, with an 'on a tablet' or 'with motion on' mark (Recommended)" | no still: the marks are in `ladder.md`, on the Explorer's step 26 and the Reading Room's pace step |
| 16, the first room | "The Explorer, starting with the dice (Recommended)" | `ladder.md`, whose first step is the dice |

### The second menu: N1 to N10 (comment 6664332669)

Ruled from the words of `notes.md` (the first "New decisions, for Alex"), with no still. N7 is why the home pip was drawn.

| ruling | Alex's words |
|---|---|
| N1, where the done seals live | "This browser, until Begin again (Recommended)" |
| N2, when a step earns its seal | "When the room sees the step done (Recommended)" |
| N3, when the pointing hand lets go of its address key | "Take the key out of the address once the step is done or its slip is set aside (Recommended)" |
| N4, what the page opens on | asked "I thought we had decided on this already with the explorer dice?", and then chose "That room from its press; a returner resumes at their first unsealed room (Recommended)" |
| N5, the Q & A child seat | "As the house does it: an alias with its line and dashed track (Recommended)" |
| N6, the pointing hand against the destinations rule | "Record it in the rulebook as a second exception, beside the Chart Table (Recommended)" |
| N7, the road from home | took neither option offered and wrote "Add a new pip for the guide" |
| N8, the picture form | "Small pictures, about 13 KB, made at deploy (Recommended)" |
| N9, the key's name | "step (Recommended)" |
| N10, the stand-in words and names | "At the seats round's sitting, beside the new seats (Recommended)" |

### The third menu: M1 to M4 (comment 6664735683)

Each part of the home station was ruled from its own still.

| ruling | Alex's words | ruled from |
|---|---|---|
| M1, a fifth press on home's legend row | "Pip plus a fifth legend press, \"Learn one / The Primer\"" (the option the round did not recommend) | `shots/stills/home-pip-key-legend-1024.png`, the fifth press, shot with the pip at the key, beside `shots/stills/home-pip-poalo-1280.png` |
| M2, where the pip moors | "Poalo, in the empty north-west (Recommended)" | `shots/stills/home-pip-poalo-1024.png`, `shots/stills/home-pip-poalo-1280.png`, `shots/stills/home-pip-poalo-card-1024.png` and `shots/stills/home-pip-poalo-card-1280.png`, beside the key (`shots/stills/home-pip-key-1024.png`) and Nailo (`shots/stills/home-pip-nailo-1024.png`); `measure/pip-sweep.md` and `measure/home-pip.md` |
| M3, a deploy that finds no browser to make the pictures | "Stop and say so (Recommended)" | no still |
| M4, a tablet or motion step opened where it cannot apply | "No seal; it keeps its mark and the slip says why (Recommended)" | no still |

### Drawn after the sitting, for Sub 2, and NOT ruled

- `shots/stills/home-pip-poalo-legend-1024.png` and `shots/stills/home-pip-poalo-legend-1280.png`: M1 and M2 drawn together and measured (`measure/home-pip.md`), first shot at 12:33, after M1 to M4 were posted. No sitting has seen them. They are the round's drawing of the two rulings together, which the seats round (Issue #1248) ratifies with the words, and no builder takes them as ruled. `sheets/sheet-5-where-it-lives.png` shows them beside the ruled stills.

Every ruling about how the Primer looks or feels was made from pictures, and is provisional until the post-use re-review (Issue #1258) ratifies, amends or reverses it (`handbook/specs/conventions.md`, How a design decision is made).

## What the stills show that was NOT ruled

Each is a stand-in the designer picked to make the picture, listed in `notes.md` under "For whoever builds it", and a later build is not held to any of them:

- every stand-in word, "Try it", "Begin again", "Learn this room", "From The Primer", the home road's line, the marks and the fifth press's "Learn one / The Primer", which N10 sends to the seats round (Issue #1248); the comment on ruling 3 calls the name itself a stand-in too;
- the seal's look, the ring, the chips the controls are drawn as, the manicule's size, and the pointing hand's slip with its seat beside the Broadside, which covers 37% of the chart at 1024 by 768 (`measure/slip-and-press.md`);
- the blue review marks in `shots/stills/a-sitting-land.png`, for the sitting only;
- the pictures beside the steps, crops of browser screenshots, where the build draws its own with the engine (N8);
- the chart of lessons' drawing in `shots/stills/e-chart.png`, which gets its own round (Issue #1256);
- the directions not chosen, B and C, and the home pip's other moorings, the key and Nailo, kept as the record of what was weighed.

## What the round found that bears on the subs

The subs, Issue #1248 to Issue #1258, were written after the last ruling from `notes.md`'s readings of the rulings together, and each carries what it needs; this README does not restate them. `notes.md` lists the defects the round found and did not cause; its out-of-date FAQ answer is Issue #1259.
