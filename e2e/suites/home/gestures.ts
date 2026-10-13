// Home's shelf plates under the hand (Issue #779 part 2h): flat at rest, tipped and raised under a real hover.
import { makeSettle } from "../../support/settle.ts";
import { makeStep } from "../../support/step.ts";
import { clearMetrics } from "../print-room/kit.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { HomeKit } from "./kit.ts";

type Plate = { x: number; y: number; r: number[]; t: string; anims: number; hover: boolean; reach: boolean } | null;
const PLATE: Payload<Plate> = `(() => { const p = document.querySelector(".lf-shelf-grid .plate"); if (!p) return null;
  const b = p.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, e = document.elementFromPoint(x, y);
  return { x, y, r: [b.left, b.top, b.width, b.height], t: getComputedStyle(p).transform, anims: p.getAnimations().length,
    hover: p.matches(":hover"), reach: !!e && (e === p || p.contains(e)) }; })()`;

const tipped = (m: string): boolean => {
  const v = /^matrix\(([^)]+)\)$/.exec(m)?.[1]?.split(", ").map(Number);
  return !!v && Math.abs(v[1]!) > 0.001 && v[5]! < 0;
};

export async function h21PlateTip(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep } = ctx;
  await clearMetrics(ctx, 640, 800);
  await makeSettle(ctx)(`innerWidth`, (w) => w === 1280, "home-gestures-wide");
  await send("Emulation.setEmulatedMedia", { features: [] });
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  await evaluate(
    `(() => { const p = document.querySelector(".lf-shelf-grid .plate"); if (p) p.scrollIntoView({ block: "center" }); return !!p; })()`,
  );
  let rest: Plate = null;
  let hovered: Plate = null;
  for (let i = 0; i < 40; i++) {
    const a = await evaluate(PLATE);
    await sleep(50);
    const b = await evaluate(PLATE);
    if (a && b && JSON.stringify(a.r) === JSON.stringify(b.r) && b.anims === 0 && !b.hover && b.reach) {
      rest = b;
      break;
    }
  }
  try {
    if (rest) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rest.x, y: rest.y });
    for (let i = 0; i < 30 && rest; i++) {
      hovered = await evaluate(PLATE);
      if (hovered && hovered.hover && hovered.anims === 0) break;
      await sleep(50);
    }
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
    await evaluate(`window.scrollTo(0, 0)`);
  }
  check(
    "H21 home's shelf plates rest flat and, under the hand, tip and rise",
    !!rest && rest.reach && rest.t === "none" && !!hovered && hovered.reach && tipped(hovered.t),
    JSON.stringify({ rest, hovered }),
  );
}

export async function homeGestures(ctx: SuiteContext, k: HomeKit): Promise<void> {
  const step = makeStep(k);
  await step("H21", () => h21PlateTip(ctx));
}
