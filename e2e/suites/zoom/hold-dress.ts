import { makeSettle } from "../../support/settle.ts";
import type { ZoomKit } from "./kit.ts";

const AT_REST = `!document.getElementById("sheet").classList.contains("turning")`;

export const sheetAtRest = (k: ZoomKit, label: string): Promise<boolean> =>
  makeSettle(k)<boolean>(AT_REST, (d) => d, label);
