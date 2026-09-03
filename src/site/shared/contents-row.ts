// The kit's contents row (#487 item 3, lifted at #504 from the Print Room's contents, the Prospect's key and the Ribbon's itinerary): a numeral in .cr-num beside its text in .cr-text, the pair public/atelier.css dresses under .contents. One shape in two faces, a string for the Print Room (whose contents unit-test in Node) and nodes for the rooms; the host owns the <li>, which carries its own state (on, the row's kind, the plates, the lean).
export type RowPart = string | HTMLElement;

export const contentsRowHtml = (num: string, textHtml: string): string =>
  `<span class="cr-num">${num}</span><span class="cr-text">${textHtml}</span>`;

export function contentsRow(num: string, parts: readonly RowPart[]): readonly [HTMLSpanElement, HTMLSpanElement] {
  const n = document.createElement("span");
  n.className = "cr-num";
  n.textContent = num;
  const t = document.createElement("span");
  t.className = "cr-text";
  for (const p of parts) t.append(typeof p === "string" ? document.createTextNode(p) : p);
  return [n, t];
}
