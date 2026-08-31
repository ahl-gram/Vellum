import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
const dataUri = (f) => 'data:image/svg+xml;base64,' + readFileSync(new URL(f, import.meta.url)).toString('base64');
const urls = existsSync(new URL('urls.json', import.meta.url)) ? JSON.parse(read('urls.json')) : {};
const today = JSON.parse(read('today.json'));
const ev = today.events;
const css = read('shared.css'), js = read('shared.js'), glass = read('glass.html'), nav = read('nav.html');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const CHART_TODAY = dataUri('chart-20260829-antique.svg');
const CHART_42 = dataUri('../atelier-map/chart-42-antique.svg');
// the #494 round: the Print Room bound, the Prospect and the Ribbon, from chart 42's own plates (dump-plates.ts, thumbs by shoot.mjs)
const plates = JSON.parse(read('plates.json'));
const backmatter = JSON.parse(read('backmatter-42.json')); // #497: the bound atlas's back matter for seed 42 (composeAtlas's own html)
const PROSPECT_42 = dataUri('prospect-42-antique.svg'), RIBBON_42 = dataUri('ribbon-42-antique.svg'), PLATE_VEGETATION = dataUri('theme-vegetation-42.svg');
const thumb = (k) => 'data:image/png;base64,' + readFileSync(new URL(`plates-42/${k}.png`, import.meta.url)).toString('base64');
const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
const leagueRow = (e) => {
  const tier = e.tier ? { capital: 'the capital', town: 'a fair town', village: 'a village', hamlet: 'a hamlet' }[e.tier] : null;
  const text = e.kind === 'waypoint' ? `<strong>${esc(e.text)}</strong>, ${tier}` : e.kind === 'branch' ? `a fork, <em>${esc(e.text)}</em>` : `<em>${esc(e.text)}</em>`;
  return `<li class="${e.kind}"><span class="lg">${Math.round(e.leagues)}</span><span class="ev">${text}</span></li>`;
};
const opt = (o, sel) => `<option${o.name === sel ? ' selected' : ''}>${esc(o.name)}</option>`;
const fill494 = (html) => html
  .replaceAll('{{PROSPECT_42}}', PROSPECT_42).replaceAll('{{RIBBON_42}}', RIBBON_42).replaceAll('{{PLATE_VEGETATION}}', PLATE_VEGETATION)
  .replace(/{{THUMB:([a-z0-9-]+)}}/g, (_, k) => thumb(k))
  .replaceAll('{{CAPITAL}}', esc(plates.capital.name)).replaceAll('{{CAPITAL_NOTE}}', esc(plates.capital.note))
  .replaceAll('{{PROSPECT_EPITHET}}', esc(plates.prospect.caption.epithet)).replaceAll('{{PROSPECT_FOUNDED}}', String(plates.prospect.founded))
  .replaceAll('{{PROSPECT_KEY}}', plates.prospect.key.map((k) => `<li><span class="kl">${k.letter}</span>${esc(k.label)}</li>`).join(''))
  .replaceAll('{{WORLD}}', esc(plates.title.title)).replaceAll('{{YEAR}}', String(plates.title.year))
  .replaceAll('{{ROAD_FROM}}', esc(plates.ribbon.from)).replaceAll('{{ROAD_TO}}', esc(plates.ribbon.to)).replaceAll('{{ROAD_LEAGUES}}', String(Math.round(plates.ribbon.leagues)))
  .replaceAll('{{ROAD_REALM}}', esc(plates.ribbon.realm ?? plates.title.title))
  .replaceAll('{{ROAD_ROWS}}', plates.ribbon.events.map(leagueRow).join('\n'))
  .replaceAll('{{ROAD_FROM_OPTIONS}}', plates.ribbon.options.map((o) => opt(o, plates.ribbon.from)).join(''))
  .replaceAll('{{ROAD_TO_OPTIONS}}', plates.ribbon.options.filter((o) => o.name !== plates.ribbon.from).map((o) => opt(o, plates.ribbon.to)).join(''))
  .replaceAll('{{REGION_1}}', esc(plates.atlas.regions[0])).replaceAll('{{REGION_2}}', esc(plates.atlas.regions[1]))
  .replaceAll('{{ATLAS_FIGURES}}', String(plates.atlas.figures)).replaceAll('{{ATLAS_BANNERS}}', String(plates.atlas.banners))
  .replaceAll('{{CHRONICLE_N}}', String(plates.atlas.chronicleEntries)).replaceAll('{{GAZETTEER_N}}', String(plates.atlas.gazetteerRows))
  .replace('{{BANNERS_HTML}}', () => backmatter.bannersHtml).replace('{{CHRONICLE_HTML}}', () => backmatter.chronicleHtml).replace('{{GAZETTEER_HTML}}', () => backmatter.gazetteerHtml);
const rooms = { today: 'Today', explorer: 'Explorer', 'reading-room': 'Reading Room', 'print-room': 'Print Room', faq: 'Q &amp; A', glossary: 'Glossary' };
const DOC = new Set(['faq', 'glossary']);
const PAGES = { ...rooms, 'print-room-bound': 'Print Room', 'print-room-backmatter': 'Print Room', prospect: 'The Prospect', ribbon: 'The Wayfarer\'s Ribbon' };
const navKey = (key) => key.startsWith('print-room') ? 'print-room' : key;
const docCss = read('doc.css'), docJs = read('doc.js');
const slug = (t) => t.toLowerCase().replace(/&amp;|&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const absLinks = (h) => h.replace(/href="\.\.\//g, 'href="https://www.vellumworlds.com/').replace(/href="\/(?!\/)/g, 'href="https://www.vellumworlds.com/');
// the built page's sheet, minus the running head and the dot-row TOC; each question / term gains an id for the index
function docContent(key) {
  const main = read(`${key}-main.html`);
  let body = main.slice(main.indexOf('<div class="sheet">') + '<div class="sheet">'.length);
  body = body.slice(0, body.lastIndexOf('</div>'));
  body = body.replace(/<div class="toc">[\s\S]*?<\/ul>\s*<\/div>/, '');
  const seen = new Set();
  body = body.replace(/<p class="(q|term)">([\s\S]*?)<\/p>/g, (m, cls, text) => {
    let id = slug(text.replace(/<[^>]+>/g, '')); while (seen.has(id)) id += '-2'; seen.add(id);
    return `<p class="${cls}" id="${id}">${text}</p>`;
  });
  return absLinks(body);
}
function docIndex(key, body) {
  const secs = [...body.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2 id=|$)/g)];
  let n = 0;
  const rows = secs.map(([, id, title, rest]) => {
    const entries = [...rest.matchAll(/<p class="(?:q|term)" id="([^"]+)">([\s\S]*?)<\/p>/g)].map(([, eid, t]) => [eid, t.replace(/<[^>]+>/g, '').trim()]);
    n += entries.length;
    const list = key === 'faq'
      ? `<ol class="entries">${entries.map(([eid, t]) => `<li data-for="${eid}"><a href="#${eid}">${t}</a></li>`).join('')}</ol>`
      : `<p class="terms">${entries.map(([eid, t]) => `<a href="#${eid}">${t}</a>`).join(' ')}</p>`;
    return `<li data-sec="${id}"><a class="sec" href="#${id}">${title.trim()}<span class="count">${entries.length}</span></a>${list}</li>`;
  });
  return { html: rows.join('\n'), sections: secs.length, entries: n };
}
const link = (key, current) => key === current
  ? `<span aria-current="page">${rooms[key]}</span>`
  : `<a href="${urls[key] ?? '#'}">${rooms[key]}</a>`;
for (const key of Object.keys(PAGES)) {
  let html = fill494(read(`${key}.tpl.html`));
  const cur = navKey(key);
  const navHtml = nav.replace('{{NAV_TODAY}}', link('today', cur)).replace('{{NAV_EXPLORER}}', link('explorer', cur)).replace('{{NAV_READING}}', link('reading-room', cur)).replace('{{NAV_PRINT}}', link('print-room', cur)).replace('{{NAV_FAQ}}', link('faq', cur)).replace('{{NAV_GLOSSARY}}', link('glossary', cur));
  if (DOC.has(key)) {
    const body = docContent(key), idx = docIndex(key, body);
    html = html.replace('{{DOCCSS}}', docCss).replace('{{DOCJS}}', docJs).replace('{{CONTENT}}', body).replace('{{INDEX}}', idx.html)
      .replace('{{FAQ_COUNT}}', `${idx.entries} questions in ${idx.sections} sections`).replace('{{GLOSSARY_COUNT}}', `${idx.entries} terms in ${idx.sections} sections`)
      .replaceAll('{{URL_EXPLORER}}', urls.explorer ?? '#').replaceAll('{{URL_GLOSSARY}}', urls.glossary ?? '#').replaceAll('{{URL_FAQ}}', urls.faq ?? '#');
  }
  html = html.replace('{{CSS}}', css).replace('{{JS}}', js).replace('{{GLASS}}', glass).replace('{{NAV}}', navHtml)
    .replaceAll('{{CHART_TODAY}}', CHART_TODAY).replaceAll('{{CHART_42}}', CHART_42);
  for (let i = 5; i <= 8; i++) html = html.replaceAll(`{{EV${i}Y}}`, String(ev[i].year)).replaceAll(`{{EV${i}}}`, esc(ev[i].text));
  writeFileSync(new URL(`${key}.html`, import.meta.url), html);
  console.log(key, (html.length / 1024 / 1024).toFixed(2), 'MB');
}
