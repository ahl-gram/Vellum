// Issue #793 round: the witness that the lint run below can fail: three calls the prospect rule must refuse.
export const witness = (a: number): number => Math.sin(a) + a ** 2 + Date.now();
