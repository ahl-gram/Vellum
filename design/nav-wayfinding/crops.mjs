// The five 3x cluster crops the archive keeps, as the invocations they were actually made with rather than a
// placeholder in the README. They exist because glance properties live at full scale and the type only reads up
// close: a full-page still shows the cluster about 14px tall, which cannot settle whether the trail's way-marks
// read as a path or as the nav's dots. Run from the repo root AFTER build.mjs and BEFORE stills.mjs, which
// copies them into stills/ and cannot make them.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = new URL('../../out/513-nav/', import.meta.url);
mkdirSync(out, { recursive: true });

const CROPS = [
  ['prospect-a', 1280, 800, 0, 3, 'crop-a'],
  ['prospect-b', 1280, 800, 0, 3, 'crop-b'],
  ['prospect-c', 1280, 800, 0, 3, 'crop-c'],
  ['prospect-d-shut', 1280, 800, 0, 3, 'crop-d-shut'],
  ['prospect-d-c-shut', 1280, 800, 0, 3, 'crop-d-c-shut'],
];

const jobs = CROPS.map(([page, w, h, mobile, scale, name]) =>
  [`file://${here}${page}.html`, w, h, mobile, scale, fileURLToPath(new URL(`${name}.png`, out))].join('|'));

const r = spawnSync('node', [`${here}crop.mjs`, ...jobs], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`${CROPS.length} crops in out/513-nav/`);
