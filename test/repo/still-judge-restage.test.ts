import assert from "node:assert/strict";
import { test } from "node:test";
import { carriesEverySubject, cropClip, RESTAGES, withStyle, witnessFails } from "../../scripts/still-judge/restage.ts";
import { RAIN, SHEET } from "../../test-support/still-judge-fixtures.ts";

const CASING = '<rect class="range-casing" transform="rotate(32.0 586.4 686.1)"/>';
const without = (svg: string, part: string): string => {
  assert.ok(svg.includes(part), part);
  return svg.replace(part, "");
};

test("a restage's style goes in once, straight after the sheet's opening tag, and the rest of the sheet is unchanged", () => {
  assert.equal(
    withStyle('<svg width="1500" height="1158"><g id="layer-ocean"/></svg>', "a{b:c}"),
    '<svg width="1500" height="1158"><style>a{b:c}</style><g id="layer-ocean"/></svg>',
  );
  assert.throws(() => withStyle("<g/>", "x"), /no <svg> tag/);
});

test("a chart carries every subject only with a realm name, one range name, a title, and rainfall and wind lines on its rainfall twin", () => {
  assert.equal(carriesEverySubject(SHEET, RAIN), true);
  const sheets = {
    "no realm name": SHEET.replace('font-weight="700"', 'font-weight="400"'),
    "no range name": without(SHEET, CASING),
    "two range names": SHEET.replace(CASING, `${CASING}<rect class="range-casing" transform="rotate(0 1.0 1.0)"/>`),
    "no title": without(SHEET, '<text font-size="27.0">The Isle</text>'),
    "no legend": without(SHEET, '<g id="layer-legend"></g>'),
  };
  for (const [what, sheet] of Object.entries(sheets)) assert.equal(carriesEverySubject(sheet, RAIN), false, what);
  assert.equal(carriesEverySubject(SHEET, without(RAIN, '<path d="M0 0" stroke="#78765f"/>')), false, "no rainfall line");
  assert.equal(carriesEverySubject(SHEET, without(RAIN, '<path d="M0 0" stroke="#4a3826"/>')), false, "no wind line");
});

test("the crop is 600 by 400 around the range name's centre, and stays inside the sheet", () => {
  assert.deepEqual(cropClip(SHEET), { x: 286, y: 486, width: 600, height: 400 });
  const at = (rotation: string): string => SHEET.replace("rotate(32.0 586.4 686.1)", rotation);
  assert.deepEqual(cropClip(at("rotate(0 100.0 50.0)")), { x: 0, y: 0, width: 600, height: 400 });
  assert.deepEqual(cropClip(at("rotate(-12.5 1450.0 1150.0)")), { x: 900, y: 758, width: 600, height: 400 });
  assert.throws(() => cropClip(without(SHEET, CASING)), /no mountain range name/);
});

test("a restage took when its witness matched elements and read the restaged value, and failed otherwise", () => {
  assert.equal(witnessFails(RESTAGES[0]!, '{"matched":9,"value":"0.45"}'), false);
  assert.equal(witnessFails(RESTAGES[0]!, '{"matched":0,"value":null}'), true);
  assert.equal(witnessFails(RESTAGES[0]!, '{"matched":9,"value":"0.72"}'), true);
  assert.equal(witnessFails(RESTAGES[0]!, null), true);
  assert.equal(witnessFails(RESTAGES[3]!, '{"matched":1,"value":"10.5px"}'), false);
});
