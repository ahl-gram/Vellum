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
    get textContent(): string | null { return text; },
    set textContent(next: string | null) { text = next ?? ""; events.push(text === "" ? "clear" : `write ${text}`); },
    classList: {
      add: (token: string): void => { classes.add(token); events.push(`+${token}`); },
      // Only a removal that removed something is recorded, or every write would log one and the order assertion below would read its own noise.
      remove: (token: string): void => { if (classes.delete(token)) events.push(`-${token}`); },
    },
  };
};

const clock = () => {
  const pending = new Map<number, { run: () => void; ms: number }>();
  let id = 0;
  return {
    after: (run: () => void, ms: number): number => { pending.set(++id, { run, ms }); return id; },
    cancel: (timer: number): void => { pending.delete(timer); },
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

// Both pages, because one page wired and the other not is exactly the shape #547 was filed about (the Chart Table's guards all ran at 390 and nowhere else). Read against the source with whitespace COLLAPSED: the prover reverted the Explorer to a multi-line bare write and a line-bounded pattern could not see across the break (2026-09-13). Blind spot, named with its direction: this reads the source and not the running page, so it errs toward a miss, and e2e CD23 is the Explorer's resolved read; the Portfolio has no behavioural read inside this suite's measured time budget, which the PR body carries as residue.
test("every room that announces on a status pill announces through the one announcer, uses what it built, and keeps no bare write of its own (#547 ruling 4)", () => {
  const REPO = resolve(import.meta.dirname, "..", "..");
  const pages = [
    ["src/site/explorer/app.ts", "status"],
    ["src/site/portfolio/app.ts", "status"],
  ] as const;
  for (const [path, pill] of pages) {
    const flat = readFileSync(resolve(REPO, path), "utf8").replace(/\s+/g, " ");
    assert.match(flat, /from "\.\.\/shared\/announce\.ts"/, `${path} does not reach the shared announcer at all`);
    const built = flat.match(new RegExp(`const (\\w+) = makeAnnouncer\\(${pill}, \\{`));
    assert.ok(built, `${path} imports the announcer and builds nothing over its pill, so its announcements never leave the chart`);
    assert.ok(
      built[1] === "say" || new RegExp(`say: ${built[1]}\\b`).test(flat),
      `${path} builds an announcer called ${built[1]} and never hands it over as the say, which passes every other assertion here and leaves the line standing`,
    );
    assert.doesNotMatch(
      flat,
      new RegExp(`say(: |\\s*= )[^;]*${pill}\\.textContent`),
      `${path} still writes its announcement straight onto the pill, which is the defect #547 named`,
    );
  }
});

// Nothing in the browser can tell the two writers apart: CD24 reads the line and the pill's fade, and both look identical whichever one put the line there.
test("the Portfolio's ruled announcement goes through the announcer and its progress line does not (#547 ruling 4)", () => {
  const flat = readFileSync(resolve(import.meta.dirname, "..", "..", "src/site/portfolio/app.ts"), "utf8").replace(/\s+/g, " ");
  assert.match(flat, /say\([^;]*is on top/, "the sheet brought up is ANNOUNCED, so it leaves the chart the way the Chart Table's line does");
  assert.doesNotMatch(flat, /tell\([^;]*is on top/, "and never written bare, which would leave it standing over the chart forever");
  assert.match(flat, /tell\([^;]*draftedLine/, "while the drafting count is written bare, or a sheet slower than the hold blanks the stage mid-draft");
  assert.doesNotMatch(flat, /say\([^;]*draftedLine/, "and never announced, or it goes while the drafting is still running");
});
