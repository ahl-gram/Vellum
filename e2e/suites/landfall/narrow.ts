import { buttonPoint } from "../../support/home.ts";
import type { StageKit } from "./kit.ts";

export async function narrowClosed({ evaluate, sleep, pressKey }: StageKit): Promise<void> {
  await pressKey("Escape", "Escape", 27);
  for (let i = 0; i < 80; i++) {
    const anyOpen = await evaluate<boolean>(`[...document.querySelectorAll(".lf-card")].some((c) => !c.hidden)`);
    if (anyOpen === false) break;
    await sleep(75);
  }
}

export async function narrowAtTop({ evaluate, sleep, scrollY }: StageKit): Promise<void> {
  for (let i = 0; i < 20; i++) {
    await evaluate(`window.scrollTo(0, 0)`);
    await sleep(75);
    if ((await scrollY()) === 0) break;
  }
}

export async function narrowReachable({ evaluate, sleep, clickAt }: StageKit, id: string) {
  const homePt = await evaluate(buttonPoint("#zoom-reset"));
  if (homePt !== null) await clickAt(Math.round(homePt.x), Math.round(homePt.y));
  let reachable = false;
  for (let i = 0; i < 80; i++) {
    try {
      reachable = await evaluate<boolean>(`(() => {
                const btn = document.querySelector('.lf-station[data-station="${id}"]');
                if (!btn) return false;
                const r = btn.getBoundingClientRect();
                if (r.width === 0 || r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight) return false;
                const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
                return hit === btn || btn.contains(hit);
              })()`);
    } catch {}
    if (reachable === true) break;
    await sleep(75);
  }
  return reachable;
}
