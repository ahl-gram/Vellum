import { el, type SvgNode } from "../../render/svg.ts";
import type { Pt } from "../geometry.ts";
import type { BirdseyeHarbour, BirdseyeTown, Neighbour, TownItem } from "../birdseye/types.ts";
import { hatchNode, poly, r1, stroke, washOr, type Engraver } from "./burin.ts";
import { shipWith } from "./ship.ts";

export type OneHouse = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly depth: number;
  readonly church: boolean;
  readonly window: boolean;
};

export function obliqueHouse(e: Engraver, house: OneHouse): SvgNode[] {
  const { x, y, w, h, depth } = house;
  const roofFill = e.wash === null ? e.paper : house.church ? e.wash.roofChurch : e.wash.roof;
  const front = [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y - h },
    { x, y: y - h },
  ];
  const roof = [
    { x, y: y - h },
    { x: x + w, y: y - h },
    { x: x + w + depth * 0.5, y: y - h - depth },
    { x: x + depth * 0.5, y: y - h - depth },
  ];
  const side = [
    { x: x + w, y },
    { x: x + w + depth * 0.5, y: y - depth },
    { x: x + w + depth * 0.5, y: y - h - depth },
    { x: x + w, y: y - h },
  ];
  const out: SvgNode[] = [
    el("path", { d: poly(front), fill: e.paper, ...stroke(e, 0.45) }),
    el("path", { d: poly(side), fill: e.paper, ...stroke(e, 0.45) }),
    hatchNode(e, side, 3, 1.1, 0.35, 0.9),
    el("path", { d: poly(roof), fill: roofFill, ...stroke(e, 0.45) }),
  ];
  if (e.wash === null || house.church) out.push(hatchNode(e, roof, 0.1, 1.0, 0.3, 0.7));
  if (house.window)
    out.push(el("rect", { x: r1(x + w * 0.4), y: r1(y - h * 0.65), width: 0.8, height: 1.2, fill: e.ink }));
  return out;
}

export function houseItemNodes(e: Engraver, item: Extract<TownItem, { kind: "house" }>): SvgNode[] {
  return obliqueHouse(e, {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    depth: item.depth,
    church: false,
    window: item.window,
  });
}

const roofOf = (e: Engraver, key: "roof" | "roofChurch"): string => (e.wash === null ? e.paper : e.wash[key]);

function churchNodes(e: Engraver, item: Extract<TownItem, { kind: "church" }>): SvgNode[] {
  const { x, y } = item;
  const s = item.great ? 1 : 0.72;
  const out = obliqueHouse(e, {
    x: x - 5 * s,
    y,
    w: 10 * s,
    h: 7 * s,
    depth: 5 * s,
    church: true,
    window: item.window,
  });
  out.push(
    el("path", {
      d: `M${r1(x - 6 * s)} ${r1(y)}V${r1(y - 11 * s)}H${r1(x - 2.5 * s)}V${r1(y)}Z`,
      fill: e.paper,
      ...stroke(e, 0.5),
    }),
    el("path", {
      d: `M${r1(x - 6.6 * s)} ${r1(y - 11 * s)}L${r1(x - 4.25 * s)} ${r1(y - 20 * s)}L${r1(x - 1.9 * s)} ${r1(y - 11 * s)}Z`,
      fill: roofOf(e, "roofChurch"),
      ...stroke(e, 0.5),
    }),
    hatchNode(
      e,
      [
        { x: x - 4.25 * s, y: y - 20 * s },
        { x: x - 1.9 * s, y: y - 11 * s },
        { x: x - 4.25 * s, y: y - 11 * s },
      ],
      -3.8,
      1.1,
      0.35,
    ),
  );
  return out;
}

function keepNodes(e: Engraver, item: Extract<TownItem, { kind: "keep" }>): SvgNode[] {
  const { x, y } = item;
  const s = item.scale;
  const out = obliqueHouse(e, {
    x: x - 7 * s,
    y,
    w: 14 * s,
    h: 11 * s,
    depth: 7 * s,
    church: false,
    window: item.window,
  });
  const feet = [
    [x - 7 * s, y],
    [x + 7 * s, y],
    [x - 3.5 * s, y - 7 * s],
    [x + 10.5 * s, y - 7 * s],
  ] as const;
  for (const [tx, ty] of feet)
    out.push(
      el("path", {
        d: `M${r1(tx - 1.6)} ${r1(ty)}V${r1(ty - 14 * s)}H${r1(tx + 1.6)}V${r1(ty)}Z`,
        fill: e.paper,
        ...stroke(e, 0.5),
      }),
      el("path", {
        d: `M${r1(tx - 2.2)} ${r1(ty - 14 * s)}L${r1(tx)} ${r1(ty - 17.5 * s)}L${r1(tx + 2.2)} ${r1(ty - 14 * s)}Z`,
        fill: roofOf(e, "roofChurch"),
        ...stroke(e, 0.5),
      }),
    );
  return out;
}

function itemNodes(e: Engraver, item: TownItem): SvgNode[] {
  if (item.kind === "house") return houseItemNodes(e, item);
  if (item.kind === "church") return churchNodes(e, item);
  if (item.kind === "keep") return keepNodes(e, item);
  return [
    el("path", {
      d: `M${r1(item.x)} ${r1(item.y)}V${r1(item.y - 6)}M${r1(item.x - 1.8)} ${r1(item.y - 4.4)}H${r1(item.x + 1.8)}`,
      fill: "none",
      ...stroke(e, 0.7),
    }),
  ];
}

function bridgeNodes(e: Engraver, [a, b]: readonly [Pt, Pt]): SvgNode[] {
  const span = `M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}`;
  return [
    el("path", { d: span, fill: "none", stroke: e.ink, "stroke-width": 3.4, "stroke-linecap": "butt" }),
    el("path", { d: span, fill: "none", stroke: e.paper, "stroke-width": 2.0, "stroke-linecap": "butt" }),
    el("path", {
      d: `M${r1((a.x + b.x) / 2 - 1.6)} ${r1((a.y + b.y) / 2 + 2.4)}q1.6 -2 3.2 0`,
      fill: "none",
      stroke: e.ink,
      "stroke-width": 0.5,
    }),
  ];
}

function wallNodes(e: Engraver, wall: NonNullable<BirdseyeTown["wall"]>): SvgNode[] {
  const ring = poly(wall.ring, false);
  const out: SvgNode[] = [
    el("path", { d: ring, fill: "none", ...stroke(e, 2.2) }),
    el("path", { d: ring, fill: "none", stroke: e.paper, "stroke-width": 1.0 }),
  ];
  const teeth: string[] = [];
  for (let i = 0; i + 1 < wall.ring.length; i++) {
    const a = wall.ring[i]!;
    const b = wall.ring[i + 1]!;
    const len = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    for (let t = 1.2; t < len; t += 2.4)
      teeth.push(`M${r1(a.x + ((b.x - a.x) * t) / len)} ${r1(a.y + ((b.y - a.y) * t) / len)}v-1.6`);
  }
  out.push(el("path", { d: teeth.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.5 }));
  for (const a of wall.towers)
    out.push(
      el("circle", { cx: r1(a.x), cy: r1(a.y - 1), r: 1.8, fill: e.paper, ...stroke(e, 0.6) }),
      el("path", {
        d: `M${r1(a.x - 2.1)} ${r1(a.y - 1.8)}L${r1(a.x)} ${r1(a.y - 5.4)}L${r1(a.x + 2.1)} ${r1(a.y - 1.8)}Z`,
        fill: roofOf(e, "roofChurch"),
        ...stroke(e, 0.5),
      }),
    );
  for (const a of wall.gates)
    out.push(
      el("path", {
        d: `M${r1(a.x - 3)} ${r1(a.y + 1)}V${r1(a.y - 7)}H${r1(a.x + 3)}V${r1(a.y + 1)}Z`,
        fill: e.paper,
        ...stroke(e, 0.6),
      }),
      el("path", {
        d: `M${r1(a.x - 3.6)} ${r1(a.y - 7)}L${r1(a.x)} ${r1(a.y - 11)}L${r1(a.x + 3.6)} ${r1(a.y - 7)}Z`,
        fill: roofOf(e, "roof"),
        ...stroke(e, 0.5),
      }),
      el("path", {
        d: `M${r1(a.x - 1.3)} ${r1(a.y + 1)}V${r1(a.y - 1.6)}Q${r1(a.x)} ${r1(a.y - 3.4)} ${r1(a.x + 1.3)} ${r1(a.y - 1.6)}V${r1(a.y + 1)}Z`,
        fill: e.ink,
      }),
    );
  return out;
}

export function townNodes(e: Engraver, town: BirdseyeTown): SvgNode[] {
  const out: SvgNode[] = town.ground.map((ring) =>
    el("path", { d: poly(ring), fill: washOr(e, "ground"), stroke: "none" }),
  );
  if (e.wash !== null)
    for (const block of town.blocks) out.push(el("path", { d: poly(block), fill: e.wash.grass, stroke: "none" }));
  out.push(
    el("path", {
      d: town.streets.map((s) => poly(s, false)).join(""),
      fill: "none",
      stroke: e.paper,
      "stroke-width": 1.1,
      "stroke-opacity": 0.9,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  );
  for (const bridge of town.bridges) out.push(...bridgeNodes(e, bridge));
  for (const item of town.items) out.push(...itemNodes(e, item));
  if (town.wall !== null) out.push(...wallNodes(e, town.wall));
  return out;
}

export function harbourNodes(e: Engraver, harbour: BirdseyeHarbour): SvgNode[] {
  const out: SvgNode[] = [];
  if (harbour.quay !== null)
    out.push(
      el("path", {
        d: poly(harbour.quay, false),
        fill: "none",
        stroke: e.ink,
        "stroke-width": 1.3,
        "stroke-dasharray": "0.1 2.4",
        "stroke-linecap": "round",
      }),
    );
  for (const s of harbour.ships) out.push(...shipWith(e, s.x, s.y, s.s, s.great, s.wake));
  return out;
}

export function neighbourNodes(e: Engraver, neighbours: ReadonlyArray<Neighbour>): SvgNode[] {
  return neighbours.flatMap((n) => {
    const out = n.houses.flatMap((h) =>
      obliqueHouse(e, { x: h.x, y: h.y, w: 3.2, h: 2.2, depth: 1.8, church: false, window: false }),
    );
    if (n.steeple)
      out.push(
        el("path", {
          d: `M${r1(n.x)} ${r1(n.y)}V${r1(n.y - 7)}l1.4 2.2l1.4 -2.2V${r1(n.y)}`,
          fill: e.paper,
          ...stroke(e, 0.5),
        }),
      );
    return out;
  });
}
