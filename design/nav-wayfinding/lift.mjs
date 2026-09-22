// Lifts the live kit into this round so the mocks wear exactly what main wears, rather than a hand-copied
// approximation that drifts. Run once from the repo root: `node design/nav-wayfinding/lift.mjs`. Its output is
// COMMITTED, because a design round is a self-contained archive (specs/conventions.md) and must still render
// years after the sheets it was lifted from have moved on. The sha it was lifted at is written into lifted.txt.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const here = new URL('.', import.meta.url);
const root = new URL('../../', import.meta.url);
const out = (f) => new URL(f, here);
const src = (f) => new URL(f, root);

mkdirSync(out('fonts'), { recursive: true });
mkdirSync(out('stills'), { recursive: true });

// The shell dresses once: every shared rule lives in BaseLayout's `<style is:global>` block, so the block IS
// the shell and lifting it whole is what keeps the mock honest about the cascade.
const layout = readFileSync(src('src/layouts/BaseLayout.astro'), 'utf8');
const block = /<style is:global>([\s\S]*?)<\/style>/.exec(layout);
if (!block) throw new Error('BaseLayout no longer carries a <style is:global> block: the lift needs rewriting');
const shell = block[1];
if (/\{[a-zA-Z_$][\w$]*\}/.test(shell.replace(/\{[^{}]*:[^{}]*\}/g, ''))) {
  throw new Error('the shell block now carries an Astro expression; the lift would inline it wrong');
}
writeFileSync(out('shell.css'), `/* LIFTED from src/layouts/BaseLayout.astro's <style is:global> block. Do not edit here. */\n${shell}`);

// The live sheets address their assets root-absolutely, which is the shell's own link rule; an archive opened
// from file:// has no root, so the ONE root-absolute reference among them is rewritten relative on the way in.
// The rewrite is asserted rather than assumed: a new root-absolute url() left unrewritten would load nothing and
// the still would quietly show a fallback face.
// Sheet order is a contract (the root sheets, then any the page opts into, then the page's own), so the mock
// links them in exactly this order and the page sheets keep a distinct name rather than four rival index.css.
const SHEETS = [
  ['public/fonts.css', 'fonts.css'],
  ['public/motion.css', 'motion.css'],
  ['public/house.css', 'house.css'],
  ['public/atelier.css', 'atelier.css'],
  ['public/prospect/index.css', 'page-prospect.css'],
  ['public/index.css', 'page-home.css'],
  // The band is rendered on a document room and NOWHERE else, so the FAQ is the only one of the three that can
  // measure whether a second rank or a trail falls past the band's bottom edge onto ground that has no ink.
  ['public/faq/index.css', 'page-faq.css'],
];
for (const [from, to] of SHEETS) {
  const text = readFileSync(src(from), 'utf8').replace(/url\((['"]?)\/fonts\//g, 'url($1fonts/');
  const left = text.match(/url\((['"]?)\//g);
  if (left) throw new Error(`${from} still has ${left.length} root-absolute url() the lift does not know how to rewrite`);
  writeFileSync(out(to), text);
}
for (const font of ['im-fell-english-sc-latin-400-normal.woff2', 'im-fell-english-latin-400-italic.woff2',
  'eb-garamond-latin-400-normal.woff2', 'eb-garamond-latin-400-italic.woff2', 'eb-garamond-latin-600-normal.woff2',
  'eb-garamond-latin-700-normal.woff2', 'OFL.txt']) {
  copyFileSync(src(`public/fonts/${font}`), out(`fonts/${font}`));
}
copyFileSync(src('public/charts/chart-42-antique.svg'), out('chart-42-antique.svg'));
// A real seed-42 prospect plate, so the chart room's stage carries the kind of output it actually carries rather
// than a world chart standing in for a townscape. Dumped by design/chart-table/dump-sheets.ts for Issue #518 and
// reused here whole: THE PROSPECT OF LAUKUWELUA, antique, year 1059.
copyFileSync(src('design/chart-table/sheets-42/prospect-capital-antique.svg'), out('prospect-42-laukuwelua.svg'));

const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
writeFileSync(out('lifted.txt'), `${sha}\n${new Date().toISOString().slice(0, 10)}\n`);
console.log('lifted at', sha);
