// The Primer check walks a ladder (Issue #1250): each step opened at its own address on a bare device, its first acts done, every control it names read where it stands, its address read for every key, and, where it writes a then, the step done and the outcome read.
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";
import type { Ladder, Step, Words } from "../../src/site/shared/primer/shape.ts";
import type { SuiteContext } from "../types.ts";
import { dropExpectedCancellations } from "./console.ts";
import { bounce } from "./nav.ts";
import { perform } from "./primer-acts.ts";
import {
  expectFor,
  fits,
  heldBy,
  keysLost,
  onItsArm,
  pressPoint,
  routeOf,
  stateOf,
  wordsHold,
  wordsOf,
  type Arm,
  type Expect,
  type Facts,
  type Reach,
} from "./primer-judge.ts";
import { ARM, BARE, FACTS, HASH, HIT } from "./primer-reads.ts";
import { PRIMER_ROOMS, type PrimerRoom, type Rest } from "./primer-rooms.ts";
import { withReducedMotion } from "./reduced-motion.ts";
import { scopedHealth } from "./room.ts";
import { makeSettle, makeStable } from "./settle.ts";
import { makeStep } from "./step.ts";

// 2026-11-09, Issue #1250: 300 polls of 50 ms, 15 s, the budget `REDRAFT_TRIES` in `e2e/suites/zoom/kit.ts` gives the slowest redraft a suite waits on, since a step's rest and its waits can stand behind one; the boot takes the same, as `waitReady` in `e2e/harness.ts` gives 200 of 75 ms.
const TRIES = 300;
const DESK = { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false } as const;
const TABLET = { width: 1024, height: 768 } as const;
const NAMES = "names every control as it stands, worded as quoted and reachable, held or hidden as the step says";
const KEPT = "keeps every key of its address";
const SHOWS = "shows what it says once the step is done";
const ARM_NAME: Readonly<Record<Arm, string>> = { desk: "", tablet: " on a tablet", motion: " with motion on" };

export type Read = {
  readonly css: string;
  readonly says: string;
  readonly got: string | null;
  readonly state: Reach;
  readonly expect: Expect;
  readonly ok: boolean;
};

export function primerKit(ctx: SuiteContext, route: string) {
  const settle = makeSettle(ctx);
  const booting = makeSettle({ ...ctx, tolerant: true });
  const stable = makeStable(settle);
  const room = (): PrimerRoom => {
    const r = PRIMER_ROOMS[route];
    if (r === undefined) throw new Error(`no PRIMER_ROOMS entry opens ${route}`);
    return r;
  };
  const rest = (before: Rest | null, label: string): Promise<Rest> =>
    stable(room().rest, `${label}: the room comes to rest`, {
      departed: (d) => (before === null || d.marks > before.marks) && d.quiet,
      same: (d, last) =>
        d.marks === last.marks && d.view === last.view && d.quiet === last.quiet && d.frames > last.frames,
      tries: TRIES,
    });
  const bare = async (label: string): Promise<void> => {
    const origin = await ctx.evaluate(BARE);
    if (origin !== `http://127.0.0.1:${ctx.PORT}`)
      throw new Error(`${label}: the page before it is ${origin}, so the device could not be cleared`);
  };
  const { consoleErrors } = ctx;
  const arrive = async (address: string, label: string): Promise<string | null> => {
    const base = consoleErrors.length;
    let threw: string | undefined;
    await bounce(ctx.send, `http://127.0.0.1:${ctx.PORT}${address}`);
    await booting(
      room().booted,
      (d) => {
        threw = dropExpectedCancellations(consoleErrors.slice(base)).find((e) => e.startsWith("EXCEPTION"));
        return d.up || threw !== undefined;
      },
      `${label}: the room boots at ${address}`,
      TRIES,
    );
    if (threw !== undefined) return threw;
    await ctx.evaluate(ARM);
    await rest(null, `${label} on arrival`);
    return null;
  };
  const read = async (w: Words): Promise<{ facts: Facts; state: Reach }> => {
    const f = await ctx.evaluate(FACTS(w));
    const p = f.box === null ? null : pressPoint(f.box, f.clip);
    const hit = p === null ? "nothing" : await ctx.evaluate(HIT(w.css, p.x, p.y));
    return { facts: f, state: stateOf(f, hit) };
  };
  const reachOf = async (css: string): Promise<Reach> => (await read({ css, says: "", read: "text" })).state;
  const readAll = async (words: readonly Words[], expect: (w: Words) => Expect): Promise<readonly Read[]> => {
    const reads: Read[] = [];
    for (const w of words) {
      const { facts, state } = await read(w);
      const got = wordsOf(facts, w);
      const e = expect(w);
      reads.push({ css: w.css, says: w.says, got, state, expect: e, ok: wordsHold(got, w) && fits(state, e) });
    }
    return reads;
  };
  return { ...ctx, settle, room, rest, bare, arrive, reachOf, readAll, waitTries: TRIES };
}

export type PrimerKit = ReturnType<typeof primerKit>;

const told = (reads: readonly Read[]): string => {
  const bad = reads.filter((r) => !r.ok);
  if (bad.length === 0) return `all ${reads.length} as quoted`;
  return bad
    .map(
      (r) =>
        `${r.css} read ${JSON.stringify(r.got)}, ${r.state}; the step quotes ${JSON.stringify(r.says)}, ${r.expect}`,
    )
    .join("; ");
};

export async function walkStep(k: PrimerKit, step: Step, arm: Arm): Promise<void> {
  const name = `${step.id}${ARM_NAME[arm]}`;
  await k.bare(name);
  const threw = await k.arrive(step.at, name);
  if (threw !== null) {
    k.check(`${name} ${NAMES}`, false, `the room threw while it opened at ${step.at}: ${threw.slice(0, 300)}`);
    return;
  }
  for (const a of step.first ?? []) await perform(k, a, `${name} first`);
  const named = await k.readAll([...step.words, ...(step.relies ?? [])], (w) => expectFor(w, step, arm, false));
  k.check(
    `${name} ${NAMES}`,
    named.every((r) => r.ok),
    told(named),
  );
  const lost = keysLost(step.at, await k.evaluate(HASH));
  k.check(`${name} ${KEPT}`, lost.length === 0, lost.length === 0 ? step.at : `lost ${lost.join(", ")} of ${step.at}`);
  if (step.then === undefined) return;
  if (!named.every((r) => r.ok) || lost.length > 0 || !onItsArm(step, arm)) {
    console.log(
      `  ${name}: not done, ${onItsArm(step, arm) ? "since what it names is not as it says" : "since it is not this arm's step"}`,
    );
    return;
  }
  for (const a of step.do ?? []) await perform(k, a, `${name} do`);
  const shown = await k.readAll(step.then, (w) => expectFor(w, step, arm, true));
  k.check(
    `${name} ${SHOWS}`,
    shown.every((r) => r.ok),
    told(shown),
  );
}

export async function walkLadder(ctx: SuiteContext, ladder: Ladder, health: string): Promise<void> {
  const step = makeStep(ctx);
  const gate = scopedHealth(ctx);
  const kitOf = (s: Step): PrimerKit => primerKit(ctx, routeOf(s.at));
  const steps = ladder.lessons
    .flatMap((l) => l.steps)
    .filter((s) => {
      const holder = heldBy(s, LADDERS);
      if (holder !== null) console.log(`  ${s.id}: reads exactly what ${holder} reads, so it is walked there`);
      return holder === null;
    });
  const walk = (s: Step, arm: Arm): Promise<void> => step(`${s.id}${ARM_NAME[arm]}`, () => walkStep(kitOf(s), s, arm));
  await ctx.send("Emulation.setDeviceMetricsOverride", DESK);
  await withReducedMotion(ctx, async () => {
    for (const s of steps) await walk(s, "desk");
  });
  for (const s of steps.filter((x) => onItsArm(x, "motion"))) await walk(s, "motion");
  await withReducedMotion(ctx, async () => {
    await ctx.setMobileViewport(TABLET.width, TABLET.height);
    for (const s of steps.filter((x) => onItsArm(x, "tablet"))) await walk(s, "tablet");
    await ctx.clearMobile();
  });
  gate.check(health);
}
