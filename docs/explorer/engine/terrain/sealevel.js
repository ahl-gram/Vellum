import { quantile } from "../core/grid.js";
/** Sea level as an elevation quantile, so land fraction hits the target. */
export function pickSeaLevel(elev, landFraction) {
    if (landFraction <= 0 || landFraction >= 1) {
        throw new RangeError(`landFraction must be in (0, 1), got ${landFraction}`);
    }
    return quantile(elev.data, 1 - landFraction);
}
export function landMask(elev, seaLevel) {
    const mask = new Uint8Array(elev.data.length);
    for (let i = 0; i < elev.data.length; i++) {
        mask[i] = elev.data[i] > seaLevel ? 1 : 0;
    }
    return mask;
}
export function landFractionOf(mask) {
    let land = 0;
    for (const v of mask)
        land += v;
    return land / mask.length;
}
