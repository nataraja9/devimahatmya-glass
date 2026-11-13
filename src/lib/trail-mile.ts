// SOMNATH-AI: Trail mile labels | ZONE: 0 | PURPOSE: Name each rest stop with a walking estimate. | CONTRACT: Distances are estimates. They are not GPS, a surveyed map, or shrine admission.
export function prettyKm(km: string): string {
  if (km.endsWith("+")) return "";
  const n = Number(km);
  if (!Number.isFinite(n)) return km;
  return Number.isInteger(n) ? String(n) : String(n);
}

export function mileTitle(place: string, step: number, stepWord: string, km: string, estWord: string, pastWord: string): string {
  const mark = km.endsWith("+") ? pastWord : `${estWord} ${prettyKm(km)} km`;
  return `${place} — ${stepWord} ${step} (${mark})`;
}
