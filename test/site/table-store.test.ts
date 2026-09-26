import test from "node:test";
import assert from "node:assert/strict";
import { readStoredTable, writeStoredTable, tableOnArrival, folioOnArrival, navigationType, navigationTypeNow, deviceStorage, TABLE_STORE_KEY, TRAVERSAL } from "../../src/site/shared/table-store.ts";
import { emitTable, parseTable, type SurveyItem, type TableItem } from "../../src/site/shared/table-address.ts";

// The Chart Table's second home (#634, ruled 2026-09-18 and 2026-09-19): the address decides an ARRIVAL and the device decides a RETURN. The store is injected rather than reached for, the way firstArrival/markArrival take theirs in src/site/home/ceremony.ts, so the precedence is provable here instead of only in a browser.
const survey = (lx: number): SurveyItem => ({
  kind: "survey", seed: 42, overrides: {}, rung: 2, lx, ly: 3,
  style: "antique", legend: true, arms: false, beasts: false, theme: null,
});
const fill = (n: number): TableItem[] => Array.from({ length: n }, (_, i) => survey(i));

/** Records what was ASKED of it, not only what it ends up holding: removing a key and storing an empty string leave the same bytes behind and mean different things to the next arrival. */
class FakeStore {
  readonly calls: string[] = [];
  held: Record<string, string>;
  constructor(held: Record<string, string> = {}) {
    this.held = held;
  }
  getItem(key: string): string | null {
    this.calls.push(`get ${key}`);
    return Object.prototype.hasOwnProperty.call(this.held, key) ? (this.held[key] as string) : null;
  }
  setItem(key: string, value: string): void {
    this.calls.push(`set ${key}`);
    this.held[key] = value;
  }
  removeItem(key: string): void {
    this.calls.push(`remove ${key}`);
    delete this.held[key];
  }
  clear(): void {
    this.held = {};
  }
  key(): string | null {
    return null;
  }
  get length(): number {
    return Object.keys(this.held).length;
  }
}
const asStorage = (fake: FakeStore): (() => Storage) => () => fake;

const shut: () => Storage = () => {
  throw new Error("storage is disabled in this browsing mode");
};

test("TS1 a link beats what this device holds: arriving with a table key means THAT table (#634's stated constraint)", () => {
  const carried = fill(2);
  const chosen = tableOnArrival(carried, fill(3), "navigate");
  assert.equal(emitTable(chosen), emitTable(carried));
  assert.equal(chosen.length, 2, "three stored sheets did not win over the two the address named");
});

test("TS2 arriving with NO table key at all is the case that reads the device (#634)", () => {
  const stored = fill(3);
  assert.equal(emitTable(tableOnArrival(null, stored, "navigate")), emitTable(stored));
});

test("TS3 a table key that is present but EMPTY is a bare table, and never consults the device (#634: parseTable's null/[] split IS the rule)", () => {
  // The witness that keeps this from being a restatement of TS2: the two inputs differ only in null against [], which is exactly what parseTable returns for an absent against a present-but-empty key.
  assert.equal(parseTable("#seed=42"), null);
  assert.deepEqual(parseTable("#seed=42&table="), []);
  assert.deepEqual(tableOnArrival([], fill(3), "navigate"), []);
});

test("TS4 a BACK or FORWARD arrival takes the device's table over the stale address it landed on (#634 ruling 1, 2026-09-19)", () => {
  const stored = fill(2);
  const chosen = tableOnArrival(fill(1), stored, "back_forward");
  assert.equal(emitTable(chosen), emitTable(stored));
  assert.equal(chosen.length, 2, "the entry's own one-sheet snapshot won over the two the device holds");
});

test("TS5 a back arrival with NOTHING on the device still takes the address it landed on (#634)", () => {
  const carried = fill(1);
  assert.equal(emitTable(tableOnArrival(carried, null, "back_forward")), emitTable(carried));
  // The case the cold review on PR #635 found shipped as a total loss: the two restore paths hand-rolled this rule without its qualifier, so a reader whose device holds nothing had the drawer EMPTIED by the gesture meant to keep it. Driven here at the rule, whose hosts are pinned to it by name in chart-drawer.test.ts and prospect-room.test.ts.
  assert.equal(tableOnArrival(carried, null, TRAVERSAL).length, 1, "a traversal with an empty device seats nothing, which empties the table of every reader whose storage is blocked and of everyone who arrived on a shared link");
  assert.equal(readStoredTable(shut), null, "and the unreadable store this stands for reads as null, not as an empty table");
});

test("TS15 a traversal takes the device WHOSEVER folio the entry carries, which is ruled and not incidental (#634, ruled 2026-09-19)", () => {
  // The cell where two rulings collide and only one can be obeyed: a Back or Forward INTO a page carrying someone
  // else's folio. Alex ruled the device wins there, with the cost stated: their folio leaves that tab and the entry's
  // address is rewritten. TS4's fixture cannot tell this apart, because the table its address carries is a subset of
  // the device's, which is the stale-snapshot shape that the rejected alternative would also have answered this way.
  // The fixture here is DISJOINT on purpose: the alternative returns the address's folio and this test reds.
  const theirs = [survey(7), survey(8)];
  const mine = [survey(1), survey(2)];
  assert.equal(emitTable(tableOnArrival(theirs, mine, TRAVERSAL)), emitTable(mine), "a traversal into someone else's folio shows their folio, which is the rejected reading of ruling 2 and not what was ruled");
  assert.equal(new Set([...theirs, ...mine].map((i) => emitTable([i]))).size, 4, "the two tables share a sheet, so this fixture no longer tells the ruling from the alternative");
  // And the ordinary arrival at that same link is untouched by the ruling: theirs, exactly as sent.
  assert.equal(emitTable(tableOnArrival(theirs, mine, "navigate")), emitTable(theirs));
});

test("TS14 a page whose ADDRESS is its content takes the same precedence WITHOUT the traversal term (#634, the Portfolio)", () => {
  const carried = fill(1);
  const stored = fill(2);
  assert.equal(emitTable(folioOnArrival(carried, stored)), emitTable(carried), "a folio the address names is that folio, whatever this device holds");
  assert.equal(emitTable(folioOnArrival(null, stored)), emitTable(stored), "and a page arrived at with no folio named shows what the device holds");
  assert.deepEqual(folioOnArrival(null, null), []);
  assert.deepEqual(folioOnArrival([], stored), [], "a present but empty key is a bare folio here too");
  // The whole point of the second entry point: one gesture, one answer, whether or not the browser cached the page.
  assert.equal(
    emitTable(folioOnArrival(carried, stored)),
    emitTable(tableOnArrival(carried, stored, "navigate")),
    "the folio rule and an ordinary arrival must agree, or the Portfolio answers a Back differently from a fresh open",
  );
  assert.notEqual(emitTable(folioOnArrival(carried, stored)), emitTable(tableOnArrival(carried, stored, TRAVERSAL)), "and it is genuinely the traversal term that is being left out, not a synonym for the same call");
});

test("TS6 a RELOAD is an arrival and not a traversal, so the address wins (#634 ruling 1: a link, a bookmark, a typed address and a reload all take the address)", () => {
  const carried = fill(1);
  assert.equal(emitTable(tableOnArrival(carried, fill(2), "reload")), emitTable(carried));
});

test("TS7 emptying the table REMOVES the key rather than storing an empty one, or the next arrival hands it back (#634)", () => {
  const fake = new FakeStore();
  writeStoredTable(asStorage(fake), fill(2));
  assert.equal(readStoredTable(asStorage(fake))?.length, 2);
  writeStoredTable(asStorage(fake), []);
  assert.ok(fake.calls.includes(`remove ${TABLE_STORE_KEY}`), `an empty table was stored rather than removed: ${fake.calls.join(", ")}`);
  assert.equal(readStoredTable(asStorage(fake)), null, "an emptied table reads back as a table, so a keyless arrival would resurrect it");
  // The whole point of the removal: what a keyless arrival then does.
  assert.deepEqual(tableOnArrival(null, readStoredTable(asStorage(fake)), "navigate"), []);
});

test("TS8 the device holds the table in the ONE grammar, byte for byte (#634)", () => {
  const fake = new FakeStore();
  const items = [...fill(2), { kind: "prospect", seed: 42, overrides: {}, style: "antique", index: 3, year: 1059 } as TableItem];
  writeStoredTable(asStorage(fake), items);
  assert.equal(emitTable(readStoredTable(asStorage(fake)) ?? []), emitTable(items));
});

test("TS9 a store that refuses to answer leaves the page working (#634, the private-mode path src/site/home/ceremony.ts already keeps)", () => {
  assert.doesNotThrow(() => writeStoredTable(shut, fill(2)));
  assert.equal(readStoredTable(shut), null, "an unreadable store must read as 'the address decides', never throw into the boot");
});

test("TS10 a corrupt stored value reads as a bare table rather than throwing (#634)", () => {
  const fake = new FakeStore({ [TABLE_STORE_KEY]: "nonsense" });
  assert.deepEqual(readStoredTable(asStorage(fake)), []);
});

test("TS11 the navigation type is read from the browser's own entry, and defaults to an arrival when there is none (#634)", () => {
  assert.equal(navigationType(() => [{ type: "back_forward" }]), "back_forward");
  assert.equal(navigationType(() => [{ type: "reload" }]), "reload");
  assert.equal(navigationType(() => []), "navigate", "a browser that reports no navigation entry must fall back to the address, never to the device");
  assert.equal(navigationType(() => [{ type: "" }]), "navigate", "an entry whose type is the empty string is not a navigation type, and reading it as one would compare it against back_forward forever");
  assert.equal(navigationType(() => [{}]), "navigate", "nor is an entry with no type at all");
  assert.equal(navigationType(() => { throw new Error("no performance entries here"); }), "navigate");
});

test("TS13 the device every host reaches for is THE device, named once (#634, guard-prover round 3)", () => {
  // Three hosts hand-rolled this one line and two of them could be wired to a stub with every guard in the set green,
  // because a guard that reads `readStoredTable(store)` as text cannot see what `store` was bound to a line earlier.
  // One exported binding, driven here, is what takes that out of each host's reach.
  const real = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const fake = new FakeStore();
  try {
    Object.defineProperty(globalThis, "localStorage", { value: fake, configurable: true, writable: true });
    assert.equal(deviceStorage(), fake, "the device binding does not resolve to this browser's own localStorage, so every host could be reading and writing something no reader will ever see again");
    writeStoredTable(deviceStorage, fill(1));
    assert.ok(fake.calls.includes(`set ${TABLE_STORE_KEY}`), "and a write through it reaches nothing");
  } finally {
    if (real) Object.defineProperty(globalThis, "localStorage", real);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("TS12 the browser SEAM reads the real navigation entry, so the reading every host actually takes is exercised once (#634)", () => {
  // Without this the injectable above is the only thing proved, and the wrapper could hand back a constant while every other test here stayed green and back/forward detection quietly died on all four hosts at once (guard-prover round 2).
  const real = Object.getOwnPropertyDescriptor(globalThis, "performance");
  const stub = (entries: ReadonlyArray<{ type?: string }>): void => {
    Object.defineProperty(globalThis, "performance", { value: { getEntriesByType: () => entries }, configurable: true, writable: true });
  };
  try {
    stub([{ type: "back_forward" }]);
    assert.equal(navigationTypeNow(), "back_forward", "the seam does not read the browser's own navigation entry, so a return is indistinguishable from an arrival on every page");
    stub([{ type: "reload" }]);
    assert.equal(navigationTypeNow(), "reload", "and it hands back a constant rather than what the browser said");
    stub([]);
    assert.equal(navigationTypeNow(), "navigate");
  } finally {
    if (real) Object.defineProperty(globalThis, "performance", real);
  }
});
