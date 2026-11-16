import { checkEdit } from "./edit-checks.ts";
import { gateText, rememberGate, shownGates } from "./gate-state.ts";
import type { Delivery, HookRequest, Note, Verdict } from "./request.ts";
import { checkBash } from "./shell-checks.ts";

export const evaluate = async (request: HookRequest): Promise<Verdict> => {
  const shown = new Set(shownGates(request.sessionKey ?? ""));
  const notes: Note[] = [];
  for (const operation of request.operations) {
    const result =
      operation.kind === "shell" ? await checkBash(operation, request, shown) : await checkEdit(operation, shown);
    if (result.denial !== null) return { denial: result.denial, notes: [] };
    for (const note of result.notes) {
      if (note.kind === "gate") shown.add(note.gate.key);
      notes.push(note);
    }
  }
  return { denial: null, notes };
};

export const deliver = (request: HookRequest, verdict: Verdict): Delivery => {
  if (verdict.denial !== null) return { kind: "deny", reason: verdict.denial };
  const texts = verdict.notes.flatMap((note): string[] => {
    if (note.kind === "warning") return [note.text];
    const body = gateText(request.policyRoot, note.gate.label);
    if (!body) return [];
    rememberGate(request.sessionKey ?? "", note.gate.key);
    return [`${note.gate.lead} Run this gate before you type; the full skill is \`vellum-footguns\`.\n\n${body}`];
  });
  return texts.length ? { kind: "context", text: texts.join("\n\n") } : null;
};
