# The flake record

**One row per FAILURE, not per check.** A check that has flaked three times gets three rows, because
the thing worth knowing is never "this is flaky", it is how often, on what shas, with what payload,
and whether anyone did anything about it.

This file exists because #578 found CD7b had failed on `main` twice in forty runs with nobody
recording either, and that reconstructing even that much cost a forty-run archaeology dig through CI
history plus three closed issues. A third occurrence, older than both and the only one actually
re-run away, was sitting in a comment on #546 that nothing pointed at. `vellum-footguns` Gate 2
item 10 says a red is yours until proven a flake and must never be silently re-run away; this is
where the proof goes.

## How to use it

- **A red you believe is a flake gets a row before you re-run anything.** The payload verbatim, the
  run id, the sha and branch. A row costs a minute; the dig costs a session.
- **A row's disposition is one of three**: *settled* (the wait or the bound was fixed, and the check
  asserts again, with the PR that did it), *measuring-only* (the check still takes and logs its
  measurement but has stopped asserting, under an issue number, per Gate 2 item 10), or *open* (seen,
  recorded, nobody has acted).
- **A cell that cannot be read back is written "not retained"**, never inferred. GitHub ages out run
  logs, and a guess here is worse than a gap.
- **This is a record, not a rule.** It is not required reading before a kind of work; it is what you
  consult the moment a check goes red and you are tempted to press re-run.

## The record

| date | check | run | sha / branch | payload | disposition |
|---|---|---|---|---|---|
| 2026-07-28 | HG2 (HG3 collateral) | 30316158705 | the #303 merge, main | `{"dots":0,"inSvg":false,"solved":true,"status":"Found it in 1 guess."}` | settled, #304: a test-design bug in HG2's corner-pick math, fired by the 20260728 world's geometry |
| 2026-08-16 | BR8 | not retained | not retained, #409 | `AbortError: Transition was skipped` counted as a console error | settled, #409: a cross-document view transition's expected cancellation |
| 2026-09-07 | SV2c | not recorded in #529 | #528's CI attempts | `{"firstInkMs":3097,"reInkMs":810}` against an 800ms cap | settled, #529 and PR #533: an absolute wall-clock cap where the ratio clause was the real claim |
| 2026-09-07 | CL4 | not recorded in #529 | #528's CI attempts | `transform "matrix(1, 0, 0, 1, -0.762884, 0)"`, `seedOpacity "0.00754649"` | settled, #529 and PR #533: exact equality on values still animating, 0.76px from home |
| 2026-09-08 | RS30 | 34238487802 | `4a2f512`, main | the pace-1 leg took 6 samples against `minSamples: 8`; `ratio 4.03`, `jump 25` of 26.4 allowed | open. Named flaky in #529 and flaked again after that issue closed |
| 2026-09-09 | CD7b | 34305242149, attempt 1 | `ba73669`, `521-portfolio` | `{"cuttings":6,"offs":6,"reachable":0,"open":true}` | settled, #578 and PR #581. Re-run green at the time; recorded in a comment on #546 that nothing pointed at |
| 2026-09-09 | CD7b | 34411380228 | `49a9527`, main | identical | settled, #578 and PR #581. Never re-run; the next main run was green with the drawer untouched |
| 2026-09-10 | SV2r | 34526874952 | `dd2d01e`, main | `{"dashSteps":11,"dashSeen":11,"gap":250,"frames":75}` | open, no issue |
| 2026-09-12 | CD7b | 34678766918 | `ab5b064`, main | identical | settled, #578 and PR #581. Never re-run |
| 2026-09-14 | RS30 | 34795676910 | `3879d43`, `chore/586-engine-invariants` | the pace-4 leg took 6 samples against `minSamples: 8`; both legs fit their rate to 0.6 and -0.1 percent, `ratio 3.97`, `jump 15` of 16.6 allowed, `backward 0`, `parked false` | open. Second recorded RS30, same sample-count shape as 2026-09-08 on the other leg. First on a diff that cannot cause it: PR #593 changes two markdown files. Not re-run; the next run on that branch (`fc5ba36`, two more markdown edits) was green. Payload and what to capture next are in a comment on that PR |
| 2026-09-14 | RS30 | 34878128879 | `4d485a6`, `chore/597-pr-template-closing-reference` | `{"legs":[{"pace":1,"n":9,"rate":0.0372,"expected":0.0366,"devPct":1.8},{"pace":4,"n":7,"rate":0.1456,"expected":0.1463,"devPct":-0.5}],"ratio":3.91,"backward":0,"jump":20,"jumpAllowed":21.5,"parked":false,"range":{"min":139,"max":395},"tolerancePct":12,"minSamples":8}`, label `Pause` | open. Third recorded RS30, same sample-count shape as both prior rows; on PR #615, a diff of a template, a spec and a unit test that no suite reads. Not re-run by hand; the push adding this row is the next run |
| 2026-09-14 | lane A launch | 34823116661 | `aff6082`, `chore/588-site-architecture` | `no devtools page target (browser exited code=null signal=SIGKILL)` after three launch attempts, 20.7s in, no check run; summary `LANE A FAILED (303/303 checks; A HARNESS ERROR (exit 2) 20.7s, B ok 565.5s)` | open, no issue. The first `HARNESS ERROR` row here, and the first row that is not a check at all: both lanes lost their browser to SIGKILL in the same second as they launched together, lane B recovered on its third attempt and passed 303/303 on that sha, and the diff is two markdown files, which no suite reads. Recorded before the branch was pushed again, which is the only re-run it got |

## What the CD7b rows turned out to be

Worth keeping because it is the shape a "flaky" hit test takes, and because the first two guesses
were both wrong. The drawer is `position: fixed; bottom: 0` with `animation: chart-drawer-up 0.32s
... both` from `translateY(100%)`. The press adds the `open` class, and until the runner commits
that style change the six remove buttons sit below the viewport, where `elementFromPoint` returns
null rather than the element. So the drawer reports open and all six controls report unreachable, in
the same read. Measured 2026-09-13: the window is 59ms at 1x CPU throttle and 1094 to 1514ms at 60x,
because its length is main-thread bound and not animation bound. The check's fixed 700ms sleep was a
bet on the runner.

Neither of the readings the record carried before that was right. #546's comment reasoned it was
"the Broadside not yet settled above the drawer band" and asked that the next occurrence capture the
Broadside's rect; nothing was painted over the buttons, they were off screen. #578's body offered
"or with something painted over all of them" as an alternative to the timing; it was the timing.
