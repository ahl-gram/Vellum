import { unescapeXml } from "../../../src/render/svg.ts";

export interface Signature {
  readonly stamp: Readonly<Record<string, string>>;
  readonly label: string | null;
  readonly layers: readonly string[];
}
export interface PictureEntry {
  readonly file: string;
  readonly signature: Signature;
}
export type PictureManifest = Readonly<Record<string, PictureEntry>>;

export function chartSignature(svg: string): Signature {
  const root = /<svg\b[^>]*>/.exec(svg)?.[0];
  if (root === undefined) throw new Error("the chart has no svg root");
  const stamp = [...root.matchAll(/\s(data-vellum-[a-z0-9-]+)="([^"]*)"/g)]
    .map((m): [string, string] => [m[1] ?? "", unescapeXml(m[2] ?? "")])
    .sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const label = /\saria-label="([^"]*)"/.exec(root)?.[1];
  return {
    stamp: Object.fromEntries(stamp),
    label: label === undefined ? null : unescapeXml(label),
    layers: [...svg.matchAll(/\sid="(layer-[a-z0-9-]+)"/g)].map((m) => m[1] ?? ""),
  };
}

export function signatureFaults(want: Signature, got: Signature | null): readonly string[] {
  if (got === null) return ["the room shows no chart"];
  const faults: string[] = [];
  for (const key of [...new Set([...Object.keys(want.stamp), ...Object.keys(got.stamp)])].sort()) {
    if (got.stamp[key] !== want.stamp[key]) {
      faults.push(`${key} ${JSON.stringify(got.stamp[key])}, the picture's ${JSON.stringify(want.stamp[key])}`);
    }
  }
  if (got.label !== want.label) {
    faults.push(`label ${JSON.stringify(got.label)}, the picture's ${JSON.stringify(want.label)}`);
  }
  if (got.layers.join(",") !== want.layers.join(",")) {
    faults.push(`layers ${got.layers.join(",")}, the picture's ${want.layers.join(",")}`);
  }
  return faults;
}
