/**
 * True when two strings are within Levenshtein edit distance 1 (including
 * identical). Early-exits, so it never builds the full DP matrix — used to
 * screen generated name bases against near-duplicates.
 */
export function editDistanceWithin1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;

  if (la === lb) {
    // a single substitution (a === b already handled)
    let diffs = 0;
    for (let i = 0; i < la; i++) {
      if (a[i] !== b[i]) {
        diffs++;
        if (diffs > 1) return false;
      }
    }
    return true;
  }

  // lengths differ by one: a single insertion/deletion
  const shorter = la < lb ? a : b;
  const longer = la < lb ? b : a;
  let i = 0;
  let j = 0;
  let edited = false;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
    } else {
      if (edited) return false;
      edited = true;
      j++; // skip the extra character in the longer string
    }
  }
  return true;
}
