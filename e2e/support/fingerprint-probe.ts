import type { Payload, SuiteContext } from "../types.ts";
import { NUMERO_GLYPH, NUMERO_TEXT, unreadBrowser } from "./fingerprint.ts";
import type { BrowserFacts } from "./fingerprint.ts";
import { errorText } from "./suites.ts";

export type ProbeContext = Pick<SuiteContext, "evaluate" | "send" | "sleep">;
export type Measured = { readonly numeroWidth: number; readonly selectHeight: number } | { readonly missing: string };

// Swept 2026-10-24: on the Mac the probe within 134 ms over eight fresh launches and the hand-back within about 40 ms; on CI run 40133750844's four lanes printed the line 1.82 to 2.10 s after their browser came up, a span holding the probe and the launch's tail, so 5 s is at least 2.4 times CI's slowest.
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

const versionOf = (ctx: ProbeContext): Promise<string | null> =>
  ctx.send<{ product: string }>("Browser.getVersion").then(
    (v) => v.product,
    () => null,
  );

async function pageReady(ctx: ProbeContext, signal: AbortSignal): Promise<void> {
  for (;;) {
    const ready = await ctx.evaluate(READY_PAYLOAD).catch(() => false);
    signal.throwIfAborted();
    if (ready) return;
    await ctx.sleep(READY_POLL_MS);
  }
}

async function faceOf(ctx: ProbeContext): Promise<string | null> {
  const doc = await ctx.send<{ root: { nodeId: number } }>("DOM.getDocument", { depth: 0 });
  const { nodeId } = await ctx.send<{ nodeId: number }>("DOM.querySelector", {
    nodeId: doc.root.nodeId,
    selector: GLYPH_SELECTOR,
  });
  await ctx.send("CSS.enable");
  try {
    const { fonts } = await ctx.send<{ fonts: readonly { familyName: string }[] }>("CSS.getPlatformFontsForNode", {
      nodeId,
    });
    return fonts.length === 0 ? null : fonts.map((f) => f.familyName).join(" + ");
  } finally {
    await ctx.send("CSS.disable");
  }
}

async function probePage(ctx: ProbeContext, signal: AbortSignal): Promise<BrowserFacts> {
  const product = await versionOf(ctx);
  try {
    await pageReady(ctx, signal);
    const measured = await ctx.evaluate(MEASURE_PAYLOAD, true);
    if ("missing" in measured) return { ...unreadBrowser(`no ${measured.missing} on the page`), product };
    signal.throwIfAborted();
    const face = await faceOf(ctx).then(
      (name) => ({ name, unread: null }),
      (failure: unknown) => ({ name: null, unread: errorText(failure) }),
    );
    const { numeroWidth, selectHeight } = measured;
    return { product, numeroWidth, numeroFace: face.name, selectHeight, unread: face.unread };
  } catch (failure) {
    return { ...unreadBrowser(errorText(failure)), product };
  } finally {
    await ctx.evaluate(REMOVE_PAYLOAD).catch(() => false);
  }
}

async function boundedProbe(ctx: ProbeContext): Promise<BrowserFacts> {
  const stop = new AbortController();
  let timer: NodeJS.Timeout | undefined;
  const gaveUp = new Promise<BrowserFacts>((settle) => {
    timer = setTimeout(() => {
      const reason = `the browser gave no answer within ${FINGERPRINT_BOUND_MS} ms`;
      stop.abort(new Error(reason));
      settle(unreadBrowser(reason));
    }, FINGERPRINT_BOUND_MS);
  });
  try {
    return await Promise.race([probePage(ctx, stop.signal), gaveUp]);
  } finally {
    clearTimeout(timer);
  }
}

async function handBack(ctx: ProbeContext, page: string, signal: AbortSignal): Promise<void> {
  await ctx.send("Page.navigate", { url: "about:blank" });
  signal.throwIfAborted();
  await ctx.send("Page.navigate", { url: page });
}

async function handedBack(ctx: ProbeContext, page: string, facts: BrowserFacts): Promise<BrowserFacts> {
  const stop = new AbortController();
  let timer: NodeJS.Timeout | undefined;
  const gaveUp = new Promise<string>((settle) => {
    timer = setTimeout(() => {
      const reason = `the page was not handed back within ${FINGERPRINT_BOUND_MS} ms`;
      stop.abort(new Error(reason));
      settle(reason);
    }, FINGERPRINT_BOUND_MS);
  });
  try {
    const failed = await Promise.race([
      handBack(ctx, page, stop.signal).then(
        () => null,
        (failure: unknown) => `the page was not handed back: ${errorText(failure)}`,
      ),
      gaveUp,
    ]);
    return failed === null ? facts : { ...facts, unread: failed };
  } finally {
    clearTimeout(timer);
  }
}

export async function readBrowserFacts(ctx: ProbeContext, page: string): Promise<BrowserFacts> {
  return handedBack(ctx, page, await boundedProbe(ctx));
}
