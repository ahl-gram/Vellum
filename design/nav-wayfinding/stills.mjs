// Shoots every direction at every ruled width and MEASURES the two things structural tests cannot see: how close
// the cluster comes to the furniture anchored at the other side of the chrome, and how far it falls past the
// band's bottom edge on the one page that renders a band. Run from the repo root after build.mjs:
//   node design/nav-wayfinding/stills.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const full = new URL('../../out/513-nav/', import.meta.url);
mkdirSync(full, { recursive: true });

// 320 and 390 are the ruled phone widths (ui-design: 390 is ruled, 320 is checked); 901 is the narrowest viewport
// that still renders the flat line, since the drawer takes over at 900; 1024 sits inside the collision band the
// plan computed; 1280 is the width every recorded cluster measurement in this repo was taken at.
const WIDTHS = [[320, 640, 1], [390, 844, 1], [901, 800, 0], [1024, 800, 0], [1280, 800, 0]];

const DIRS = ['control', 'a', 'b', 'c', 'd', 'd-shut', 'd-c', 'd-c-shut'];
const PAGES = [['prospect', DIRS], ['home', DIRS], ['faq', DIRS]];

// Everything here is read off rendered rects, never computed from constants, because the whole point of the
// round is that the arithmetic in the plan was never measured. `gap` is the headroom between the nav's right
// edge and whatever is anchored opposite it; a negative gap IS the collision.
const PROBE = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), right: +b.right.toFixed(1), bottom: +b.bottom.toFixed(1) }; };
  const nav = r('header.chrome nav.rooms'), cluster = r('header.chrome');
  const folio = r('.folio-room'), seed = r('.lf-seed'), band = r('.band');
  const rank = r('.rank'), trail = r('.trail'), press = r('.atelier-press'), atelier = r('.atelier');
  const drawerOpen = getComputedStyle(document.querySelector('header.chrome nav.rooms')).position === 'absolute';
  const doors = [...document.querySelectorAll('header.chrome nav.rooms a, header.chrome nav.rooms [aria-current]')].length;
  // --band-h is read off the BAND, not off the root: a direction that buys itself more ground sets it on body,
  // and the root would hand back the untouched 7.6rem and report the arm as safe when it is not.
  const bandEl = document.querySelector('.band');
  const bandH = bandEl ? parseFloat(getComputedStyle(bandEl).getPropertyValue('--band-h')) * 16 : null;
  const bandBottom = band && bandH ? band.y + bandH : null;
  const low = [rank, trail, press].filter(Boolean).map((x) => x.bottom);
  const clusterInk = Math.max(cluster ? cluster.bottom : 0, ...low, 0);
  return JSON.stringify({
    w: innerWidth, scrollW: document.documentElement.scrollWidth, sideways: document.documentElement.scrollWidth > innerWidth,
    // ADDED beside the sideways check, never in place of it: a position:fixed element that hangs off the edge
    // never reaches documentElement.scrollWidth, so that check is structurally blind to it and reported clean on
    // 20 rows where the chart panel overhung by 8.4px. Each instrument sees what the other cannot.
    fixedOverhang: [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed')
      .map((e) => ({ sel: e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/)[0] : ''), over: +(e.getBoundingClientRect().right - innerWidth).toFixed(1) }))
      // The fog layers are DELIBERATELY larger than the viewport (they are the room's drifting decoration, sized
      // past the edges so no seam shows), so they are the one named exclusion rather than a finding every run.
      // Anything else that appears here is a real overhang: the list is otherwise empty on all 168 rows.
      .filter((x) => x.over > 0.5 && !x.sel.startsWith('div.fog')),
    doors, drawerOpen, navRight: nav ? nav.right : null, clusterInk: +clusterInk.toFixed(1),
    gapFolio: folio && nav && !drawerOpen ? +(folio.x - nav.right).toFixed(1) : null,
    gapSeed: seed && nav && !drawerOpen ? +(seed.x - nav.right).toFixed(1) : null,
    bandBottom: bandBottom === null ? null : +bandBottom.toFixed(1),
    pastBand: bandBottom === null ? null : +(clusterInk - bandBottom).toFixed(1),
    rank, trail, press, atelier,
  });
})()`;

// Below 900 the nav folds into a drawer a native checkbox reveals, so every phone still is shot twice: shut,
// which is what the room looks like, and open, which is the only state where the doors can be judged at all.
const OPEN = 'document.querySelector(".rooms-reveal").checked = true';

const jobs = [];
for (const [page, dirs] of PAGES) {
  for (const dir of dirs) {
    for (const [w, h, mobile] of WIDTHS) {
      const name = `${page}-${dir}-${w}`;
      jobs.push([`file://${here}${page}-${dir}.html`, w, h, mobile, fileURLToPath(new URL(`${name}.png`, full)), '', PROBE].join('|'));
      if (w <= 900) {
        jobs.push([`file://${here}${page}-${dir}.html`, w, h, mobile, fileURLToPath(new URL(`${name}-open.png`, full)), OPEN, PROBE].join('|'));
      }
    }
  }
}
const shot = spawnSync('node', [`${here}shoot.mjs`, ...jobs], { encoding: 'utf8' });
process.stdout.write(shot.stdout ?? '');
if (shot.status !== 0) { process.stderr.write(shot.stderr ?? ''); process.exit(shot.status ?? 1); }

// The measurements are kept beside the stills as the round's own record, so a later reader does not have to
// re-run a browser to know what was measured.
const rows = (shot.stdout ?? '').trim().split('\n').map((line) => {
  const [file, ...rest] = line.split(' ');
  return { still: file.split('/').pop(), ...JSON.parse(rest.join(' ')) };
});
writeFileSync(new URL('measurements.json', import.meta.url), `${JSON.stringify(rows, null, 1)}\n`);

// The ARCHIVE is a chosen set, not the whole sweep: every direction at the width that decides it, the phone with
// the drawer open, and the 3x crops where the type is actually legible. The full-colour originals stay in out/
// and only these are quantized into the round, which is the sub7 and chart-table convention.
const KEEP = [
  ...DIRS.flatMap((d) => [`prospect-${d}-1280`, `prospect-${d}-901`, `prospect-${d}-390-open`]),
  ...DIRS.flatMap((d) => [`home-${d}-1280`, `home-${d}-901`]),
  ...DIRS.map((d) => `faq-${d}-1280`),
  // A's collision is cited at 1024 as well as 901, so the picture for it exists rather than only the number.
  'prospect-a-1024', 'home-d-c-390-open', 'faq-d-c-390-open', 'prospect-d-c-320', 'prospect-d-c-shut-320',
  'crop-a', 'crop-b', 'crop-c', 'crop-d-shut', 'crop-d-c-shut',
];
const stills = new URL('stills/', import.meta.url);
mkdirSync(stills, { recursive: true });
let kept = 0;
for (const name of KEEP) {
  const from = fileURLToPath(new URL(`${name}.png`, full));
  const q = spawnSync('magick', [from, '-colors', '256', '-define', 'png:exclude-chunks=date', '+set', 'date:create', '+set', 'date:modify', `PNG8:${fileURLToPath(new URL(`${name}.png`, stills))}`]);
  if (q.status === 0) kept += 1; else console.error('could not archive', name);
}
console.log(`\n${rows.length} stills in out/513-nav/, ${kept} archived in design/nav-wayfinding/stills/, measurements.json written`);
