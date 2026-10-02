import { NOSCRIPT_READ, PAGE } from "./reads.ts";
import type { SpecimenKit } from "./kit.ts";

export async function sb9bPrinted({ send, check, read }: SpecimenKit): Promise<void> {
  const leanedScreen = await read();
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const leanedPrint = await read();
  await send("Emulation.setEmulatedMedia", { media: "" });
  const leanedBack = await read();
  check(
    "SB9b leaned and then printed, the room folio's panel stands down (#538): the zoomed class survives the print sheet, so the arm still matches on paper (read under print) while the corner is static and in flow, where the panel's absolute box resolved against the whole page; the same read under screen paints it before and after, the same-run control that the emulation took; and with the panel gone the printed page carries no sideways overflow",
    !!leanedScreen.st && leanedScreen.st.zoomed && leanedScreen.pool === '""' && !!leanedPrint.st && leanedPrint.st.zoomed && leanedPrint.folioRoomPos === "static" && leanedPrint.pool === "none" && leanedPrint.noX && leanedBack.pool === '""',
    JSON.stringify({ before: leanedScreen.pool, printedZoomed: leanedPrint.st && leanedPrint.st.zoomed, folio: leanedPrint.folioRoomPos, printed: leanedPrint.pool, after: leanedBack.pool, noX: leanedPrint.noX }),
  );
}

export async function sb9PrintIsPaper({ send, check, sleep, setState, read }: SpecimenKit): Promise<void> {
  await setState("rest");
  await sleep(400);

  const restScreen = await read();
  await send("Emulation.setEmulatedMedia", { media: "print" });
  const printed = await read();
  check(
    "SB9 print is paper: the fog, the vignettes, the slip, the legend and the Glass print as nothing; the room's folio prints in flow",
    printed.fog === "none" && printed.vignette === "none" && printed.slipDisp === "none" && printed.legendDisp === "none" && printed.glassDisp === "none" && printed.folioRoomPos === "static",
    JSON.stringify({ fog: printed.fog, vignette: printed.vignette, slip: printed.slipDisp, legend: printed.legendDisp, glass: printed.glassDisp, folio: printed.folioRoomPos }),
  );
  check(
    "SB9c the status pill prints as nothing (#566, ruled 2026-09-11): on screen the Book's pill stands filled over the chart, the same-run control, and on paper it is gone, box and all, where its absolute seat resolved against the page box and laid a grey slab on it, 2.6:1 below the chart at this width and about 3.0:1 across the chart itself at letter width; the width is read beside the display because a visibility stand-down would leave the box reserved; the Book is the only room whose pill carries text at rest, so it is the only witness here that is not vacuous, and the scripts-off notice the same arm covers cannot be reached with scripting on (test/site/room.test.ts pins the arm's scope)",
    restScreen.pillDisp !== "none" && !!restScreen.pill && restScreen.pill.w > 0 && !!restScreen.pillText && restScreen.pillText.trim().length > 0 &&
      printed.pillDisp === "none" && !!printed.pill && printed.pill.w === 0,
    JSON.stringify({ screen: { disp: restScreen.pillDisp, w: restScreen.pill && restScreen.pill.w, text: restScreen.pillText && restScreen.pillText.trim().length }, print: { disp: printed.pillDisp, w: printed.pill && printed.pill.w } }),
  );
  await send("Emulation.setEmulatedMedia", { media: "" });
}

export async function sb9dNoScript({ evaluate, send, check, sleep, PORT }: SpecimenKit): Promise<void> {
  // The boot hook never arrives with scripting off, so the poll waits on the notice itself rather than on goto()'s state read; the restore is a finally because a throw between here and it would hand the next suite a browser with no JavaScript, which runSelected keeps running into.
  type Notice = { present: false; pill: { disp: string; w: number } | null } | { present: true; disp: string; w: number; text: number; pill: { disp: string; w: number } | null };
  let noJsScreen: Notice | null = null;
  let noJsPrint: Notice | undefined;
  try {
    await send("Emulation.setScriptExecutionDisabled", { value: true });
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${PAGE}` });
    for (let i = 0; i < 200; i++) {
      let s: Notice | null = null;
      try { s = await evaluate(NOSCRIPT_READ); } catch {}
      if (s && s.present && s.w > 0) { noJsScreen = s; break; }
      await sleep(50);
    }
    await send("Emulation.setEmulatedMedia", { media: "print" });
    noJsPrint = await evaluate(NOSCRIPT_READ);
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
    await send("Emulation.setScriptExecutionDisabled", { value: false });
  }
  check(
    "SB9d with SCRIPT EXECUTION DISABLED, the other half of #566's ruling: the scripts-off notice is in the DOM at all only here, and on paper it goes with the pill, both of them gone, box and all; on screen in the same state both stand filled, which is the control that says scripting really was off and the notice really rendered",
    !!noJsScreen && noJsScreen.disp !== "none" && noJsScreen.w > 0 && noJsScreen.text > 0 && !!noJsScreen.pill && noJsScreen.pill.w > 0 &&
      noJsPrint.present && noJsPrint.disp === "none" && noJsPrint.w === 0 && !!noJsPrint.pill && noJsPrint.pill.disp === "none" && noJsPrint.pill.w === 0,
    JSON.stringify({ screen: noJsScreen, print: noJsPrint }),
  );
}
