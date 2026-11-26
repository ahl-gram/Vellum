// The browser reads a page's address for its own jump to it just after DOMContentLoaded (measured in Chrome 158 and Brave 158, Issue #1392), so the Primer holds its address out of the window's location from its landing until a task after it.
export interface AddressWindow {
  readonly location: { readonly pathname: string; readonly search: string; readonly hash: string };
  readonly history: { readonly state: unknown; replaceState(data: unknown, unused: string, url: string): void };
  setTimeout(run: () => void, ms: number): unknown;
}

export interface AddressDocument {
  addEventListener(type: "DOMContentLoaded", run: () => void, options: AddEventListenerOptions): void;
}

export function holdAddress(win: AddressWindow, doc: AddressDocument): void {
  const { pathname, search, hash } = win.location;
  if (hash === "") return;
  win.history.replaceState(win.history.state, "", pathname + search);
  doc.addEventListener(
    "DOMContentLoaded",
    () =>
      win.setTimeout(() => {
        if (win.location.hash === "") win.history.replaceState(win.history.state, "", pathname + search + hash);
      }, 0),
    { once: true },
  );
}
