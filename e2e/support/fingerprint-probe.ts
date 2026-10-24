import type { Payload, SuiteContext } from "../types.ts";
import { NUMERO_GLYPH, NUMERO_TEXT, unreadBrowser } from "./fingerprint.ts";
import type { BrowserFacts } from "./fingerprint.ts";

export type ProbeContext = Pick<SuiteContext, "evaluate" | "send" | "sleep">;
export type Measured = { readonly numeroWidth: number; readonly selectHeight: number } | { readonly missing: string };

// Swept 2026-10-24 over eight fresh launches on the Mac: the harness page ready in 59 to 111 ms and the whole probe within 134 ms, so 5 s is about 37 times the slowest, left for CI's slower runner; past it the line prints unread.
export const FINGERPRINT_BOUND_MS = 5_000;
export const READY_POLL_MS = 50;
export const PROBE_BOX_ID = "fingerprint-probe";
export const NUMERO_ID = "fingerprint-numero";
export const GLYPH_ID = "fingerprint-glyph";
export const GLYPH_SELECTOR = `#${GLYPH_ID}`;

export const READY_PAYLOAD = `document.readyState === "complete" && location.protocol === "http:"` as Payload<boolean>;

// A room's folio select stands at the height a select set in `--font-serif-fallback` in `src/styles/shared/fonts.css` takes (34.22 px against 33.22 px in EB Garamond on the Mac, measured 2026-10-24), so the probe's row sets those faces to read the height the rooms' selects stand at.
export const MEASURE_PAYLOAD = `(async () => {
  const title = document.getElementById("folio-title");
  if (title === null) return { missing: "#folio-title" };
  const fallback = getComputedStyle(document.documentElement).getPropertyValue("--font-serif-fallback").trim();
  if (fallback === "") return { missing: "--font-serif-fallback" };
  const t = getComputedStyle(title);
  await document.fonts.load(t.fontStyle + " " + t.fontWeight + " " + t.fontSize + " " + t.fontFamily, ${JSON.stringify(NUMERO_TEXT)});
  const box = document.createElement("div");
  box.id = ${JSON.stringify(PROBE_BOX_ID)};
  box.setAttribute("aria-hidden", "true");
  box.style.cssText = "position:fixed;left:0;top:0;visibility:hidden;pointer-events:none";
  const line = (id, text) => {
    const s = document.createElement("span");
    s.id = id;
    s.textContent = text;
    s.style.whiteSpace = "nowrap";
    s.style.fontFamily = t.fontFamily;
    s.style.fontSize = t.fontSize;
    s.style.fontStyle = t.fontStyle;
    s.style.fontWeight = t.fontWeight;
    s.style.letterSpacing = t.letterSpacing;
    const p = document.createElement("p");
    p.appendChild(s);
    box.appendChild(p);
    return s;
  };
  const numero = line(${JSON.stringify(NUMERO_ID)}, ${JSON.stringify(NUMERO_TEXT)});
  line(${JSON.stringify(GLYPH_ID)}, ${JSON.stringify(NUMERO_GLYPH)});
  const row = document.createElement("div");
  row.className = "folio-controls";
  row.style.fontFamily = fallback;
  const select = document.createElement("select");
  select.className = "control";
  select.appendChild(new Option("antique"));
  row.appendChild(select);
  box.appendChild(row);
  document.body.appendChild(box);
  return { numeroWidth: numero.getBoundingClientRect().width, selectHeight: select.getBoundingClientRect().height };
})()` as Payload<Measured>;

export const REMOVE_PAYLOAD =
  `(() => { const box = document.getElementById(${JSON.stringify(PROBE_BOX_ID)}); if (box !== null) box.remove(); return true; })()` as Payload<boolean>;

export const readBrowserFacts = (ctx: ProbeContext): Promise<BrowserFacts> => {
  void ctx;
  return Promise.resolve(unreadBrowser("stub"));
};
