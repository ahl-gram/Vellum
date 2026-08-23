/* Atelier Map concept — the camera, the ceremony, the stations.
   Requires places-42.js (window.PLACES_42). GSAP is optional: without it every
   camera move lands instantly, so the page degrades to a working static map. */
(function () {
  "use strict";

  var SW = 1500, SH = 1157.93;
  var SITE = "https://www.vellumworlds.com/";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var stage = document.getElementById("stage");
  var sheet = document.getElementById("sheet");
  var marks = document.getElementById("marks");
  var chart = document.getElementById("chart");
  var coords = document.getElementById("coords");
  var veil = document.getElementById("veil");
  var veilStatus = document.getElementById("veil-status");
  var card = document.getElementById("card");

  var places = (window.PLACES_42 && window.PLACES_42.places) || [];
  var CAPITAL = { nx: 0.51, ny: 0.4094, name: "Laukuwelua" };

  var STATIONS = [
    { id: "explorer", nx: 0.51, ny: 0.4094, name: "The Explorer", verb: "Make one",
      where: "at Laukuwelua, the capital", href: SITE + "explorer/", arms: false, sea: false,
      prose: "Draw your own: type a seed, pick a style and climate, and the world is drafted live in your browser. Nothing is uploaded." },
    { id: "reading-room", nx: 0.5528, ny: 0.694, name: "The Reading Room", verb: "Watch one",
      where: "off Lamahai, on the southern shore", href: SITE + "reading-room/", arms: false, sea: false,
      prose: "Sit with a world and watch it happen: the founding voyage sails its survey, then the years turn and settlements rise, prosper, and fall to ruin." },
    { id: "atlas", nx: 0.3103, ny: 0.5906, name: "The Atlas of Rahai", verb: "Read one",
      where: "at Weki, a seat of the west", href: SITE + "atlas/", arms: true, sea: false,
      prose: "A bound volume: the world chart in three styles, two regional close-up surveys of the same terrain, and a gazetteer of every settlement with travelers' notes." },
    { id: "gallery", nx: 0.79, ny: 0.73, name: "A Gallery of Worlds", verb: "Browse many",
      where: "in open water, beyond the survey", href: SITE + "gallery/", arms: false, sea: true,
      prose: "Twelve worlds from twelve seeds: archipelagos, islands, and continents, each with its own name, realms, and coastline." },
  ];
  var stationSpots = {};
  STATIONS.forEach(function (s) { stationSpots[s.nx + "," + s.ny] = true; });

  /* ---- Camera ---- */

  var cam = { x: 0, y: 0, s: 1 };
  var fitScale = 1;

  function viewport() { return { w: window.innerWidth, h: window.innerHeight }; }

  function computeFit() {
    var v = viewport();
    fitScale = Math.min(v.w / SW, v.h / SH) * 0.86;
  }

  function applyCam() {
    sheet.style.transform =
      "translate(" + cam.x + "px," + cam.y + "px) scale(" + cam.s + ")";
    sheet.style.setProperty("--inv", String(1 / cam.s));
    stage.classList.toggle("close-in", cam.s >= fitScale * 1.55);
    updateCoords();
  }

  function clampCam() {
    var v = viewport();
    cam.s = Math.max(fitScale * 0.65, Math.min(7, cam.s));
    var cx = cam.x + SW * cam.s / 2, cy = cam.y + SH * cam.s / 2;
    cam.x += Math.max(0, Math.min(v.w, cx)) - cx;
    cam.y += Math.max(0, Math.min(v.h, cy)) - cy;
  }

  function camForCenter(fx, fy, s, screenX, screenY) {
    var v = viewport();
    return {
      x: (screenX === undefined ? v.w / 2 : screenX) - fx * SW * s,
      y: (screenY === undefined ? v.h / 2 : screenY) - fy * SH * s,
      s: s,
    };
  }

  function setCam(target) {
    cam.x = target.x; cam.y = target.y; cam.s = target.s;
    clampCam(); applyCam();
  }

  function flyTo(target, dur) {
    stopDrift();
    if (REDUCED || !window.gsap) { setCam(target); return; }
    window.gsap.killTweensOf(cam);
    window.gsap.to(cam, {
      x: target.x, y: target.y, s: target.s,
      duration: dur === undefined ? 1.6 : dur,
      ease: "power3.inOut",
      onUpdate: function () { clampCam(); applyCam(); },
    });
  }

  function homeView() { return camForCenter(0.5, 0.5, fitScale); }
  function landfallView() {
    var v = viewport();
    return camForCenter(0.51, 0.485, fitScale * (v.w < 900 ? 1.6 : 1.72));
  }

  /* ---- Coordinates readout ---- */

  var WINDS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  var LEAGUES_PER_SHEET = 90;

  function updateCoords() {
    if (!coords) return;
    var v = viewport();
    var fx = (v.w / 2 - cam.x) / (SW * cam.s);
    var fy = (v.h / 2 - cam.y) / (SH * cam.s);
    var dx = (fx - CAPITAL.nx) * LEAGUES_PER_SHEET;
    var dy = (fy - CAPITAL.ny) * LEAGUES_PER_SHEET * (SH / SW);
    var dist = Math.round(Math.sqrt(dx * dx + dy * dy));
    if (dist < 3) { coords.textContent = "at " + CAPITAL.name + ", the capital"; return; }
    var angle = Math.atan2(dx, -dy) * 180 / Math.PI;
    var wind = WINDS[((Math.round(angle / 22.5) % 16) + 16) % 16];
    coords.textContent = dist + " leagues " + wind + " of " + CAPITAL.name;
  }

  /* ---- Marks ---- */

  function buildMarks() {
    var frag = document.createDocumentFragment();
    places.forEach(function (p) {
      if (stationSpots[p.nx + "," + p.ny]) return;
      var el = document.createElement("div");
      el.className = "mark dot" + (p.ruined ? " ruined" : "");
      el.style.left = p.nx * 100 + "%";
      el.style.top = p.ny * 100 + "%";
      var glyph = document.createElement("span");
      glyph.className = "dot-glyph";
      var name = document.createElement("span");
      name.className = "dot-name";
      name.textContent = p.name + (p.ruined ? " (ruined)" : "");
      el.appendChild(glyph); el.appendChild(name);
      frag.appendChild(el);
    });
    STATIONS.forEach(function (s) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mark station" + (s.sea ? " at-sea" : "");
      btn.style.left = s.nx * 100 + "%";
      btn.style.top = s.ny * 100 + "%";
      btn.setAttribute("aria-label", s.name + " — " + s.verb);
      btn.innerHTML =
        '<span class="pulse" aria-hidden="true"></span>' +
        '<span class="station-glyph" aria-hidden="true"></span>' +
        '<span class="station-slip"><span class="station-name">' + s.name + "</span>" +
        '<span class="station-verb">' + s.verb + "</span></span>";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        visitStation(s);
      });
      frag.appendChild(btn);
    });
    marks.appendChild(frag);
  }

  function buildLegend() {
    var row = document.getElementById("legend-row");
    if (!row) return;
    STATIONS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "legend-btn";
      b.innerHTML = '<span class="verb">' + s.verb + '</span><span class="room">' +
        s.name.replace("The Atlas of Rahai", "The Atlas") + "</span>";
      b.addEventListener("click", function () { visitStation(s); });
      row.appendChild(b);
    });
  }

  /* ---- The station card ---- */

  function visitStation(s) {
    var v = viewport();
    var narrow = v.w <= 900;
    var target = camForCenter(
      s.nx, s.ny, Math.max(cam.s, fitScale * 2.6),
      narrow ? v.w / 2 : v.w * 0.4,
      narrow ? v.h * 0.36 : v.h / 2
    );
    flyTo(target, 1.5);
    openCard(s);
  }

  function openCard(s) {
    document.getElementById("card-verb").textContent = s.verb;
    document.getElementById("card-title").textContent = s.name;
    document.getElementById("card-where").textContent = s.where;
    document.getElementById("card-prose").textContent = s.prose;
    document.getElementById("card-arms").hidden = !s.arms;
    var enter = document.getElementById("card-enter");
    enter.href = s.href;
    card.hidden = false;
    if (window.gsap && !REDUCED) {
      window.gsap.fromTo(card,
        { autoAlpha: 0, y: 16, rotate: 0.5 },
        { autoAlpha: 1, y: 0, rotate: 0, duration: 0.55, ease: "power2.out", delay: 0.35 });
    }
  }

  function closeCard() {
    if (card.hidden) return;
    if (window.gsap && !REDUCED) {
      window.gsap.to(card, {
        autoAlpha: 0, y: 10, duration: 0.3, ease: "power1.in",
        onComplete: function () { card.hidden = true; },
      });
    } else { card.hidden = true; }
  }

  document.getElementById("card-close").addEventListener("click", closeCard);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCard();
    if (e.target && /INPUT/.test(e.target.tagName)) return;
    if (e.key === "+" || e.key === "=") zoomBy(1.35);
    if (e.key === "-") zoomBy(1 / 1.35);
    if (e.key === "0") flyTo(homeView(), 1.2);
  });

  /* ---- Pointer input: drag, wheel, pinch ---- */

  var pointers = new Map();
  var dragStart = null, pinchStart = null, moved = 0;

  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest && e.target.closest(".station")) return;
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stopDrift();
    if (window.gsap) window.gsap.killTweensOf(cam);
    moved = 0;
    if (pointers.size === 1) {
      dragStart = { px: e.clientX, py: e.clientY, cx: cam.x, cy: cam.y };
      stage.classList.add("dragging");
    } else if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinchStart = {
        d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        s: cam.s,
        mx: (pts[0].x + pts[1].x) / 2, my: (pts[0].y + pts[1].y) / 2,
        fx: 0, fy: 0,
      };
      pinchStart.fx = (pinchStart.mx - cam.x) / (SW * cam.s);
      pinchStart.fy = (pinchStart.my - cam.y) / (SH * cam.s);
      dragStart = null;
    }
  });

  stage.addEventListener("pointermove", function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchStart && pointers.size === 2) {
      var pts = Array.from(pointers.values());
      var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      var s = pinchStart.s * (d / pinchStart.d);
      setCam(camForCenter(pinchStart.fx, pinchStart.fy, s, pinchStart.mx, pinchStart.my));
      moved += 10;
    } else if (dragStart) {
      var dx = e.clientX - dragStart.px, dy = e.clientY - dragStart.py;
      moved += Math.abs(dx) + Math.abs(dy);
      cam.x = dragStart.cx + dx; cam.y = dragStart.cy + dy;
      clampCam(); applyCam();
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 0) {
      stage.classList.remove("dragging");
      if (dragStart && moved < 6) closeCard();
      dragStart = null;
    }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    stopDrift();
    var factor = Math.exp(-e.deltaY * 0.0016);
    var fx = (e.clientX - cam.x) / (SW * cam.s);
    var fy = (e.clientY - cam.y) / (SH * cam.s);
    setCam(camForCenter(fx, fy, cam.s * factor, e.clientX, e.clientY));
  }, { passive: false });

  stage.addEventListener("dblclick", function () { zoomBy(1.6); });

  function zoomBy(factor) {
    var v = viewport();
    var fx = (v.w / 2 - cam.x) / (SW * cam.s);
    var fy = (v.h / 2 - cam.y) / (SH * cam.s);
    flyTo(camForCenter(fx, fy, cam.s * factor), 0.7);
  }

  document.getElementById("zoom-in").addEventListener("click", function () { zoomBy(1.5); });
  document.getElementById("zoom-out").addEventListener("click", function () { zoomBy(1 / 1.5); });
  document.getElementById("zoom-home").addEventListener("click", function () { flyTo(homeView(), 1.4); });

  /* ---- Idle drift: the sheet breathes when left alone ---- */

  var driftTween = null, idleTimer = null;

  function stopDrift() {
    if (driftTween) { driftTween.kill(); driftTween = null; }
    if (idleTimer) { clearTimeout(idleTimer); }
    armDrift();
  }

  function armDrift() {
    if (REDUCED || !window.gsap) return;
    idleTimer = setTimeout(function () {
      driftTween = window.gsap.to(cam, {
        x: cam.x + 14, y: cam.y - 10, s: cam.s * 1.015,
        duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1,
        onUpdate: function () { clampCam(); applyCam(); },
      });
    }, 9000);
  }

  /* ---- Seed form ---- */

  document.getElementById("seed-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = document.getElementById("seed-input").value.trim();
    location.href = /^\d+$/.test(raw)
      ? SITE + "explorer/#seed=" + (Number(raw) >>> 0)
      : SITE + "explorer/";
  });

  /* ---- The ceremony ---- */

  function runCeremony() {
    var done = 0, target = 42;
    var minTime = REDUCED ? 200 : 2400;
    var began = performance.now();

    var counter = setInterval(function () {
      if (done < target) {
        done = Math.min(target, done + Math.ceil(Math.random() * 4));
        veilStatus.textContent = "Sounding · " + done + " fathom";
      }
    }, REDUCED ? 10 : 46);

    var ready = chart.decode ? chart.decode().catch(function () {}) : Promise.resolve();
    ready.then(function () {
      var wait = Math.max(0, minTime - (performance.now() - began));
      setTimeout(function () {
        clearInterval(counter);
        veilStatus.textContent = "Landfall";
        setTimeout(function () {
          veil.classList.add("lifting");
          veil.setAttribute("aria-hidden", "true");
          flyTo(landfallView(), REDUCED ? 0 : 2.4);
          armDrift();
        }, REDUCED ? 60 : 500);
      }, wait);
    });
  }

  /* ---- Boot ---- */

  window.addEventListener("resize", function () {
    computeFit(); clampCam(); applyCam();
  });

  window.__cam = cam;
  computeFit();
  buildMarks();
  buildLegend();
  setCam(camForCenter(0.5, 0.5, fitScale * 0.78));
  runCeremony();
})();
