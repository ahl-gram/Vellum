import { escapeScan } from "./escape-scan.ts";
import { dueGate, ROSTER_NEW_FILE, TEST_HELPER, UNIT_TEST } from "./gate-routes.ts";
import type { FileChange, Note, Verdict } from "./request.ts";

const BROWSER_SCRIPT = /(^|\/)(scripts|out|e2e)\/.*\.(mjs|ts)$/;

const CLICK_WARNING =
  "`.click()` ignores pointer-events and everything painted over the target (#520, #545, #546). A gesture check drives with " +
  "sendClick/touch at the element's own rect and asserts elementFromPoint; keep `.click()` for wiring only, with the reason at the check.";

const scan = async (
  texts: readonly string[],
  path: string,
): Promise<{ readonly denial: string | null; readonly note: string | null }> => {
  let note: string | null = null;
  for (const text of texts) {
    const found = await escapeScan(text, path);
    if (found.denial !== null) return found;
    note ??= found.note;
  }
  return { denial: null, note };
};

export const checkEdit = async (change: FileChange, shown: ReadonlySet<string>): Promise<Verdict> => {
  if (change.kind === "delete") return { denial: null, notes: [] };
  const { path, texts } = change;
  const moving = change.kind === "move" ? `You are about to move ${change.from} to ${path}.` : null;
  const notes: Note[] = [];

  if (BROWSER_SCRIPT.test(path)) {
    const { denial, note } = await scan(texts, path);
    if (denial !== null) return { denial, notes: [] };
    if (note !== null) notes.push({ kind: "warning", text: note });
    if (texts.some((text) => text.includes(".click()"))) notes.push({ kind: "warning", text: CLICK_WARNING });
  }
  if (
    change.kind !== "update" &&
    ROSTER_NEW_FILE.test(path) &&
    !UNIT_TEST.test(path) &&
    !TEST_HELPER.test(path) &&
    !shown.has("roster")
  ) {
    notes.push({
      kind: "gate",
      gate: { key: "roster", label: "Gate 4", lead: moving ?? `You are about to create ${path}.` },
    });
  }
  const due = dueGate(path, shown);
  if (due)
    notes.push({
      kind: "gate",
      gate: { key: due[0], label: due[1], lead: moving ?? `You are about to edit ${path}.` },
    });
  return { denial: null, notes };
};
