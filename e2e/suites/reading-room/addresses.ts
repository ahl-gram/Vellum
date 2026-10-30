import { FIXED_SEED } from "../../support/fixed-day.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { ReadingRoomKit } from "./kit.ts";
import { agesRead, stripRead } from "./reads.ts";

const PLACED: Payload<{ stamp: string | null; hash: string }> =
  `(() => { const s = document.querySelector(".rf-chart svg:not(.voyage-overlay)");
  return { stamp: s ? s.getAttribute("data-vellum-outline") : null, hash: location.hash }; })()`;

export async function rr44PlaceLink(k: ReadingRoomKit): Promise<void> {
  const { send, check, boot, PORT } = k;
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", {
    url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1&arms=0&beasts=0&type=island&outline=ne-1159315211`,
  });
  check("RR44a the place's address boots", await boot());
  const placed = await makeSettle(k)(
    PLACED,
    (p) => p.stamp === "ne-1159315211" && /(^|[#&])outline=ne-1159315211(&|$)/.test(p.hash),
    "reading-room-place",
    300,
  );
  check(
    "RR44 a place's link opens it in the Reading Room and the room's own address keeps it",
    placed.stamp === "ne-1159315211",
    JSON.stringify(placed),
  );
}

export async function rr6Survey({
  evaluate,
  send,
  check,
  boot,
  settled,
  plateShown,
  PORT,
}: ReadingRoomKit): Promise<void> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&survey` });
  check("RR6a the survey address boots and settles", (await boot()) && (await settled()));
  const survey = await evaluate(agesRead);
  check(
    "RR6 bare `survey` lands at rest in the survey chamber, and the flag round-trips bare",
    !!survey.ages &&
      survey.ages.chamber === "survey" &&
      survey.play === "Play" &&
      /(^|#|&)survey(&|$)/.test(survey.hash) &&
      !/survey=/.test(survey.hash),
    JSON.stringify(survey),
  );

  // Issue #442 ruled 2026-08-22: a bare `survey` link parks at t=1, the return to the capital, so it shows the CAPITAL's plate at the present year; seed 42's capital is i=0 Laukuwelua, present year 1059.
  const surveyPlate = await plateShown();
  check(
    "RR32 a bare `survey` link arrives showing the capital's plate, at the present (#442)",
    !!surveyPlate &&
      surveyPlate.href === "/prospect/#seed=42&style=antique&i=0&year=1059" &&
      /Laukuwelua/.test(surveyPlate.alt || "") &&
      /year 1059/.test(surveyPlate.alt || ""),
    JSON.stringify(surveyPlate),
  );
  const surveyStrip = await evaluate(stripRead);
  check(
    "RR33 the survey half's live row counts DAYS, the gutter its prologue rows use (#442)",
    !!surveyStrip && surveyStrip.toldHidden === false && /^day \d+$/.test(surveyStrip.gutter || ""),
    JSON.stringify(surveyStrip),
  );
}

export async function rr7Year({
  evaluate,
  send,
  check,
  boot,
  settled,
  plateShown,
  PORT,
}: ReadingRoomKit): Promise<void> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&year=650` });
  check("RR7a the year address boots and settles", (await boot()) && (await settled()));
  const year = await evaluate(agesRead);
  check(
    "RR7 year=650 lands at rest in the ages chamber at 650, round-tripped into the hash",
    !!year.ages &&
      year.ages.chamber === "ages" &&
      year.ages.year === 650 &&
      year.play === "Play" &&
      /year=650(&|$)/.test(year.hash),
    JSON.stringify(year),
  );

  const plate650 = await plateShown();
  check(
    "RR27 at year 650 the stage holds the latest crossed beat, Lamahai's founding (#402)",
    !!plate650 &&
      plate650.href === "/prospect/#seed=42&style=antique&i=6&year=597" &&
      /Lamahai/.test(plate650.alt || ""),
    JSON.stringify(plate650),
  );

  const scrubbed = await evaluate<{ chamber: string | null; hash: string }>(
    `(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));const a=window.__vellumReadingRoomAges();return{chamber:a&&a.chamber,hash:location.hash};})()`,
  );
  check(
    "RR8 a manual scrub to the survey half re-serializes the address on release",
    scrubbed.chamber === "survey" && /(^|#|&)survey(&|$)/.test(scrubbed.hash) && !/year=/.test(scrubbed.hash),
    JSON.stringify(scrubbed),
  );

  // Issue #442 G reverses Issue #402 here: crossing into the survey half swaps the plate's SOURCE rather than stowing it; the slider at its minimum is the first leg out of the capital, i=0 Laukuwelua at the present, not the year-650 beat plate.
  const crossed = await plateShown("i=0&year=1059");
  check(
    "RR27b crossing into the survey half SWAPS the plate's source with no gap, never hiding it (#442)",
    !!crossed && crossed.hidden === false && /Laukuwelua/.test(crossed.alt || ""),
    JSON.stringify(crossed),
  );
}

export async function rr9Today({ evaluate, send, check, sleep, boot, PORT }: ReadingRoomKit): Promise<void> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/` });
  let bare = null;
  if (await boot()) {
    for (let i = 0; i < 160; i++) {
      let s = null;
      try {
        s = await evaluate<{ svg: boolean; status: string | undefined; seed: number }>(
          `(()=>{const st=window.__vellumReadingRoomState();return{svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent,seed:st.seed};})()`,
        );
      } catch {}
      if (s && s.svg && s.status === "") {
        bare = s;
        break;
      }
      await sleep(50);
    }
  }
  check(
    "RR9 a bare visit opens today's seed-of-the-day",
    !!bare && bare.seed === FIXED_SEED,
    JSON.stringify({ ...bare, fixed: FIXED_SEED }),
  );
}

export async function rr10CrossLinks({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let card = null;
  for (let i = 0; i < 120; i++) {
    try {
      card = await evaluate<{ verb: string | null; enter: string | null } | null>(
        `(()=>{const a=document.getElementById("lf-card-reading-room");if(!a)return null;const v=a.querySelector(".lf-card-verb");const e=a.querySelector(".lf-card-enter");return{verb:v?v.textContent:null,enter:e?e.getAttribute("href"):null};})()`,
      );
    } catch {}
    if (card) break;
    await sleep(50);
  }
  check(
    "RR10a the home station slip invites Watch one into the room (#459: the Go Deeper card retired)",
    !!card && card.verb === "Watch one" && card.enter === "reading-room/",
    JSON.stringify(card),
  );
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/seed-of-the-day/` });
  let watch = null;
  for (let i = 0; i < 160; i++) {
    try {
      watch = await evaluate<{ href: string } | null>(
        `(()=>{const a=document.querySelector('a[data-road="reading-room"]');return a&&/#seed=\\d+/.test(a.getAttribute("href"))?{href:a.getAttribute("href")}:null;})()`,
      );
    } catch {}
    if (watch) break;
    await sleep(50);
  }
  const watchSeed = watch ? Number((watch.href.match(/#seed=(\d+)$/) || [])[1]) : null;
  check(
    "RR10b the Today page cross-links the room with today's seed pinned",
    !!watch && /^\.\.\/reading-room\/#seed=\d+$/.test(watch.href) && watchSeed === FIXED_SEED,
    JSON.stringify({ watch, fixed: FIXED_SEED }),
  );
}
