// DOM element shim for site modules that build DOM: environment only, never the module under test.
// Queries deliberately answer "nothing here", true of an undrawn mount; never grow this into a selector engine.
// Lives outside test/ so node --test does not collect it as a phantom 0-test file.

/** An inline style bag that also answers setProperty/getPropertyValue, which is how the engine writes its custom properties. */
function styleBag() {
  const bag: Record<string, string> = {};
  return Object.assign(bag, {
    setProperty: (name: string, value: string): void => { bag[name] = String(value); },
    getPropertyValue: (name: string): string => bag[name] ?? "",
  });
}

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
  /** Inline positioning only, custom properties included. A plain bag: nothing here resolves or cascades. */
  style = styleBag();
  dataset: Record<string, string> = {};
  /** Recorded for the wiring assertions; `handlers` below is what lets a test FIRE one. */
  listeners: string[] = [];
  handlers = new Map<string, ((e?: unknown) => void)[]>();
  /** What getBoundingClientRect answers. The shim does no layout, so a test that measures must say what it is measuring. */
  rect: { left: number; top: number; right: number; bottom: number } = { left: 0, top: 0, right: 0, bottom: 0 };
  #text = "";

  constructor(tag: string) {
    this.tagName = tag.toUpperCase();
  }

  getBoundingClientRect() {
    return { ...this.rect, width: this.rect.right - this.rect.left, height: this.rect.bottom - this.rect.top };
  }

  /** Fire every handler registered for `type` on THIS element. No bubbling: nothing under test depends on it. */
  fire(type: string, e?: unknown): void {
    for (const h of this.handlers.get(type) ?? []) h(e);
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
  addEventListener(type: string, handler?: (e?: unknown) => void): void {
    this.listeners.push(type);
    if (handler) this.handlers.set(type, [...(this.handlers.get(type) ?? []), handler]);
  }
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
