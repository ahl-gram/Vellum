// The colophon dice (#318): a seed input, the dice, and Read, mounted at the journal's
// foot. The chart number IS the seed, so any chart ever seen is already a ticket here.
// Placement is ratified (the 2026-08-08 comment on #318): the colophon mounts as a
// SIBLING of the instrument panel, never inside it: `armAges` and `clearAges` in
// `src/site/living-chart/ages.ts` drive panel.hidden through every teardown, so nested
// furniture would vanish on each read. BUILDS its DOM, owns no ids; the conductor wires the listeners.

export interface Colophon {
  readonly root: HTMLElement;
  readonly seedInput: HTMLInputElement;
  readonly diceBtn: HTMLButtonElement;
  readonly readBtn: HTMLButtonElement;
}

export function createColophon(): Colophon {
  const root = document.createElement("div");
  root.className = "rr-colophon";
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", "Read another world");

  const invite = document.createElement("span");
  invite.className = "rr-colophon-invite";
  invite.textContent = "Read another:";

  // The Print Room's counter idiom: the input rides inside its label, bounded to the uint32 seeds the engine accepts.
  const label = document.createElement("label");
  label.append(document.createTextNode("seed "));
  const seedInput = document.createElement("input");
  seedInput.type = "number";
  seedInput.min = "0";
  seedInput.max = "4294967295";
  seedInput.step = "1";
  label.appendChild(seedInput);

  const diceBtn = document.createElement("button");
  diceBtn.className = "rr-dice";
  diceBtn.type = "button";
  diceBtn.textContent = "\u{1F3B2}";
  diceBtn.setAttribute("title", "random seed");
  diceBtn.setAttribute("aria-label", "Random seed");

  const readBtn = document.createElement("button");
  readBtn.className = "rr-read";
  readBtn.type = "button";
  readBtn.textContent = "Read";

  root.append(invite, label, diceBtn, readBtn);
  return { root, seedInput, diceBtn, readBtn };
}
