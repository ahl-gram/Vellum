import { seedForDate } from "../../../src/world/seed-of-the-day.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import type { HuntKit } from "../hunt.ts";
import { huntQuarry } from "./quarry.ts";

// 2026-10-30: a day whose hunt quarry was renamed, Zodo once Tho (CI run 37379661660, and Issue #1084's dry run on the Mac's layout and on the runner's staged one), where HUNT_DAY's Xuacil never was.
export const FORMER_DAY = Date.UTC(2026, 9, 5, 12);
const FORMER_SEED = seedForDate(new Date(FORMER_DAY));
// 2026-10-30: this boot read 515 to 598 ms over 18 boots on the Mac (Issue #1084's dry run) and H1's boot of the same page about 0.9 s on CI (run 41114590473, lane A); 300 tries of at least 50 ms is h1Opens's 15 s, about 16 times the worse.
const BOOT_TRIES = 300;

type Booted = { seed: string | null; clues: number; hunt: boolean; solved: boolean };
const BOOTED: Payload<Booted> = `(()=>{const h=document.getElementById("hunt"),c=document.getElementById("clues"),m=document.getElementById("map"),svg=document.querySelector("#map svg");return{seed:svg?svg.getAttribute("data-vellum-seed"):null,clues:c?c.children.length:0,hunt:!!h&&!h.hidden,solved:!!m&&m.classList.contains("solved")};})()`;
const REVEAL: Payload<{ shown: boolean; text: string }> =
  `(()=>{const r=document.getElementById("reveal");return{shown:!!r&&!r.hidden,text:r?r.textContent:""};})()`;

export async function h5cFormerName(k: HuntKit): Promise<void> {
  const { evaluate, send, sleep, check, clickHunt, PORT } = k;
  await evaluate(`localStorage.removeItem("vellum.hunt.v1")`);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/seed-of-the-day/` });
  const settle = makeSettle({ evaluate, sleep, tolerant: true });
  await settle(
    BOOTED,
    (d) => d.seed === String(FORMER_SEED) && d.clues > 0 && d.hunt && !d.solved,
    "H5c the former-name day's hunt boots unsolved",
    BOOT_TRIES,
  );
  const tgt = await huntQuarry(k, FORMER_SEED);
  const won = await clickHunt(tgt.hit);
  const rev = await evaluate(REVEAL);
  check(
    "H5c on a day whose quarry was renamed, a live solve's reveal names what it was once called (#49, #1084)",
    tgt.formerName !== null && won.solved && rev.shown && rev.text.includes(`Once called ${tgt.formerName}.`),
    JSON.stringify({
      seed: tgt.seed,
      name: tgt.name,
      formerName: tgt.formerName,
      solved: won.solved,
      shown: rev.shown,
      text: rev.text.slice(0, 120),
    }),
  );
}
