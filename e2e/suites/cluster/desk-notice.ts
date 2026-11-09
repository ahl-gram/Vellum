import { makeSettle, makeStable, STILL_ONLY } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { bounce } from "../../support/nav.ts";

// The desk notice (Issue #761): a tablet at the 1024 floor lays the page out at scale 1 and never sees the Notice to Travellers, upright or level.
const KEY = "vellum.desk-notice.v1";
const PAGE = "/faq/";

type Notice = {
  ready: string;
  width: number;
  scale: number;
  narrow: boolean;
  key: string | null;
  shown: boolean;
  w: number;
  h: number;
  hitsButton: boolean;
  bodyPx: number;
  buttonPx: number;
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

export type DeskKit = ReturnType<typeof deskKit>;

export function deskKit(ctx: SuiteContext) {
  const { send, evaluate, PORT } = ctx;
  const settle = makeSettle(ctx);
  const open = async (path: string): Promise<void> => {
    await bounce(send, `http://127.0.0.1:${PORT}${path}`);
    await settle(`document.readyState`, (s) => s === "complete", `${path} loaded`);
  };
  const forget = async (): Promise<void> => {
    try {
      await open(PAGE);
      await evaluate(`localStorage.removeItem(${JSON.stringify(KEY)})`);
    } catch {}
  };
  return { ...ctx, settle, open, forget };
}

const readSettled = (k: DeskKit, label: string) =>
  makeStable(k.settle)(READ, label, { departed: STILL_ONLY.deskNotice });

export async function dnTablet(k: DeskKit): Promise<void> {
  const { check, setMobileViewport } = k;
  await setMobileViewport(1024, 768);
  await k.open(PAGE);
  const tablet = await readSettled(k, "the page on a tablet");
  check(
    "DN5 a tablet at the 1024 floor lays the page out at scale 1 and never sees the notice",
    tablet.scale === 1 && !tablet.shown && tablet.w === 0 && tablet.key === null,
    JSON.stringify(tablet),
  );
  await setMobileViewport(820, 1180);
  await k.open(PAGE);
  const upright = await readSettled(k, "the page on a tablet held upright");
  check(
    "DN5b a tablet held upright (emulated, no browser toolbar) shrinks the page to fit but stands over 1024 tall, so it never sees the notice: the shell reads the screen's height, not its width",
    upright.width === 1024 && upright.scale < 1 && !upright.shown && upright.w === 0 && upright.key === null,
    JSON.stringify(upright),
  );
}
