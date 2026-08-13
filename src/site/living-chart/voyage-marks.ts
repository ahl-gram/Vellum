// The Wayfarer's marks (#119/#120): the ship and the rider, pure glyph data + a DOM
// builder. Both are drawn in PROFILE pointing +x, with the origin on their ground
// contact line (the ship's waterline, the horse's hooves), so the mark stands ON its
// track point and the tilt pivots about that contact. Sized in viewBox pixels against the 1500px chart.

const SVG_NS = "http://www.w3.org/2000/svg";

// One drawn piece of a mark: a path (d) or a circle (cx, cy, r), optionally classed.
type MarkPart =
  | { readonly d: string; readonly circle?: undefined; readonly cls?: string }
  | { readonly circle: readonly [number, number, number]; readonly d?: undefined; readonly cls?: string };

// A cog under sail: hull, stern castle, rigging, a square sail bellying east, a pennant. About 40 units wide against a chart whose peaks run 18 to 20.
export const SHIP_PARTS: ReadonlyArray<MarkPart> = [
  { d: "M -17 -5 Q -19 -1 -13 4 L 11 4 Q 17 1 17 -5 Z" },
  { d: "M -17 -5 L -17 -10 L -11 -10 L -11 -5 Z" },
  { d: "M -1 -5 L -1 -23 M -9 -19 L 8 -19 M 17 -3 L 21 -6", cls: "rig" },
  { d: "M -8 -19 L 7 -19 Q 12 -13 7 -7 L -8 -7 Q -4 -13 -8 -19 Z" },
  { d: "M -1 -23 L 6 -24 L -1 -25.5 Z", cls: "ink" },
];

// A horse walking east under a cloaked, hatted rider: tail, barrel, arched neck, small eared head, four legs mid-stride, then the rider (torso, hatted head, brim, rein).
export const RIDER_PARTS: ReadonlyArray<MarkPart> = [
  { d: "M -13 -11 Q -18 -10 -21 -4", cls: "tail" },
  { d: "M -13 -11 Q -14 -14 -10 -14 L 4 -14 Q 8 -14 9 -11 L 9 -8 Q 8 -6 3 -6 L -8 -6 Q -12 -6 -13 -11 Z" },
  { d: "M 5 -13 Q 9 -15 12 -21 Q 13 -24 16 -24 L 19 -22 Q 17 -20 15 -20 Q 14 -18 13 -15 Q 11 -12 6 -12 Z" },
  { d: "M 15 -24 L 16 -27 M 17 -23 L 19 -26", cls: "detail" },
  { d: "M -9 -6 L -10 0 M -5 -6 L -6 0 M 3 -7 L 4 0 M 7 -8 L 8 0", cls: "leg" },
  { d: "M -3 -13 L -4 -19 Q -1 -21 2 -20 L 3 -13 Z" },
  { circle: [-0.5, -22, 2.3], cls: "ink" },
  { d: "M -3.4 -23.4 L 2.6 -23.4", cls: "detail" },
  { d: "M 2 -17 Q 7 -18 11 -18", cls: "detail" },
];

export function makeMark(className: string, parts: ReadonlyArray<MarkPart>): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", className);
  for (const part of parts) {
    const node = document.createElementNS(SVG_NS, part.circle ? "circle" : "path");
    if (part.circle) {
      const [cx, cy, r] = part.circle;
      node.setAttribute("cx", String(cx));
      node.setAttribute("cy", String(cy));
      node.setAttribute("r", String(r));
    } else {
      node.setAttribute("d", part.d);
    }
    if (part.cls) node.setAttribute("class", part.cls);
    g.appendChild(node);
  }
  return g;
}
