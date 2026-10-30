import { ringArea } from "./plane.ts";
import type { P } from "../simplify.ts";

export type LonLat = readonly [number, number];
type V3 = readonly [number, number, number];

const RAD = Math.PI / 180;

function unit([lon, lat]: LonLat): V3 {
  const c = Math.cos(lat * RAD);
  return [c * Math.cos(lon * RAD), c * Math.sin(lon * RAD), Math.sin(lat * RAD)];
}

export function centreOf(ring: readonly LonLat[]): V3 {
  let x = 0,
    y = 0,
    z = 0;
  for (const point of ring) {
    const [a, b, c] = unit(point);
    x += a;
    y += b;
    z += c;
  }
  const n = Math.sqrt(x * x + y * y + z * z);
  return [x / n, y / n, z / n];
}

export function projectAbout(rings: readonly (readonly LonLat[])[], c: V3): P[][] {
  const h = Math.sqrt(c[0] * c[0] + c[1] * c[1]);
  const east: V3 = h === 0 ? [0, 1, 0] : [-c[1] / h, c[0] / h, 0];
  const north: V3 = [c[1] * east[2] - c[2] * east[1], c[2] * east[0] - c[0] * east[2], c[0] * east[1] - c[1] * east[0]];
  return rings.map((ring) =>
    ring.map((point) => {
      const p = unit(point);
      const k = Math.sqrt(2 / (1 + p[0] * c[0] + p[1] * c[1] + p[2] * c[2]));
      return [
        k * (p[0] * east[0] + p[1] * east[1] + p[2] * east[2]),
        k * (p[0] * north[0] + p[1] * north[1] + p[2] * north[2]),
      ] as const;
    }),
  );
}

export function projectPlace(rings: readonly (readonly LonLat[])[]): { readonly rings: P[][]; readonly main: number } {
  let main = 0,
    best = -1;
  rings.forEach((ring, i) => {
    const area = ringArea(projectAbout([ring], centreOf(ring))[0]!);
    if (area > best) {
      best = area;
      main = i;
    }
  });
  return { rings: projectAbout(rings, centreOf(rings[main]!)), main };
}
