// The Glass's out press in a room the kit's key binder binds (Issue #779 part 2h).
import { pressAt } from "../print-room/kit.ts";
import { LENS, homeCamera, type Lens } from "../print-room/print.ts";
import type { Payload } from "../../types.ts";
import type { SpecimenKit } from "./kit.ts";

type At = { x: number; y: number; hit: string | null } | null;
const AT = (id: string): Payload<At> =>
  `(() => { const b = document.getElementById(${JSON.stringify(id)}); if (!b) return null;
  const r = b.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2, e = document.elementFromPoint(x, y);
  return { x, y, hit: e ? e.id || e.tagName : null }; })()`;

// A glide has rested when two reads 100ms apart agree on a matrix that has left `from`; a press that goes nowhere is taken as it stands after about a second, so it reads as a fault and not a stop. The camera's own `zoomed` flag is no reader of the way home: a glide that rests at 1 can leave a translation of -2.8e-14, which the controller's strict isHome refuses (measured 2026-10-13 on the Specimen), so the matrix's scale is what reads home.
async function glided(k: SpecimenKit, from: string): Promise<Lens> {
  let last = await k.evaluate(LENS);
  for (let i = 0; i < 60; i++) {
    await k.sleep(100);
    const d = await k.evaluate(LENS);
    if (d.t === last.t && (d.t !== from || i >= 12)) return d;
    last = d;
  }
  throw new Error(`settle timeout specimen-glass-glide: ${JSON.stringify(last)}`);
}

export async function sb15OutPress(k: SpecimenKit): Promise<void> {
  const { evaluate, send, check, setState } = k;
  const read0: { before: Lens | null; leaned: Lens | null; back: Lens | null; inAt: At; outAt: At } = {
    before: null,
    leaned: null,
    back: null,
    inAt: null,
    outAt: null,
  };
  try {
    await send("Emulation.setEmulatedMedia", { features: [] });
    read0.before = await evaluate(LENS);
    read0.inAt = await evaluate(AT("zoom-in"));
    if (read0.inAt) await pressAt({ send }, read0.inAt.x, read0.inAt.y);
    read0.leaned = await glided(k, read0.before.t);
    read0.outAt = await evaluate(AT("zoom-out"));
    if (read0.outAt) await pressAt({ send }, read0.outAt.x, read0.outAt.y);
    read0.back = await glided(k, read0.leaned.t);
  } finally {
    await setState("rest");
    await homeCamera(k);
  }
  const { before, leaned, back, inAt, outAt } = read0;
  check(
    "SB15 the Glass's out press answers a real press in a room the kit's key binder binds",
    !before.zoomed &&
      before.k === 1 &&
      !!inAt &&
      inAt.hit === "zoom-in" &&
      leaned.zoomed &&
      Math.abs(leaned.k - 1.4) < 0.01 &&
      !!outAt &&
      outAt.hit === "zoom-out" &&
      Math.abs(back.k - 1) < 1e-6,
    JSON.stringify({ before, inAt, leaned, outAt, back }),
  );
}
