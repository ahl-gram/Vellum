/** The one year grammar, the address's and the control's: digits making a positive whole number of at most nine places. Shared, because the Prospect page and the Chart Table's grammar must not drift apart on it. */
export function parseYear(raw: string): number | null {
  const s = raw.trim();
  return /^\d{1,9}$/.test(s) && Number(s) > 0 ? Number(s) : null;
}
