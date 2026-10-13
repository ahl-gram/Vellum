// The Glass's out press in a room the kit's key binder binds (Issue #779 part 2h).
import { pressAt } from "../print-room/kit.ts";
import type { Payload } from "../../types.ts";
import type { SpecimenKit } from "./kit.ts";
import type { Specimen } from "./reads.ts";

type At = { x: number; y: number; hit: string | null } | null;
const AT = (id: string): Payload<At> =>
  `(() => { const b = document.getElementById(${JSON.stringify(id)}); if (!b) return null;
  const r = b.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2, e = document.elementFromPoint(x, y);
  return { x, y, hit: e ? e.id || e.tagName : null }; })()`;

const zoomed = (s: Specimen): boolean | null => (s.st ? s.st.zoomed : null);

export async function sb15OutPress(k: SpecimenKit): Promise<void> {
  const { evaluate, send, check, setState, read, sleep } = k;
  const settle = async (want: boolean, tries: number): Promise<Specimen> => {
    let last = await read();
    for (let i = 0; i < tries; i++) {
      if (zoomed(last) === want) return last;
      await sleep(50);
      last = await read();
    }
    return last;
  };
  const read0: { before: Specimen | null; leaned: Specimen | null; back: Specimen | null; inAt: At; outAt: At } = {
    before: null,
    leaned: null,
    back: null,
    inAt: null,
    outAt: null,
  };
  try {
    await send("Emulation.setEmulatedMedia", { features: [] });
    read0.before = await settle(false, 30);
    read0.inAt = await evaluate(AT("zoom-in"));
    if (read0.inAt) await pressAt({ send }, read0.inAt.x, read0.inAt.y);
    read0.leaned = await settle(true, 30);
    read0.outAt = await evaluate(AT("zoom-out"));
    if (read0.outAt) await pressAt({ send }, read0.outAt.x, read0.outAt.y);
    read0.back = await settle(false, 30);
  } finally {
    await setState("rest");
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  }
  const { before, leaned, back, inAt, outAt } = read0;
  check(
    "SB15 the Glass's out press answers a real press in a room the kit's key binder binds",
    zoomed(before) === false &&
      !!inAt &&
      inAt.hit === "zoom-in" &&
      zoomed(leaned) === true &&
      !!outAt &&
      outAt.hit === "zoom-out" &&
      zoomed(back) === false,
    JSON.stringify({ before: before.st, inAt, leaned: leaned.st, outAt, back: back.st }),
  );
}
