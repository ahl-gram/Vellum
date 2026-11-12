/** Records what was ASKED of it, not only what it ends up holding: removing a key and storing an empty string leave the same bytes behind and mean different things to the next arrival. */
export class FakeStore {
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

export const asStorage =
  (fake: FakeStore): (() => Storage) =>
  () =>
    fake;

export const shut: () => Storage = () => {
  throw new Error("storage is disabled in this browsing mode");
};
