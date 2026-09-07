(function () {
  // The direction (a/b/c/d) and the table's state (three/six/empty) come off the query string, never the hash: a hash-only change is a same-document navigation and the shooter's second job would inherit the first job's body class (the sub7 README's trap).
  const q = new URLSearchParams(location.search);
  const dir = q.get('dir') || 'a', state = q.get('state') || 'three';
  document.body.classList.add('dir-' + dir, 'state-' + state);
  if (q.get('drawer') !== '0' && document.querySelector('.drawer')) document.body.classList.add('drawer-open');
  if (q.get('leaf') === 'table') document.body.classList.add('leaf-table');
  if (q.get('stage') === 'world') { document.body.classList.add('stage-world'); const v = document.getElementById('map-viewport'); v && v.classList.remove('zoomed'); }
  const count = { three: 3, six: 6, empty: 0 }[state];
  document.querySelectorAll('[data-n]').forEach((el) => el.classList.toggle('laid-in', +el.dataset.n <= count));
  const words = { three: 'three sheets laid', six: 'six sheets laid', empty: 'the table is bare' };
  document.querySelectorAll('[data-count-word]').forEach((el) => { el.textContent = words[state]; });
  document.querySelectorAll('[data-count-num]').forEach((el) => { el.textContent = String(count); });

  const stage = document.getElementById('stage'), sheet = document.getElementById('sheet'), world = document.querySelector('.stage img.world');
  const slip = document.querySelector('.slip'), tab = document.querySelector('.slip-tab');
  const cfg = window.ROOM_CAM || {}, W = cfg.w || 1500, H = cfg.h || 1157.93;
  const MX = 0.045, MY = 0.045 * 1500 / 1157.93;
  const narrow = () => innerWidth <= 900;
  const shown = (el) => el && getComputedStyle(el).display !== 'none';
  const rect = (sel) => { const el = document.querySelector(sel); if (!el || !shown(el)) return null; const r = el.getBoundingClientRect(); return r.height > 0 ? r : null; };
  let s = 1, tx = 0, ty = 0;
  // The free box is MEASURED off the chrome, never guessed (the sub7 mock's rule, room.ts's in the real build): the head cluster and the room folio above; the chart's folio, the legend row, the tray strip and the open drawer below; the rack on the left; the slip on the right; on a phone the sheet's handle below.
  function placeSlip() {
    if (!slip || !shown(slip)) return;
    if (narrow()) { slip.style.top = ''; slip.style.maxHeight = ''; return; }
    const tr = rect('.corner.tr');
    const top = (tr ? tr.bottom : 22) + 16;
    let limit = innerHeight - 22;
    for (const r of [rect('.strip.table')]) if (r) limit = Math.min(limit, r.top - 12);
    slip.style.top = top + 'px'; slip.style.maxHeight = (limit - top) + 'px';
  }
  function free() {
    placeSlip();
    const folded = !slip || !shown(slip) || slip.classList.contains('folded') || narrow();
    const right = folded ? 0 : slip.getBoundingClientRect().width + 32 + 24;
    const rack = rect('.rack');
    const left = rack && !narrow() ? rack.right + 28 : 0;
    const tl = rect('header.chrome'), tr = rect('.corner.tr');
    const top = Math.max(tl ? tl.bottom : 0, tr && !narrow() ? tr.bottom : 0) + (narrow() ? 8 : 14);
    let floor = innerHeight;
    for (const r of [rect('.corner.bl'), rect('.legend:not(.in-slip)'), rect('.strip.table'), narrow() ? rect('.rack') : null, narrow() && slip && shown(slip) ? slip.getBoundingClientRect() : null]) if (r) floor = Math.min(floor, r.top);
    const bottom = innerHeight - floor + (narrow() ? 8 : 14);
    return { x: left, y: top, w: innerWidth - right - left, h: innerHeight - top - bottom };
  }
  function apply() {
    if (!sheet) return;
    sheet.style.left = tx + 'px'; sheet.style.top = ty + 'px'; sheet.style.width = (W * s) + 'px'; sheet.style.height = (H * s) + 'px';
    // the pinned card is clamped inside the sheet the way place-overlay.ts's clampBox does: on a phone the sheet is barely taller than the card, so it hangs from the sheet's top edge
    const card = document.getElementById('place-card');
    if (card && shown(card)) { const cs = getComputedStyle(card), ny = parseFloat(cs.getPropertyValue('--pc-ny')) || 0, nx = parseFloat(cs.getPropertyValue('--pc-nx')) || 0; card.style.setProperty('--pc-dy', narrow() ? (8 - ny * H * s) + 'px' : '-48px'); card.style.setProperty('--pc-dx', Math.min(0, W * s - (nx * W * s + 10 + card.offsetWidth + 8)) + 'px'); }
    if (world && shown(world)) {
      // The world behind at the band's magnification (k = 4 at band 2), placed so its window lands under the fitted survey: the inset's plot origin is the world's plot point (u0, v0).
      const win = (stage.dataset.window || '0.375,0.28125').split(',').map(Number);
      const k = +(stage.dataset.k || 4), w = W * s, h = H * s;
      world.style.width = (k * w) + 'px'; world.style.height = (k * h) + 'px';
      world.style.left = (tx + MX * w - (MX + win[0] * (1 - 2 * MX)) * k * w) + 'px';
      world.style.top = (ty + MY * h - (MY + win[1] * (1 - 2 * MY)) * k * h) + 'px';
    }
  }
  function fit() {
    const f = free();
    s = Math.min(f.w / W, f.h / H);
    if (narrow()) s = Math.max(s, innerWidth / W);
    tx = f.x + (f.w - W * s) / 2; ty = f.y + (f.h - H * s) / 2; apply();
    const mat = document.querySelector('.mat');
    if (mat && shown(mat)) { mat.style.paddingTop = f.y + 'px'; mat.style.paddingBottom = Math.max(innerHeight - f.y - f.h, 24) + 'px'; }
  }
  function zoomAt(k, cx, cy) { const ns = Math.min(Math.max(s * k, 0.2), 4); k = ns / s; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s = ns; apply(); }
  const mid = () => [innerWidth / 2, innerHeight / 2];
  document.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { const z = b.dataset.zoom; z === 'in' ? zoomAt(1.3, ...mid()) : z === 'out' ? zoomAt(1 / 1.3, ...mid()) : fit(); }));
  document.querySelectorAll('.slip-fold').forEach((b) => b.addEventListener('click', () => { slip.classList.add('folded'); tab && tab.classList.add('shown'); setTimeout(layout, 340); }));
  tab && tab.addEventListener('click', () => { slip.classList.remove('folded'); tab.classList.remove('shown'); setTimeout(layout, 340); });
  const handle = document.querySelector('.slip-handle');
  handle && handle.addEventListener('click', () => { slip.classList.toggle('open'); handle.setAttribute('aria-expanded', slip.classList.contains('open')); layout(); });
  document.querySelectorAll('.drawer-tab, .drawer .shut').forEach((b) => b.addEventListener('click', () => { document.body.classList.toggle('drawer-open'); layout(); }));
  document.querySelectorAll('.sheet-tabs button').forEach((b) => b.addEventListener('click', () => {
    document.body.classList.toggle('leaf-table', b.dataset.leaf === 'table');
    document.querySelectorAll('.sheet-tabs button').forEach((o) => o.setAttribute('aria-selected', o === b));
    if (!slip.classList.contains('open')) { slip.classList.add('open'); handle && handle.setAttribute('aria-expanded', 'true'); }
    layout();
  }));
  // The legend row's seat is placeLegendRow's (src/site/shared/room-seats.ts): from the chart folio's text edge plus 32, capped by the viewport's chrome inset, the Glass and the open slip less 16, then centred in what is left with that width as its max, and seated BEFORE the fit (bindRoom's order).
  function clearLegend() {
    const lg = document.querySelector('.legend:not(.in-slip)');
    if (!lg || narrow()) return;
    const chromeX = (rect('header.chrome') || { left: 25.6 }).left;
    const bl = document.querySelector('.corner.bl'); let textRight = null;
    if (bl && shown(bl)) { const r = document.createRange(); for (const p of bl.querySelectorAll('p')) { if (!p.textContent) continue; r.selectNodeContents(p); const rr = r.getBoundingClientRect(); if (rr.width) textRight = Math.max(textRight ?? 0, rr.right); } }
    const left = (textRight ?? chromeX) + 32;
    const glass = document.querySelector('.corner.br.zoomery');
    const slipOpen = !!(slip && shown(slip) && !slip.classList.contains('folded'));
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const glassLeft = glass ? (slipOpen ? innerWidth - slip.getBoundingClientRect().width - 3.4 * rem - glass.offsetWidth : glass.getBoundingClientRect().left) : Infinity;
    const bounds = [innerWidth - chromeX, glassLeft, slipOpen ? slip.getBoundingClientRect().left : Infinity];
    const space = Math.max(0, Math.min(...bounds) - 16 - left);
    lg.style.transition = 'none'; lg.style.maxWidth = space + 'px'; lg.style.left = (left + space / 2) + 'px'; void lg.offsetWidth; lg.style.transition = '';
  }
  function layout() {
    const strip = rect('.strip.table');
    document.body.style.setProperty('--strip-h', strip ? strip.height + 'px' : '0px');
    if (narrow() && slip && shown(slip)) document.body.style.setProperty('--sheet-h', (innerHeight - slip.getBoundingClientRect().top) + 'px');
    clearLegend(); fit();
  }
  addEventListener('resize', layout);
  layout();
  document.fonts && document.fonts.ready.then(layout);
  addEventListener('load', () => { layout(); setTimeout(layout, 900); });
  window.__cam = { fit, zoomAt, layout };
})();
