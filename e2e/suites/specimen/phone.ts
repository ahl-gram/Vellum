import type { Specimen } from "./reads.ts";
import type { SpecimenKit } from "./kit.ts";

const px531 = (rem: number, v: number) => `${Math.round(v * rem * 100) / 100}px`;
const same = (a: string[] | null, b: string[] | null) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);
const asRgb = (hex: string) => { const h = hex.replace("#", ""); return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`; };

export async function sb7Phone({ check, shoot }: SpecimenKit, phone: Specimen | null): Promise<void> {
  check(
    "SB7 at a true 390 the slip is the bottom sheet, collapsed to its head: fixed, full width, on the floor, its body hidden; the tab and the chart folio stand down, the legend row is docked in the slip, the Glass seats above the sheet, no sideways scroll",
    // @ts-expect-error the booted Book's boxes and state are read as present; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
    !!phone && phone.slipPos === "fixed" && phone.slip.x === 0 &&
      // @ts-expect-error the booted Book's boxes and state are read as present; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
      phone.slip.w === 390 && Math.abs(
      // @ts-expect-error the booted Book's boxes and state are read as present; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
      phone.slip.bottom - 844) < 1 && phone.slipBody === "none" &&
      phone.tabDisp === "none" && phone.chartFolioDisp === "none" && phone.legendInSlip && phone.legendDocked &&
      // @ts-expect-error the booted Book's boxes and state are read as present; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
      phone.glass.bottom <
        // @ts-expect-error the booted Book's boxes and state are read as present; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
        phone.slip.y && phone.sheetH !== "" && phone.noX,
    JSON.stringify(phone && { slip: phone.slip, pos: phone.slipPos, body: phone.slipBody, tab: phone.tabDisp, chartFolio: phone.chartFolioDisp, docked: [phone.legendInSlip, phone.legendDocked], glass: phone.glass, sheetH: phone.sheetH, noX: phone.noX }),
  );
  await shoot("specimen-390.png", { x: 0, y: 0, width: 390, height: 844, scale: 1 });
}

export async function sb8Opens({ evaluate, check, shoot, sleep, read }: SpecimenKit, phone: Specimen | null): Promise<void> {
  await evaluate(`document.querySelector(".slip-handle").click()`);
  await sleep(300);
  const open = await read();
  check(
    "SB8 the handle opens the sheet: its body shows, the handle reports expanded, the docked legend row is in it, and the Glass stands down while the sheet is open (the kit's rule since the 2026-09-03 sitting, ruling 1; above the sheet it climbed into the corner's row, 35x85 at 390)",
    // @ts-expect-error the booted page and its boxes are read as present, and goto() returns null only when SB1 has already failed; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
    !!open && open.st && open.slipBody !== "none" && open.handleExpanded === "true" && open.legendDocked && open.slip.y < // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      // @ts-expect-error the booted page and its boxes are read as present, and goto() returns null only when SB1 has already failed; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
      phone.slip.y && open.glassDisp === "none" && open.glassOverFolio === null && open.noX,
    JSON.stringify(open && { body: open.slipBody, expanded: open.handleExpanded, slip: open.slip, glass: open.glass, glassOverFolio: open.glassOverFolio }), // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  );
  await shoot("specimen-390-open.png", { x: 0, y: 0, width: 390, height: 844, scale: 1 });
}

export async function sb8bNoFooting({ check, shoot, groundOf }: SpecimenKit, leanedOpen: Specimen): Promise<void> {
  // @ts-expect-error the booted Book's boxes and state are read as present; a null one throws here, outside any step, and the runner reds the whole suite as stopped early
  const slipGround = await groundOf(20, Math.round(leanedOpen.slip.y) + 120);
  check(
    "SB8b zoomed with the sheet open, the docked row carries NO footing: the row is still in the slip, the camera still leaned, and the sheet's ground reads parchment where the pool used to paint (#525; SB5c is the control that the sampler reads the pool dark where it legitimately paints)",
    !!leanedOpen && leanedOpen.st && leanedOpen.st.zoomed && leanedOpen.legendInSlip && leanedOpen.legendDocked && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      leanedOpen.slipBody !== "none" && leanedOpen.legendGroundOn === "none" && slipGround > 200,
    JSON.stringify({ zoomed: leanedOpen.st && leanedOpen.st.zoomed, docked: [leanedOpen.legendInSlip, leanedOpen.legendDocked], groundOn: leanedOpen.legendGroundOn, slipGround, slip: leanedOpen.slip }),
  );
  await shoot("specimen-390-open-leaned.png", { x: 0, y: 0, width: 390, height: 844, scale: 1 });
}

export function sb8eInsets({ check }: SpecimenKit, leanedOpen: Specimen, leaned: Specimen): void {
  // #531: the RESOLVED inset. The narrow value sat in the stylesheet for four days and inert, so a text match passes on the broken code.
  const insetNarrow = [-0.7, -0.7, -0.75, -0.7].map((v) => px531(leanedOpen.rem, v));
  const insetWide = [-0.7, -0.9, -0.8, -0.9].map((v) => px531(leaned.rem, v));
  check(
    "SB8e the folio's panel takes the NARROW insets at 390 and home's base padding at 1280 (#531): the override is carried on BOTH painting arms, since a media query adds no specificity and the rule that gives the pseudo its inset outranks a bare .corner.tr::before at every width; the value mirrors home's seed box at each width (.lf-seed, public/index.css)",
    same(leanedOpen.folioInset, insetNarrow) && same(leaned.folioInset, insetWide),
    JSON.stringify({ rem: leanedOpen.rem, at390: leanedOpen.folioInset, want390: insetNarrow, at1280: leaned.folioInset, want1280: insetWide }),
  );
}

export async function sb8cRing({ evaluate, send, check }: SpecimenKit): Promise<void> {
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  const ring = await evaluate<{ color: string; offset: string; inkDark: string; bright: string; focused: boolean } | null>(`(()=>{const b=document.querySelector(".legend.in-slip .legend-row .legend-btn");if(!b)return null;b.focus();
    const cs=getComputedStyle(b);const root=getComputedStyle(document.documentElement);
    return{color:cs.outlineColor,offset:cs.outlineOffset,inkDark:root.getPropertyValue("--ink-dark").trim(),bright:root.getPropertyValue("--parchment-bright").trim(),focused:document.activeElement===b};})()`);
  check(
    "SB8c the docked row's focus ring is the house's ink-dark, not the cream one meant for a row standing on its own footing: the ring is drawn OUTSIDE the button, onto the sheet's parchment, where cream reads about 1:1 (#525)",
    !!ring && ring.focused && ring.color === asRgb(ring.inkDark) && ring.color !== asRgb(ring.bright),
    JSON.stringify(ring),
  );
  await send("Emulation.setFocusEmulationEnabled", { enabled: false });
}

export async function sb8dSolid({ evaluate, check }: SpecimenKit): Promise<void> {
  const off = await evaluate<{ bg: string; opacity: string; faded: string } | null>(`(()=>{const b=document.querySelector(".legend.in-slip .legend-row .legend-btn:disabled");if(!b)return null;
    const cs=getComputedStyle(b);const root=getComputedStyle(document.documentElement);
    return{bg:cs.backgroundColor,opacity:cs.opacity,faded:root.getPropertyValue("--ink-faded").trim()};})()`);
  const fadedRgb = off && `rgb(${[1, 3, 5].map((i) => parseInt(off.faded.replace("#", "").slice(i - 1, i + 1), 16)).join(", ")})`;
  check(
    "SB8d the docked row's disabled press keeps a SOLID ground: on parchment the see-through wash read 1.5:1 and the press all but vanished, so docked it takes the faded ink at full opacity and reads the same whatever is behind it (#525)",
    !!off && off.bg === fadedRgb && off.opacity === "1",
    JSON.stringify({ ...off, expected: fadedRgb }),
  );
}
