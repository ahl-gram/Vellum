/** Binary min-heap of (index, value) pairs. Pop returns the index of the minimum value. */
export function createMinHeap() {
    const idx = [];
    const val = [];
    const swap = (a, b) => {
        const ti = idx[a];
        idx[a] = idx[b];
        idx[b] = ti;
        const tv = val[a];
        val[a] = val[b];
        val[b] = tv;
    };
    return {
        size: () => idx.length,
        push(i, v) {
            idx.push(i);
            val.push(v);
            let c = idx.length - 1;
            while (c > 0) {
                const p = (c - 1) >> 1;
                if (val[p] <= val[c])
                    break;
                swap(p, c);
                c = p;
            }
        },
        pop() {
            if (idx.length === 0)
                throw new RangeError("pop on empty heap");
            const top = idx[0];
            const lastI = idx.pop();
            const lastV = val.pop();
            if (idx.length > 0) {
                idx[0] = lastI;
                val[0] = lastV;
                let p = 0;
                for (;;) {
                    const l = p * 2 + 1;
                    const r = l + 1;
                    let m = p;
                    if (l < idx.length && val[l] < val[m])
                        m = l;
                    if (r < idx.length && val[r] < val[m])
                        m = r;
                    if (m === p)
                        break;
                    swap(p, m);
                    p = m;
                }
            }
            return top;
        },
    };
}
