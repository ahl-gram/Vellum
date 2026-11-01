import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";

export type Read = {
  readonly n: number;
  readonly seed: number | null;
  readonly refusal: string | null;
  readonly plate: boolean;
  readonly lettered: boolean;
  readonly svgSeed: string | null;
  readonly culture: string | null;
  readonly text: string | null;
  readonly outline: string | null;
  readonly field: boolean;
  readonly refusalText: string;
  readonly quiet: boolean;
  readonly verb: string;
  readonly status: string;
  readonly account: string;
  readonly hash: string;
};

const HOOK: Payload<number | null> = `window.__vellumWritingRoom ? window.__vellumWritingRoom().n : null`;

export const READ: Payload<Read> = `(() => {
  const st = window.__vellumWritingRoom ? window.__vellumWritingRoom() : { n: 0, seed: null, refusal: null, plate: false, lettered: false };
  const svg = document.querySelector("#map svg");
  const attr = (name) => (svg ? svg.getAttribute(name) : null);
  return {
    ...st,
    svgSeed: attr("data-vellum-seed"),
    culture: attr("data-vellum-culture"),
    text: attr("data-vellum-founding-text"),
    outline: attr("data-vellum-outline"),
    field: !!(svg && svg.querySelector("#layer-field")),
    refusalText: document.getElementById("wr-refusal").textContent,
    quiet: !!document.querySelector(".wr-quiet"),
    verb: document.getElementById("wr-plate-verb").textContent,
    status: document.getElementById("status").textContent,
    account: document.getElementById("wr-account").textContent,
    hash: location.hash,
  };
})()`;

const POLLS = 200;

async function press({ evaluate, send }: Pick<SuiteContext, "evaluate" | "send">, selector: string): Promise<void> {
  const at = await evaluate<{ x: number; y: number; hit: boolean }>(
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); const r = el.getBoundingClientRect(); const x = r.left + r.width / 2; const y = r.top + r.height / 2; const top = document.elementFromPoint(x, y); return { x, y, hit: !!top && (top === el || el.contains(top)) }; })()`,
  );
  if (!at.hit) throw new Error(`${selector} is covered at its own centre`);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: at.x,
    y: at.y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: at.x,
    y: at.y,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
}

export type WritingKit = ReturnType<typeof writingKit>;

export function writingKit(ctx: SuiteContext) {
  const { evaluate, send, sleep, PORT } = ctx;
  const read = () => evaluate(READ);

  const settle = makeSettle({ evaluate, sleep, tolerant: true });
  const settledAtLeast = async (n: number, label: string): Promise<void> => {
    await settle(HOOK, (d) => d >= n, `the Writing Room's settled count to reach ${n}: ${label}`, POLLS);
  };
  const settledAfter = async (n0: number, label: string): Promise<Read> => {
    await settledAtLeast(n0 + 1, label);
    return read();
  };

  // Bounce through about:blank (the Z13 idiom): a navigate to the tab's current URL is a no-op.
  const goto = async (hash: string): Promise<Read> => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/writing-room/${hash}` });
    await settle(`document.readyState`, (d) => d === "complete", `a complete document at ${hash}`, POLLS);
    await settledAtLeast(1, `its first founding at ${hash}`);
    return read();
  };

  // A marker on the old document, gone from the new one, so the hook's count is the reloaded page's own.
  const reload = async (): Promise<Read> => {
    await evaluate(`window.__wrBeforeReload = true`);
    await send("Page.reload");
    await settle(`window.__wrBeforeReload === undefined`, (d) => d === true, "a reloaded document", POLLS);
    await settledAtLeast(1, "its first founding after the reload");
    return read();
  };

  const statusStarts = async (prefix: string): Promise<void> => {
    await settle<string>(
      `document.getElementById("status").textContent`,
      (d) => d.startsWith(prefix),
      `the status line to start "${prefix}"`,
      POLLS,
    );
  };
  const blockUrls = (urls: string[]) => send("Network.setBlockedURLs", { urls });

  const pressAt = (selector: string) => press(ctx, selector);

  const setLine = (value: string) =>
    evaluate<boolean>(
      `(() => { document.getElementById("wr-line").value = ${JSON.stringify(value)}; return true; })()`,
    );

  return { ...ctx, read, goto, reload, settledAfter, pressAt, setLine, statusStarts, blockUrls };
}
