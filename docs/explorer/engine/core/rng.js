/**
 * Deterministic seeded PRNG (mulberry32) with labeled fork streams.
 *
 * Forks derive from the parent SEED + label, never from stream position,
 * so `rng.fork("names")` yields the same stream no matter how many draws
 * happened before — adding pipeline stages never reshuffles other stages.
 *
 * Rng instances are the project's one sanctioned stateful object: a PRNG is
 * a stream by nature, and a pure state-passing API would infect every
 * consumer. Everything an Rng produces is immutable.
 */
export function hashString(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
function fmix32(h) {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
}
export function createRng(seed) {
    let state = fmix32(seed >>> 0) || 0x9e3779b9;
    const next = () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        seed: seed >>> 0,
        next,
        int(maxExclusive) {
            if (maxExclusive < 1) {
                throw new RangeError(`int() needs a positive max, got ${maxExclusive}`);
            }
            return Math.floor(next() * maxExclusive);
        },
        range(min, max) {
            return min + next() * (max - min);
        },
        pick(items) {
            if (items.length === 0) {
                throw new RangeError("pick() called with an empty array");
            }
            return items[Math.floor(next() * items.length)];
        },
        shuffled(items) {
            const out = [...items];
            for (let i = out.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                const tmp = out[i];
                out[i] = out[j];
                out[j] = tmp;
            }
            return out;
        },
        fork(label) {
            return createRng(fmix32((seed >>> 0) ^ hashString(label) ^ 0x9e3779b9));
        },
    };
}
