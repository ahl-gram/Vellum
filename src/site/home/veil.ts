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

export type CeremonyOptions = {
  readonly doc: Document;
  readonly chart: HTMLImageElement | null;
  /** Carries the camera to the settled landfall view; 0 seconds means instantly. */
  readonly land: (seconds: number) => void;
  readonly random?: () => number;
};

export function playCeremony(opts: CeremonyOptions): void {
  const { doc } = opts;
  const roll = opts.random ?? Math.random;

  const veil = doc.createElement("div");
  veil.className = "veil";
  veil.id = "lf-veil";
  veil.innerHTML = veilMarkup();
  doc.body.appendChild(veil);
  const status = veil.querySelector(".veil-status");

  let fathoms = 0;
  let over = false;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let gateTimer: ReturnType<typeof setTimeout> | undefined;
  const began = performance.now();

  const ticker = setInterval(() => {
    if (fathoms < TARGET_FATHOMS && status !== null) {
      fathoms = nextSounding(fathoms, roll());
      status.textContent = soundingLabel(fathoms);
    }
  }, SOUNDING_TICK_MS);

  const unlisten = () => {
    doc.removeEventListener("pointerdown", skip, true);
    doc.removeEventListener("keydown", skip, true);
  };

  const skip = () => {
    over = true;
    clearInterval(ticker);
    clearTimeout(holdTimer);
    clearTimeout(gateTimer);
    unlisten();
    veil.remove();
    opts.land(0);
  };
  doc.addEventListener("pointerdown", skip, true);
  doc.addEventListener("keydown", skip, true);

  const lift = () => {
    if (over) return;
    veil.classList.add("lifting");
    veil.setAttribute("aria-hidden", "true");
    veil.addEventListener(
      "animationend",
      () => {
        unlisten();
        veil.remove();
      },
      { once: true },
    );
    opts.land(FLIGHT_SECONDS);
  };

  const arrive = () => {
    if (over) return;
    clearInterval(ticker);
    if (status !== null) status.textContent = LANDFALL_LABEL;
    holdTimer = setTimeout(lift, LANDFALL_HOLD_MS);
  };

  // The lift waits on BOTH the chart's decode and the minimum hold, as the mockup's runCeremony does.
  const decoded = opts.chart?.decode !== undefined ? opts.chart.decode().catch(() => {}) : Promise.resolve();
  void decoded.then(() => {
    if (over) return;
    const wait = Math.max(0, MIN_VEIL_MS - (performance.now() - began));
    gateTimer = setTimeout(arrive, wait);
  });
}
