export interface Reveal {
  checked: boolean;
}

export interface Listens {
  addEventListener(type: string, listener: (e: Event) => void): void;
}

export function bindDrawer(reveal: Reveal, doc: Listens, body: object): void {
  doc.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Escape" && reveal.checked) reveal.checked = false;
  });
  doc.addEventListener("click", (e) => {
    if (reveal.checked && e.target === body) reveal.checked = false;
  });
}
