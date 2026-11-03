import test from "node:test";
import assert from "node:assert/strict";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, stripPos, type StripLayout } from "../../src/itinerary/dress/layout.ts";
import { stripBody } from "../../src/itinerary/dress/cloth.ts";
import { seatCaption, type SeatLine } from "../../src/itinerary/dress/seats.ts";
import { textBox, WIDTH_FACTOR, type Box } from "../../src/render/geometry.ts";
import { STYLES } from "../../src/render/style.ts";
import { r1 } from "../../src/prospect/dress/context.ts";
import type { RibbonEvent } from "../../src/itinerary/events.ts";
import type { RibbonInput } from "../../src/itinerary/input.ts";
import { attrsOf } from "../../test-support/dress-svg.ts";
import {
  plateCaptions,
  sweepJourneys,
  type PlateCaption,
  type PlateCaptionLine,
} from "../../test-support/ribbon-captions.ts";

// The room, written out so it cannot widen with the module it guards: a caption sits 9 inside its strip's long edges (the cloth's on antique, the outer rule on ink), under the continuation line (22 below the strip's top), and above the strip's foot (the inner rule, 3.5 up, on ink); 1e-6 is the float slack of a box slid onto the edge.
const EDGE = 9;
const TOP_CLEAR = 22;
const INK_FOOT = 3.5;
const EPS = 1e-6;
// A plate writes each coordinate to a tenth, so a box read back from it can sit 0.05 off in x (and 0.05 times the edge's slope, under 0.2, in y).
const PLATE_ROUNDING = 0.06;

type Dress = "antique" | "ink";
const DRESSES = ["antique", "ink"] as const;
type Plate = {
  readonly seed: number;
  readonly input: RibbonInput;
  readonly dress: Dress;
  readonly svg: string;
  readonly strips: ReadonlyArray<StripLayout>;
  readonly captions: ReadonlyArray<PlateCaption>;
};
type LineAt = { readonly plate: Plate; readonly caption: PlateCaption; readonly line: PlateCaptionLine };
type Disc = { readonly x: number; readonly y: number; readonly r: number };

const plates: Plate[] = sweepJourneys().flatMap(({ seed, input }) =>
  DRESSES.map((dress) => {
    const svg = ribbonSvgFor(input, dress);
    const strips = layoutRibbon(input).strips;
    return { seed, input, dress, svg, strips, captions: plateCaptions(svg, strips) };
  }),
);

const linesOf = (dress: Dress): LineAt[] =>
  plates
    .filter((p) => p.dress === dress)
    .flatMap((plate) => plate.captions.flatMap((caption) => caption.lines.map((line) => ({ plate, caption, line }))));
const where = (a: LineAt): string =>
  `seed ${a.plate.seed} ${a.plate.input.fromName} to ${a.plate.input.toName}, strip ${a.caption.strip.index}, "${a.line.text}"`;

function plateOf(seed: number, from: string, to: string, dress: Dress): Plate {
  const found = plates.find(
    (p) => p.seed === seed && p.dress === dress && p.input.fromName === from && p.input.toName === to,
  );
  assert.ok(found, `premise: the sweep holds seed ${seed} ${from} to ${to}`);
  return found;
}

function captionOf(plate: Plate, text: string): PlateCaption {
  const found = plate.captions.find((c) => c.lines.some((l) => l.text === text));
  assert.ok(found, `premise: the plate holds a caption with "${text}"`);
  return found;
}

const firstLine = (plate: Plate, text: string): PlateCaptionLine => captionOf(plate, text).lines[0] as PlateCaptionLine;

type Found<K extends RibbonEvent["kind"]> = {
  e: Extract<RibbonEvent, { kind: K }>;
  strip: StripLayout;
  p: { sx: number; sy: number };
};
function eventOf<K extends RibbonEvent["kind"]>(plate: Plate, kind: K, named: string): Found<K> {
  const e = plate.input.events.find(
    (x) => x.kind === kind && ("name" in x ? x.name : "toName" in x ? x.toName : "") === named,
  );
  assert.ok(e, `premise: the road has ${named}`);
  const strip = plate.strips.find((s) => e.dist >= s.d0 && e.dist < s.d1) as StripLayout;
  return { e: e as Found<K>["e"], strip, p: stripPos(strip, e.dist) };
}

function roomOf(
  dress: Dress,
  strip: StripLayout,
): { left: (y: number) => number; right: (y: number) => number; foot: number } {
  if (dress === "antique") return { ...stripBody(strip), foot: strip.y0 + strip.h };
  return { left: () => strip.x0, right: () => strip.x0 + strip.w, foot: strip.y0 + strip.h - INK_FOOT };
}

function pastRoom(dress: Dress, strip: StripLayout, box: Box): number {
  const room = roomOf(dress, strip);
  let past = Math.max(strip.y0 + TOP_CLEAR - box.y, box.y + box.h - room.foot, 0);
  const heights = [box.y + box.h, ...Array.from({ length: Math.ceil(box.h) }, (_, i) => box.y + i)];
  for (const y of heights) past = Math.max(past, room.left(y) + EDGE - box.x, box.x + box.w - (room.right(y) - EDGE));
  return past;
}

const roadXAt = (strip: StripLayout, y: number): number =>
  strip.pts.reduce((a, b) => (Math.abs(b.sy - y) < Math.abs(a.sy - y) ? b : a)).sx;

test("every caption sits inside its own strip, nine inside its edge, on any journey, in both dresses", () => {
  const { e, strip, p } = eventOf(plateOf(42, "Laukuwelua", "Homaitani", "antique"), "branch", "Lamahai");
  const end = { sx: p.sx + e.side * 20, sy: p.sy - 9 };
  const today = textBox(end.sx + 10, end.sy + 2.6 + 8.2, "to Lamahai", 8.2, "start", WIDTH_FACTOR.mixed);
  assert.ok(
    pastRoom("antique", strip, today) > 0,
    `premise: today's seat for "to Lamahai" runs past the room's right edge`,
  );
  for (const dress of DRESSES) {
    const lines = linesOf(dress);
    assert.ok(plates.filter((x) => x.dress === dress).length >= 70, `${dress}: the sweep is real`);
    assert.ok(lines.length >= 500, `${dress}: and it found captions to measure: ${lines.length} lines`);
    const past = (a: LineAt): number => pastRoom(dress, a.caption.strip, a.line.box);
    const worst = lines.reduce((a, b) => (past(b) > past(a) ? b : a));
    assert.ok(
      past(worst) <= PLATE_ROUNDING,
      `${dress}: a caption must lie in its room. Worst ${past(worst).toFixed(2)} past: ${where(worst)}`,
    );
  }
});

// The houses' extents around (x, y - 1) by tier; the road's clearance is the casing's half-width plus 0.55 (the casing dot's half stroke) less 0.25, the most the keep's half-unit samples can miss a box by.
const HOUSES: Record<string, readonly number[]> = {
  capital: [-11.5, 11.5, -11.6, 3.2],
  town: [-9, 9.7, -9.6, 1.5],
  village: [-6.7, 6.6, -5.4, 0.5],
  hamlet: [-2.6, 2.6, -5.1, 0],
};
const ROAD_CLEAR = { antique: 4.2 + 0.55 - 0.25, ink: 2.3 + 0.55 - 0.25 };
const ROSE_R = { antique: 15.45, ink: 13.85 };

const overlaps = (a: Box, b: Box): boolean => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const gap = (v: number, lo: number, hi: number): number => Math.max(lo - v, 0, v - hi);
const meetsDisc = (b: Box, d: Disc): boolean => Math.hypot(gap(d.x, b.x, b.x + b.w), gap(d.y, b.y, b.y + b.h)) < d.r;

function roadDistance(b: Box, strip: StripLayout): number {
  let best = Infinity;
  for (let i = 1; i < strip.pts.length; i++) {
    const [a, c] = [strip.pts[i - 1], strip.pts[i]] as [StripLayout["pts"][number], StripLayout["pts"][number]];
    if (Math.min(a.sy, c.sy) > b.y + b.h + 6 || Math.max(a.sy, c.sy) < b.y - 6) continue;
    for (let t = 0; t <= 1; t += 0.05) {
      const [x, y] = [a.sx + (c.sx - a.sx) * t, a.sy + (c.sy - a.sy) * t];
      best = Math.min(best, Math.hypot(gap(x, b.x, b.x + b.w), gap(y, b.y, b.y + b.h)));
    }
  }
  return best;
}

// The ornament riding the rose, out along its needle: the fleur-de-lis (20.5 out, 4.8 wide) on antique, the N (its letter centred 17.2 out, 3.9 wide) on ink.
function ornamentOf(dress: Dress, strip: StripLayout, rose: Disc): Disc {
  const t = (strip.needleDeg * Math.PI) / 180;
  if (dress === "antique") return { x: rose.x + 20.5 * Math.sin(t), y: rose.y - 20.5 * Math.cos(t), r: 4.8 };
  return { x: rose.x + 17.2 * Math.sin(t), y: rose.y - 17.2 * Math.cos(t), r: 3.9 };
}

function discsOf(plate: Plate): Disc[] {
  const rose = plate.dress === "antique" ? "15" : "13.4";
  const roses = /<g transform="translate\((-?[\d.]+) (-?[\d.]+)\)"><circle cx="0" cy="0" r="([\d.]+)"/g;
  const marks =
    plate.dress === "antique"
      ? /<(?:circle|ellipse) cx="(-?[\d.]+)" cy="(-?[\d.]+)" (?:r|rx)="([\d.]+)"[^>]*\/><text [^>]*font-size="5.2"/g
      : /<circle cx="(-?[\d.]+)" cy="(-?[\d.]+)" r="(1\.4)"/g;
  const found = [...plate.svg.matchAll(roses)].filter((m) => m[3] === rose);
  assert.equal(found.length, plate.strips.length, "premise: every strip draws one rose");
  const discs = found.map((m) => ({ x: Number(m[1]), y: Number(m[2]), r: ROSE_R[plate.dress] }));
  return [
    ...discs,
    ...discs.map((d, i) => ornamentOf(plate.dress, plate.strips[i] as StripLayout, d)),
    ...[...plate.svg.matchAll(marks)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), r: Number(m[3]) })),
  ];
}

function housesOf(plate: Plate): Box[] {
  return plate.input.events.flatMap((e) => {
    const strip = plate.strips.find((s) => e.dist >= s.d0 && e.dist < s.d1);
    if (e.kind !== "waypoint" || strip === undefined) return [];
    const [x0, x1, y0, y1] = HOUSES[e.tier === "farmstead" || e.tier === "mill" ? "hamlet" : e.tier] as [
      number,
      number,
      number,
      number,
    ];
    const p = stripPos(strip, e.dist);
    return [{ x: p.sx + x0, y: p.sy - 1 + y0, w: x1 - x0, h: y1 - y0 }];
  });
}

const FORCED = [
  { to: "Minmari", first: "a bridge of stone" },
  { to: "Ler", first: "TALICETHMAR" },
];
const isForced = (plate: Plate, first: string): boolean =>
  plate.dress === "antique" &&
  plate.seed === 99 &&
  plate.input.fromName === "Mialiscove" &&
  FORCED.some((f) => f.to === plate.input.toName && f.first === first);

function trespass(plate: Plate, caption: PlateCaption, line: PlateCaptionLine, discs: Disc[], houses: Box[]): string[] {
  const hits: string[] = [];
  if (discs.some((d) => meetsDisc(line.box, d))) hits.push("a rose or a league number");
  if (houses.some((h) => overlaps(line.box, h))) hits.push("a town's houses");
  if (!line.backed && roadDistance(line.box, caption.strip) < ROAD_CLEAR[plate.dress]) hits.push("the road");
  if (plate.captions.some((o) => o !== caption && o.lines.some((l) => overlaps(line.box, l.box))))
    hits.push("another caption");
  return hits;
}

test("no caption covers a compass rose, a town's houses, a league number, the road or another caption", () => {
  const road15 = plateOf(15, "Stanbyl", "Svidsvikov", "antique");
  const brons = eventOf(road15, "waypoint", "Bronstodin");
  const today = textBox(brons.p.sx - 10, brons.p.sy + 2.6 + 8.6, "BRONSTODIN", 8.6, "end", WIDTH_FACTOR.caps, 0.8);
  assert.ok(
    discsOf(road15).some((d) => meetsDisc(today, d)),
    "premise: BRONSTODIN at today's seat meets the strip 5 rose",
  );
  let forced = 0;
  for (const dress of DRESSES) {
    let measured = 0;
    for (const plate of plates.filter((x) => x.dress === dress)) {
      const [discs, houses] = [discsOf(plate), housesOf(plate)];
      for (const caption of plate.captions.filter((c) => !isForced(plate, (c.lines[0] as PlateCaptionLine).text))) {
        for (const line of caption.lines) {
          measured++;
          assert.deepEqual(
            trespass(plate, caption, line, discs, houses),
            [],
            `${dress}: ${where({ plate, caption, line })} covers`,
          );
        }
      }
      const owned = plate.captions.filter((c) => isForced(plate, (c.lines[0] as PlateCaptionLine).text));
      assert.ok(
        owned.every((c) => c.lines.every((l) => l.backed)),
        "a forced caption is backed",
      );
      forced += owned.length;
    }
    assert.ok(measured >= 500, `${dress}: and it measured captions: ${measured} lines`);
  }
  assert.equal(forced, 2, "and the two named forced captions are the ones skipped");
});

test("a caption that fits where it is drawn today stays there", () => {
  for (const dress of DRESSES) {
    const plate = plateOf(42, "Laukuwelua", "Homaitani", dress);
    const { strip, p } = eventOf(plate, "waypoint", "Noloatatani");
    const free = p.sx > strip.x0 + strip.w / 2 ? -1 : 1;
    const want = { x: r1(p.sx + free * 10), y: r1(p.sy + 2.6 + 8.6) };
    assert.deepEqual(want, { x: 479, y: 544.6 }, `${dress}: premise: its own seat is the planned one`);
    const { x, y, anchor, size, backed } = firstLine(plate, "NOLOATATANI");
    assert.deepEqual(
      { x, y, anchor, size, backed },
      { ...want, anchor: free < 0 ? "end" : "start", size: 8.6, backed: false },
    );
  }
});

test("a side road's name keeps its own side while it has room, and crosses the road only when it has none", () => {
  for (const dress of DRESSES) {
    const road = plateOf(42, "Laukuwelua", "Homaitani", dress);
    const wuwatau = eventOf(road, "branch", "Wuwatau");
    assert.equal(wuwatau.e.side, -1, "premise: the road to Wuwatau leaves on the left");
    const line = firstLine(road, "to Wuwatau");
    assert.ok(line.anchor === "end" && line.x < wuwatau.p.sx, `${dress}: so its name stands on the left, end-anchored`);
    const selea = plateOf(99, "Mialiscove", "Lomor", dress);
    const s = eventOf(selea, "branch", "Selea");
    assert.equal(s.e.side, 1, "premise: the road to Selea leaves on the right");
    assert.equal(r1(s.p.sy - 9 + 2.6 + 8.2), 187, `${dress}: premise: today's seat for "to Selea" is the planned one`);
    const seat = firstLine(selea, "to Selea");
    assert.deepEqual([seat.anchor, seat.y], ["start", 171], `${dress}: it keeps its own side, 16 above today's seat`);
  }
  const road = plateOf(42, "Laukuwelua", "Homaitani", "antique");
  const { e, strip, p } = eventOf(road, "branch", "Lamahai");
  assert.equal(e.side, 1, "premise: the road to Lamahai leaves on the right");
  for (let dy = -32; dy <= 32; dy += 4) {
    const box = textBox(p.sx + 30, p.sy - 9 + 2.6 + dy + 8.2, "to Lamahai", 8.2, "start", WIDTH_FACTOR.mixed);
    assert.ok(
      pastRoom("antique", strip, box) > 0,
      `premise: no start-anchored seat at the stub's end fits, slid ${dy}`,
    );
  }
  const lamahai = firstLine(road, "to Lamahai");
  assert.ok(lamahai.anchor === "end" && lamahai.x < p.sx, "so it crosses to the left, end-anchored");
});

test("a name too long for either side is set across the road under its town, on a backing", () => {
  for (const dress of DRESSES) {
    const plate = plateOf(42, "Laukuwelua", "Homaitani", dress);
    const caption = captionOf(plate, "LAUKUWELUA");
    const line = caption.lines[0] as PlateCaptionLine;
    const attrs = attrsOf(plate.svg.match(new RegExp(`<text [^>]*>${line.text}</text>`))?.[0] ?? "");
    const road = roadXAt(caption.strip, line.box.y + 5);
    const room = roomOf(dress, caption.strip);
    const beside = [road - 10 - (room.left(line.box.y) + EDGE), room.right(line.box.y) - EDGE - (road + 10)];
    assert.ok(
      beside.every((w) => w < line.box.w),
      `${dress}: premise: wider than the room beside the road`,
    );
    assert.equal(line.anchor, "middle", `${dress}: it is set across the road`);
    assert.ok(Math.abs(line.x - road) <= 0.6, `${dress}: centred on the road (${line.x} against ${road})`);
    const ground = dress === "antique" ? (STYLES.antique.ribbonLimner?.landWash as string) : STYLES.ink.paper;
    assert.deepEqual([attrs.stroke, attrs["paint-order"]], [ground, "stroke"], `${dress}: on a backing of the ground`);
    assert.equal(line.size, dress === "antique" ? 10.5 : 8.4, `${dress}: at its size`);
  }
});

test("a long description is rewrapped narrower before anything is made smaller", () => {
  const caption = captionOf(plateOf(15, "Stanbyl", "Svidsvikov", "antique"), "Skuksvy");
  assert.deepEqual(
    caption.lines.map((l) => l.text),
    ["a bridge", "of stone", "over the", "River", "Skuksvy"],
  );
  assert.ok(
    caption.lines.every((l) => l.size === 8.2 && l.anchor === "start"),
    "each line at full size, start-anchored",
  );
});

const TAGS = new Set(["the capital", "a fair town", "a village", "a hamlet", "a place"]);

function scaleOf(caption: PlateCaption): number | null {
  const fits = (k: number, caps: number): boolean =>
    caption.lines.every((l) => l.size === r1((l.caps ? caps : TAGS.has(l.text) ? 7.6 : 8.2) * k));
  return [1, 0.9, 0.8, 0.7].find((k) => fits(k, 10.5) || fits(k, 8.6)) ?? null;
}

test("nothing is drawn smaller than seven tenths, and a group shrinks as one", () => {
  for (const dress of DRESSES) {
    for (const a of linesOf(dress).filter((x) => x.caption.lines[0] === x.line))
      assert.notEqual(scaleOf(a.caption), null, `${dress}: ${where(a)} is drawn at 1, 0.9, 0.8 or 0.7, as one group`);
  }
  const smaller = (p: Plate): Array<number | null> => p.captions.map(scaleOf).filter((k) => k !== null && k < 1);
  assert.ok(smaller(plateOf(15, "Stanbyl", "Ste", "antique")).includes(0.9), "premise: Stanbyl to Ste is set at 0.9");
  assert.ok(
    smaller(plateOf(99, "Mialiscove", "Minmari", "ink")).includes(0.7),
    "premise: Mialiscove to Minmari on ink is at 0.7",
  );
});

const inBox = (bs: ReadonlyArray<Box>, right: number): boolean =>
  bs.every((b) => b.x >= -EPS && b.x + b.w <= right + EPS && b.y >= -EPS && b.y + b.h <= 200 + EPS);

function crowd(bs: ReadonlyArray<Box>, keep: ReadonlyArray<Box>): number {
  const cut = (a: number, b: number, c: number, d: number): number =>
    Math.max(0, Math.min(a + b, c + d) - Math.max(a, c));
  return bs.reduce(
    (sum, b) => sum + keep.reduce((a, k) => a + cut(b.x, b.w, k.x, k.w) * cut(b.y, b.h, k.y, k.h), 0),
    0,
  );
}

test("a caption with no clear seat takes the least-crowded one inside its strip, on a backing", () => {
  const lines: SeatLine[] = [
    { text: "aaaaaaaaaa", caps: false, size: 8.2 },
    { text: "bbbbb", caps: false, size: 8.2 },
  ];
  const room = { left: () => 0, right: () => 100, top: 0, bottom: 200 };
  const want = {
    x: 60,
    top: 20,
    side: 1 as const,
    lines,
    roadX: () => 0,
    acrossTop: 26,
    sticky: false,
    rewrap: () => lines,
  };
  const keepBoxes = [
    { x: 0, y: 0, w: 100, h: 70 },
    { x: 0, y: 90, w: 100, h: 110 },
  ];
  const keep = { boxes: keepBoxes, discs: [{ x: 50, y: 150, r: 10 }], lines: [] };
  const w = 10 * 8.2 * WIDTH_FACTOR.mixed;
  const places = [0, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20, -24, 24, -28, 28, -32, 32].flatMap((dy) =>
    [
      { x: Math.min(60, 100 - w), anchor: "start" as const },
      { x: Math.max(-10, w), anchor: "end" as const },
    ].map((c) => [
      textBox(c.x, 20 + dy + 8.2, "aaaaaaaaaa", 8.2, c.anchor, WIDTH_FACTOR.mixed),
      textBox(c.x, 20 + dy + 9.4 + 8.2, "bbbbb", 8.2, c.anchor, WIDTH_FACTOR.mixed),
    ]),
  );
  const open = places.filter((bs) => inBox(bs, 100));
  assert.ok(
    open.length > 0 && open.length < places.length,
    "premise: some beside places lie in the room and some do not",
  );
  const seat = seatCaption(want, room, keep);
  assert.ok(seat.backed && inBox(seat.boxes, 100), "a seat with no clear place lies in the room, backed");
  assert.ok(
    Math.abs(crowd(seat.boxes, keepBoxes) - Math.min(...open.map((bs) => crowd(bs, keepBoxes)))) < EPS,
    "and is the least crowded of the places it could take",
  );
  const whole = seatCaption(want, room, { ...keep, boxes: [{ x: 0, y: 0, w: 100, h: 200 }], discs: [] });
  assert.ok(whole.backed && inBox(whole.boxes, 100), "and with the whole room kept it still lies in the room");
  const narrow = seatCaption(want, { ...room, right: () => 20 }, { boxes: [], discs: [], lines: [] });
  assert.ok(
    narrow.backed && narrow.scale < 1 && inBox(narrow.boxes, 20),
    "and a room narrower than the words takes them smaller",
  );
});
