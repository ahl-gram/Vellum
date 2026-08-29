(function () {
  const slip = document.querySelector('.slip'), tab = document.querySelector('.slip-tab'), head = document.querySelector('.slip-head');
  const narrow = () => innerWidth <= 900;
  document.querySelectorAll('.slip-fold').forEach((b) => b.addEventListener('click', () => { slip.classList.add('folded'); tab && tab.classList.add('shown'); }));
  tab && tab.addEventListener('click', () => { slip.classList.remove('folded'); tab.classList.remove('shown'); });
  head && head.addEventListener('click', (e) => { if (!narrow() || e.target.closest('button, a, input, select')) return; slip.classList.toggle('open'); });
  // the section being read inks its index row; an entry link on a phone closes the sheet
  const secs = [...document.querySelectorAll('.sheet h2[id]')];
  const rows = new Map(secs.map((h) => [h.id, document.querySelector(`.index > li[data-sec="${h.id}"]`)]));
  const ink = () => {
    const line = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--band-h')) || 7.6) * 16 + 24;
    let cur = secs[0];
    for (const h of secs) if (h.getBoundingClientRect().top <= line + 8) cur = h;
    rows.forEach((li, id) => li && li.classList.toggle('inked', id === (cur && cur.id)));
    const now = [...document.querySelectorAll('.sheet [id]')].filter((el) => el.matches('.q, .term') && el.getBoundingClientRect().top <= line + 8).pop();
    document.querySelectorAll('.index .entries li').forEach((li) => li.classList.toggle('now', !!now && li.dataset.for === now.id));
    if (!narrow() && cur && rows.get(cur.id)) { const li = rows.get(cur.id), box = slip.querySelector('.slip-body'), r = li.getBoundingClientRect(), b = box.getBoundingClientRect(); if (r.top < b.top || r.bottom > b.bottom) li.scrollIntoView({ block: 'nearest' }); }
  };
  // the slip hangs below the room's folio, like the chart rooms
  const place = () => { const tr = document.querySelector('.corner.tr'); if (!tr || narrow()) { slip.style.top = ''; slip.style.maxHeight = ''; return; }
    const top = tr.getBoundingClientRect().bottom + 16; slip.style.top = top + 'px'; slip.style.maxHeight = (innerHeight - top - 22) + 'px'; };
  addEventListener('scroll', ink, { passive: true }); addEventListener('resize', () => { place(); ink(); }); place(); ink();
  document.fonts && document.fonts.ready.then(place); addEventListener('load', place);
  document.querySelectorAll('.index a').forEach((a) => a.addEventListener('click', () => { if (narrow()) slip.classList.remove('open'); }));
  // the glossary's find box filters the index (a mockup of new scope, flagged in the reply)
  const find = document.querySelector('.find input');
  find && find.addEventListener('input', () => {
    const q = find.value.trim().toLowerCase();
    document.querySelectorAll('.index > li').forEach((li) => {
      let any = false;
      li.querySelectorAll('.terms a').forEach((a) => { const hit = q && a.textContent.toLowerCase().includes(q); a.classList.toggle('hit', !!hit); a.classList.toggle('miss', !!q && !hit); any = any || hit; });
      li.classList.toggle('empty', !!q && !any);
    });
  });
})();
