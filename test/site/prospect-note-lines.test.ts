import { test } from "node:test";
import assert from "node:assert/strict";
import { eraLine, subLine, whereLine } from "../../src/site/prospect/note-lines.ts";

test("eraLine names the era and the year", () => {
  assert.equal(eraLine({ era: "standing", year: 1059 }), "Standing · An. 1059");
  assert.equal(eraLine({ era: "ruined", year: 1039 }), "Ruined · An. 1039");
  assert.equal(eraLine({ era: "before-founding", year: 300 }), "Before the founding · An. 300");
});

test("whereLine is the epithet with the founding, except before the founding, when the epithet already carries the year", () => {
  assert.equal(whereLine({ era: "standing", epithet: "chief port of the Chiefdom of Rekekoa", founded: 451 }), "chief port of the Chiefdom of Rekekoa · founded An. 451");
  assert.equal(whereLine({ era: "ruined", epithet: "thrown down An. 1039", founded: 812 }), "thrown down An. 1039 · founded An. 812");
  assert.equal(whereLine({ era: "before-founding", epithet: "the ground where Paukilua will rise · An. 300", founded: 812 }), "the ground where Paukilua will rise · An. 300");
});

test("subLine is the world with the former name when there is one, else the room's line", () => {
  assert.equal(subLine({ title: "The Isle of Rahai", formerName: "Haitani" }), "The Isle of Rahai · once called Haitani");
  assert.equal(subLine({ title: "The Isle of Rahai" }), "The Isle of Rahai · drawn side-on from the town's own ground");
});
