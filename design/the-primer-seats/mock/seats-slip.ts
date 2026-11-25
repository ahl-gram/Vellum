// Issue #1248 round, item 4: the step slip's dress in each seat, this round's own (not ruled), kept apart from the script that shoots so another can import it.
export const SLIP_CSS = `
.slip1248{box-sizing:border-box;background:var(--parchment-panel);border:1px solid var(--ink-dark);outline:3px double var(--line-tan);outline-offset:3px;border-radius:4px;color:var(--ink-dark);box-shadow:var(--sheet-shadow);font-family:var(--font-body);padding:.45rem .8rem .5rem}
.slip1248 .h{display:flex;align-items:center;gap:.6rem;margin:0}
.slip1248 .v{font-family:var(--font-flourish);font-style:italic;font-size:.82rem;color:var(--ink-brown)}
.slip1248 .t{font-family:var(--font-display);font-size:.8rem;letter-spacing:.08em}
.slip1248 .d{display:flex;gap:.22rem;margin-left:auto}.slip1248 .d i{width:.5rem;height:.5rem;border-radius:50%;border:1px solid var(--ink-brown);display:block}.slip1248 .d i.on{background:var(--iron-red);border-color:var(--iron-red)}.slip1248 .d i.now{background:var(--control-gold);border-color:var(--ink-dark)}
.slip1248 .a{margin:.2rem 0 0;font-weight:600;font-size:.95rem;line-height:1.35}
.slip1248 .s{margin:.1rem 0 0;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);font-size:.86rem;line-height:1.3}
.slip1248 .r{display:flex;gap:.45rem;justify-content:flex-end;margin:.3rem 0 0}
.slip1248 .r a{font-family:var(--font-display);font-size:.68rem;letter-spacing:.08em;color:var(--ink-dark);background:var(--control-cream);border:1px solid var(--ink-faded);border-radius:3px;padding:.12rem .5rem;text-decoration:none}
.slip1248 .r a.dim{background:var(--parchment-deep)}
.slip1248 .ch{font-weight:400;white-space:nowrap;font-size:.95em;padding:0 .3em;border-radius:3px;border:1px solid var(--ink-faded);background:var(--control-cream)}
.slip1248 .ch.word{border:none;background:none;padding:0;font-variant-caps:small-caps;border-bottom:1px dotted var(--ink-brown);border-radius:0}
.slip1248.head-seat{margin:.65rem 0 0;max-width:34rem;pointer-events:auto}
.slip1248.in-bill{margin:0 0 .5rem;border-radius:2px;outline-offset:2px}
.slip1248.tab{position:fixed;z-index:62;padding:.3rem .6rem;display:flex;align-items:center;gap:.5rem;font-family:var(--font-display);font-size:.72rem;letter-spacing:.08em;cursor:pointer}
.slip1248.tab::before{content:"\\261E";font-family:var(--font-serif-fallback, Georgia, serif);font-size:1.1rem;letter-spacing:0}
.slip1248.foot{position:fixed;z-index:62}
.slip1248.slim{display:grid;grid-template-columns:1fr auto;align-items:center;column-gap:.8rem;padding:.35rem .7rem .4rem}.slip1248.slim .h{grid-column:1/-1}.slip1248.slim .a{margin:.1rem 0 0;font-size:.9rem}.slip1248.slim .r{margin:0}
.slip1248.note{cursor:default;font-family:var(--font-body);font-size:.88rem;letter-spacing:0;max-width:24rem}.slip1248.note .ch{font-size:.95em}
.slip1248.masthead{margin:0 0 .4rem}
`;
