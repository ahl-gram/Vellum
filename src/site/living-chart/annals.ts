// The chronicler's block of the one journal, appended AFTER the prologue rows in the same strip (#312). Lifted from ages.ts at the 2026-09-03 sitting (ruling 8).
import type { HistoricalEvent } from "../../society/history.ts";

export interface AnnalRow {
  li: HTMLLIElement;
  year: number;
  text: string;
}

export function buildAnnals(stripEl: HTMLElement, events: ReadonlyArray<HistoricalEvent>): AnnalRow[] {
  const rows: AnnalRow[] = [];
  if (events.length > 0) {
    const head = document.createElement("li");
    head.className = "annals-head";
    head.textContent = "Here follow the annals of these waters";
    stripEl.appendChild(head);
  }
  for (const [i, e] of events.entries()) {
    const li = document.createElement("li");
    const year = document.createElement("span");
    year.className = "cr-year";
    year.textContent = String(e.year);
    const text = document.createElement("span");
    text.className = "cr-text";
    if (i === 0 && e.text.length > 0) {
      const dc = document.createElement("span");
      dc.className = "cr-dc";
      dc.textContent = e.text[0]!;
      text.append(dc, document.createTextNode(e.text.slice(1)));
    } else {
      text.textContent = e.text; // textContent: event prose is plain text
    }
    li.append(year, text);
    stripEl.appendChild(li);
    rows.push({ li, year: e.year, text: e.text });
  }
  return rows;
}
