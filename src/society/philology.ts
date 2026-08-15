import { CULTURES } from "./names.ts";
import type { Culture } from "./names.ts";
import { PHILOLOGY_LEXICON } from "./philology-lexicon.ts";

export type Syllable = {
  readonly onset: string;
  readonly nucleus: string;
  readonly coda: string;
};

export type Segmentation = {
  readonly syllables: readonly Syllable[];
  readonly suffix: string;
  readonly repair: string;
  readonly chunks: readonly string[];
};

export type RootGloss = {
  readonly root: string;
  readonly gloss: string;
};

export type NameGloss = {
  readonly tongue: string;
  readonly syllabified: string;
  readonly roots: readonly RootGloss[];
};

const OVERFLOW_TAIL = / (?:[IVX]+|\d+)$/;
const VOWELS = ["a", "e", "i", "o", "u"];
const NUCLEUS_LETTER = /[aeiouy]/;

type Inventory = {
  readonly onsets: readonly string[];
  readonly nuclei: readonly string[];
  readonly codas: readonly string[];
  readonly suffixes: readonly string[];
};

const byId = new Map(CULTURES.map((c) => [c.id, c]));
const INVENTORIES: ReadonlyMap<string, Inventory> = new Map(
  CULTURES.map((c) => [c.id, {
    onsets: [...new Set(c.onsets)],
    nuclei: [...new Set(c.nuclei)],
    codas: [...new Set(c.codas)],
    suffixes: [...new Set(c.townSuffixes)].filter((s) => s !== ""),
  }]),
);

export function cultureById(id: string): Culture | undefined {
  return byId.get(id);
}

export function tongueName(cultureId: string): string {
  return cultureId.charAt(0).toUpperCase() + cultureId.slice(1);
}

function rootCount(syllables: readonly Syllable[]): number {
  let n = 0;
  for (const s of syllables) {
    if (s.onset) n++;
    if (s.coda) n++;
  }
  return n;
}

function betterShape(a: readonly Syllable[], b: readonly Syllable[]): boolean {
  for (let i = 0; i < a.length && i < b.length; i++) {
    const x = a[i] as Syllable;
    const y = b[i] as Syllable;
    if (x.onset.length !== y.onset.length) return x.onset.length > y.onset.length;
    if (x.nucleus.length !== y.nucleus.length) return x.nucleus.length > y.nucleus.length;
    if (x.coda.length !== y.coda.length) return x.coda.length > y.coda.length;
  }
  return false;
}

function betterParse(a: readonly Syllable[], b: readonly Syllable[]): boolean {
  const ra = rootCount(a);
  const rb = rootCount(b);
  if (ra !== rb) return ra > rb;
  if (a.length !== b.length) return a.length < b.length;
  return betterShape(a, b);
}

function parseBase(base: string, inv: Inventory): readonly Syllable[] | null {
  const memo = new Map<number, readonly Syllable[] | null>();
  const solve = (i: number): readonly Syllable[] | null => {
    if (i === base.length) return [];
    const hit = memo.get(i);
    if (hit !== undefined) return hit;
    let best: readonly Syllable[] | null = null;
    for (const onset of inv.onsets) {
      if (!base.startsWith(onset, i)) continue;
      const afterOnset = i + onset.length;
      for (const nucleus of inv.nuclei) {
        if (!base.startsWith(nucleus, afterOnset)) continue;
        const afterNucleus = afterOnset + nucleus.length;
        for (const coda of inv.codas) {
          if (!base.startsWith(coda, afterNucleus)) continue;
          const rest = solve(afterNucleus + coda.length);
          if (!rest) continue;
          const candidate = [{ onset, nucleus, coda }, ...rest];
          if (!best || betterParse(candidate, best)) best = candidate;
        }
      }
    }
    memo.set(i, best);
    return best;
  };
  return solve(0);
}

type Candidate = {
  readonly syllables: readonly Syllable[];
  readonly suffix: string;
  readonly repair: string;
  readonly baseLen: number;
};

function betterCandidate(a: Candidate, b: Candidate): boolean {
  const ra = rootCount(a.syllables) + (a.suffix ? 2 : 0);
  const rb = rootCount(b.syllables) + (b.suffix ? 2 : 0);
  if (ra !== rb) return ra > rb;
  if (a.syllables.length !== b.syllables.length) return a.syllables.length < b.syllables.length;
  if (Boolean(a.repair) !== Boolean(b.repair)) return !a.repair;
  return betterShape(a.syllables, b.syllables);
}

function candidatesFor(stem: string, inv: Inventory): Candidate[] {
  const out: Candidate[] = [];
  const bare = parseBase(stem, inv);
  if (bare) out.push({ syllables: bare, suffix: "", repair: "", baseLen: stem.length });
  for (const suffix of inv.suffixes) {
    if (!stem.endsWith(suffix)) continue;
    const base = stem.slice(0, stem.length - suffix.length);
    if (base.length < 3) continue;
    const head = suffix.charAt(0);
    const repairs = new Set(["", head, ...(VOWELS.includes(head) ? VOWELS : [])]);
    for (const repair of repairs) {
      const syllables = parseBase(base + repair, inv);
      if (syllables) out.push({ syllables, suffix, repair, baseLen: base.length });
    }
  }
  return out;
}

function chunksFor(candidate: Candidate): string[] {
  const spelled: string[] = [];
  let used = 0;
  for (const s of candidate.syllables) {
    const room = candidate.baseLen - used;
    if (room <= 0) break;
    const whole = s.onset + s.nucleus + s.coda;
    const piece = whole.length <= room ? whole : whole.slice(0, room);
    if (piece) spelled.push(piece);
    used += piece.length;
  }
  const tail = spelled[spelled.length - 1];
  const base =
    spelled.length > 1 && tail !== undefined && !NUCLEUS_LETTER.test(tail)
      ? [...spelled.slice(0, -2), `${spelled[spelled.length - 2]}${tail}`]
      : spelled;
  return candidate.suffix ? [...base, candidate.suffix] : base;
}

export function segmentName(name: string, cultureId: string): Segmentation | null {
  const culture = cultureById(cultureId);
  if (!culture) return null;
  const stem = name.trim().replace(OVERFLOW_TAIL, "").toLowerCase();
  if (!stem) return null;
  const inventory = INVENTORIES.get(culture.id);
  if (!inventory) return null;
  let best: Candidate | null = null;
  for (const candidate of candidatesFor(stem, inventory)) {
    if (!best || betterCandidate(candidate, best)) best = candidate;
  }
  if (!best) return null;
  return {
    syllables: best.syllables,
    suffix: best.suffix,
    repair: best.repair,
    chunks: chunksFor(best),
  };
}

export function glossName(name: string, cultureId: string): NameGloss | null {
  const lexicon = PHILOLOGY_LEXICON[cultureId];
  if (!lexicon) return null;
  const seg = segmentName(name, cultureId);
  if (!seg) return null;
  const roots: RootGloss[] = [];
  const seen = new Set<string>();
  const add = (root: string, gloss: string | undefined): void => {
    if (!gloss || seen.has(root)) return;
    seen.add(root);
    roots.push({ root, gloss });
  };
  for (const s of seg.syllables) {
    if (s.onset) add(s.onset, lexicon.onsets[s.onset]);
    if (s.coda) add(`-${s.coda}`, lexicon.codas[s.coda]);
  }
  if (seg.suffix) add(`-${seg.suffix}`, lexicon.suffixes[seg.suffix]);
  if (roots.length === 0) return null;
  const spelled = seg.chunks.join("·");
  return {
    tongue: tongueName(cultureId),
    syllabified: spelled.charAt(0).toUpperCase() + spelled.slice(1),
    roots,
  };
}
