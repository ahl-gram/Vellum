// The four directions, drawn against the tree Alex ruled on 2026-09-22: the Explorer parents the Prospect, the
// Ribbon and the Portfolio, the Portfolio's address moves under /explorer/ to agree with that, and the Reading
// Room carries the Prospect a second time as an ALIAS. The alias is the thing every direction has to answer,
// because two entries then point at one route and the ratified pin is one aria-current span (#461 ruling 1).

export const TREE = [
  { label: 'Today', href: '/seed-of-the-day/' },
  {
    label: 'Explorer', href: '/explorer/', children: [
      { label: 'Prospect', href: '/prospect/' },
      { label: 'Ribbon', href: '/ribbon/' },
      { label: 'Portfolio', href: '/explorer/portfolio/' },
    ],
  },
  {
    label: 'Reading Room', href: '/reading-room/', children: [
      { label: 'Prospect', href: '/prospect/', alias: true },
    ],
  },
  { label: 'Print Room', href: '/print-room/' },
  { label: 'Gallery', href: '/gallery/' },
  { label: 'Q & A', href: '/faq/' },
  { label: 'Glossary', href: '/glossary/' },
];

const ROOM_NAME = {
  '/': 'Vellum', '/seed-of-the-day/': 'The Seed of the Day', '/explorer/': 'The Explorer',
  '/prospect/': 'The Prospect', '/ribbon/': "The Wayfarer's Ribbon", '/explorer/portfolio/': 'The Portfolio',
  '/reading-room/': 'The Reading Room', '/print-room/': 'The Print Room', '/gallery/': 'The Gallery',
  '/faq/': 'Questions & Answers', '/glossary/': 'The Glossary',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const SEP = '<span class="sep" aria-hidden="true">·</span>';

/** One nav entry. `mark` is "here" for the page you are on, "alias" for the second entry pointing at it, "up" for an ancestor. */
const entry = (item, mark) => mark === 'here'
  ? `<span aria-current="page">${esc(item.label)}</span>`
  : `<a href="${item.href}"${mark ? ` class="${mark}"` : ''}>${esc(item.label)}</a>`;

const dotted = (parts) => parts.join(SEP);

/** The real seat of a route is its FIRST appearance in the tree; every later one is an alias. */
const seatOf = (href) => {
  for (const top of TREE) {
    if (top.href === href) return { top, child: null };
    for (const c of top.children ?? []) if (c.href === href && !c.alias) return { top, child: c };
  }
  return null;
};

// A: the flat line, grown. No hierarchy to express, so each route appears exactly once and the alias has nowhere to go.
function directionA(at) {
  const flat = TREE.flatMap((t) => [t, ...(t.children ?? []).filter((c) => !c.alias)]);
  return {
    nav: dotted(flat.map((i) => entry(i, i.href === at ? 'here' : ''))),
    under: '',
  };
}

// B: a second, quieter rank, present only inside the family you are standing in. Local navigation, and its own
// rule is that it must never outrank the line above it.
function directionB(at) {
  const seat = seatOf(at);
  const family = seat?.top;
  const top = dotted(TREE.map((t) => {
    if (t.href === at) return entry(t, 'here');
    if (family && t.href === family.href) return entry(t, 'up');
    const carriesAlias = (t.children ?? []).some((c) => c.alias && c.href === at);
    return entry(t, carriesAlias ? 'alias' : '');
  }));
  const kids = family?.children?.filter((c) => !c.alias) ?? [];
  const rank = kids.length
    ? `<nav class="rank" aria-label="Inside ${esc(ROOM_NAME[family.href])}">${dotted(kids.map((c) => entry(c, c.href === at ? 'here' : '')))}</nav>`
    : '';
  return { nav: top, under: rank };
}

// C: the trail. One line at any depth, every segment clickable, and the alias stated in words rather than drawn.
function directionC(at) {
  const seat = seatOf(at);
  const top = dotted(TREE.map((t) => entry(t, t.href === at ? 'here' : '')));
  if (!seat) return { nav: top, under: '' };
  const crumbs = [{ label: 'Vellum', href: '/' }, seat.top, ...(seat.child ? [seat.child] : [])];
  const trail = crumbs.map((c, i) => i === crumbs.length - 1
    ? `<span aria-current="page">${esc(ROOM_NAME[c.href] ?? c.label)}</span>`
    : `<a href="${c.href}">${esc(ROOM_NAME[c.href] ?? c.label)}</a>`)
    .join('<span class="way" aria-hidden="true">›</span>');
  const alsoFrom = TREE.filter((t) => (t.children ?? []).some((c) => c.alias && c.href === at));
  const also = alsoFrom.length
    ? `<p class="also">also reached from ${alsoFrom.map((t) => `<a href="${t.href}">${esc(ROOM_NAME[t.href])}</a>`).join(' and ')}</p>`
    : '';
  return { nav: top, under: `<nav class="trail" aria-label="Where you are">${trail}</nav>${also}` };
}

// D: the chart of the atelier, laid over a conventional layer. The site's own shape drawn in the house idiom,
// the rooms as places, the real roads as roads, the alias as a dashed track, and a pin where you stand. NEVER
// instead of a conventional nav: whichever layer is underneath it stays a complete answer on its own, so pulling
// the chart later costs nothing. The layer is a parameter because the pairing is a real choice: over B the chart
// repeats what the rank already says (siblings) and over C it supplies exactly what the trail lacks.
const withChart = (layer) => (at) => {
  const base = layer(at);
  return {
    nav: base.nav,
    under: `${base.under}<button class="atelier-press" type="button" aria-expanded="true" aria-controls="atelier">the chart of the atelier</button>${atelierChart(at)}`,
  };
};
const directionD = withChart(directionB);
const directionDC = withChart(directionC);

const PLACES = {
  '/explorer/': { x: 300, y: 196, rank: 'capital', name: 'The Explorer' },
  '/prospect/': { x: 214, y: 148, rank: 'town', name: 'The Prospect' },
  '/ribbon/': { x: 140, y: 214, rank: 'town', name: "The Ribbon" },
  '/explorer/portfolio/': { x: 368, y: 136, rank: 'town', name: 'The Portfolio' },
  '/reading-room/': { x: 262, y: 288, rank: 'town', name: 'The Reading Room' },
  '/print-room/': { x: 418, y: 232, rank: 'town', name: 'The Print Room' },
  '/seed-of-the-day/': { x: 486, y: 96, rank: 'isle', name: 'Today' },
  '/gallery/': { x: 500, y: 320, rank: 'isle', name: 'The Gallery' },
  '/faq/': { x: 176, y: 306, rank: 'village', name: 'Q & A' },
  '/glossary/': { x: 352, y: 336, rank: 'village', name: 'The Glossary' },
};

const ROADS = [
  ['/explorer/', '/prospect/'], ['/prospect/', '/ribbon/'], ['/explorer/', '/explorer/portfolio/'],
  ['/explorer/', '/print-room/'], ['/explorer/', '/reading-room/'], ['/print-room/', '/glossary/'],
  ['/reading-room/', '/faq/'],
];
const TRACKS = [['/reading-room/', '/prospect/']];

const COAST = 'M74 196 C 70 150 108 108 156 96 C 196 86 222 104 256 92 C 296 78 330 86 356 74 '
  + 'C 392 58 430 78 438 112 C 444 140 424 158 436 180 C 452 208 470 218 466 248 C 462 284 430 300 396 300 '
  + 'C 366 300 356 320 330 342 C 300 368 250 372 214 356 C 178 340 170 316 140 304 C 100 288 78 244 74 196 Z';

function atelierChart(at) {
  const line = ([a, b], dashed) => {
    const p = PLACES[a], q = PLACES[b];
    return `<path class="road${dashed ? ' track' : ''}" d="M${p.x} ${p.y} Q ${(p.x + q.x) / 2 + 12} ${(p.y + q.y) / 2 - 10} ${q.x} ${q.y}"/>`;
  };
  const place = ([href, p]) => {
    const here = href === at;
    return `<g class="place ${p.rank}${here ? ' here' : ''}">`
      + (here ? `<circle class="halo" cx="${p.x}" cy="${p.y}" r="16"/>` : '')
      + `<circle class="pip" cx="${p.x}" cy="${p.y}" r="${p.rank === 'capital' ? 5.5 : p.rank === 'village' ? 3 : 4}"/>`
      + `<text x="${p.x}" y="${p.y - 11}">${esc(p.name)}</text></g>`;
  };
  const youAre = PLACES[at]
    ? `<g class="you"><path d="M${PLACES[at].x} ${PLACES[at].y - 30} L${PLACES[at].x} ${PLACES[at].y - 19}"/>`
      + `<text x="${PLACES[at].x}" y="${PLACES[at].y - 34}">you are here</text></g>`
    : '';
  return `<div class="atelier" id="atelier">
<svg viewBox="0 0 600 420" role="img" aria-label="A chart of the atelier, with a pin at the room you are in">
  <path class="sea-ring" d="${COAST}"/>
  <path class="land" d="${COAST}"/>
  ${ROADS.map((r) => line(r, false)).join('\n  ')}
  ${TRACKS.map((r) => line(r, true)).join('\n  ')}
  ${Object.entries(PLACES).map(place).join('\n  ')}
  ${youAre}
  <g class="rose" transform="translate(538 380)">
    <circle r="15"/><path d="M0 -15 L3.4 -3.4 L15 0 L3.4 3.4 L0 15 L-3.4 3.4 L-15 0 L-3.4 -3.4 Z"/>
    <text y="-19">N</text>
  </g>
  <text class="cartouche" x="86" y="392">A Chart of the Atelier</text>
</svg>
<p class="atelier-key">the dashed track is a second way in, not a second home</p>
</div>`;
}

// D with the chart put away: what the room looks like for the rest of the time, which is most of it. A direction
// judged only in its opened state is judged on the state it spends the least time in.
function directionDShut(at) {
  const d = directionD(at);
  return { nav: d.nav, under: d.under.replace(/<div class="atelier"[\s\S]*$/, '').replace('aria-expanded="true"', 'aria-expanded="false"') };
}

const directionDCShut = (at) => {
  const d = directionDC(at);
  return { nav: d.nav, under: d.under.replace(/<div class="atelier"[\s\S]*$/, '').replace('aria-expanded="true"', 'aria-expanded="false"') };
};

export const DIRECTIONS = {
  a: directionA, b: directionB, c: directionC,
  d: directionD, 'd-shut': directionDShut,
  'd-c': directionDC, 'd-c-shut': directionDCShut,
};
export const TITLES = {
  a: 'A · the flat line, grown',
  b: 'B · parent and child, a second rank',
  c: 'C · the trail',
  d: 'D · the chart of the atelier, over B',
  'd-shut': 'D over B, the chart put away',
  'd-c': 'D · the chart of the atelier, over C',
  'd-c-shut': 'D over C, the chart put away',
};
