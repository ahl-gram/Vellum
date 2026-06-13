import { quantile } from "../core/grid.js";
export function extractRivers(elev, flow, seaLevel, opts = {}) {
    const { quantileQ = 0.985, minAcc = 8, minLength = 3 } = opts;
    const { w, data } = elev;
    const { dir, acc } = flow;
    const n = data.length;
    const landAcc = [];
    for (let i = 0; i < n; i++) {
        if (data[i] > seaLevel)
            landAcc.push(acc[i]);
    }
    if (landAcc.length === 0)
        return [];
    const threshold = Math.max(quantile(landAcc, quantileQ), minAcc);
    const isRiver = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        isRiver[i] =
            data[i] > seaLevel && acc[i] >= threshold ? 1 : 0;
    }
    // upstream adjacency + mouths (river cells draining into ocean)
    const children = new Map();
    const mouths = [];
    for (let i = 0; i < n; i++) {
        if (!isRiver[i])
            continue;
        const d = dir[i];
        if (d < 0)
            continue;
        if (data[d] <= seaLevel) {
            mouths.push(i);
        }
        else {
            const list = children.get(d);
            if (list)
                list.push(i);
            else
                children.set(d, [i]);
        }
    }
    const point = (i) => ({
        x: i % w,
        y: (i / w) | 0,
        acc: acc[i],
    });
    const stack = [];
    for (const m of mouths) {
        stack.push({ cell: m, tail: point(dir[m]), endsInOcean: true });
    }
    const rivers = [];
    while (stack.length > 0) {
        const { cell, tail, endsInOcean } = stack.pop();
        const downToUp = [cell];
        let cur = cell;
        for (;;) {
            const kids = children.get(cur);
            if (!kids || kids.length === 0)
                break;
            let main = kids[0];
            for (const k of kids) {
                if (acc[k] > acc[main])
                    main = k;
            }
            for (const k of kids) {
                if (k !== main) {
                    stack.push({ cell: k, tail: point(cur), endsInOcean: false });
                }
            }
            downToUp.push(main);
            cur = main;
        }
        const points = downToUp.reverse().map(point);
        points.push(tail);
        if (points.length >= minLength) {
            rivers.push({ points, endsInOcean });
        }
    }
    return rivers;
}
