import {
  FLIGHT_SECONDS,
  LANDFALL_HOLD_MS,
  LANDFALL_LABEL,
  MIN_VEIL_MS,
  SOUNDING_TICK_MS,
  TARGET_FATHOMS,
  nextSounding,
  soundingLabel,
} from "./ceremony.ts";

export function veilMarkup(): string {
  return `<div class="veil-inner">
    <p class="veil-wordmark">Vellum</p>
    <p class="veil-tagline">an atelier of imaginary cartography</p>
    <svg class="veil-rose" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="rose-ring" cx="60" cy="60" r="44"/>
      <circle class="rose-ring inner" cx="60" cy="60" r="34"/>
      <g class="rose-rays">
        <path d="M60 8 L60 112"/><path d="M8 60 L112 60"/>
        <path d="M24 24 L96 96"/><path d="M96 24 L24 96"/>
      </g>
      <path class="rose-needle" d="M60 18 L66 60 L60 102 L54 60 Z"/>
      <circle class="rose-pin" cx="60" cy="60" r="3.4"/>
    </svg>
    <p class="veil-status" role="status">${soundingLabel(0)}</p>
  </div>`;
}

function injectVeil(doc: Document): { root: HTMLElement; status: Element | null } {
  const root = doc.createElement("div");
  root.className = "veil";
  root.id = "lf-veil";
  root.innerHTML = veilMarkup();
  doc.body.appendChild(root);
  return { root, status: root.querySelector(".veil-status") };
}

function startSounding(status: Element | null, roll: () => number): () => void {
  let fathoms = 0;
  const ticker = setInterval(() => {
    if (fathoms < TARGET_FATHOMS && status !== null) {
      fathoms = nextSounding(fathoms, roll());
      status.textContent = soundingLabel(fathoms);
    }
  }, SOUNDING_TICK_MS);
  return () => clearInterval(ticker);
}

export type CeremonyOptions = {
  readonly doc: Document;
  readonly chart: HTMLImageElement | null;
  readonly land: (seconds: number) => void;
  readonly random?: () => number;
};

export function playCeremony(opts: CeremonyOptions): void {
  const { doc } = opts;
  const veil = injectVeil(doc);
  const stopSounding = startSounding(veil.status, opts.random ?? Math.random);
  const began = performance.now();
  let over = false;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let gateTimer: ReturnType<typeof setTimeout> | undefined;

  const unlisten = () => {
    doc.removeEventListener("pointerdown", skip, true);
    doc.removeEventListener("keydown", skip, true);
  };

  const skip = () => {
    over = true;
    stopSounding();
    clearTimeout(holdTimer);
    clearTimeout(gateTimer);
    unlisten();
    veil.root.remove();
    opts.land(0);
  };
  doc.addEventListener("pointerdown", skip, true);
  doc.addEventListener("keydown", skip, true);

  const lift = () => {
    if (over) return;
    veil.root.classList.add("lifting");
    veil.root.setAttribute("aria-hidden", "true");
    // animationend bubbles up from the rose's own keyframes, and a slow first paint can put needle-settle's end after the hold, so only veil-lift may end the veil.
    veil.root.addEventListener("animationend", (e) => {
      if (e.animationName !== "veil-lift") return;
      unlisten();
      veil.root.remove();
    });
    opts.land(FLIGHT_SECONDS);
  };

  const arrive = () => {
    if (over) return;
    stopSounding();
    if (veil.status !== null) veil.status.textContent = LANDFALL_LABEL;
    holdTimer = setTimeout(lift, LANDFALL_HOLD_MS);
  };

  const decoded = opts.chart?.decode !== undefined ? opts.chart.decode().catch(() => {}) : Promise.resolve();
  void decoded.then(() => {
    if (over) return;
    const wait = Math.max(0, MIN_VEIL_MS - (performance.now() - began));
    gateTimer = setTimeout(arrive, wait);
  });
}
