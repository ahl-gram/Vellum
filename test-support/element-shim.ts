// The element shim for site modules that BUILD DOM (the reading frame, the room's
// colophon, and since #319 the living chart's overlays), extracted from
// test/site/reading-frame.test.ts when #318 gave it a second consumer. Node has no
// `document`; this stands in for the ENVIRONMENT only, never for the module under test:
// create / append / classify / attribute / position / listen, and nothing else, so every
// assertion in a consuming test reads structure the real code produced.
//
// #319 widened it by exactly what the place overlay and the voyage session build needs:
// `createElementNS` (the overlay svg, its polyline, the two marks), `style` and `dataset`
// (the hit-targets are positioned by manifest fractions), and `addEventListener` (the
// hits wire hover/focus/click, which this records rather than dispatches).
//
// It also answers queries, and the shape of that answer is deliberate: `querySelector`
// returns null and `querySelectorAll` returns empty, which is EXACTLY true of a mount
// nothing has drawn into yet. This is not a selector engine and must never grow into one:
// a hand-rolled `:scope >` matcher would be checked by nothing, so a subtly wrong one
// would make a caller's stale-node removal silently no-op while its test still passed.
// Consuming tests therefore assert on the nodes the code CREATED, never on what a query
// found.
//
// Lives in test-support/ (not test/) because `node --test` with no path arg collects
// every file under test/, and a bare helper module there would run as a phantom
// 0-subtest "pass".

export class El {
  tagName: string;
  children: El[] = [];
  parentNode: El | null = null;
  attrs = new Map<string, string>();
  classes = new Set<string>();
  hidden = false;
  value = "";
  min = "";
  max = "";
  step = "";
  type = "";
  /** Inline positioning only. A plain bag: nothing here resolves or cascades. */
  style: Record<string, string> = {};
  dataset: Record<string, string> = {};
  /** Recorded, never dispatched: the wiring is the assertion, not the behaviour. */
  listeners: string[] = [];
  #text = "";

  constructor(tag: string) {
    this.tagName = tag.toUpperCase();
  }

  // `id` reflects to the ATTRIBUTE, not a plain field: the no-ids guard reads attrs,
  // so a stray `el.id = "map"` has to land where the guard can see it.
  get id(): string { return this.attrs.get("id") ?? ""; }
  set id(v: string) { this.attrs.set("id", String(v)); }
  get className(): string { return [...this.classes].join(" "); }
  set className(v: string) { this.classes = new Set(v.split(/\s+/).filter(Boolean)); }
  get classList() {
    const set = this.classes;
    const toggle = (c: string, on?: boolean): boolean => {
      const want = on ?? !set.has(c);
      if (want) set.add(c);
      else set.delete(c);
      return want;
    };
    return {
      add: (...c: string[]) => c.forEach((x) => set.add(x)),
      remove: (...c: string[]) => c.forEach((x) => set.delete(x)),
      contains: (c: string) => set.has(c),
      toggle,
    };
  }
  get textContent(): string {
    return this.children.length ? this.children.map((c) => c.textContent).join("") : this.#text;
  }
  set textContent(v: string) {
    this.children = [];
    this.#text = String(v);
  }
  get parentElement(): El | null { return this.parentNode; }
  #adopt(kids: El[]): void {
    for (const k of kids) k.parentNode = this;
  }
  append(...kids: El[]): void {
    this.#adopt(kids);
    this.children.push(...kids);
  }
  appendChild(kid: El): El {
    this.#adopt([kid]);
    this.children.push(kid);
    return kid;
  }
  replaceChildren(...kids: El[]): void {
    for (const c of this.children) c.parentNode = null;
    this.#adopt(kids);
    this.children = [...kids];
  }
  setAttribute(name: string, v: string): void { this.attrs.set(name, String(v)); }
  getAttribute(name: string): string | null { return this.attrs.get(name) ?? null; }
  removeAttribute(name: string): void { this.attrs.delete(name); }
  addEventListener(type: string): void { this.listeners.push(type); }
  // "Nothing is here", which is true of an undrawn mount. See the header: not a matcher.
  querySelector(): El | null { return null; }
  querySelectorAll(): El[] { return []; }
  remove(): void {
    const p = this.parentNode;
    if (!p) return;
    p.children = p.children.filter((c) => c !== this);
    this.parentNode = null;
  }
}

export const installShim = (): void => {
  (globalThis as { document?: unknown }).document = {
    createElement: (tag: string) => new El(tag),
    // #319: the voyage overlay's svg, its track polyline, and the ship/rider marks. The
    // namespace is discarded: nothing under test reads it back, and an El that remembered
    // it would invite assertions on the shim instead of on the code.
    createElementNS: (_ns: string, tag: string) => new El(tag),
    // #312: the engine's log builder wraps the drop-cap initial beside a plain text
    // node. A text node is an El with no children, so textContent aggregation and
    // shape() need nothing new.
    createTextNode: (t: string) => {
      const n = new El("#text");
      n.textContent = String(t);
      return n;
    },
  };
};

/** Depth-first walk of a shim tree. */
export function walk(el: El, seen: El[] = []): El[] {
  seen.push(el);
  for (const c of el.children) walk(c, seen);
  return seen;
}
