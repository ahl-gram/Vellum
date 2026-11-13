import type { HandStep, SealWhen } from "./hand-steps.ts";

export function buildNote(doc: Document, _step: HandStep, _sealed: ReadonlySet<string>, _when: SealWhen): HTMLElement {
  return doc.createElement("aside");
}

export function markDone(_note: HTMLElement, _step: HandStep, _sealed: ReadonlySet<string>): void {}
