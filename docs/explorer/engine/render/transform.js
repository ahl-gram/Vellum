/** Uniform grid→pixel projection with a frame margin. */
export function createProjection(gridW, gridH, widthPx, margin) {
    const scale = (widthPx - 2 * margin) / (gridW - 1);
    const heightPx = 2 * margin + (gridH - 1) * scale;
    return {
        widthPx,
        heightPx,
        margin,
        scale,
        px: (x) => margin + x * scale,
        py: (y) => margin + y * scale,
    };
}
