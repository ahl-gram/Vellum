import type { Ladder } from "../shared/primer/shape.ts";

export const PICTURE_DRAW_WIDTH = 1500;
export const PICTURE_FOLDER = "pictures";
export const PICTURE_MANIFEST = "pictures.json";
export interface Frame {
  readonly width: number;
  readonly height: number;
}
export interface Pictured {
  readonly id: string;
  readonly at: string;
  readonly picture: string;
}
export const pictureFile = (id: string): string => `${PICTURE_FOLDER}/${id}.webp`;

export function chartFrame(): Frame {
  return { width: 0, height: 0 };
}

export function picturedSteps(ladders: readonly Ladder[]): readonly Pictured[] {
  return ladders.flatMap((ladder) =>
    ladder.lessons.flatMap((lesson) =>
      lesson.steps.flatMap((step) =>
        step.picture === undefined ? [] : [{ id: step.id, at: step.at, picture: step.picture }],
      ),
    ),
  );
}
