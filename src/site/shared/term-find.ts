// The Glossary's find box (#462 ruling 4): narrows the index to term names matching what is typed, names only, never the definitions.

export interface Hit {
  readonly hit: boolean;
  readonly miss: boolean;
}

/** An empty query clears every mark; otherwise a term is a hit when its name contains the query, case-folded, and a miss when it does not. */
export function findMarks(names: readonly string[], query: string): readonly Hit[] {
  const q = query.trim().toLowerCase();
  return names.map((name) => {
    const hit = q !== "" && name.toLowerCase().includes(q);
    return { hit, miss: q !== "" && !hit };
  });
}

/** A section with a query and no hit folds away; with no query every section stands. */
export const sectionEmpty = (marks: readonly Hit[], query: string): boolean =>
  query.trim() !== "" && !marks.some((m) => m.hit);
