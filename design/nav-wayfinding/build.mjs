// Assembles the mock pages from the REAL built pages, so every direction is read under the real cascade rather
// than a hand-written approximation of it. Run from the repo root after `npm run build`:
//   node design/nav-wayfinding/build.mjs
// Each mock is one built page with four things done to it: its sheets repointed at this round's lifted copies,
// its scripts removed (a mock runs no bundle, and the drawer it needs is a native checkbox that never did),
// its nav replaced by the direction's, and its stage filled with committed seed-42 output.
import { readFileSync, writeFileSync } from 'node:fs';
import { DIRECTIONS, TITLES } from './directions.mjs';

const here = new URL('.', import.meta.url);
const root = new URL('../../', import.meta.url);
const read = (f) => readFileSync(new URL(f, root), 'utf8');

const SHEETS = ['fonts.css', 'motion.css', 'house.css', 'atelier.css'];

/** The head's stylesheet run is a contract: the root sheets, then the page's own, then this round's dress last. */
function repoint(html, pageSheet) {
  const links = [...SHEETS, pageSheet, 'mock.css'].map((h) => `<link rel="stylesheet" href="${h}">`).join('\n');
  return html
    .replace(/<link rel="stylesheet"[^>]*>\s*/g, '')
    .replace(/<link rel="prefetch"[^>]*>\s*/g, '')
    .replace('</head>', `${links}\n</head>`)
    .replace(/<script[\s\S]*?<\/script>\s*/g, '')
    .replace(/<noscript>[\s\S]*?<\/noscript>\s*/g, '');
}

/** The nav is replaced in place and the direction's extra rank or trail goes where `header-extra` already sits. */
function dress(html, dir, at) {
  const tagged = html.replace(/<body(?= |>)/, `<body data-dir="${dir}"`);
  // The control is today's nav untouched, because a candidate with nothing beside it reads as better than it is.
  if (dir === 'control') return tagged;
  const { nav, under } = DIRECTIONS[dir](at);
  const out = tagged.replace(
    /(<nav class="rooms" aria-label="The rooms">)[\s\S]*?(<\/nav>)/,
    (_m, open, close) => `${open}\n${nav}\n${close}\n${under}`,
  );
  if (out === tagged) throw new Error('the rooms nav was not found in the built page: the mock would show the old nav');
  return out;
}

// The stage carries committed seed-42 output (the same chart the home page hangs on), because this round rules
// the cluster and the plate is its ground. The chart folio's own lines are STAND-INS: they are written by the
// bundle at draw time and no bundle runs here, which is stated in the README rather than hidden.
function prospect(dir) {
  let h = read('dist/prospect/index.html');
  h = repoint(h, 'page-prospect.css');
  // The fit is inline because `#sheet { width: 0; height: 0 }` is an id rule; this is what the bundle does too.
  h = h.replace('<div class="sheet" id="sheet">',
    '<div class="sheet" id="sheet" style="width:min(72vw,760px);height:auto;aspect-ratio:520/384">');
  h = h.replace('<img id="pp-plate" class="plate" alt="" hidden>',
    '<img id="pp-plate" class="plate" src="prospect-42-laukuwelua.svg" alt="The prospect of Laukuwelua, antique, seed 42">');
  // The chart folio's lines are written by the bundle at draw time and no bundle runs in a mock, so they are
  // transcribed here to match the plate above them exactly rather than invented.
  h = h.replace('<p class="folio-title" id="folio-title"></p>',
    '<p class="folio-title" id="folio-title">The Prospect of Laukuwelua · Chart № 42</p>');
  h = h.replace('<p class="folio-sub" id="folio-sub"></p>',
    '<p class="folio-sub" id="folio-sub">the capital · drawn side-on from the town’s own ground</p>');
  h = h.replace('<p class="folio-coords" id="pp-pressed"></p>',
    '<p class="folio-coords" id="pp-pressed">pressed in 214ms · antique</p>');
  h = h.replace('<input id="pp-year" class="control" type="text"', '<input id="pp-year" class="control" value="1059" type="text"');
  return dress(h, dir, '/prospect/');
}

function home(dir) {
  let h = read('dist/index.html');
  h = repoint(h, 'page-home.css');
  h = h.replace(/src="charts\/chart-42-antique\.svg"/, 'src="chart-42-antique.svg"');
  return dress(h, dir, '/');
}

// The FAQ is the band's page: a document room renders `.band`, and a chart room and home do not, so it is the
// only one of the three where a second rank or a trail can be measured against the band's bottom edge.
function faq(dir) {
  return dress(repoint(read('dist/faq/index.html'), 'page-faq.css'), dir, '/faq/');
}

const PAGES = [
  ['prospect', prospect, ['control', 'a', 'b', 'c', 'd', 'd-shut']],
  ['home', home, ['control', 'a', 'd']],
  ['faq', faq, ['control', 'a', 'b', 'c']],
];

for (const [name, make, dirs] of PAGES) {
  for (const dir of dirs) writeFileSync(new URL(`${name}-${dir}.html`, here), make(dir));
}
console.log('built', PAGES.flatMap(([n, , d]) => d.map((x) => `${n}-${x}.html`)).join(' '));
console.log(Object.entries(TITLES).map(([k, v]) => `  ${k}: ${v}`).join('\n'));
