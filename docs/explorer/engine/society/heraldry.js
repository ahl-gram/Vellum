const METALS = ["or", "argent"];
const COLOURS = ["gules", "azure", "sable", "vert", "purpure"];
const ORDINARIES = ["cross", "pale", "fess", "bend", "chevron"];
const DIVIDED = ["perPale", "perFess", "perBend", "perChevron", "quarterly"];
/** Charges each culture draws on, keyed by Culture.id. */
export const CULTURE_CHARGES = {
    thalassic: ["ship", "anchor", "trident"],
    norden: ["axe", "raven", "mountain"],
    veshari: ["sun", "crescent", "scimitar"],
    sylvan: ["oak", "leaf", "star"],
    oromi: ["wave", "fish", "turtle"],
    draket: ["tower", "sword", "flame"],
};
const FALLBACK_CHARGES = ["star", "sun", "crescent"];
export function isMetal(t) {
    return t === "or" || t === "argent";
}
/**
 * Verifies the rule of tincture from structure alone, independently of how the
 * arms were generated: a charge on a plain field must contrast its field by
 * metal-vs-colour class, and a division must be exactly one metal and one
 * colour and carry no overall charge.
 */
export function obeysTinctureRule(arms) {
    if (arms.division === "plain") {
        if (arms.field.length !== 1)
            return false;
        const field = arms.field[0];
        if (arms.charge === null)
            return true;
        return isMetal(field) !== isMetal(arms.charge.tincture);
    }
    if (arms.field.length !== 2)
        return false;
    const a = arms.field[0];
    const b = arms.field[1];
    if (isMetal(a) === isMetal(b))
        return false;
    return arms.charge === null;
}
function chargesFor(culture) {
    return CULTURE_CHARGES[culture.id] ?? FALLBACK_CHARGES;
}
function blazonOne(culture, rng) {
    if (rng.next() < 0.7) {
        // plain field + a charge whose class contrasts the field
        const metalField = rng.next() < 0.5;
        const field = rng.pick(metalField ? METALS : COLOURS);
        const chargeTincture = rng.pick(metalField ? COLOURS : METALS);
        const charge = rng.next() < 0.6
            ? { kind: "mobile", charge: rng.pick(chargesFor(culture)), tincture: chargeTincture }
            : { kind: "ordinary", ordinary: rng.pick(ORDINARIES), tincture: chargeTincture };
        return { division: "plain", field: [field], charge };
    }
    // a division: one metal + one colour, no overall charge
    const metal = rng.pick(METALS);
    const colour = rng.pick(COLOURS);
    const field = rng.next() < 0.5 ? [metal, colour] : [colour, metal];
    return { division: rng.pick(DIVIDED), field, charge: null };
}
/**
 * One coat of arms per realm, indexed by realm id. Each realm forks its own
 * stream off the heraldry rng, so a realm's arms are stable no matter how many
 * realms the world ends up with.
 */
export function blazonRealms(culture, count, rng) {
    const out = [];
    for (let i = 0; i < count; i++) {
        out.push(blazonOne(culture, rng.fork(String(i))));
    }
    return out;
}
