// Print Room e2e (PRL, PR0-PR29, PRC, PRB, PRW; #133/#134/#135/#136/#137/#212/#217): the shell and inline fallback, the poster plates, the PNG rasterizer and the bound atlas; hand-authored like its sibling suites and self-contained (navigates itself, carries scoped no-4xx and console-error deltas).
import type { SuiteContext } from "./types.ts";
import { printRoomKit } from "./print-room/kit.ts";
import { prlLink, prwWarp } from "./print-room/link.ts";
import { pr0Boots, pr3World, prcCarried, prbBare } from "./print-room/proof.ts";
import { pr10PlatesEnable, pr12GrandPoster, pr16Desk, pr28ChartPlate, pr17Png } from "./print-room/plates.ts";
import { pr20Bind, pr31Turns, pr33BackMatter, pr34Leaned, pr23Download, pr25Hide } from "./print-room/atlas.ts";
import { pr21BoundPrint, pr21bUnboundPrint } from "./print-room/print.ts";
import { pr24Redraw, pr24bInFlight, pr24cRebind, pr26Redraw, pr27OrderDuring } from "./print-room/redraw.ts";
import { pr32Phone } from "./print-room/phone.ts";
import { pr6Clean, pr8Fallback } from "./print-room/fallback.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, shoot, consoleErrors, http4xx, PORT } = ctx;
  const k = printRoomKit(ctx);
  const orderHref = await prlLink(ctx);
  const hashPart = orderHref && orderHref.includes("#") ? orderHref.slice(orderHref.indexOf("#")) : "#seed=42&style=antique&legend=1";
  const PR_PAGE = `http://127.0.0.1:${PORT}/print-room/${hashPart}`;
  await send("Page.navigate", { url: PR_PAGE });
  // The health bases are captured AFTER the navigate so the pages loaded before this one are not charged to PR6/PR7: this load's own worker, engine and asset requests still fire after navigate() resolves, so they stay inside the window.
  const prErrBase = consoleErrors.length;
  const prHttpBase = http4xx.length;
  // Every poll below swallows and retries: evaluate throws when it lands in a context an in-flight navigation has destroyed.
  await pr0Boots(ctx);
  await pr3World(ctx);
  await prcCarried(ctx);
  // about:blank first, here and at every re-entry below: a navigate that differs only in the hash is same-document and never re-bootstraps the page.
  await prbBare(ctx);
  // Downloads are denied for the rest of the run so every a.click() below runs the full blob path with no headless disk write; a denied blob download is not HTTP, so it adds no 4xx and no console error and PR6/PR7 stay clean.
  try { await send("Browser.setDownloadBehavior", { behavior: "deny" }); }
  catch { try { await send("Page.setDownloadBehavior", { behavior: "deny" }); } catch {} }
  await pr10PlatesEnable(ctx);
  await pr12GrandPoster(ctx);
  await pr16Desk(ctx);
  await pr28ChartPlate(ctx);
  await pr17Png(k);
  await pr20Bind(ctx);
  await pr31Turns(ctx);
  await pr33BackMatter(ctx);
  await pr34Leaned(ctx);
  await shoot("print-room-bound.png");
  await pr21BoundPrint(k);
  await pr23Download(ctx);
  await pr24Redraw(ctx);
  await pr24bInFlight(ctx);
  await pr24cRebind(ctx);
  await pr25Hide(ctx);
  await pr21bUnboundPrint(ctx);
  await pr32Phone(ctx);
  await shoot("print-room.png");
  await pr26Redraw(ctx);
  await pr27OrderDuring(ctx);
  // PR6/PR7 must stay ahead of the inline-fallback block below, which 404s the worker on purpose.
  pr6Clean(ctx, prErrBase, prHttpBase);
  await pr8Fallback(ctx);
  // PRW/PRW2 (#137) run LAST: they navigate away from the page every check above shares.
  await prwWarp(ctx);
}
