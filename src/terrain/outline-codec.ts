export type Rings = ReadonlyArray<ReadonlyArray<number>>;

export function encodeRings(rings: Rings): string {
  let text = "";
  for (const ring of rings) {
    const steps: string[] = [];
    for (let i = 2; i < ring.length; i += 2) steps.push(`${ring[i]! - ring[i - 2]!} ${ring[i + 1]! - ring[i - 1]!}`);
    text += `m${ring[0]!} ${ring[1]!}l${steps.join(" ")}z`;
  }
  return text;
}

const RING = /^m(-?\d+) (-?\d+)l(-?\d+(?: -?\d+)*)$/;

export function decodeRings(text: string): number[][] {
  if (!text.endsWith("z")) throw new RangeError("outline text must close its last ring with z");
  return text
    .slice(0, -1)
    .split("z")
    .map((chunk, i) => {
      const m = RING.exec(chunk);
      if (m === null) throw new RangeError(`outline text is malformed at ring ${i}`);
      const steps = m[3]!.split(" ").map(Number);
      if (steps.length % 2 !== 0 || steps.length < 4)
        throw new RangeError(`outline ring ${i} needs at least three whole points`);
      const ring = [Number(m[1]), Number(m[2])];
      for (let k = 0; k < steps.length; k += 2)
        ring.push(ring[ring.length - 2]! + steps[k]!, ring[ring.length - 1]! + steps[k + 1]!);
      return ring;
    });
}
