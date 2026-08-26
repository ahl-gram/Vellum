// #461 decision mockup: the FAQ as a dark-idiom broadside, faithful to design/atelier-map.
// Composes the REAL dist FAQ sheet content into a standalone page. Archived spec artifact (the #466 precedent), exempt from the src-only script rule for the same reason design/atelier-map is: it regenerates the ruled demo, it never ships.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const dist = await readFile(resolve(import.meta.dirname, "../../dist/faq/index.html"), "utf8");
const start = dist.indexOf('<div class="sheet">');
const end = dist.indexOf("</main>");
const sheet = dist.slice(start, end).replace(/<footer>[\s\S]*?<\/footer>/, "").trim();

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Vellum FAQ, dark broadside</title>
<style>
@font-face { font-family: 'IM Fell English SC'; src: url('../atelier-map/fonts/im-fell-english-sc-latin-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'IM Fell English'; font-style: italic; src: url('../atelier-map/fonts/im-fell-english-latin-400-italic.woff2') format('woff2'); }
@font-face { font-family: 'EB Garamond'; font-weight: 400; src: url('../atelier-map/fonts/eb-garamond-latin-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'EB Garamond'; font-style: italic; font-weight: 400; src: url('../atelier-map/fonts/eb-garamond-latin-400-italic.woff2') format('woff2'); }
@font-face { font-family: 'EB Garamond'; font-weight: 600; src: url('../atelier-map/fonts/eb-garamond-latin-600-normal.woff2') format('woff2'); }
:root {
  --ink-dark: #4a3826; --ink-brown: #6b5a40; --ink-faded: #857257;
  --line-tan: #b9a77f; --line-faint: #cdbd97;
  --parchment: #efe6cf; --parchment-panel: #f4ecd8; --parchment-bright: #fff7e4; --parchment-deep: #e6d9b8;
  --chart-ink: #3d2f1f;
  --font-serif-fallback: 'Iowan Old Style', 'Palatino', Georgia, serif;
  --font-display: 'IM Fell English SC', var(--font-serif-fallback);
  --font-flourish: 'IM Fell English', var(--font-serif-fallback);
  --font-body: 'EB Garamond', var(--font-serif-fallback);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-body); color: var(--ink-dark); line-height: 1.6;
  background:
    radial-gradient(120% 90% at 50% 30%, rgb(from var(--ink-dark) r g b / 0.0) 40%, rgb(from var(--chart-ink) r g b / 0.55) 100%),
    radial-gradient(80% 70% at 30% 20%, #55402a 0%, var(--ink-dark) 55%, var(--chart-ink) 100%);
  background-color: var(--chart-ink); background-attachment: fixed;
}
.band {
  position: fixed; inset: 0 0 auto 0; height: 7.6rem; z-index: 9;
  background:
    radial-gradient(120% 90% at 50% 30%, rgb(from var(--ink-dark) r g b / 0.0) 40%, rgb(from var(--chart-ink) r g b / 0.55) 100%),
    radial-gradient(80% 70% at 30% 20%, #55402a 0%, var(--ink-dark) 55%, var(--chart-ink) 100%);
  background-color: var(--chart-ink); background-attachment: fixed;
}
.band::after { content: ""; position: absolute; inset: auto 0 -14px 0; height: 14px;
  background: linear-gradient(rgb(from var(--chart-ink) r g b / 0.45), transparent); }
.chrome { position: fixed; z-index: 10; left: 1.6rem; top: 1.4rem; line-height: normal; }

@keyframes sheet-land {
  from { opacity: 0; transform: translateY(10px) scale(1.004);
    box-shadow: 0 30px 80px rgb(from var(--chart-ink) r g b / 0.75); }
  to { opacity: 1; transform: none; }
}
@keyframes ink-in { from { opacity: 0; } }
.sheet { animation: sheet-land 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) both; }
.chrome, footer { animation: ink-in 0.5s 0.18s ease-out both; }
@media (prefers-reduced-motion: reduce) { .sheet, .chrome, footer { animation: none; } }
.wordmark { font-family: var(--font-display); font-size: 2.1rem; letter-spacing: 0.12em; line-height: 1.15; }
.wordmark a { color: var(--parchment-bright); text-decoration: none; display: inline-block;
  transition: transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.wordmark a:hover, .wordmark a:focus-visible { transform: translateY(-2px) rotate(-0.6deg); }
.tagline { font-family: var(--font-flourish); font-style: italic; font-size: 0.92rem; color: var(--line-tan); }
.rooms { margin-top: 0.55rem; font-family: var(--font-display); font-size: 0.72rem; letter-spacing: 0.14em; color: var(--ink-faded); }
.rooms span { margin: 0 0.35em; opacity: 0.7; }
.rooms a { color: var(--parchment); text-decoration: none; display: inline-block;
  transition: color 0.2s ease, transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.rooms a:hover, .rooms a:focus-visible { color: var(--parchment-bright); transform: translateY(-2px); }
.rooms a[aria-current="page"] { color: var(--parchment-bright); text-decoration: underline 1px; text-underline-offset: 0.45em; }

main { padding: 8.4rem 2.2rem 1.6rem; }
.sheet {
  background: var(--parchment-panel);
  background-image:
    radial-gradient(ellipse at 50% 0%, rgb(255 252 240 / 0.55), transparent 70%),
    radial-gradient(ellipse at 90% 100%, rgb(110 85 45 / 0.14), transparent 60%);
  border: 1px solid var(--line-tan);
  outline: 3px double var(--line-tan); outline-offset: 6px;
  padding: 2.6rem clamp(1.5rem, 4vw, 4rem) 3.2rem;
  box-shadow: 0 18px 60px rgb(from var(--chart-ink) r g b / 0.55);
  position: relative;
}
.sheet::before, .sheet::after { content: ""; position: absolute; width: 26px; height: 26px; border: 1px solid var(--line-tan); pointer-events: none; }
.sheet::before { top: 14px; left: 14px; border-right: none; border-bottom: none; }
.sheet::after { bottom: 14px; right: 14px; border-left: none; border-top: none; }

.room-head { text-align: center; margin-bottom: 1.4rem; }
.room-head h1 { font-family: var(--font-display); font-size: 1.65rem; font-weight: 400; letter-spacing: 0.14em; }
.room-head p { font-family: var(--font-flourish); font-style: italic; color: var(--ink-brown); }

.toc { column-span: all; border-top: 1px solid var(--line-tan); border-bottom: 1px solid var(--line-tan); padding: 0.55rem 0; margin: 0 0 2.2rem; text-align: center; }
.toc strong { display: inline; font-family: var(--font-display); font-weight: 400; font-size: 0.78rem; letter-spacing: 0.14em; color: var(--ink-faded); margin-right: 0.9em; }
.toc ul { display: inline; list-style: none; }
.toc li { display: inline; }
.toc li + li::before { content: "\\00b7"; margin: 0 0.7em; color: var(--ink-faded); }
.toc a { font-family: var(--font-display); font-size: 0.82rem; letter-spacing: 0.1em; color: var(--ink-dark); text-decoration: none; }

.columns { column-width: 26rem; column-gap: 3.6rem; column-rule: 1px solid var(--line-faint); }
h2 { column-span: all; font-family: var(--font-display); font-weight: 400; font-size: 1.25rem; letter-spacing: 0.09em; border-bottom: 1px solid var(--line-tan); padding-bottom: 0.3rem; margin: 2.4rem 0 1.1rem; }
.columns > h2:first-child { margin-top: 0; }
h3 { font-family: var(--font-body); font-weight: 600; font-size: 1.02rem; margin: 1.1rem 0 0.25rem; break-after: avoid; }
p { margin: 0 0 0.6rem; }
a { color: var(--ink-dark); }
em, i { font-family: var(--font-flourish); }
code { background: var(--parchment-deep); padding: 0 0.3em; font-size: 0.92em; }

footer { text-align: center; font-family: var(--font-display); font-size: 0.72rem; letter-spacing: 0.22em; color: var(--line-tan); padding: 1.4rem 0 1.8rem; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style></head>
<body>
<div class="band" aria-hidden="true"></div>
<div class="chrome">
  <p class="wordmark"><a href="/">Vellum</a></p>
  <p class="tagline">an atelier of imaginary cartography</p>
  <nav class="rooms" aria-label="The rooms">
    <a href="/seed-of-the-day/">Today</a><span>&middot;</span>
    <a href="/explorer/">Explorer</a><span>&middot;</span>
    <a href="/reading-room/">Reading Room</a><span>&middot;</span>
    <a href="/print-room/">Print Room</a><span>&middot;</span>
    <a href="/gallery/">Gallery</a><span>&middot;</span>
    <a href="/faq/" aria-current="page">Q &amp; A</a><span>&middot;</span>
    <a href="/glossary/">Glossary</a>
  </nav>
</div>
<main>
${sheet}
</main>
<footer>Vellum &middot; an atelier of imaginary cartography</footer>
</body></html>`;

// The room head moves ONTO the sheet, and the flowing sections gain the broadside column wrapper.
const withHead = page.replace('<div class="sheet">', `<div class="sheet">
<div class="room-head"><h1>Questions &amp; Answers</h1><p>how the worlds are made</p></div><div class="columns">`)
  .replace("</main>", "</div></main>");

await writeFile(resolve(import.meta.dirname, "faq-dark.html"), withHead);
console.log("wrote out/461-mockups/faq-dark.html");
