/** Geometry helpers for layer rendering: pruning, centroids, label boxes. */
/**
 * Greedy blue-noise pruning: walk candidates in their given (priority)
 * order, accept any point at least `minDist` from all accepted so far.
 */
export function prunePoints(candidates, minDist, cap) {
    const accepted = [];
    const d2 = minDist * minDist;
    for (const c of candidates) {
        if (accepted.length >= cap)
            break;
        let ok = true;
        for (const a of accepted) {
            const dx = a.x - c.x;
            const dy = a.y - c.y;
            if (dx * dx + dy * dy < d2) {
                ok = false;
                break;
            }
        }
        if (ok)
            accepted.push(c);
    }
    return accepted;
}
export function centroidOf(points) {
    let sx = 0;
    let sy = 0;
    for (const p of points) {
        sx += p.x;
        sy += p.y;
    }
    const n = Math.max(1, points.length);
    return { x: sx / n, y: sy / n };
}
/** Principal axis angle (radians) of a point cloud, for label rotation. */
export function principalAngle(points) {
    if (points.length < 2)
        return 0;
    const c = centroidOf(points);
    let xx = 0;
    let xy = 0;
    let yy = 0;
    for (const p of points) {
        const dx = p.x - c.x;
        const dy = p.y - c.y;
        xx += dx * dx;
        xy += dx * dy;
        yy += dy * dy;
    }
    return 0.5 * Math.atan2(2 * xy, xx - yy);
}
export function boxesOverlap(a, b, pad = 0) {
    return (a.x - pad < b.x + b.w &&
        a.x + a.w + pad > b.x &&
        a.y - pad < b.y + b.h &&
        a.y + a.h + pad > b.y);
}
/** Approximate rendered text box for collision tests. */
export function textBox(x, y, text, fontSize, anchor) {
    const w = text.length * fontSize * 0.56;
    const h = fontSize * 1.15;
    const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
    return { x: left, y: y - fontSize, w, h };
}
