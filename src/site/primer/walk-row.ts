export function buildRow(doc: Document, _lesson: string, _siblings: readonly string[], _at: string, _sealed: ReadonlySet<string>, _first: boolean): HTMLElement {
  const row = doc.createElement("p");
  row.className = "walk";
  return row;
}

export function buildDone(doc: Document, _num: string, _act: string): HTMLElement {
  const line = doc.createElement("p");
  line.className = "walk-done";
  return line;
}
