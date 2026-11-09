// Issue #1155 round: the references, downloaded into the delivery's refs/ with their source page, original URL, pixel size and licence field as Wikimedia Commons states them, beside the web pages the round read and what each was read for. The licence count in the notes is taken from refs.json, never from memory.
// node out/1155/mock/fetch-refs.ts
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUT_1155 } from "./paths.ts";

const UA = "Vellum design round (Issue 1155), a one-off download of four public reference images";
const IMAGES = [
  { title: "File:Hornbook containing alphabet, syllabary, and the Lord's prayer, perhaps 1700-1750, from the Digital Commonwealth - commonwealth 1n79hc85g.jpg", file: "hornbook-1700s.jpg", why: "the name candidate The Hornbook: a child's first lesson-board, a printed sheet behind a pane of horn" },
  { title: "File:Brass hornbook by Saint Paul's Infant School, 1729, from the Digital Commonwealth - 1 commonwealth 4q77g496b.jpg", file: "hornbook-brass-1729.jpg", why: "the same, in brass, for the shape of the thing" },
  { title: "File:Page from The New England Primer Improved, 1773, letters A through F, illus. LCCN2006683472.jpg", file: "new-england-primer-1773.jpg", why: "the name candidate The Primer: a child's first schoolbook, one small picture and one line to a letter" },
  { title: "File:Manicule left pointing.jpg", file: "manicule.jpg", why: "the pointing hand that directions C and D lay beside a control, already the house's glyph for The chart in hand" },
];
const PAGES = [
  { url: "https://blog.ncase.me/explorable-explanations/", read: "in full, 2026-11-05", for: "teach each mechanic alone first; withholding can teach better; end on a sandbox only the whole can open; interactivity only where it works best" },
  { url: "https://learningmusic.ableton.com/", read: "the first page, 2026-11-05", for: "the first task is a click that changes something (\"Click a box to turn it on or off.\"), and a lesson ends on a road to the next (\"Next: Make beats\")" },
  { url: "https://worrydream.com/LearnableProgramming/", read: "in full, 2026-11-05", for: "\"Start concrete, start grounded. Start with one specific case, entirely understood.\"; \"show as well as tell\"" },
  { url: "https://worrydream.com/ExplorableExplanations/", read: "the definition, 2026-11-05", for: "a reactive document lets the reader play with the author's assumptions and see the consequences: direction B's ground" },
  { url: "https://www.intercom.com/blog/building-product-tours", read: "in full, 2026-11-05", for: "learning by doing was vindicated; testers asked to advance by using the product; a tour that tracked clicks broke, so it waited for an element that appears only in the right state: the drift check's and direction D's \"then\"" },
  { url: "https://www.jesperjuul.net/ludologist/2015/09/08/miyamoto-and-tezuka-on-super-mario-bros-world-1-1/", read: "opened 2026-11-05; it carries no quote, only a pointer to a video the round did not open", for: "nothing: the Super Mario World 1-1 claims stay UNVERIFIABLE here" },
];
const SECONDHAND_NOT_OPENED = [
  "https://www.wayline.io/blog/teach-game-mechanics-through-design",
  "https://medium.com/swlh/the-perfect-game-tutorial-analyzing-super-marios-level-design-92f08c28bdf7",
  "https://drew.agilelearningcenters.org/four-step-game-development/",
  "https://userpilot.com/blog/interactive-walkthrough-vs-product-tour",
  "https://releaselens.pages.dev/blog/saas-onboarding-teardown",
];

const dir = join(OUT_1155, "refs");
mkdirSync(join(dir, "images"), { recursive: true });
const images = IMAGES.map((img) => {
  const api = spawnSync("curl", ["-s", "-A", UA, "--get", "https://commons.wikimedia.org/w/api.php", "--data-urlencode", `titles=${img.title}`, "--data", "action=query&prop=imageinfo&iiprop=url|size|extmetadata&format=json"], { encoding: "utf8" });
  const page = Object.values((JSON.parse(api.stdout) as { query: { pages: Record<string, { imageinfo: Array<{ url: string; width: number; height: number; descriptionurl: string; extmetadata: Record<string, { value: string }> }> }> } }).query.pages)[0]!;
  const info = page.imageinfo[0]!;
  const got = spawnSync("curl", ["-s", "-L", "-A", UA, "-o", join(dir, "images", img.file), info.url]);
  if (got.status !== 0) throw new Error(`could not fetch ${img.file}`);
  return { file: `images/${img.file}`, page: info.descriptionurl, url: info.url.split("?")[0], width: info.width, height: info.height, licence: info.extmetadata["LicenseShortName"]?.value ?? "none stated", date: (info.extmetadata["DateTimeOriginal"]?.value ?? "").replace(/<[^>]+>.*$/s, ""), why: img.why };
});
writeFileSync(join(dir, "refs.json"), JSON.stringify({ images, pagesRead: PAGES, secondhandNotOpened: SECONDHAND_NOT_OPENED }, null, 1));
console.log(images.map((i) => `${i.file} ${i.width}x${i.height} ${i.licence}`).join("\n"));
