// The Daily Hunt's Surveyor's Dispatch: today's chart with the reader's soundings and the find drawn over it, as an SVG to download.
import type { Quarry } from "../../world/daily-hunt.ts";
import type { Projection } from "../../render/transform.ts";

// Everything the dispatch adds is inline-styled and font-independent, because a downloaded SVG travels with NO page CSS and no guaranteed fonts.
const SVG_NS = "http://www.w3.org/2000/svg";
const DISPATCH_BAND = 104; // extra sheet drawn below the plate to seat the caption

const svgEl = (name: string, attrs: Record<string, string | number>): SVGElement => {
  const e = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
};

// A five-pointed vector star: a polygon renders identically in any SVG viewer, without depending on a "★" glyph being present in the reader's installed fonts.
const starNode = (cx: number, cy: number, fill: string): SVGElement => {
  const rOuter = 26, rInner = 11, pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5; // first point straight up
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return svgEl("polygon", {
    "data-dispatch-star": "",
    points: pts.join(" "),
    style: `fill:${fill};stroke:#fff7e4;stroke-width:1.5`,
  });
};

export type Miss = { readonly gx: number; readonly gy: number };

function dispatchSheet(svg: SVGSVGElement, proj: Readonly<Projection>): { clone: SVGSVGElement; paper: string; bandTop: number } {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute("class"); // drop any transient arrival class; the chart draws CSS-free
  // The background paper is a DIRECT child rect (the defs/pattern rects are nested), so :scope > rect selects the plate colour, not a texture tile.
  const paper = clone.querySelector(":scope > rect")?.getAttribute("fill") || "#f4ecd8";
  const bandTop = proj.heightPx;
  const vbH = proj.heightPx + DISPATCH_BAND;
  clone.setAttribute("viewBox", `0 0 ${proj.widthPx} ${vbH}`);
  clone.setAttribute("height", String(Math.round(vbH)));
  clone.appendChild(svgEl("rect", { x: 0, y: bandTop, width: proj.widthPx, height: DISPATCH_BAND, fill: paper }));
  return { clone, paper, bandTop };
}

function dispatchRoute(missRoute: ReadonlyArray<Miss>, proj: Readonly<Projection>, quarry: Readonly<Quarry>, paper: string, INK: string, STAR: string): SVGElement {
  const g = svgEl("g", { "data-vellum-dispatch": "" });

  const misses = missRoute.map((m): [number, number] => [proj.px(m.gx), proj.py(m.gy)]);
  const qx = proj.px(quarry.settlement.x), qy = proj.py(quarry.settlement.y);

  if (misses.length > 0) {
    g.appendChild(svgEl("polyline", {
      points: [...misses, [qx, qy] as [number, number]].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
      style: `fill:none;stroke:${INK};stroke-width:3;stroke-dasharray:1 13;stroke-linecap:round;opacity:0.8`,
    }));
  }
  misses.forEach(([x, y], i) => {
    g.appendChild(svgEl("circle", {
      "data-dispatch-station": "",
      cx: x.toFixed(2), cy: y.toFixed(2), r: 17,
      style: `fill:${paper};stroke:${INK};stroke-width:2.5`,
    }));
    const label = svgEl("text", {
      x: x.toFixed(2), y: y.toFixed(2),
      style: `fill:${INK};font:600 22px Georgia,'Times New Roman',serif;text-anchor:middle;dominant-baseline:central`,
    });
    label.textContent = String(i + 1);
    g.appendChild(label);
  });
  g.appendChild(starNode(qx, qy, STAR)); // a star at the find
  return g;
}

// The Surveyor's Dispatch: clone today's actual chart (keeping its data-vellum-* recipe, so the artifact stays reproducible like every Vellum export) and append one survey overlay plus a caption band.
// The route is stored in GRID space and re-projected HERE, at draft time, so it is identical no matter the window size when each guess was clicked.
export function huntDispatch(svg: SVGSVGElement, proj: Readonly<Projection>, quarry: Readonly<Quarry>, missRoute: ReadonlyArray<Miss>, dispatchCaption: () => string) {
  const buildDispatchSvg = () => {
    const { clone, paper, bandTop } = dispatchSheet(svg, proj);

    const INK = "#4a3826", STAR = "#7a1f12";
    const g = dispatchRoute(missRoute, proj, quarry, paper, INK, STAR);

    const cap = svgEl("text", {
      x: (proj.widthPx / 2).toFixed(2),
      y: (bandTop + DISPATCH_BAND / 2).toFixed(2),
      style: `fill:${INK};font:italic 30px Georgia,'Times New Roman',serif;text-anchor:middle;dominant-baseline:central;letter-spacing:0.03em`,
    });
    cap.textContent = dispatchCaption();
    g.appendChild(cap);

    clone.appendChild(g);
    return new XMLSerializer().serializeToString(clone);
  };
  return { buildDispatchSvg };
}
