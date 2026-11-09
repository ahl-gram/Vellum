import type { Lesson, Words } from "./shape.ts";

export const AT = "/explorer/#seed=42";

export const chart = (attr: string, says: string): Words => ({
  css: "#map > svg[data-vellum-style]",
  says,
  read: "attr",
  attr,
});

export const SHEET_LESSONS: readonly Lesson[] = [];
