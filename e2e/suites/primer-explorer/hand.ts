// The Primer's pointing hand in the Explorer (Issue #1253): a Try it opened with its step key, the ring and the note it lays, the seal a step earns, and the key that leaves the address with its hash kept.
import { handStepFor, handSteps, stepAddress, type HandStep } from "../../../src/site/shared/primer/hand-steps.ts";
import { LADDERS } from "../../../src/site/shared/primer/ladders.ts";
import type { Box } from "../../../src/site/shared/primer/judge.ts";
import { PRIMER_STORE_KEY } from "../../../src/site/shared/primer/seals.ts";
import { click } from "../../../src/site/shared/primer/shape.ts";
import { perform } from "../../support/primer-acts.ts";
import { keysLost } from "../../support/primer-judge.ts";
import { HASH } from "../../support/primer-reads.ts";
import { primerKit, type PrimerKit } from "../../support/primer-walk.ts";
import { withReducedMotion } from "../../support/reduced-motion.ts";
import { scopedHealth } from "../../support/room.ts";
import { makeStep } from "../../support/step.ts";
import type { Payload, SuiteContext } from "../../types.ts";

const DESK = { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false } as const;

type Ring = {
  readonly present: boolean;
  readonly up: boolean;
  readonly ring: Box | null;
  readonly inside: readonly boolean[];
};
const RING = (css: readonly string[]): Payload<Ring> => `(() => {
  const r = document.querySelector(".primer-ring");
  const b = r && !r.hidden ? r.getBoundingClientRect() : null;
  const inside = ${JSON.stringify(css)}.map((c) => {
    const e = document.querySelector(c);
    if (!e || !b) return false;
    const x = e.getBoundingClientRect();
    return x.left >= b.left - 0.5 && x.top >= b.top - 0.5 && x.right <= b.right + 0.5 && x.bottom <= b.bottom + 0.5;
  });
  return { present: !!r, up: !!b, ring: b ? { x: b.left, y: b.top, w: b.width, h: b.height } : null, inside };
})()`;

type Note = {
  readonly up: boolean;
  readonly title: string | null;
  readonly act: string | null;
  readonly done: string | null;
  readonly next: string | null;
  readonly mark: string | null;
  readonly row: string | null;
};
const NOTE: Payload<Note> = `(() => {
  const s = document.querySelector(".primer-slip");
  const t = (e) => (e ? e.textContent.replace(/\\s+/g, " ").trim() : null);
  const at = (css) => (s ? t(s.querySelector(css)) : null);
  return { up: !!s, title: at(".primer-slip-title"), act: at(".primer-slip-act"), done: at(".primer-slip-done"), next: at(".primer-slip-next"), mark: at(".mark"), row: at(".primer-slip-row") };
})()`;

type Where = { readonly sealed: boolean; readonly search: string; readonly hash: string };
const WHERE = (id: string): Payload<Where> =>
  `(() => ({ sealed: (localStorage.getItem(${JSON.stringify(PRIMER_STORE_KEY)}) || "").split(",").includes(${JSON.stringify(id)}), search: location.search, hash: location.hash }))()`;

const STEP_ROADS: Payload<readonly string[]> =
  `[...document.querySelectorAll("a[href]")].filter((a) => !a.closest(".primer-slip")).map((a) => a.getAttribute("href")).filter((h) => new URL(h, location.href).searchParams.has("step"))`;

const STEPS = handSteps(LADDERS);
const handStep = (id: string): HandStep => {
  const s = handStepFor(STEPS, id, "/explorer/");
  if (s === null) throw new Error(`no step ${id} opens the Explorer`);
  return s;
};

const sameJson = (d: unknown, last: unknown): boolean => JSON.stringify(d) === JSON.stringify(last);

async function open(k: PrimerKit, step: HandStep, label: string): Promise<void> {
  await k.bare(label);
  const threw = await k.arrive(stepAddress(step.id, step.at), label);
  if (threw !== null) throw new Error(`${label}: the room threw while it opened: ${threw.slice(0, 300)}`);
  await k.settle(NOTE, (d) => d.up, `${label}: the note comes`, k.waitTries);
}

async function ringed(k: PrimerKit, css: readonly string[], label: string): Promise<Ring> {
  return k.settle(
    RING(css),
    (d, last) => d.up && last !== null && last.up && sameJson(d.ring, last.ring),
    `${label}: the ring comes to rest`,
    k.waitTries,
  );
}

const done = (k: PrimerKit, label: string): Promise<Note> =>
  k.settle(NOTE, (d) => d.done !== null, `${label}: the note says done`, k.waitTries);

export async function handChecks(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  const gate = scopedHealth(ctx);
  const k = primerKit(ctx, "/explorer/");
  await ctx.send("Emulation.setDeviceMetricsOverride", DESK);
  await withReducedMotion(ctx, async () => {
    await step(
      "PH1 a Try it lands the hand in the Explorer: the ring holds every control the islands step names, the note says the step, nothing is sealed, the key stays, and no road of the room carries it",
      async () => {
        const islands = handStep("explorer-islands");
        await open(k, islands, "PH1");
        const css = islands.words.map((w) => w.css);
        const ring = await ringed(k, css, "PH1");
        k.check(
          "PH1 (a) the ring holds every control the step names",
          ring.inside.every(Boolean),
          JSON.stringify(ring),
        );
        const note = await k.evaluate(NOTE);
        k.check(
          "PH1 (b) the note says the step's sentence and its place in its lesson",
          note.act === islands.act.replace(/[{}]/g, "") && note.title === "The Land, step 2 of 6",
          JSON.stringify(note),
        );
        const where = await k.evaluate(WHERE(islands.id));
        k.check(
          "PH1 (c) nothing is sealed and the key stays in the address",
          !where.sealed && where.search.includes(`step=${islands.id}`),
          JSON.stringify(where),
        );
        const roads = await k.evaluate(STEP_ROADS);
        k.check("PH1 (d) no road of the room outside the note carries the key", roads.length === 0, roads.join(" | "));
      },
    );
    await step(
      "PH2 doing the islands step seals it: the store holds it, the note says done and turns onward to sizes, and the key leaves the address with every key of the step's address kept",
      async () => {
        const islands = handStep("explorer-islands");
        await open(k, islands, "PH2");
        for (const a of islands.do) await perform(k, a, "PH2 do");
        const note = await done(k, "PH2");
        const where = await k.evaluate(WHERE(islands.id));
        const lost = keysLost(islands.at, where.hash);
        k.check(
          "PH2 the store holds the step, the note turns onward and the key has left",
          where.sealed &&
            note.done?.includes("done") === true &&
            note.next === "Next, sizes ›" &&
            !where.search.includes("step="),
          JSON.stringify({ where, note }),
        );
        k.check("PH2 every key of the step's address stays", lost.length === 0, `lost ${lost.join(", ") || "none"}`);
        k.check("PH2 the key is dropped by the hand", !where.search.includes("step="), where.search);
      },
    );
    await step("PH3 a step with nothing to see is sealed on arrival", async () => {
      const toPrint = handStep("explorer-to-print");
      await open(k, toPrint, "PH3");
      const note = await done(k, "PH3");
      const where = await k.evaluate(WHERE(toPrint.id));
      k.check("PH3 the note says done", note.done?.includes("done") === true, JSON.stringify(note));
      k.check("PH3 the store holds the step", where.sealed, JSON.stringify(where));
    });
    await step("PH4 a tablet step opened on a desk is never sealed and its note carries its mark", async () => {
      const inHand = handStep("explorer-in-hand");
      await open(k, inHand, "PH4");
      await k.settle(
        k.room().rest,
        (d, last) => last !== null && d.frames >= last.frames + 2,
        "PH4: two frames of the room's own rest",
        k.waitTries,
      );
      const note = await k.evaluate(NOTE);
      const where = await k.evaluate(WHERE(inHand.id));
      k.check("PH4 the step is not sealed", !where.sealed, JSON.stringify(where));
      k.check(
        "PH4 the note carries the mark and no done row",
        note.mark === "on a tablet" && note.done === null,
        JSON.stringify(note),
      );
    });
    await step("PH5 pressing the dice seals its step, and arriving does not", async () => {
      const dice = handStep("explorer-dice");
      await open(k, dice, "PH5");
      const before = await k.evaluate(WHERE(dice.id));
      k.check("PH5 arriving seals nothing", !before.sealed, JSON.stringify(before));
      for (const a of dice.do) await perform(k, a, "PH5 do");
      await done(k, "PH5");
      const after = await k.evaluate(WHERE(dice.id));
      k.check("PH5 pressing the dice seals the step", after.sealed, JSON.stringify(after));
    });
    await step(
      "PH6 a step whose control waits on a town's card rings the town first and the card's press once the card is open",
      async () => {
        const prospect = handStep("explorer-view-prospect");
        await open(k, prospect, "PH6");
        const town = prospect.first.flatMap((a) => (a.kind === "click" ? [a.css] : []));
        const press = prospect.words.map((w) => w.css);
        const first = await ringed(k, town, "PH6 town");
        k.check("PH6 the ring holds the town first", first.inside.every(Boolean), JSON.stringify(first));
        for (const a of prospect.first) await perform(k, a, "PH6 first");
        const second = await k.settle(
          RING(press),
          (d, last) => d.up && d.inside.every(Boolean) && last !== null && sameJson(d.ring, last.ring),
          "PH6: the ring comes to the card's press",
          k.waitTries,
        );
        k.check(
          "PH6 the ring holds the card's press once the card is open",
          second.inside.every(Boolean),
          JSON.stringify(second),
        );
      },
    );
    await step(
      "PH7 the × sets the note aside: the ring and the note go and the key leaves with the hash kept",
      async () => {
        const islands = handStep("explorer-islands");
        await open(k, islands, "PH7");
        await ringed(
          k,
          islands.words.map((w) => w.css),
          "PH7",
        );
        await perform(k, click(".primer-slip-aside"), "PH7");
        const gone = await k.evaluate(NOTE);
        const ring = await k.evaluate(RING([]));
        const where = await k.evaluate(WHERE(islands.id));
        const hash = await k.evaluate(HASH);
        const lost = keysLost(islands.at, hash);
        k.check("PH7 the note and the ring are gone", !gone.up && !ring.present, JSON.stringify({ gone, ring }));
        k.check(
          "PH7 the key left and the step is not sealed",
          !where.search.includes("step=") && !where.sealed,
          JSON.stringify(where),
        );
        k.check("PH7 every key of the step's address stays", lost.length === 0, `lost ${lost.join(", ") || "none"}`);
      },
    );
  });
  gate.check("PH8 the pointing hand logged no console error and fetched nothing that answered 4xx");
}
