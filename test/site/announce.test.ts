import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FADING, SAY_FADE_MS, SAY_HOLD_MS, makeAnnouncer } from "../../src/site/shared/announce.ts";

const fakePill = () => {
  const events: string[] = [];
  const classes = new Set<string>();
  let text = "";
  return {
    events,
    has: (token: string): boolean => classes.has(token),
    get textContent(): string | null {
      return text;
    },
    set textContent(next: string | null) {
      text = next ?? "";
      events.push(text === "" ? "clear" : `write ${text}`);
    },
    classList: {
      add: (token: string): void => {
        classes.add(token);
        events.push(`+${token}`);
      },
      // Only a removal that removed something is recorded, or every write would log one and the order assertion below would read its own noise.
      remove: (token: string): void => {
        if (classes.delete(token)) events.push(`-${token}`);
      },
    },
  };
};

const clock = () => {
  const pending = new Map<number, { run: () => void; ms: number }>();
  let id = 0;
  return {
    after: (run: () => void, ms: number): number => {
      pending.set(++id, { run, ms });
      return id;
    },
    cancel: (timer: number): void => {
      pending.delete(timer);
    },
    waiting: (): number => pending.size,
    delays: (): number[] => [...pending.values()].map((p) => p.ms),
    fire: (): void => {
      const first = [...pending.entries()][0];
      assert.ok(first, "a timer was pending to fire");
      pending.delete(first[0]);
      first[1].run();
    },
  };
};

const fixture = () => {
  const pill = fakePill();
  const timers = clock();
  const say = makeAnnouncer(pill, { after: timers.after, cancel: timers.cancel });
  return { pill, timers, say };
};

const LINE = "The Environs of Loatunui lies on the table · one sheet laid · room for five more";

// The ONLY assertion in this file that can see a change to either constant: every other test reads the delays back against the imported values, so they move with the mutation.
test("the hold and the fade are the ruled lengths (#547, Alex 2026-09-13: eight seconds, then it fades)", () => {
  assert.equal(SAY_HOLD_MS, 8000);
  assert.equal(SAY_FADE_MS, 450);
});

test("an announcement is written and its own departure is booked with it (#547)", () => {
  const f = fixture();
  f.say(LINE);
  assert.equal(f.pill.textContent, LINE, "the line is on the pill");
  assert.equal(f.timers.waiting(), 1, "and it leaves on its own: nothing about it waits for a press");
  assert.deepEqual(f.timers.delays(), [SAY_HOLD_MS], "after the ruled hold, not sooner");
  assert.equal(f.pill.has(FADING), false, "and it is not fading while it is being read");
});

test("at the hold the line starts fading and is still there to read; the clear is one fade away (#547)", () => {
  const f = fixture();
  f.say(LINE);
  f.timers.fire();
  assert.equal(f.pill.textContent, LINE, "the text is untouched while it fades");
  assert.equal(f.pill.has(FADING), true);
  assert.deepEqual(f.timers.delays(), [SAY_FADE_MS], "and the clear follows the fade it just started");
});

test("at the end of the fade the line is gone, the fade comes off with it, and nothing is left pending (#547)", () => {
  const f = fixture();
  f.say(LINE);
  f.timers.fire();
  f.timers.fire();
  assert.equal(f.pill.textContent, "");
  assert.equal(f.pill.has(FADING), false, "or the next line would be written into a transparent pill");
  assert.equal(f.timers.waiting(), 0);
});

test("a newer line cancels the older line's departure, so the reader is never cut short (#547)", () => {
  const f = fixture();
  f.say(LINE);
  f.say("this survey is already on the table");
  assert.equal(f.timers.waiting(), 1, "one departure booked, not two");
  assert.deepEqual(f.timers.delays(), [SAY_HOLD_MS], "and the newer line gets the whole hold");
  f.timers.fire();
  assert.equal(f.pill.textContent, "this survey is already on the table", "the newer line is what fades");
});

test("a line written by another hand is never cleared by this one, and no fade is started over it (#547)", () => {
  const f = fixture();
  f.say(LINE);
  f.pill.textContent = "Drafting…";
  f.timers.fire();
  assert.equal(f.pill.textContent, "Drafting…", "someone else owns the pill now");
  assert.equal(f.pill.has(FADING), false);
  assert.equal(f.timers.waiting(), 0, "and this module has stopped touching it");
});

test("another hand writing DURING the fade keeps its line and still gets the fade taken off it (#547)", () => {
  const f = fixture();
  f.say(LINE);
  f.timers.fire();
  assert.equal(f.pill.has(FADING), true, "the fade is on, which is the state this case exists to leave");
  f.pill.textContent = "Drafting…";
  f.timers.fire();
  assert.equal(f.pill.textContent, "Drafting…", "not cleared: it is not ours");
  assert.equal(f.pill.has(FADING), false, "but never left dimmed, which is the only lasting harm this could do");
});

// The Portfolio clears its own pill with say("") on two paths (src/site/portfolio/app.ts), so sharing one module means an empty line has to mean "gone now" and not "gone in eight seconds".
test("an empty line clears the pill at once and books nothing (#547 ruling 4)", () => {
  const f = fixture();
  f.say(LINE);
  f.say("");
  assert.equal(f.pill.textContent, "");
  assert.equal(f.timers.waiting(), 0, "no departure is booked for a line that is already gone");
  assert.equal(f.pill.has(FADING), false);
});

test("an empty line written mid-fade takes the fade off with it (#547 ruling 4)", () => {
  const f = fixture();
  f.say(LINE);
  f.timers.fire();
  f.say("");
  assert.equal(f.pill.has(FADING), false, "or the pill stays transparent for the next line");
  assert.equal(f.timers.waiting(), 0);
});

test("both rooms that announce on a status pill import the one announcer (#547 ruling 4; kept for Issue #779 part 2i: an import's name shows nowhere, and CD23 and CD54 read what each announces)", () => {
  const REPO = resolve(import.meta.dirname, "..", "..");
  for (const path of ["src/site/explorer/app.ts", "src/site/portfolio/app.ts"])
    assert.match(
      readFileSync(resolve(REPO, path), "utf8"),
      /from "\.\.\/shared\/announce\.ts"/,
      `${path} does not reach the shared announcer at all`,
    );
});
