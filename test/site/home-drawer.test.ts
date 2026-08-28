import { test } from "node:test";
import assert from "node:assert/strict";
import { bindDrawer, type Listens } from "../../src/site/home/drawer.ts";

// Landfall Sub 6b (#480): the drawer's two script-only doors out, Escape and a tap on the scrim; the burger itself needs no script (the checkbox is the no-JS path).

type Handler = (e: Event) => void;
const fakeDoc = () => {
  const handlers = new Map<string, Handler>();
  const doc: Listens = { addEventListener: (type, fn) => handlers.set(type, fn) };
  const body = {};
  const fire = (type: string, detail: Record<string, unknown>) => {
    const fn = handlers.get(type);
    assert.ok(fn, `the drawer listens for ${type}`);
    fn({ type, ...detail } as unknown as Event);
  };
  return { doc, body, fire };
};

test("Escape closes an open drawer and leaves a closed one alone (#480)", () => {
  const { doc, fire } = fakeDoc();
  const reveal = { checked: true };
  bindDrawer(reveal, doc, {});
  fire("keydown", { key: "Enter" });
  assert.equal(reveal.checked, true, "an unrelated key changes nothing");
  fire("keydown", { key: "Escape" });
  assert.equal(reveal.checked, false, "Escape closes the drawer");
  fire("keydown", { key: "Escape" });
  assert.equal(reveal.checked, false, "a second Escape never re-opens it");
});

test("a click that lands on the body (the scrim is body::after) closes the drawer; a click on anything else does not (#480)", () => {
  const { doc, body, fire } = fakeDoc();
  const reveal = { checked: true };
  bindDrawer(reveal, doc, body);
  fire("click", { target: { not: "body" } });
  assert.equal(reveal.checked, true, "a click inside the drawer or on the burger is not a close");
  fire("click", { target: body });
  assert.equal(reveal.checked, false, "a click on the scrim closes the drawer");
});
