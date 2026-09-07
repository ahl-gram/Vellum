// The #518 assembler: fills the two templates with the seed-42 sheets (dump-sheets.ts) and the kit as it stood, and writes explorer.html and folio.html beside this file; direction and state are query strings on the built pages (?dir=a|b|c|d&state=three|six|empty, folio: ?dir=).
import { readFileSync, writeFileSync } from 'node:fs';
const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
const svgUri = (k) => 'data:image/svg+xml;base64,' + readFileSync(new URL(`sheets-42/${k}.svg`, import.meta.url)).toString('base64');
const pngUri = (k) => 'data:image/png;base64,' + readFileSync(new URL(`sheets-42/${k}.png`, import.meta.url)).toString('base64');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const data = JSON.parse(read('sheets.json'));
const byKey = Object.fromEntries(data.sheets.map((s) => [s.key, s]));
const titleCase = (s) => s.toLowerCase().replace(/\b(\w)/g, (c) => c.toUpperCase()).replace(/\bOf\b/g, 'of');
const dressWord = { antique: 'antique', ink: 'pen & ink', nautical: 'nautical', topographic: 'topographic' };

// The six as laid, in the order they were laid; the first three are the three-sheet state (two surveys and the ink prospect, per #518). Every survey is antique: the redraft is gated on the antique dress (regionEligible), so no other survey can reach the table.
const SIX = [
  { key: 'band1-capital-antique', tilt: -1.2 },
  { key: 'band3-village-antique', tilt: 0.9 },
  { key: 'prospect-town-ink', tilt: -0.7 },
  { key: 'band2-town-antique', tilt: 1.4 },
  { key: 'band2-capital15-antique', tilt: -1.0 },
  { key: 'prospect-capital-antique', tilt: 0.8 },
].map((x, i) => ({ ...x, n: i + 1, ...byKey[x.key] }));
const title = (s) => s.kind === 'prospect' ? titleCase(s.title) : s.title;
const sub = (s, sep = ' · ') => s.kind === 'prospect'
  ? ['a prospect', dressWord[s.dress], String(s.year)].join(sep)
  : [`band ${s.band}`, dressWord[s.dress], ...(s.seed !== 42 ? [`chart № ${s.seed}`] : [])].join(sep);
const cls = (s) => `${s.kind} ${s.dress}`;

const laid = SIX.map((s) => `<li data-n="${s.n}" class="${cls(s)}" style="--tilt:${s.tilt}deg"><img src="${pngUri(s.key)}" alt=""><span class="cap"><b>${esc(title(s))}</b><i>${esc(sub(s))}</i></span><button class="off" type="button" aria-label="Take it off the table">&times;</button></li>`).join('\n');
const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];
const holes = SIX.map((s, i) => `<li class="hole${i === 1 ? ' shown' : ''}" data-n="${s.n}" style="--tilt:${s.tilt * 0.6}deg"><span class="num">${roman[i]}</span><img src="${pngUri(s.key)}" alt=""><span class="empty">lay a survey here</span><span class="cap">${esc(title(s))}<i>${esc(sub(s))}</i></span></li>`).join('\n');
const cuttings = SIX.map((s) => `<li data-n="${s.n}" class="${cls(s)}" style="--tilt:${s.tilt * 1.6}deg"><img src="${pngUri(s.key)}" alt=""><span class="label"><b>${esc(title(s))}</b><i>${esc(sub(s, ', '))}</i></span><button class="off" type="button" aria-label="Take it off the table">&times;</button></li>`).join('\n');

// The folio page: the same six grouped by world (#401 ruling 4), two still drafting (#329's reserved frame), the Nurunui survey on the stage.
const ON_STAGE = 'band3-village-antique';
const DRAFTING = new Set(['band2-town-antique', 'prospect-capital-antique']);
const grouped = [...SIX.filter((s) => s.seed === 42), ...SIX.filter((s) => s.seed !== 42)].map((s, i) => ({ ...s, num: roman[i] }));
const row = (s) => {
  const on = s.key === ON_STAGE, drafting = DRAFTING.has(s.key);
  const text = drafting
    ? `${esc(title(s))} <em>${esc(sub(s, ', '))}</em><span class="drafting-word">drafting…</span>`
    : `<button class="turn${on ? ' here' : ''}" type="button">${esc(title(s))}</button> <em>${esc(sub(s, ', '))}</em><a class="dl" href="#">the engraving (SVG)</a>`;
  const plate = drafting
    ? `<figure class="wide ${s.kind}"><span class="frame">Drafting…</span><figcaption>${esc(title(s))}</figcaption></figure>`
    : `<figure class="wide ${s.kind}${on ? ' here' : ''}"><button class="thumb" type="button"><img src="${pngUri(s.key)}" alt=""></button><figcaption>${esc(title(s))}</figcaption></figure>`;
  return `<li${on ? ' class="on"' : ''}><span class="cr-num">${s.num}</span><span class="cr-text">${text}</span><div class="plates">${plate}</div></li>`;
};
const rows42 = grouped.filter((s) => s.seed === 42).map(row).join('\n');
const rows15 = grouped.filter((s) => s.seed !== 42).map(row).join('\n');
const pileTilts = [[-3.2, '-1.2%', '1.6%'], [2.4, '1.4%', '-0.9%'], [-1.6, '0.6%', '-1.8%'], [3.4, '-1.8%', '-0.6%'], [-2.2, '1.9%', '1.1%']];
const pile = [...grouped.filter((s) => s.key !== ON_STAGE).map((s, i) => `<img src="${pngUri(s.key)}" alt="" style="--tilt:${pileTilts[i][0]}deg;--dx:${pileTilts[i][1]};--dy:${pileTilts[i][2]}">`), `<img class="top" src="${svgUri(ON_STAGE)}" alt="${esc(title(byKey[ON_STAGE]))}">`].join('\n');
const matTilts = [-1.6, 1.2, -0.8, 1.8, -1.3, 0.9];
const mat = grouped.map((s, i) => DRAFTING.has(s.key)
  ? `<figure class="${s.kind} drafting" style="--tilt:${matTilts[i]}deg"><span class="frame">Drafting…</span><figcaption><b>${esc(title(s))}</b><i>${esc(sub(s, ', '))}</i></figcaption></figure>`
  : `<figure class="${s.kind}" style="--tilt:${matTilts[i]}deg"><img src="${pngUri(s.key)}" alt=""><figcaption><b>${esc(title(s))}</b><i>${esc(sub(s, ', '))}</i><a class="dl" href="#">the engraving</a></figcaption></figure>`).join('\n');

const shell = read('shell.css'), kit = read('kit.css'), mock = read('mock.css'), js = read('shared.js'), glass = read('glass.html'), nav = read('nav.html');
const navFor = (cur) => nav
  .replace('{{NAV_EXPLORER}}', cur === 'explorer' ? '<span aria-current="page">Explorer</span>' : '<a href="https://www.vellumworlds.com/explorer/">Explorer</a>')
  .replace('{{NAV_PRINT}}', cur === 'print-room' ? '<span aria-current="page">Print Room</span>' : '<a href="https://www.vellumworlds.com/print-room/">Print Room</a>');
const common = (html, page, cur) => html.replace('{{SHELL}}', () => shell).replace('{{KIT}}', () => kit).replace('{{PAGE}}', () => read(page)).replace('{{MOCK}}', () => mock)
  .replace('{{NAV}}', () => navFor(cur)).replace('{{GLASS}}', () => glass).replace('{{JS}}', () => js);
const stage = byKey['stage-band2-capital-antique'];
const card = data.capital.card, mark = data.capital.mark;
const explorer = common(read('explorer.tpl.html'), 'explorer-page.css', 'explorer')
  .replaceAll('{{WORLD}}', () => svgUri('world-antique'))
  .replace('{{CARD_NX}}', String(mark.nx)).replace('{{CARD_NY}}', String(mark.ny))
  .replace('{{CARD_NAME}}', esc(card.name)).replace('{{CARD_RANK}}', esc(card.rank)).replace('{{CARD_FOUNDED}}', esc(card.foundedLine)).replace('{{CARD_FORMER}}', esc(card.formerLine ?? '')).replace('{{CARD_TONGUE}}', esc(card.tongueLine)).replace('{{CARD_ROOTS}}', esc(card.derivationLine)).replace('{{STAGE_SVG}}', () => svgUri(stage.key)).replace('{{WIN}}', `${stage.window.u0},${stage.window.v0}`)
  .replace('{{LAID}}', () => laid).replace('{{HOLES}}', () => holes).replaceAll('{{CUTTINGS}}', () => cuttings);
const folio = common(read('folio.tpl.html'), 'folio-page.css', 'print-room')
  .replace('{{FOLIO_STAGE_SVG}}', () => svgUri(ON_STAGE)).replace('{{PILE}}', () => pile).replace('{{MAT}}', () => mat).replace('{{ROWS_42}}', () => rows42).replace('{{ROWS_15}}', () => rows15);
// The page body wears chart-room from the first paint: the shell's classes come from the mock's own head, not a layout.
const bodyClass = (html) => `<!doctype html><html lang="en"><head><meta charset="utf-8">${html.replace('<div class="fog a">', '</head><body class="room chart-room"><div class="fog a">')}</body></html>`;
writeFileSync(new URL('explorer.html', import.meta.url), bodyClass(explorer));
writeFileSync(new URL('folio.html', import.meta.url), bodyClass(folio));
for (const f of ['explorer.html', 'folio.html']) console.log(f, (readFileSync(new URL(f, import.meta.url)).length / 1024 / 1024).toFixed(2), 'MB');
