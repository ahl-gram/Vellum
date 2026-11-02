import { REDRAFT_TRIES, type ZoomKit } from "./kit.ts";

export type InsetCard = {
  at: number;
  tier: string | null;
  name: string | null;
  world: number;
  shown: boolean;
  i: string | null;
  a: string | null;
  lay: string | null;
  road: boolean;
  worldRoads: boolean;
};

// hit.focus() is wiring: keyboard focus is the card's own switch (explorer-doctrine "Only KEYBOARD focus switches the card"), as P16 in e2e/suites/cards/glass.ts focuses.
export const INSET_CARDS = `(async () => {
  const { defaultRecipe, generateWorld } = await import("/explorer/engine/world/generate.js");
  const { roadMask, roadReachable } = await import("/explorer/engine/itinerary/route.js");
  const world = generateWorld(defaultRecipe(42, { gridW: 320, gridH: 240 }));
  const mask = roadMask(world);
  const isvg = [...document.querySelectorAll("#map .region-inset svg")].pop();
  if (!isvg) return null;
  const tierOf = (at) => { const g = isvg.querySelector('g.settlement[data-idx="' + at + '"]'); return g ? g.dataset.tier : null; };
  const param = (a, key) => (a && a.getAttribute("href") ? new URLSearchParams(new URL(a.getAttribute("href"), location.href).hash.slice(1)).get(key) : null);
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  const rows = [...document.querySelectorAll("#map .place-overlay .place-hit")].map((hit) => {
    hit.focus();
    const c = document.getElementById("place-card");
    const name = (c.querySelector(".pc-name") || {}).textContent || null;
    const w = world.settlements.findIndex((s) => s.name === name);
    const acts = c.querySelector(".pc-acts");
    const box = acts ? acts.getBoundingClientRect() : null;
    const lay = c.querySelector(".pc-lay");
    const rb = c.querySelector(".pc-ribbon");
    return { at: Number(hit.dataset.idx), tier: tierOf(hit.dataset.idx), name, world: w, shown: !!box && box.width > 0, i: param(c.querySelector(".pc-prospect"), "i"), a: param(rb, "a"), lay: lay ? (lay.dataset.idx ?? null) : null, road: !!rb && rb.getBoundingClientRect().width > 0, worldRoads: w >= 0 && roadReachable(world, mask, w).length > 0 };
  });
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  return rows;
})()`;

const SMALL = ["hamlet", "farmstead", "mill"];

export async function z21dInsetCards({ evaluate, check, sleep, rgn, insetView }: ZoomKit): Promise<void> {
  for (let i = 0; ; i++) {
    const s = await rgn();
    const v = await insetView();
    if (s.band === 5 && s.committed && v.insets === 1 && v.hits > 0) break;
    if (i + 1 >= REDRAFT_TRIES)
      throw new Error(
        `Z21d: the band-5 close-up never stood alone (band ${s.band}, committed ${s.committed}, insets ${v.insets})`,
      );
    await sleep(40);
  }
  const rows = await evaluate<InsetCard[] | null>(INSET_CARDS, true);
  const towns = (rows ?? []).filter((r) => r.tier !== null && !SMALL.includes(r.tier));
  const small = (rows ?? []).filter((r) => r.tier !== null && SMALL.includes(r.tier));
  check(
    "Z21d on a close-up, a town the main chart holds opens the main chart's own prospect, road and table press by its main-chart number, the road shown where the main chart's own road leaves it, and a hamlet, farmstead or mill shows its card with no action row (Issue #403)",
    !!rows &&
      rows.every((r) => r.tier !== null) &&
      towns.length >= 1 &&
      small.length >= 1 &&
      towns.some((r) => r.world !== r.at) &&
      towns.every(
        (r) =>
          r.world >= 0 &&
          r.shown &&
          r.i === String(r.world) &&
          r.a === String(r.world) &&
          r.lay === String(r.world) &&
          r.road === r.worldRoads,
      ) &&
      small.every((r) => !r.shown),
    JSON.stringify({ towns, small: small.length, smallShown: small.filter((r) => r.shown).map((r) => r.name) }),
  );
}
