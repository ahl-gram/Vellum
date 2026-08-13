// DOM element shim for site modules that build DOM: environment only, never the module under test.
// Queries deliberately answer "nothing here", true of an undrawn mount; never grow this into a selector engine.
// Lives outside test/ so node --test does not collect it as a phantom 0-test file.

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

  // id reflects to the ATTRIBUTE so the no-ids guard can see a stray el.id assignment.
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
    // Namespace discarded: nothing under test reads it back.
    createElementNS: (_ns: string, tag: string) => new El(tag),
    createTextNode: (t: string) => {
      const n = new El("#text");
      n.textContent = String(t);
      return n;
    },
  };
};

export function walk(el: El, seen: El[] = []): El[] {
  seen.push(el);
  for (const c of el.children) walk(c, seen);
  return seen;
}
