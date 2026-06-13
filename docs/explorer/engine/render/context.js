import { boxesOverlap } from "./geometry.js";
export function createLabelArena() {
    const placed = [];
    return {
        tryClaim(box, pad = 2) {
            for (const b of placed) {
                if (boxesOverlap(b, box, pad))
                    return false;
            }
            placed.push(box);
            return true;
        },
        claim(box) {
            placed.push(box);
        },
    };
}
