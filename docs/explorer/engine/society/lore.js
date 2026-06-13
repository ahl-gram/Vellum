import { BIOMES } from "../climate/biomes.js";
/**
 * Travelers' notes for the atlas gazetteer: one or two deterministic
 * sentences per settlement, flavored by culture, situation, and rank.
 * A LoreWriter owns its repeat-avoidance memory, so one writer per
 * gazetteer pass keeps neighboring entries from echoing each other.
 */
const GOODS = {
    thalassic: ["salt cod", "pearl-shell", "amber", "dyed sailcloth", "olive oil"],
    norden: ["whale oil", "iron blooms", "pine tar", "sealskin", "smoked herring"],
    veshari: ["saffron", "indigo", "dates", "rose attar", "glazed tiles"],
    sylvan: ["heather honey", "cider", "willow-bark", "wool", "carved oak"],
    oromi: ["dried fish", "black pearls", "feather cloaks", "obsidian", "palm wine"],
    draket: ["iron ingots", "black granite", "wolf pelts", "siege timber", "bitter ale"],
};
const HARBOR_NOTES = [
    "Its quays smell of % and old rope.",
    "A breakwater of grey stone shelters boats laden with %.",
    "Pilots here will see a ship past the shoals for a fair price.",
    "The harbor bell rings whenever fog comes off the water.",
    "Ships water here before standing out to the deep.",
    "Half the town turns out when a sail crests the horizon.",
];
const RIVER_NOTES = [
    "Barges put in here loaded with %.",
    "A weathered ferry crosses on a rope older than its ferryman.",
    "The mill wheel turns all year on the cold current.",
    "Floods leave the lower lanes ankle-deep each spring.",
    "Eels from this reach are said to be the realm's finest.",
    "The bridge toll is one coin, two for strangers.",
];
const INLAND_NOTES = [
    "Drovers rest their herds by the old market cross.",
    "Known along the road for its stubborn mules and honest scales.",
    "The inn keeps a fire lit for travelers come down from the hills.",
    "Little happens here, which suits its people well.",
    "Its wool is traded three valleys away under the name %.",
    "An old beacon tower watches the road from the rise.",
];
const CAPITAL_NOTES = [
    "Here the court keeps its ledgers, levies, and grudges.",
    "Its walls were raised thrice and breached only once.",
    "All roads on this chart, sooner or later, lead here.",
];
const REALM_MOODS = [
    "keeps its own counsel",
    "pays its tithes late",
    "claims the better fishing grounds",
    "remembers older borders",
    "mints a thinner coin",
];
const BIOME_NOTES = {
    [BIOMES.marsh]: "Reed-cutters work the fens at low water.",
    [BIOMES.desert]: "Wells here are deep, and guarded jealously.",
    [BIOMES.taiga]: "Snow lies on the rooftops half the year.",
    [BIOMES.jungle]: "The forest takes back any field left fallow a season.",
    [BIOMES.tundra]: "Winters here are measured in lamp-oil.",
};
export function createLoreWriter(world, rng) {
    const goods = (GOODS[world.culture.id] ?? GOODS["thalassic"]);
    const recent = new Map();
    const freshPick = (list) => {
        let seen = recent.get(list);
        if (!seen) {
            seen = [];
            recent.set(list, seen);
        }
        for (let attempt = 0; attempt < 4; attempt++) {
            const candidate = rng.pick(list);
            if (!seen.includes(candidate)) {
                seen.push(candidate);
                if (seen.length > Math.floor(list.length / 2))
                    seen.shift();
                return candidate;
            }
        }
        return rng.pick(list);
    };
    const fill = (template) => template.replace("%", rng.pick(goods));
    return {
        settlementNote(s) {
            const parts = [];
            if (s.kind === "capital") {
                parts.push(freshPick(CAPITAL_NOTES));
            }
            if (s.harbor) {
                parts.push(fill(freshPick(HARBOR_NOTES)));
            }
            else if (s.onRiver) {
                parts.push(fill(freshPick(RIVER_NOTES)));
            }
            else {
                parts.push(fill(freshPick(INLAND_NOTES)));
            }
            const biome = world.biomes[s.x + s.y * world.elev.w];
            const biomeNote = BIOME_NOTES[biome];
            if (biomeNote && s.kind !== "capital" && rng.next() < 0.7) {
                parts.push(biomeNote);
            }
            return parts.join(" ");
        },
        realmNote(realmName) {
            return `${realmName} ${freshPick(REALM_MOODS)}.`;
        },
    };
}
