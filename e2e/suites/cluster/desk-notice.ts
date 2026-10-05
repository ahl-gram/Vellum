import { dropExpectedCancellations } from "../../support/console.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";

// The desk notice (Issue #761): a phone shrinks the fixed 1024 page and sees the Notice to Travellers, a tablet at 1024 and a narrow desktop window never do, and Continue anyway is remembered.
const KEY = "vellum.desk-notice.v1";
const PAGE = "/faq/";
const ELSEWHERE = "/glossary/";

type Notice = {
  ready: string; width: number; scale: number; narrow: boolean; key: string | null;
  shown: boolean; w: number; h: number; hitsButton: boolean; bodyPx: number; buttonPx: number;
  tap: { x: number; y: number };
};

const READ: Payload<Notice> = `(() => {
  const n = document.querySelector(".desk-notice");
  const r = n.getBoundingClientRect();
  const b = n.querySelector("button").getBoundingClientRect();
  const vv = visualViewport;
  const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  let key = null;
  try { key = localStorage.getItem(${JSON.stringify(KEY)}); } catch { key = "unreadable"; }
  return { ready: document.readyState, width: document.documentElement.clientWidth, scale: vv.scale, narrow: matchMedia("(max-width: 900px)").matches, key,
    shown: n.classList.contains("on"), w: r.width, h: r.height, hitsButton: document.elementFromPoint(cx, cy) === n.querySelector("button"),
    bodyPx: parseFloat(getComputedStyle(n.querySelector(".dn-body")).fontSize) * vv.scale, buttonPx: b.height * vv.scale,
    tap: { x: Math.round(cx - vv.offsetLeft), y: Math.round(cy - vv.offsetTop) } };
})()`;

export type DeskKit = SuiteContext & { settle: ReturnType<typeof makeSettle>; open: (path: string) => Promise<void>; forget: () => Promise<void> };

export function deskKit(ctx: SuiteContext): DeskKit {
  const { send, evaluate, PORT } = ctx;
  const settle = makeSettle(ctx);
  const open = async (path: string): Promise<void> => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${path}` });
    await settle(`document.readyState`, (s) => s === "complete", `${path} loaded`);
  };
  const forget = async (): Promise<void> => {
    try {
      await open(PAGE);
      await evaluate(`localStorage.removeItem(${JSON.stringify(KEY)})`);
    } catch { /* the next check reads the key and says so */ }
  };
  return { ...ctx, settle, open, forget };
}

const readSettled = (k: DeskKit, label: string) => k.settle(READ, (d) => d.ready === "complete", label);

export async function dnPhone(k: DeskKit): Promise<void> {
  const { check, send, setMobileViewport } = k;
  await setMobileViewport(390, 844);
  await k.forget();
  await k.open(PAGE);
  const phone = await readSettled(k, "the page on a phone");
  check("DN1 a phone lays the page out at the fixed 1024 and shrinks it to fit: no narrow rule applies", phone.width === 1024 && phone.scale < 1 && !phone.narrow, JSON.stringify(phone));
  check("DN2 the Notice to Travellers shows on a phone, its button reachable where it stands", phone.shown && phone.w > 0 && phone.hitsButton && phone.key === null, JSON.stringify(phone));
  check("DN3 it reads at its own size on the phone's screen: body text 16 on-screen pixels, a button over the house's 24px thumb floor", phone.bodyPx >= 15.9 && phone.buttonPx >= 24, JSON.stringify({ bodyPx: phone.bodyPx, buttonPx: phone.buttonPx }));
  const paper = await printedWidth(k);
  const screen = await readSettled(k, "the page back on screen");
  check("DN9 the notice prints as nothing (print is paper), and the same run's screen read shows it", paper === 0 && screen.w > 0, JSON.stringify({ paper, screen: screen.w }));
  await send("Emulation.setDeviceMetricsOverride", { width: 844, height: 390, deviceScaleFactor: 1, mobile: true });
  const turned = await k.settle(READ, (d, last) => Math.abs(d.scale - phone.scale) > 0.1 && last !== null && last.scale === d.scale && last.bodyPx === d.bodyPx, "the phone turned");
  check("DN3r turned sideways with no reload, the notice re-fits: its text still reads at 16 on-screen pixels", turned.bodyPx >= 15.9 && turned.bodyPx <= 16.1, JSON.stringify({ before: phone.scale, after: turned.scale, bodyPx: turned.bodyPx }));
}

async function printedWidth({ send, evaluate }: DeskKit): Promise<number> {
  await send("Emulation.setEmulatedMedia", { media: "print" });
  try {
    return await evaluate<number>(`document.querySelector(".desk-notice").getBoundingClientRect().width`);
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "", features: [] });
  }
}

export async function dnTablet(k: DeskKit): Promise<void> {
  const { check, setMobileViewport } = k;
  await setMobileViewport(1024, 768);
  await k.open(PAGE);
  const tablet = await readSettled(k, "the page on a tablet");
  check("DN5 a tablet at the 1024 floor lays the page out at scale 1 and never sees the notice", tablet.scale === 1 && !tablet.shown && tablet.w === 0 && tablet.key === null, JSON.stringify(tablet));
}

export async function dnNarrow(k: DeskKit): Promise<void> {
  const { check, setNarrowViewport } = k;
  await setNarrowViewport(390, 844);
  await k.open(PAGE);
  const narrow = await readSettled(k, "the page in a narrow desktop window");
  check("DN6 a desktop window narrowed to 390, a touchscreen's included, keeps its narrow layout and never sees the notice", narrow.narrow && narrow.scale === 1 && !narrow.shown && narrow.w === 0 && narrow.key === null, JSON.stringify(narrow));
}

export type Refusal = { arm: () => Promise<void>; disarm: () => Promise<void> };

export function storageRefusal({ send }: SuiteContext): Refusal {
  let id: string | null = null;
  const arm = async (): Promise<void> => {
    const r = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: `Storage.prototype.getItem = () => { throw new DOMException("refused", "SecurityError"); }; Storage.prototype.setItem = () => { throw new DOMException("refused", "QuotaExceededError"); };` });
    id = r.identifier;
  };
  const disarm = async (): Promise<void> => {
    if (id === null) return;
    try { await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: id }); } catch { /* the browser has gone */ }
    id = null;
  };
  return { arm, disarm };
}

export async function dnRefused(k: DeskKit, refusal: Refusal): Promise<void> {
  const { check, setMobileViewport, consoleErrors } = k;
  await setMobileViewport(390, 844);
  await refusal.arm();
  const errors = consoleErrors.length;
  await k.open(PAGE);
  const refused = await readSettled(k, "the page with storage refused");
  const logged = dropExpectedCancellations(consoleErrors.slice(errors));
  check("DN7 with storage refused the page still boots and shows the notice, and nothing reaches the console", refused.shown && refused.key === "unreadable" && logged.length === 0, JSON.stringify({ refused, logged }));
}

export async function dnContinue(k: DeskKit): Promise<void> {
  const { check, touch, setMobileViewport } = k;
  await setMobileViewport(390, 844);
  await k.forget();
  await k.open(PAGE);
  const before = await readSettled(k, "the page before the tap");
  await touch("touchStart", [{ x: before.tap.x, y: before.tap.y, id: 0 }]);
  await touch("touchEnd", []);
  const after = await k.settle(READ, (d) => !d.shown || d.key !== null, "the tap handled");
  await k.open(ELSEWHERE);
  const next = await readSettled(k, "the next page after Continue anyway");
  check("DN4 a real tap on Continue anyway hides the notice and remembers it: the next page does not show it", after.w === 0 && after.key === "1" && !next.shown && next.key === "1", JSON.stringify({ tap: before.tap, after: { w: after.w, key: after.key }, next: { shown: next.shown, key: next.key } }));
}
