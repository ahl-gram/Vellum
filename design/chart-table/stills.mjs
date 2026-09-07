// The ruled stills, regenerated in one go: every direction's Explorer at 1280 (three sheets, six sheets, and D's drawer shut), the folio page at 1280, and true-390 phone renders closed and open; then palette-quantized to 256 colours into stills/ (the sub7 convention; the full-colour originals stay in out/518-mock/final/).
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const out = new URL('../../out/518-mock/final/', import.meta.url);
mkdirSync(out, { recursive: true });
const E = `file://${here}explorer.html`, F = `file://${here}folio.html`;
const OPEN = 'new Promise(r=>{document.querySelector(".slip-handle").click();setTimeout(()=>{const b=document.querySelector(".slip-body");b.scrollTop=b.scrollHeight;setTimeout(r,300)},400)})';
const OPEN_TOP = 'new Promise(r=>{document.querySelector(".slip-handle").click();setTimeout(r,500)})';
const LEAF = 'new Promise(r=>{document.querySelector(".sheet-tabs [data-leaf=table]").click();setTimeout(r,500)})';
const jobs = [];
const job = (url, w, h, m, name, script) => jobs.push([url, w, h, m, fileURLToPath(new URL(`${name}.png`, out)), script].filter((x) => x !== undefined).join('|'));
for (const d of ['a', 'b', 'c', 'd']) {
  job(`${E}?dir=${d}&state=three`, 1280, 800, 0, `${d}-explorer-1280`);
  job(`${E}?dir=${d}&state=six`, 1280, 800, 0, `${d}-explorer-1280-six`);
  job(`${F}?dir=${d}`, 1280, 800, 0, `${d}-folio-1280`);
  job(`${E}?dir=${d}&state=three`, 390, 844, 1, `${d}-explorer-390`);
  job(`${E}?dir=${d}&state=three`, 390, 844, 1, `${d}-explorer-390-open`, d === 'd' ? LEAF : OPEN);
  job(`${F}?dir=${d}`, 390, 844, 1, `${d}-folio-390`);
  if (d !== 'd') job(`${F}?dir=${d}`, 390, 844, 1, `${d}-folio-390-open`, d === 'c' ? OPEN_TOP : OPEN);
}
job(`${E}?dir=d&state=three&drawer=0`, 1280, 800, 0, 'd-explorer-1280-shut');
job(`${E}?dir=a&state=empty`, 1280, 800, 0, 'a-explorer-1280-empty');
job(`${E}?dir=a&state=three&stage=world`, 1280, 800, 0, 'explorer-1280-card');
job(`${E}?dir=a&state=three&stage=world`, 390, 844, 1, 'explorer-390-card');
const shot = spawnSync('node', [fileURLToPath(new URL('shoot.mjs', import.meta.url)), ...jobs], { stdio: 'inherit' });
if (shot.status !== 0) process.exit(shot.status ?? 1);
const stills = new URL('stills/', import.meta.url);
mkdirSync(stills, { recursive: true });
for (const f of readdirSync(out).filter((f) => f.endsWith('.png'))) {
  spawnSync('magick', [fileURLToPath(new URL(f, out)), '-colors', '256', 'PNG8:' + fileURLToPath(new URL(f, stills))], { stdio: 'inherit' });
}
console.log('stills:', readdirSync(stills).length);
