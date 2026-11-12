import { sendClick } from "../../support/input.ts";
import { LADDERS } from "../../../src/site/shared/primer/ladders.ts";
import { emitSeals, PRIMER_STORE_KEY } from "../../../src/site/shared/primer/seals.ts";
import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
import type { Payload } from "../../types.ts";
import type { DocRoomsKit } from "../document-rooms.ts";

const FIRST = LADDERS[0]!.lessons[0]!.steps[0]!.id;
const TABLE = "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-8.ly-8";
const PRIMER = "/primer/";

type Held = { bound: boolean; y: number; sealed: string[]; primer: string | null; table: string | null };
type Press = { x: number; y: number; hit: boolean; scrollY: number } | null;

const READ: Payload<Held> = `(() => ({
  bound: !!document.querySelector(".primer[data-bound]"),
  y: scrollY,
  sealed: [...document.querySelectorAll(".primer li.step.sealed")].map((li) => li.id),
  primer: localStorage.getItem(${JSON.stringify(PRIMER_STORE_KEY)}),
  table: localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}),
}))()`;

const REACH: Payload<Press> = `(() => {
  const b = document.querySelector(".primer .closing .wipe");
  if (!b) return null;
  b.scrollIntoView({ block: "center" });
  const r = b.getBoundingClientRect();
  const x = r.x + r.width / 2, y = r.y + r.height / 2;
  return { x, y, hit: document.elementFromPoint(x, y) === b, scrollY };
})()`;

const put = (key: string, value: string | null): string =>
  value === null
    ? `localStorage.removeItem(${JSON.stringify(key)})`
    : `localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)})`;

export async function ix9Seals(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, settle, stable, goto } = k;
  await goto(PRIMER);
  const was = await evaluate<{ primer: string | null; table: string | null }>(
    `({ primer: localStorage.getItem(${JSON.stringify(PRIMER_STORE_KEY)}), table: localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}) })`,
  );
  try {
    await evaluate(`${put(PRIMER_STORE_KEY, emitSeals([FIRST]))}; ${put(TABLE_STORE_KEY, TABLE)}`);
    await goto(PRIMER);
    const arrived = await settle(READ, (d) => d.bound, "primer-bound");
    const press = await evaluate<Press>(REACH);
    let after: Held | null = null;
    if (press?.hit) {
      await sendClick(send, press.x, press.y);
      after = await stable(READ, "primer-wiped", { departed: (d) => d.y < press.scrollY });
    }
    check(
      "IX9 the Primer draws the seal a returner's browser holds and Wipe the slate, pressed, takes it off and empties the Primer's own key while the Chart Table's stays as it was (Issue #1155 N1)",
      JSON.stringify(arrived.sealed) === JSON.stringify([FIRST]) &&
        press?.hit === true &&
        after !== null &&
        after.sealed.length === 0 &&
        after.primer === null &&
        after.table === TABLE,
      `arrived sealed ${JSON.stringify(arrived.sealed)}, press ${JSON.stringify(press)}, after ${JSON.stringify(after)}`,
    );
  } finally {
    await evaluate(`${put(PRIMER_STORE_KEY, was.primer)}; ${put(TABLE_STORE_KEY, was.table)}`);
  }
}
