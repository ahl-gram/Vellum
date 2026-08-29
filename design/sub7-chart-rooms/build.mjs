import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
const dataUri = (f) => 'data:image/svg+xml;base64,' + readFileSync(new URL(f, import.meta.url)).toString('base64');
const urls = existsSync(new URL('urls.json', import.meta.url)) ? JSON.parse(read('urls.json')) : {};
const today = JSON.parse(read('today.json'));
const ev = today.events;
const css = read('shared.css'), js = read('shared.js'), glass = read('glass.html'), nav = read('nav.html');
const CHART_TODAY = dataUri('chart-20260829-antique.svg');
const CHART_42 = dataUri('../atelier-map/chart-42-antique.svg');
const rooms = { today: 'Today', explorer: 'Explorer', 'reading-room': 'Reading Room', 'print-room': 'Print Room', faq: 'Q &amp; A', glossary: 'Glossary' };
const DOC = new Set(['faq', 'glossary']);
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
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
for (const key of Object.keys(rooms)) {
  let html = read(`${key}.tpl.html`);
  const navHtml = nav.replace('{{NAV_TODAY}}', link('today', key)).replace('{{NAV_EXPLORER}}', link('explorer', key)).replace('{{NAV_READING}}', link('reading-room', key)).replace('{{NAV_PRINT}}', link('print-room', key)).replace('{{NAV_FAQ}}', link('faq', key)).replace('{{NAV_GLOSSARY}}', link('glossary', key));
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
