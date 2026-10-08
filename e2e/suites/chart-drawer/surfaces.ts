import type { Payload } from "../../types.ts";
import type { DrawerKit } from "./kit.ts";
import { DRESS, SURFACES, both, drawerUp, slipTravelled } from "./reads.ts";
import type { Edge } from "./reads.ts";

// Its own one-shot payload rather than more fields on SURFACES: that one is polled by every settle in the CD9 step and read again by the CD13 and CD18 steps, and riding it measured 1.73s on this suite against a 0.7s run-to-run spread (2026-09-19, three runs each side).
const PHONE_LEAF: Payload<string[]> =
  `[".slip-head .sheet-tabs", "#table-leaf", "#leaf-table", ".legend-dock", ".slip-handle"].filter((s) => document.querySelector(s))`;

export async function cd9NeverTogether({ evaluate, send, check, settle, go }: DrawerKit, SIX: string) {
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await go(`${DRESS}&table=${SIX}`);
  const beforeOpen = await evaluate(SURFACES);
  const leftover = await evaluate(PHONE_LEAF);
  await evaluate(`document.getElementById("chart-drawer-tab").click()`);
  const withOpen = await settle(SURFACES, both(drawerUp, slipTravelled(beforeOpen)), "chart-drawer-tab-open");
  await evaluate(`document.getElementById("chart-drawer-shut").click()`);
  const afterShut = await settle(SURFACES, slipTravelled(withOpen), "chart-drawer-slip-back");
  await go(`${DRESS}&table=${SIX}`);
  const beforeFold = await evaluate(SURFACES);
  await evaluate(`document.querySelector(".slip-fold").click()`);
  await settle(SURFACES, slipTravelled(beforeFold), "chart-drawer-slip-folded");
  await evaluate(`document.getElementById("chart-drawer-tab").click()`);
  await settle(SURFACES, drawerUp, "chart-drawer-tab-open-folded");
  await evaluate(`document.getElementById("chart-drawer-shut").click()`);
  // Measured 2026-09-13: onto an ALREADY folded slip the shut press animates nothing at all, leaving display:none and an empty getAnimations() in the same frame, so there is no rest here to poll for.
  const afterShutFolded = await evaluate(SURFACES);

  check(
    "CD9 opening the Chart Table folds the Broadside and takes its tab off the edge: the two are never open together, which is what stops them fighting for the right edge, the drawer's band and the chart's foot (#543, ruled 2026-09-08)",
    !beforeOpen.folded && withOpen.open && withOpen.folded && !withOpen.tabShown,
    JSON.stringify({ before: beforeOpen, open: withOpen }),
  );
  check(
    "CD22, CD43 the phone's way into the table is gone from the page: no leaf tabs in the sheet's head, no table leaf, no legend dock and no sheet handle, which stood at 1280 as elements no rule reached while the narrow layout carried them (#547, #583), and went with it (Alex, 2026-10-06, Issue #762: the 1024 floor); the Broadside is read open in the same snapshot",
    !beforeOpen.folded && leftover.length === 0,
    JSON.stringify({ folded: beforeOpen.folded, leftover }),
  );
  check(
    "CD11 shutting the Chart Table gives the Broadside back to the reader who had it, and leaves it folded for the reader who did not",
    !afterShut.open && !afterShut.folded && !afterShutFolded.open && afterShutFolded.folded,
    JSON.stringify({ hadItOpen: afterShut, hadItFolded: afterShutFolded }),
  );
  return withOpen;
}

export async function cd12SeatsHold(
  { evaluate, check, settle, go }: DrawerKit,
  SIX: string,
  withOpen: Awaited<ReturnType<typeof cd9NeverTogether>>,
): Promise<void> {
  // Both readings are taken with the Broadside ALREADY folded, so the drawer's own fold is a no-op and only the drawer could move the furniture.
  await go(`${DRESS}&table=${SIX}`);
  const beforeSeats = await evaluate(SURFACES);
  await evaluate(`document.querySelector(".slip-fold").click()`);
  const seatsShut = (await settle(SURFACES, slipTravelled(beforeSeats), "chart-drawer-seats-folded")).seats;
  await evaluate(`document.getElementById("chart-drawer-tab").click()`);
  const seatsOpen = (await settle(SURFACES, drawerUp, "chart-drawer-seats-open")).seats;
  const names = Object.keys(seatsShut);
  check(
    "CD12 opening the drawer does not move the chart's furniture: the caption and the roads out keep the seat they had and the drawer covers them, rather than being lifted onto the sheet where they cannot be read (#543 Fault 1, ruled 2026-09-08)",
    names.length === 2 &&
      names.every((k) => Math.abs(seatsOpen[k]! - seatsShut[k]!) < 1) &&
      withOpen.lifted.length === 0,
    JSON.stringify({ shut: seatsShut, open: seatsOpen, lifted: withOpen.lifted }),
  );
}

export async function cd13TabClear(bag: DrawerKit & { edge: Record<string, Edge> }): Promise<void> {
  const { evaluate, send, check, settle, go, edge } = bag;
  // CD13 (Issue #543): folded, the camera comes home to --chrome-x where the tab already stands, and the tab's z-19 over the corner's z-10 wins the pointer, so this is a reachability check.
  const EDGE: Payload<Edge> = `(() => {
    const tab = document.getElementById("chart-drawer-tab");
    const zoom = document.querySelector(".corner.br.zoomery");
    const tb = tab.getBoundingClientRect(), zb = zoom.getBoundingClientRect();
    const overlap =
      Math.max(0, Math.min(tb.right, zb.right) - Math.max(tb.left, zb.left)) *
      Math.max(0, Math.min(tb.bottom, zb.bottom) - Math.max(tb.top, zb.top));
    const reach = (el) => {
      const b = el.getBoundingClientRect();
      let ok = 0, all = 0;
      for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) {
        const h = document.elementFromPoint(Math.round(b.x + b.width * i / 10), Math.round(b.y + b.height * j / 10));
        all++; if (h === el || el.contains(h)) ok++;
      }
      return Math.round(100 * ok / all);
    };
    return { folded: document.querySelector(".slip").classList.contains("folded"),
      tabShown: getComputedStyle(tab).display !== "none",
      overlap: +overlap.toFixed(0),
      buttons: [...zoom.querySelectorAll(".zoom-btn")].map((b) => reach(b)) };
  })()`;
  for (const [w, h] of [
    [1520, 872],
    [1280, 800],
    [1024, 800],
  ]) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await go(DRESS);
    const beforeFold = await evaluate(SURFACES);
    await evaluate(`document.querySelector(".slip-fold").click()`);
    await settle(SURFACES, slipTravelled(beforeFold), `chart-drawer-edge-fold-${w}x${h}`);
    edge[`${w}x${h}`] = await evaluate(EDGE);
  }
  const edges = Object.keys(edge);
  check(
    "CD13 with the Broadside folded the drawer's tab does not stand on the camera: the tab is z-19 over the corner's z-10, so an overlap is not untidiness, it is the + and the home press answering the tab instead (#543, Alex 2026-09-08)",
    edges.length === 3 &&
      edges.every(
        (k) =>
          edge[k]!.folded &&
          edge[k]!.tabShown &&
          edge[k]!.overlap === 0 &&
          edge[k]!.buttons.length === 3 &&
          edge[k]!.buttons.every((r) => r === 100),
      ),
    JSON.stringify(edge),
  );
}

export async function cd18RoadOn({ evaluate, check, settle }: DrawerKit): Promise<void> {
  const beforeRoad = await evaluate(SURFACES);
  await evaluate(`document.getElementById("chart-drawer-tab").click()`);
  await settle(SURFACES, both(drawerUp, slipTravelled(beforeRoad)), "chart-drawer-road-open");
  const roadOn = await evaluate<{ disabled: boolean; stamp: string | null }>(
    `(() => { const b = document.getElementById("table-road"); return { disabled: b.disabled, stamp: (document.getElementById("table-road-stamp") || {}).textContent || null }; })()`,
  );
  check(
    "CD18 with sheets on the table the road to the Portfolio turns on: #520 shipped it disabled with the stamp saying the portfolio is not yet bound, and this sub is what binds it (#521)",
    roadOn.disabled === false,
    JSON.stringify(roadOn),
  );
}
