/** Binary min-heap of (index, value) pairs. Pop returns the index of the minimum value. */

export type MinHeap = {
  push(idx: number, val: number): void;
  pop(): number;
  size(): number;
};

export function createMinHeap(): MinHeap {
  const idx: number[] = [];
  const val: number[] = [];

  const swap = (a: number, b: number): void => {
    const ti = idx[a] as number;
    idx[a] = idx[b] as number;
    idx[b] = ti;
    const tv = val[a] as number;
    val[a] = val[b] as number;
    val[b] = tv;
  };

  return {
    size: () => idx.length,
    push(i: number, v: number): void {
      idx.push(i);
      val.push(v);
      let c = idx.length - 1;
      while (c > 0) {
        const p = (c - 1) >> 1;
        if ((val[p] as number) <= (val[c] as number)) break;
        swap(p, c);
        c = p;
      }
    },
    pop(): number {
      if (idx.length === 0) throw new RangeError("pop on empty heap");
      const top = idx[0] as number;
      const lastI = idx.pop() as number;
      const lastV = val.pop() as number;
      if (idx.length > 0) {
        idx[0] = lastI;
        val[0] = lastV;
        let p = 0;
        for (;;) {
          const l = p * 2 + 1;
          const r = l + 1;
          let m = p;
          if (l < idx.length && (val[l] as number) < (val[m] as number)) m = l;
          if (r < idx.length && (val[r] as number) < (val[m] as number)) m = r;
          if (m === p) break;
          swap(p, m);
          p = m;
        }
      }
      return top;
    },
  };
}
