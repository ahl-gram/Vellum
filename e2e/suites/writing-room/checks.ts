import { foundWorld } from "../../../src/world/founding/found.ts";
import { writtenHash } from "../../../src/site/writing-room/address.ts";
import type { Read, WritingKit } from "./kit.ts";

const FLAGSHIP = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const TEXAS = "tropical island in the shape of Texas";
const TEXAS_ID = "ne-1159315211";
const CLIMATE = "Upon the frozen roof of the world the herdsmen of Vael keep their reindeer and their grudges.";
const NO_WORD = "make a world that sdfhs fhsdfhsdf dsfhds";
const ALL_CANCEL = "a tropical polar waste";

const show = (r: Read): string =>
  JSON.stringify({ n: r.n, seed: r.svgSeed, culture: r.culture, text: r.text, hash: r.hash });

export async function wr1Link(k: WritingKit): Promise<void> {
  const reads: string[] = [];
  let ok = true;
  for (const sentence of [FLAGSHIP, CLIMATE]) {
    const f = foundWorld(sentence);
    if (!f.ok) throw new Error(`${sentence} did not found in Node`);
    const first = await k.goto(writtenHash(sentence, 1));
    const again = await k.reload();
    const agrees = (r: Read): boolean =>
      r.svgSeed === String(f.seed) && r.culture === f.overrides.culture && r.text === f.sentence;
    ok &&= agrees(first) && agrees(again);
    reads.push(`${show(first)} then ${show(again)}`);
  }
  k.check(
    "WR1 a written link founds its world, and the same world again after a reload, the bare visit's own sentence and one that is not: the chart's seed, naming tongue and lettered sentence are those Node's founding gives",
    ok,
    reads.join(" | "),
  );
}

export async function wr2Shape(k: WritingKit): Promise<void> {
  const r = await k.goto(writtenHash(TEXAS, 1));
  k.check(
    "WR2 a sentence asking for a real place's shape fetches the place names and draws the place",
    r.outline === TEXAS_ID && r.refusalText === "",
    show(r) + ` outline ${r.outline} refusal "${r.refusalText}"`,
  );
}

export async function wr3Refusal(k: WritingKit): Promise<void> {
  const link = writtenHash(FLAGSHIP, 1);
  const before = await k.goto(link);
  await k.setLine("x".repeat(121));
  await k.pressAt("#wr-form button[type=submit]");
  const after = await k.settledAfter(before.n, "its refusal");
  const bare = await k.goto(writtenHash("x".repeat(121), 1));
  k.check(
    "WR3 a refused sentence leaves the last world, its account and its link standing, and says why, and a link that is refused before any world stands leaves no founding pill over the empty sheet",
    after.refusal === "too-long" &&
      after.refusalText !== "" &&
      after.svgSeed === "1858074817" &&
      !after.quiet &&
      after.hash === link &&
      bare.refusal === "too-long" &&
      bare.status === "",
    `${show(after)} refusal ${after.refusal} "${after.refusalText}"; by link: refusal ${bare.refusal} svg ${bare.svgSeed} status "${bare.status}"`,
  );
}

export async function wr4Plate(k: WritingKit): Promise<void> {
  const opened = await k.goto(writtenHash(CLIMATE, 1));
  await k.pressAt("#wr-plate");
  const lifted = await k.settledAfter(opened.n, "the plate's redraw");
  const plain = await k.goto(writtenHash(FLAGSHIP, 1));
  k.check(
    "WR4 a world founded on its climate opens on the vegetation plate, any other on the plain chart, and the press lifts and lays it",
    opened.field &&
      opened.plate &&
      opened.verb === "Lift" &&
      !lifted.field &&
      !lifted.plate &&
      lifted.verb === "Lay on" &&
      !plain.field,
    `opened field ${opened.field} plate ${opened.plate} verb ${opened.verb}; pressed field ${lifted.field} verb ${lifted.verb}; flagship field ${plain.field}`,
  );
}

export async function wr5Lettering(k: WritingKit): Promise<void> {
  const none = await k.goto(writtenHash(NO_WORD, 1));
  const cancelled = await k.goto(writtenHash(ALL_CANCEL, 1));
  const flagship = await k.goto(writtenHash(FLAGSHIP, 1));
  k.check(
    "WR5 a sentence is lettered only when a word was recognised, and the quiet line shows when none steered",
    none.text === null && none.quiet && cancelled.text === ALL_CANCEL && cancelled.quiet && !flagship.quiet,
    `no word: text ${none.text} quiet ${none.quiet}; all cancel: text ${cancelled.text} quiet ${cancelled.quiet}; flagship quiet ${flagship.quiet}`,
  );
}

export async function wr6Written(k: WritingKit): Promise<void> {
  const f = foundWorld(CLIMATE);
  if (!f.ok) throw new Error("the climate sentence did not found in Node");
  const link = writtenHash(CLIMATE, 1);
  const before = await k.goto(writtenHash(FLAGSHIP, 1));
  await k.setLine(CLIMATE);
  await k.pressAt("#wr-form button[type=submit]");
  const pressed = await k.settledAfter(before.n, "the founding of a written sentence");
  const fresh = await k.goto(pressed.hash);
  k.check(
    "WR6 a sentence founded in the room writes its own link, and that link opened fresh founds the same world",
    pressed.hash === link && pressed.svgSeed === String(f.seed) && fresh.svgSeed === String(f.seed),
    `pressed ${show(pressed)} then fresh ${show(fresh)} want ${link}`,
  );
}

export async function wr7FailedDraw(k: WritingKit): Promise<void> {
  const link = writtenHash(FLAGSHIP, 1);
  const before = await k.goto(link);
  await k.blockUrls([`*/outlines/${TEXAS_ID}.txt*`]);
  try {
    await k.setLine(TEXAS);
    await k.pressAt("#wr-form button[type=submit]");
    await k.statusStarts("The ink would not take");
  } finally {
    await k.blockUrls([]);
  }
  const after = await k.read();
  k.check(
    "WR7 a draw that fails leaves the last world, its account and its link standing, and says so",
    after.account === before.account &&
      after.account !== "" &&
      after.svgSeed === before.svgSeed &&
      after.hash === link &&
      after.status.startsWith("The ink would not take"),
    `${show(after)} status "${after.status}" account kept ${after.account === before.account}`,
  );
}
