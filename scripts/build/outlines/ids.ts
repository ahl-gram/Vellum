export function serialId(value: unknown): string {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0)
    throw new RangeError(`a place needs Natural Earth's serial number, got ${JSON.stringify(value)}`);
  return `ne-${value}`;
}

export function refuseRepeats(ids: readonly string[], taken: ReadonlySet<string>): void {
  const used = new Set(taken);
  for (const id of ids) {
    if (used.has(id)) throw new RangeError(`two places share the ID ${id}`);
    used.add(id);
  }
}
