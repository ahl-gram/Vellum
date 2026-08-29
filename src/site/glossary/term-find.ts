// The Glossary's find box (#462 ruling 4).

export interface Hit {
  readonly hit: boolean;
  readonly miss: boolean;
}

export function findMarks(names: readonly string[], query: string): readonly Hit[] {
  const q = query.trim().toLowerCase();
  return names.map((name) => {
    const hit = q !== "" && name.toLowerCase().includes(q);
    return { hit, miss: q !== "" && !hit };
  });
}

export const sectionEmpty = (marks: readonly Hit[], query: string): boolean =>
  query.trim() !== "" && !marks.some((m) => m.hit);
