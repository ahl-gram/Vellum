(function () {
  const stage = document.getElementById('stage'), sheet = document.getElementById('sheet');
  const W = 1500, H = 1157.93, cfg = window.ROOM_CAM || {};
  const slip = document.querySelector('.slip'), tab = document.querySelector('.slip-tab');
  let s = 1, tx = 0, ty = 0;
  const narrow = () => innerWidth <= 900;
  const rect = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return r.height > 0 ? r : null; };
  // The free box is MEASURED off the chrome, never guessed: the chart clears the head cluster and the room folio above, the chart folio, the legend row, the strip and the phone sheet's handle below.
  function placeSlip() {
    if (!slip) return;
    if (narrow()) { slip.style.top = ''; slip.style.maxHeight = ''; return; }
    const tr = rect('.corner.tr'), strip = rect('.strip');
    const top = (tr ? tr.bottom : 22) + 16;
    const limit = strip ? strip.top - 12 : innerHeight - 22;
    slip.style.top = top + 'px'; slip.style.maxHeight = (limit - top) + 'px';
  }
  function free() {
    placeSlip();
    const folded = !slip || slip.classList.contains('folded') || narrow();
    const right = folded ? 0 : slip.getBoundingClientRect().width + 32 + 24;
    const tl = rect('.corner.tl'), tr = rect('.corner.tr');
    const top = Math.max(tl ? tl.bottom : 0, tr && !narrow() ? tr.bottom : 0) + (narrow() ? 8 : 14);
    let floor = innerHeight;
    for (const r of [rect('.corner.bl'), rect('.legend:not(.in-slip)'), rect('.strip'), narrow() && slip ? slip.getBoundingClientRect() : null]) if (r) floor = Math.min(floor, r.top);
    const bottom = innerHeight - floor + (narrow() ? 8 : 14);
    return { x: 0, y: top, w: innerWidth - right, h: innerHeight - top - bottom };
  }
  function apply() { sheet.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; }
  function fit() {
    const f = free();
    s = Math.min(f.w / W, f.h / H);
    if (narrow()) s = Math.max(s, innerWidth / W);
    tx = f.x + (f.w - W * s) / 2; ty = f.y + (f.h - H * s) / 2; apply();
  }
  function zoomAt(k, cx, cy) {
    const ns = Math.min(Math.max(s * k, 0.2), 4); k = ns / s;
    tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s = ns; apply();
  }
  const mid = () => [innerWidth / 2, innerHeight / 2];
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, tx, ty }; stage.setPointerCapture(e.pointerId); stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', (e) => { if (!drag) return; tx = drag.tx + (e.clientX - drag.x); ty = drag.ty + (e.clientY - drag.y); apply(); });
  const end = () => { drag = null; stage.classList.remove('dragging'); };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
  addEventListener('keydown', (e) => {
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === '+' || e.key === '=') zoomAt(1.3, ...mid());
    else if (e.key === '-') zoomAt(1 / 1.3, ...mid());
    else if (e.key === '0') fit();
  });
  document.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    const z = b.dataset.zoom; z === 'in' ? zoomAt(1.3, ...mid()) : z === 'out' ? zoomAt(1 / 1.3, ...mid()) : fit();
  }));
  document.querySelectorAll('.slip-fold').forEach((b) => b.addEventListener('click', () => {
    slip.classList.add('folded'); tab && tab.classList.add('shown'); setTimeout(layout, 340);
  }));
  tab && tab.addEventListener('click', () => { slip.classList.remove('folded'); tab.classList.remove('shown'); setTimeout(layout, 340); });
  const head = document.querySelector('.slip-head');
  head && head.addEventListener('click', (e) => { if (!narrow() || e.target.closest('button, a, input, select')) return; slip.classList.toggle('open'); layout(); });
  // the legend row centres on the chart, but never over the chart's folio
  function clearLegend() {
    const lg = document.querySelector('.legend:not(.in-slip)'), bl = rect('.corner.bl');
    if (!lg || narrow()) return;
    lg.style.left = '';
    const a = lg.getBoundingClientRect();
    if (bl && a.left < bl.right + 32) lg.style.left = (a.left + a.width / 2 + (bl.right + 32 - a.left)) + 'px';
  }
  function layout() {
    fit(); clearLegend();
    if (narrow() && slip) document.body.style.setProperty('--sheet-h', (innerHeight - slip.getBoundingClientRect().top) + 'px');
  }
  addEventListener('resize', layout);
  layout();
  document.fonts && document.fonts.ready.then(layout);
  addEventListener('load', () => { layout(); setTimeout(layout, 900); });
  window.__cam = { fit, zoomAt, layout };
})();
