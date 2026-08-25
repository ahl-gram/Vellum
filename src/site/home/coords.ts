export const LEAGUES_PER_SHEET = 90;
const AT_HOME_LEAGUES = 3;

export type Capital = { readonly name: string; readonly nx: number; readonly ny: number };

const WINDS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

export function bearingLine(fx: number, fy: number, capital: Capital, aspect: number): string {
  const dx = (fx - capital.nx) * LEAGUES_PER_SHEET;
  const dy = (fy - capital.ny) * LEAGUES_PER_SHEET * aspect;
  const dist = Math.round(Math.hypot(dx, dy));
  if (dist < AT_HOME_LEAGUES) return `at ${capital.name}, the capital`;
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const wind = WINDS[((Math.round(angle / 22.5) % 16) + 16) % 16];
  return `${dist} leagues ${wind} of ${capital.name}`;
}
