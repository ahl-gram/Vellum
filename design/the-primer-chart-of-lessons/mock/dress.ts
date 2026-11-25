// Issue #1256 round: the chart of lessons' two dresses, its card and its three seats, written over the house's own tokens (`src/styles/shared/shell.css`) and faces (`src/styles/shared/fonts.css`) with no raw colour, so every ink here is one Sub 11 can name; a wash is the relative-colour form over a token, as the chart of the atelier's own sheet writes it (`src/styles/shared/chart-of-the-atelier.css`).
export const PAPER_CSS = `
.col-chart{display:block;width:100%;height:auto;overflow:visible}
.col-paper .col-sea{fill:none;stroke:rgb(from var(--line-tan) r g b / .4);stroke-width:9}
.col-paper .col-land{fill:rgb(from var(--parchment-deep) r g b / .6);stroke:var(--ink-brown);stroke-width:1.1}
.col-paper .col-road{fill:none;stroke:rgb(from var(--ink-faded) r g b / .75);stroke-width:.9}
.col-paper .col-road.track{stroke-dasharray:3 4}
.col-paper .col-road.inked{stroke:var(--iron-red);stroke-width:2.3}
.col-paper .col-route{fill:none;stroke:var(--ink-faded);stroke-width:2.1;stroke-linecap:round;stroke-dasharray:.1 4.6}
.col-paper .col-route.inked{stroke:var(--iron-red)}
.col-paper .col-place .pip{fill:var(--parchment-bright);stroke:var(--ink-dark);stroke-width:1.1}
.col-paper .col-place.landing .pip{fill:none;stroke-width:1.4}
.col-paper .col-place text.name{font-family:var(--font-display);font-size:var(--col-label);letter-spacing:.05em;text-anchor:middle;fill:var(--ink-dark);paint-order:stroke;stroke:var(--chart-paper);stroke-width:4px;stroke-linejoin:round}
.col-paper .col-place.landing text.name{font-style:italic}
.col-paper .col-place.untaught .pip{fill:none;stroke:var(--ink-brown);stroke-width:.9}
.col-paper .col-place.untaught text.name{fill:var(--ink-brown);font-size:calc(var(--col-label) * .86)}
.col-paper .col-place a:hover text.name,.col-paper a.col-way:hover text{text-decoration:underline}
.col-paper .col-way circle{fill:var(--parchment-bright);stroke:var(--ink-brown);stroke-width:.9}
.col-paper .col-way text{font-family:var(--font-flourish);font-style:italic;font-size:8.3px;text-anchor:middle;fill:var(--ink-dark)}
.col-paper .col-way.begun circle{stroke:var(--iron-red);stroke-width:1.7}
.col-paper .col-way.done circle{fill:url(#col-seal);stroke:var(--iron-red)}
.col-paper .col-way.done text{fill:var(--parchment-bright)}
.col-paper .col-tick{fill:none;stroke-width:3.2}
.col-paper .col-tick.open{stroke:var(--ink-faded)}
.col-paper .col-tick.sealed{stroke:var(--iron-red)}
.col-paper .col-tick.elsewhere{stroke:var(--ink-brown);stroke-width:1;stroke-dasharray:.9 .9}
.col-paper .col-open{fill:var(--control-gold);stroke:var(--ink-dark);stroke-width:.8}
.col-paper .col-here circle{fill:none;stroke:var(--iron-red);stroke-width:1;stroke-dasharray:2 2}
.col-paper .col-here path{stroke:var(--iron-red);stroke-width:1}
.col-paper .col-here text{font-family:var(--font-flourish);font-style:italic;font-size:var(--col-label);text-anchor:middle;fill:var(--iron-red)}
.col-paper .col-next .ring-a{fill:none;stroke:var(--ink-dark);stroke-width:3.6}
.col-paper .col-next .ring-b{fill:none;stroke:var(--control-gold);stroke-width:1.9}
.col-paper .col-next text{font-family:var(--font-serif-fallback);font-size:19px;fill:var(--parchment-bright);stroke:var(--chart-ink);stroke-width:2.4px;paint-order:stroke;stroke-linejoin:round}
.col-paper .col-rose circle{fill:none;stroke:var(--ink-brown);stroke-width:.8}
.col-paper .col-rose path{fill:var(--ink-brown)}
.col-paper .col-rose text{font-family:var(--font-display);font-size:9px;text-anchor:middle;fill:var(--ink-brown)}
.col-paper .col-title{font-family:var(--font-display);font-size:calc(var(--col-label) * 1.12);letter-spacing:.11em;fill:var(--ink-dark)}
`;

export const NIGHT_CSS = `
.col-night .col-sea{fill:none;stroke:rgb(from var(--line-tan) r g b / .35);stroke-width:5}
.col-night .col-land{fill:rgb(from var(--parchment) r g b / .1);stroke:var(--line-tan);stroke-width:1.1}
.col-night .col-road{fill:none;stroke:rgb(from var(--parchment) r g b / .45);stroke-width:1}
.col-night .col-road.track{stroke-dasharray:3 4;stroke:rgb(from var(--parchment) r g b / .3)}
.col-night .col-road.inked{stroke:var(--control-gold);stroke-width:2.3}
.col-night .col-place .pip{fill:var(--parchment)}
.col-night .col-place.landing .pip{fill:none;stroke:var(--parchment);stroke-width:1.4}
.col-night .col-place text.name{font-family:var(--font-display);font-size:var(--col-label);letter-spacing:.06em;text-anchor:middle;fill:var(--parchment);paint-order:stroke;stroke:var(--chart-ink);stroke-width:7px;stroke-linejoin:round}
.col-night .col-place.landing text.name{font-style:italic}
.col-night .col-place.untaught text.name{fill:rgb(from var(--parchment) r g b / .78);font-size:calc(var(--col-label) * .86)}
.col-night .col-place.untaught .pip{fill:rgb(from var(--parchment) r g b / .6)}
.col-night .col-way circle{fill:var(--chart-ink);stroke:var(--parchment);stroke-width:.9}
.col-night .col-way text{font-family:var(--font-flourish);font-style:italic;font-size:8.3px;text-anchor:middle;fill:var(--parchment-bright)}
.col-night .col-way.begun circle{stroke:var(--control-gold);stroke-width:1.7}
.col-night .col-way.done circle{fill:url(#col-seal);stroke:var(--parchment-bright);stroke-width:.7}
.col-night .col-tick{fill:none;stroke-width:3.2}
.col-night .col-tick.open{stroke:rgb(from var(--parchment) r g b / .35)}
.col-night .col-tick.sealed{stroke:var(--control-gold)}
.col-night .col-tick.elsewhere{stroke:var(--parchment);stroke-width:1;stroke-dasharray:.9 .9}
.col-night .col-open{fill:rgb(from var(--parchment-bright) r g b / .16);stroke:var(--parchment-bright);stroke-width:.8}
.col-night .col-here circle{fill:none;stroke:var(--parchment-bright);stroke-width:1;stroke-dasharray:2 2}
.col-night .col-here path{stroke:var(--parchment-bright)}
.col-night .col-here text{font-family:var(--font-flourish);font-style:italic;font-size:var(--col-label);text-anchor:middle;fill:var(--parchment-bright)}
.col-night .col-next .ring-a{fill:none;stroke:var(--chart-ink);stroke-width:3.6}
.col-night .col-next .ring-b{fill:none;stroke:var(--control-gold);stroke-width:1.9}
.col-night .col-next text{font-family:var(--font-serif-fallback);font-size:19px;fill:var(--parchment-bright);stroke:var(--chart-ink);stroke-width:2.4px;paint-order:stroke}
.col-night .col-rose circle{fill:none;stroke:rgb(from var(--line-tan) r g b / .5)}
.col-night .col-rose path{fill:rgb(from var(--parchment) r g b / .55)}
.col-night .col-rose text{font-family:var(--font-display);font-size:9px;text-anchor:middle;fill:var(--parchment)}
.col-night .col-title{font-family:var(--font-display);font-size:calc(var(--col-label) * 1.12);letter-spacing:.12em;fill:var(--parchment)}
`;

export const SEAL_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="col-seal" cx="35%" cy="30%" r="70%"><stop offset="0" style="stop-color:var(--parchment-bright);stop-opacity:.3"/><stop offset=".62" style="stop-color:var(--iron-red);stop-opacity:1"/><stop offset="1" style="stop-color:var(--iron-red);stop-opacity:1"/></radialGradient></defs></svg>`;

export const CARD_CSS = `
.col-card{box-sizing:border-box;background:var(--parchment-panel);border:1px solid var(--ink-dark);outline:3px double var(--line-tan);outline-offset:3px;border-radius:4px;box-shadow:var(--sheet-shadow);padding:.55rem .8rem .6rem;color:var(--ink-dark);font-family:var(--font-body)}
.col-card .cc-verb{margin:0;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);font-size:.88rem;line-height:1.2}
.col-card .cc-name{margin:0 0 .3rem;font-family:var(--font-display);letter-spacing:.08em;font-size:1.04rem;line-height:1.3}
.col-card ol{list-style:none;margin:0;padding:0;font-size:.9rem;line-height:1.35}
.col-card li{display:grid;grid-template-columns:1.5rem 1fr auto;column-gap:.35rem;align-items:baseline;border-top:1px solid var(--line-faint);padding:.14rem 0}
.col-card li a{color:var(--ink-dark);text-decoration:none}
.col-card li em{font-size:.78rem;color:var(--ink-brown);text-align:right}
.col-card .cc-n{font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown)}
.col-card li.done .cc-n,.col-card li.done em{color:var(--iron-red)}
.col-card li.begun .cc-n{color:var(--iron-red)}
.col-card .cc-away{display:block;font-variant-caps:small-caps;letter-spacing:.03em}
.col-card .cc-go{margin:.45rem 0 0;text-align:right}
.col-card .cc-go a{display:inline-block;font-family:var(--font-display);letter-spacing:.07em;font-size:.8rem;color:var(--ink-dark);background:var(--control-gold);border:1px solid var(--ink-dark);border-radius:3px;padding:.1rem .55rem;text-decoration:none}
`;

export const SEAT_CSS = `
.col-head{margin:0 0 1.5rem}
.col-head .col-frame{position:relative;border:1px solid var(--line-tan);outline:3px double var(--line-tan);outline-offset:4px;background:var(--chart-paper)}
.col-head .col-card{position:absolute;width:15.5rem}
.col-head .col-caption{margin:.55rem 0 0;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);font-size:.98rem;line-height:1.35}
.col-slipchart{margin:.2rem 0 .7rem;border:1px solid var(--line-tan);background:var(--chart-paper)}
.col-slipchart + .col-caption{margin:-.35rem 0 .7rem;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);font-size:.82rem;line-height:1.3}
.col-press{display:inline-block;margin:.35rem 0 0;font-family:var(--font-display);font-size:.72rem;letter-spacing:.12em;color:var(--ink-dark);background:var(--parchment-bright);box-shadow:0 0 0 .2em var(--parchment-bright);cursor:pointer}
.col-press::before{content:"\\2726 " / "";opacity:.8}
.col-press.shut{color:var(--parchment);background:none;box-shadow:none}
.col-fold{position:absolute;z-index:44;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) 15rem;column-gap:.9rem;align-items:start;padding:.7rem .8rem .5rem;background:rgb(from var(--chart-ink) r g b / .985);border:1px solid rgb(from var(--line-tan) r g b / .45);box-shadow:0 18px 40px rgb(from var(--chart-ink) r g b / .55)}
.col-fold .col-card{position:static;width:auto;margin-top:.4rem}
.col-fold .col-key{grid-column:1 / -1;margin:.3rem 0 0;font-family:var(--font-flourish);font-style:italic;font-size:.66rem;color:var(--parchment);text-align:right}
`;
