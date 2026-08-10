// The element shim for site modules that BUILD DOM (the reading frame, the room's
// colophon), extracted from test/site/reading-frame.test.ts when #318 gave it a second
// consumer. Node has no `document`; this stands in for the ENVIRONMENT only, never for
// the module under test: create / append / classify / attribute, and nothing else, so
// every assertion in a consuming test reads structure the real code produced.
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
