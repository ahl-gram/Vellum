import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { roadPath } from "../../src/layouts/atelier-chart.ts";
import { chartOfLessons } from "../../src/layouts/chart-of-lessons.ts";
import { chartOfLessonsSvg } from "../../src/layouts/chart-of-lessons-svg.ts";
import { primerPage } from "../../src/site/primer/page.ts";
import type { ArrivalRoom } from "../../src/site/primer/arrival.ts";
import { inkChart, lightChart } from "../../src/site/primer/chart-ink.ts";
import { CHART_TITLE } from "../../src/site/primer/words.ts";

const rooms = primerPage().rooms;
const arrival: ArrivalRoom[] = rooms.map((r) => ({
  id: r.id,
  steps: r.lessons.flatMap((l) =>
    l.steps.map((s) => (s.only === undefined ? { id: s.id } : { id: s.id, only: s.only })),
  ),
}));
const room = (id: string): ArrivalRoom => {
  const found = arrival.find((r) => r.id === id);
  assert.ok(found, `${id} is a room`);
  return found;
};
const desktop = { touch: false, motion: true };

const chartOf = (): Element => {
  const html = `<!doctype html><html><body>${chartOfLessonsSvg(chartOfLessons(rooms), CHART_TITLE)}</body></html>`;
  const chart = parseHTML(html).document.querySelector(".col-chart");
  assert.ok(chart, "the chart is in the markup");
  return chart;
};
const read = (chart: Element, selector: string, attr: string): string[] =>
  [...chart.querySelectorAll(selector)].map((e) => e.getAttribute(attr) ?? "");

test("CI1 the chart inks the mark of every sealed step and no other, dots the mark of a step this device cannot take and has not sealed, and leaves every other mark open (Issue #1155 comment 7136681098, Q2 and Q4)", () => {
  const explorer = room("explorer");
  const touch = explorer.steps.find((s) => s.only === "touch");
  const motion = arrival.flatMap((r) => r.steps).find((s) => s.only === "motion");
  assert.ok(touch && motion, "some step is for touch alone and some for motion alone");
  const chart = chartOf();

  const done = [
    ...(rooms.find((r) => r.id === "explorer")?.lessons[0]?.steps.map((s) => s.id) ?? []),
    touch.id,
    ...room("prospect").steps.map((s) => s.id),
  ];
  inkChart(chart, arrival, new Set(done), desktop);
  assert.deepEqual(read(chart, ".sealed", "data-step").sort(), [...done].sort());
  assert.deepEqual(read(chart, ".elsewhere", "data-step"), []);

  inkChart(chart, arrival, new Set(), desktop);
  assert.deepEqual(read(chart, ".sealed", "data-step"), []);
  assert.deepEqual(read(chart, ".elsewhere", "data-step"), [touch.id]);

  inkChart(chart, arrival, new Set(), { touch: false, motion: false });
  assert.deepEqual(read(chart, ".elsewhere", "data-step").sort(), [touch.id, motion.id].sort());
});

test("CI2 the road from home to every room holding a seal turns red, and no other road; a room no road reaches inks none, and wiping the seals takes the ink off (Issue #1155 comment 7136681098, Q3)", () => {
  const first = (id: string): string => {
    const step = room(id).steps[0];
    assert.ok(step, `${id} has a step`);
    return step.id;
  };
  const chart = chartOf();

  inkChart(chart, arrival, new Set([first("ribbon"), first("gallery")]), desktop);
  assert.deepEqual(
    read(chart, ".inked", "d").sort(),
    [
      roadPath(["/", "/explorer/"]),
      roadPath(["/explorer/", "/prospect/"]),
      roadPath(["/prospect/", "/ribbon/"]),
    ].sort(),
  );

  inkChart(chart, arrival, new Set([first("gallery")]), desktop);
  assert.deepEqual(read(chart, ".inked", "d"), []);

  inkChart(chart, arrival, new Set(), desktop);
  assert.deepEqual(read(chart, ".inked", "d"), []);
});

test("CI3 the open room alone is lit, and the hand stands at its first step this device can take that is not yet sealed; a room with none left, or no room, takes the hand off (Issue #1155 comment 7136681098, Q4 and Q5)", () => {
  const page = rooms.find((r) => r.id === "explorer");
  assert.ok(page, "the Explorer is a room");
  const fifth = page.lessons[4];
  const sixth = page.lessons[5];
  assert.ok(fifth && sixth, "the Explorer has six lessons");
  const touch = fifth.steps.find((s) => s.only === "touch");
  assert.ok(touch, "the Explorer's fifth lesson holds the touch step");
  const chart = chartOf();
  const hand = (): Element => {
    const found = chart.querySelector(".col-next");
    assert.ok(found, "the hand is in the markup");
    return found;
  };

  const sealed = new Set(
    page.lessons
      .slice(0, 5)
      .flatMap((l) => l.steps.map((s) => s.id))
      .filter((id) => id !== touch.id),
  );
  lightChart(chart, room("explorer"), sealed, desktop);
  assert.deepEqual(read(chart, ".lit", "data-halo"), ["explorer"]);
  assert.ok(hand().classList.contains("on"));
  const want = chart.querySelector(`[data-step="${sixth.steps[0]?.id}"]`)?.getAttribute("data-hand");
  assert.ok(want);
  assert.equal(hand().getAttribute("transform"), want);

  lightChart(chart, room("gallery"), new Set(room("gallery").steps.map((s) => s.id)), desktop);
  assert.deepEqual(read(chart, ".lit", "data-halo"), ["gallery"]);
  assert.equal(hand().classList.contains("on"), false);

  lightChart(chart, undefined, sealed, desktop);
  assert.deepEqual(read(chart, ".lit", "data-halo"), []);
  assert.equal(hand().classList.contains("on"), false);
});

test("CI4 the hand stands at the step the page shows, wherever it falls in the room, and leaves the chart when the page shows none (Issue #1392 C7)", () => {
  const explorer = room("explorer");
  const third = explorer.steps[2];
  assert.ok(third, "the Explorer has a third step");
  const chart = chartOf();
  const hand = chart.querySelector(".col-next");
  assert.ok(hand, "the hand is in the markup");
  const mark = chart.querySelector(`[data-step="${third.id}"]`)?.getAttribute("data-hand");
  assert.ok(mark, "the third step has a mark for the hand");
  const first = chart.querySelector(`[data-step="${explorer.steps[0]?.id}"]`)?.getAttribute("data-hand");
  assert.notEqual(mark, first, "the third step's mark is not the room's first");

  lightChart(chart, explorer, new Set(), desktop, third.id);
  assert.equal(hand.getAttribute("transform"), mark);
  assert.ok(hand.classList.contains("on"));
  lightChart(chart, explorer, new Set(), desktop, null);
  assert.equal(hand.classList.contains("on"), false);
});
