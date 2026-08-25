// Shared helpers for the homepage-hosted suites (#460): the camera oracle and real-input plumbing suite-home built across #455-#470, lifted here so the second landfall suite drives the same stage; extraction only, no check added or changed (ratified 2026-08-25 on #460).

// The camera's state measured against the same stage box and constants it uses; the landfall breakpoint reads the VIEWPORT, as the mockup's v.w < 900 does (skeptic finding 1 on PR #467: the stage box is narrower than the viewport, so keying on it fired the narrow framing up to 947px).
export const readCam = `(() => {
  const stage = document.getElementById("lf-stage");
  const sheet = document.getElementById("lf-sheet");
  if (!stage || !sheet) return null;
  const r = stage.getBoundingClientRect();
  const fit = Math.min(r.width / 1500, r.height / 1157.931) * 0.92;
  const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
  const v = document.getElementById("lf-veil");
  return { veil: !!v, lifting: !!v && v.classList.contains("lifting"),
    status: v ? (v.querySelector(".veil-status")?.textContent ?? null) : null,
    scale: m.a, fit, expected: fit * (window.innerWidth < 900 ? 1.6 : 1.72) };
})()`;

export const atLandfall = (s) => !!s && !s.veil && Math.abs(s.scale - s.expected) < 1e-3;

export const readXform = `(() => { const s = document.getElementById("lf-sheet"); return s ? getComputedStyle(s).transform : null; })()`;

export const buttonPoint = (selector) => `(() => {
  document.getElementById("lf-stage").scrollIntoView({ block: "center" });
  const b = document.querySelector('${selector}');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
})()`;

export const makeStage = (ctx) => {
  const { evaluate, send, sleep, PORT } = ctx;

  const pressKey = async (key, code, vk) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: vk });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk });
  };

  const clickAt = async (x, y) => {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  };

  const settleHome = async () => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
    for (let i = 0; i < 60; i++) {
      let up = null;
      try { up = await evaluate(`!!document.getElementById("lf-veil") || !document.querySelector(".lf-stations .lf-station")`); } catch { up = true; }
      if (!up) break;
      await pressKey("Escape", "Escape", 27);
      await sleep(150);
    }
    let cam = null;
    for (let i = 0; i < 80; i++) {
      try { cam = await evaluate(readCam); } catch {}
      if (atLandfall(cam)) break;
      await sleep(75);
    }
    return cam;
  };

  return { pressKey, clickAt, settleHome };
};
