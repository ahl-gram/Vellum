import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { barlessHost, realWorld } from "../../test-support/living-chart-hosts.ts";
import { HOLD_GRACE_MS } from "../../src/site/living-chart/place-card-hold.ts";

test("the place card carries the prospect way in only on a world sheet whose host provides one (#242)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();

  const linked = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}` });
  linked.lc.buildPlaceOverlay(manifest);
  const overlay = linked.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const link = walk(overlay).find((n) => n.classList.contains("pc-prospect"));
  assert.ok(link, "a world-sheet card holds the way in to the prospect page");
  assert.equal(link.tagName, "A", "and it is a real link, not a button");
  assert.match(link.textContent, /prospect/i, "named for what it opens");

  // A region inset renumbers its places (Issue #169), so a world-index link there would name the WRONG settlement.
  linked.lc.buildPlaceOverlay(manifest, { box: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } });
  const overlays = linked.mount.children.filter((c) => c.classList.contains("place-overlay"));
  const inset = overlays[overlays.length - 1]!;
  assert.ok(
    !walk(inset).some((n) => n.classList.contains("pc-prospect")),
    "a region inset's renumbered card carries no prospect link",
  );

  const bare = await barlessHost();
  bare.lc.buildPlaceOverlay(manifest);
  const bareOverlay = bare.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  assert.ok(
    !walk(bareOverlay).some((n) => n.classList.contains("pc-prospect")),
    "a host with no prospect surface (the Reading Room) gets no link",
  );
});

// Issue #522 Sub 4: the card's SECOND action, injected on the same terms as the prospect link.
// The shim's querySelector answers null by design, so showing a card needs the .pc-inner stub place-card-clamp.test.ts already uses.
const armShow = async (mount: { children: unknown[] }) => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const overlay = (mount.children as ReturnType<typeof walk>).find((c) => c.classList.contains("place-overlay"))!;
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card")!;
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  card.querySelector = ((sel: string) => (sel === ".pc-inner" ? inner : null)) as typeof card.querySelector;
  const hits = walk(overlay).filter((n) => n.classList.contains("place-hit"));
  return {
    hits,
    show: (at: number) => {
      hits[at]!.fire("focus");
    },
    press: () => walk(overlay).find((n) => n.classList.contains("pc-lay"))!,
  };
};

const layHost = (over: { refuses?: boolean } = {}) => {
  const laid: number[] = [];
  return {
    laid,
    dep: {
      state: (idx: number) => ({
        label: over.refuses ? "No room on the table" : `lay ${idx}`,
        refuses: !!over.refuses,
      }),
      lay: (idx: number) => {
        laid.push(idx);
      },
    },
  };
};

test("LP1 the card carries the LAY press only on a world sheet whose host provides one, and it is a real button rather than a link (#522)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();

  const host = layHost();
  const linked = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}`, layProspect: host.dep });
  linked.lc.buildPlaceOverlay(manifest);
  const overlay = linked.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const press = walk(overlay).find((n) => n.classList.contains("pc-lay"));
  assert.ok(press, "a world-sheet card whose host has a table holds the press onto it");
  assert.equal(
    press.tagName,
    "BUTTON",
    "it acts on the sheet rather than going anywhere, so it is a button and takes no road dress",
  );
  assert.equal(press.type, "button", "untyped, it would submit any form the card ever lands in");
  assert.deepEqual(
    [...new Set(press.listeners)].sort(),
    ["click", "dblclick", "mousedown", "touchstart", "wheel"],
    "the card sits inside the zoom-bound gesture box, so the press stops d3's gesture events or a rapid double-press zooms the chart under the reader (the makeDogEar rule)",
  );

  // A region inset renumbers its places (Issue #242), so the world index a filing would carry names the WRONG settlement there.
  linked.lc.buildPlaceOverlay(manifest, { box: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } });
  const insets = linked.mount.children.filter((c) => c.classList.contains("place-overlay"));
  assert.ok(
    !walk(insets[insets.length - 1]!).some((n) => n.classList.contains("pc-lay")),
    "a region inset's renumbered card carries no filing press",
  );

  const bare = await barlessHost();
  bare.lc.buildPlaceOverlay(manifest);
  const bareOverlay = bare.mount.children.find((c) => c.classList.contains("place-overlay"))!;
  assert.ok(
    !walk(bareOverlay).some((n) => n.classList.contains("pc-lay")),
    "a host with no table (the Reading Room) gets no press",
  );
});

test("LP2 both actions sit inside ONE .pc-acts row, so Issue #428's third action joins a row that already exists rather than re-laying the card out (#522)", async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();
  const host = layHost();
  const { lc, mount } = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}`, layProspect: host.dep });
  lc.buildPlaceOverlay(manifest);
  const overlay = mount.children.find((c) => c.classList.contains("place-overlay"))!;
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card")!;
  const inner = walk(card).find((n) => n.classList.contains("pc-inner"))!;
  const acts = inner.children.filter((c) => c.classList.contains("pc-acts"));
  assert.equal(acts.length, 1, "exactly one action row, and it is a direct child of the card's inner");
  const names = acts[0]!.children.map((c) => String(c.className));
  assert.deepEqual(names, ["pc-prospect", "pc-lay"], "both actions are the row's children, in the ruled stills' order");
  assert.ok(
    !inner.children.some((c) => c.classList.contains("pc-prospect") || c.classList.contains("pc-lay")),
    "and neither action is left a bare sibling of the prose",
  );
});

test("LP3 the press's face and its refusal come from the HOST's table, and the press stays pressable when it refuses so a keyboard reader still meets it (#522, ruled 2026-09-17)", async () => {
  const { manifest } = await realWorld();

  const open = layHost();
  const a = await barlessHost({ layProspect: open.dep });
  a.lc.buildPlaceOverlay(manifest);
  const armedA = await armShow(a.mount);
  armedA.show(0);
  const pressA = armedA.press();
  assert.equal(pressA.textContent, "lay 0", "the face is the host's own line for THIS place, not a baked string");
  assert.ok(!pressA.classList.contains("dim"), "a table with room does not dim the press");

  const full = layHost({ refuses: true });
  const b = await barlessHost({ layProspect: full.dep });
  b.lc.buildPlaceOverlay(manifest);
  const armedB = await armShow(b.mount);
  armedB.show(0);
  const pressB = armedB.press();
  assert.equal(pressB.textContent, "No room on the table");
  assert.ok(pressB.classList.contains("dim"), "a refusing press dims");
  assert.equal(
    pressB.getAttribute("disabled"),
    null,
    "a refusing press is not disabled: that leaves the tab order, and the dog-ear's ruled shape stays pressable and answers",
  );
  const overlaySrc = readFileSync(new URL("../../src/site/living-chart/place-overlay.ts", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  assert.doesNotMatch(
    overlaySrc,
    /\bdisabled\b/,
    "and nothing in the overlay may reach for disabled, which is the form that silently drops the press out of the tab order",
  );
});

test("LP4 the press names the place the card is SHOWING, so a second card's press never files the first card's town (#522)", async () => {
  const { manifest } = await realWorld();
  const host = layHost();
  const { lc, mount } = await barlessHost({ layProspect: host.dep });
  lc.buildPlaceOverlay(manifest);
  const armed = await armShow(mount);
  assert.ok(armed.hits.length > 1, "seed 42 carries several places, so the wrong-index case is reachable");

  armed.show(0);
  assert.equal(armed.press().dataset["idx"], "0", "the press carries the shown place's index");
  armed.show(1);
  assert.equal(armed.press().dataset["idx"], "1", "and follows the card to the next place");
  armed.press().fire("click");
  assert.deepEqual(host.laid, [1], "so pressing files the place on screen, not the one before it");
});

const cardFace = async (mount: { children: unknown[] }) => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const overlay = (mount.children as ReturnType<typeof walk>).find((c) => c.classList.contains("place-overlay"))!;
  const card = walk(overlay).find((n) => n.getAttribute("id") === "place-card")!;
  const find = (cls: string) => walk(card).find((n) => n.classList.contains(cls));
  // A hidden card keeps the last town's text and classes, so everything but `shown` reads as nothing while it is hidden.
  return () =>
    card.hidden
      ? { shown: false, pinned: false, name: null, pressIdx: null, linkIdx: null }
      : {
          shown: true,
          pinned: card.classList.contains("pinned"),
          name: find("pc-name")?.textContent ?? null,
          pressIdx: find("pc-lay")?.dataset["idx"] ?? null,
          linkIdx: String((find("pc-prospect") as { href?: string } | undefined)?.href ?? "").split("i=")[1] ?? null,
        };
};

test("PC1 a hover over another town never leaves a pinned card naming one town while it opens or files another (#750 point 3)", async () => {
  const { manifest } = await realWorld();
  const host = layHost();
  const { lc, mount } = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}`, layProspect: host.dep });
  lc.buildPlaceOverlay(manifest);
  const armed = await armShow(mount);
  const face = await cardFace(mount);
  const [a, b] = [manifest.places[0]!, manifest.places[1]!];
  assert.notEqual(a.name, b.name, "two distinct towns, or a card naming the wrong one reads the same");

  armed.hits[0]!.fire("mouseenter", { clientX: -100, clientY: -100 });
  armed.hits[0]!.fire("click", { detail: 1, clientX: -100, clientY: -100 });
  assert.deepEqual(
    face(),
    { shown: true, pinned: true, name: a.name, pressIdx: "0", linkIdx: "0" },
    "the precondition: a press pins town A",
  );

  armed.hits[1]!.fire("mouseenter", { clientX: -100, clientY: -100 });
  armed.hits[1]!.fire("mouseleave", { clientX: -100, clientY: -100 });
  const after = face();
  assert.ok(after.shown, "the pin survives the pointer crossing town B on its way somewhere");
  const shownIdx = String(manifest.places.findIndex((p) => p.name === after.name));
  assert.equal(after.name, a.name, "the pinned card still names town A");
  assert.equal(
    after.pinned,
    true,
    "a card that will not hide on leave is a pinned card and says so; main shows town B unmarked while still pinned to A",
  );
  assert.equal(after.pressIdx, shownIdx, "the filing press names the town the card shows");
  assert.equal(after.linkIdx, shownIdx, "and so does the prospect link");
});

test("PC2 the second click of a double-click keeps the pinned card, and a later deliberate click or Enter still closes it (#750 point 4, ruled 2026-10-04)", async () => {
  const { manifest } = await realWorld();
  const { lc, mount } = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}` });
  lc.buildPlaceOverlay(manifest);
  const armed = await armShow(mount);
  const face = await cardFace(mount);
  const town = armed.hits[0]!;
  const click = (detail: number) => town.fire("click", { detail, clientX: -100, clientY: -100 });
  town.fire("mouseenter", { clientX: -100, clientY: -100 });
  click(1);
  assert.equal(face().pinned, true, "the precondition: the first press pins");
  click(2);
  assert.deepEqual(
    { shown: face().shown, pinned: face().pinned },
    { shown: true, pinned: true },
    "the second click of a double-click is not a dismissal",
  );
  click(1);
  assert.equal(face().shown, false, "a later deliberate click on the pinned town still closes it");
  click(0);
  assert.equal(face().pinned, true, "Enter (a click with no pointer count) pins");
  click(0);
  assert.equal(face().shown, false, "and a second Enter on the pinned town closes it");
});

const holdRig = async () => {
  const { walk } = await import("../../test-support/element-shim.ts");
  const { manifest } = await realWorld();
  const { lc, mount } = await barlessHost({ prospectHref: (idx) => `/prospect/#i=${idx}`, layProspect: layHost().dep });
  const docListeners = new Map<string, Set<(e: unknown) => void>>();
  const on = (type: string) => docListeners.get(type) ?? docListeners.set(type, new Set()).get(type)!;
  (mount as unknown as { ownerDocument: unknown }).ownerDocument = {
    addEventListener: (type: string, fn: (e: unknown) => void) => {
      on(type).add(fn);
    },
    removeEventListener: (type: string, fn: (e: unknown) => void) => {
      on(type).delete(fn);
    },
  };
  const listening = on("mousemove");
  const fireDoc = (type: string, e: unknown) => {
    for (const fn of [...on(type)]) fn(e);
  };
  lc.buildPlaceOverlay(manifest);
  const armed = await armShow(mount);
  const face = await cardFace(mount);
  const overlay = () => mount.children.filter((c) => c.classList.contains("place-overlay")).at(-1)!;
  const card = () => walk(overlay()).find((n) => n.getAttribute("id") === "place-card")!;
  // The shim does no layout, so every box is a zero rect at the origin; a pointer off the origin lies in none of them, and a press falls back to the town it landed on.
  const at = { clientX: -100, clientY: -100 };
  return { lc, manifest, armed, face, overlay, card, listening, fireDoc, on, at };
};

test("PC3 a dismissal clears a pending grace, so the next card's grace runs its whole length (#750)", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { lc, armed, face, at } = await holdRig();
  armed.hits[0]!.fire("mouseenter", at);
  armed.hits[0]!.fire("mouseleave", at);
  assert.equal(face().shown, true, "the precondition: leaving a town starts a grace instead of hiding at once");
  t.mock.timers.tick(100);
  lc.hideCard();
  armed.hits[1]!.fire("mouseenter", at);
  armed.hits[1]!.fire("mouseleave", at);
  t.mock.timers.tick(HOLD_GRACE_MS - 90);
  assert.equal(
    face().shown,
    true,
    "the first grace, had it survived the dismissal, would have fired here and cut the second one short",
  );
  t.mock.timers.tick(100);
  assert.equal(face().shown, false, "the second grace runs out on its own clock");
});

test("PC4 the overlay waits the whole grace after the pointer leaves, and no longer (#750)", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { armed, face, at } = await holdRig();
  armed.hits[0]!.fire("mouseenter", at);
  armed.hits[0]!.fire("mouseleave", at);
  t.mock.timers.tick(91);
  assert.equal(face().shown, true, "still up at 91ms, the measured worst gap crossed at 0.1 px/ms");
  t.mock.timers.tick(HOLD_GRACE_MS - 92);
  assert.equal(face().shown, true, "still up a millisecond before the grace ends");
  t.mock.timers.tick(1);
  assert.equal(face().shown, false, "gone when it ends");
});

test("PC5 a pinned card sits right after its town, so Tab reaches its buttons next; an unpinned one stays out of the way (#750 ruling 7)", async () => {
  const { armed, face, overlay, card, at } = await holdRig();
  const after = (i: number) => {
    const kids = overlay().children;
    return kids.indexOf(card()) === kids.indexOf(armed.hits[i]!) + 1;
  };
  const last = () => overlay().children.at(-1) === card();
  armed.hits[2]!.fire("click", { ...at, detail: 1 });
  assert.ok(face().pinned && after(2), "pinned by a press: the card follows its town");
  armed.hits[4]!.fire("focus");
  assert.ok(
    face().shown && !face().pinned && last(),
    "keyboard focus on another town shows it unpinned, and the card goes back to the end",
  );
  const link = card().children[0]!.children.find((n) => n.classList.contains("pc-acts"))!.children[0]!;
  armed.hits[4]!.fire("blur", { relatedTarget: link });
  assert.equal(face().shown, true, "focus moving from the town into its card keeps the card");
  card().fire("focusout", { relatedTarget: null });
  assert.equal(face().shown, false, "focus leaving the card for the page hides an unpinned card");
});

test("PC6 a card refilled for another town keeps its action row in place, so a focused button keeps its focus (#750)", async () => {
  const { armed, card } = await holdRig();
  const inner = card().children[0]!;
  const acts = inner.children.find((n) => n.classList.contains("pc-acts"))!;
  const detached: string[] = [];
  let parent = acts.parentNode;
  Object.defineProperty(acts, "parentNode", {
    get: () => parent,
    set: (p: typeof parent) => {
      if (p !== inner) detached.push(p ? p.tagName : "nowhere");
      parent = p;
    },
    configurable: true,
  });
  armed.hits[0]!.fire("focus");
  armed.hits[1]!.fire("focus");
  assert.equal(inner.children.filter((n) => n === acts).length, 1, "the one action row is still the card's");
  assert.deepEqual(detached, [], "and it never left the card on the way");
});

test("PC7 the page listens for mouse movement only while a place card is shown, and every way a card closes stops it (#750 ruling 1)", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { lc, manifest, armed, listening, on, at } = await holdRig();
  const presses = on("pointerdown");
  assert.equal(listening.size + presses.size, 0, "built, with no card up: nothing listens on the page");
  assert.ok(
    armed.hits.every((h) => !h.listeners.includes("mousemove")),
    "and no town listens for movement either",
  );
  const open = (label: string) => {
    armed.hits[0]!.fire("focus");
    assert.deepEqual(
      [listening.size, presses.size],
      [1, 1],
      `${label}: a shown card listens for movement and presses, once each`,
    );
  };
  const outside = { closest: () => null };
  const paths: [string, () => void][] = [
    ["Escape", () => lc.onDocKeydown({ key: "Escape" } as KeyboardEvent)],
    [
      "a press on open chart",
      () => lc.onDocClick({ target: outside, detail: 1, clientX: -50, clientY: -50 } as unknown as MouseEvent),
    ],
    ["hideCard (the scrub and the draw)", () => lc.hideCard()],
    [
      "the grace running out",
      () => {
        armed.hits[0]!.fire("mouseleave", at);
        t.mock.timers.tick(HOLD_GRACE_MS);
      },
    ],
    ["a blur", () => armed.hits[0]!.fire("blur", { relatedTarget: null })],
    [
      "a second press on the pinned town",
      () => {
        armed.hits[0]!.fire("click", { ...at, detail: 1 });
        armed.hits[0]!.fire("click", { ...at, detail: 1 });
      },
    ],
    ["a rebuild", () => lc.buildPlaceOverlay(manifest)],
  ];
  for (const [label, close] of paths) {
    open(label);
    close();
    assert.deepEqual([listening.size, presses.size], [0, 0], `${label} closes the card and stops listening`);
  }
  open("teardown");
  lc.destroy();
  assert.deepEqual([listening.size, presses.size], [0, 0], "teardown stops listening");
});

test("PC8 a pointer drifting inside overlapping boxes toward a nearer town waits out the grace before the card switches, so heading for a card's button never loses it (#750, #632)", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { armed, face, fireDoc } = await holdRig();
  const box = (x: number, y: number) => ({ left: x - 13, top: y - 13, right: x + 13, bottom: y + 13 });
  armed.hits[0]!.rect = box(100, 100);
  armed.hits[1]!.rect = box(108, 104);
  const nameOf = (i: number) => (armed.hits[i]!.getAttribute("aria-label") ?? "").split(", ")[0];
  const raised = () => armed.hits.filter((h) => h.classList.contains("pc-near")).map((h) => h.dataset["idx"]);
  armed.hits[1]!.fire("mouseenter", { clientX: 108, clientY: 104 });
  assert.equal(face().name, nameOf(1), "the precondition: the pointer at town 1's centre shows town 1");
  assert.deepEqual(raised(), ["1"], "the town under the pointer is the raised one, so the hover ring is its");
  fireDoc("mousemove", { buttons: 0, clientX: 101, clientY: 101, target: armed.hits[1] });
  assert.deepEqual(raised(), ["0"], "nearer town 0's box is raised over town 1's, and only it");
  assert.equal(face().name, nameOf(1), "drifting nearer town 0 does not swap the card at once");
  t.mock.timers.tick(HOLD_GRACE_MS);
  assert.equal(face().name, nameOf(0), "resting there, the nearer town takes the card once the grace has run");
  armed.hits[1]!.fire("mouseleave", { clientX: 300, clientY: 300 });
  assert.deepEqual(raised(), [], "leaving the towns for open chart lowers the raised box, and its ring with it");
});

test("PC9 the focus a press gives a town leaves a pinned card alone, whichever town's box took the press; keyboard focus still switches (#750 ruling 2)", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { armed, face, at } = await holdRig();
  armed.hits[0]!.fire("click", { ...at, detail: 1 });
  assert.equal(face().pinned, true, "the precondition: town 0 is pinned");
  armed.hits[3]!.fire("mousedown", at);
  armed.hits[4]!.fire("focus");
  assert.deepEqual(
    { pinned: face().pinned, idx: face().pressIdx },
    { pinned: true, idx: "0" },
    "a press's focus, even on another town's box, does not move the card",
  );
  armed.hits[5]!.fire("mousedown", at);
  t.mock.timers.tick(0);
  armed.hits[5]!.fire("focus");
  assert.deepEqual(
    { pinned: face().pinned, idx: face().pressIdx },
    { pinned: false, idx: "5" },
    "a press that gave no focus is forgotten by the next task, so keyboard focus after it switches the card",
  );
});

test("PC10 a tap that came down on the card's text keeps it, even when the browser moves the tap's click onto a town just outside (#750)", async () => {
  const { armed, face, card, overlay, fireDoc, at } = await holdRig();
  armed.hits[0]!.fire("click", { ...at, detail: 1 });
  card().rect = { left: 50, top: 150, right: 300, bottom: 370 };
  armed.hits[1]!.fire("mouseenter", { clientX: 179, clientY: 364 });
  assert.equal(
    overlay().classList.contains("pc-over"),
    true,
    "a town beneath the card's text shows no hand while the pointer is over the card",
  );
  assert.deepEqual(
    armed.hits.filter((h) => h.classList.contains("pc-own")).map((h) => h.dataset["idx"]),
    ["0"],
    "except the card's own town, which is still pressable",
  );
  armed.hits[1]!.fire("mouseleave", { clientX: 172, clientY: 373 });
  assert.equal(
    overlay().classList.contains("pc-over"),
    false,
    "and its hand comes back once the pointer is off the card",
  );
  // Measured 2026-10-04 on seed 4294967295 at 1024 (an emulated tablet): a finger at 179,364 on Kalkulin's card reached Vadelgrad's box as a click at 172,373.
  fireDoc("pointerdown", { clientX: 179, clientY: 364, target: card() });
  armed.hits[1]!.fire("click", { detail: 1, clientX: 172, clientY: 373 });
  assert.deepEqual(
    { pinned: face().pinned, idx: face().pressIdx },
    { pinned: true, idx: "0" },
    "the town the click was moved onto does not take the card, whatever the finger's own press landed on",
  );
  fireDoc("pointerdown", { clientX: 172, clientY: 373, target: armed.hits[1] });
  armed.hits[1]!.fire("click", { detail: 1, clientX: 172, clientY: 373 });
  assert.equal(face().pressIdx, "1", "a finger that came down outside the card does move the pin");
  fireDoc("pointerdown", { clientX: 179, clientY: 364, target: card() });
  fireDoc("pointerdown", { clientX: 172, clientY: 373, target: armed.hits[0] });
  armed.hits[0]!.fire("click", { detail: 1, clientX: 172, clientY: 373 });
  assert.equal(
    face().pressIdx,
    "0",
    "a finger that came down on the card and panned away leaves no point behind for the next press to read",
  );
  fireDoc("pointerdown", { clientX: 179, clientY: 364, target: card() });
  armed.hits[1]!.fire("click", { detail: 1, clientX: 179, clientY: 364 });
  armed.hits[1]!.fire("click", { detail: 1, clientX: 172, clientY: 373 });
  assert.equal(
    face().pressIdx,
    "1",
    "and a press's point is spent on its own click, so a later click with none of its own is read where it landed",
  );
});

test("PC11 a click split onto the overlay, because a town was raised between the press and the release, still pins the town nearest the pointer (#632)", async () => {
  const { lc, armed, face, overlay } = await holdRig();
  // Measured 2026-10-04 at 1024: a press with no move first on Nykrask's centre went down on Dradkrov's box, Nykrask was raised under it, and the click landed on their common parent.
  armed.hits[2]!.rect = { left: 87, top: 87, right: 113, bottom: 113 };
  overlay().fire("click", { target: overlay(), detail: 1, clientX: 100, clientY: 100 });
  assert.deepEqual(
    { pinned: face().pinned, idx: face().pressIdx },
    { pinned: true, idx: "2" },
    "the split click pins the town under the pointer",
  );
  lc.onDocClick({ target: overlay(), detail: 1, clientX: 100, clientY: 100 } as unknown as MouseEvent);
  assert.deepEqual(
    { shown: face().shown, pinned: face().pinned },
    { shown: true, pinned: true },
    "and the same click reaching the document is not a press on open chart",
  );
});
