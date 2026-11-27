// What a press on the Prospect's view pair does (Issue #755 pull request 2): the plate turned from the rise to the view from above and back, the address that keeps it, the Chart Table's filing of it.
import { escapeXml } from "../../../src/render/svg.ts";
import { parseTableValue } from "../../../src/site/shared/table-address.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import { STATE, STORE, type Prospect, type ProspectKit } from "./kit.ts";

type Reach = { x: number; y: number; hit: boolean };
const reachOf = (selector: string): Payload<Reach> =>
  `(() => { const b = document.querySelector(${JSON.stringify(selector)}), r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; return { x, y, hit: document.elementFromPoint(x, y) === b }; })()`;
type Face = { title: string; alt: string; hash: string; lit: string[]; rows: string[] };
const FACE: Payload<Face> = `(() => ({ title: document.getElementById("folio-title").textContent, alt: document.getElementById("pp-plate").alt, hash: location.hash,
  lit: [...document.querySelectorAll("#pp-view [data-view]")].map((b) => b.dataset.view + "=" + b.getAttribute("aria-pressed")),
  rows: [...document.querySelectorAll("#pp-key li")].map((li) => li.querySelector(".cr-num").textContent + ". " + li.querySelector(".cr-text").textContent) }))()`;
const DEVICE: Payload<string | null> = `localStorage.getItem(${STORE})`;

export async function pb20ViewSwitch(k: ProspectKit): Promise<void> {
  const { evaluate, check, goto, opened, forget, parkMouse, pressAt, svgOf } = k;
  const settle = makeSettle(k);
  const drawnIn = (view: string) => (s: Prospect) => s.view === view && s.blob && s.status === "";
  await forget();
  try {
    await goto("#seed=42&i=1");
    await opened("Paukilua, for the view switch");
    const rise = await svgOf();
    const toAbove = await evaluate(reachOf('#pp-view [data-view="above"]'));
    await pressAt(toAbove.x, toAbove.y);
    const above = await settle(STATE, drawnIn("above"), "prospect-view-above");
    const pressedSvg = await svgOf();
    const pressed = await evaluate(FACE);

    await goto(pressed.hash);
    const arrived = await settle(STATE, drawnIn("above"), "prospect-view-arrival");
    const arrivedSvg = await svgOf();

    const toLay = await evaluate(reachOf("#pp-lay"));
    await pressAt(toLay.x, toLay.y);
    const device = await settle(DEVICE, () => true, "prospect-view-filed");

    const toRise = await evaluate(reachOf('#pp-view [data-view="rise"]'));
    await pressAt(toRise.x, toRise.y);
    const back = await settle(STATE, drawnIn("rise"), "prospect-view-rise");
    const backSvg = await svgOf();
    const returned = await evaluate(FACE);

    const keys = new URLSearchParams(pressed.hash.slice(1));
    const wrong = [
      (toAbove.hit &&
        pressedSvg.includes('aria-label="The bird&apos;s-eye of Paukilua, chart 42"') &&
        pressed.title === "The Bird's-eye of Paukilua · Chart № 42" &&
        pressed.alt === "The bird's-eye of Paukilua, chart 42" &&
        keys.get("view") === "above" &&
        keys.get("i") === "1" &&
        keys.get("year") === String(above.presentYear) &&
        pressed.lit.join() === "rise=false,above=true" &&
        pressed.rows.length > 0 &&
        pressed.rows.every((row) => pressedSvg.includes(`aria-label="${escapeXml(row)}"`))) ||
        "the press re-engraves the plate from above, names it, writes view, i and the year, lights itself and mirrors the key",
      (arrived.view === "above" && arrivedSvg === pressedSvg) || "the written address opens the same plate from above",
      parseTableValue(device)[0]?.kind === "prospect" &&
      (parseTableValue(device)[0] as { view?: string }).view === "above"
        ? true
        : "the filing press files the plate from above",
      (toRise.hit &&
        backSvg === rise &&
        back.view === "rise" &&
        !/(^|&)view=/.test(returned.hash.slice(1)) &&
        returned.lit.join() === "rise=true,above=false") ||
        "from the rise returns the rise byte for byte, drops the view key and lights itself",
    ].filter((f): f is string => f !== true);
    check(
      "PB20 the view switch answers a real press: from above re-engraves the plate from above in place, names it the bird's-eye in the folio and the image, writes view=above with i and the year to the address and lights itself, and the note's key mirrors the plate's lettered key; the written address opens the same plate from above; the filing press files it from above; and from the rise returns the rise byte for byte and drops the key (Issue #755 D1 (b))",
      wrong.length === 0,
      JSON.stringify({ wrong, pressed, arrived: arrived.view, device, returned }),
    );
  } finally {
    await forget();
    await parkMouse();
  }
}
