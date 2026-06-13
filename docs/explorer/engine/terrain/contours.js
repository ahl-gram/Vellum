// Clamp keeps crossings off exact lattice corners, where four cells
// would share one point and chain-walking would become ambiguous.
const T_MIN = 1e-6;
const T_MAX = 1 - 1e-6;
function crossT(a, b, iso) {
    const t = (iso - a) / (b - a);
    return t < T_MIN ? T_MIN : t > T_MAX ? T_MAX : t;
}
function key(x, y) {
    return `${Math.round(x * 1e6)},${Math.round(y * 1e6)}`;
}
export function marchingSquares(field, iso) {
    const { w, h, data } = field;
    const segs = [];
    for (let y = 0; y < h - 1; y++) {
        for (let x = 0; x < w - 1; x++) {
            const a = data[x + y * w];
            const b = data[x + 1 + y * w];
            const c = data[x + 1 + (y + 1) * w];
            const d = data[x + (y + 1) * w];
            const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
            if (idx === 0 || idx === 15)
                continue;
            const top = [x + crossT(a, b, iso), y];
            const right = [x + 1, y + crossT(b, c, iso)];
            const bottom = [x + crossT(d, c, iso), y + 1];
            const left = [x, y + crossT(a, d, iso)];
            const add = (p, q) => {
                segs.push([p[0], p[1], q[0], q[1]]);
            };
            switch (idx) {
                case 1:
                    add(bottom, left);
                    break;
                case 2:
                    add(right, bottom);
                    break;
                case 3:
                    add(right, left);
                    break;
                case 4:
                    add(top, right);
                    break;
                case 5: {
                    const center = (a + b + c + d) / 4;
                    if (center > iso) {
                        add(top, left);
                        add(bottom, right);
                    }
                    else {
                        add(top, right);
                        add(bottom, left);
                    }
                    break;
                }
                case 6:
                    add(top, bottom);
                    break;
                case 7:
                    add(top, left);
                    break;
                case 8:
                    add(left, top);
                    break;
                case 9:
                    add(bottom, top);
                    break;
                case 10: {
                    const center = (a + b + c + d) / 4;
                    if (center > iso) {
                        add(right, top);
                        add(left, bottom);
                    }
                    else {
                        add(left, top);
                        add(right, bottom);
                    }
                    break;
                }
                case 11:
                    add(right, top);
                    break;
                case 12:
                    add(left, right);
                    break;
                case 13:
                    add(bottom, right);
                    break;
                case 14:
                    add(left, bottom);
                    break;
            }
        }
    }
    return chainSegments(segs);
}
function chainSegments(segs) {
    const byStart = new Map();
    for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        const k = key(s[0], s[1]);
        const list = byStart.get(k);
        if (list)
            list.push(i);
        else
            byStart.set(k, [i]);
    }
    const used = new Uint8Array(segs.length);
    const contours = [];
    const takeFrom = (k) => {
        const list = byStart.get(k);
        if (!list)
            return -1;
        while (list.length > 0) {
            const i = list.pop();
            if (!used[i])
                return i;
        }
        return -1;
    };
    for (let i = 0; i < segs.length; i++) {
        if (used[i])
            continue;
        used[i] = 1;
        const first = segs[i];
        const points = [[first[0], first[1]], [first[2], first[3]]];
        const startKey = key(first[0], first[1]);
        // walk forward from the chain's end
        let endKey = key(first[2], first[3]);
        while (endKey !== startKey) {
            const next = takeFrom(endKey);
            if (next === -1)
                break;
            used[next] = 1;
            const s = segs[next];
            points.push([s[2], s[3]]);
            endKey = key(s[2], s[3]);
        }
        const closed = endKey === startKey;
        if (closed) {
            contours.push({ points, closed });
            continue;
        }
        // open chain: extend backward from the start (we may have begun mid-chain)
        const prefix = [];
        let headKey = startKey;
        for (;;) {
            let found = -1;
            for (let j = 0; j < segs.length; j++) {
                if (used[j])
                    continue;
                const s = segs[j];
                if (key(s[2], s[3]) === headKey) {
                    found = j;
                    break;
                }
            }
            if (found === -1)
                break;
            used[found] = 1;
            const s = segs[found];
            prefix.push([s[0], s[1]]);
            headKey = key(s[0], s[1]);
        }
        prefix.reverse();
        contours.push({ points: [...prefix, ...points], closed: false });
    }
    return contours;
}
/**
 * Close open chains against the grid boundary rectangle by walking the
 * border counterclockwise in screen coords (interior — the "above"
 * region — stays on the left), splicing in corners as they pass.
 * Closed input rings pass through untouched.
 */
export function closeChainsOnBoundary(contours, w, h) {
    const W = w - 1;
    const H = h - 1;
    const P = 2 * W + 2 * H;
    const eps = 1e-4;
    const tOf = (p) => {
        const [x, y] = p;
        if (x <= eps)
            return y; // left edge, walking down
        if (y >= H - eps)
            return H + x; // bottom edge, walking right
        if (x >= W - eps)
            return H + W + (H - y); // right edge, walking up
        if (y <= eps)
            return 2 * H + W + (W - x); // top edge, walking left
        throw new RangeError(`open chain endpoint not on boundary: ${x},${y}`);
    };
    const CORNERS = [
        [0, [0, 0]],
        [H, [0, H]],
        [H + W, [W, H]],
        [2 * H + W, [W, 0]],
    ];
    const mod = (a) => ((a % P) + P) % P;
    const out = contours.filter((c) => c.closed).map((c) => ({
        points: [...c.points],
        closed: true,
    }));
    const open = contours.filter((c) => !c.closed);
    const used = new Array(open.length).fill(false);
    const pushCornersBetween = (ring, from, to) => {
        const span = mod(to - from);
        const passed = CORNERS
            .map(([tc, pt]) => ({ delta: mod(tc - from), pt }))
            .filter(({ delta }) => delta > eps && delta < span - eps)
            .sort((a, b) => a.delta - b.delta);
        for (const { pt } of passed)
            ring.push(pt);
    };
    for (let i = 0; i < open.length; i++) {
        if (used[i])
            continue;
        used[i] = true;
        const first = open[i];
        const ring = [...first.points];
        const homeT = tOf(first.points[0]);
        let endT = tOf(first.points[first.points.length - 1]);
        for (let guard = 0; guard <= open.length + 4; guard++) {
            let bestJ = -1;
            let bestDelta = Infinity;
            for (let j = 0; j < open.length; j++) {
                if (used[j])
                    continue;
                const c = open[j];
                const delta = mod(tOf(c.points[0]) - endT);
                if (delta < bestDelta) {
                    bestDelta = delta;
                    bestJ = j;
                }
            }
            const selfDelta = mod(homeT - endT);
            if (bestJ === -1 || selfDelta <= bestDelta) {
                pushCornersBetween(ring, endT, homeT);
                break;
            }
            const next = open[bestJ];
            used[bestJ] = true;
            pushCornersBetween(ring, endT, tOf(next.points[0]));
            ring.push(...next.points);
            endT = tOf(next.points[next.points.length - 1]);
        }
        out.push({ points: ring, closed: true });
    }
    return out;
}
/** Iso rings ready for area fills: boundary-cut chains closed against the rect. */
export function closedIsoRings(field, iso) {
    return closeChainsOnBoundary(marchingSquares(field, iso), field.w, field.h);
}
export function ringArea(points) {
    let sum = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % n];
        sum += x1 * y2 - x2 * y1;
    }
    return sum / 2;
}
export function chaikinSmooth(points, closed, iterations = 2) {
    let cur = [...points];
    for (let it = 0; it < iterations; it++) {
        const next = [];
        const n = cur.length;
        if (n < 3)
            return cur;
        if (closed) {
            for (let i = 0; i < n; i++) {
                const p = cur[i];
                const q = cur[(i + 1) % n];
                next.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]], [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
            }
        }
        else {
            next.push(cur[0]);
            for (let i = 0; i < n - 1; i++) {
                const p = cur[i];
                const q = cur[i + 1];
                next.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]], [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
            }
            next.push(cur[n - 1]);
        }
        cur = next;
    }
    return cur;
}
