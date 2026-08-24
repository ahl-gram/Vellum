import { gsap } from "gsap";

const OPEN_SECONDS = 0.55;
const OPEN_DELAY_SECONDS = 0.35;
const CLOSE_SECONDS = 0.3;
const RISE_PX = 16;
const SETTLE_PX = 10;
const TAP_SLOP_PX = 6;

export type StationVisit = { readonly id: string; readonly nx: number; readonly ny: number };

export type StationBindings = {
  readonly doc: Document;
  readonly reduced: () => boolean;
  readonly fly: (visit: StationVisit) => void;
};

const slips = (doc: Document): HTMLElement[] => [...doc.querySelectorAll<HTMLElement>(".lf-card")];

function openCard(doc: Document, id: string, reduced: boolean): void {
  for (const slip of slips(doc)) {
    if (slip.id === `lf-card-${id}`) continue;
    gsap.killTweensOf(slip);
    slip.hidden = true;
  }
  const card = doc.getElementById(`lf-card-${id}`);
  if (!(card instanceof HTMLElement)) return;
  gsap.killTweensOf(card);
  card.hidden = false;
  if (reduced) {
    gsap.set(card, { autoAlpha: 1, y: 0, rotate: 0 });
  } else {
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: RISE_PX, rotate: 0.5 },
      { autoAlpha: 1, y: 0, rotate: 0, duration: OPEN_SECONDS, ease: "power2.out", delay: OPEN_DELAY_SECONDS },
    );
  }
  card.focus({ preventScroll: true });
}

function closeCard(doc: Document, reduced: boolean): boolean {
  const open = slips(doc).find((slip) => !slip.hidden);
  if (open === undefined) return false;
  gsap.killTweensOf(open);
  if (reduced) {
    open.hidden = true;
    return true;
  }
  gsap.to(open, {
    autoAlpha: 0,
    y: SETTLE_PX,
    duration: CLOSE_SECONDS,
    ease: "power1.in",
    onComplete: () => {
      open.hidden = true;
    },
  });
  return true;
}

function anchorOf(doc: Document, id: string): StationVisit | null {
  const btn = doc.querySelector(`.lf-station[data-station="${id}"]`);
  if (!(btn instanceof HTMLElement)) return null;
  const nx = Number(btn.dataset.nx);
  const ny = Number(btn.dataset.ny);
  return Number.isFinite(nx) && Number.isFinite(ny) ? { id, nx, ny } : null;
}

export function bindStations(on: StationBindings): void {
  const { doc } = on;
  let opener: HTMLElement | null = null;

  const close = (refocus: boolean) => {
    if (!closeCard(doc, on.reduced())) return;
    if (refocus) opener?.focus({ preventScroll: true });
    opener = null;
  };

  for (const btn of doc.querySelectorAll<HTMLElement>("[data-station]")) {
    btn.addEventListener("click", () => {
      const visit = anchorOf(doc, btn.dataset.station ?? "");
      if (visit === null) return;
      opener = btn;
      on.fly(visit);
      openCard(doc, visit.id, on.reduced());
    });
  }
  for (const btn of doc.querySelectorAll(".lf-card-close")) {
    btn.addEventListener("click", () => close(true));
  }
  doc.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close(true);
  });

  const stage = doc.getElementById("lf-stage");
  let downAt: { x: number; y: number } | null = null;
  stage?.addEventListener("pointerdown", (e) => {
    downAt = { x: e.clientX, y: e.clientY };
  });
  stage?.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest("button, a, .lf-card") !== null) return;
    const moved = downAt === null ? 0 : Math.abs(e.clientX - downAt.x) + Math.abs(e.clientY - downAt.y);
    if (moved < TAP_SLOP_PX) close(false);
  });
}
