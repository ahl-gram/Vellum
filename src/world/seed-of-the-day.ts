export function seedForDate(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return year * 10000 + month * 100 + day;
}

/** The day's capital line. Pure so the former-name clause is unit-reachable; the page only appends it to the DOM. */
export function capitalBlurb(
  capital: { readonly name: string; readonly formerName?: string },
  note: string,
): string {
  const former = capital.formerName ? ` Once called ${capital.formerName}.` : "";
  return `${capital.name}, the capital.${former} ${note}`;
}
