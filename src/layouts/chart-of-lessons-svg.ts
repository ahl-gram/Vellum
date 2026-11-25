import { el, renderSvg, type SvgNode } from "../render/svg.ts";
import { COAST } from "./atelier-chart.ts";
import type { ChartPlace, LessonChart } from "./chart-of-lessons.ts";

const HIDDEN = { "aria-hidden": "true" } as const;

function nameOf(place: ChartPlace): SvgNode {
  const { label } = place;
  return el("text", { class: "name", x: label.x, y: label.y, "font-size": label.size, "text-anchor": label.anchor }, [
    label.text,
  ]);
}

function placeOf(place: ChartPlace): SvgNode {
  const pip = el("circle", { class: "pip", cx: place.x, cy: place.y, r: place.pip });
  if (place.room === null) return el("g", { class: `col-place ${place.rank} untaught` }, [pip, nameOf(place)]);
  const marks = place.marks.map((m) =>
    el("path", {
      class: "col-tick",
      d: m.d,
      "data-step": m.step,
      "data-hand": m.hand,
      "data-hand-side": m.side,
      ...(m.only === undefined ? {} : { "data-only": m.only }),
    }),
  );
  return el("g", { class: `col-place ${place.rank}` }, [
    el("a", { href: `#${place.room}` }, [pip, nameOf(place), el("g", HIDDEN, marks)]),
  ]);
}

export function chartOfLessonsSvg(chart: LessonChart, title: string): string {
  const { frame } = chart;
  const rose = el(
    "g",
    { class: "col-rose", transform: `translate(${frame.x + frame.w - 24} ${frame.y + frame.h - 26})`, ...HIDDEN },
    [
      el("circle", { r: 12 }),
      el("path", { d: "M0 -12 L2.8 -2.8 L12 0 L2.8 2.8 L0 12 L-2.8 2.8 L-12 0 L-2.8 -2.8 Z" }),
      el("text", { y: -16 }, ["N"]),
    ],
  );
  const hand = el("g", { class: "col-next", ...HIDDEN }, [
    el("circle", { class: "ring-a", r: 4.4 }),
    el("circle", { class: "ring-b", r: 4.4 }),
    el("text", { class: "east", x: 5.6, "text-anchor": "start", dy: "0.36em" }, ["☜"]),
    el("text", { class: "west", x: -5.6, "text-anchor": "end", dy: "0.36em" }, ["☞"]),
  ]);
  return renderSvg(
    el("svg", { class: "col-chart", viewBox: `${frame.x} ${frame.y} ${frame.w} ${frame.h}` }, [
      el("path", { class: "col-sea", d: COAST, ...HIDDEN }),
      el("path", { class: "col-land", d: COAST, ...HIDDEN }),
      ...chart.roads.map((road) =>
        el("path", {
          class: "col-road",
          d: road.d,
          ...(road.rooms.length === 0 ? {} : { "data-rooms": road.rooms.join(" ") }),
          ...HIDDEN,
        }),
      ),
      ...chart.tracks.map((d) => el("path", { class: "col-road track", d, ...HIDDEN })),
      ...chart.places.flatMap((p) =>
        p.room === null || p.halo === null
          ? []
          : [el("circle", { class: "col-open", "data-halo": p.room, cx: p.x, cy: p.y, r: p.halo, ...HIDDEN })],
      ),
      ...chart.places.map(placeOf),
      hand,
      rose,
      el("text", { class: "col-title", x: frame.x + 16, y: frame.y + frame.h - 10, ...HIDDEN }, [title]),
    ]),
  );
}
