// Shared boot/settle/navigate helpers for the Reading-Room-hosted suites (#320).
//
// suite-reading-room.mjs carries its own copies of boot() and settled() and is left
// untouched by this sub (its checks stay green exactly as written, the double-coverage
// premise). New room suites import these instead of copying them a third and fourth
// time.
//
// The room's settle is NOT the shared waitSettled: that keys on the Explorer's
// #verso-turn, which this page does not have. It is the engine's settle-signal
// contract read off the frame itself, the chart svg landed in the mount and .rf-status
// back to "" (an overlay writing there mid-draw hangs the redraw, the standing rule).

export const makeRoom = (ctx) => {
  const { evaluate, send, sleep, PORT } = ctx;

  const boot = async () => {
    for (let i = 0; i < 200; i++) {
      let ok = null;
      try { ok = await evaluate(`typeof window.__vellumReadingRoomUsesWorker === "function"`); } catch {}
      if (ok) return true;
      await sleep(75);
    }
    return false;
  };

  const settled = async () => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try { s = await evaluate(`({svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent})`); } catch {}
      if (s && s.svg && s.status === "") return true;
      await sleep(50);
    }
    return false;
  };

  // Every room check re-bootstraps through about:blank: a navigate differing only in
  // the hash is a same-document change and never re-runs the boot (the suite-zoom Z13
  // idiom the address and reading-room suites both follow).
  const goto = async (hash) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/${hash}` });
    const booted = await boot();
    return booted && (await settled());
  };

  return { boot, settled, goto };
};
