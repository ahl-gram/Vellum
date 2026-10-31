import type { Box, Pt } from "../geometry.ts";
import { spacedTextBox, WIDTH_FACTOR } from "../geometry.ts";
import type { Projection } from "../transform.ts";
import { interiorProbes } from "./label-probes.ts";
import { slideInsideSheet } from "./sheet-room.ts";

const CLAIM_PAD = 4;

export type RealmLabelArena = {
  tryClaim(box: Box, pad?: number): boolean;
  claim(box: Box): void;
};

export type RealmLabelPlacement = {
  readonly x: number;
  readonly y: number;
  readonly claimed: boolean;
};

export type CloseUpRoom = { readonly furniture: ReadonlyArray<Box>; readonly dry: (b: Box) => boolean };

type Args = {
  readonly blob: ReadonlyArray<number>;
  readonly gridW: number;
  readonly proj: Projection;
  readonly centroid: Pt;
  readonly yCandidates: ReadonlyArray<number>;
  readonly name: string;
  readonly fs: number;
  readonly ls: number;
  readonly arena: RealmLabelArena;
  readonly closeUp: CloseUpRoom | null;
};

function withinChart(box: Box, proj: Projection): boolean {
  return box.x >= proj.margin && box.x + box.w <= proj.widthPx - proj.margin;
}

export function placeRealmLabel(args: Args): RealmLabelPlacement {
  return args.closeUp === null ? placeOnWorldSheet(args) : placeOnCloseUp(args, args.closeUp);
}

function placeOnCloseUp(
  { blob, gridW, proj, centroid, yCandidates, name, fs, ls, arena }: Args,
  room: CloseUpRoom,
): RealmLabelPlacement {
  const boxAt = (p: Pt): Box => spacedTextBox(p.x, p.y, name, fs, ls, WIDTH_FACTOR.caps);
  const slid = (p: Pt): Pt => {
    const { dx, dy } = slideInsideSheet(boxAt(p), proj);
    return { x: p.x + dx, y: p.y + dy };
  };
  const spots = [
    ...yCandidates.map((y) => slid({ x: centroid.x, y })),
    ...interiorProbes(blob, gridW, proj, centroid).map(slid),
  ];
  const claimed =
    spots.find((p) => room.dry(boxAt(p)) && arena.tryClaim(boxAt(p), CLAIM_PAD)) ??
    spots.find((p) => arena.tryClaim(boxAt(p), CLAIM_PAD));
  if (claimed) return { x: claimed.x, y: claimed.y, claimed: true };
  const forced = slid(centroid);
  arena.claim(boxAt(forced));
  return { x: forced.x, y: forced.y, claimed: false };
}

function placeOnWorldSheet({
  blob,
  gridW,
  proj,
  centroid,
  yCandidates,
  name,
  fs,
  ls,
  arena,
}: Args): RealmLabelPlacement {
  const boxAt = (x: number, y: number) => spacedTextBox(x, y, name, fs, ls, WIDTH_FACTOR.caps);

  // Stage 1 is the historical ladder, unfiltered by withinChart on purpose: filtering it would move existing labels and force a regen.
  for (const y of yCandidates) {
    const box = boxAt(centroid.x, y);
    if (arena.tryClaim(box, CLAIM_PAD)) {
      return { x: centroid.x, y, claimed: true };
    }
  }

  for (const p of interiorProbes(blob, gridW, proj, centroid)) {
    const box = boxAt(p.x, p.y);
    if (withinChart(box, proj) && arena.tryClaim(box, CLAIM_PAD)) {
      return { x: p.x, y: p.y, claimed: true };
    }
  }

  const half = boxAt(centroid.x, centroid.y).w / 2;
  const minX = proj.margin + half;
  const maxX = proj.widthPx - proj.margin - half;
  const x = maxX >= minX ? Math.min(maxX, Math.max(minX, centroid.x)) : centroid.x;
  arena.claim(boxAt(x, centroid.y));
  return { x, y: centroid.y, claimed: false };
}
