import { existsSync, mkdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { indexPage } from "./index-page.ts";
import { deliveryPage } from "./page.ts";
import { NOTES, PAGE, isOwnPage, walkDelivery } from "./walk.ts";

interface Outcome {
  readonly out: string | null;
  readonly refused: string | null;
}

const HOME_OUT = fileURLToPath(new URL("../../out", import.meta.url));
const TYPED_FROM = process.env["INIT_CWD"] ?? process.cwd();

const isCheckoutOut = (dir: string): boolean =>
  basename(dir) === "out" && existsSync(join(dirname(dir), "package.json"));

const foreign = (page: string): string | null =>
  existsSync(page) && !isOwnPage(page)
    ? `${page} was not written by npm run delivery; move it aside and run again`
    : null;

const writeFolder = (arg: string): Outcome => {
  const dir = resolve(TYPED_FROM, arg);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return { out: null, refused: `${dir} is not a folder` };
  const out = dirname(realpathSync(dir));
  if (!isCheckoutOut(out))
    return { out: null, refused: `${dir} does not sit directly in the out/ folder of a checkout` };
  const page = join(dir, PAGE);
  const refused = foreign(page);
  if (refused) return { out, refused };
  const delivery = walkDelivery(dir, basename(dir));
  if (delivery.notes === null) console.warn(`${dir} has no ${NOTES}; its page says so where the notes go`);
  writeFileSync(page, deliveryPage(delivery));
  console.log(page);
  return { out, refused: null };
};

const writeList = (out: string): boolean => {
  const page = join(out, PAGE);
  const refused = foreign(page);
  if (refused) {
    console.error(refused);
    return false;
  }
  mkdirSync(out, { recursive: true });
  writeFileSync(page, indexPage(out));
  console.log(page);
  return true;
};

const args = process.argv.slice(2);
const outcomes = args.map(writeFolder);
for (const { refused } of outcomes) if (refused) console.error(refused);
const outs = new Set(args.length === 0 ? [HOME_OUT] : outcomes.flatMap(({ out }) => (out ? [out] : [])));
const listsWritten = [...outs].map(writeList);
if (outcomes.some(({ refused }) => refused !== null) || listsWritten.includes(false)) process.exitCode = 1;
