export const STYLE = `
:root {
  --walnut: #26221d;
  --walnut-raised: #312b24;
  --walnut-line: #4d4337;
  --on-walnut: #e8dfc8;
  --on-walnut-faded: #b3a68a;
  --ink-dark: #4a3826;
  --ink-brown: #6b5a40;
  --line-tan: #b9a77f;
  --line-faint: #cdbd97;
  --parchment-panel: #f4ecd8;
  --parchment-deep: #e6d9b8;
  --gold: #d9b56a;
  --rust: #8a4b1c;
  color-scheme: dark;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 28px 32px 64px;
  background: var(--walnut);
  color: var(--on-walnut);
  font: 16px/1.5 "Iowan Old Style", Palatino, Georgia, serif;
}
a { color: var(--gold); }
code, pre, .mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.82rem; }
.masthead { margin: 0 0 20px; }
.masthead .up { font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
.masthead h1 { margin: 6px 0 4px; font-size: 1.9rem; font-weight: 600; line-height: 1.2; }
.masthead .meta { margin: 0; color: var(--on-walnut-faded); }
.panel { background: var(--parchment-panel); color: var(--ink-dark); border: 1px solid var(--line-tan); border-radius: 6px; }
.panel a { color: var(--rust); }
.notes { max-width: 78ch; padding: 6px 22px; margin: 0 0 24px; }
.notes.missing { font-style: italic; color: var(--ink-brown); padding: 14px 22px; }
.panel code { background: var(--parchment-deep); padding: 0 3px; border-radius: 3px; }
.panel pre code { background: none; padding: 0; }
.md table, .notes table { border-collapse: collapse; margin: 8px 0; }
.md th, .md td, .notes th, .notes td { border: 1px solid var(--line-faint); padding: 3px 8px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
.contents { margin: 0 0 28px; max-width: 78ch; }
.contents summary { cursor: pointer; color: var(--on-walnut-faded); }
.contents ol { columns: 2 22rem; margin: 8px 0 0; padding-left: 1.4em; font-size: 0.88rem; overflow-wrap: anywhere; }
.folder > h2 { margin: 36px 0 12px; font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid var(--walnut-line); padding-bottom: 4px; }
.folder > h2 .mono { font-size: 0.95rem; }
.pictures { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; margin: 0 0 22px; }
.item { margin: 0; }
.item figcaption { margin: 6px 2px 0; font-size: 0.9rem; color: var(--on-walnut-faded); overflow-wrap: anywhere; }
.item figcaption a { color: var(--on-walnut); }
.size { color: var(--on-walnut-faded); font-size: 0.8rem; margin-left: 8px; }
.picture a.frame { display: block; background: var(--walnut-raised); border: 1px solid var(--walnut-line); padding: 6px; }
.picture img { display: block; max-width: 100%; height: auto; margin: 0 auto; background: var(--parchment-panel); }
.picture img:not([width]) { min-height: 8rem; }
.page, .table, .text, .folded { margin: 0 0 22px; content-visibility: auto; }
.page { contain-intrinsic-size: auto 78vh; }
.table, .text { contain-intrinsic-size: auto 76vh; }
.folded { contain-intrinsic-size: auto 2.4rem; }
.page figcaption, .table figcaption, .text figcaption { margin: 0 0 6px; }
.page .well { resize: vertical; overflow: hidden; height: 72vh; min-height: 240px; border: 1px solid var(--walnut-line); }
.page iframe { width: 100%; height: 100%; border: 0; background: #fff; display: block; }
.scroll { max-height: 70vh; overflow: auto; padding: 4px 14px; }
.table table { border-collapse: collapse; font-size: 0.8rem; line-height: 1.35; }
.table td, .table th { border-bottom: 1px solid var(--line-faint); padding: 4px 8px; vertical-align: top; text-align: left; min-width: 6rem; max-width: 48ch; overflow-wrap: anywhere; }
.table tr:nth-child(even) td { background: rgb(230 217 184 / 0.35); }
.panel pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0; }
.md { max-width: 90ch; }
.folded summary { cursor: pointer; font-size: 0.9rem; }
.folded .panel { margin-top: 8px; }
.cut { margin: 4px 2px 0; font-size: 0.85rem; font-style: italic; color: var(--on-walnut-faded); }
.others { columns: 2 24rem; font-size: 0.9rem; padding-left: 1.4em; overflow-wrap: anywhere; }
.foot { margin-top: 48px; font-size: 0.8rem; color: var(--on-walnut-faded); }
.deliveries { list-style: none; padding: 0; margin: 0; max-width: 1100px; }
.delivery { display: grid; grid-template-columns: 168px minmax(0, 1fr); gap: 18px; padding: 14px 0; border-bottom: 1px solid var(--walnut-line); }
.delivery .thumb { display: flex; align-items: center; justify-content: center; width: 168px; height: 104px; background: var(--walnut-raised); border: 1px solid var(--walnut-line); overflow: hidden; text-decoration: none; }
.delivery .thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top left; display: block; }
.delivery .thumb span { padding: 8px; font-size: 0.78rem; line-height: 1.3; text-align: center; color: var(--on-walnut-faded); }
.delivery h2 { margin: 0 0 2px; font-size: 1.15rem; font-weight: 600; }
.delivery h2 a { color: var(--on-walnut); text-decoration: none; }
.delivery p { margin: 0; color: var(--on-walnut-faded); font-size: 0.92rem; }
.pageless { margin-top: 36px; color: var(--on-walnut-faded); }
.pageless summary { cursor: pointer; }
.pageless ul { columns: 3 16rem; font-size: 0.88rem; }
`;
