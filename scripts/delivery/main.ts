import { existsSync, mkdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { indexPage } from "./index-page.ts";
import { deliveryPage } from "./page.ts";
import { NOTES, PAGE, pageState, walkDelivery } from "./walk.ts";

interface Outcome {
  readonly out: string | null;
  readonly refused: string | null;
}

const HOME_OUT = fileURLToPath(new URL("../../out", import.meta.url));
const TYPED_FROM = process.env["INIT_CWD"] ?? process.cwd();

const isCheckoutOut = (dir: string): boolean =>
  basename(dir) === "out" && existsSync(join(dirname(dir), "package.json"));

const foreign = (page: string): string | null =>
  pageState(page) === "foreign"
    ? `${page} was not written by npm run delivery (or is a link or a folder); move it aside and run again`
    : null;

const reason = (error: unknown): string => (error instanceof Error ? error.message : "an error with no message");

const outOf = (dir: string): Outcome => {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return { out: null, refused: `${dir} is not a folder` };
  const out = dirname(realpathSync(dir));
  return isCheckoutOut(out)
    ? { out, refused: null }
    : { out: null, refused: `${dir} does not sit directly in the out/ folder of a checkout` };
};

const writeFolder = (arg: string): Outcome => {
  const dir = resolve(TYPED_FROM, arg);
  const { out, refused } = outOf(dir);
  if (refused) return { out, refused };
  const page = join(dir, PAGE);
  try {
    const foreignPage = foreign(page);
    if (foreignPage) return { out, refused: foreignPage };
    const delivery = walkDelivery(dir, basename(dir));
    if (delivery.notes === null) console.warn(`${dir} has no ${NOTES}; its page says so where the notes go`);
    writeFileSync(page, deliveryPage(delivery));
    console.log(page);
    return { out, refused: null };
  } catch (error) {
    return { out, refused: `${dir} was not given a page: ${reason(error)}` };
  }
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
