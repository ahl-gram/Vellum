# Issue #1016 plan: pull request 2 of 4, every key press written once

**Planned at**: `origin/main` 0f8bf7d2 (`git ls-remote origin refs/heads/main`, re-read after the call below was folded in), Issue #1016 at 4 comments (`gh api repos/ahl-gram/Vellum/issues/1016/comments | jq length`: the rulings 6593146850, the archive of pull request 1's plan 6593184197, pull request 1's step 12 calls 6593424659, and the dispatcher's call on this plan's one menu item, 6600173679). Read beside it: the archived plan of pull request 1, `handbook/plans/1000/1016/1016-plan.md` (its section "Not this pull request: the sketch later planners start from" and its Calls); PR #1208's body; Issue #1209 (0 comments; pull request 3's, not this one's); Issue #1211 (0 comments; the P24 flake, not touched here).

**Rulings**: Alex, 2026-11-02, on pull request 1's menu: https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6593146850. Ruling 1 is this pull request's scope: "key presses (about 34)", one kind of browser message per pull request, an automatic check after it refusing any new hand-written copy, planned by its own planner. The dispatcher's brief (2026-11-03) relays a standing clearance to plan, build and merge all four pull requests in order. This plan's one menu item, the names, was answered with option A by the dispatcher under that clearance, labelled on the issue as not an Alex ruling: https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6600173679 ("the planner's option A": `sendKey` keeps its name, extended and moved to `e2e/support/input.ts`; options B and C not taken). The plan was written to option A, so folding it changed no design, file or test.

**Open decisions**: none.

## Specs

The implementer reads these, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: "The environment", the bullet opening "Enter presses a focused button only when the key event carries its character" (this pull request edits it); the bullet opening "A run deletes its own browser profile only if it is allowed to finish"; clause 14 (a suite can red in lane order and pass alone).
- `handbook/specs/check-placement.md`: "The lint" (a new house rule lives in `scripts/lint/`, is wired in the block that already reaches the same files, and is proven by its own test running ESLint over a fixture it refuses and one it passes) and "The unit suite".
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" (for the one spec edit), "How code is cited", and the comment rules.
- `handbook/specs/development-workflow.md`: steps 7 to 15.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 (items 1, 3, 9, 16), Gate 2 (items 9, 10, 11), Gate 4, Gate 5.

## Recon

`vellum-spec-recon` at 0f8bf7d2, against Issue #1016 and the sketch in pull request 1's plan: 1 STALE, 8 CURRENT, 0 UNVERIFIABLE.

- **CURRENT, every count the sketch gives.** 40 `Input.dispatchKeyEvent` sends in 18 files under `e2e/` (`git grep -n "Input.dispatchKeyEvent" -- e2e`), none outside `e2e/` but the readers in four unit tests and one line of `handbook/specs/settle-doctrine.md`; 34 files that send a key by a raw send, `sendKey`, `pressKey` or `navKeys`. A 35th, `e2e/suites/landfall/page.ts`, sends keys only through the kit member `pressNav`, whose callers do not change, so it is not in the edit list. Every cited line (the `rawKeyDown` sites, `nativeVirtualKeyCode`, `unmodifiedText`, `modifiers`, the loupe's held `l` and `OPTION_UP`, the seven Enter presses of pull request 1's Call 10, `sendKey` at `e2e/support/home.ts:46`, the four test readers, the Enter bullet's `p31Keyboard`, `midTurn` and `navKeys`) is where the sketch says. The seven Enter presses are the only Enter presses sent without `text`.
- **Rejected in writing: the STALE finding.** Recon marks "`scripts/lint/e2e-cdp-helpers.ts`, rule `e2e-cdp-through-helper`" STALE because no such file exists. The sketch names it as the module the key pull request CREATES, beside its model `scripts/lint/e2e-scripts-off.ts`; it was never claimed to exist. This plan creates it.
- **Surfaced, taken as calls** (Calls made): `Input.insertText` is sent at five places (`writing-room/carry.ts:214`, `document-rooms.ts:253`, `print-room/link.ts:229`, `broadside/shape.ts:235` and `:357`) and is not a key press; the shape of the shared press, given the field variety; the Enter bullet's citations.

## The design

### One shared press, the one the suites already use

**`sendKey` moves from `e2e/support/home.ts` to a new `e2e/support/input.ts`, keeps its four arguments `(send, key, code, vk)`, and takes an optional fifth, `options`.** `keyDown` and `keyUp` are exported beside it for the one press split around reads: the loupe holds `l` down across a poll and sends its release on its own, once plainly and once under Option. `options` takes CDP's own field names, so a reader maps each to the wire without a glossary:

| option | rides | sent by |
|---|---|---|
| `down: "rawKeyDown"` | the down event's `type` (default `keyDown`) | `cards/cap.ts` PageDown, `cards/hold.ts` Tab, `cluster/chart.ts` Tab and Escape |
| `text` | the down event alone | every Enter that activates (five sites), landfall's Space, the loupe's `l` |
| `unmodifiedText` | the down event alone, only when given (never derived from `text`) | `cards/hold.ts`, `chart-drawer/gestures.ts`, `cluster/chart.ts` |
| `nativeVirtualKeyCode` | both events | `cards/cap.ts`, `cards/hold.ts`, `chart-drawer/gestures.ts`, `corners/floor.ts` |
| `modifiers` | both events, a `0` included | `chart-drawer/kit.ts`, `stage/slide-holds.ts`, the loupe's Option release |

That split (type and text on the down; native code and modifiers on both) is what every one of the 40 sends does today, measured below at 29 of 29 forms. A field a site does not send is absent from the params, not present as `undefined`.

**Why `sendKey` extended, and not a new name** (the measured churn, and option A of the menu, taken by the dispatcher's call 6600173679): `sendKey` has 28 references (`git grep -n -w sendKey -- e2e | wc -l`); extended in place, its 17 calls in 9 files, the one in `pressKey`'s body and `pressKey`'s own 15 calls (`git grep -c -F "sendKey(" -- e2e`, `git grep -c -F "pressKey(" -- e2e`) stay exactly as they are, and only 9 import lines and `home.ts` change. A new `pressKey` collides with `makeStage`'s member `pressKey(key, code, vk)`, which pull request 1's Call 3 keeps and which `home/kit.ts` and `landfall/kit.ts` hand on to those 15 calls; a new `key` collides with three module functions already named `key` (`cluster/chart.ts`, `chart-drawer/kit.ts`, `zoom/loupe.ts`) and with local `key` variables in `slide-away/holds.ts`, `stage/slide-holds.ts` and `landfall/kit.ts`. The house's names (`bounce`, `toExplorer`, `explorerUp`, `waitInked`) say what the function does; `sendKey`, `keyDown` and `keyUp` do.

**Every wrapper keeps its name and signature; only its body changes** (pull request 1's Call 3): `pressKey` (`makeStage`), `pressNav` (`gestureKit`), `key` in `cluster/chart.ts`, `key` in `chart-drawer/kit.ts`, `tab` in `stage/slide-holds.ts`, `key` in `zoom/loupe.ts`. Two go: `navKeys` in `e2e/suites/landfall/kit.ts`, whose only work (spreading `text` when given) is now `sendKey`'s, so `pressNav` calls `sendKey` directly; and the constant `OPTION_UP` in `zoom/loupe.ts`, which becomes a function `optionUp(k)` holding the same release.

**The seven Enter presses sent without `text` stay without it** (pull request 1's Call 10): their calls are `sendKey(send, "Enter", "Enter", 13)` today and are not edited.

### The guard

**One lint rule, `vellum/e2e-cdp-through-helper`, in a new `scripts/lint/e2e-cdp-helpers.ts`**, on the pattern of `scripts/lint/e2e-scripts-off.ts`: a string literal, or a template literal holding no expression, whose value is a guarded CDP method is refused in every e2e file but that method's one home. The rows are a `Map` exported as `CDP_HOMES` (a `Map` because a plain object answers `"constructor"` and `"toString"` with a function, which would refuse those strings everywhere; measured below). This pull request's one row is `"Input.dispatchKeyEvent"` to `"e2e/support/input.ts"`; pull requests 3 and 4 add theirs. Wired at error in `eslint.config.ts`'s block "the house's rules on every e2e script", which reaches `e2e/**/*.ts` and nothing else, so the four unit tests under `test/e2e/` that read `"Input.dispatchKeyEvent"` as data are out of its reach.

**Blind spots, each erring toward missing a copy** (declared in the rule's test): a method name assembled from pieces (`"Input." + kind`) or from a template holding an expression; a name held in a binding the file never spells, such as a constant imported from a file the rule does not read; and a press written by hand on top of `sendKey`, `keyDown` or `keyUp`, since the rule reads spellings, not what a function does. Review holds those.

### Alternatives rejected

- **A new helper under a new name** (`pressKey` or `key`). The churn above; ruled out by the measured collisions, not by taste.
- **One options object in place of the four positional arguments** (`sendKey(send, { key, code, vk, ... })`). Every one of the 17 existing calls and the `pressKey` wrapper would change for no field gained.
- **Deriving `unmodifiedText` from `text`, or `nativeVirtualKeyCode` from `vk`.** `corners/floor.ts` and `slide-away/holds.ts` send `text` with no `unmodifiedText`, and most sites send no native code; deriving either would add fields those sites never sent.
- **Dropping the fields the Mac's page cannot tell apart** (`rawKeyDown` against `keyDown` on Tab, the native code on PageDown, `modifiers: 0`; readings below). A refactor keeps every field each site sends, and the Mac's browser does not stand for CI's Google Chrome.
- **Folding `vellum/e2e-scripts-off-through-helper` into the new rule's rows.** It is the same shape, but folding renames an existing guard, rewrites its message and its test (`test/repo/e2e-scripts-off.test.ts`) in a pull request about keys, for no copy found.
- **A browser check that a press reaches the page.** The 40 sends are already the fixture of every check after them; a press that changed would red those (P31, CD's turn, FL's drawer, SW5, L1g's Space).
- **Taking `Input.insertText` into `input.ts` and the guard.** See Calls made.

## Files

New:

- **`e2e/support/input.ts`** (about 35 lines):
  ```ts
  // The suites' key presses, once (Issue #1016).
  import type { SuiteContext } from "../types.ts";

  type Send = SuiteContext["send"];
  type BothEvents = { nativeVirtualKeyCode?: number; modifiers?: number };
  type PressOptions = BothEvents & { down?: "rawKeyDown"; text?: string; unmodifiedText?: string };

  const KEY_EVENT = "Input.dispatchKeyEvent";

  const keyFields = (key: string, code: string, vk: number, { nativeVirtualKeyCode, modifiers }: BothEvents) => ({
    key,
    code,
    windowsVirtualKeyCode: vk,
    ...(nativeVirtualKeyCode === undefined ? {} : { nativeVirtualKeyCode }),
    ...(modifiers === undefined ? {} : { modifiers }),
  });

  export async function keyDown(send: Send, key: string, code: string, vk: number, options: PressOptions = {}): Promise<void> {
    const { down = "keyDown", text, unmodifiedText } = options;
    await send(KEY_EVENT, {
      type: down,
      ...keyFields(key, code, vk, options),
      ...(text === undefined ? {} : { text }),
      ...(unmodifiedText === undefined ? {} : { unmodifiedText }),
    });
  }

  export async function keyUp(send: Send, key: string, code: string, vk: number, options: BothEvents = {}): Promise<void> {
    await send(KEY_EVENT, { type: "keyUp", ...keyFields(key, code, vk, options) });
  }

  export async function sendKey(send: Send, key: string, code: string, vk: number, options: PressOptions = {}): Promise<void> {
    await keyDown(send, key, code, vk, options);
    await keyUp(send, key, code, vk, options);
  }
  ```
  This exact code type-checks under the repo's `tsconfig.json` (the probe below inlines it; `tsc -p out/1016-pr2-dry-run/tsconfig.json` exit 0 in the planner's tree) and lints clean under the house config with its type information (`node out/1016-pr2-dry-run/lint-check.ts`, which lints it as text at `e2e/support/nav.ts`'s path; log `out/1016-pr2-dry-run/lint-check.log`).
- **`scripts/lint/e2e-cdp-helpers.ts`** (about 35 lines):
  ```ts
  import type { Rule } from "eslint";
  import { relative, resolve, sep } from "node:path";

  const ROOT = resolve(import.meta.dirname, "..", "..");
  export const CDP_HOMES: ReadonlyMap<string, string> = new Map([["Input.dispatchKeyEvent", "e2e/support/input.ts"]]);

  const cdpThroughHelper: Rule.RuleModule = {
    meta: {
      type: "problem",
      messages: {
        found: "an e2e file sends {{spelling}} only through its helpers in {{home}}, where it is written once (Issue #1016)",
      },
    },
    create(context) {
      const file = relative(ROOT, context.filename).split(sep).join("/");
      const refuse = (node: Rule.Node, spelling: unknown): void => {
        if (typeof spelling !== "string") return;
        const home = CDP_HOMES.get(spelling);
        if (home !== undefined && home !== file) context.report({ node, messageId: "found", data: { spelling, home } });
      };
      return {
        Literal(node) {
          refuse(node, node.value);
        },
        TemplateLiteral(node) {
          if (node.expressions.length === 0) refuse(node, node.quasis[0]?.value.cooked);
        },
      };
    },
  };

  export default { rules: { "e2e-cdp-through-helper": cdpThroughHelper } };
  ```
  This exact code type-checks (`out/1016-pr2-dry-run/rule-typecheck.ts`, in the same `tsc` run) and lints clean under the house config (the same `lint-check.ts`, linted as text at `scripts/lint/e2e-scripts-off.ts`'s path).
- **`test/e2e/input.test.ts`** and **`test/repo/e2e-cdp-helpers.test.ts`**: the tests below.

Edited, in three groups. In every file that gains the import, it is written directly after the file's last `import` statement: `import { sendKey } from "../../support/input.ts";` (`"../support/input.ts"` for `e2e/suites/broadside.ts`; `{ keyDown, keyUp }` for `zoom/loupe.ts`; `{ sendKey } from "./input.ts"` for `e2e/support/home.ts`). Remove from a destructuring exactly the names `npm run lint` then reports unused, and nothing else (none is expected: every site keeps using its `send`).

**Group A, the move (commit 3).**

1. **`e2e/support/home.ts`**: delete `sendKey` (lines 46-49) and the blank line after it; add `import { sendKey } from "./input.ts";` after line 3. `pressKey` (line 54) is unchanged. Line 1's header stays (the stage's real-input plumbing, `clickAt` and `makeMouse`, is still here until pull request 4).
2. to 10. The nine importers change only the path of `import { sendKey } from "../../support/home.ts";` to `"../../support/input.ts"`: `e2e/suites/broadside/dress.ts:8`, `e2e/suites/broadside/shape.ts:4`, `e2e/suites/glass-ceremony/gestures.ts:3`, `e2e/suites/print-room/link.ts:1`, `e2e/suites/reading-room/gestures.ts:2`, `e2e/suites/room-instrument/pace.ts:1`, `e2e/suites/runninghead/gestures.ts:2`, `e2e/suites/writing-room/carry.ts:7`, `e2e/suites/zoom/camera.ts:2`. None of their 17 `sendKey(...)` calls changes.

**Group B, the raw sends (commit 4).** Each before is the text at 0f8bf7d2; each after is what replaces exactly those lines.

11. **`e2e/suites/broadside.ts`** (in `br4Notes`): lines 242-243 (the Escape keyDown and keyUp) become `await sendKey(send, "Escape", "Escape", 27);`.
12. **`e2e/suites/cards/cap.ts`** (P27's `scrollAfter` callback): lines 150-163 (a `rawKeyDown` and a `keyUp`, each `windowsVirtualKeyCode: 34, nativeVirtualKeyCode: 34, code: "PageDown", key: "PageDown"`) become `await sendKey(send, "PageDown", "PageDown", 34, { down: "rawKeyDown", nativeVirtualKeyCode: 34 });`. The comment at line 146 stays.
13. **`e2e/suites/cards/hold.ts`** (`p31Keyboard`): lines 271-300 become
    ```ts
    await sendKey(k.send, "Enter", "Enter", 13, { text: "\r", unmodifiedText: "\r", nativeVirtualKeyCode: 13 });
    await sendKey(k.send, "Tab", "Tab", 9, { down: "rawKeyDown", nativeVirtualKeyCode: 9 });
    ```
14. **`e2e/suites/chart-drawer/gestures.ts`** (`midTurn`): lines 178-193 become `await sendKey(send, "Enter", "Enter", 13, { text: "\r", unmodifiedText: "\r", nativeVirtualKeyCode: 13 });`. The comment at line 177 stays.
15. **`e2e/suites/chart-drawer/kit.ts`**: `key` (lines 188-197) becomes
    ```ts
    const key = (send: SuiteContext["send"], modifiers = 0): Promise<void> => sendKey(send, "Tab", "Tab", 9, { modifiers });
    ```
    Its callers at lines 205-206 are unchanged.
16. **`e2e/suites/cluster/chart.ts`**: `key` (lines 33-39) becomes
    ```ts
    async function key(k: TrailKit, name: "Enter" | "Tab" | "Escape"): Promise<void> {
      const vk = { Enter: 13, Tab: 9, Escape: 27 }[name];
      await sendKey(k.send, name, name, vk, name === "Enter" ? { text: "\r", unmodifiedText: "\r" } : { down: "rawKeyDown" });
    }
    ```
17. **`e2e/suites/corners/floor.ts`**: lines 333-347 become `await sendKey(ctx.send, "Enter", "Enter", 13, { text: "\r", nativeVirtualKeyCode: 13 });`.
18. **`e2e/suites/landfall/controls.ts`** (`tabToZoomIn`): lines 150-151 become `await sendKey(send, "Tab", "Tab", 9);`.
19. **`e2e/suites/landfall/kit.ts`**: delete `navKeys` (lines 112-127) and the blank line after it; in `gestureKit`, `pressNav` (lines 151-153; the comment at line 150 stays) becomes
    ```ts
    const pressNav = async (key: string, code: string, vk: number, text?: string) => {
      await sendKey(send, key, code, vk, { text });
    };
    ```
20. **`e2e/suites/prospect/gestures.ts`**: lines 95-96 become `await sendKey(send, "Tab", "Tab", 9);`.
21. **`e2e/suites/ribbon/gestures.ts`**: lines 47-48 become `await sendKey(send, "Tab", "Tab", 9);`.
22. **`e2e/suites/runninghead/kit.ts`** (`visit`'s veil loop): lines 24-30 become `await sendKey(send, "Escape", "Escape", 27);`. The `sleep(150)` after them stays.
23. **`e2e/suites/runninghead/shell.ts`**: lines 261-262 (`rh12FocusRing`) become `await sendKey(send, "Shift", "ShiftLeft", 16);`; lines 281-287 (`focusWordmark`) become `await sendKey(k.send, "Shift", "ShiftLeft", 16);`.
24. **`e2e/suites/slide-away/holds.ts`** (`enterOnLastRow`): lines 45-47 (the `const key` and its two sends) become `await sendKey(ctx.send, "Enter", "Enter", 13, { text: "\r" });`.
25. **`e2e/suites/stage/slide-holds.ts`**: `tab`'s body (lines 200-202) becomes `await sendKey(ctx.send, "Tab", "Tab", 9, { modifiers: shift ? 8 : 0 });`.
26. **`e2e/suites/stage/zoomed.ts`** (`markRing`): lines 79-90 become `await sendKey(ctx.send, "Shift", "ShiftLeft", 16);`.
27. **`e2e/suites/zoom/loupe.ts`**: `key` (lines 59-65) becomes
    ```ts
    const key = (k: ZoomKit, type: "keyDown" | "keyUp"): Promise<void> =>
      type === "keyDown" ? keyDown(k.send, "l", "KeyL", 76, { text: "l" }) : keyUp(k.send, "l", "KeyL", 76);
    ```
    `OPTION_UP` (line 66) becomes `const optionUp = (k: ZoomKit): Promise<void> => keyUp(k.send, "\u00ac", "KeyL", 76, { modifiers: 1 });`, and line 326 becomes `await optionUp(k);`. The eight `key(k, ...)` calls (lines 320 to 356) are unchanged.

After group B, `git grep -n -F "Input.dispatchKeyEvent" -- e2e` prints exactly one line, `e2e/support/input.ts`'s `KEY_EVENT`.

**Group C, the guard and the doctrine (commits 5 to 7).**

28. **`eslint.config.ts`**: after line 13 add `import e2eCdpHelpers from "./scripts/lint/e2e-cdp-helpers.ts";`; in the `vellum` plugin object (line 33) add `...e2eCdpHelpers.rules,` directly after `...e2eScriptsOff.rules,`; in the block "the house's rules on every e2e script" add `"vellum/e2e-cdp-through-helper": "error",` between `"vellum/e2e-cancellation-roster"` and `"vellum/e2e-console-read-through-drop"`.
29. **`handbook/specs/settle-doctrine.md`**, the Enter bullet in "The environment" (lines 462-466). Before:
    ```
      files nothing passes whatever the page would have done. Send Enter with `text: "\r"`, as
      `p31Keyboard` in `e2e/suites/cards/hold.ts` and `midTurn` in `e2e/suites/chart-drawer/gestures.ts`
      do, and read that the press holds the focus before trusting the key's lack of effect. Space is the
      same: it scrolls the page only when its `keyDown` carries `text: " "`, while the navigation keys
      scroll from their codes alone (`navKeys` in `e2e/suites/landfall/kit.ts`).
    ```
    After:
    ```
      files nothing passes whatever the page would have done. Send Enter with `text: "\r"`, the `text`
      option of `sendKey` in `e2e/support/input.ts`, as `p31Keyboard` in `e2e/suites/cards/hold.ts` and
      `midTurn` in `e2e/suites/chart-drawer/gestures.ts` do, and read that the press holds the focus
      before trusting the key's lack of effect. Space is the same: it scrolls the page only when its
      `keyDown` carries `text: " "`, while the navigation keys scroll from their codes alone (`pressNav`
      in `e2e/suites/landfall/kit.ts`).
    ```

Every edited suite and support file shrinks, `eslint.config.ts` gains its three lines and the Enter bullet one; no file passes 400 lines and no function passes 50.

## Tests, in the order they are written

### `test/e2e/input.test.ts` (commit 1, red; commit 2, green)

One stand-in: `recorder()` returns `{ sent, send }`, where `send` is `((method: string, params?: Record<string, unknown>): Promise<unknown> => { sent.push([method, params]); return Promise.resolve({}); }) as unknown as SuiteContext["send"]`, the form of `test/e2e/nav.test.ts`. Each test asserts `assert.deepEqual(r.sent, [...])` (strict, from `node:assert/strict`, so a field present as `undefined` reds too) on `["Input.dispatchKeyEvent", params]` pairs:

- **T1** `sendKey presses a key as one keyDown then one keyUp, each carrying the key, its code and its virtual key code and nothing else`: `sendKey(send, "Escape", "Escape", 27)`; expects `{ type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }` then the same with `type: "keyUp"`.
- **T2** `sendKey puts text and unmodifiedText on the keyDown alone, the character that lets Enter press a focused button`: `sendKey(send, "Enter", "Enter", 13, { text: "\r", unmodifiedText: "\r" })`; expects the down with `text: "\r", unmodifiedText: "\r"` and the up with `type: "keyUp", key, code, windowsVirtualKeyCode` only.
- **T3** `sendKey sends a text with no unmodifiedText when its caller gives none`: `sendKey(send, "Enter", "Enter", 13, { text: "\r" })`; expects the down with `text: "\r"` and no `unmodifiedText`, the up plain.
- **T4** `sendKey carries nativeVirtualKeyCode and modifiers on both events, a modifiers of 0 included`: `sendKey(send, "Tab", "Tab", 9, { nativeVirtualKeyCode: 9, modifiers: 0 })` then `sendKey(send, "Tab", "Tab", 9, { modifiers: 8 })`; expects four events, the first two each with `nativeVirtualKeyCode: 9, modifiers: 0`, the last two each with `modifiers: 8` and no native code.
- **T5** `sendKey's down option makes the press's first event a rawKeyDown and leaves its release a keyUp`: `sendKey(send, "PageDown", "PageDown", 34, { down: "rawKeyDown", nativeVirtualKeyCode: 34 })`; expects `type: "rawKeyDown"` then `type: "keyUp"`, both with `nativeVirtualKeyCode: 34`.
- **T6** `keyDown and keyUp each send the one event they name, for a key held across reads and released on its own`: `keyDown(send, "l", "KeyL", 76, { text: "l" })`, `keyUp(send, "l", "KeyL", 76)`, `keyUp(send, "\u00ac", "KeyL", 76, { modifiers: 1 })`; expects exactly those three events (`text: "l"` on the first alone, `modifiers: 1` on the third alone).

**Stub** (commit 1, `e2e/support/input.ts` with the final header, types and `KEY_EVENT`, no `keyFields`): `keyDown` sends `{ type: "keyDown", key, code, windowsVirtualKeyCode: vk }` and ignores its options (`void options;`); `keyUp` sends the same object, `type: "keyDown"` included, ignoring its options likewise; `sendKey` awaits `keyDown` alone. Each of T1 to T6 then reds on its `deepEqual` (T1 on the missing up, T2 and T3 on the missing text, T4 on the missing fields, T5 on the type, T6 on the text and the up's type), and `npm run check` passes.

**Mutations, each by line in `e2e/support/input.ts`**, and the tests each reds (owed to the prover):

| id | mutation | reds |
|---|---|---|
| K1 | delete `await keyUp(...)` in `sendKey` | T1 to T5 |
| K2 | swap the two lines of `sendKey` | T1 to T5 |
| K3 | `keyUp`'s `type: "keyUp"` becomes `type: "keyDown"` | T1 to T6 |
| K4 | `keyUp`'s params become `{ ...options, type: "keyUp", ...keyFields(key, code, vk, options) }` (options leak onto the up) | T2, T3, T5 |
| K5 | delete the `text` spread line in `keyDown` | T2, T3, T6 |
| K6 | delete the `unmodifiedText` spread line in `keyDown` | T2 |
| K7 | the destructuring becomes `const { down = "keyDown", text, unmodifiedText = text } = options;` | T3, T6 |
| K8 | `type: down` becomes `type: "keyDown"` | T5 |
| K9 | delete the `nativeVirtualKeyCode` spread line in `keyFields` | T4, T5 |
| K10 | the `modifiers` spread line becomes `...(modifiers ? { modifiers } : {}),` | T4 |
| K11 | in `keyUp`, `keyFields(key, code, vk, options)` becomes `keyFields(key, code, vk, {})` | T4, T5, T6 |
| K12 | in `sendKey`, `keyUp(send, key, code, vk, options)` becomes `keyUp(send, key, code, vk)` | T4, T5 |

### `test/repo/e2e-cdp-helpers.test.ts` (commit 5, red; commit 6, green)

On the form of `test/repo/e2e-scripts-off.test.ts`, the same imports (`lintTsRoots`, `WITNESSES`, `eslint`, `ruleLines`) plus `CDP_HOMES` from `../../scripts/lint/e2e-cdp-helpers.ts`, `RULE = "vellum/e2e-cdp-through-helper"`, `HOME = "e2e/support/input.ts"`, `REFUSE = true`, `PASS = false`, and this plant (13 lines; the refused lines are 2 to 6):

```ts
const PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  ['export const a = (ctx: SuiteContext) => ctx.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab" });', REFUSE],
  ['export const b = ({ send }: SuiteContext) => send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab" });', REFUSE],
  ['export const c = (ctx: SuiteContext) => ctx.send(`Input.dispatchKeyEvent`, { type: "rawKeyDown", key: "Tab" });', REFUSE],
  ['export const d = (ctx: SuiteContext) => ctx["send"]("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter" });', REFUSE],
  ['const METHOD = "Input.dispatchKeyEvent"; export const e = (ctx: SuiteContext) => ctx.send(METHOD);', REFUSE],
  ["// Input.dispatchKeyEvent, named in a comment, which presses nothing", PASS],
  ['export const f = "a key press goes through Input.dispatchKeyEvent\'s one home";', PASS],
  ['export const g = (ctx: SuiteContext) => ctx.send("Input.insertText", { text: "x" });', PASS],
  ['const s = "x"; export const h = (ctx: SuiteContext) => ctx.send(`Input.dispatchKeyEvent${s}`);', PASS],
  ['export const i = (ctx: SuiteContext) => ctx.send("Input." + "dispatchKeyEvent", { type: "keyDown" });', PASS],
  ['import { KEY } from "../../test-support/cdp-methods.ts"; export const j = (ctx: SuiteContext) => ctx.send(KEY);', PASS],
  ['export const k = ["constructor", "toString", "hasOwnProperty"];', PASS],
];
```

`BLIND_SPOT` = `"BLIND SPOTS, declared, each erring toward passing: a method name assembled from pieces or from a template holding an expression, and a name held in a binding the file never spells, such as a constant imported from a file the rule does not read (plant lines 10 to 12), since no syntax read of one file resolves either; and a press written by hand on top of sendKey, keyDown or keyUp, since the rule reads spellings and not what a function does. Input.insertText sends text and no key event, and is no row (plant line 9)"`.

- **T7** `no e2e file sends a key event but through its one home, e2e/support/input.ts (Issue #1016)`: asserts `REFUSED.length > 0 && REFUSED.length < PLANT.length`; `deepEqual(await reported("e2e/suites/document-rooms.ts"), REFUSED, BLIND_SPOT)`; `deepEqual(await reported("e2e/support/home.ts"), REFUSED, "a support module that is not the home, sendKey's own until Issue #1016")`; `deepEqual(await reported(HOME), [], "the home itself is refused the method it exists to hold")`.
- **T8** `the rule resolves at error on every e2e file at any depth and on no other root or sheet`: the second test of `test/repo/e2e-scripts-off.test.ts`, word for word, with its `RULE`.
- **T9** `each row's home is a file in the tree, and its method is refused in a suite and passes at its home`: the body is
  ```ts
  assert.ok(CDP_HOMES.size > 0, "the rule has no row");
  for (const [spelling, home] of CDP_HOMES) {
    assert.ok(existsSync(join(ROOT, home)), `${spelling}'s home ${home} is not in the tree`);
    const lines = [`export const a = "${spelling}";`, "export const b = `" + spelling + "`;"];
    assert.deepEqual(await ruleLines(lines, "e2e/suites/cards.ts", RULE), [1, 2], `${spelling} passes in a suite`);
    assert.deepEqual(await ruleLines(lines, home, RULE), [], `${spelling} is refused at its own home`);
  }
  ```
  The second planted line is a template literal holding the method and no expression. Rows pull requests 3 and 4 add are held here with no new fixture.

**Stub** (commit 5): `scripts/lint/e2e-cdp-helpers.ts` importing only `type { Rule } from "eslint"`, with `CDP_HOMES` as final, the rule's `meta` as final and `create() { return {}; }`, wired as file 28 says. T7 reds on its first `deepEqual` (`[]` against `[2, 3, 4, 5, 6]`), T9 on `[]` against `[1, 2]`; T8 passes at the stub, since the stub is wired, and L8 below is its red.

**Mutations, each by line in `scripts/lint/e2e-cdp-helpers.ts` unless named** (owed to the prover), each measured on the planned rule and plant by `out/1016-pr2-dry-run/rule-check.ts` (below), L8 excepted:

| id | mutation | reds |
|---|---|---|
| L1 | delete the `Literal` visitor | T7, T9 |
| L2 | delete the `TemplateLiteral` visitor | T7, T9 |
| L3 | `if (node.expressions.length === 0) refuse(...)` becomes `refuse(...)` | T7 (plant line 10 refused) |
| L4 | `home !== file` becomes `!file.startsWith("e2e/support/")` | T7 (at `e2e/support/home.ts`) |
| L5 | `home !== undefined && home !== file` becomes `home !== undefined` | T7 (at the home), T9 |
| L6 | `new Map([[...]])` becomes `new Map()` | T7, T9 |
| L7 | `CDP_HOMES.get(spelling)` becomes `Object.fromEntries(CDP_HOMES)[spelling]` (an object index) | T7 (plant line 13) |
| L8 | in `eslint.config.ts`, delete the line `"vellum/e2e-cdp-through-helper": "error",` | T7, T8, T9 |

**A witness on the real tree, run once by the implementer** (no proof owed): with every commit made, replace `tabToZoomIn`'s `sendKey` call in `e2e/suites/landfall/controls.ts` with the two raw sends it replaced (lines 150-151 at 0f8bf7d2, `git show 0f8bf7d2:e2e/suites/landfall/controls.ts`), run `npm run lint`, paste the two `vellum/e2e-cdp-through-helper` lines it reports into the PR body (an unused-import report beside them is expected and not pasted), and restore with `git checkout -- e2e/suites/landfall/controls.ts`.

The prover owes T1 to T9 with K1 to K12 and L1 to L8 (`vellum-guard-prover`, one round, unit tests only: `npm test -- test/e2e/input.test.ts` and `npm test -- test/repo/e2e-cdp-helpers.test.ts`). None is left to step 15.

### No browser check is added or made longer

So no browser-check reading is owed and no step's holdings are counted. Each of the 40 sends is the fixture of checks that already run, and the claim this pull request makes about them, that they send the same messages in the same order, is measured instead:

**Probe** `out/1016-pr2-dry-run/keys-probe.ts`, run as `node out/1016-pr2-dry-run/keys-probe.ts` in this planner's tree at 0f8bf7d2 (no build: it drives the harness through `start` in `e2e/harness.ts` onto a `data:` page holding a text field `#i`, a button `#b` and a focusable scroller `#d`), log `out/1016-pr2-dry-run/keys-probe.log`, Brave on the Mac. It copies every key press form the suites send at 0f8bf7d2 verbatim (29 forms: every site in group B, the wrappers' bodies, and the plain pair `sendKey` and `pressKey` send for their callers) and sends each again through the planned helper, inlined exactly as `e2e/support/input.ts` is written above.

- **Part A, the params (no browser)**: `A summary: 29 of 29 forms send the same params in the same order`. Three forms reach the wire with their fields in another order (`cards/cap.ts` PageDown, `cards/hold.ts`'s Enter and Tab, `chart-drawer/gestures.ts`'s Enter), the other 26 identical byte for byte.
- **Part B, what the page sees** (each form's log of `keydown`, `keypress`, `keyup`, `beforeinput`, `input`, `click` and `focusin`, with key, code, keyCode, charCode, Shift, Alt, input type and target, then the focused element, the field's value and whether `#d` or the page scrolled): `B summary: 29 of 29 forms leave the page seeing the same events and state`, so the field order does not reach the page.
- **Control, the same run**: four mutation arms each compared with their form's reading, `C summary: 4 of 4 mutation arms leave the page seeing something else`: text dropped from `midTurn`'s Enter (no `keypress`, no `click`), modifiers dropped from `key(send, 8)` (focus goes forward to `#d`, not back to `#i`), up sent before down, text dropped from `pressNav`'s Space (`#d` does not scroll).
- **What the probe does not hold**: it sends the plan's call forms through the helper, never the edited site text, so a site typed differently from this plan passes it. The edited sites are held by the twelve local suites, the pull request's CI lanes and review; the PR body says so beside the probe's lines.
- **Readings, not controls**: the page on the Mac cannot tell Tab as `keyDown` from Tab as `rawKeyDown`, PageDown with its native code from PageDown without, or `modifiers: 0` from no `modifiers` (`R page cannot tell`, three lines). They are kept all the same (Calls made, 3). `Input.insertText "x"` in the field fires `beforeinput` and `input` and no key event at all (the last `R` line).

**Rule check** `out/1016-pr2-dry-run/rule-check.ts`, run as `node out/1016-pr2-dry-run/rule-check.ts` in this planner's tree, log `out/1016-pr2-dry-run/rule-check.log`: the planned rule, inlined, under ESLint's `Linter` with the typescript-eslint parser, over the planned plant at the three paths T7 lints it at. `real: PASSES the plant` with `[2,3,4,5,6]` at `e2e/suites/document-rooms.ts` and `e2e/support/home.ts` and `[]` at `e2e/support/input.ts`; each of L1 to L7 `BITES` (L3 adds line 10, L7 adds line 13 three times, L4 empties `home.ts`, L5 fills `input.ts`, L6 empties all three). It runs without the house config and its type information, which T7 adds; `test/repo/e2e-scripts-off.test.ts` already lints plants of this form through the house config.

## Order of commits

1. `#1016 The plan, and failing tests for the shared key press (pull request 2 of 4)`: `handbook/plans/1000/1016/1016-pr2-plan.md` (this file, as ruled), `e2e/support/input.ts` with the stub, `test/e2e/input.test.ts`. `npm test -- test/e2e/input.test.ts` reds T1 to T6, each on its `deepEqual`. Push.
2. `#1016 The shared key press sends each field its caller gives, on the event it belongs to`: `input.ts` as above; T1 to T6 green.
3. `#1016 sendKey moves to e2e/support/input.ts`: group A (files 1 to 10). `npm run check` and `npm test` green.
4. `#1016 Every raw key event in the suites goes through the shared press`: group B (files 11 to 27). `git grep -n -F "Input.dispatchKeyEvent" -- e2e` prints one line; `npm run check`, `npm run lint` green.
5. `#1016 A failing test: no e2e file sends a key event but through e2e/support/input.ts`: the rule's stub, file 28, `test/repo/e2e-cdp-helpers.test.ts`. T7 and T9 red on their `deepEqual`; T8 green.
6. `#1016 The lint refuses a key event sent anywhere but its one home`: the rule as above. T7 to T9 green; `npm run lint` green over the whole tree.
7. `#1016 The Enter bullet names the shared press's text option`: file 29.

Then `npm run format` (run again until `npm run format:check` passes), the evidence below, `vellum-guard-prover` at the pushed head, the step 12 comment, the pull request, `vellum-pr-skeptic` cold.

## Rosters and doctrine

- **Lint wiring** (Gate 4): file 28 joins the rule in the three places the house wires one (`eslint.config.ts`'s import list, the `vellum` plugin object, the e2e block); `test/repo/lint-wiring.test.ts` holds the config's shape and needs no edit. No other list names lint rules: `git grep -n "e2e-scripts-off-through-helper" -- test test-support scripts handbook/specs .claude CLAUDE.md eslint.config.ts` prints only `eslint.config.ts`, the rule's own file and its test, and no test lists or walks the folder's modules (`git grep -n "scripts/lint" -- test test-support` prints imports of named modules and the fixtures of `test/repo/e2e-port-proof.test.ts` and `test/repo/package-imports.test.ts`, neither a roster of rules).
- **Doctrine**: file 29. `git grep -n "sendKey\|navKeys\|OPTION_UP\|dispatchKeyEvent" -- . ':!handbook/plans' ':!e2e' ':!test/e2e'` prints only the two lines of the Enter bullet at 0f8bf7d2, so no other spec, gate, agent line or hook names what moves. The bullet's first sentence (a `keyDown` for Enter with no `text` fires no activation) stays as the environment fact it is; the seven Enter presses without `text` are pull request 1's Call 10.
- **Unit-test fakes do not change**: `test/e2e/home-waits.test.ts`, `test/e2e/landfall-touch-waits.test.ts`, `test/e2e/landfall-wheel-waits.test.ts` and `test/e2e/room-kit-waits.test.ts` read the `send` they hand in for `Input.dispatchKeyEvent` with `type: "keyDown"` and a `key`, which the shared press still sends through that same `send`. `SOURCE_READS` (`test-support/source-read-list.ts`) needs no entry: the new tests import modules and lint planted text, as `test/repo/e2e-scripts-off.test.ts` does.
- **No other roster**: no suite, lane, `MEASURED_SECONDS`, `E2E_SKIPS` or step changes; `e2e/support/input.ts` joins no list (pull request 1 checked `git grep` for a list of `e2e/support/` files over `test/`, `test-support/`, `scripts/` and `eslint.config.ts` and found none).
- **Closing references**: this pull request closes nothing. In the place `.github/PULL_REQUEST_TEMPLATE.md` gives the closing line, the body carries exactly
  ```
  Issue: #1016, stays open because this is pull request 2 of 4 and the last of the four carries its closing line
  ```
  and nowhere in the body, the title or a commit message does `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves` or `resolved` stand directly before `#1016`, `#1209` or `#1211`; prose writes "Issue #1016". `gh pr view <N> --json closingIssuesReferences` prints `[]`, read after the body is written and again after any rewrite of it (`vellum-footguns` Gate 5 item 5).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `git grep -n -F "Input.dispatchKeyEvent" -- e2e` prints one line, `e2e/support/input.ts`'s `KEY_EVENT` (40 lines in 18 files at 0f8bf7d2).
- `git grep -n -w "navKeys\|OPTION_UP" -- e2e handbook/specs` prints nothing; `git grep -n -w sendKey -- e2e/support/home.ts` prints the import and `pressKey`'s line alone.
- **The probe against the real helper**: copy `/Users/ahl/CodeProjects/Vellum/out/1016-pr2-dry-run/keys-probe.ts` (the dispatcher copies this planner's `out/` there when it retires the tree) to the tree's `out/1016-pr2-dry-run/`, then after commit 4, with `ps aux | grep '[r]emote-debugging-port'` printing nothing, run `node out/1016-pr2-dry-run/keys-probe.ts --real` once to its end. Paste its `helper:` line and its three summary lines into the PR body; the helper line must read `imported from e2e/support/input.ts` and the summaries 29 of 29, 29 of 29 and 4 of 4.
- `npm run build` once (nothing the site is built from changes, so one build serves every run). Then on the Mac, one at a time, each to its end, checking `ps aux | grep '[r]emote-debugging-port'` and `ls -d /var/folders/*/*/T/vellum-e2e-* | wc -l` before each (Gate 2 item 11; 17 profiles from older runs were on disk on 2026-11-03, so compare before and after rather than against zero), the twelve suites whose own files change a call (CI seconds from `MEASURED_SECONDS`, about 22 minutes in all):
  - `VELLUM_E2E_SUITES=cards npm run test:e2e` (adds `render`; 75 s plus 40 s)
  - `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e` (211 s)
  - `VELLUM_E2E_SUITES=cluster npm run test:e2e` (63 s)
  - `VELLUM_E2E_SUITES=corners npm run test:e2e` (156 s)
  - `VELLUM_E2E_SUITES=landfall npm run test:e2e` (62 s)
  - `VELLUM_E2E_SUITES=slide-away npm run test:e2e` (98 s)
  - `VELLUM_E2E_SUITES=stage npm run test:e2e` (329 s)
  - `VELLUM_E2E_SUITES=zoom npm run test:e2e` (224 s)
  - `VELLUM_E2E_SUITES=broadside npm run test:e2e` (13 s)
  - `VELLUM_E2E_SUITES=prospect npm run test:e2e` (35 s)
  - `VELLUM_E2E_SUITES=ribbon npm run test:e2e` (15 s)
  - `VELLUM_E2E_SUITES=runninghead npm run test:e2e` (27 s)
  
  Not run on the Mac, said so in the body: `glass-ceremony`, `print-room`, `reading-room`, `room-instrument`, `writing-room` and `home`, whose files change only the path `sendKey` is imported from (or, for `home`, the module `pressKey` takes it from); `npm run check` holds the import and T1 holds the pair they send, and the pull request's own CI runs them on GitHub's machines, since its four lanes run every suite. The CI proof runner is not needed for any suite.
  
  A red on the branch: check out commit 2 (the shared press built, no site moved, all work committed), run the same selection once, and return to the branch head. A red there too is not this change: record it in the PR body with both lines, and give a local red its row in `.claude/skills/vellum-footguns/references/flake-record.md` as Gate 2 item 10 says. A red on the branch alone is a stop condition. A `P24` red in `cards` carrying `"kAfterWheelOverCard":1` is Issue #1211's flake (P24 is in `p24NothingToScroll`, which this pull request does not edit; this pull request edits P27's PageDown in the same file): take it through the same comparison and record it, and do not touch P24.
- CI: all four lanes and the three `check & test` shards green on the pull request. No step's seconds are read: no step is added or made longer.
- `vellum-guard-prover`: T1 to T9, mutations K1 to K12 and L1 to L8, run locally (unit tests only). If the dispatcher prefers the CI proof runner, the rows are K1 to K12 with the unit selection `test/e2e/input.test.ts` and L1 to L8 with `test/repo/e2e-cdp-helpers.test.ts`, each naming the tests the tables above give.
- `vellum-plate-reader`: not owed (no appearance).
- `gh pr view <N> --json closingIssuesReferences` prints `[]`.

## Calls made

The implementer copies these into its step 12 comment.

1. **The shared press is `sendKey`, moved to `e2e/support/input.ts`, its four arguments unchanged and a fifth, optional, taking CDP's own field names; `keyDown` and `keyUp` beside it.** Rule: the least churn the recon measured (17 `sendKey` calls and 15 `pressKey` calls unchanged; 9 import lines change), and the names a new helper would take collide with existing ones. Put on the menu because the house default puts a new name in the tree to Alex, and answered with this option by the dispatcher under his standing clearance (https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6600173679, not an Alex ruling); the step 12 comment points at that post rather than restating it.
2. **The down alone carries the type and the text; both events carry the native code and the modifiers, a `0` included; `unmodifiedText` is sent only when given.** Rule: a refactor keeps every field each site sends (pull request 1's Call 10); every one of the 40 sends splits the fields this way (probe part A, 29 of 29).
3. **Fields the Mac's page cannot tell apart are kept** (`rawKeyDown` on Tab and PageDown, the native codes, `modifiers: 0`). Rule: the same; the Mac's browser does not stand for CI's Google Chrome.
4. **Every wrapper keeps its name and signature** (`pressKey`, `pressNav`, the three `key`s, `tab`); **`navKeys` and `OPTION_UP` go**, the first because `sendKey` now does its one job, the second becoming `optionUp(k)`. Rule: pull request 1's Call 3; a wrapper that adds nothing is removed.
5. **The inline pairs collapse to one `sendKey` call each** (13 sites in group B). Rule: the issue's change, one key helper.
6. **The seven Enter presses sent without `text` are not edited.** Rule: pull request 1's Call 10.
7. **`Input.insertText` (five sites) stays as it is, outside `input.ts` and the guard.** Rule: ruling 1 names four kinds of browser message, and `insertText` is none of them: it types text and fires no key event (probe, the last `R` line: `beforeinput` and `input` only); each site sends it once, so there is no copy to fold.
8. **The guard is one rule module with rows, `vellum/e2e-cdp-through-helper` in `scripts/lint/e2e-cdp-helpers.ts`, its rows a `Map` exported as `CDP_HOMES`.** Rule: the sketch in pull request 1's plan; a `Map` because an object index answers `"constructor"` (mutation L7, measured).
9. **`vellum/e2e-scripts-off-through-helper` stays its own rule.** Rule: folding it renames a guard and rewrites its test in a pull request about keys, with no copy found.
10. **T9 iterates `CDP_HOMES`**, so the rows pull requests 3 and 4 add are each held by a fixture with no new test. Rule: Gate 1 item 16 (a roster a guard checks is exported data it imports).
11. **No `keypress` question remains open**: `git grep -n keypress -- src` prints nothing, so no page listens for it; the `keypress` a char-producing `keyDown` fires matters only through the browser's own default actions (Enter presses a button, Space scrolls, a character types), and the probe shows each preserved.
12. **The local suites are the twelve whose own files change a call**; the six whose files change only an import are held by `npm run check`, T1 and the pull request's CI. Rule: `.claude/agents/vellum-implementer.md` (never the full local lanes); one run per suite where a call was rewritten, since that is where a transcription slip could hide.
13. **The Enter bullet names the `text` option's home and cites `pressNav` for `navKeys`.** Rule: a citation of a deleted symbol goes stale silently (`handbook/specs/conventions.md`, How code is cited: only the path half of a prose citation is checked).
14. **One header line in `e2e/support/input.ts`, no other comment.** Rule: `handbook/specs/conventions.md`, comments are the exception; T1 to T6 pin the behaviour, as `e2e/support/explorer.ts` carries one line beside T1 to T6 of pull request 1.

## Open decisions

None. The one item the menu carried, the names, was answered on 2026-11-03 by the dispatcher under Alex's standing clearance, labelled as not an Alex ruling (https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6600173679): option A, `sendKey` kept, extended and moved to `e2e/support/input.ts`, with `keyDown` and `keyUp` beside it and the check `vellum/e2e-cdp-through-helper` in `scripts/lint/e2e-cdp-helpers.ts`. Options B (a new `pressKey`, colliding with the stage kit's member and its 15 calls) and C (a new `key`, colliding with three functions and three local values) were not taken. The plan was written to option A, so no section changed shape.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat 0f8bf7d2 origin/main -- e2e/support/home.ts e2e/suites/broadside.ts e2e/suites/broadside/dress.ts e2e/suites/broadside/shape.ts e2e/suites/cards/cap.ts e2e/suites/cards/hold.ts e2e/suites/chart-drawer/gestures.ts e2e/suites/chart-drawer/kit.ts e2e/suites/cluster/chart.ts e2e/suites/corners/floor.ts e2e/suites/glass-ceremony/gestures.ts e2e/suites/landfall/controls.ts e2e/suites/landfall/kit.ts e2e/suites/print-room/link.ts e2e/suites/prospect/gestures.ts e2e/suites/reading-room/gestures.ts e2e/suites/ribbon/gestures.ts e2e/suites/room-instrument/pace.ts e2e/suites/runninghead/gestures.ts e2e/suites/runninghead/kit.ts e2e/suites/runninghead/shell.ts e2e/suites/slide-away/holds.ts e2e/suites/stage/slide-holds.ts e2e/suites/stage/zoomed.ts e2e/suites/writing-room/carry.ts e2e/suites/zoom/camera.ts e2e/suites/zoom/loupe.ts eslint.config.ts test/e2e/home-waits.test.ts test/e2e/landfall-touch-waits.test.ts test/e2e/landfall-wheel-waits.test.ts test/e2e/room-kit-waits.test.ts test/repo/e2e-scripts-off.test.ts` prints anything but `eslint.config.ts` (a moved `eslint.config.ts` is merged and wired as file 28 says, at the same three places).
- `git grep -n "Input.dispatchKeyEvent" -- e2e` at the branch's base prints other than the 40 lines this plan replaces, or a cited line is not what the plan quotes (a site's fields, a wrapper's signature, a caller's arguments).
- `e2e/support/input.ts`, `scripts/lint/e2e-cdp-helpers.ts`, `test/e2e/input.test.ts` or `test/repo/e2e-cdp-helpers.test.ts` already exists, or `handbook/plans/1000/1016/1016-pr2-plan.md` is already on main.
- Any test file other than the two new ones needs an edit, or `npm run check` reds anywhere after commit 3 or 4.
- A stub reds on something other than its test's assertion, or a mutation K1 to K12 or L1 to L8 leaves every test in its row green.
- `npm run lint` at commit 6 reports `vellum/e2e-cdp-through-helper` anywhere.
- The probe run with `--real` prints a `DIFF` line in part A or B, or a `SAME (control is blind)` line in part C; or `/Users/ahl/CodeProjects/Vellum/out/1016-pr2-dry-run/keys-probe.ts` is not there to copy.
- A local suite reds on the branch and not at commit 2.
- A CI red in a suite this pull request touched: the procedure in `.claude/agents/vellum-implementer.md`, "When to hand back".
- `gh pr view <N> --json closingIssuesReferences` prints anything but `[]` after the body is fixed to the line under "Rosters and doctrine".
